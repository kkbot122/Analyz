import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { getActiveOrg } from "@/lib/active-org";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { OrgSwitcher } from "@/components/OrgSwitcher";
import { canManageOrganization } from "@/lib/permissions";
import { DeleteItemButton, DeleteAccountButton } from "@/components/settings-button";
import { 
  User, 
  Mail, 
  ShieldAlert, 
  Briefcase,
  Users,
  Settings as SettingsIcon,
  CreditCard,
  BadgeCheck
} from "lucide-react";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return redirect("/auth/login");

  // 1. Get the Active Org
  const baseOrg = await getActiveOrg();
  if (!baseOrg) redirect("/dashboard");

  // 2. FETCH FULL DATA
  const fullOrg = await prisma.organization.findUnique({
    where: { id: baseOrg.id },
    include: {
      projects: true,
      members: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!fullOrg) return redirect("/dashboard");

  // 3. Permissions Check
  const isOwner = canManageOrganization(baseOrg.role);

  // Styling Constants
  const cardBase = "bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden";
  const headerClass = "px-6 py-5 border-b border-gray-50 flex items-center justify-between bg-white";

  return (
    <div className="min-h-screen bg-[#f0eeef] text-black flex font-sans">
      
      {/* Sidebar */}
      <Sidebar currentOrgId={fullOrg.id} showSettings={isOwner} />

      <main className="flex-1 px-4 lg:px-8 py-8 overflow-y-auto">
        
        {/* Mobile Nav */}
        <div className="lg:hidden flex justify-between items-center mb-8">
             <Link href="/dashboard" className="font-black text-xl">Analyz</Link>
             <OrgSwitcher currentOrgId={fullOrg.id} />
        </div>

        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-900 shadow-sm border border-gray-100">
                <SettingsIcon className="w-6 h-6" />
            </div>
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
                <p className="text-gray-500 font-medium">
                    Manage your profile and {fullOrg.name} preferences.
                </p>
            </div>
        </div>

        {/* BENTO GRID LAYOUT */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 max-w-7xl">

            {/* --- LEFT COLUMN (2/3 width) --- */}
            <div className="xl:col-span-2 space-y-6">
                
                {/* 1. PROFILE CARD */}
                <div className={`${cardBase} p-8 relative overflow-hidden`}>
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-24 h-24 bg-gray-900 rounded-[20px] flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-gray-200">
                            {session.user.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        
                        <div className="flex-1 w-full">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
                                <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                    <BadgeCheck className="w-3 h-3" /> Verified
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Full Name</label>
                                    <div className="font-bold text-gray-900">{session.user.name}</div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Email Address</label>
                                    <div className="font-bold text-gray-900 flex items-center gap-2 truncate">
                                        <Mail className="w-3 h-3 text-gray-400" />
                                        {session.user.email}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. TEAM MANAGEMENT (Owner Only) */}
                {isOwner && (
                    <div className={cardBase}>
                        <div className={headerClass}>
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Users className="w-5 h-5 text-gray-400" />
                                Team Members
                            </h3>
                            <button className="text-xs font-bold bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors">
                                + Invite
                            </button>
                        </div>
                        
                        <div className="p-2">
                            {fullOrg.members.map((member) => (
                                <div key={member.id} className="group flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-all duration-200">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 flex items-center justify-center font-bold shadow-sm">
                                            {member.user.name?.[0] || "?"}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{member.user.name}</p>
                                            <p className="text-xs text-gray-500 font-medium">{member.user.email}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                        <span className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-full ${
                                            member.role.includes('owner') 
                                            ? 'bg-black text-white' 
                                            : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            {member.role.replace("org_", "")}
                                        </span>
                                        
                                        {member.userId !== session.user.id && (
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <DeleteItemButton 
                                                    id={member.id} 
                                                    type="member" 
                                                    name={member.user.name || "Member"} 
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* 3. PROJECTS (Owner Only) */}
                {isOwner && (
                    <div className={cardBase}>
                        <div className={headerClass}>
                             <h3 className="font-bold text-lg flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-gray-400" />
                                Workspace Projects
                            </h3>
                            <span className="text-xs font-bold text-gray-400">
                                {fullOrg.projects.length} Total
                            </span>
                        </div>
                        <div className="p-2 grid gap-1">
                             {fullOrg.projects.length > 0 ? (
                                fullOrg.projects.map((proj) => (
                                    <div key={proj.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            <span className="font-bold text-gray-900 text-sm">{proj.name}</span>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <DeleteItemButton 
                                                id={proj.id} 
                                                type="project" 
                                                name={proj.name} 
                                            />
                                        </div>
                                    </div>
                                ))
                             ) : (
                                <div className="text-center py-8 text-gray-400 text-sm font-medium">
                                    No active projects found.
                                </div>
                             )}
                        </div>
                    </div>
                )}

            </div>

            {/* --- RIGHT COLUMN (1/3 width) --- */}
            <div className="space-y-6">
                
                {/* Plan / Info Widget */}
                <div className={`${cardBase} bg-black text-white p-6`}>
                    <div className="flex items-start justify-between mb-6">
                        <div className="p-3 bg-white/10 rounded-xl">
                            <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <span className="bg-white text-black text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                            Free Plan
                        </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Upgrade to Pro</h3>
                    <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                        Unlock advanced team permissions, unlimited projects, and priority support.
                    </p>
                    <button className="w-full py-3 bg-white text-black rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">
                        View Plans
                    </button>
                </div>

                {/* DANGER ZONE */}
                <div className={`${cardBase} border-red-100`}>
                    <div className="p-6 border-b border-red-50 bg-red-50/30">
                        <h3 className="text-red-900 font-bold flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5" />
                            Danger Zone
                        </h3>
                    </div>
                    <div className="p-6 space-y-6">
                         <div>
                            <h4 className="font-bold text-gray-900 text-sm mb-1">Delete Account</h4>
                            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                                Permanently remove your account and all associated data. This action cannot be undone.
                            </p>
                            <div className="w-full">
                                <DeleteAccountButton />
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