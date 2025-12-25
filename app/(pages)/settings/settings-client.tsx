"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { UserAvatar } from "@/components/user-avatar";
import { DeleteItemButton, DeleteAccountButton } from "@/components/settings-button";
import { 
  Save, 
  Loader2, 
  Building2, 
  User, 
  Mail, 
  BadgeCheck, 
  ShieldAlert, 
  CreditCard, 
  Settings as SettingsIcon,
  Users
} from "lucide-react";

interface SettingsClientProps {
  user: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
  };
  organization: {
    id: string;
    name: string;
    role: string;
    members: Array<{
      id: string;
      role: string;
      user: {
        id: string;
        name?: string | null;
        email: string;
        image?: string | null;
      };
    }>;
  };
}

export function SettingsClient({ user, organization }: SettingsClientProps) {
  const router = useRouter();
  const { update } = useSession();
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [isSavingOrg, setIsSavingOrg] = useState(false);
  
  // Form States
  const [userName, setUserName] = useState(user.name || "");
  const [orgName, setOrgName] = useState(organization?.name || "");

  const isOrgAdmin = organization?.role === "ORG_OWNER";

  // Styling Constants
  const cardBase = "bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden";
  const headerClass = "px-6 py-5 border-b border-gray-50 flex items-center justify-between bg-white";

  // 1. Update User Profile
  async function handleUpdateUser(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingUser(true);
    try {
      await fetch("/api/user/update", {
        method: "PATCH",
        body: JSON.stringify({ name: userName }),
      });
      router.refresh();
      await update(); // Update session to reflect name change in sidebar immediately
    } finally {
      setIsSavingUser(false);
    }
  }

  // 2. Update Organization Name
  async function handleUpdateOrg(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingOrg(true);
    try {
      await fetch(`/api/org/${organization.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: orgName }),
      });
      router.refresh();
      await update();
    } finally {
      setIsSavingOrg(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      
      {/* --- HEADER --- */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-900 shadow-sm border border-gray-100">
            <SettingsIcon className="w-6 h-6" />
        </div>
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
            <p className="text-gray-500 font-medium">
                Manage your profile and {organization?.name} preferences.
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* --- LEFT COLUMN (Forms) --- */}
        <div className="xl:col-span-2 space-y-6">

          {/* 1. PROFILE CARD (Editable) */}
          <form onSubmit={handleUpdateUser} className={`${cardBase} p-8 relative`}>
             {/* Decorative Gradient Blob */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
               {/* Avatar */}
               <div className="transform scale-[1.5] origin-top-left m-2">
                 <UserAvatar user={user} size="lg" showTooltip={false} />
               </div>
               
               <div className="flex-1 w-full pl-2 md:pl-6">
                 <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
                        <p className="text-xs text-gray-400 font-medium mt-1">Manage your public profile details.</p>
                    </div>
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <BadgeCheck className="w-3 h-3" /> Verified
                    </span>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name Input */}
                    <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors group focus-within:ring-2 ring-blue-100">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block flex items-center gap-2">
                           <User className="w-3 h-3" /> Full Name
                        </label>
                        <input 
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className="bg-transparent font-bold text-gray-900 w-full focus:outline-none placeholder:text-gray-300"
                        />
                    </div>

                    {/* Email (Read Only) */}
                    <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 opacity-75 cursor-not-allowed">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block flex items-center gap-2">
                           <Mail className="w-3 h-3" /> Email Address
                        </label>
                        <div className="font-bold text-gray-900 truncate">
                            {user.email}
                        </div>
                    </div>
                 </div>

                 <div className="mt-6 flex justify-end">
                    <button
                        type="submit"
                        disabled={isSavingUser || userName === user.name}
                        className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-gray-200"
                    >
                        {isSavingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                 </div>
               </div>
            </div>
          </form>

          {/* 2. ORGANIZATION SETTINGS */}
          {organization && (
            <div className={cardBase}>
               {/* Header & Org Name Input */}
               <form onSubmit={handleUpdateOrg} className={headerClass}>
                  <div>
                      <h3 className="font-bold text-lg flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-gray-400" />
                          Organization Settings
                      </h3>
                      {!isOrgAdmin && <p className="text-xs text-gray-400 mt-1">You are a member of this workspace.</p>}
                  </div>
                  
                  {isOrgAdmin && (
                      <div className="flex gap-2">
                         <input 
                            type="text"
                            value={orgName}
                            onChange={(e) => setOrgName(e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 text-sm font-medium focus:outline-none focus:ring-2 ring-orange-100 w-40 md:w-64"
                            placeholder="Org Name"
                            
                         />
                         <button 
                            type="submit"
                            disabled={isSavingOrg || orgName === organization.name}
                            className="bg-black text-white p-2 rounded-lg hover:bg-gray-800 disabled:opacity-30 transition-all"
                            title="Save Name"
                         >
                            {isSavingOrg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                         </button>
                      </div>
                  )}
               </form>
               
               {/* Team List */}
               <div className="p-2">
                 <div className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Team Members ({organization.members.length})
                 </div>
                 {organization.members.map((member) => (
                    <div key={member.id} className="group flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-all duration-200">
                        <div className="flex items-center gap-4">
                            <UserAvatar user={member.user} size="md" showTooltip={false}/>
                            <div>
                                <p className="font-bold text-gray-900 text-sm">{member.user.name || "Unknown"}</p>
                                <p className="text-xs text-gray-500 font-medium">{member.user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-full ${
                                member.role.includes('OWNER') 
                                ? 'bg-black text-white' 
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                                {member.role.replace("ORG_", "").replace("_", " ")}
                            </span>
                            
                            {isOrgAdmin && member.user.id !== user.id && (
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <DeleteItemButton id={member.id} type="member" name={member.user.name || member.user.email} />
                                </div>
                            )}
                        </div>
                    </div>
                 ))}
               </div>
            </div>
          )}
        </div>

        {/* --- RIGHT COLUMN (Actions) --- */}
        <div className="space-y-6">
            
            {/* Upgrade Card */}
            <div className={`${cardBase} bg-black text-white p-6 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
                <div className="flex items-start justify-between mb-6 relative z-10">
                    <div className="p-3 bg-white/10 rounded-xl">
                        <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <span className="bg-white text-black text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                        Free Plan
                    </span>
                </div>
                <h3 className="text-xl font-bold mb-2 relative z-10">Upgrade to Pro</h3>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed relative z-10">
                    Unlock advanced team permissions, unlimited projects, and priority support.
                </p>
                <button className="w-full py-3 bg-white text-black rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors relative z-10">
                    View Plans
                </button>
            </div>

            {/* Danger Zone */}
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
                            Permanently remove your account and all associated data.
                        </p>
                        <DeleteAccountButton />
                     </div>

                     {isOrgAdmin && (
                       <div className="pt-6 border-t border-red-50">
                          <h4 className="font-bold text-gray-900 text-sm mb-1">Delete Organization</h4>
                          <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                             Permanently remove <strong>{organization?.name}</strong> and all its projects.
                          </p>
                          <DeleteItemButton id={organization.id} type="org" name={organization.name} />
                       </div>
                     )}
                </div>
            </div>

        </div>

      </div>
    </div>
  );
}