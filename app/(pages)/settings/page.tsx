import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { getActiveOrg } from "@/lib/active-org";
import { prisma } from "@/lib/prisma"; // Import Prisma
import { redirect } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { OrgSwitcher } from "@/components/OrgSwitcher";
import { canManageOrganization } from "@/lib/permissions";
import { DeleteItemButton, DeleteAccountButton } from "@/components/settings-button";
import { 
  User, 
  Mail, 
  Shield, 
  Briefcase,
  Users
} from "lucide-react";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return redirect("/auth/login");

  // 1. Get the Active Org ID from your helper
  const baseOrg = await getActiveOrg();
  if (!baseOrg) redirect("/dashboard");

  // 2. FETCH FULL DATA: Re-fetch the org to include 'members' and 'user' details
  const fullOrg = await prisma.organization.findUnique({
    where: { id: baseOrg.id },
    include: {
      projects: true,
      members: {
        include: {
          user: true, // Needed to get member names/emails
        },
      },
    },
  });

  if (!fullOrg) return redirect("/dashboard");

  // 3. Permissions Check (Use the role from the helper which is context-aware)
  const isOwner = canManageOrganization(baseOrg.role);

  // Styling constant
  const cardClass = "bg-white rounded-[24px] p-8 shadow-sm border border-gray-100";
  const sectionTitle = "text-xl font-bold tracking-tight mb-4 flex items-center gap-2";

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-black flex font-sans">
      
      {/* Sidebar */}
      <Sidebar currentOrgId={fullOrg.id} showSettings={isOwner} />

      <main className="flex-1 px-6 lg:px-12 py-10 overflow-y-auto">
        
        {/* Mobile Nav */}
        <div className="lg:hidden flex justify-between items-center mb-8">
             <Link href="/dashboard" className="font-black text-xl">Analyz</Link>
             <OrgSwitcher currentOrgId={fullOrg.id} />
        </div>

        <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-medium tracking-tight mb-2">Settings</h1>
            <p className="text-gray-500 mb-10 text-lg">Manage your profile and organization preferences.</p>

            <div className="space-y-8">

                {/* --- SECTION 1: MY PROFILE (Visible to Everyone) --- */}
                <div className={cardClass}>
                    <h2 className={sectionTitle}>
                        <User className="w-5 h-5 text-gray-400" />
                        My Profile
                    </h2>
                    <div className="flex items-start md:items-center gap-6 flex-col md:flex-row">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-2xl font-bold text-gray-400">
                            {session.user.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div className="flex-1 space-y-1">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
                                    <div className="font-medium text-lg">{session.user.name}</div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Email Address</label>
                                    <div className="font-medium text-lg flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        {session.user.email}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                {/* --- SECTION 2: ORGANIZATION MANAGEMENT (Owner Only) --- */}
                {isOwner && (
                    <>
                        {/* Manage Members */}
                        <div className={cardClass}>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className={sectionTitle}>
                                    <Users className="w-5 h-5 text-gray-400" />
                                    Team Members
                                </h2>
                                <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-500">
                                    {fullOrg.members.length} Members
                                </span>
                            </div>
                            
                            <div className="divide-y divide-gray-50">
                                {fullOrg.members.map((member) => (
                                    <div key={member.id} className="py-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">
                                                {member.user.name?.[0] || "?"}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm text-gray-900">{member.user.name}</p>
                                                <p className="text-xs text-gray-500">{member.user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs font-bold capitalize bg-gray-50 px-3 py-1 rounded-full text-gray-500">
                                                {member.role.replace("org_", "")}
                                            </span>
                                            
                                            {/* Delete Button: Can't delete yourself */}
                                            {member.userId !== session.user.id && (
                                                <DeleteItemButton 
                                                    id={member.id} 
                                                    type="member" 
                                                    name={member.user.name || "Member"} 
                                                />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Manage Projects */}
                        <div className={cardClass}>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className={sectionTitle}>
                                    <Briefcase className="w-5 h-5 text-gray-400" />
                                    Projects Management
                                </h2>
                                <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-500">
                                    {fullOrg.projects.length} Projects
                                </span>
                            </div>

                            {fullOrg.projects.length > 0 ? (
                                <div className="grid gap-3">
                                    {fullOrg.projects.map((proj) => (
                                        <div key={proj.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-transparent hover:border-gray-200 transition-colors">
                                            <div>
                                                <h4 className="font-bold text-gray-900">{proj.name}</h4>
                                                <p className="text-xs text-gray-500 font-mono">ID: {proj.id.slice(0, 8)}...</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {/* Owner can delete ANY project */}
                                                <DeleteItemButton 
                                                    id={proj.id} 
                                                    type="project" 
                                                    name={proj.name} 
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400 text-sm">
                                    No projects created yet.
                                </div>
                            )}
                        </div>
                    </>
                )}


                {/* --- SECTION 3: DANGER ZONE (Visible to Everyone) --- */}
                <div className="border border-red-100 bg-red-50/30 rounded-[24px] p-8">
                    <h2 className="text-xl font-bold tracking-tight mb-2 text-red-900 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Danger Zone
                    </h2>
                    <p className="text-red-700/70 mb-6 text-sm">
                        These actions are irreversible. Please be certain.
                    </p>
                    
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-red-100">
                            <div>
                                <h4 className="font-bold text-gray-900">Delete Personal Account</h4>
                                <p className="text-xs text-gray-500">
                                    Permanently remove your account and remove you from all organizations.
                                </p>
                            </div>
                            <DeleteAccountButton />
                        </div>
                    </div>
                </div>

            </div>
        </div>
      </main>
    </div>
  );
}