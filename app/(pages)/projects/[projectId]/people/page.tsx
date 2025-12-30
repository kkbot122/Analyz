import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Calendar, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { UserAvatar } from "@/components/user-avatar";
import { Sidebar } from "@/components/sidebar"; // 1. Import Sidebar
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { canManageOrganization } from "@/lib/permissions";

export default async function PeoplePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return redirect("/auth/login");

  const { projectId } = await params;

  // 2. Fetch Project Context (Needed for Sidebar)
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { 
        id: true, 
        name: true, 
        organizationId: true 
    }
  });

  if (!project) return notFound();

  // 3. Fetch Permissions (Needed for Sidebar Settings)
  const membership = await prisma.membership.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: project.organizationId
      }
    }
  });

  if (!membership) return redirect("/dashboard");
  const showOrgSettings = canManageOrganization(membership.role);

  // 4. Fetch People Data
  const people = await prisma.event.groupBy({
    by: ["userId"],
    where: { projectId },
    _count: {
      _all: true,
    },
    _max: {
      createdAt: true,
    },
    orderBy: {
      _max: { createdAt: "desc" },
    },
    take: 50,
  });

  // 5. Render Layout with Sidebar
  return (
    <div className="min-h-screen bg-[#f0eeef] text-black flex font-sans">
      
      {/* Sidebar Component */}
      <Sidebar 
        currentOrgId={project.organizationId} 
        showSettings={showOrgSettings} 
      />

      <main className="flex-1 px-4 lg:px-8 py-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                <Link
                    href={`/projects/${projectId}`}
                    className="text-sm font-medium text-gray-500 hover:text-black flex items-center gap-2 mb-2 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>
                <div className="flex items-baseline gap-3">
                    <h1 className="text-3xl font-bold text-gray-900">People</h1>
                    <span className="text-gray-400 font-medium text-lg">/ {project.name}</span>
                </div>
                <p className="text-gray-500 mt-1">
                    Recent users active in your project.
                </p>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50 text-xs uppercase font-bold text-gray-500">
                    <th className="px-6 py-4 pl-8">User Identity</th>
                    <th className="px-6 py-4">Last Seen</th>
                    <th className="px-6 py-4">Activity</th>
                    <th className="px-6 py-4"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {people.map((person) => {
                    const userId = person.userId || "anonymous";
                    const lastSeen = person._max.createdAt;
                    const eventCount = person._count._all;

                    return (
                        <tr key={userId} className="group hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-4 pl-8">
                            <div className="flex items-center gap-4">
                            <UserAvatar 
                                user={{
                                    name: userId,
                                    email: "",
                                    image: null
                                }}
                                size="md"
                                showTooltip={false}
                            />
                            <div>
                                <div className="font-bold text-gray-900 text-sm font-mono">
                                    {userId}
                                </div>
                                <div className="text-xs text-gray-400">
                                    {userId === "anonymous" ? "Guest User" : "Identified User"}
                                </div>
                            </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                {lastSeen 
                                    ? formatDistanceToNow(lastSeen, { addSuffix: true }) 
                                    : "Unknown"}
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                                <Activity className="w-3 h-3" />
                                {eventCount} events
                            </div>
                        </td>
                        <td className="px-6 py-4 text-right pr-8">
                            <Link
                            href={`/projects/${projectId}/people/${userId}`}
                            className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-black hover:text-white hover:border-black transition-all shadow-sm"
                            >
                            View Profile
                            </Link>
                        </td>
                        </tr>
                    );
                    })}
                </tbody>
                </table>
                
                {people.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                        No users found for this project yet.
                    </div>
                )}
            </div>
        </div>
      </main>
    </div>
  );
}