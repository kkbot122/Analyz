import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST: Upsert an Event Definition (Alias)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const { projectId } = await params;
  const body = await req.json();
  const { name, title, category, isCritical } = body;

  const definition = await prisma.eventDefinition.upsert({
    where: {
      projectId_name: {
        projectId,
        name,
      },
    },
    update: { title, category, isCritical },
    create: {
      projectId,
      name,
      title,
      category,
      isCritical,
    },
  });

  return NextResponse.json(definition);
}