"use client";

import { useState } from "react";
import { Settings, UserPlus } from "lucide-react";
import { ProjectInviteModal } from "./project-invite-modal";

export function ProjectHeader({ 
  projectName, 
  userRole, 
  projectId,
  canInvite,
  orgId 
}: { 
  projectName: string; 
  userRole: string; 
  projectId: string;
  canInvite: boolean;
  orgId: string;
}) {
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="font-semibold text-lg">{projectName}</h1>
        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600 font-medium">
          {userRole}
        </span>
      </div>

      <div className="flex items-center gap-2">

        {canInvite && (
          <button 
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-[#d9623b] hover:bg-[#ed6c42] rounded-lg transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Invite
          </button>
        )}

        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-black transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <ProjectInviteModal 
        isOpen={isInviteOpen} 
        onClose={() => setIsInviteOpen(false)} 
        projectId={projectId}
        organizationId={orgId}
      />
    </div>
  );
}