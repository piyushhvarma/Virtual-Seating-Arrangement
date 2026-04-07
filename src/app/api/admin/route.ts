import { NextResponse } from "next/server";
import studentsData from "@/data/students.json";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const pwd = body.password;

        // Uses an environment variable or falls back to "mujadmin"
        const expectedPwd = process.env.ADMIN_PASSWORD || "mujadmin";

        if (pwd !== expectedPwd) {
            return NextResponse.json(
                { success: false, error: "Unauthorized. Incorrect password." },
                { status: 401 }
            );
        }

        const students = studentsData.students as Record<string, any>;
        const totalRecords = Object.keys(students).length;

        let allocatedSeats = 0;
        let pendingProfiles = 0;
        let totalExamTickets = 0;

        Object.values(students).forEach((student) => {
            const examCount = student.exams?.length || 0;
            totalExamTickets += examCount;
            
            if (examCount > 0) {
                allocatedSeats++;
            } else {
                pendingProfiles++;
            }
        });

        return NextResponse.json({
            success: true,
            stats: {
                totalRecords,
                allocatedSeats,
                pendingProfiles,
                totalExamTickets,
                examMeta: studentsData.examMeta,
            },
        });
    } catch (err) {
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
