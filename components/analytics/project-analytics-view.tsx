import { prisma } from "@/lib/prisma";
import PageViewsChart from "./page-views-chart";
import PageBreakdownTable from "./page-breakdown-table";
import TimeRangeSelector from "./time-range-selector";
import EventBreakdownTable from "./event-breakdown-table";
import FunnelTable from "./funnel-table";
import RetentionTable from "./retention-table";
import KpiRow from "./kpi-row";
import {
  BarChart3,
  Filter,
  MousePointerClick,
  ArrowDownUp,
  Repeat,
} from "lucide-react";
import { ReactNode } from "react";

interface ProjectAnalyticsViewProps {
  projectId: string;
  searchParams: { range?: string; retentionEvent?: string };
  sideWidgets?: ReactNode;
}

// Helper: Calculate Percentage Change
function getPercentChange(current: number, previous: number) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
}

// Helper: Fill missing dates with 0 for sparklines
function fillMissingDates(data: Record<string, number>, range: number) {
  const result = [];
  for (let i = range - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    result.push({ date: dateStr, value: data[dateStr] || 0 });
  }
  return result;
}

export default async function ProjectAnalyticsView({
  projectId,
  searchParams,
  sideWidgets,
}: ProjectAnalyticsViewProps) {
  const range = Number(searchParams.range) || 30;
  const retentionEvent = searchParams.retentionEvent || "signup_completed";
  
  const currentStart = new Date();
  currentStart.setDate(currentStart.getDate() - range);

  const previousStart = new Date(currentStart);
  previousStart.setDate(previousStart.getDate() - range);
  const previousEnd = new Date(currentStart); 

  const FUNNEL_STEPS = ["page_view", "signup_started", "signup_completed"];

  // 1. Fetch Events (Current Period)
  const events = await prisma.event.findMany({
    where: { projectId: projectId, createdAt: { gte: currentStart } },
    select: {
      eventName: true,
      createdAt: true,
      properties: true,
      sessionId: true,
      userId: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // 2. Fetch Comparison Aggregates (Previous Period)
  const [prevTotalEvents, prevSessionsGroup] = await Promise.all([
    prisma.event.count({
        where: { 
            projectId: projectId, 
            eventName: "page_view",
            createdAt: { gte: previousStart, lt: previousEnd }
        }
    }),
    prisma.event.groupBy({
        by: ["sessionId"],
        where: {
            projectId: projectId,
            createdAt: { gte: previousStart, lt: previousEnd },
            sessionId: { not: null }
        }
    })
  ]);

  const prevTotalSessions = prevSessionsGroup.length;

  // --- PROCESSING LOOP ---
  const viewsByDate: Record<string, number> = {};
  const viewsByPath: Record<string, number> = {};
  const eventsByName: Record<string, number> = {};
  const funnelSteps: Record<number, Set<string>> = {};
  const stepTimes: Record<string, Record<number, Date>> = {};
  const cohortStart: Record<string, Date> = {};
  const activityByUser: Record<string, Set<string>> = {};
  type Session = { start: Date; end: Date; pages: string[] };
  const sessions: Record<string, Session> = {};

  for (let i = 0; i < FUNNEL_STEPS.length; i++) funnelSteps[i] = new Set();

  for (const event of events) {
    const userId = event.userId || "anonymous";
    const eventTime = event.createdAt;
    const day = eventTime.toISOString().slice(0, 10);

    eventsByName[event.eventName] = (eventsByName[event.eventName] ?? 0) + 1;
    if (!activityByUser[userId]) activityByUser[userId] = new Set();
    activityByUser[userId].add(day);
    if (event.eventName === retentionEvent && !cohortStart[userId])
      cohortStart[userId] = eventTime;

    if (event.eventName === "page_view") {
      viewsByDate[day] = (viewsByDate[day] ?? 0) + 1;
      const props = event.properties as Record<string, any> | null;
      viewsByPath[props?.path || "unknown"] =
        (viewsByPath[props?.path || "unknown"] ?? 0) + 1;
    }

    if (event.sessionId) {
      if (!sessions[event.sessionId])
        sessions[event.sessionId] = {
          start: eventTime,
          end: eventTime,
          pages: [],
        };
      const s = sessions[event.sessionId];
      if (eventTime < s.start) s.start = eventTime;
      if (eventTime > s.end) s.end = eventTime;
      if (event.eventName === "page_view") {
        const props = event.properties as Record<string, any> | null;
        if (props?.path) s.pages.push(props.path);
      }
    }

    const stepIndex = FUNNEL_STEPS.indexOf(event.eventName);
    if (stepIndex !== -1) {
      if (!stepTimes[userId]) stepTimes[userId] = {};
      if (stepIndex === 0 && !stepTimes[userId][0]) {
        stepTimes[userId][0] = eventTime;
        funnelSteps[0].add(userId);
      } else if (stepIndex > 0) {
        const prev = stepTimes[userId][stepIndex - 1];
        if (prev && !stepTimes[userId][stepIndex] && eventTime > prev) {
          stepTimes[userId][stepIndex] = eventTime;
          funnelSteps[stepIndex].add(userId);
        }
      }
    }
  }

  // --- Calculate Derived Stats ---
  const sessionCount = Object.keys(sessions).length;
  const totalPageViews = events.filter(e => e.eventName === "page_view").length;
  
  const funnelStart = funnelSteps[0].size;
  const funnelEnd = funnelSteps[FUNNEL_STEPS.length - 1].size;
  const conversionRate = funnelStart === 0 ? 0 : (funnelEnd / funnelStart) * 100;

  const sessionsDelta = getPercentChange(sessionCount, prevTotalSessions);
  const viewsDelta = getPercentChange(totalPageViews, prevTotalEvents);

  // --- Prepare Sparkline Data ---
  // 1. Sessions by Date
  const sessionsByDate: Record<string, number> = {};
  Object.values(sessions).forEach(session => {
      const day = session.start.toISOString().slice(0, 10);
      sessionsByDate[day] = (sessionsByDate[day] ?? 0) + 1;
  });

  // 2. Format for Charts (Fill zeros)
  const sessionsTrend = fillMissingDates(sessionsByDate, range);
  const viewsTrend = fillMissingDates(viewsByDate, range);

  // --- Retention & Charts Data ---
  const dayOffsets = [1, 3, 7];
  const cohortUsers = Object.keys(cohortStart);
  const retention = dayOffsets.map((offset) => {
    let retained = 0;
    for (const userId of cohortUsers) {
      const startDay = cohortStart[userId].toISOString().slice(0, 10);
      const target = new Date(startDay);
      target.setDate(target.getDate() + offset);
      if (activityByUser[userId]?.has(target.toISOString().slice(0, 10)))
        retained++;
    }
    return {
      day: offset,
      retained,
      percentage: cohortUsers.length ? (retained / cohortUsers.length) * 100 : 0,
    };
  });
  const day1Retention = retention.find((r) => r.day === 1)?.percentage ?? 0;

  const chartData = Object.entries(viewsByDate).map(([date, count]) => ({ date, count }));
  const pagebreakdownData = Object.entries(viewsByPath).map(([path, count]) => ({ path, count })).sort((a, b) => b.count - a.count);
  const eventBreakdownData = Object.entries(eventsByName).map(([eventName, count]) => ({ eventName, count })).sort((a, b) => b.count - a.count);
  const funnelData = FUNNEL_STEPS.map((step, index) => ({ step, users: funnelSteps[index].size }));
  
  // --- Styling ---
  const bentoCard = "bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col";
  const cardHeader = "font-bold text-gray-900 text-sm mb-6 flex items-center gap-2";
  const standardHeight = "h-[450px]";

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
      <div className="xl:col-span-8 flex flex-col gap-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Analytics Overview</h3>
            <p className="text-gray-500 text-sm mt-1">
              Performance for the last <span className="font-bold text-black">{range} days</span>
            </p>
          </div>
          <TimeRangeSelector selected={range} projectId={projectId} />
        </div>

        {/* KPI ROW WITH SPARKLINES */}
        <KpiRow
          kpis={[
            { 
                label: "Sessions", 
                value: sessionCount,
                change: sessionsDelta, 
                explanation: "Unique sessions in this time period.",
                chartData: sessionsTrend // ✅ Pass the trend data
            },
            { 
                label: "Views", 
                value: totalPageViews,
                change: viewsDelta, 
                explanation: "Total page views count.",
                chartData: viewsTrend // ✅ Pass the trend data
            },
            { 
                label: "Conversion", 
                value: `${conversionRate.toFixed(1)}%`,
                explanation: `Funnel completion: ${FUNNEL_STEPS.join(" → ")}`
            },
            { 
                label: "Retention (D1)", 
                value: `${day1Retention.toFixed(1)}%`,
                explanation: "Users returning after 24 hours."
            },
          ]}
        />

        <div className={`${bentoCard} ${standardHeight}`}>
          <div className="flex justify-between items-start mb-0">
            <h4 className={cardHeader}><BarChart3 className="w-4 h-4 text-gray-400" /> Traffic Volume</h4>
          </div>
          <div className="flex-1 w-full min-h-0">
            <PageViewsChart data={chartData} />
          </div>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${standardHeight}`}>
          <div className={`${bentoCard} h-full`}>
            <h4 className={cardHeader}><ArrowDownUp className="w-4 h-4 text-gray-400" /> Funnel</h4>
            <div className="flex-1 min-h-0 overflow-y-auto">
              <FunnelTable data={funnelData} />
            </div>
          </div>
          <div className={`${bentoCard} h-full`}>
            <h4 className={cardHeader}><Repeat className="w-4 h-4 text-gray-400" /> Retention</h4>
            <div className="flex-1 min-h-0 overflow-y-auto">
              <RetentionTable cohortSize={cohortUsers.length} data={retention} />
            </div>
          </div>
        </div>
      </div>

      <div className="xl:col-span-4 flex flex-col gap-6 w-full">
        <div className="flex flex-col gap-6">{sideWidgets}</div>
        <div className={`${bentoCard} ${standardHeight}`}>
          <h4 className={cardHeader}><Filter className="w-4 h-4 text-gray-400" /> Top Pages</h4>
          <div className="flex-1 min-h-0 overflow-y-auto pr-2 -mr-2">
            <PageBreakdownTable data={pagebreakdownData} />
          </div>
        </div>
        <div className={`${bentoCard} ${standardHeight}`}>
          <h4 className={cardHeader}><MousePointerClick className="w-4 h-4 text-gray-400" /> Top Events</h4>
          <div className="flex-1 min-h-0 overflow-y-auto pr-2 -mr-2">
            <EventBreakdownTable data={eventBreakdownData} />
          </div>
        </div>
      </div>
    </div>
  );
}