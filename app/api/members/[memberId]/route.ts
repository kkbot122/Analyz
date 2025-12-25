import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageOrganization } from "@/lib/permissions";

// Define context type
type RouteContext = {
  params: Promise<{ memberId: string }>;
};

export async function DELETE(
  req: Request,
  { params }: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    // ✅ Await params
    const { memberId } = await params;

    // 1. Get the membership we want to delete
    const targetMembership = await prisma.membership.findUnique({
      where: { id: memberId },
    });

    if (!targetMembership) return new NextResponse("Not Found", { status: 404 });

    // 2. Check if the requester is the Org Owner
    const requesterMembership = await prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: targetMembership.organizationId,
        },
      },
    });

    if (!requesterMembership || !canManageOrganization(requesterMembership.role)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // 3. Prevent deleting yourself
    if (targetMembership.userId === session.user.id) {
       return new NextResponse("Cannot kick yourself", { status: 400 });
    }

    await prisma.membership.delete({
      where: { id: memberId },
    });

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}