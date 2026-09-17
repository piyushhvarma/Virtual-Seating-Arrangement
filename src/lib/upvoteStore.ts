import fs from "fs/promises";
import path from "path";

export interface UpvoteData {
  count: number;
  updatedAt: string;
}

const UPVOTES_BLOB_KEY = "upvotes.json";
const LOCAL_UPVOTES_PATH = path.join(process.cwd(), "src", "data", "upvotes.json");
const DEFAULT_COUNT = 412;

const useBlobStorage = !!process.env.BLOB_READ_WRITE_TOKEN;

export async function readUpvotes(): Promise<UpvoteData> {
  if (useBlobStorage) {
    try {
      const { list } = await import("@vercel/blob");
      const { blobs } = await list({ prefix: UPVOTES_BLOB_KEY });
      const blob = blobs.find((b) => b.pathname === UPVOTES_BLOB_KEY);
      if (!blob) return { count: DEFAULT_COUNT, updatedAt: new Date().toISOString() };
      const res = await fetch(blob.url, { cache: "no-store" });
      if (!res.ok) return { count: DEFAULT_COUNT, updatedAt: new Date().toISOString() };
      return (await res.json()) as UpvoteData;
    } catch {
      return { count: DEFAULT_COUNT, updatedAt: new Date().toISOString() };
    }
  }

  try {
    const content = await fs.readFile(LOCAL_UPVOTES_PATH, "utf-8");
    return JSON.parse(content) as UpvoteData;
  } catch {
    return { count: DEFAULT_COUNT, updatedAt: new Date().toISOString() };
  }
}

export async function incrementUpvotes(): Promise<UpvoteData> {
  const current = await readUpvotes();
  const nextData: UpvoteData = {
    count: (current.count || 0) + 1,
    updatedAt: new Date().toISOString(),
  };

  if (useBlobStorage) {
    try {
      const { put } = await import("@vercel/blob");
      await put(UPVOTES_BLOB_KEY, JSON.stringify(nextData), {
        contentType: "application/json",
        access: "public",
        addRandomSuffix: false,
      });
    } catch (err) {
      console.error("Failed to write upvotes to blob:", err);
    }
  } else {
    try {
      await fs.writeFile(LOCAL_UPVOTES_PATH, JSON.stringify(nextData, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to write upvotes to file:", err);
    }
  }

  return nextData;
}
