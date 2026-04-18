import { NextResponse } from "next/server";
import studentsData from "@/data/students.json";
import { getSeatCoordinates } from "@/lib/getSeatCoordinates";
import { checkRateLimit } from "@/lib/rateLimit";

const REG_NO_REGEX = /^23FE10[a-zA-Z]{3}\d{5}$/i;

export async function GET(request: Request) {
    // Basic IP-based Rate Limiting (100 requests per IP per minute)
    // High enough so 10-20 students on the same College WiFi (NAT) won't get blocked.
    // Low enough that a scraping script looping thousands of queries will get instantly cut off.
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown-ip";
    const rlInfo = checkRateLimit(ip, 100, 60 * 1000);

    if (!rlInfo.success) {
        return NextResponse.json(
            { 
                success: false, 
                error: { 
                    type: "RATE_LIMITED", 
                    message: "Too many searches in a short time. Please wait a minute before trying again." 
                } 
            },
            { status: 429 }
        );
    }

    const { searchParams } = new URL(request.url);
    const rawInput = searchParams.get("regNo");

    if (!rawInput) {
        return NextResponse.json(
            { success: false, error: { type: "INVALID_FORMAT", message: "Missing registration number." } },
            { status: 400 }
        );
    }

    const input = rawInput.trim().toUpperCase();

    if (!REG_NO_REGEX.test(input)) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    type: "INVALID_FORMAT",
                    message: "Invalid format. ID looks like: 23FE10CAI00019 or 23FE10ITE00018",
                },
            },
            { status: 400 }
        );
    }

    const students = studentsData.students as Record<
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
            }>
        }
    >;

    const studentRecord = students[input];

    if (!studentRecord) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    type: "NOT_FOUND",
                    message: "Registration number not found. Please check and try again.",
                },
            },
            { status: 404 }
        );
    }

    const mappedData = studentRecord.exams.map((record) => {
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

    return NextResponse.json(
        {
            success: true,
            name: studentRecord.name,
            data: mappedData,
        },
        { status: 200 }
    );
}
