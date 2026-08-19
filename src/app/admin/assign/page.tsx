"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Grid3X3,
  MapPin,
  Users,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Zap,
  Tag,
  Combine,
} from "lucide-react";
import { useAdmin } from "@/providers/AdminProvider";
import { autoAssignSeats } from "@/lib/seatAllocator";
import { generateId } from "@/lib/adminTypes";
import { getSeatCoordinates } from "@/lib/getSeatCoordinates";
import type { RoomAssignment } from "@/lib/adminTypes";

function parseTime(t: string): number {
  const match = t.trim().match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  let h = parseInt(match[1]);
  const m = parseInt(match[2]);
  const isPM = match[3].toUpperCase() === "PM";
  if (h === 12 && !isPM) h = 0;
  if (h !== 12 && isPM) h += 12;
  return h + m / 60;
}

function doTimesOverlap(time1: string, time2: string): boolean {
  if (time1 === time2) return true;
  const parts1 = time1.split(/-|–|to/i).map(parseTime);
  const parts2 = time2.split(/-|–|to/i).map(parseTime);
  if (parts1.length < 2 || parts2.length < 2) return time1 === time2;
  const s1 = parts1[0], e1 = parts1[1];
  const s2 = parts2[0], e2 = parts2[1];
  return s1 < e2 && s2 < e1;
}

export default function AssignPage() {
  const { data, setData, saveData, yearLabel } = useAdmin();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [roomName, setRoomName] = useState("");
  const [roomRows, setRoomRows] = useState(6);
  const [roomCols, setRoomCols] = useState(5);

  // Currently selected subject
  const subject = useMemo(
    () => data.subjects.find((s) => s.id === selectedSubjectId),
    [data.subjects, selectedSubjectId]
  );

  // Students eligible for this subject + selected sections
  const eligibleStudents = useMemo(() => {
    if (!subject) return [];

    if (subject.type === "elective" && subject.enrolledStudents?.length > 0) {
      // Elective: only enrolled students
      return subject.enrolledStudents
        .map((e) => data.students[e.regNo])
        .filter(Boolean)
        .sort((a, b) => a.regNo.localeCompare(b.regNo));
    }

    // Core: section-based filtering
    return Object.values(data.students)
      .filter(
        (s) =>
          subject.sections.includes(s.section) &&
          (selectedSections.length === 0 ||
            selectedSections.includes(s.section))
      )
      .sort((a, b) => a.regNo.localeCompare(b.regNo));
  }, [data.students, subject, selectedSections]);

  // Already assigned students for this subject
  const assignedRegs = useMemo(() => {
    if (!subject) return new Set<string>();
    const set = new Set<string>();
    data.roomAssignments
      .filter((r) => r.subjectId === subject.id)
      .forEach((r) => r.assignments.forEach((a) => set.add(a.regNo)));
    return set;
  }, [data.roomAssignments, subject]);

  // Unassigned students
  const unassigned = useMemo(
    () => eligibleStudents.filter((s) => !assignedRegs.has(s.regNo)),
    [eligibleStudents, assignedRegs]
  );

  // Rooms for the selected subject
  const subjectRooms = useMemo(
    () =>
      subject
        ? data.roomAssignments.filter((r) => r.subjectId === subject.id)
        : [],
    [data.roomAssignments, subject]
  );

  // ── Concurrent Room Sharing State ──────────────────
  const concurrentOccupiedSeats = useMemo(() => {
    const occupied = new Set<number>();
    if (!subject || !subject.date || !subject.time) return occupied;

    const trimmedRoom = roomName.trim().toUpperCase();
    if (!trimmedRoom) return occupied;

    const concurrentSubjectIds = new Set(
      data.subjects
        .filter((s) => s.date === subject.date && doTimesOverlap(s.time, subject.time))
        .map((s) => s.id)
    );

    data.roomAssignments.forEach((r) => {
      if (
        r.room.toUpperCase() === trimmedRoom &&
        concurrentSubjectIds.has(r.subjectId)
      ) {
        r.assignments.forEach((a) => occupied.add(a.seatIndex));
      }
    });

    return occupied;
  }, [roomName, subject, data.subjects, data.roomAssignments]);

  const existingRoomConfig = useMemo(() => {
    if (!subject || !subject.date || !subject.time) return null;
    const trimmedRoom = roomName.trim().toUpperCase();
    if (!trimmedRoom) return null;

    const concurrentSubjectIds = new Set(
      data.subjects
        .filter((s) => s.date === subject.date && doTimesOverlap(s.time, subject.time))
        .map((s) => s.id)
    );

    return data.roomAssignments.find(
      (r) =>
        r.room.toUpperCase() === trimmedRoom &&
        concurrentSubjectIds.has(r.subjectId)
    );
  }, [roomName, subject, data.subjects, data.roomAssignments]);

  // ── Auto Assign ──────────────────────────────────
  const handleAutoAssign = useCallback(async () => {
    if (!subject || !roomName.trim()) return;

    // Fast-fail if trying to assign to a full shared room
    const rowsToUse = existingRoomConfig ? existingRoomConfig.rows : roomRows;
    const colsToUse = existingRoomConfig ? existingRoomConfig.cols : roomCols;
    const capacity = rowsToUse * colsToUse;

    if (concurrentOccupiedSeats.size >= capacity) {
      alert("This room is already fully booked by concurrent exams!");
      return;
    }

    const studentsToAssign = unassigned.map((s) => s.regNo);
    const { assigned } = autoAssignSeats(
      studentsToAssign,
      rowsToUse,
      colsToUse,
      concurrentOccupiedSeats
    );

    const newRoom: RoomAssignment = {
      id: generateId(),
      subjectId: subject.id,
      room: roomName.trim(),
      rows: rowsToUse,
      cols: colsToUse,
      assignments: assigned.map((a) => ({
        regNo: a.regNo,
        seatIndex: a.seatIndex,
      })),
    };

    const newData = {
      ...data,
      roomAssignments: [...data.roomAssignments, newRoom],
    };
    setData(newData);
    await saveData(newData);
    setRoomName("");
  }, [
    subject,
    roomName,
    roomRows,
    roomCols,
    unassigned,
    data,
    setData,
    saveData,
  ]);

  // ── Delete Room ──────────────────────────────────
  const deleteRoom = useCallback(
    async (roomId: string) => {
      const newRooms = data.roomAssignments.filter((r) => r.id !== roomId);
      const newData = { ...data, roomAssignments: newRooms };
      setData(newData);
      await saveData(newData);
    },
    [data, setData, saveData]
  );

  // ── Merge Rooms ──────────────────────────────────
  // Repacks all students currently assigned to this subject into the existing rooms sequentially,
  // filling them up completely before moving to the next. Any room that becomes 100% empty is deleted.
  const handleMergeRooms = useCallback(async () => {
    if (!subject) return;

    const rooms = data.roomAssignments.filter((r) => r.subjectId === subject.id);
    if (rooms.length < 2) return;

    // 1. Gather all assigned students for this subject
    const allAssignedRegs: string[] = [];
    rooms.forEach(r => r.assignments.forEach(a => allAssignedRegs.push(a.regNo)));
    allAssignedRegs.sort((a, b) => a.localeCompare(b));

    // 2. Clear out these rooms from data to prepare for repacking
    let remainingRegs = [...allAssignedRegs];
    const newRoomAssignments = data.roomAssignments.filter(r => r.subjectId !== subject.id);
    const updatedSubjectRooms: RoomAssignment[] = [];

    // 3. Repack remainingRegs into the rooms sequentially
    for (const room of rooms) {
      if (remainingRegs.length === 0) break; // All students seated

      // Calculate concurrent occupancy for this specific room
      const concurrentSubjectIds = new Set(
        data.subjects
          .filter((s) => s.id !== subject.id && s.date === subject.date && doTimesOverlap(s.time, subject.time))
          .map((s) => s.id)
      );

      const occupied = new Set<number>();
      newRoomAssignments.forEach((r) => {
        if (r.room.toUpperCase() === room.room.toUpperCase() && concurrentSubjectIds.has(r.subjectId)) {
          r.assignments.forEach((a) => occupied.add(a.seatIndex));
        }
      });

      // Auto-assign into this room
      const { assigned } = autoAssignSeats(remainingRegs, room.rows, room.cols, occupied);

      if (assigned.length > 0) {
        updatedSubjectRooms.push({
          ...room,
          assignments: assigned.map((a) => ({ regNo: a.regNo, seatIndex: a.seatIndex }))
        });

        const assignedSet = new Set(assigned.map(a => a.regNo));
        remainingRegs = remainingRegs.filter(r => !assignedSet.has(r));
      }
    }

    const newData = {
      ...data,
      roomAssignments: [...newRoomAssignments, ...updatedSubjectRooms],
    };
    setData(newData);
    await saveData(newData);
  }, [subject, data, setData, saveData]);

  const toggleSection = (sec: string) => {
    setSelectedSections((prev) =>
      prev.includes(sec) ? prev.filter((s) => s !== sec) : [...prev, sec]
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
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
          Assign Seats — {yearLabel}
        </h1>
        <p className="text-sm" style={{ color: "var(--text-3)" }}>
          Select a subject → pick sections → assign rooms with auto-seating
        </p>
      </motion.div>

      {/* Subject Selector */}
      <motion.div
        className="card p-5 space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <h2
          className="text-sm font-bold uppercase tracking-wider"
          style={{ color: "var(--text-2)", fontFamily: "var(--font-head)" }}
        >
          1. Select Subject
        </h2>
        <div className="relative">
          <select
            value={selectedSubjectId}
            onChange={(e) => {
              setSelectedSubjectId(e.target.value);
              setSelectedSections([]);
            }}
            className="w-full rounded-xl px-4 py-3 text-sm font-bold focus:outline-none appearance-none cursor-pointer"
            style={{
              border: "2px solid var(--card-border)",
              background: "var(--input-bg)",
              color: "var(--text-1)",
              fontFamily: "var(--font-head)",
            }}
          >
            <option value="">Choose a subject...</option>
            {data.subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} — {s.name} ({s.date || "No date"})
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--text-3)" }}
          />
        </div>

        {subject && (
          <>
            {/* Section filter (core only) or Elective info */}
            {subject.type === "elective" ? (
              <div
                className="p-3 rounded-xl flex items-center gap-2 mt-2"
                style={{
                  background: "rgba(139,92,246,0.06)",
                  border: "1.5px solid rgba(139,92,246,0.2)",
                }}
              >
                <Tag size={13} style={{ color: "#8b5cf6" }} />
                <span
                  className="text-xs font-bold"
                  style={{ color: "#8b5cf6" }}
                >
                  {subject.electiveCategory ? subject.electiveCategory.toUpperCase() : "ELECTIVE"} — {subject.enrolledStudents?.length || 0} students
                  enrolled via Excel
                </span>
              </div>
            ) : (
              <>
                <h2
                  className="text-sm font-bold uppercase tracking-wider pt-2"
                  style={{
                    color: "var(--text-2)",
                    fontFamily: "var(--font-head)",
                  }}
                >
                  2. Filter Sections (optional)
                </h2>
                <div className="flex flex-wrap gap-2">
                  {subject.sections.map((sec) => {
                    const count = Object.values(data.students).filter(
                      (s) => s.section === sec
                    ).length;
                    return (
                      <button
                        key={sec}
                        onClick={() => toggleSection(sec)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                        style={{
                          background: selectedSections.includes(sec)
                            ? "var(--pill-bg)"
                            : "var(--input-bg)",
                          color: selectedSections.includes(sec)
                            ? "var(--pill-text)"
                            : "var(--text-2)",
                          border: `2px solid ${selectedSections.includes(sec)
                            ? "var(--card-border)"
                            : "var(--border)"
                            }`,
                        }}
                      >
                        Sec {sec} ({count})
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* Stats */}
            <div
              className="flex flex-wrap gap-4 py-2 text-xs font-bold"
              style={{ color: "var(--text-2)" }}
            >
              <span className="flex items-center gap-1">
                <Users size={13} /> {eligibleStudents.length} eligible
              </span>
              <span
                className="flex items-center gap-1"
                style={{ color: "#10b981" }}
              >
                <CheckCircle2 size={13} /> {assignedRegs.size} assigned
              </span>
              <span
                className="flex items-center gap-1"
                style={{
                  color: unassigned.length > 0 ? "#f59e0b" : "#10b981",
                }}
              >
                <AlertTriangle size={13} /> {unassigned.length} pending
              </span>
            </div>
          </>
        )}
      </motion.div>

      {/* Room Assignment Form */}
      {subject && unassigned.length > 0 && (
        <motion.div
          className="card p-5 space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2
            className="text-sm font-bold uppercase tracking-wider"
            style={{
              color: "var(--text-2)",
              fontFamily: "var(--font-head)",
            }}
          >
            3. Assign Room
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label
                className="block text-[10px] font-bold uppercase tracking-wider mb-1"
                style={{ color: "var(--text-3)" }}
              >
                Room Name
              </label>
              <input
                placeholder="e.g. AB3-208"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none"
                style={{
                  border: "2px solid var(--card-border)",
                  background: "var(--input-bg)",
                  color: "var(--text-1)",
                  fontFamily: "var(--font-mono)",
                }}
              />
            </div>
            <div>
              <label
                className="block text-[10px] font-bold uppercase tracking-wider mb-1"
                style={{ color: "var(--text-3)" }}
              >
                Rows
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={existingRoomConfig ? existingRoomConfig.rows : roomRows}
                disabled={!!existingRoomConfig}
                onChange={(e) => setRoomRows(Number(e.target.value))}
                className={`w-full rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none ${existingRoomConfig ? "opacity-50 cursor-not-allowed" : ""}`}
                style={{
                  border: "2px solid var(--card-border)",
                  background: "var(--input-bg)",
                  color: "var(--text-1)",
                }}
              />
            </div>
            <div>
              <label
                className="block text-[10px] font-bold uppercase tracking-wider mb-1"
                style={{ color: "var(--text-3)" }}
              >
                Columns
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={existingRoomConfig ? existingRoomConfig.cols : roomCols}
                disabled={!!existingRoomConfig}
                onChange={(e) => setRoomCols(Number(e.target.value))}
                className={`w-full rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none ${existingRoomConfig ? "opacity-50 cursor-not-allowed" : ""}`}
                style={{
                  border: "2px solid var(--card-border)",
                  background: "var(--input-bg)",
                  color: "var(--text-1)",
                }}
              />
            </div>
          </div>

          {(() => {
            const currentRows = existingRoomConfig ? existingRoomConfig.rows : roomRows;
            const currentCols = existingRoomConfig ? existingRoomConfig.cols : roomCols;
            const totalCapacity = currentRows * currentCols;
            const availableSeats = Math.max(0, totalCapacity - concurrentOccupiedSeats.size);
            const toAssign = Math.min(unassigned.length, availableSeats);

            return (
              <>
                <div
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{
                    background: "var(--input-bg)",
                    border: "1.5px solid var(--border)",
                  }}
                >
                  <span className="text-xs font-semibold" style={{ color: "var(--text-2)" }}>
                    Capacity: {availableSeats}/{totalCapacity} free · Will assign {toAssign} of {unassigned.length} pending
                  </span>
                  {unassigned.length > availableSeats && (
                    <span
                      className="text-[10px] font-bold"
                      style={{ color: "#f59e0b" }}
                    >
                      {unassigned.length - availableSeats} will overflow
                    </span>
                  )}
                </div>

                {existingRoomConfig && (
                  <div className="text-[11px] font-bold flex items-center gap-1.5 mt-2" style={{ color: "#3b82f6" }}>
                    <AlertTriangle size={12} />
                    Room is shared with concurrent exams. Dimensions locked.
                  </div>
                )}

                <motion.button
                  className="pill-btn text-sm w-full py-3 mt-4"
                  style={{ background: availableSeats === 0 ? "var(--border)" : "#10b981", color: availableSeats === 0 ? "var(--text-3)" : "#fff" }}
                  whileHover={availableSeats > 0 ? { scale: 1.01 } : {}}
                  whileTap={availableSeats > 0 ? { scale: 0.98 } : {}}
                  onClick={handleAutoAssign}
                  disabled={!roomName.trim() || availableSeats === 0}
                >
                  <Zap size={16} /> {availableSeats === 0 ? "Room Full" : `Auto-Assign ${toAssign} Students to ${roomName || "Room"}`}
                </motion.button>
              </>
            );
          })()}
        </motion.div>
      )}

      {/* All Seats Assigned */}
      {subject && unassigned.length === 0 && eligibleStudents.length > 0 && (
        <motion.div
          className="card p-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ borderColor: "#10b981" }}
        >
          <CheckCircle2
            size={32}
            className="mx-auto mb-2"
            style={{ color: "#10b981" }}
          />
          <p
            className="text-sm font-black"
            style={{
              color: "#10b981",
              fontFamily: "var(--font-head)",
            }}
          >
            All {eligibleStudents.length} students are seated!
          </p>
        </motion.div>
      )}

      {/* Assigned Rooms */}
      {subjectRooms.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2
              className="text-lg font-black"
              style={{
                color: "var(--text-1)",
                fontFamily: "var(--font-head)",
              }}
            >
              Assigned Rooms ({subjectRooms.length})
            </h2>

            {subjectRooms.length > 1 && (
              <motion.button
                className="pill-btn text-xs px-4 py-2 flex items-center gap-2"
                style={{
                  background: "rgba(16,185,129,0.1)",
                  color: "#10b981",
                  border: "2px solid rgba(16,185,129,0.2)",
                  fontWeight: "bold",
                }}
                whileHover={{ scale: 1.02, background: "rgba(16,185,129,0.15)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleMergeRooms}
                title="Consolidate students into fewer rooms to eliminate empty spaces"
              >
                <Combine size={14} /> Merge Partial Rooms
              </motion.button>
            )}
          </div>

          {subjectRooms.map((room) => (
            <div key={room.id} className="card overflow-hidden">
              <div
                className="px-5 py-3 flex items-center justify-between"
                style={{ borderBottom: "2px solid var(--border)" }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="badge-dark text-xs font-bold"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {room.room}
                  </span>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "var(--text-2)" }}
                  >
                    {room.rows}×{room.cols} ·{" "}
                    {room.assignments.length}/{room.rows * room.cols}{" "}
                    seats filled
                  </span>
                </div>
                <button
                  onClick={() => deleteRoom(room.id)}
                  className="p-1.5 rounded-lg transition-all hover:opacity-70"
                  style={{
                    color: "#ef4444",
                    background: "rgba(239,68,68,0.06)",
                    border: "1px solid rgba(239,68,68,0.2)",
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Mini Grid */}
              <div className="p-4 overflow-x-auto">
                <div
                  className="grid gap-1"
                  style={{
                    gridTemplateColumns: `repeat(${room.cols}, minmax(50px, 1fr))`,
                    minWidth: `${room.cols * 58}px`,
                  }}
                >
                  {Array.from({ length: room.rows }).map((_, rIdx) =>
                    Array.from({ length: room.cols }).map((_, cIdx) => {
                      const seatIndex = cIdx * room.rows + rIdx;
                      const assignment = room.assignments.find(
                        (a) => a.seatIndex === seatIndex
                      );
                      const student = assignment
                        ? data.students[assignment.regNo]
                        : null;
                      const label = `R${rIdx + 1}C${cIdx + 1}`;

                      return (
                        <div
                          key={label}
                          className="rounded-lg p-1.5 text-center transition-all"
                          style={{
                            background: student
                              ? "rgba(16,185,129,0.08)"
                              : "var(--input-bg)",
                            border: `1.5px solid ${student
                              ? "rgba(16,185,129,0.3)"
                              : "var(--border)"
                              }`,
                            minHeight: "40px",
                          }}
                          title={
                            student
                              ? `${student.name}\n${assignment!.regNo}\n${label}`
                              : label
                          }
                        >
                          {student ? (
                            <>
                              <div
                                className="text-[7px] font-bold truncate"
                                style={{ color: "#10b981" }}
                              >
                                {student.name
                                  .split(" ")
                                  .slice(0, 2)
                                  .map((w) => w[0])
                                  .join("")}
                              </div>
                              <div
                                className="text-[6px] truncate"
                                style={{
                                  color: "var(--text-3)",
                                  fontFamily: "var(--font-mono)",
                                }}
                              >
                                {assignment!.regNo.slice(-5)}
                              </div>
                            </>
                          ) : (
                            <div
                              className="text-[7px]"
                              style={{
                                color: "var(--text-3)",
                                fontFamily: "var(--font-mono)",
                              }}
                            >
                              {label}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* No Subject Selected */}
      {!subject && (
        <motion.div
          className="card p-10 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Grid3X3
            size={32}
            className="mx-auto mb-3"
            style={{ color: "var(--text-3)" }}
          />
          <p
            className="text-sm font-bold"
            style={{ color: "var(--text-3)" }}
          >
            {data.subjects.length === 0
              ? "Add subjects in the Exams tab first."
              : "Select a subject above to start assigning rooms."}
          </p>
        </motion.div>
      )}
    </div>
  );
}
