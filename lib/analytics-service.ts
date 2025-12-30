import { prisma } from "@/lib/prisma";
import { MOCK_EVENTS } from "@/lib/mock-data";

export async function getAnalyticsData(projectId: string, startDate: Date) {
  // ✅ DEMO MODE CHECK
  if (projectId === "demo") {
    // Filter mock events by date range
    return MOCK_EVENTS.filter((e) => e.createdAt >= startDate);
  }

  // ✅ REAL DB MODE
  return prisma.event.findMany({
    where: {
      projectId: projectId,
      createdAt: { gte: startDate },
    },
    select: {
      eventName: true,
      createdAt: true,
      properties: true,
      sessionId: true,
      userId: true,
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getProjectConfig(projectId: string) {
    if (projectId === "demo") {
        return {
            primaryGoal: "signup_completed",
            eventDefinitions: [
                { name: "signup_completed", title: "Sign Up Success", isCritical: true },
                { name: "page_view", title: "Page View", isCritical: false }
            ]
        };
    }
    
    return prisma.project.findUnique({
        where: { id: projectId },
        select: { primaryGoal: true, eventDefinitions: true }
    });
}