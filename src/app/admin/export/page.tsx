"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FileDown,
  Download,
  Printer,
} from "lucide-react";
import { useAdmin } from "@/providers/AdminProvider";

export default function ExportPage() {
  const { data, fullData, examMeta, yearLabel } = useAdmin();
  const [generating, setGenerating] = useState<string | null>(null);

  // ── Generate Room PDF (client-side using print) ──
  const generateRoomPDF = useCallback(
    (roomId: string) => {
      const room = data.roomAssignments.find((r) => r.id === roomId);
      if (!room) return;
      const subject = data.subjects.find((s) => s.id === room.subjectId);
      if (!subject) return;

      setGenerating(roomId);

      const rows = Array.from({ length: room.rows });
      const cols = Array.from({ length: room.cols });

      let tableHTML = "";
      rows.forEach((_, rIdx) => {
        tableHTML += "<tr>";
        cols.forEach((_, cIdx) => {
          const seatIndex = cIdx * room.rows + rIdx;
          const assignment = room.assignments.find(
            (a) => a.seatIndex === seatIndex
          );
          const student = assignment ? data.students[assignment.regNo] : null;
          const label = `R${rIdx + 1}C${cIdx + 1}`;

          if (student) {
            tableHTML += `<td style="border:1.5px solid #333;padding:6px 4px;text-align:center;font-size:9px;background:#f0fdf4;">
              <div style="font-weight:800;font-size:10px;">${assignment!.regNo}</div>
              <div style="font-size:8px;color:#666;margin-top:2px;">${student.name}</div>
              <div style="font-size:7px;color:#999;margin-top:1px;">${label} · Sec ${student.section}</div>
            </td>`;
          } else {
            tableHTML += `<td style="border:1px solid #ddd;padding:6px;text-align:center;font-size:8px;color:#ccc;">${label}</td>`;
          }
        });
        tableHTML += "</tr>";
      });

      const html = `<!DOCTYPE html>
<html>
<head>
  <title>Seating Plan - ${room.room} - ${subject.name}</title>
  <style>
    @page { size: landscape; margin: 15mm; }
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; }
    .header { text-align: center; margin-bottom: 20px; }
    .header h1 { font-size: 18px; margin: 0; }
    .header h2 { font-size: 14px; margin: 4px 0; color: #666; }
    .meta { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 11px; }
    .meta span { font-weight: 600; }
    table { border-collapse: collapse; width: 100%; }
    .front-desk { text-align: center; background: #1a1a1a; color: white; padding: 6px; font-size: 10px; font-weight: bold; letter-spacing: 2px; margin-bottom: 10px; }
    .footer { text-align: center; margin-top: 15px; font-size: 9px; color: #999; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${examMeta.title}</h1>
    <h2>${examMeta.department} · ${examMeta.season}</h2>
  </div>
  <div class="meta">
    <span>Subject: ${subject.code} — ${subject.name}</span>
    <span>Room: ${room.room} (${room.rows}×${room.cols})</span>
    <span>Date: ${subject.date} | ${subject.time}</span>
    <span>Students: ${room.assignments.length}</span>
  </div>
  <div class="front-desk">INVIGILATOR DESK · FRONT</div>
  <table>${tableHTML}</table>
  <div class="footer">Generated on ${new Date().toLocaleString()} · MUJ AIML Seating Portal</div>
</body>
</html>`;

      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.print();
          setGenerating(null);
        };
      } else {
        setGenerating(null);
      }
    },
    [data, examMeta]
  );

  // ── Generate Attendance Sheet (per subject, all rooms combined) ──
  const generateAttendanceSheet = useCallback(
    (subjectId: string) => {
      const subject = data.subjects.find((s) => s.id === subjectId);
      if (!subject) return;

      setGenerating(`att-${subjectId}`);

      const subjectRooms = data.roomAssignments.filter(
        (r) => r.subjectId === subjectId
      );

      interface AttendanceRow {
        sNo: number;
        regNo: string;
        name: string;
        section: string;
        peSection: string;
        room: string;
        seat: string;
      }

      const attendanceRows: AttendanceRow[] = [];
      let serial = 1;

      // Sort rooms alphabetically for consistent ordering
      const sortedRooms = [...subjectRooms].sort((a, b) =>
        a.room.localeCompare(b.room)
      );

      for (const room of sortedRooms) {
        const sortedAssignments = [...room.assignments].sort(
          (a, b) => a.seatIndex - b.seatIndex
        );
        for (const assignment of sortedAssignments) {
          const student = data.students[assignment.regNo];
          if (!student) continue;

          // Seat label using col-major layout
          const col = Math.floor(assignment.seatIndex / room.rows) + 1;
          const row = (assignment.seatIndex % room.rows) + 1;
          const seatLabel = `R${row}C${col}`;

          let peSection = "";
          if (subject.type === "elective") {
            const enroll = subject.enrolledStudents.find(
              (e) => e.regNo === assignment.regNo
            );
            peSection = enroll?.peSection ?? "";
          }

          attendanceRows.push({
            sNo: serial++,
            regNo: assignment.regNo,
            name: student.name,
            section: student.section,
            peSection,
            room: room.room,
            seat: seatLabel,
          });
        }
      }

      const totalStudents = attendanceRows.length;

      const rowsHTML = attendanceRows
        .map(
          (r) => `<tr>
            <td style="text-align:center;">${r.sNo}</td>
            <td style="font-family:monospace;font-weight:700;">${r.regNo}</td>
            <td style="font-weight:600;">${r.name}</td>
            <td style="text-align:center;">${r.section}${r.peSection ? ` (${r.peSection})` : ""}</td>
            <td style="text-align:center;font-family:monospace;">${r.room}</td>
            <td style="text-align:center;font-family:monospace;">${r.seat}</td>
            <td style="min-width:90px;"></td>
          </tr>`
        )
        .join("");

      const roomSummaryHTML = sortedRooms
        .map(
          (r) =>
            `<span style="display:inline-block;margin-right:16px;"><b>${r.room}</b>: ${r.assignments.length} students</span>`
        )
        .join("");

      const typeLabel =
        subject.type === "elective"
          ? `Elective — ${subject.electiveCategory || ""}`
          : `Core (Sections: ${subject.sections.join(", ")})`;

      const html = `<!DOCTYPE html>
<html>
<head>
  <title>Attendance Sheet — ${subject.code} ${subject.name}</title>
  <style>
    @page { size: A4 portrait; margin: 14mm 12mm; }
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; color: #111; font-size: 10px; }

    .header { text-align: center; border-bottom: 2.5px solid #111; padding-bottom: 10px; margin-bottom: 10px; }
    .header .institute { font-size: 14px; font-weight: 900; letter-spacing: 0.5px; text-transform: uppercase; }
    .header .dept { font-size: 11px; font-weight: 700; color: #444; margin-top: 2px; }
    .header .exam-title { font-size: 13px; font-weight: 900; margin: 6px 0 0; text-transform: uppercase; letter-spacing: 1px; }
    .header .sheet-label {
      display: inline-block;
      background: #1a1a1a;
      color: #fff;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 2px;
      padding: 2px 12px;
      border-radius: 2px;
      margin-top: 6px;
      text-transform: uppercase;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px 20px;
      margin-bottom: 8px;
      background: #f5f5f5;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 8px 12px;
      font-size: 10px;
    }
    .meta-grid .item { display: flex; gap: 6px; align-items: baseline; }
    .meta-grid .lbl { font-weight: 700; color: #555; min-width: 75px; flex-shrink: 0; }
    .meta-grid .val { font-weight: 600; }

    .rooms-summary { font-size: 9.5px; margin-bottom: 8px; color: #444; }

    table { border-collapse: collapse; width: 100%; font-size: 9.5px; }
    thead tr { background: #1a1a1a; color: #fff; }
    thead th {
      padding: 5px 6px;
      text-align: left;
      font-weight: 700;
      font-size: 9px;
      letter-spacing: 0.4px;
      text-transform: uppercase;
    }
    tbody tr:nth-child(even) { background: #f8f8f8; }
    tbody td {
      padding: 5px 6px;
      border-bottom: 1px solid #e0e0e0;
      border-right: 1px solid #e0e0e0;
      vertical-align: middle;
    }
    tbody td:first-child { border-left: 1px solid #e0e0e0; }

    .sign-blocks {
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
      gap: 20px;
    }
    .sign-block {
      flex: 1;
      text-align: center;
      border-top: 1.5px solid #333;
      padding-top: 4px;
      font-size: 9px;
      font-weight: 700;
      color: #333;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .footer {
      margin-top: 12px;
      display: flex;
      justify-content: space-between;
      font-size: 8.5px;
      color: #888;
      border-top: 1px solid #ddd;
      padding-top: 5px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="institute">Manipal University Jaipur</div>
    <div class="dept">${examMeta.department}</div>
    <div class="exam-title">${examMeta.season} — ${examMeta.title}</div>
    <div class="sheet-label">Attendance Sheet</div>
  </div>

  <div class="meta-grid">
    <div class="item"><span class="lbl">Subject:</span><span class="val">${subject.name}</span></div>
    <div class="item"><span class="lbl">Code:</span><span class="val">${subject.code}</span></div>
    <div class="item"><span class="lbl">Date:</span><span class="val">${subject.date || "—"}</span></div>
    <div class="item"><span class="lbl">Time:</span><span class="val">${subject.time || "—"}</span></div>
    <div class="item"><span class="lbl">Type:</span><span class="val">${typeLabel}</span></div>
    <div class="item"><span class="lbl">Total Students:</span><span class="val" style="font-weight:900;font-size:12px;">${totalStudents}</span></div>
  </div>

  <div class="rooms-summary"><b>Rooms:</b> ${roomSummaryHTML}</div>

  <table>
    <thead>
      <tr>
        <th style="width:28px; text-align:center;">#</th>
        <th style="width:128px;">Reg. No.</th>
        <th>Student Name</th>
        <th style="width:58px; text-align:center;">Section</th>
        <th style="width:68px; text-align:center;">Room</th>
        <th style="width:48px; text-align:center;">Seat</th>
        <th style="width:96px; text-align:center;">Signature</th>
      </tr>
    </thead>
    <tbody>${rowsHTML}</tbody>
  </table>

  <div class="sign-blocks">
    <div class="sign-block">Invigilator 1</div>
    <div class="sign-block">Invigilator 2</div>
    <div class="sign-block">Room Coordinator</div>
    <div class="sign-block">Exam Controller</div>
  </div>

  <div class="footer">
    <span>Generated: ${new Date().toLocaleString()} · MUJ AIML Seating Portal</span>
    <span>Total Students: ${totalStudents}</span>
  </div>
</body>
</html>`;

      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.print();
          setGenerating(null);
        };
      } else {
        setGenerating(null);
      }
    },
    [data, examMeta]
  );

  // ── Download full students.json ──────────────────
  const downloadJSON = useCallback(() => {
    import("@/lib/dataCompiler").then(({ compileStudentData }) => {
      const compiled = compileStudentData(fullData);
      const blob = new Blob([JSON.stringify(compiled, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "students.json";
      a.click();
      URL.revokeObjectURL(url);
    });
  }, [fullData]);

  // Group rooms by subject
  const roomsBySubject = useMemo(() => {
    const map = new Map<
      string,
      { subject: (typeof data.subjects)[0]; rooms: typeof data.roomAssignments }
    >();
    data.subjects.forEach((s) => {
      const rooms = data.roomAssignments.filter((r) => r.subjectId === s.id);
      if (rooms.length > 0) {
        map.set(s.id, { subject: s, rooms });
      }
    });
    return map;
  }, [data.subjects, data.roomAssignments]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1
          className="text-2xl font-black tracking-tight"
          style={{
            color: "var(--text-1)",
            fontFamily: "var(--font-head, sans-serif)",
          }}
        >
          Export &amp; Download — {yearLabel}
        </h1>
        <p className="text-sm" style={{ color: "var(--text-3)" }}>
          Download seating plans, room PDFs, or attendance sheets
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        className="card p-5 flex flex-wrap gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <motion.button
          className="pill-btn text-xs px-5 py-2.5"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={downloadJSON}
        >
          <Download size={14} /> Download students.json
        </motion.button>
      </motion.div>

      {/* Per-subject cards */}
      {[...roomsBySubject.entries()].map(([subId, { subject, rooms }]) => (
        <motion.div
          key={subId}
          className="card overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Subject Header */}
          <div
            className="px-5 py-3 flex items-center justify-between"
            style={{
              background: "var(--pill-bg)",
              color: "var(--pill-text)",
            }}
          >
            <div>
              <span className="text-xs font-bold" style={{ opacity: 0.7 }}>
                {subject.code}
              </span>
              <h3
                className="text-sm font-black"
                style={{ fontFamily: "var(--font-head)" }}
              >
                {subject.name}
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold" style={{ opacity: 0.7 }}>
                {subject.date} · {rooms.length} room{rooms.length !== 1 ? "s" : ""}
              </span>

              {/* Attendance Sheet button */}
              <motion.button
                className="pill-btn text-[11px] px-3 py-1.5 flex items-center gap-1.5"
                style={{
                  background: "rgba(16,185,129,0.12)",
                  color: "#10b981",
                  border: "2px solid rgba(16,185,129,0.3)",
                  fontWeight: 700,
                }}
                whileHover={{ scale: 1.05, background: "rgba(16,185,129,0.2)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => generateAttendanceSheet(subId)}
                disabled={generating === `att-${subId}`}
                title="Print attendance sheet: all students across all rooms for this subject"
              >
                <FileDown size={12} />
                {generating === `att-${subId}` ? "Opening..." : "Attendance Sheet"}
              </motion.button>
            </div>
          </div>

          {/* Per-room rows */}
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {rooms.map((room) => (
              <div
                key={room.id}
                className="px-5 py-3 flex items-center justify-between"
              >
                <div>
                  <span
                    className="font-black text-sm"
                    style={{
                      color: "var(--text-1)",
                      fontFamily: "var(--font-head)",
                    }}
                  >
                    {room.room}
                  </span>
                  <span
                    className="text-[11px] ml-2"
                    style={{ color: "var(--text-3)" }}
                  >
                    {room.rows}×{room.cols} · {room.assignments.length} students
                  </span>
                </div>
                <motion.button
                  className="pill-btn text-[11px] px-3 py-1.5 flex items-center gap-1.5"
                  style={{
                    background: "var(--card-bg)",
                    color: "var(--text-1)",
                    border: "2px solid var(--card-border)",
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => generateRoomPDF(room.id)}
                  disabled={generating === room.id}
                >
                  <Printer size={12} />
                  {generating === room.id ? "Opening..." : "Print / PDF"}
                </motion.button>
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {roomsBySubject.size === 0 && (
        <motion.div
          className="card p-10 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <FileDown
            size={32}
            className="mx-auto mb-3"
            style={{ color: "var(--text-3)" }}
          />
          <p className="text-sm font-bold" style={{ color: "var(--text-3)" }}>
            No rooms assigned yet. Assign seats first in the Assign Seats tab.
          </p>
        </motion.div>
      )}
    </div>
  );
}
