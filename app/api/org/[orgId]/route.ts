import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageOrganization } from "@/lib/permissions";

// Define the context type for Next.js 15
type RouteContext = {
  params: Promise<{ orgId: string }>;
};

export async function PATCH(
  req: Request,
  { params }: RouteContext // Params is now a Promise
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    // ✅ Await the params before accessing orgId
    const { orgId } = await params; 

    const body = await req.json();
    const { name } = body;

    const membership = await prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: orgId, // Use the awaited variable
        },
      },
    });

    if (!membership || !canManageOrganization(membership.role)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const org = await prisma.organization.update({
      where: { id: orgId },
      data: { name },
    });

    return NextResponse.json(org);
  } catch (error) {
    console.error(error); // Log error for debugging
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { orgId } = await params;

    // 1. Verify Ownership
    const membership = await prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: orgId,
        },
      },
    });

    if (!membership || membership.role !== "ORG_OWNER") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // 2. Perform Cascading Delete via Transaction
    await prisma.$transaction(async (tx) => {
      // A. Delete all Invites (for the Org and its Projects)
      await tx.invite.deleteMany({
        where: { organizationId: orgId }
      });

      // B. Delete all Project Members (Dependencies of Projects)
      await tx.projectMember.deleteMany({
        where: { 
          project: { organizationId: orgId } 
        }
      });

      // C. Delete all Projects
      // (Events will auto-delete because your schema has onDelete: Cascade on Events)
      await tx.project.deleteMany({
        where: { organizationId: orgId }
      });

      // D. Delete all Organization Memberships
      await tx.membership.deleteMany({
        where: { organizationId: orgId }
      });

      // E. Finally, Delete the Organization itself
      await tx.organization.delete({
        where: { id: orgId },
      });
    });

    return new NextResponse(null, { status: 200 });

  } catch (error) {
    // Log the actual error to your terminal for debugging
    console.error("[DELETE_ORG_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}