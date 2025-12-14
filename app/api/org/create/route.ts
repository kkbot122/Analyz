// app/api/org/create/route.ts
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if session AND user ID exist
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json(); // Safe to parse here inside try/catch
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "Missing name" }, { status: 400 });
    }

    const userId = session.user.id;

    // Prevent accidental duplicates
    const existing = await prisma.membership.findFirst({
      where: { userId },
    });

    if (existing) {
      return NextResponse.json(
        { error: "User already belongs to an organization" },
        { status: 400 }
      );
    }

    const org = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name,
          ownerId: userId,
        },
      });

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
    // Log the actual error to your terminal so you can debug the root cause
    console.error("[ORG_CREATE_ERROR]", error);
    
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}