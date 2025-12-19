"use client";

import { useState } from "react";
import { Plus, Search, Bell, UserPlus, Calendar, ShieldCheck } from "lucide-react";
import { InviteModal } from "./invite-modal";
import { NewProjectModal } from "./new-project-modal";

export function DashboardHeader({
  orgName,
  orgId, // Add this prop
  userRole,
  canCreateProject,
  canInvite,
}: {
  orgName: string;
  orgId: string; // Add this prop
  userRole: string;
  canCreateProject: boolean;
  canInvite: boolean;
}) {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const getRoleBadge = (role: string) => {
    const isOwner = role.includes("owner");
    const label = role.replace("org_", "").replace("_", " ");
    
    return (
      <div className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider
        ${isOwner 
          ? "bg-black text-white border-black" 
          : "bg-gray-50 text-gray-500 border-gray-200"
        }
      `}>
        {isOwner && <ShieldCheck className="w-3 h-3" />}
        {label}
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-4 rounded-[24px] md:bg-transparent md:p-0">
      
      {/* Left: Org Name & Role Badge (Now Row Aligned) */}
      <div className="flex items-center gap-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight text-black">
          {orgName}
        </h1>
        {getRoleBadge(userRole)}
      </div>

      {/* Middle: Search */}
      <div className="flex items-center gap-4 flex-1 md:px-8">
        <div className="hidden md:flex items-center bg-white px-4 py-2.5 rounded-full border border-gray-200/60 shadow-sm w-full max-w-md text-gray-400 text-sm gap-2 focus-within:ring-2 focus-within:ring-black/5 transition-all">
          <Search className="w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search projects, teams..." 
            className="bg-transparent border-none outline-none w-full placeholder:text-gray-400 text-black h-full"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 justify-end">
        
        {/* Date Pill */}
        <div className="hidden xl:flex items-center gap-2 bg-white px-4 py-2.5 rounded-full border border-gray-200/60 shadow-sm text-sm font-medium text-gray-600">
          <Calendar className="w-4 h-4 text-gray-400" />
          {today}
        </div>

        {/* Notifications */}
        <button className="p-2.5 bg-white rounded-full border border-gray-200/60 shadow-sm hover:bg-gray-50 text-gray-600 relative transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {canInvite && (
          <button
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200/60 rounded-full text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Add person</span>
          </button>
        )}

        {canCreateProject && (
          <button
            onClick={() => setIsProjectModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#d9623b] text-white rounded-full text-sm font-bold shadow-lg shadow-black/10 hover:bg-[#ed6c42] transition-all hover:scale-[1.02]"
          >
            Create
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Pass orgId to the InviteModal */}
      <InviteModal 
        isOpen={isInviteOpen} 
        onClose={() => setIsInviteOpen(false)} 
        organizationId={orgId} // Use orgId here
      />
      <NewProjectModal 
        isOpen={isProjectModalOpen} 
        onClose={() => setIsProjectModalOpen(false)} 
      />
    </div>
  );
}