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
    const clientData = body.data;

    // Read current data to verify version
    const currentData = await readAdminData();
    const currentVersion = currentData.version || 2;
    const clientVersion = clientData.version || 2;

    if (clientVersion !== currentVersion) {
      return NextResponse.json(
        {
          success: false,
          error: "Concurrency Conflict: Data was modified by another admin. Please refresh to avoid overwriting their work.",
          conflict: true
        },
        { status: 409 }
      );
    }

    // Increment version
    clientData.version = currentVersion + 1;

    await writeAdminData(clientData);
    return NextResponse.json({ success: true, newVersion: clientData.version });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Failed to write data" },
      { status: 500 }
    );
  }
}
