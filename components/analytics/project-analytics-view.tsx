import { prisma } from "@/lib/prisma";
import PageViewsChart from "./page-views-chart";
import PageBreakdownTable from "./page-breakdown-table";
import TimeRangeSelector from "./time-range-selector";
import EventBreakdownTable from "./event-breakdown-table";
import FunnelTable from "./funnel-table";
import RetentionTable from "./retention-table";
import KpiRow from "./kpi-row";
import Section from "./section";
import { BarChart3, Users, Filter, ArrowRight } from "lucide-react"; // Added icons for section headers

interface ProjectAnalyticsViewProps {
  projectId: string;
  searchParams: { range?: string; retentionEvent?: string };
}

export default async function ProjectAnalyticsView({
  projectId,
  searchParams,
}: ProjectAnalyticsViewProps) {
  
  // 1. Parse Params
  const range = Number(searchParams.range) || 30;
  const retentionEvent = searchParams.retentionEvent || "signup_completed";
  const since = new Date();
  since.setDate(since.getDate() - range);

  const FUNNEL_STEPS = ["page_view", "signup_started", "signup_completed"];

  // 2. Fetch Events for THIS Project
  const events = await prisma.event.findMany({
    where: {
      projectId: projectId,
      createdAt: { gte: since }, 
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

  // --- LOGIC BLOCK ---
  const viewsByDate: Record<string, number> = {};
  const viewsByPath: Record<string, number> = {};
  const eventsByName: Record<string, number> = {};
  const funnelSteps: Record<number, Set<string>> = {};
  const stepTimes: Record<string, Record<number, Date>> = {};
  const cohortStart: Record<string, Date> = {};
  const activityByUser: Record<string, Set<string>> = {};
  
  type Session = { start: Date; end: Date; pages: string[]; };
  const sessions: Record<string, Session> = {};

  for (let i = 0; i < FUNNEL_STEPS.length; i++) funnelSteps[i] = new Set();

  for (const event of events) {
    const userId = event.userId || "anonymous"; 
    const eventTime = event.createdAt; 

    // Event breakdown
    eventsByName[event.eventName] = (eventsByName[event.eventName] ?? 0) + 1;

    // Activity for retention
    const day = eventTime.toISOString().slice(0, 10);
    if (!activityByUser[userId]) activityByUser[userId] = new Set();
    activityByUser[userId].add(day);

    // Cohort Start
    if (event.eventName === retentionEvent && !cohortStart[userId]) {
      cohortStart[userId] = eventTime;
    }

    // Page Views
    if (event.eventName === "page_view") {
      viewsByDate[day] = (viewsByDate[day] ?? 0) + 1;
      // Safe property access
      const props = event.properties as Record<string, any> | null;
      const path = props?.path || "unknown";
      viewsByPath[path] = (viewsByPath[path] ?? 0) + 1;
    }

    // Session Tracking
    if (event.sessionId) {
      if (!sessions[event.sessionId]) {
        sessions[event.sessionId] = { start: eventTime, end: eventTime, pages: [] };
      }
      const s = sessions[event.sessionId];
      if (eventTime < s.start) s.start = eventTime;
      if (eventTime > s.end) s.end = eventTime;
      
      if (event.eventName === "page_view") {
        const props = event.properties as Record<string, any> | null;
        if (props?.path) s.pages.push(props.path);
      }
    }

    // Funnel Logic
    const stepIndex = FUNNEL_STEPS.indexOf(event.eventName);
    if (stepIndex !== -1) {
        if (!stepTimes[userId]) stepTimes[userId] = {};
        
        if (stepIndex === 0) {
            if (!stepTimes[userId][0]) {
                stepTimes[userId][0] = eventTime;
                funnelSteps[0].add(userId);
            }
        } else {
            const prevTime = stepTimes[userId][stepIndex - 1];
            if (prevTime && !stepTimes[userId][stepIndex] && eventTime > prevTime) {
                stepTimes[userId][stepIndex] = eventTime;
                funnelSteps[stepIndex].add(userId);
            }
        }
    }
  }

  // --- METRIC CALCULATIONS ---
  const dayOffsets = [1, 3, 7];
  const cohortUsers = Object.keys(cohortStart);
  
  const retention = dayOffsets.map((offset) => {
    let retained = 0;
    for (const userId of cohortUsers) {
      const startDay = cohortStart[userId].toISOString().slice(0, 10);
      const target = new Date(startDay);
      target.setDate(target.getDate() + offset);
      const targetDay = target.toISOString().slice(0, 10);
      if (activityByUser[userId]?.has(targetDay)) retained++;
    }
    return {
      day: offset,
      retained,
      percentage: cohortUsers.length === 0 ? 0 : (retained / cohortUsers.length) * 100,
    };
  });

  const sessionList = Object.values(sessions);
  const sessionCount = sessionList.length;
  const totalPageViews = events.filter((e) => e.eventName === "page_view").length;
  
  const funnelStart = funnelSteps[0].size;
  const funnelEnd = funnelSteps[FUNNEL_STEPS.length - 1].size;
  const conversionRate = funnelStart === 0 ? 0 : (funnelEnd / funnelStart) * 100;
  const day1Retention = retention.find((r) => r.day === 1)?.percentage ?? 0;

  const chartData = Object.entries(viewsByDate).map(([date, count]) => ({ date, count }));
  const pagebreakdownData = Object.entries(viewsByPath).map(([path, count]) => ({ path, count })).sort((a, b) => b.count - a.count);
  const eventBreakdownData = Object.entries(eventsByName).map(([eventName, count]) => ({ eventName, count })).sort((a, b) => b.count - a.count);
  const funnelData = FUNNEL_STEPS.map((step, index) => ({ step, users: funnelSteps[index].size }));

  // --- RENDER ---
  return (
    <div className="space-y-10">
      
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h3 className="text-2xl font-bold tracking-tight text-gray-900">Analytics Overview</h3>
           <p className="text-gray-500 text-sm mt-1">
             Performance metrics for the last <span className="font-medium text-black">{range} days</span>
           </p>
        </div>
        <TimeRangeSelector selected={range} projectId={projectId}/>
      </div>

      {/* KPI Cards */}
      <div className="p-1"> {/* Padding wrapper to prevent shadow clipping */}
        <KpiRow
            kpis={[
            { label: "Total Sessions", value: sessionCount },
            { label: "Total Views", value: totalPageViews },
            { label: "Conversion Rate", value: `${conversionRate.toFixed(1)}%` },
            { label: "Day 1 Retention", value: `${day1Retention.toFixed(1)}%` },
            ]}
        />
      </div>

      {/* Traffic Section */}
      <Section title="Traffic Analysis" description="How users are interacting with your pages">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 bg-gray-50/50 rounded-[24px] p-6 border border-gray-100/50">
             <h4 className="font-bold text-sm mb-6 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-gray-400"/>
                Views Over Time
             </h4>
             <PageViewsChart data={chartData} />
          </div>
          <div className="bg-gray-50/50 rounded-[24px] p-6 border border-gray-100/50">
             <h4 className="font-bold text-sm mb-6 flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400"/>
                Top Pages
             </h4>
             <PageBreakdownTable data={pagebreakdownData} />
          </div>
        </div>
      </Section>

      {/* Engagement Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <Section title="Event Breakdown" description="Most frequent user actions">
            <div className="bg-gray-50/50 rounded-[24px] p-6 border border-gray-100/50 h-full">
                <EventBreakdownTable data={eventBreakdownData} />
            </div>
         </Section>
         
         <Section title="Funnel Conversion" description="User journey completion rate">
             <div className="bg-gray-50/50 rounded-[24px] p-6 border border-gray-100/50 h-full">
                <FunnelTable data={funnelData} />
             </div>
         </Section>
      </div>

      {/* Retention Section */}
      <Section title="User Retention" description="Cohort analysis for returning users">
         <div className="bg-gray-50/50 rounded-[24px] p-6 border border-gray-100/50">
            <RetentionTable cohortSize={cohortUsers.length} data={retention} />
         </div>
      </Section>
    </div>
  );
}