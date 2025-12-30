import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import {
  ChevronRight,
  Shield,
  Copy,
  Terminal,
  Building2,
  UserCircle,
} from "lucide-react";
import Link from "next/link";
import { ProjectHeader } from "@/components/project-header";
import { Sidebar } from "@/components/sidebar";
import { canInviteToProject, canManageOrganization } from "@/lib/permissions";
import ProjectAnalyticsView from "@/components/analytics/project-analytics-view";
// 1. Import Setup Guide
import SetupGuide from "@/components/analytics/setup-guide";
import { SdkStatusWidget } from "@/components/analytics/sdk-status-widget"; // Assuming you kept this from prev step

interface PageProps {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ range?: string; retentionEvent?: string }>;
}

export default async function ProjectPage({ params, searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return redirect("/auth/login");

  const { projectId } = await params;

  // 1. Fetch Project
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

  // 2. Fetch Role
  const orgMembership = await prisma.membership.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: project.organizationId,
      },
    },
  });

  if (!orgMembership) return notFound();

  // 3. Determine Access
  const explicitProjectRole = project.members[0]?.role;
  const orgRole = orgMembership.role;

  const hasAccess =
    explicitProjectRole ||
    orgRole === "ORG_OWNER" ||
    orgRole === "PROJECT_OWNER";

  if (!hasAccess) return notFound();

  // 4. Permissions
  const displayRole = explicitProjectRole || orgRole;
  const showInvite = canInviteToProject(orgRole, explicitProjectRole);
  const showOrgSettings = canManageOrganization(orgRole);

  // 5. Fetch Data
  const eventsCount = await prisma.event.count({
    where: { projectId: project.id },
  });

  // --- LOGIC: NEW PROJECT DETECTION ---
  // If the project has 0 events, we treat it as "Just Created" or "Needs Setup"
  const showSetupGuide = eventsCount === 0;

  // Only fetch analytical data if we have events (optimization)
  let resolvedParams = await searchParams;
  let activeUsersCount = 0;
  let lastEvent = null;

  if (!showSetupGuide) {
    const activeUsersGroup = await prisma.event.groupBy({
      by: ["userId"],
      where: {
        projectId: project.id,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });
    activeUsersCount = activeUsersGroup.length;
    
    // Fetch last event for SDK Widget
    lastEvent = await prisma.event.findFirst({
        where: { projectId: project.id },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true, properties: true } 
    });
  }

  const ApiKeyWidget = (
    <div className="bg-[#111] text-gray-300 rounded-[24px] p-6 shadow-xl shadow-gray-200/50 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Terminal className="w-5 h-5 text-orange-500" />
        <h3 className="font-bold text-white text-sm">Project API Key</h3>
      </div>
      <p className="text-xs text-gray-500 mb-4 leading-relaxed">
        Keep this public. Used for SDK init.
      </p>
      <div className="group relative">
        <div className="bg-[#222] border border-[#333] rounded-xl p-4 font-mono text-xs break-all text-gray-300 select-all">
          {project.id}
        </div>
        <button className="absolute top-2 right-2 p-2 bg-[#333] rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#444]">
          <Copy className="w-3 h-3" />
        </button>
      </div>
    </div>
  );

  const SdkWidget = !showSetupGuide ? <SdkStatusWidget lastEvent={lastEvent} /> : null;

  return (
    <div className="min-h-screen bg-[#f0eeef] text-black flex font-sans">
      <Sidebar
        currentOrgId={project.organizationId}
        showSettings={showOrgSettings}
      />

      <main className="flex-1 px-4 lg:px-8 py-8 overflow-y-auto" suppressHydrationWarning={false}>
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-500">
          <Link href="/dashboard" className="hover:text-black transition-colors">Dashboard</Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Link href="/projects" className="hover:text-black transition-colors">Projects</Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-black font-bold bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
            {project.name}
          </span>
        </div>

        <div className="mb-8">
          <ProjectHeader
            projectName={project.name}
            projectId={project.id}
            userRole={displayRole}
            canInvite={showInvite}
            orgId={project.organizationId}
          />
        </div>

        {/* --- CONDITIONAL RENDERING: Setup vs Dashboard --- */}
        {showSetupGuide ? (
          <SetupGuide projectId={project.id} />
        ) : (
          <ProjectAnalyticsView
            projectId={project.id}
            searchParams={resolvedParams}
            sideWidgets={
              <>
                {SdkWidget}
                {ApiKeyWidget}
              </>
            }
          />
        )}
      </main>
    </div>
  );
}