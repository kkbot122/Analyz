import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, BarChart3 } from "lucide-react";
import Link from "next/link";
import { ProjectHeader } from "@/components/project-header";
import { canInviteToProject } from "@/lib/permissions";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return redirect("/auth/login");

  const { projectId } = await params;

  // 1. Fetch Project and ALL relevant context
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      organization: true,
      members: {
        where: { userId: session.user.id }, // Check if user is explicitly in project
      },
    },
  });

  if (!project) return notFound();

  // 2. Fetch User's Organization Role
  // (We need this because Org Owners/Managers might not be in the project members list but still have access)
  const orgMembership = await prisma.membership.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: project.organizationId,
      },
    },
  });

  if (!orgMembership) {
    // User is not even in the organization -> Block access
    return notFound();
  }

  // 3. DETERMINE EFFECTIVE ROLE
  const explicitProjectRole = project.members[0]?.role; // 'OWNER' | 'MEMBER' | undefined
  const orgRole = orgMembership.role; // 'ORG_OWNER' | 'PROJECT_OWNER' | 'TEAM_MEMBER'

  // LOGIC: Access is granted if:
  // A. You are explicitly in the project (MEMBER or OWNER)
  // B. You are the ORG_OWNER (Super Admin)
  // C. You are a PROJECT_OWNER (Org level manager) -> Usually implies access to all projects
  const hasAccess = 
    explicitProjectRole || 
    orgRole === "ORG_OWNER" || 
    orgRole === "PROJECT_OWNER";

  if (!hasAccess) {
    return notFound(); // Or redirect to a "Request Access" page
  }

  // 4. Calculate Permissions for UI
  // If they don't have an explicit project role, inherit from Org role for display
  const displayRole = explicitProjectRole || orgRole; 
  const showInvite = canInviteToProject(orgRole, explicitProjectRole);

  return (
    <div className="min-h-screen bg-white text-black selection:bg-orange-200">
      <nav className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex items-center h-16 gap-4">
              <Link href="/dashboard" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
                  <ArrowLeft className="w-5 h-5 text-gray-500" />
              </Link>
              <div className="h-6 w-px bg-gray-200"></div>
              
              <div className="flex-1">
                <ProjectHeader 
                  projectName={project.name}
                  projectId={project.id}
                  userRole={displayRole}
                  canInvite={showInvite}
                />
              </div>
           </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-6 md:grid-cols-3">
             <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm col-span-2">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <BarChart3 className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-lg">Analytics</h3>
                </div>
                <div className="h-64 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-gray-400">
                    Chart Data Placeholder
                </div>
            </div>
            
            {/* Debug Info (Remove later) */}
            <div className="bg-gray-50 p-4 rounded-xl text-xs font-mono text-gray-500">
                <p>Org Role: {orgRole}</p>
                <p>Project Role: {explicitProjectRole || 'None (inherited)'}</p>
            </div>
        </div>
      </main>
    </div>
  );
}