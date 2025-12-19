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
  Search,
  MoreHorizontal,
  FolderDot
} from "lucide-react";

// Helper to style roles
const RoleBadge = ({ role }: { role: string }) => {
  let label = role;
  let colorClass = "bg-gray-100 text-gray-600";

  if (role === 'org_owner') {
    label = "Owner";
    colorClass = "bg-black text-white";
  } else if (role === 'org_admin') {
    label = "Admin";
    colorClass = "bg-purple-100 text-purple-700";
  } else {
    label = "Member";
  }

  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${colorClass}`}>
      {label}
    </span>
  );
};

export default async function ProjectsPage() {
  const org = await getActiveOrg();

  if (!org) {
    redirect("/onboarding/create-org");
  }

  const showNewProjectBtn = canCreateProject(org.role);
  const showOrgSettings = canManageOrganization(org.role);

  return (
    <div className="min-h-screen bg-[#f0eeef] text-black flex font-sans">
      
      {/* 1. SIDEBAR */}
      <Sidebar currentOrgId={org.id} showSettings={showOrgSettings} />

      {/* 2. MAIN CONTENT */}
      <main className="flex-1 px-4 lg:px-8 py-8 overflow-y-auto">
        
        {/* Mobile Nav */}
        <div className="lg:hidden flex justify-between items-center mb-8">
             <Link href="/dashboard" className="font-black text-xl">Analyz</Link>
             <OrgSwitcher currentOrgId={org.id} />
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
           <div>
               <h1 className="text-3xl font-bold tracking-tight text-gray-900">Projects</h1>
               <p className="text-gray-500 mt-1 font-medium">
                   Manage your organization's workspaces.
               </p>
           </div>
           
           <div className="flex items-center gap-3">
               {/* Search Bar */}
               <div className="hidden md:flex items-center bg-white border border-gray-200 shadow-sm rounded-full px-4 py-2.5 text-gray-400 gap-2 w-64 focus-within:ring-2 focus-within:ring-black focus-within:border-transparent transition-all">
                  <Search className="w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    className="bg-transparent border-none outline-none text-sm text-black placeholder:text-gray-400 w-full"
                  />
               </div>

               {showNewProjectBtn && (
                  <CreateProjectButton className="flex items-center gap-2 px-6 py-2.5 bg-[#d9623b] text-white rounded-full text-sm font-bold shadow-lg shadow-black/10 hover:bg-[#ed6c42] transition-all hover:scale-[1.02]">
                      <Plus className="w-4 h-4" />
                      Create
                  </CreateProjectButton>
               )}
           </div>
        </div>

        {/* Projects Grid */}
        {org.projects && org.projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                
                {/* MAP PROJECTS */}
                {org.projects.map((p: any) => (
                    <Link 
                        key={p.id} 
                        href={`/projects/${p.id}`}
                        className="group relative bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-[280px] overflow-hidden"
                    >
                        {/* Top Section */}
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-900 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                    <FolderDot className="w-5 h-5" />
                                </div>
                                <RoleBadge role={p.role} />
                            </div>
                            
                            <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">
                                {p.name}
                            </h3>
                            <p className="text-sm text-gray-400 font-medium">
                                Last updated 2h ago
                            </p>
                        </div>

                        {/* Bottom Section: Avatars & Action */}
                        <div className="relative z-10 mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                            
                            {/* Fake Avatar Pile */}
                            <div className="flex items-center -space-x-2">
                                {[1,2,3].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                        U{i}
                                    </div>
                                ))}
                                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-400">
                                    +
                                </div>
                            </div>

                            {/* View Button - visible on group hover */}
                            <div className="bg-black text-white rounded-full px-4 py-2 text-xs font-bold flex items-center gap-1 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                View <ArrowUpRight className="w-3 h-3" />
                            </div>
                        </div>

                        {/* Hover Gradient Background Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </Link>
                ))}
                
                {/* Create New "Ghost" Card */}
                {showNewProjectBtn && (
                    <CreateProjectButton className="h-[280px] border-2 border-dashed border-gray-200 rounded-[24px] flex flex-col items-center justify-center gap-4 text-gray-400 hover:border-black/20 hover:bg-gray-50 transition-all group cursor-pointer">
                        <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Plus className="w-6 h-6 text-gray-400 group-hover:text-black" />
                        </div>
                        <div className="text-center">
                            <span className="block font-bold text-gray-900">Create Project</span>
                            <span className="text-xs text-gray-400">Add a new workspace</span>
                        </div>
                    </CreateProjectButton>
                )}
            </div>
        ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[32px] border border-gray-100 shadow-sm text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 rotate-3">
                    <FolderDot className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
                    Create your first project to start tracking analytics and managing your organization's data.
                </p>
                {showNewProjectBtn && (
                    <CreateProjectButton className="bg-black text-white px-8 py-3.5 rounded-full font-bold hover:bg-gray-800 transition-all hover:shadow-lg inline-flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Create First Project
                    </CreateProjectButton>
                )}
            </div>
        )}
      </main>
    </div>
  );
}