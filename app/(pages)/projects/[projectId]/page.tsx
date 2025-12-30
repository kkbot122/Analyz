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
import SetupGuide from "@/components/analytics/setup-guide";
import { SdkStatusWidget } from "@/components/analytics/sdk-status-widget";

interface PageProps {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ 
    range?: string; 
    retentionEvent?: string; 
    filters?: string; 
    funnel?: string; 
  }>;
}

export default async function ProjectPage({ params, searchParams }: PageProps) {
  const { projectId } = await params;
  const resolvedSearchParams = await searchParams; // ✅ Resolve params early

  // --- 1. DEMO MODE BYPASS ---
  // If accessing /project/demo, render the dashboard immediately with mock data.
  if (projectId === "demo") {
    return (
      <div className="min-h-screen bg-[#f0eeef] text-black flex font-sans">
        {/* Dummy Sidebar for Demo */}
        <Sidebar currentOrgId="demo-org" showSettings={false} />

        <main className="flex-1 px-4 lg:px-8 py-8 overflow-y-auto">
          {/* Breadcrumb (Static for Demo) */}
          <div className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-500">
             <span className="text-gray-400">Dashboard</span>
             <ChevronRight className="w-4 h-4 text-gray-400" />
             <span className="text-gray-400">Projects</span>
             <ChevronRight className="w-4 h-4 text-gray-400" />
             <span className="text-black font-bold bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
               Live Demo
             </span>
          </div>

          <div className="mb-8">
             <ProjectHeader 
                projectName="Analyz Live Demo"
                projectId="demo"
                userRole="PROJECT_OWNER"
                canInvite={false}
                orgId="demo-org"
             />
          </div>

          {/* Render Analytics View Directly */}
          <ProjectAnalyticsView 
             projectId="demo" 
             searchParams={resolvedSearchParams}
          />
        </main>
      </div>
    );
  }

  // --- 2. REAL PROJECT LOGIC (Auth & DB Checks) ---
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return redirect("/auth/login");

  // Fetch Project
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

  // Fetch Role
  const orgMembership = await prisma.membership.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: project.organizationId,
      },
    },
  });

  if (!orgMembership) return notFound();

  // Determine Access
  const explicitProjectRole = project.members[0]?.role;
  const orgRole = orgMembership.role;

  const hasAccess =
    explicitProjectRole ||
    orgRole === "ORG_OWNER" ||
    orgRole === "PROJECT_OWNER";

  if (!hasAccess) return notFound();

  // Permissions
  const displayRole = explicitProjectRole || orgRole;
  const showInvite = canInviteToProject(orgRole, explicitProjectRole);
  const showOrgSettings = canManageOrganization(orgRole);

  // Fetch Data for Setup State
  const eventsCount = await prisma.event.count({
    where: { projectId: project.id },
  });

  const showSetupGuide = eventsCount === 0;

  // Only fetch widget data if we have events
  let lastEvent = null;

  if (!showSetupGuide) {
    // Fetch last event for SDK Widget
    lastEvent = await prisma.event.findFirst({
        where: { projectId: project.id },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true, properties: true } 
    });
  }

  // --- SIDEBAR WIDGETS ---
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
            searchParams={resolvedSearchParams}
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