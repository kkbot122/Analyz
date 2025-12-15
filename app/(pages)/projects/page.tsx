import { getActiveOrg } from "@/lib/active-org";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { OrgSwitcher } from "@/components/OrgSwitcher";
import { CreateProjectButton } from "@/components/create-project-button";
import { canCreateProject, canManageOrganization } from "@/lib/permissions";
import { 
  BarChart3, 
  ArrowUpRight, 
  Plus, 
  Calendar, 
  Search
} from "lucide-react";

const formatRole = (role: string) => {
  switch (role) {
    case "org_owner": return "Organization Owner";
    case "org_admin": return "Admin";
    case "org_member": return "Member";
    default: return role;
  }
};

export default async function ProjectsPage() {
  const org = await getActiveOrg();

  if (!org) {
    redirect("/onboarding/create-org");
  }

  const showNewProjectBtn = canCreateProject(org.role);
  const showOrgSettings = canManageOrganization(org.role);

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-black flex font-sans">
      
      {/* 1. SIDEBAR */}
      <Sidebar currentOrgId={org.id} showSettings={showOrgSettings} />

      {/* 2. MAIN CONTENT */}
      <main className="flex-1 px-6 lg:px-12 py-10 overflow-y-auto">
        
        {/* Mobile Nav */}
        <div className="lg:hidden flex justify-between items-center mb-8">
             <Link href="/dashboard" className="font-black text-xl">Analyz</Link>
             <OrgSwitcher currentOrgId={org.id} />
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
                <h1 className="text-4xl font-medium tracking-tight leading-tight">Projects</h1>
                <p className="text-gray-500 mt-2 text-lg">
                    Manage and track all {org.projects.length} projects in {org.name}.
                </p>
            </div>
            
            <div className="flex gap-3">
                 {/* Fake Search Bar for aesthetics */}
                 <div className="hidden md:flex items-center bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-400 gap-2 w-64">
                    <Search className="w-4 h-4" />
                    <span className="text-sm">Search projects...</span>
                 </div>

                 {showNewProjectBtn && (
                    <CreateProjectButton className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-black text-white font-medium hover:bg-gray-800 transition-colors shadow-sm gap-2 whitespace-nowrap">
                        <Plus className="w-4 h-4" />
                        New Project
                    </CreateProjectButton>
                )}
            </div>
        </div>

        {/* Projects Grid */}
        {org.projects && org.projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {org.projects.map((p: any) => (
                    <Link 
                        key={p.id} 
                        href={`/projects/${p.id}`}
                        className="group bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 flex flex-col justify-between h-64"
                    >
                        {/* Top Section */}
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-105 transition-transform">
                                    <BarChart3 className="w-6 h-6" />
                                </div>
                                <span className="bg-gray-50 text-gray-500 text-xs font-bold px-3 py-1 rounded-full border border-gray-100">
                                    {formatRole(p.role)}
                                </span>
                            </div>
                            
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                                {p.name}
                            </h3>
                            <p className="text-sm text-gray-400 font-mono">
                                ID: {p.id.slice(0, 8)}...
                            </p>
                        </div>

                        {/* Bottom Section */}
                        <div className="border-t border-gray-50 pt-4 mt-4 flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>Updated recently</span>
                            </div>
                            <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 transition-colors" />
                        </div>
                    </Link>
                ))}
                
                {/* Create New "Ghost" Card */}
                {showNewProjectBtn && (
                    <CreateProjectButton className="border-2 border-dashed border-gray-200 rounded-[24px] p-6 flex flex-col items-center justify-center gap-4 text-gray-400 hover:border-gray-400 hover:text-gray-600 hover:bg-gray-50/50 transition-all h-64">
                        <div className="p-4 bg-gray-100 rounded-full">
                            <Plus className="w-8 h-8" />
                        </div>
                        <span className="font-bold text-lg">Create New Project</span>
                    </CreateProjectButton>
                )}
            </div>
        ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[30px] border border-gray-200 border-dashed">
                <div className="p-6 bg-gray-50 rounded-full mb-6">
                    <BarChart3 className="w-12 h-12 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold mb-2">No projects found</h3>
                <p className="text-gray-500 mb-8 max-w-sm text-center">
                    Get started by creating your first project to track analytics and manage data.
                </p>
                {showNewProjectBtn && (
                    <CreateProjectButton className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors inline-flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Create Project
                    </CreateProjectButton>
                )}
            </div>
        )}
      </main>
    </div>
  );
}