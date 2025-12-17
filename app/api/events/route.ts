import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

// 1. Handle CORS (Pre-flight requests)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*", // Allow ALL websites to send data (or restrict later)
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

// 2. Handle Incoming Events
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Extract data from SDK payload
    const { api_key, event_name, user_id, session_id, properties, metadata } = body;

    if (!api_key || !event_name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Validate API Key (Find Project)
    // Assuming your Project model has an 'id' that acts as the API key, 
    // or you have a specific 'apiKey' field. Let's assume 'id' for now.
    const project = await prisma.project.findUnique({
      where: { id: api_key },
    });

    if (!project) {
      return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });
    }

    // 2. Store Event in Database
    await prisma.event.create({
      data: {
        projectId: project.id,
        eventName: event_name,
        userId: user_id,
        sessionId: session_id,
        properties: properties || {},
        metadata: metadata || {},
      },
    });

    // 3. Respond with CORS headers
    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    });

  } catch (error) {
    console.error("Event ingestion error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}