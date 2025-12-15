import { getActiveOrg } from "@/lib/active-org";
import { redirect } from "next/navigation";
import Link from "next/link";
import { OrgSwitcher } from "@/components/OrgSwitcher";
import { DashboardHeader } from "@/components/dashboard-header";
import { Sidebar } from "@/components/sidebar";
import { CreateProjectButton } from "@/components/create-project-button";
import {
  canCreateProject,
  canManageOrganization,
  canInviteMembers,
} from "@/lib/permissions";
import {
  BarChart3,
  Settings,
  Users,
  ShieldAlert,
  ArrowUpRight,
  Plus,
  ArrowRight,
} from "lucide-react";


export default async function Dashboard() {
  const org = await getActiveOrg();
  if (!org) redirect("/onboarding/create-org");

  const showNewProjectBtn = canCreateProject(org.role);
  const showOrgSettings = canManageOrganization(org.role);
  const cardBaseClass =
    "bg-white rounded-[30px] p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-50/50";

  // Limit projects for dashboard view
  const visibleProjects = org.projects.slice(0, 3);
  const hasMoreProjects = org.projects.length > 3;

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-black flex font-sans">
      <Sidebar currentOrgId={org.id} showSettings={showOrgSettings} />

      <main className="flex-1 px-6 lg:px-12 py-10 overflow-y-auto">
        <div className="lg:hidden flex justify-between items-center mb-8">
          <Link href="/dashboard" className="font-black text-xl">
            Analyz
          </Link>
          <OrgSwitcher currentOrgId={org.id} />
        </div>

        <div className="mb-10">
          <DashboardHeader
            orgName={org.name}
            userRole={org.role}
            canCreateProject={showNewProjectBtn}
            canInvite={canInviteMembers(org.role)}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Active Projects Card */}
            <div className={cardBaseClass}>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold tracking-tight">
                  Active Projects
                </h3>
                {showNewProjectBtn && (
                  <CreateProjectButton className="flex items-center gap-2 text-sm font-bold bg-black text-white px-5 py-2.5 rounded-full hover:bg-gray-800 transition-colors">
                    <Plus className="w-4 h-4" />
                    Create
                  </CreateProjectButton>
                )}
              </div>

              {org.projects && org.projects.length > 0 ? (
                <div className="flex flex-col gap-3">
                  <ul className="space-y-3">
                    {visibleProjects.map((p: any) => (
                      <li key={p.id}>
                        <Link
                          href={`/projects/${p.id}`}
                          className="group flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                              <BarChart3 className="w-6 h-6" />
                            </div>
                            <div>
                              <span className="block font-bold text-lg text-gray-900 group-hover:text-black">
                                {p.name}
                              </span>
                              <span className="text-sm text-gray-500">
                                Updated recently
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-bold capitalize bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full">
                              {(p.role)}
                            </span>
                            <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-black" />
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>

                  {/* "View All" Link Logic */}
                  {hasMoreProjects && (
                    <Link
                      href="/projects"
                      className="mt-2 flex items-center justify-center gap-2 text-sm font-bold text-gray-500 hover:text-black py-3 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      View all {org.projects.length} projects
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-gray-500 font-medium mb-4">
                    No active projects yet.
                  </p>
                  {showNewProjectBtn && (
                    <CreateProjectButton className="text-sm font-bold text-black hover:underline inline-flex items-center gap-1">
                      Create first project <ArrowUpRight className="w-4 h-4" />
                    </CreateProjectButton>
                  )}
                </div>
              )}
            </div>

            {/* Analytics Card */}
            <div className={cardBaseClass}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 text-[#ea582c] rounded-xl">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight">
                      Overview stats
                    </h3>
                    <p className="text-gray-500 text-sm">All time analytics</p>
                  </div>
                </div>
              </div>
              <div className="h-64 bg-gradient-to-b from-gray-50 to-white rounded-[20px] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-400 gap-3">
                <BarChart3 className="w-10 h-10 opacity-30" />
                <span className="font-medium">No data available yet</span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-8">
            {showOrgSettings ? (
              <div className={cardBaseClass}>
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-gray-100 text-gray-700 rounded-xl inline-block">
                    <Settings className="w-6 h-6" />
                  </div>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                    Active
                  </span>
                </div>
                <h3 className="text-3xl font-black tracking-tight mb-2">
                  Settings
                </h3>
                <p className="text-gray-500 font-medium mb-8">
                  Manage organization, billing, and team members.
                </p>
                <button className="w-full text-center font-bold bg-black text-white px-6 py-3.5 rounded-full hover:bg-gray-800 transition-colors">
                  Manage Organization
                </button>
              </div>
            ) : (
              <div className={cardBaseClass}>
                {/* Read Only Card Logic ... */}
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-red-50 text-red-500 rounded-xl inline-block">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <span className="bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-full">
                    Limited
                  </span>
                </div>
                <h3 className="text-2xl font-black tracking-tight mb-2 text-gray-800">
                  Read Only
                </h3>
                <p className="text-gray-500 font-medium mb-6">
                  Contact your Organization Owner if you need elevated
                  permissions.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
