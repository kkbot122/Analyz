import { getActiveOrg } from "@/lib/active-org";
import { redirect } from "next/navigation";
import Link from "next/link";
import { OrgSwitcher } from "@/components/OrgSwitcher";
import { SignOutButton } from "@/components/sign-out-button";
import { DashboardHeader } from "@/components/dashboard-header";
// 1. Import permissions
import { canCreateProject, canManageOrganization, canInviteMembers } from "@/lib/permissions";
import { 
  BarChart3, 
  Settings, 
  Users,
  ShieldAlert
} from "lucide-react";

export default async function Dashboard() {
  const org = await getActiveOrg();

  if (!org) {
    redirect("/onboarding/create-org");
  }

  // 2. Check Permissions for the current active Org
  const showNewProjectBtn = canCreateProject(org.role);
  const showOrgSettings = canManageOrganization(org.role);

  return (
    <div className="min-h-screen bg-white text-black selection:bg-orange-200">
      
      {/* Navbar (Same as before) */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0 flex items-center gap-8">
              <Link href="/dashboard" className="text-2xl font-black tracking-tight">
                Analyz
              </Link>
            </div>
            <div className="flex items-center gap-4">
               <OrgSwitcher currentOrgId={org.id} />
               <div className="h-6 w-px bg-gray-200 hidden md:block"></div>
               <SignOutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header Section */}
        <DashboardHeader 
          orgName={org.name}
          userRole={org.role}
          canCreateProject={canCreateProject(org.role)}
          canInvite={canInviteMembers(org.role)} // Pass this permission
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            
            {/* Projects Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <BarChart3 className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-lg">Projects</h3>
                    </div>
                </div>

                {org.projects && org.projects.length > 0 ? (
                    <ul className="space-y-2">
                        {org.projects.map((p: any) => (
                            <li key={p.id}>
                                <Link 
                                  href={`/projects/${p.id}`}
                                  className="flex items-center justify-between group p-2 hover:bg-gray-50 rounded-lg -mx-2 transition-colors"
                                >
                                    <span className="font-medium text-gray-700 group-hover:text-black">{p.name}</span>
                                    {/* Show Project Role */}
                                    <span className="text-xs text-gray-400 capitalize bg-white border border-gray-100 px-2 py-0.5 rounded shadow-sm">
                                        {p.role.toLowerCase()}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-400 text-sm mb-4">No active projects.</p>
                        {showNewProjectBtn && (
                            <Link href="/projects/new" className="text-sm font-medium text-[#ea582c] hover:underline">
                                Create your first project &rarr;
                            </Link>
                        )}
                    </div>
                )}
            </div>

            {/* 4. Conditionally Render Settings Card */}
            {showOrgSettings ? (
                 <div className="bg-gray-50 border border-transparent rounded-2xl p-6 flex flex-col justify-center items-center text-center">
                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                        <Settings className="w-5 h-5 text-gray-600" />
                    </div>
                    <h3 className="font-medium mb-1">Organization Settings</h3>
                    <p className="text-sm text-gray-500 mb-4">Manage members, billing, and roles</p>
                    <button className="text-sm font-medium border border-gray-200 bg-white px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                        Manage Settings
                    </button>
                </div>
            ) : (
                /* Alternate Card for Non-Owners */
                <div className="bg-gray-50 border border-transparent rounded-2xl p-6 flex flex-col justify-center items-center text-center">
                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                        <ShieldAlert className="w-5 h-5 text-gray-400" />
                    </div>
                    <h3 className="font-medium mb-1 text-gray-500">Read Only Access</h3>
                    <p className="text-sm text-gray-400">
                        Contact your Organization Owner to change settings.
                    </p>
                </div>
            )}

            {/* Analytics Card (Visible to everyone) */}
             <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm col-span-1 lg:col-span-3 xl:col-span-1">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-orange-50 text-[#ea582c] rounded-lg">
                        <Users className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-lg">Analytics</h3>
                </div>
                <div className="h-40 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 gap-2">
                    <BarChart3 className="w-8 h-8 opacity-20" />
                    <span className="text-sm">No data available</span>
                </div>
            </div>

        </div>
      </main>
    </div>
  );
}