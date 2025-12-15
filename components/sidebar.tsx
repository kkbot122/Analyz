"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutGrid, 
  Folder, 
  Settings
} from "lucide-react";
import { OrgSwitcher } from "@/components/OrgSwitcher";
import { SignOutButton } from "@/components/sign-out-button";

interface SidebarProps {
  currentOrgId: string;
  showSettings: boolean;
}

export function Sidebar({ currentOrgId, showSettings }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  // Shared class for links
  const linkClass = (path: string) => 
    `flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors font-medium ${
      isActive(path) 
        ? "bg-gray-50 text-black font-bold" 
        : "text-gray-500 hover:bg-gray-50 hover:text-black"
    }`;

  return (
    <aside className="w-72 bg-white hidden lg:flex flex-col border-r border-gray-100 sticky top-0 h-screen p-6">
      {/* Logo */}
      <div className="mb-10 px-2">
        <Link href="/dashboard" className="text-2xl font-black tracking-tight flex items-center gap-3">
          Analyz
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2">
        <Link href="/dashboard" className={linkClass("/dashboard")}>
          <LayoutGrid className="w-5 h-5" />
          Dashboard
        </Link>
        <Link href="/projects" className={linkClass("/projects")}>
          <Folder className="w-5 h-5" />
          Projects
        </Link>
        {showSettings && (
          <Link href="/settings" className={linkClass("/settings")}>
            <Settings className="w-5 h-5" />
            Settings
          </Link>
        )}
      </nav>

      {/* Bottom Actions */}
      <div className="mt-auto pt-6 border-t border-gray-50 space-y-4">
        <div className="px-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Organization</p>
          <OrgSwitcher currentOrgId={currentOrgId} />
        </div>

        <div className="px-2">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
            <SignOutButton />
          </div>
        </div>
      </div>
    </aside>
  );
}