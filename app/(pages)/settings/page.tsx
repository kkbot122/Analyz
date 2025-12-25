import { getActiveOrg } from "@/lib/active-org";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "./settings-client";
import { Sidebar } from "@/components/sidebar"; // Import the Sidebar

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // 1. Get Active Org ID from your helper
  const activeOrgData = await getActiveOrg();
  
  // 2. Fetch FULL organization details (members, roles)
  let fullOrgData = null;

  if (activeOrgData?.id) {
    fullOrgData = await prisma.organization.findUnique({
      where: { id: activeOrgData.id },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    // Add the current user's role in this org for the UI
    const currentUserMembership = fullOrgData?.members.find(
      (m) => m.userId === session.user.id
    );

    if (fullOrgData && currentUserMembership) {
      // @ts-ignore - structuring data for client
      fullOrgData.role = currentUserMembership.role;
    }
  }

  return (
    // Flex container to put Sidebar and Main Content side-by-side
    // We move the background color to this wrapper so it covers the full height
    <div className="flex w-full min-h-scree">
      
      {/* Sidebar Component */}
      <Sidebar 
        currentOrgId={activeOrgData?.id || ""} 
        showSettings={true} 
      />

      {/* Main Content Area */}
      {/* flex-1 ensures it takes remaining width */}
      {/* p-8 preserves your original padding preference */}
      <main className="flex-1 p-8 bg-[#f0eeef]">
        <SettingsClient 
          user={{
            id: session.user.id,
            name: session.user.name,
            email: session.user.email || "",
          }}
          // @ts-ignore
          organization={fullOrgData}
        />
      </main>
    </div>
  );
}