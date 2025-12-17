"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import EmptyState from "@/components/EmptyState";

type DataPoint = {
  date: string;
  count: number;
};

export default function PageViewsChart({
  data,
}: {
  data: DataPoint[];
}) {
  if (data.length === 0) {
    return (
      <EmptyState
      title="No page views yet"
      description="Send page_view events to start tracking traffic"
    />
    );
  }

  return (
    <div className="h-80 bg-white border rounded p-4 text-gray-700">
      <h2 className="text-lg font-semibold mb-4">
        Page Views (last 30 days)
      </h2>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="count"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
