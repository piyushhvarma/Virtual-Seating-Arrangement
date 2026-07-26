import { AdminData, createEmptyAdminData, migrateV1toV2 } from "./adminTypes";
import { compileStudentData, CompiledStudentData } from "./dataCompiler";
import fs from "fs/promises";
import path from "path";

const ADMIN_BLOB_KEY = "admin-data.json";
const STUDENTS_BLOB_KEY = "students-data.json";
const LOCAL_ADMIN_PATH = path.join(process.cwd(), "src", "data", "admin-data.json");
const LOCAL_STUDENTS_PATH = path.join(process.cwd(), "src", "data", "students.json");

// Use Blob whenever the token is present (works both locally and on Vercel)
const useBlobStorage = !!process.env.BLOB_READ_WRITE_TOKEN;

// ── Read Admin Data ────────────────────────────────

export async function readAdminData(): Promise<AdminData> {
  let raw: AdminData;
  if (useBlobStorage) {
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
    const { head } = await import("@vercel/blob");
    const result = await head(ADMIN_BLOB_KEY).catch(() => null);
    if (!result) return createEmptyAdminData();
    const res = await fetch(result.url, { cache: "no-store" });
    if (!res.ok) return createEmptyAdminData();
    return (await res.json()) as AdminData;
  } catch {
    return createEmptyAdminData();
  }
}

// ── Write Admin Data ───────────────────────────────

export async function writeAdminData(data: AdminData): Promise<void> {
  data.lastModified = new Date().toISOString();

  if (useBlobStorage) {
    await writeAdminDataToBlob(data);
  } else {
    await writeAdminDataToFile(data);
  }
}

async function writeAdminDataToFile(data: AdminData): Promise<void> {
  await fs.writeFile(LOCAL_ADMIN_PATH, JSON.stringify(data, null, 2), "utf-8");
}

async function writeAdminDataToBlob(data: AdminData): Promise<void> {
  const { put } = await import("@vercel/blob");
  // Using allowOverwrite to replace the existing blob in-place (no delete needed)
  await put(ADMIN_BLOB_KEY, JSON.stringify(data), {
    contentType: "application/json",
    access: "public",
    addRandomSuffix: false,
  });
}

// ── Publish ────────────────────────────────────────
// Compiles all published years and writes to students.json (the public-facing data).
// Called when faculty publishes any year — merges all live years together.

export async function publishStudentData(adminData: AdminData): Promise<CompiledStudentData> {
  const compiled = compileStudentData(adminData);

  if (useBlobStorage) {
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
  const { put } = await import("@vercel/blob");
  await put(STUDENTS_BLOB_KEY, JSON.stringify(data), {
    contentType: "application/json",
    access: "public",
    addRandomSuffix: false,
  });
}
