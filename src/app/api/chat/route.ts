import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { NextResponse } from "next/server";
import { extractToken, validateToken } from "@/lib/adminAuth";
import { readAdminData } from "@/lib/adminStore";

export const maxDuration = 30; // max duration for edge/serverless

export async function POST(req: Request) {
    try {
        // 1. Authenticate this request to ensure only admins can use the LLM
        const token = extractToken(req);
        if (!validateToken(token)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { messages } = await req.json();

        // 2. Fetch live data so the copilot can answer real questions about the system
        const data = await readAdminData();
        const activeYear = data.years ? data.years["3"] : null; // Can refine contextual year later

        // Quick summary strings to not overwhelm the LLM context window
        const totalStudents = activeYear ? Object.keys(activeYear.students).length : 0;
        const totalSubjects = activeYear ? activeYear.subjects.length : 0;
        const totalRooms = activeYear ? activeYear.roomAssignments.length : 0;

        const systemPrompt = `You are a helpful, professional AI assistant built into the MUJ Seating Arrangement Admin Portal.
Your job is to answer questions, explain features, and eventually command the portal.

PORTAL CONTEXT:
This is a Next.js web application that uses a local JSON data store.
It can parse messy Excel master lists, handle Program Elective & Core subjects, and smartly allocate students to seats in exam halls.
It uses an Optimistic Concurrency Control system to prevent data loss safely.

CURRENT LIVE DATA SUMMARY:
We have ${totalStudents} students registered.
We have ${totalSubjects} subjects configured.
We have ${totalRooms} room assignments active right now.

Be concise. Keep answers brief unless explicitly asked for detail. Format all replies cleanly in markdown.`;

        const result = streamText({
            model: openai("gpt-4o-mini"),
            system: systemPrompt,
            messages,
        });

        return result.toTextStreamResponse();
    } catch (error) {
        console.error("Copilot Error:", error);
        return NextResponse.json(
            { error: "Error connecting to AI Provider" },
            { status: 500 }
        );
    }
}
