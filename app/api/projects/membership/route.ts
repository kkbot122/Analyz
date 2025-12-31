import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { projectId, userId, action, role } = await req.json();

  // 1. Verify Project & Org
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { organization: true },
  });

  if (!project) return new NextResponse("Project not found", { status: 404 });

  // 2. ✅ STRICT CHECK: Requester MUST be ORG_OWNER
  const requesterMembership = await prisma.membership.findUnique({
    where: { 
      userId_organizationId: { 
        userId: session.user.id, 
        organizationId: project.organizationId 
      } 
    },
  });

  const isOrgOwner = requesterMembership?.role === "ORG_OWNER";

  // ❌ REMOVED: The check for isProjectOwner. 
  // Now ONLY the Org Owner can change access.
  if (!isOrgOwner) {
    return new NextResponse("Forbidden: Only Organization Owners can manage project access", { status: 403 });
  }

  // 3. Perform Action
  try {
    if (action === "remove") {
      await prisma.projectMember.delete({
        where: { userId_projectId: { userId, projectId } },
      });
    } else if (action === "add" || action === "update") {
      await prisma.projectMember.upsert({
        where: { userId_projectId: { userId, projectId } },
        create: { userId, projectId, role: role || "MEMBER" },
        update: { role: role || "MEMBER" },
      });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update membership" }, { status: 500 });
  }
}