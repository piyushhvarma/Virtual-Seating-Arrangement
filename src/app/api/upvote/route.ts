import { NextResponse } from "next/server";
import { readUpvotes, incrementUpvotes } from "@/lib/upvoteStore";
import { checkRateLimit } from "@/lib/rateLimit";

export async function GET() {
  const data = await readUpvotes();
  return NextResponse.json({ success: true, count: data.count });
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown-ip";
  // Rate limit: 10 votes per IP per 5 minutes to prevent automated spamming while allowing roommate devices
  const rl = checkRateLimit(`upvote-${ip}`, 10, 5 * 60 * 1000);
  if (!rl.success) {
    return NextResponse.json(
      { success: false, error: "Too many votes registered from this network. Please try again later." },
      { status: 429 }
    );
  }

  const updated = await incrementUpvotes();
  return NextResponse.json({ success: true, count: updated.count });
}
