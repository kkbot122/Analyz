import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Activity, Users, Globe, Shield, Key } from "lucide-react"; // Added Shield and Key icons
import Link from "next/link";
import { ProjectHeader } from "@/components/project-header";
import { Sidebar } from "@/components/sidebar";
import { canInviteToProject, canManageOrganization } from "@/lib/permissions";
import ProjectAnalyticsView from "@/components/analytics/project-analytics-view";

interface PageProps {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ range?: string; retentionEvent?: string }>;
}

export default async function ProjectPage({ params, searchParams }: PageProps) {
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

  if (!orgMembership) return notFound();

  // 3. DETERMINE EFFECTIVE ROLE
  const explicitProjectRole = project.members[0]?.role;
  const orgRole = orgMembership.role;

  const hasAccess =
    explicitProjectRole ||
    orgRole === "ORG_OWNER" ||
    orgRole === "PROJECT_OWNER";

  if (!hasAccess) return notFound();

  // 4. Calculate Permissions for UI
  const displayRole = explicitProjectRole || orgRole;
  const showInvite = canInviteToProject(orgRole, explicitProjectRole);
  const showOrgSettings = canManageOrganization(orgRole);

  // 5. FETCH ANALYTICS DATA (Real DB Queries)

  // A. Total Events Count
  const eventsCount = await prisma.event.count({
    where: { projectId: project.id },
  });

  // B. Active Users (Last 24h)
  const activeUsersGroup = await prisma.event.groupBy({
    by: ["userId"],
    where: {
      projectId: project.id,
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  });
  const activeUsersCount = activeUsersGroup.length;

  // Styling constant - The "Bento Tile" style
  const cardBaseClass =
    "bg-white rounded-[30px] p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col justify-center h-full";

  const resolvedParams = await searchParams;

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-black flex font-sans">
      {/* 1. SIDEBAR */}
      <Sidebar
        currentOrgId={project.organizationId}
        showSettings={showOrgSettings}
      />

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 px-4 lg:px-8 py-8 overflow-y-auto">
        {/* Navigation & Header Block */}
        <div className="mb-8">
          <div className="mb-6 flex items-center gap-2">
            <Link
              href="/dashboard"
              className="p-2 -ml-2 hover:bg-gray-200 rounded-full transition-colors inline-flex"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <span className="text-gray-400 font-medium">/</span>
            <span className="text-gray-500 font-medium hover:text-black transition-colors cursor-pointer">
              Projects
            </span>
          </div>

          <ProjectHeader
            projectName={project.name}
            projectId={project.id}
            userRole={displayRole}
            canInvite={showInvite}
          />
        </div>

        {/* --- BENTO GRID LAYOUT --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6">
          {/* Row 1: High Level Metrics (3 cards) */}
          <div className="xl:col-span-4">
            <div className={cardBaseClass}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-500 text-sm font-medium">
                  Total Events
                </p>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <h4 className="text-3xl font-black">
                {eventsCount.toLocaleString()}
              </h4>
            </div>
          </div>

          <div className="xl:col-span-4">
            <div className={cardBaseClass}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-500 text-sm font-medium">
                  Active Users (24h)
                </p>
                <div className="p-2 bg-green-50 text-green-600 rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <h4 className="text-3xl font-black">
                {activeUsersCount.toLocaleString()}
              </h4>
            </div>
          </div>

          <div className="xl:col-span-4">
            <div className={cardBaseClass}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-500 text-sm font-medium">API Status</p>
                <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
                  <Globe className="w-5 h-5" />
                </div>
              </div>
              <h4 className="text-3xl font-semibold text-green-600">Online</h4>
            </div>
          </div>

          {/* Row 2: Main Content Split */}

          {/* LEFT: Project Analytics (Takes up 8 columns) */}
          <div className="xl:col-span-8 flex flex-col gap-6">
            <div className="bg-white rounded-[30px] p-8 shadow-sm border border-gray-100 min-h-[500px]">
              <ProjectAnalyticsView
                projectId={project.id}
                searchParams={resolvedParams}
              />
            </div>
          </div>

          {/* RIGHT: Context & Info (Takes up 4 columns - Stacked Tiles) */}
          <div className="xl:col-span-4 flex flex-col gap-6">
            <div className="flex flex-col gap-8">
              <div className={cardBaseClass}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gray-100 text-gray-600 rounded-xl">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg">Details</h3>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">
                      Your Context
                    </p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Org Role</span>
                      <span className="font-bold">{orgRole}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-2">
                      <span className="text-gray-600">Project Role</span>
                      <span className="font-bold">
                        {explicitProjectRole || "Inherited"}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">
                      Project ID (API Key)
                    </p>
                    <code className="block bg-white p-2 rounded border border-gray-200 text-xs font-mono break-all mt-1 select-all">
                      {project.id}
                    </code>
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
