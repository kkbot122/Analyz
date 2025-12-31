import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CreateOrgForm from "./create-org-form"; // Import your renamed component

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);

  // 1. If not logged in, go to login
  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  // 2. "Safety Net" Check: Does the user ALREADY have a membership?
  // (This handles the race condition where Dashboard didn't see it yet)
  const existingMembership = await prisma.membership.findFirst({
    where: { userId: session.user.id },
  });

  if (existingMembership) {
    // You shouldn't be here! Go to dashboard.
    redirect("/dashboard");
  }

  // 3. "Missed Invite" Check: Are there pending invites for this email?
  // (This handles cases where the auto-accept logic in Auth/Register didn't fire)
  const pendingInvite = await prisma.invite.findFirst({
    where: {
      email: session.user.email, // Case insensitive check handled by DB usually, or normalize
      expiresAt: { gt: new Date() },
    },
    include: { organization: true },
  });

  if (pendingInvite) {
    console.log(`[Onboarding] Found stuck invite for ${session.user.email}. Auto-accepting...`);
    
    // Auto-accept the invite right now
    await prisma.$transaction([
      prisma.membership.create({
        data: {
          userId: session.user.id,
          organizationId: pendingInvite.organizationId,
          role: pendingInvite.role,
        },
      }),
      prisma.invite.delete({
        where: { id: pendingInvite.id },
      }),
    ]);

    // If there was a project attached, try to add that too (best effort)
    if (pendingInvite.projectId) {
        try {
            await prisma.projectMember.create({
                data: {
                    userId: session.user.id,
                    projectId: pendingInvite.projectId,
                    role: "MEMBER"
                }
            });
        } catch (e) {
            // Ignore if already added
        }
    }

    // Redirect to dashboard now that we fixed it
    redirect("/dashboard");
  }

  // 4. If truly no data, show the Create Org Form
  return <CreateOrgForm />;
}