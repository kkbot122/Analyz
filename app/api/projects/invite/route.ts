import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. Authenticate Request
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Parse Body
    const body = await req.json();
    const { email, projectId, role } = body;

    if (!email || !projectId || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 3. Fetch Project & Check Requester Permissions
    // We need to know: 
    // a) Does project exist?
    // b) Is the requester the ORG_OWNER? 
    // c) Is the requester the PROJECT_OWNER?
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        organization: true,
        members: {
          where: { userId: session.user.id } // Get requester's role in this project
        }
      }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check Org Level Role (for ORG_OWNER access)
    const requesterOrgMembership = await prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: project.organizationId
        }
      }
    });

    const isOrgOwner = requesterOrgMembership?.role === "ORG_OWNER";
    const isProjectOwner = project.members[0]?.role === "OWNER";

    // ✅ PERMISSION GATE
    if (!isOrgOwner && !isProjectOwner) {
      return NextResponse.json(
        { error: "You do not have permission to invite people to this project." }, 
        { status: 403 }
      );
    }

    // 4. Find the User to Invite
    const userToAdd = await prisma.user.findUnique({
      where: { email }
    });

    if (!userToAdd) {
      return NextResponse.json({ error: "User not found. They must sign up first." }, { status: 404 });
    }

    // 5. Execute Transaction (Add to Org + Add to Project)
    await prisma.$transaction(async (tx) => {
      
      // Step A: Ensure they are in the Parent Organization
      // If they are not in the org, add them as a read-only TEAM_MEMBER
      await tx.membership.upsert({
        where: {
          userId_organizationId: {
            userId: userToAdd.id,
            organizationId: project.organizationId
          }
        },
        create: {
          userId: userToAdd.id,
          organizationId: project.organizationId,
          role: "TEAM_MEMBER"
        },
        update: {} // If they exist, change nothing
      });

      // Step B: Check for duplicates in Project
      const existingProjectMember = await tx.projectMember.findFirst({
        where: {
          userId: userToAdd.id,
          projectId: projectId
        }
      });

      if (existingProjectMember) {
        throw new Error("User is already in this project");
      }

      // Step C: Add to Project
      await tx.projectMember.create({
        data: {
          userId: userToAdd.id,
          projectId: projectId,
          role: role // 'MEMBER' or 'OWNER'
        }
      });
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("[PROJECT_INVITE_ERROR]", error);
    
    // Return specific error message if available (like "User is already in this project")
    return NextResponse.json(
      { error: error.message || "Internal Server Error" }, 
      { status: 500 }
    );
  }
}