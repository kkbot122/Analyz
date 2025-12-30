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

export default async function ProjectAnalyticsView({
  projectId,
  searchParams,
  sideWidgets,
}: ProjectAnalyticsViewProps) {
  // 1. Parse Params & Dates
  const range = Number(searchParams.range) || 30;
  const retentionEvent = searchParams.retentionEvent || "signup_completed";
  const since = new Date();
  since.setDate(since.getDate() - range);
  const FUNNEL_STEPS = ["page_view", "signup_started", "signup_completed"];

  // 2. Fetch Events
  const events = await prisma.event.findMany({
    where: { projectId: projectId, createdAt: { gte: since } },
    select: {
      eventName: true,
      createdAt: true,
      properties: true,
      sessionId: true,
      userId: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // --- LOGIC BLOCK START (Metric Calculations) ---
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

  const sessionCount = Object.keys(sessions).length;
  const totalPageViews = events.filter(
    (e) => e.eventName === "page_view"
  ).length;
  const funnelStart = funnelSteps[0].size;
  const funnelEnd = funnelSteps[FUNNEL_STEPS.length - 1].size;
  const conversionRate =
    funnelStart === 0 ? 0 : (funnelEnd / funnelStart) * 100;

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
      percentage: cohortUsers.length
        ? (retained / cohortUsers.length) * 100
        : 0,
    };
  });
  const day1Retention = retention.find((r) => r.day === 1)?.percentage ?? 0;

  const chartData = Object.entries(viewsByDate).map(([date, count]) => ({
    date,
    count,
  }));
  const pagebreakdownData = Object.entries(viewsByPath)
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count);
  const eventBreakdownData = Object.entries(eventsByName)
    .map(([eventName, count]) => ({ eventName, count }))
    .sort((a, b) => b.count - a.count);
  const funnelData = FUNNEL_STEPS.map((step, index) => ({
    step,
    users: funnelSteps[index].size,
  }));
  // --- LOGIC BLOCK END ---

  // --- STYLING CONSTANTS ---
  const bentoCard =
    "bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col";
  const cardHeader =
    "font-bold text-gray-900 text-sm mb-6 flex items-center gap-2";

  // Height Utility: Keeps cards visually aligned across columns
  const standardHeight = "h-[450px]";

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
      {/* === LEFT COLUMN (8/12) === */}
      <div className="xl:col-span-8 flex flex-col gap-6 w-full">
        {/* 1. Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Analytics Overview
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              Performance for the last{" "}
              <span className="font-bold text-black">{range} days</span>
            </p>
          </div>
          <TimeRangeSelector selected={range} projectId={projectId} />
        </div>

        {/* 2. KPI Cards */}
        <KpiRow
          kpis={[
            {
              label: "Sessions",
              value: sessionCount,
              explanation:
                "A session is a group of user interactions within a given time frame. It ends after 30 minutes of inactivity.",
            },
            {
              label: "Views",
              value: totalPageViews,
              explanation:
                "The total number of pages viewed. Includes repeated views of a single page.",
            },
            {
              label: "Conversion",
              value: `${conversionRate.toFixed(1)}%`,
              explanation: `Percentage of users who completed the funnel: ${FUNNEL_STEPS.join(
                " → "
              )}`,
            },
            {
              label: "Retention",
              value: `${day1Retention.toFixed(1)}%`,
              explanation:
                "Percentage of users who returned to the app exactly 1 day after their first visit.",
            },
          ]}
        />

        {/* 3. Traffic Chart (Row 1 Left) */}
        <div className={`${bentoCard} ${standardHeight}`}>
          <div className="flex justify-between items-start mb-0">
            <h4 className={cardHeader}>
              <BarChart3 className="w-4 h-4 text-gray-400" />
              Traffic Volume
            </h4>
          </div>
          <div className="flex-1 w-full min-h-0">
            <PageViewsChart data={chartData} />
          </div>
        </div>

        {/* 4. Funnel & Retention (Row 2 Left) */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${standardHeight}`}
        >
          <div className={`${bentoCard} h-full`}>
            <h4 className={cardHeader}>
              <ArrowDownUp className="w-4 h-4 text-gray-400" />
              Funnel
            </h4>
            <div className="flex-1 min-h-0 overflow-y-auto">
              <FunnelTable data={funnelData} />
            </div>
          </div>
          <div className={`${bentoCard} h-full`}>
            <h4 className={cardHeader}>
              <Repeat className="w-4 h-4 text-gray-400" />
              Retention
            </h4>
            <div className="flex-1 min-h-0 overflow-y-auto">
              <RetentionTable
                cohortSize={cohortUsers.length}
                data={retention}
              />
            </div>
          </div>
        </div>
      </div>

      {/* === RIGHT COLUMN (4/12) === */}
      <div className="xl:col-span-4 flex flex-col gap-6 w-full">
        {/* A. Context Widgets (Variable Height) */}
        <div className="flex flex-col gap-6">{sideWidgets}</div>

        {/* B. Top Pages (Row 1 Right - Matches Traffic Height) */}
        <div className={`${bentoCard} ${standardHeight}`}>
          <h4 className={cardHeader}>
            <Filter className="w-4 h-4 text-gray-400" />
            Top Pages
          </h4>
          <div className="flex-1 min-h-0 overflow-y-auto pr-2 -mr-2">
            <PageBreakdownTable data={pagebreakdownData} />
          </div>
        </div>

        {/* C. Top Events (Row 2 Right - Matches Funnel Height) */}
        <div className={`${bentoCard} ${standardHeight}`}>
          <h4 className={cardHeader}>
            <MousePointerClick className="w-4 h-4 text-gray-400" />
            Top Events
          </h4>
          <div className="flex-1 min-h-0 overflow-y-auto pr-2 -mr-2">
            <EventBreakdownTable data={eventBreakdownData} />
          </div>
        </div>
      </div>
    </div>
  );
}
