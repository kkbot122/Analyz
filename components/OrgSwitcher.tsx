"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { ChevronsUpDown, Check, Building2, Plus, X, Building, Loader2 } from "lucide-react";

interface OrgSwitcherProps {
  currentOrgId?: string;
}

export function OrgSwitcher({ currentOrgId }: OrgSwitcherProps) {
  const { data: session, update } = useSession();
  const router = useRouter();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session?.user?.organizations) return null;

  const currentOrg = session.user.organizations.find((o: any) => o.id === currentOrgId);

  // --- 1. Switch Organization Logic ---
  async function switchOrg(orgId: string) {
    // Even if clicking the same org, we might want to go to dashboard
    if (orgId === currentOrgId) {
       setIsDropdownOpen(false);
       router.push("/dashboard"); 
       return;
    }
    
    setIsDropdownOpen(false); // Optimistically close

    await fetch("/api/org/switch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgId }),
    });

    router.refresh(); // Refresh Server Components (Sidebar name, etc.)
    router.push("/dashboard"); // ✅ FORCE REDIRECT TO DASHBOARD
  }

  // --- 2. Create Organization Logic ---
  async function handleCreateOrg(e: React.FormEvent) {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    setIsCreating(true);

    try {
      const res = await fetch("/api/org/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newOrgName.trim() }),
      });

      if (res.status === 401) {
        window.location.reload(); 
        return;
      }

      if (res.ok) {
        const data = await res.json();
        
        await update(); 
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // This will now trigger the redirect because we updated switchOrg above
        await switchOrg(data.orgId); 
        
        setNewOrgName("");
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Failed to create org", error);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <>
      {/* Dropdown Trigger */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-lg transition-all shadow-sm group w-full"
        >
          <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center text-[#ea582c]">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          
          <span className="text-sm font-medium text-gray-700 group-hover:text-black truncate flex-1 text-left">
            {currentOrg ? currentOrg.name : "Select Org"}
          </span>
          
          <ChevronsUpDown className="w-4 h-4 text-gray-400" />
        </button>

        {isDropdownOpen && (
          <div className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="p-1 max-h-[240px] overflow-y-auto custom-scrollbar">
              <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider sticky top-0 bg-white z-10">
                Organizations
              </div>
              
              {session.user.organizations.map((org: any) => (
                <button
                  key={org.id}
                  onClick={() => switchOrg(org.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                    org.id === currentOrgId
                      ? "bg-gray-50 text-black font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-black"
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                     <div className={`w-5 h-5 min-w-[1.25rem] rounded flex items-center justify-center text-[10px] ${
                       org.id === currentOrgId ? "bg-black text-white" : "bg-gray-200 text-gray-600"
                     }`}>
                        {org.name.slice(0, 1).toUpperCase()}
                     </div>
                     <span className="truncate">{org.name}</span>
                  </div>
                  {org.id === currentOrgId && <Check className="w-4 h-4 text-black shrink-0" />}
                </button>
              ))}
            </div>

            <div className="border-t border-gray-100 p-1 bg-gray-50/50">
              <button
                onClick={() => {
                    setIsDropdownOpen(false);
                    setIsModalOpen(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-white hover:text-black hover:shadow-sm rounded-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                Create Organization
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
            <div className="bg-white w-full max-w-lg p-8 rounded-3xl shadow-2xl scale-100 animate-in zoom-in-95 duration-200 relative">
                <button 
                    onClick={() => setIsModalOpen(false)}
                    className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-black"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-50 rounded-2xl mb-6">
                        <Building className="w-8 h-8 text-[#ea582c]" />
                    </div>
                    
                    <h2 className="text-3xl font-medium tracking-tight mb-3 text-black">
                        Create Organization
                    </h2>
                    
                    <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
                        Create a workspace to manage projects and track analytics.
                    </p>
                </div>

                <form onSubmit={handleCreateOrg} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                            Organization Name
                        </label>
                        <input
                            autoFocus
                            type="text"
                            value={newOrgName}
                            onChange={e => setNewOrgName(e.target.value)}
                            placeholder="e.g. Acme Corp"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-colors text-lg placeholder-gray-400"
                            disabled={isCreating} 
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!newOrgName.trim() || isCreating}
                        className="w-full bg-black text-white py-3.5 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                        {isCreating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            "Create Organization"
                        )}
                    </button>

                    <div className="pt-6 border-t border-gray-100">
                        <p className="text-xs text-gray-500 text-center">
                            You'll become the <span className="font-medium text-black">Organization Owner</span> with full access.
                        </p>
                    </div>
                </form>
            </div>
        </div>,
        document.body
      )}
    </>
  );
}