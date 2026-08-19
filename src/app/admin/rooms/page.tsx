"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Eye, MapPin, Users, ChevronDown, Calendar } from "lucide-react";
import { useAdmin } from "@/providers/AdminProvider";
import { getSeatCoordinates } from "@/lib/getSeatCoordinates";



export default function RoomsPage() {
  const { data, yearLabel } = useAdmin();
  const [selectedDate, setSelectedDate] = useState<string>("ALL");
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");

  // Get unique dates
  const dates = useMemo(() => {
    const d = new Set<string>();
    data.subjects.forEach((s) => {
      if (s.date) d.add(s.date);
    });
    return [...d].sort();
  }, [data.subjects]);

  // Filter rooms by date
  const filteredRooms = useMemo(() => {
    if (selectedDate === "ALL") return data.roomAssignments;
    return data.roomAssignments.filter((r) => {
      const subject = data.subjects.find((s) => s.id === r.subjectId);
      return subject?.date === selectedDate;
    });
  }, [data.roomAssignments, data.subjects, selectedDate]);

  const selectedRoom = useMemo(
    () => data.roomAssignments.find((r) => r.id === selectedRoomId),
    [data.roomAssignments, selectedRoomId]
  );

  const selectedSubject = useMemo(
    () =>
      selectedRoom
        ? data.subjects.find((s) => s.id === selectedRoom.subjectId)
        : null,
    [selectedRoom, data.subjects]
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
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
          Room Visualizer — {yearLabel}
        </h1>
        <p className="text-sm" style={{ color: "var(--text-3)" }}>
          View complete seating layouts for any room
        </p>
      </motion.div>

      {/* Date Filter */}
      <motion.div
        className="card p-4 flex flex-wrap items-center gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Calendar size={15} style={{ color: "var(--text-3)" }} />
        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="rounded-xl px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer"
          style={{
            border: "1.5px solid var(--border)",
            background: "var(--input-bg)",
            color: "var(--text-1)",
          }}
        >
          <option value="ALL">All Dates</option>
          {dates.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <span
          className="text-xs font-semibold"
          style={{ color: "var(--text-3)" }}
        >
          {filteredRooms.length} rooms
        </span>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Room List */}
        <motion.div
          className="space-y-2 lg:col-span-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {filteredRooms.map((room) => {
            const subject = data.subjects.find(
              (s) => s.id === room.subjectId
            );
            const isSelected = room.id === selectedRoomId;
            return (
              <button
                key={room.id}
                onClick={() => setSelectedRoomId(room.id)}
                className="w-full text-left p-4 rounded-2xl transition-all"
                style={{
                  background: isSelected
                    ? "var(--pill-bg)"
                    : "var(--card-bg)",
                  color: isSelected ? "var(--pill-text)" : "var(--text-1)",
                  border: `2px solid ${isSelected ? "var(--card-border)" : "var(--border)"
                    }`,
                  boxShadow: isSelected ? "var(--card-shadow-sm)" : "none",
                }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="font-black text-sm"
                    style={{ fontFamily: "var(--font-head)" }}
                  >
                    {room.room}
                  </span>
                  <span className="text-[10px] font-bold">
                    {room.assignments.length}/{room.rows * room.cols}
                  </span>
                </div>
                <p
                  className="text-[11px] mt-0.5 truncate"
                  style={{
                    color: isSelected
                      ? "var(--pill-text)"
                      : "var(--text-3)",
                    opacity: isSelected ? 0.7 : 1,
                  }}
                >
                  {subject?.code} — {subject?.name}
                </p>
              </button>
            );
          })}

          {filteredRooms.length === 0 && (
            <div className="card p-8 text-center">
              <Eye
                size={28}
                className="mx-auto mb-2"
                style={{ color: "var(--text-3)" }}
              />
              <p
                className="text-sm font-bold"
                style={{ color: "var(--text-3)" }}
              >
                No rooms assigned yet.
              </p>
            </div>
          )}
        </motion.div>

        {/* Room Detail View */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          {selectedRoom ? (
            <div className="card overflow-hidden">
              {/* Room Header */}
              <div
                className="px-5 py-4"
                style={{ borderBottom: "2px solid var(--border)" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2
                      className="text-xl font-black"
                      style={{
                        color: "var(--text-1)",
                        fontFamily: "var(--font-head)",
                      }}
                    >
                      {selectedRoom.room}
                    </h2>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--text-3)" }}
                    >
                      {selectedSubject?.code} — {selectedSubject?.name} ·{" "}
                      {selectedSubject?.date} · {selectedSubject?.time}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-lg font-black"
                      style={{
                        color: "#10b981",
                        fontFamily: "var(--font-head)",
                      }}
                    >
                      {selectedRoom.assignments.length}/
                      {selectedRoom.rows * selectedRoom.cols}
                    </p>
                    <p
                      className="text-[10px] font-bold"
                      style={{ color: "var(--text-3)" }}
                    >
                      {selectedRoom.rows}×{selectedRoom.cols} Grid
                    </p>
                  </div>
                </div>

              </div>


              {/* Front Desk */}
              <div className="px-5 py-2 flex justify-center">
                <span className="badge-dark px-4 py-1 text-[9px] tracking-widest uppercase">
                  Invigilator Desk · Front
                </span>
              </div>

              {/* Full Room Grid */}
              <div className="p-5 overflow-x-auto">
                <div
                  className="grid gap-1.5"
                  style={{
                    gridTemplateColumns: `repeat(${selectedRoom.cols}, minmax(70px, 1fr))`,
                    minWidth: `${selectedRoom.cols * 78}px`,
                  }}
                >
                  {Array.from({ length: selectedRoom.rows }).map(
                    (_, rIdx) =>
                      Array.from({ length: selectedRoom.cols }).map(
                        (_, cIdx) => {
                          const seatIndex =
                            cIdx * selectedRoom.rows + rIdx;
                          const assignment =
                            selectedRoom.assignments.find(
                              (a) => a.seatIndex === seatIndex
                            );
                          const student = assignment
                            ? data.students[assignment.regNo]
                            : null;
                          const label = `R${rIdx + 1}C${cIdx + 1}`;

                          return (
                            <div
                              key={label}
                              className="rounded-xl p-2 text-center transition-all hover:scale-105 cursor-default relative group"
                              style={{
                                background: student
                                  ? "rgba(16,185,129,0.08)"
                                  : "var(--input-bg)",
                                border: `1.5px solid ${student
                                    ? "rgba(16,185,129,0.3)"
                                    : "var(--border)"
                                  }`,
                                minHeight: "56px",
                              }}
                            >
                              {student ? (
                                <>
                                  <div
                                    className="text-[9px] font-black truncate"
                                    style={{ color: "#10b981" }}
                                  >
                                    {student.name
                                      .split(" ")
                                      .slice(0, 2)
                                      .join(" ")}
                                  </div>
                                  <div
                                    className="text-[8px] font-bold mt-0.5"
                                    style={{
                                      color: "var(--text-3)",
                                      fontFamily: "var(--font-mono)",
                                    }}
                                  >
                                    {assignment!.regNo.slice(-5)}
                                  </div>
                                  <div
                                    className="text-[7px] font-bold mt-0.5"
                                    style={{ color: "var(--text-3)", opacity: 0.6 }}
                                  >
                                    {label}
                                  </div>

                                  {/* Hover tooltip */}
                                  <div
                                    className="absolute -top-14 left-1/2 -translate-x-1/2 px-3 py-2 rounded-xl text-[10px] font-bold z-30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                                    style={{
                                      background: "var(--pill-bg)",
                                      color: "var(--pill-text)",
                                      boxShadow: "var(--card-shadow-sm)",
                                    }}
                                  >
                                    <div>{student.name}</div>
                                    <div
                                      style={{
                                        fontFamily: "var(--font-mono)",
                                        opacity: 0.7,
                                      }}
                                    >
                                      {assignment!.regNo} · {label}
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <div
                                  className="text-[8px] flex items-center justify-center h-full"
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
                        }
                      )
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div
              className="card p-12 text-center"
              style={{ minHeight: "400px" }}
            >
              <MapPin
                size={32}
                className="mx-auto mb-3"
                style={{ color: "var(--text-3)" }}
              />
              <p
                className="text-sm font-bold"
                style={{ color: "var(--text-3)" }}
              >
                Select a room from the list to view its seating layout
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
