"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Folder, Settings, ChevronRight } from "lucide-react";
import { OrgSwitcher } from "@/components/OrgSwitcher";
import { SignOutButton } from "@/components/sign-out-button";
import { GetStartedModal } from "@/components/get-started-modal";

interface SidebarProps {
  currentOrgId: string;
  showSettings: boolean;
  apiKey?: string;
}

export function Sidebar({
  currentOrgId,
  showSettings,
  apiKey = "pk_test_123",
}: SidebarProps) {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  // UPDATED: Reduced px to 4 and py to 3 for a more compact look
  const linkClass = (path: string) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
      isActive(path)
        ? "text-black bg-gray-100"
        : "text-gray-500 hover:text-black hover:bg-gray-50"
    }`;

  return (
    <>
      {/* UPDATED: Width reduced to w-[250px] and padding to p-4 */}
      <aside className="w-[250px] bg-white hidden lg:flex flex-col h-screen p-4 border-r border-gray-100 sticky top-0 font-sans">
        {/* Top Section: Logo */}
        <div className="mb-10 px-2 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-xl font-black tracking-tight text-gray-800"
          >
            Analyz
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5">
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

        {/* "First Steps" Promo Card Widget */}
        <div className="relative overflow-hidden rounded-[24px] p-5 bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100">
          {/* Decorative blurs */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-40 blur-2xl rounded-full translate-x-4 -translate-y-4"></div>

          <div className="relative z-10">
            <h3 className="text-gray-900 font-bold text-lg leading-tight mb-2">
              First Steps
            </h3>
            <p className="text-gray-600 text-xs font-medium mb-4 leading-relaxed">
              Customize your dashboard and set up your first tracker.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-white text-black text-xs font-bold py-2.5 rounded-full shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1"
            >
              Get Started <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Footer: User/Org Section */}
        <div className="mt-auto pt-4 border-t border-gray-50 space-y-3">
          <div className="px-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Organization
            </p>
            <OrgSwitcher currentOrgId={currentOrgId} />
          </div>

          <div className="px-1">
            <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <SignOutButton />
            </div>
          </div>
        </div>
      </aside>

      {/* Modal Component */}
      <GetStartedModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        apiKey={apiKey}
      />
    </>
  );
}
