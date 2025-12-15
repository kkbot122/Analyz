"use client";

import { useState } from "react";
import { Plus, UserPlus } from "lucide-react";
import { InviteModal } from "./invite-modal";
import { NewProjectModal } from "./new-project-modal";

export function DashboardHeader({ 
  orgName, 
  userRole, 
  canCreateProject, 
  canInvite 
}: { 
  orgName: string, 
  userRole: string, 
  canCreateProject: boolean, 
  canInvite: boolean 
}) {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // Helper to format the role for display
  const getReadableRole = (role: string) => {
    switch (role) {
      case "ORG_OWNER":
        return "Organization Owner";
      case "PROJECT_OWNER":
        return "Project Owner";
      case "TEAM_MEMBER":
        return "Member";
      default:
        return role; // Return as-is if it doesn't match known types
    }
  };

  const displayRole = getReadableRole(userRole);

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
      <div>
        <h1 className="text-3xl md:text-4xl font-medium tracking-tight leading-tight">
          {orgName}
        </h1>
        <p className="text-gray-500 mt-2 text-lg">
           Viewing as <span className="font-medium text-black">{displayRole}</span>
        </p>
      </div>

      <div className="flex gap-3">
        {/* Invite Button - Only visible if permitted */}
        {canInvite && (
          <button
            onClick={() => setIsInviteOpen(true)}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-black font-medium hover:bg-gray-50 transition-colors gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Invite Member
          </button>
        )}

        {/* New Project Button */}
        {canCreateProject && (
          <button
            onClick={() => setIsProjectModalOpen(true)}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-black text-white font-medium hover:bg-gray-800 transition-colors shadow-sm gap-2"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button> 
        )}
      </div>

      <InviteModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />
      <NewProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} />
    </div>
  );
}