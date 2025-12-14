import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { getActiveOrg } from "@/lib/active-org";
import { canCreateProject } from "@/lib/permissions";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const org = await getActiveOrg();
    if (!org) {
      return NextResponse.json({ error: "No active org" }, { status: 400 });
    }

    if (!canCreateProject(org.role)) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to create projects in this organization.",
        },
        { status: 403 }
      );
    }

    const { name } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "Missing name" }, { status: 400 });
    }

    const project = await prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          name,
          organizationId: org.id,
          ownerId: session.user.id,
        },
      });

      await tx.projectMember.create({
        data: {
          projectId: project.id,
          userId: session.user.id,
          role: "OWNER",
        },
      });

      return project;
    });

    return NextResponse.json({ projectId: project.id });
  } catch (error) {
    console.error("[PROJECT_CREATE_ERROR]", error);
    // Return JSON even on error, so frontend doesn't crash
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
