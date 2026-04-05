import studentsData from "@/data/students.json";
import { getSeatCoordinates } from "./getSeatCoordinates";

export interface StudentInfo {
    regNo: string;
    name: string;
    section: string;
    subjectCode: string;
    subject: string;
    room: string;
    seatLabel: string;
    seatIndex: number;
    rows: number;
    cols: number;
    examDate: string;
    examTime: string;
    examTitle: string;
    department: string;
}

export interface LookupError {
    type: "NOT_FOUND" | "INVALID_FORMAT";
    message: string;
}

export type LookupResult =
    | { success: true; data: StudentInfo[] }
    | { success: false; error: LookupError };

const REG_NO_REGEX = /^23FE10CAI\d{5}$/i;

export function lookupStudent(rawInput: string): LookupResult {
    const input = rawInput.trim().toUpperCase();

    if (!REG_NO_REGEX.test(input)) {
        return {
            success: false,
            error: {
                type: "INVALID_FORMAT",
                message:
                    "Invalid format. AIML reg numbers look like: 23FE10CAI00019",
            },
        };
    }

    const students = studentsData.students as Record<
        string,
        Array<{
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
        }>
    >;

    const records = students[input];

    if (!records || records.length === 0) {
        return {
            success: false,
            error: {
                type: "NOT_FOUND",
                message:
                    "Registration number not found. Please check and try again.",
            },
        };
    }

    const mappedData = records.map((record) => {
        const seatLabel = getSeatCoordinates(record.seatIndex, record.rows);
        return {
            regNo: input,
            name: record.name,
            section: record.section,
            subjectCode: record.subjectCode,
            subject: record.subject,
            room: record.room,
            seatLabel,
            seatIndex: record.seatIndex,
            rows: record.rows,
            cols: record.cols,
            examDate: record.examDate,
            examTime: record.examTime,
            examTitle: studentsData.examMeta.title,
            department: studentsData.examMeta.department,
        };
    });

    return {
        success: true,
        data: mappedData,
    };
}
