import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Clock, Box, Calendar, Timer } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { canManageOrganization } from "@/lib/permissions";
import { UserAvatar } from "@/components/user-avatar";
import { formatDistanceToNow, differenceInMinutes } from "date-fns";

// ✅ HELPER: Group Events by Session
function groupEventsBySession(events: any[]) {
  const sessions: Record<string, any[]> = {};

  // 1. Group by Session ID
  events.forEach((event) => {
    const sid = event.sessionId || "unknown_session";
    if (!sessions[sid]) sessions[sid] = [];
    sessions[sid].push(event);
  });

  // 2. Convert to Array & Sort
  return Object.values(sessions)
    .map((sessionEvents) => {
      // Sort events inside session (oldest -> newest)
      sessionEvents.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      const start = new Date(sessionEvents[0].createdAt);
      const end = new Date(sessionEvents[sessionEvents.length - 1].createdAt);
      const duration = differenceInMinutes(end, start);

      return {
        id: sessionEvents[0].sessionId,
        events: sessionEvents, // Events in chronological order for the story
        startTime: start,
        duration: duration < 1 ? "< 1m" : `${duration}m`,
        eventCount: sessionEvents.length,
      };
    })
    .sort((a, b) => b.startTime.getTime() - a.startTime.getTime()); // Newest session first
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ projectId: string; userId: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return redirect("/auth/login");

  const { projectId, userId } = await params;
  const decodedUserId = decodeURIComponent(userId);

  // 1. Fetch Project Context
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, name: true, organizationId: true },
  });

  if (!project) return notFound();

  // 2. Fetch Permissions
  const membership = await prisma.membership.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: project.organizationId,
      },
    },
  });

  if (!membership) return redirect("/dashboard");
  const showOrgSettings = canManageOrganization(membership.role);

  // 3. Fetch Events
  const events = await prisma.event.findMany({
    where: { projectId, userId: decodedUserId },
    orderBy: { createdAt: "desc" },
    take: 500, // ✅ Increased limit to show full sessions
  });

  if (!events.length) {
    return <div>User not found</div>;
  }

  // 4. Stats Logic
  // ✅ Use the new grouping logic
  const sessionGroups = groupEventsBySession(events);
  const totalSessions = sessionGroups.length;
  const firstEvent = events[events.length - 1]; // Oldest event (since fetch is desc)

  return (
    <div className="min-h-screen bg-[#f0eeef] text-black flex font-sans">
      <Sidebar
        currentOrgId={project.organizationId}
        showSettings={showOrgSettings}
      />

      <main className="flex-1 px-4 lg:px-8 py-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <Link
              href={`/projects/${projectId}/people`} // Fixed route to singular "project" based on your prev context
              className="text-sm font-medium text-gray-500 hover:text-black flex items-center gap-2 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to People
            </Link>

            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Big Avatar */}
              <div className="transform scale-125 origin-left">
                <UserAvatar
                  user={{
                    name: decodedUserId,
                    email: "",
                    image: null,
                  }}
                  size="lg"
                  showTooltip={false}
                />
              </div>

              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 font-mono tracking-tight break-all">
                  {decodedUserId}
                </h1>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 font-medium">
                  <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                    <Clock className="w-3.5 h-3.5" />
                    First seen:{" "}
                    {new Date(firstEvent.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                    <Calendar className="w-3.5 h-3.5" />
                    {totalSessions} Sessions
                  </span>
                  <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                    <Box className="w-3.5 h-3.5" />
                    {events.length} Events
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ SESSIONS FEED */}
          <div className="relative space-y-12">
            {/* Main Vertical Timeline Line */}
            <div className="absolute top-4 bottom-0 left-[19px] w-[2px] bg-gray-200 -z-10" />

            {sessionGroups.map((session, sIdx) => (
              <div key={session.id || sIdx} className="relative">
                {/* 1. Session Header (The "Start" of the chapter) */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-full bg-white border-4 border-[#F3F4F6] shadow-sm flex items-center justify-center z-10">
                    <div className="w-3 h-3 bg-black rounded-full" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      {session.startTime.toLocaleDateString()} at{" "}
                      {session.startTime.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                      <Timer className="w-3 h-3" /> Duration: {session.duration}
                      <span className="text-gray-300">•</span>
                      {session.eventCount} events
                    </div>
                  </div>
                </div>

                {/* 2. Events List (Inside the chapter) */}
                <div className="ml-14 space-y-4">
                  {session.events.map((event, eIdx) => {
                    const props =
                      (event.properties as Record<string, any>) || {};
                    const isPageView = event.eventName === "page_view";

                    return (
                      <div key={event.id} className="relative group">
                        {/* Connector Line between events */}
                        {eIdx !== session.events.length - 1 && (
                          <div className="absolute left-[28px] top-10 bottom-[-16px] w-[2px] bg-gray-100 -z-10" />
                        )}

                        <div className="flex gap-4">
                          {/* Small Icon */}
                          <div
                            className={`shrink-0 w-14 h-14 flex items-center justify-center rounded-2xl border transition-all ${
                              isPageView
                                ? "bg-white border-gray-100"
                                : "bg-black border-black"
                            }`}
                          >
                            <span className="text-lg">
                              {isPageView ? "📄" : "⚡️"}
                            </span>
                          </div>

                          {/* Card Content */}
                          <div className="flex-1">
                            <div className="bg-white p-4 rounded-[20px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <h3
                                  className={`font-bold text-sm ${
                                    isPageView ? "text-gray-700" : "text-black"
                                  }`}
                                >
                                  {event.eventName}
                                </h3>
                                <span className="text-[10px] font-mono text-gray-400">
                                  {new Date(event.createdAt).toLocaleTimeString(
                                    [],
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      second: "2-digit",
                                    }
                                  )}
                                </span>
                              </div>

                              {/* Properties */}
                              {Object.keys(props).length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 bg-gray-50/50 rounded-xl border border-gray-100/50">
                                  {Object.entries(props).map(([key, val]) => (
                                    <div
                                      key={key}
                                      className="flex flex-col min-w-0"
                                    >
                                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                        {key}
                                      </span>
                                      <span
                                        className="text-xs font-medium text-gray-700 truncate"
                                        title={String(val)}
                                      >
                                        {String(val)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
