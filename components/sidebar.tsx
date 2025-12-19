"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Folder, Settings, Sparkles } from "lucide-react";
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

  // Custom colors (Orange Theme)
  const activeBg = "bg-[#d9623b]";
  const activeText = "text-white font-bold";
  const inactiveText =
    "text-gray-500 font-medium hover:text-white hover:bg-[#d9623b]";

  // UPDATED: Reduced px to 4 and py to 3 for a more compact look
  const linkClass = (path: string) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
      isActive(path) ? `${activeBg} ${activeText}` : inactiveText
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
        <div className="mt-auto px-2 pb-6 flex flex-col items-center text-center">
          <Sparkles className="w-6 h-6 text-[#d9623b] relative z-10 mb-2" />

          <h3 className="text-gray-900 font-bold text-lg mb-1">First steps</h3>
          <p className="text-gray-400 text-xs mb-4 max-w-[160px] leading-relaxed">
            Customize your dashboard and learn about our features
          </p>

          <button
            onClick={() => setIsModalOpen(true)}
            className="text-[#d9623b] font-bold text-sm hover:underline hover:text-[#b84a25] transition-colors"
          >
            Get Started
          </button>
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