import { getActiveOrg } from "@/lib/active-org";
import { redirect } from "next/navigation";
import Link from "next/link";
import { OrgSwitcher } from "@/components/OrgSwitcher";
import { DashboardHeader } from "@/components/dashboard-header";
import { Sidebar } from "@/components/sidebar";
import { CreateProjectButton } from "@/components/create-project-button";
import { UserAvatar } from "@/components/user-avatar";
import { canCreateProject, canManageOrganization } from "@/lib/permissions";
import {
  BarChart3,
  ArrowUpRight,
  Plus,
  MoreHorizontal,
  User,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Direct database fetch functions
async function getTeamMembers(orgId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return [];
    }

    const memberships = await prisma.membership.findMany({
      where: {
        organizationId: orgId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    });

    return memberships.map((membership) => ({
      id: membership.user.id,
      name: membership.user.name,
      email: membership.user.email,
      image: membership.user.image,
      role: membership.role,
      joinedAt: membership.createdAt,
    }));
  } catch (error) {
    console.error("Error fetching team members:", error);
    return [];
  }
}

async function getAllProjectMembers(orgId: string) {
  try {
    const projectsWithMembers = await prisma.project.findMany({
      where: {
        organizationId: orgId,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
          take: 4,
        },
        _count: {
          select: { members: true },
        },
      },
    });

    const membersMap: Record<string, any> = {};

    projectsWithMembers.forEach((project) => {
      membersMap[project.id] = {
        projectId: project.id,
        members: project.members.map((member) => ({
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          image: member.user.image,
          role: member.role,
        })),
        totalMembers: project._count.members,
      };
    });

    return membersMap;
  } catch (error) {
    console.error("Error fetching project members:", error);
    return {};
  }
}

// Project Card Component
function ProjectCard({
  project,
  membersData,
}: {
  project: any;
  membersData: any;
}) {
  const cardClass =
    "bg-white rounded-[24px] p-6 shadow-sm border border-gray-100/50 hover:shadow-md transition-shadow duration-300";

  const members = membersData?.members || [];
  const totalMembers = membersData?.totalMembers || 0;
  const visibleMembers = members.slice(0, 4);
  const hasMoreMembers = totalMembers > 4;
  const remainingCount = totalMembers > 4 ? totalMembers - 4 : 0;

  // Safely get the year from createdAt
  const getYearFromDate = (dateString: string | Date | undefined): string => {
    if (!dateString) return new Date().getFullYear().toString();

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return new Date().getFullYear().toString();
      }
      return date.getFullYear().toString();
    } catch (error) {
      return new Date().getFullYear().toString();
    }
  };

  const year = getYearFromDate(project.createdAt);

  return (
    <div
      className={`${cardClass} flex flex-col justify-between group h-[180px]`}
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
              {year}
            </span>
            <span className="bg-green-50 text-green-600 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Active
            </span>
          </div>
          <MoreHorizontal className="w-5 h-5 text-gray-300 cursor-pointer hover:text-black" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
          {project.name || "Unnamed Project"}
        </h3>
        <p className="text-sm text-gray-400 mt-1">
          {totalMembers} member{totalMembers !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
        <div className="flex -space-x-2">
          {visibleMembers.length > 0 ? (
            <>
              {visibleMembers.map((member: any) => (
                <div key={member.id} className="relative group">
                  <UserAvatar
                    user={{
                      name: member.name,
                      email: member.email,
                      image: member.image,
                    }}
                    size="sm"
                    showTooltip={true}
                  />
                </div>
              ))}
              {hasMoreMembers && remainingCount > 0 && (
                <div
                  className="w-8 h-8 rounded-full border-2 border-white bg-black text-white flex items-center justify-center text-[10px] font-bold pl-0.5 cursor-default"
                  title={`${remainingCount} more members`}
                >
                  +{remainingCount}
                </div>
              )}
            </>
          ) : (
            // Fallback if no members
            <div className="flex items-center gap-1">
              <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">
                <User className="w-4 h-4" />
              </div>
              <span className="text-xs text-gray-400 ml-2">No members yet</span>
            </div>
          )}
        </div>
        <Link
          href={`/projects/${project.id}`}
          className="px-4 py-2 bg-black text-white text-xs font-bold rounded-full opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0"
        >
          View Project
        </Link>
      </div>
    </div>
  );
}

export default async function Dashboard() {
  const org = await getActiveOrg();
  if (!org) redirect("/onboarding/create-org");

  // Fetch ALL data in parallel
  const [teamMembers, projectMembersMap] = await Promise.all([
    getTeamMembers(org.id),
    getAllProjectMembers(org.id),
  ]);

  const visibleTeamMembers = teamMembers.slice(0, 5);
  const hasMoreTeamMembers = teamMembers.length > 5;
  const remainingTeamCount = teamMembers.length - 5;

  const showNewProjectBtn = canCreateProject(org.role);
  const showOrgSettings = canManageOrganization(org.role);

  // The specific "soft card" style from the image
  const cardClass =
    "bg-white rounded-[24px] p-6 shadow-sm border border-gray-100/50 hover:shadow-md transition-shadow duration-300";

  // Get full project objects from active-org
  const visibleProjects = org.projects?.slice(0, 4) || [];

  // Helper to get role display name
  function getRoleDisplayName(role: string): string {
    switch (role) {
      case "ORG_OWNER":
        return "Owner";
      case "PROJECT_OWNER":
        return "Project Owner";
      case "TEAM_MEMBER":
        return "Member";
      default:
        return role;
    }
  }

  return (
    <div className="min-h-screen bg-[#f0eeef] text-black flex font-sans selection:bg-black selection:text-white">
      {/* Sidebar is fixed height, handles its own sticky state */}
      <Sidebar currentOrgId={org.id} showSettings={showOrgSettings} />

      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
        {/* Mobile Header */}
        <div className="lg:hidden flex justify-between items-center mb-6">
          <Link href="/dashboard" className="font-black text-xl">
            Analyz
          </Link>
          <OrgSwitcher currentOrgId={org.id} />
        </div>

        <DashboardHeader
          orgName={org.name}
          userRole={org.role}
          canCreateProject={showNewProjectBtn}
          canInvite={canManageOrganization(org.role)}
        />

        {/* BENTO GRID LAYOUT */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* LEFT COLUMN (Main Content) - Spans 8 cols on large screens */}
          <div className="xl:col-span-8 flex flex-col gap-6">
            {/* Section Title */}
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-bold text-gray-900">
                Projects Overview
              </h2>
              <button className="text-sm font-medium text-gray-500 hover:text-black transition-colors flex items-center gap-1">
                All Departments <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {/* Projects Grid with Real Members from Batch Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {visibleProjects.length > 0 ? (
                visibleProjects.map((project: any) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    membersData={projectMembersMap[project.id]}
                  />
                ))
              ) : (
                <div
                  className={`${cardClass} col-span-2 border-dashed flex flex-col items-center justify-center py-12 text-center`}
                >
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Plus className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-900 font-bold">No projects found</p>
                  <p className="text-gray-500 text-sm mb-4">
                    Create your first project to get started
                  </p>
                  {showNewProjectBtn && (
                    <CreateProjectButton className="text-black underline text-sm font-bold">
                      Create now
                    </CreateProjectButton>
                  )}
                </div>
              )}
            </div>

            {/* Analytics Overview Section */}
            <div>
              <div className="flex items-center justify-between px-2 mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Analytics Overview
                </h2>
                <div className="flex gap-2">
                  <button className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-gray-400 hover:text-black hover:shadow-sm transition-all">
                    <Plus className="w-5 h-5" />
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-gray-400 hover:text-black hover:shadow-sm transition-all">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className={`${cardClass} min-h-[300px]`}>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">
                      Total Views
                    </p>
                    <h3 className="text-2xl font-black">0</h3>
                  </div>
                </div>

                {/* Graph Placeholder */}
                <div className="w-full h-48 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-gray-400 gap-2">
                  <BarChart3 className="w-5 h-5 opacity-50" />
                  <span className="text-sm font-medium">
                    Data visualization requires active projects
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (Widgets) - Spans 4 cols on large screens */}
          <div className="xl:col-span-4 flex flex-col gap-6">
            {/* Assigned Team Widget */}
            <div className={`${cardClass} flex flex-col`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-gray-900">Team Members</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {teamMembers.length} member
                    {teamMembers.length !== 1 ? "s" : ""} in your organization
                  </p>
                </div>
                <Link
                  href={`/org/${org.id}/team`}
                  className="text-gray-400 hover:text-black transition-colors"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Team Member Avatars */}
              <div className="flex items-center -space-x-3 mb-6">
                {visibleTeamMembers.map((member: any) => (
                  <div
                    key={member.id}
                    className="relative group"
                    title={`${
                      member.name || member.email
                    } (${getRoleDisplayName(member.role)})`}
                  >
                    <UserAvatar
                      user={{
                        name: member.name,
                        email: member.email,
                        image: member.image,
                      }}
                      size="md"
                      showTooltip={true}
                    />
                  </div>
                ))}
                {hasMoreTeamMembers && (
                  <Link
                    href={`/org/${org.id}/team`}
                    className="w-10 h-10 rounded-full border-[3px] border-white bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold pl-0.5 hover:bg-orange-200 transition-colors cursor-pointer"
                    title={`${remainingTeamCount} more members`}
                  >
                    +{remainingTeamCount}
                  </Link>
                )}
              </div>

              {/* Team Members List (Optional - shows first 3) */}
              {teamMembers.length > 0 && (
                <div className="space-y-3 mb-6">
                  {teamMembers.slice(0, 3).map((member: any) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <UserAvatar
                        user={{
                          name: member.name,
                          email: member.email,
                          image: member.image,
                        }}
                        size="sm"
                        showTooltip={false}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {member.name || member.email}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {getRoleDisplayName(member.role)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-auto pt-4 border-t border-gray-50">
                <Link
                  href={`/org/${org.id}/team`}
                  className="block w-full py-3 rounded-xl bg-gray-50 text-xs font-bold text-gray-600 hover:bg-[#d9623b] hover:text-white transition-colors text-center"
                >
                  Manage Team
                </Link>
              </div>
            </div>

            {/* Quick Actions Widget */}
            <div className={`${cardClass}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Quick Actions</h3>
                <button className="text-xs font-bold bg-gray-100 px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors">
                  + Add
                </button>
              </div>

              <div className="space-y-2">
                {[
                  "Check API Status",
                  "Download Reports",
                  "Billing Settings",
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 group cursor-pointer border border-transparent hover:border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-black"></div>
                      <span className="text-xs font-bold text-gray-500 group-hover:text-black">
                        {item}
                      </span>
                    </div>
                    <MoreHorizontal className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}