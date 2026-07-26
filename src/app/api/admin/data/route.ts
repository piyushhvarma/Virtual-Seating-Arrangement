import { NextResponse } from "next/server";
import { extractToken, validateToken } from "@/lib/adminAuth";
import { readAdminData, writeAdminData } from "@/lib/adminStore";

/**
 * GET /api/admin/data — Return the full admin data
 */
export async function GET(request: Request) {
  const token = extractToken(request);
  if (!validateToken(token)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const data = await readAdminData();
  return NextResponse.json({ success: true, data });
}

/**
 * PUT /api/admin/data — Overwrite the full admin data
 */
export async function PUT(request: Request) {
  const token = extractToken(request);
  if (!validateToken(token)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    await writeAdminData(body.data);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Failed to write data" },
      { status: 500 }
    );
  }
}
