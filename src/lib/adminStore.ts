import { AdminData, createEmptyAdminData, migrateV1toV2 } from "./adminTypes";
import { compileStudentData, CompiledStudentData } from "./dataCompiler";
import fs from "fs/promises";
import path from "path";

const ADMIN_BLOB_KEY = "admin-data.json";
const STUDENTS_BLOB_KEY = "students-data.json";
const LOCAL_ADMIN_PATH = path.join(process.cwd(), "src", "data", "admin-data.json");
const LOCAL_STUDENTS_PATH = path.join(process.cwd(), "src", "data", "students.json");

const isProduction = process.env.NODE_ENV === "production";

// ── Read Admin Data ────────────────────────────────

export async function readAdminData(): Promise<AdminData> {
  let raw: AdminData;
  if (isProduction) {
    raw = await readAdminDataFromBlob();
  } else {
    raw = await readAdminDataFromFile();
  }

  // Auto-migrate v1 → v2 if needed
  if (!raw.years || (raw.version || 0) < 2) {
    raw = migrateV1toV2(raw);
  }

  return raw;
}

async function readAdminDataFromFile(): Promise<AdminData> {
  try {
    const content = await fs.readFile(LOCAL_ADMIN_PATH, "utf-8");
    return JSON.parse(content) as AdminData;
  } catch {
    return createEmptyAdminData();
  }
}

async function readAdminDataFromBlob(): Promise<AdminData> {
  try {
    const { list } = await import("@vercel/blob");
    const blobs = await list({ prefix: ADMIN_BLOB_KEY });
    if (blobs.blobs.length === 0) {
      return createEmptyAdminData();
    }
    const res = await fetch(blobs.blobs[0].url);
    return (await res.json()) as AdminData;
  } catch {
    return createEmptyAdminData();
  }
}

// ── Write Admin Data ───────────────────────────────

export async function writeAdminData(data: AdminData): Promise<void> {
  data.lastModified = new Date().toISOString();

  if (isProduction) {
    await writeAdminDataToBlob(data);
  } else {
    await writeAdminDataToFile(data);
  }
}

async function writeAdminDataToFile(data: AdminData): Promise<void> {
  await fs.writeFile(LOCAL_ADMIN_PATH, JSON.stringify(data, null, 2), "utf-8");
}

async function writeAdminDataToBlob(data: AdminData): Promise<void> {
  const { put, del, list } = await import("@vercel/blob");

  const blobs = await list({ prefix: ADMIN_BLOB_KEY });
  for (const blob of blobs.blobs) {
    await del(blob.url);
  }

  await put(ADMIN_BLOB_KEY, JSON.stringify(data), {
    contentType: "application/json",
    access: "public",
  });
}

// ── Publish ────────────────────────────────────────
// Compiles all published years and writes to students.json.
// Called when faculty publishes any year — merges all live years together.

export async function publishStudentData(adminData: AdminData): Promise<CompiledStudentData> {
  // Compile all published years into one dataset
  const compiled = compileStudentData(adminData);

  if (isProduction) {
    await publishToBlobStore(compiled);
  } else {
    await fs.writeFile(
      LOCAL_STUDENTS_PATH,
      JSON.stringify(compiled, null, 4),
      "utf-8"
    );
  }

  return compiled;
}

async function publishToBlobStore(data: CompiledStudentData): Promise<void> {
  const { put, del, list } = await import("@vercel/blob");

  const blobs = await list({ prefix: STUDENTS_BLOB_KEY });
  for (const blob of blobs.blobs) {
    await del(blob.url);
  }

  await put(STUDENTS_BLOB_KEY, JSON.stringify(data), {
    contentType: "application/json",
    access: "public",
  });
}
