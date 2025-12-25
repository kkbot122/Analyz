// app/api/org/create/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if session AND user ID exist
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "Missing name" }, { status: 400 });
    }

    const userId = session.user.id;

    const org = await prisma.$transaction(async (tx) => {
      // 1. Create the new Organization
      const organization = await tx.organization.create({
        data: {
          name,
          ownerId: userId,
        },
      });

      // 2. Add the creator as the OWNER
      await tx.membership.create({
        data: {
          userId,
          organizationId: organization.id,
          role: "ORG_OWNER",
        },
      });

      return organization;
    });

    return NextResponse.json({ orgId: org.id });

  } catch (error) {
    console.error("[ORG_CREATE_ERROR]", error);
    
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}