import type { YearScopedData, Subject, RoomAssignment } from "./adminTypes";

export interface Conflict {
  type: "SCHEDULE_CLASH" | "SEAT_COLLISION";
  regNo: string;
  studentName: string;
  details: string;
  subjectA: string;
  subjectB?: string;
  room: string;
  roomB?: string;
}

/**
 * Detect all conflicts in year-scoped admin data.
 *
 * 1. SCHEDULE_CLASH: Same student assigned to two different exams at the same date + time
 * 2. SEAT_COLLISION: Two students assigned to the same seat in the same room
 */
export function detectConflicts(data: YearScopedData): Conflict[] {
  const conflicts: Conflict[] = [];

  const subjectMap = new Map<string, Subject>();
  data.subjects.forEach((s) => subjectMap.set(s.id, s));

  // ── Schedule Clashes ─────────────────────────────
  const studentSchedule = new Map<string, { subjectId: string; roomId: string }[]>();

  data.roomAssignments.forEach((room) => {
    room.assignments.forEach((a) => {
      if (!studentSchedule.has(a.regNo)) {
        studentSchedule.set(a.regNo, []);
      }
      studentSchedule.get(a.regNo)!.push({
        subjectId: room.subjectId,
        roomId: room.id,
      });
    });
  });

  studentSchedule.forEach((entries, regNo) => {
    const slotMap = new Map<string, { subjectId: string; roomId: string }[]>();

    entries.forEach((e) => {
      const subject = subjectMap.get(e.subjectId);
      if (!subject) return;
      const slotKey = `${subject.date}|${subject.time}`;
      if (!slotMap.has(slotKey)) slotMap.set(slotKey, []);
      slotMap.get(slotKey)!.push(e);
    });

    slotMap.forEach((slotEntries) => {
      if (slotEntries.length > 1) {
        const subA = subjectMap.get(slotEntries[0].subjectId);
        const subB = subjectMap.get(slotEntries[1].subjectId);
        const student = data.students[regNo];
        const roomA = data.roomAssignments.find((r) => r.id === slotEntries[0].roomId);
        const roomB = data.roomAssignments.find((r) => r.id === slotEntries[1].roomId);

        conflicts.push({
          type: "SCHEDULE_CLASH",
          regNo,
          studentName: student?.name || "Unknown",
          details: `Assigned to "${subA?.name}" and "${subB?.name}" at the same date/time (${subA?.date} ${subA?.time})`,
          subjectA: subA?.name || "Unknown",
          subjectB: subB?.name || "Unknown",
          room: roomA?.room || "Unknown",
          roomB: roomB?.room || "Unknown",
        });
      }
    });
  });

  // ── Seat Collisions ──────────────────────────────
  data.roomAssignments.forEach((room) => {
    const seatOccupants = new Map<number, string[]>();

    room.assignments.forEach((a) => {
      if (!seatOccupants.has(a.seatIndex)) {
        seatOccupants.set(a.seatIndex, []);
      }
      seatOccupants.get(a.seatIndex)!.push(a.regNo);
    });

    seatOccupants.forEach((regs, seatIndex) => {
      if (regs.length > 1) {
        const subject = subjectMap.get(room.subjectId);
        conflicts.push({
          type: "SEAT_COLLISION",
          regNo: regs.join(", "),
          studentName: regs.map((r) => data.students[r]?.name || "Unknown").join(" & "),
          details: `Seat ${seatIndex} in room ${room.room} has ${regs.length} students assigned`,
          subjectA: subject?.name || "Unknown",
          room: room.room,
        });
      }
    });
  });

  return conflicts;
}
