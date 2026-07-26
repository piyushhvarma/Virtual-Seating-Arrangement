/**
 * Admin Data Model — Year-Scoped Architecture
 *
 * Data is organized per academic year (2nd, 3rd, 4th).
 * Each year is an independent workspace with its own students, subjects,
 * room assignments, and publish toggle.
 *
 * Faculty workflow:
 *   1. Select "3rd Year" → upload Excel → add subjects → assign rooms → publish
 *   2. Switch to "2nd Year" → repeat
 *   3. Each year goes live independently
 */

// ── Student Master Record ──────────────────────────
export interface MasterStudent {
  regNo: string;
  name: string;
  section: string; // Core section (e.g. "A")
  year: number;
}

// ── Elective Enrollment ────────────────────────────
// Ties a student to a specific PE section for ONE particular elective subject.
// A student can appear in PE-A for subject X and PE-B for subject Y.
export interface ElectiveEnrollment {
  regNo: string;
  peSection: string; // e.g. "A", "B1", "PE-A" — section for THIS subject only
}


// ── Subject ────────────────────────────────────────
export type SubjectType = "core" | "elective";

export interface Subject {
  id: string;
  code: string;          // e.g. "AIM3201"
  name: string;          // e.g. "Deep Learning"
  date: string;          // e.g. "21-04-2027"
  time: string;          // e.g. "1:30 PM – 4:30 PM"
  type: SubjectType;     // "core" = section-based, "elective" = student-list-based
  electiveCategory?: string; // e.g. "Program Elective 1", "Open Elective 1"
  sections: string[];    // used when type = "core" (e.g. ["A", "B", "C"])
  enrolledStudents: ElectiveEnrollment[]; // used when type = "elective" (each entry has regNo + peSection)
}

// ── Room Assignment ────────────────────────────────
export interface SeatAssignment {
  regNo: string;
  seatIndex: number;
}

export interface RoomAssignment {
  id: string;
  subjectId: string;
  room: string;
  rows: number;
  cols: number;
  assignments: SeatAssignment[];
}

// ── Exam Metadata ──────────────────────────────────
export interface ExamMeta {
  title: string;
  department: string;
  season: string;
}

// ── Per-Year Data ──────────────────────────────────
export interface YearData {
  label: string;              // "2nd Year", "3rd Year", "4th Year"
  published: boolean;
  students: Record<string, MasterStudent>;
  subjects: Subject[];
  roomAssignments: RoomAssignment[];
  lastModified: string;
}

// ── Top-Level Admin Data ───────────────────────────
export interface AdminData {
  version: number;
  examMeta: ExamMeta;
  years: Record<string, YearData>;  // keyed by "2", "3", "4"
  lastModified: string;
}

/**
 * The shape that tab pages see — scoped to a single year.
 * This keeps all existing tab pages working without changes.
 */
export interface YearScopedData {
  examMeta: ExamMeta;
  published: boolean;
  students: Record<string, MasterStudent>;
  subjects: Subject[];
  roomAssignments: RoomAssignment[];
  lastModified: string;
}

// ── Constants ──────────────────────────────────────
export const AVAILABLE_YEARS = [
  { key: "2", label: "2nd Year" },
  { key: "3", label: "3rd Year" },
  { key: "4", label: "4th Year" },
] as const;

// ── Factory ────────────────────────────────────────
function createEmptyYearData(label: string): YearData {
  return {
    label,
    published: false,
    students: {},
    subjects: [],
    roomAssignments: [],
    lastModified: new Date().toISOString(),
  };
}

export function createEmptyAdminData(): AdminData {
  return {
    version: 2,
    examMeta: {
      title: "ETE – B.Tech Exams",
      department: "AIML Department",
      season: "End-Term Examination",
    },
    years: {
      "2": createEmptyYearData("2nd Year"),
      "3": createEmptyYearData("3rd Year"),
      "4": createEmptyYearData("4th Year"),
    },
    lastModified: new Date().toISOString(),
  };
}

/**
 * Migrate v1 (flat) data to v2 (year-scoped).
 * All existing data goes into "3rd Year" since the portal was built for 3rd year.
 */
export function migrateV1toV2(v1: any): AdminData {
  const base = createEmptyAdminData();
  base.examMeta = v1.examMeta || base.examMeta;

  // Move all v1 data into 3rd year bucket
  if (v1.students || v1.subjects || v1.roomAssignments) {
    base.years["3"] = {
      label: "3rd Year",
      published: v1.published || false,
      students: v1.students || {},
      subjects: v1.subjects || [],
      roomAssignments: v1.roomAssignments || [],
      lastModified: v1.lastModified || new Date().toISOString(),
    };
  }

  return base;
}

// ── Helpers ────────────────────────────────────────

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/**
 * Extract year from MUJ registration number.
 * "23FE10CAI00001" → batch year 2023 → if current year is 2027, year = 4
 */
export function getYearFromRegNo(regNo: string): number {
  const batchYear = parseInt(regNo.slice(0, 2), 10) + 2000;
  const now = new Date().getFullYear();
  const academicStart = new Date().getMonth() >= 6 ? now : now - 1;
  return Math.max(1, Math.min(4, academicStart - batchYear + 1));
}

export function getUniqueSections(students: Record<string, MasterStudent>): string[] {
  const sections = new Set<string>();
  Object.values(students).forEach((s) => sections.add(s.section));
  return [...sections].sort();
}

export function getStudentsForSubject(
  students: Record<string, MasterStudent>,
  subject: Subject
): MasterStudent[] {
  if (subject.type === "elective" && subject.enrolledStudents.length > 0) {
    // Elective: only students in the enrollment list
    return subject.enrolledStudents
      .map((e) => students[e.regNo])
      .filter(Boolean);
  }
  // Core: all students in the selected sections
  return Object.values(students).filter((s) =>
    subject.sections.includes(s.section)
  );
}

/**
 * Get PE section for a specific student in an elective subject.
 * Returns empty string if not found.
 */
export function getPeSectionForStudent(
  subject: Subject,
  regNo: string
): string {
  if (subject.type !== "elective") return "";
  return subject.enrolledStudents.find((e) => e.regNo === regNo)?.peSection ?? "";
}

export function getStudentsForSection(
  students: Record<string, MasterStudent>,
  section: string
): MasterStudent[] {
  return Object.values(students)
    .filter((s) => s.section === section)
    .sort((a, b) => a.regNo.localeCompare(b.regNo));
}
