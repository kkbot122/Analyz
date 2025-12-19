import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function AcceptInvitePage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  if (!token) {
    redirect("/dashboard");
  }

  const session = await getServerSession(authOptions);

  // 1. Validate the invite token
  const invite = await prisma.invite.findUnique({
    where: { token },
    include: {
      organization: true,
      project: true,
    },
  });

  // Check if invite exists and is not expired
  if (!invite || new Date() > invite.expiresAt) {
    return (
      <div className="min-h-screen bg-[#f0eeef] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Invalid or Expired Invite
          </h1>
          <p className="text-gray-600 mb-6">
            This invitation link is invalid or has expired. Please ask the organization admin to send a new invite.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // 2. If user is logged in
  if (session?.user?.email) {
    // Check if logged in user matches invite email
    if (session.user.email.toLowerCase() !== invite.email.toLowerCase()) {
      return (
        <div className="min-h-screen bg-[#f0eeef] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Email Mismatch
            </h1>
            <p className="text-gray-600 mb-4">
              This invitation was sent to <strong>{invite.email}</strong>, but you're logged in as <strong>{session.user.email}</strong>.
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Please log out and log in with the correct email, or ask the admin to send a new invite to your current email.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/api/auth/signout"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Log Out
              </Link>
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      );
    }

    // Auto-accept the invite
    try {
      // Add to organization
      await prisma.membership.create({
        data: {
          userId: session.user.id,
          organizationId: invite.organizationId,
          role: invite.role,
        },
      });

      // Add to project if specified
      if (invite.projectId) {
        // Use MEMBER as default project role for invites
        await prisma.projectMember.create({
          data: {
            userId: session.user.id,
            projectId: invite.projectId,
            role: "MEMBER",
          },
        });
      }

      // Delete or mark invite as accepted
      await prisma.invite.delete({
        where: { id: invite.id },
      });

      // Redirect to dashboard
      redirect("/dashboard");
    } catch (error) {
      console.error("Error accepting invite:", error);
      // Handle already a member case
      return (
        <div className="min-h-screen bg-[#f0eeef] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Already a Member
            </h1>
            <p className="text-gray-600 mb-6">
              You're already a member of <strong>{invite.organization.name}</strong>.
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      );
    }
  }

  // 3. User is not logged in - show appropriate message
  const userExists = await prisma.user.findUnique({
    where: { email: invite.email },
  });

  return (
    <div className="min-h-screen bg-[#f0eeef] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-sm border border-gray-100">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          {userExists ? <CheckCircle2 className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {userExists ? "Accept Invitation" : "Join the Team"}
        </h1>
        <p className="text-gray-600 mb-4">
          You've been invited to join{" "}
          <strong>{invite.organization.name}</strong>
          {invite.project && (
            <>
              {" "}and work on{" "}
              <strong>{invite.project.name}</strong>
            </>
          )}
        </p>

        {userExists ? (
          <>
            <p className="text-gray-500 text-sm mb-6">
              Please log in to accept this invitation.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href={`/auth/login?callbackUrl=/invite/accept?token=${token}`}
                className="px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
              >
                Log In & Accept
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-500 text-sm mb-6">
              Create an account to join the organization.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href={`/auth/register?email=${invite.email}&callbackUrl=/invite/accept?token=${token}`}
                className="px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
              >
                Sign Up & Join
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}