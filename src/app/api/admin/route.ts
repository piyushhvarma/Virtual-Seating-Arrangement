import { NextResponse } from "next/server";
import { checkPassword, createSession } from "@/lib/adminAuth";
import { readAdminData } from "@/lib/adminStore";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const pwd = body.password;

    if (!checkPassword(pwd)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Incorrect password." },
        { status: 401 }
      );
    }

    const token = createSession();
    const adminData = await readAdminData();

    // Aggregate stats across all years
    let totalStudents = 0;
    let totalExamTickets = 0;
    let totalSubjects = 0;
    let totalRooms = 0;
    const assignedStudents = new Set<string>();
    const yearStats: Record<string, { students: number; published: boolean }> = {};

    for (const [yearKey, yearData] of Object.entries(adminData.years)) {
      const sc = Object.keys(yearData.students).length;
      totalStudents += sc;
      totalSubjects += yearData.subjects.length;
      totalRooms += yearData.roomAssignments.length;

      yearData.roomAssignments.forEach((room) => {
        totalExamTickets += room.assignments.length;
        room.assignments.forEach((a) => assignedStudents.add(a.regNo));
      });

      yearStats[yearKey] = { students: sc, published: yearData.published };
    }

    return NextResponse.json({
      success: true,
      token,
      stats: {
        totalRecords: totalStudents,
        allocatedSeats: assignedStudents.size,
        pendingProfiles: totalStudents - assignedStudents.size,
        totalExamTickets,
        totalSubjects,
        totalRooms,
        yearStats,
        examMeta: adminData.examMeta,
        lastModified: adminData.lastModified,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
