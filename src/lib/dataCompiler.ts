import type { AdminData } from "./adminTypes";
import { getSeatCoordinates } from "./getSeatCoordinates";

/**
 * The student-facing JSON format (backward compatible with existing portal).
 */
export interface CompiledStudentData {
  examMeta: {
    title: string;
    department: string;
    season: string;
  };
  students: Record<
    string,
    {
      name: string;
      exams: Array<{
        name: string;
        section: string;
        subjectCode: string;
        subject: string;
        room: string;
        seatIndex: number;
        totalStudentsInRoom: number;
        rows: number;
        cols: number;
        examDate: string;
        examTime: string;
      }>;
    }
  >;
}

/**
 * Compile admin data into student-facing students.json format.
 * Merges ALL published years into one unified dataset.
 * Unpublished years are excluded.
 *
 * If yearKey is provided, only that year is compiled (for per-year publish).
 */
export function compileStudentData(
  adminData: AdminData,
  yearKey?: string
): CompiledStudentData {
  const compiled: CompiledStudentData = {
    examMeta: { ...adminData.examMeta },
    students: {},
  };

  // Determine which years to include
  const yearsToCompile = yearKey
    ? { [yearKey]: adminData.years[yearKey] }
    : adminData.years;

  for (const [yKey, yearData] of Object.entries(yearsToCompile)) {
    // If compiling all, only include published years
    if (!yearKey && !yearData.published) continue;

    const subjectMap = new Map(yearData.subjects.map((s) => [s.id, s]));

    // Seed all students from this year
    Object.entries(yearData.students).forEach(([regNo, student]) => {
      if (!compiled.students[regNo]) {
        compiled.students[regNo] = {
          name: student.name,
          exams: [],
        };
      }
    });

    // Populate exams from room assignments
    yearData.roomAssignments.forEach((room) => {
      const subject = subjectMap.get(room.subjectId);
      if (!subject) return;

      const totalStudentsInRoom = room.assignments.length;

      room.assignments.forEach((assignment) => {
        const student = yearData.students[assignment.regNo];
        if (!student) return;

        if (!compiled.students[assignment.regNo]) {
          compiled.students[assignment.regNo] = {
            name: student.name,
            exams: [],
          };
        }

        compiled.students[assignment.regNo].exams.push({
          name: student.name,
          section: student.section,
          subjectCode: subject.code,
          subject: subject.name,
          room: room.room,
          seatIndex: assignment.seatIndex,
          totalStudentsInRoom,
          rows: room.rows,
          cols: room.cols,
          examDate: subject.date,
          examTime: subject.time,
        });
      });
    });
  }

  // Sort students by registration number
  const sortedEntries = Object.entries(compiled.students).sort(([a], [b]) =>
    a.localeCompare(b)
  );
  compiled.students = Object.fromEntries(sortedEntries);

  return compiled;
}
