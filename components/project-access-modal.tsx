"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Lock } from "lucide-react"; // Added Lock icon
import * as Dialog from "@radix-ui/react-dialog";

// ✅ Added canEdit prop
export function ProjectAccessModal({ user, allProjects, userProjectIds, canEdit }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const router = useRouter();

  const toggleAccess = async (projectId: string, currentAccess: boolean) => {
    // ✅ Safety check on client side
    if (!canEdit) return;

    setLoadingIds(prev => new Set(prev).add(projectId));
    
    try {
      const res = await fetch("/api/projects/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          userId: user.id,
          action: currentAccess ? "remove" : "add",
          role: "MEMBER"
        }),
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingIds(prev => {
        const next = new Set(prev);
        next.delete(projectId);
        return next;
      });
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <button className="text-sm font-medium text-blue-600 hover:underline">
          {canEdit ? "Manage Access" : "View Access"}
        </button>
      </Dialog.Trigger>
      
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 w-full max-w-md z-50 shadow-xl border border-gray-100">
          <Dialog.Title className="text-lg font-bold mb-1">
            {canEdit ? "Manage Access" : "Project Access"}
          </Dialog.Title>
          <Dialog.Description className="text-sm text-gray-500 mb-4">
             {canEdit 
               ? `Control which projects ${user.name} can see.`
               : `Viewing projects assigned to ${user.name}.`}
          </Dialog.Description>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {allProjects.map((project: any) => {
              const hasAccess = userProjectIds.includes(project.id);
              const isLoading = loadingIds.has(project.id);

              return (
                <div key={project.id} className={`flex items-center justify-between p-3 rounded-xl border border-gray-100 transition-colors ${!canEdit ? 'bg-gray-50' : 'hover:bg-gray-50'}`}>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">{project.name}</span>
                    <span className="text-xs text-gray-400">ID: {project.id.slice(0, 8)}...</span>
                  </div>
                  
                  <button
                    onClick={() => toggleAccess(project.id, hasAccess)}
                    disabled={isLoading || !canEdit} // ✅ Disable if not owner
                    className={`
                        w-6 h-6 rounded-full flex items-center justify-center border transition-all
                        ${hasAccess 
                            ? "bg-black border-black text-white" 
                            : "bg-white border-gray-300 text-transparent"}
                        ${canEdit ? "hover:border-black cursor-pointer" : "cursor-default opacity-60"}
                    `}
                  >
                    {/* Icon Logic */}
                    {isLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                    ) : hasAccess ? (
                        <Check className="w-3 h-3" />
                    ) : (
                        // If no access and read-only, show empty or Lock if you prefer
                        null 
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {!canEdit && (
            <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 text-xs rounded-lg flex items-center gap-2">
                <Lock className="w-3 h-3" />
                <span>Only Organization Owners can change project access.</span>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button 
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200"
            >
                Done
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}