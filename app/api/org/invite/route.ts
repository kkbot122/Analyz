import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { getActiveOrg } from "@/lib/active-org";
import { canInviteMembers } from "@/lib/permissions";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const org = await getActiveOrg();
    if (!org) return new NextResponse("No Org Found", { status: 400 });

    // 1. Permission Check
    if (!canInviteMembers(org.role)) {
      return NextResponse.json({ error: "Only Admins can invite members" }, { status: 403 });
    }

    const body = await req.json();
    const { email, role } = body;

    // ✅ FIX: Only check for email and role. ProjectId is NOT needed here.
    if (!email || !role) {
      return NextResponse.json({ error: "Missing email or role" }, { status: 400 });
    }

    // 2. Find the user by email
    const userToAdd = await prisma.user.findUnique({
      where: { email },
    });

    if (!userToAdd) {
      return NextResponse.json({ error: "User not found. Please ask them to sign up first." }, { status: 404 });
    }

    // 3. Check if already a member
    const existingMember = await prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: userToAdd.id,
          organizationId: org.id,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json({ error: "User is already in this organization" }, { status: 400 });
    }

    // 4. Add them to the Organization
    await prisma.membership.create({
      data: {
        userId: userToAdd.id,
        organizationId: org.id,
        role: role, 
      },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}