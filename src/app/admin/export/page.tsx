"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FileDown,
  Download,
  Printer,
  ChevronDown,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { useAdmin } from "@/providers/AdminProvider";
import { getSeatCoordinates } from "@/lib/getSeatCoordinates";

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

      // Build HTML for printing
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
          const student = assignment
            ? data.students[assignment.regNo]
            : null;
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

      const html = `
        <!DOCTYPE html>
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
          <div class="footer">
            Generated on ${new Date().toLocaleString()} · MUJ AIML Seating Portal
          </div>
        </body>
        </html>
      `;

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
    [data]
  );

  // ── Download full students.json ──────────────────
  const downloadJSON = useCallback(() => {
    // Import and compile
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
          Export & Download — {yearLabel}
        </h1>
        <p className="text-sm" style={{ color: "var(--text-3)" }}>
          Download seating plans as printable PDFs or export raw data
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

      {/* Room PDFs by Subject */}
      {[...roomsBySubject.entries()].map(([subId, { subject, rooms }]) => (
        <motion.div
          key={subId}
          className="card overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
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
            <span className="text-xs font-bold" style={{ opacity: 0.7 }}>
              {subject.date} · {rooms.length} rooms
            </span>
          </div>
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
                    {room.rows}×{room.cols} · {room.assignments.length}{" "}
                    students
                  </span>
                </div>
                <motion.button
                  className="pill-btn text-[11px] px-3 py-1.5"
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
          <p
            className="text-sm font-bold"
            style={{ color: "var(--text-3)" }}
          >
            No rooms assigned yet. Assign seats first in the Assign Seats tab.
          </p>
        </motion.div>
      )}
    </div>
  );
}
