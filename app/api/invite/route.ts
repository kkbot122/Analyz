import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrgRole, ProjectRole } from "@prisma/client";
import crypto from "crypto";
import { sendInviteEmail, sendWelcomeEmail } from "@/lib/email"; // We'll create this

// Generate a secure random token
function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Normalize email 
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { email, role, projectId, projectRole, organizationId } = body;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // 2. Validation
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !role) {
      return NextResponse.json(
        { error: "Email and role are required" },
        { status: 400 }
      );
    }

    // Validate role is a valid OrgRole
    if (!Object.values(OrgRole).includes(role as OrgRole)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // If projectId is provided, validate projectRole
    if (projectId && !projectRole) {
      return NextResponse.json(
        { error: "Project role is required when inviting to a project" },
        { status: 400 }
      );
    }

    if (
      projectRole &&
      !Object.values(ProjectRole).includes(projectRole as ProjectRole)
    ) {
      return NextResponse.json(
        { error: "Invalid project role" },
        { status: 400 }
      );
    }

    // 3. Get requester's active organization
    // We need to know which org the admin is inviting to
    
    const activeOrgId = organizationId;

    if (!activeOrgId) {
      return NextResponse.json(
        { error: "No active organization" },
        { status: 400 }
      );
    }

    // 4. Verify requester has permission to invite
    const requesterMembership = await prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: activeOrgId,
        },
      },
    });

    if (!requesterMembership) {
      return NextResponse.json(
        { error: "You are not a member of this organization" },
        { status: 403 }
      );
    }

    // Permission logic:
    // - ORG_OWNER can invite anyone as any role
    // - PROJECT_OWNER can invite as TEAM_MEMBER only
    // - TEAM_MEMBER cannot invite
    if (requesterMembership.role === "TEAM_MEMBER") {
      return NextResponse.json(
        { error: "You don't have permission to invite members" },
        { status: 403 }
      );
    }

    if (
      requesterMembership.role === "PROJECT_OWNER" &&
      role !== "TEAM_MEMBER"
    ) {
      return NextResponse.json(
        { error: "Project owners can only invite as Team Members" },
        { status: 403 }
      );
    }

    // 5. Check if project exists (if project invite)
    let project = null;
    if (projectId) {
      project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { organization: true },
      });

      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }

      // Verify project belongs to the active organization
      if (project.organizationId !== activeOrgId) {
        return NextResponse.json(
          { error: "Project does not belong to your organization" },
          { status: 403 }
        );
      }

      if (requesterMembership.role === "PROJECT_OWNER" && role !== "TEAM_MEMBER") {
        return NextResponse.json(
          { error: "Project owners can only invite as Team Members" },
          { status: 403 }
        );
      }

      // Additional permission check for project invites
      if (requesterMembership.role === "PROJECT_OWNER") {
        // Project owners can only invite to projects they own
        const isProjectOwner = await prisma.projectMember.findFirst({
          where: {
            projectId,
            userId: session.user.id,
            role: "OWNER",
          },
        });

        if (!isProjectOwner) {
          return NextResponse.json(
            { error: "You can only invite to projects you own" },
            { status: 403 }
          );
        }
      }
    }

    // 6. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // 7. Check for duplicate invite
    const existingInvite = await prisma.invite.findFirst({
      where: {
        email: normalizedEmail,
        organizationId: activeOrgId,
        projectId: projectId || null,
        expiresAt: {
          gt: new Date(), // Not expired
        },
      },
    });

    if (existingInvite) {
      return NextResponse.json(
        { error: "An active invite already exists for this email" },
        { status: 400 }
      );
    }

    // 8. Check if user is already a member
    if (existingUser) {
      const existingMembership = await prisma.membership.findUnique({
        where: {
          userId_organizationId: {
            userId: existingUser.id,
            organizationId: activeOrgId,
          },
        },
      });

      if (existingMembership) {
        return NextResponse.json(
          { error: "User is already a member of this organization" },
          { status: 400 }
        );
      }

      // If project invite, check if already in project
      if (projectId) {
        const existingProjectMember = await prisma.projectMember.findUnique({
          where: {
            userId_projectId: {
              userId: existingUser.id,
              projectId,
            },
          },
        });

        if (existingProjectMember) {
          return NextResponse.json(
            { error: "User is already a member of this project" },
            { status: 400 }
          );
        }
      }
    }

    // 9. Create invite record
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invite = await prisma.invite.create({
      data: {
        email: normalizedEmail,
        token,
        role: role as OrgRole,
        expiresAt,
        organizationId: activeOrgId,
        projectId: projectId || null,
      },
    });

    // 10. Handle based on user existence
    if (existingUser) {
      // Case 1: Existing User - Add immediately
      await prisma.membership.create({
        data: {
          userId: existingUser.id,
          organizationId: activeOrgId,
          role: role as OrgRole,
        },
      });

      // Add to project if specified
      if (projectId && projectRole) {
        await prisma.projectMember.create({
          data: {
            userId: existingUser.id,
            projectId,
            role: projectRole as ProjectRole,
          },
        });
      }

      // Send welcome notification
      await sendWelcomeEmail({
        to: normalizedEmail,
        userName: existingUser.name || "there",
        orgName:
          (
            await prisma.organization.findUnique({
              where: { id: activeOrgId },
            })
          )?.name || "the organization",
        role,
        projectName: project?.name,
      });

      return NextResponse.json({
        success: true,
        message: "User added successfully",
        type: "existing_user",
        userId: existingUser.id,
      });
    } else {
      // Case 2: New User - Send invite email
      await sendInviteEmail({
        to: normalizedEmail,
        orgName:
          (
            await prisma.organization.findUnique({
              where: { id: activeOrgId },
            })
          )?.name || "an organization",
        role,
        projectName: project?.name,
        token,
        expiresAt,
      });

      return NextResponse.json({
        success: true,
        message: "Invite sent successfully",
        type: "new_user",
        token,
        expiresAt,
      });
    }
  } catch (error: any) {
    console.error("Invite error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
