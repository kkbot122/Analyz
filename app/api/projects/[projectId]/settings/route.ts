import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Fetch Project Settings & Merged Event List
export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const { projectId } = await params;

  // 1. Fetch Project Config & Definitions
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { eventDefinitions: true },
  });

  if (!project) return new NextResponse("Project not found", { status: 404 });

  // 2. Fetch Unique Raw Events from Analytics Data
  // We need this so the user can see events they haven't aliased yet
  const rawEventsGroup = await prisma.event.groupBy({
    by: ["eventName"],
    where: { projectId },
    _count: { eventName: true },
    orderBy: { _count: { eventName: 'desc' } } // Show most popular first
  });

  // 3. Merge Lists
  // Create a master list of { rawName, definition? }
  const combinedEvents = rawEventsGroup.map((group) => {
    const def = project.eventDefinitions.find(
      (d) => d.name === group.eventName
    );
    return {
      name: group.eventName,
      count: group._count.eventName,
      title: def?.title || "",
      category: def?.category || "other",
      isCritical: def?.isCritical || false,
    };
  });

  return NextResponse.json({
    primaryGoal: project.primaryGoal,
    goalWindow: project.goalWindow,
    events: combinedEvents,
  });
}

// PATCH: Update Project Goal
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const { projectId } = await params;
  const body = await req.json();

  await prisma.project.update({
    where: { id: projectId },
    data: {
      primaryGoal: body.primaryGoal,
      goalWindow: Number(body.goalWindow),
    },
  });

  return NextResponse.json({ success: true });
}