"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ChevronsUpDown, Check, Building2, Plus } from "lucide-react";
import Link from "next/link";

interface OrgSwitcherProps {
  currentOrgId?: string;
}

export function OrgSwitcher({ currentOrgId }: OrgSwitcherProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session?.user?.organizations) return null;

  // Find the full object for the current organization to display its name
  const currentOrg = session.user.organizations.find((o: any) => o.id === currentOrgId);

  async function switchOrg(orgId: string) {
    if (!orgId || orgId === currentOrgId) {
      setIsOpen(false);
      return;
    }
    
    // Optimistically close dropdown
    setIsOpen(false);

    await fetch("/api/org/switch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgId }),
    });

    router.refresh();
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-lg transition-all shadow-sm group"
      >
        <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center text-[#ea582c]">
          <Building2 className="w-3.5 h-3.5" />
        </div>
        
        <span className="text-sm font-medium text-gray-700 group-hover:text-black">
          {currentOrg ? currentOrg.name : "Select Org"}
        </span>
        
        <ChevronsUpDown className="w-4 h-4 text-gray-400" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="p-1">
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
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
                <div className="flex items-center gap-3">
                   {/* Initials Avatar */}
                   <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] ${
                     org.id === currentOrgId ? "bg-black text-white" : "bg-gray-200 text-gray-600"
                   }`}>
                      {org.name.slice(0, 1).toUpperCase()}
                   </div>
                   {org.name}
                </div>
                {org.id === currentOrgId && <Check className="w-4 h-4 text-black" />}
              </button>
            ))}
          </div>

          <div className="border-t border-gray-100 p-1">
            <Link
              href="/onboarding/create-org"
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-black rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Organization
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}