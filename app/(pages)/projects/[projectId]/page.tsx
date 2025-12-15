import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, BarChart3, Users } from "lucide-react";
import Link from "next/link";
import { ProjectHeader } from "@/components/project-header";
import { Sidebar } from "@/components/sidebar"; // Import Sidebar
import { canInviteToProject, canManageOrganization } from "@/lib/permissions";

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
        where: { userId: session.user.id },
      },
    },
  });

  if (!project) return notFound();

  // 2. Fetch User's Organization Role
  const orgMembership = await prisma.membership.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: project.organizationId,
      },
    },
  });

  if (!orgMembership) {
    return notFound();
  }

  // 3. DETERMINE EFFECTIVE ROLE
  const explicitProjectRole = project.members[0]?.role;
  const orgRole = orgMembership.role;

  const hasAccess = 
    explicitProjectRole || 
    orgRole === "ORG_OWNER" || 
    orgRole === "PROJECT_OWNER"; // Adjusted to match your schema roles typically

  if (!hasAccess) {
    return notFound();
  }

  // 4. Calculate Permissions for UI
  const displayRole = explicitProjectRole || orgRole; 
  const showInvite = canInviteToProject(orgRole, explicitProjectRole);
  
  // Logic to determine if "Settings" should show in sidebar (based on Org role usually)
  const showOrgSettings = canManageOrganization(orgRole);

  // Styling constant
  const cardBaseClass = "bg-white rounded-[30px] p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-50/50";

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-black flex font-sans">
      
      {/* 1. SIDEBAR (Persistent) */}
      <Sidebar currentOrgId={project.organizationId} showSettings={showOrgSettings} />

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 px-6 lg:px-12 py-10 overflow-y-auto">
        
        {/* Back Button (Breadcrumb style) */}
        <div className="mb-6 flex items-center gap-2">
            <Link href="/dashboard" className="p-2 -ml-2 hover:bg-gray-200 rounded-full transition-colors inline-flex">
                <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <span className="text-gray-400 font-medium">/</span>
            <span className="text-gray-500 font-medium hover:text-black transition-colors cursor-pointer">Projects</span>
        </div>

        {/* Project Header */}
        <div className="mb-10">
            <ProjectHeader 
                projectName={project.name}
                projectId={project.id}
                userRole={displayRole} // You might want to format this like the dashboard
                canInvite={showInvite}
            />
        </div>

        {/* Project Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Analytics Card */}
            <div className={`lg:col-span-2 ${cardBaseClass}`}>
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold tracking-tight">Project Analytics</h3>
                        <p className="text-gray-500 text-sm">Real-time data for {project.name}</p>
                    </div>
                </div>
                
                <div className="h-96 bg-gradient-to-b from-gray-50 to-white rounded-[20px] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-400 gap-3">
                    <BarChart3 className="w-12 h-12 opacity-20" />
                    <span className="font-medium">Analytics visualization coming soon</span>
                </div>
            </div>
            
            {/* Side Info / Debug Card */}
            <div className="flex flex-col gap-8">
                 <div className={cardBaseClass}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-gray-100 text-gray-600 rounded-xl">
                            <Users className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-lg">Team Access</h3>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                             <p className="text-xs text-gray-400 uppercase font-bold mb-1">Your Context</p>
                             <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Org Role</span>
                                <span className="font-bold">{orgRole}</span>
                             </div>
                             <div className="flex justify-between items-center text-sm mt-2">
                                <span className="text-gray-600">Project Role</span>
                                <span className="font-bold">{explicitProjectRole || 'Inherited'}</span>
                             </div>
                        </div>
                    </div>
                 </div>
            </div>
        </div>

      </main>
    </div>
  );
}