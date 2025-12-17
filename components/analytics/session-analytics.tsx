"use client";

export default function SessionAnalytics({
  sessionCount,
  avgDuration,
  avgPages,
}: {
  sessionCount: number;
  avgDuration: number;
  avgPages: number;
}) {
  return (
    <div className="grid grid-cols-3 gap-4 max-w-xl text-gray-700">
      <Stat label="Sessions" value={sessionCount} />
      <Stat
        label="Avg Duration"
        value={`${Math.round(avgDuration / 60000)} min`}
      />
      <Stat label="Pages / Session" value={avgPages.toFixed(1)} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border rounded p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
