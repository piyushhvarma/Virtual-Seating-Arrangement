import { NextResponse } from "next/server";
import { extractToken, validateToken } from "@/lib/adminAuth";
import { readAdminData, publishStudentData } from "@/lib/adminStore";

/**
 * POST /api/admin/publish
 *
 * Re-reads the admin data (which already has per-year published flags set by the client),
 * compiles all published years into one students.json, and writes it out.
 */
export async function POST(request: Request) {
  const token = extractToken(request);
  if (!validateToken(token)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const adminData = await readAdminData();
    const compiled = await publishStudentData(adminData);

    const studentCount = Object.keys(compiled.students).length;
    let examTickets = 0;
    Object.values(compiled.students).forEach((s) => {
      examTickets += s.exams.length;
    });

    // Count which years are published
    const publishedYears = Object.entries(adminData.years)
      .filter(([, yd]) => yd.published)
      .map(([key]) => key);

    return NextResponse.json({
      success: true,
      stats: {
        studentsPublished: studentCount,
        examTickets,
        publishedYears,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Failed to publish" },
      { status: 500 }
    );
  }
}
