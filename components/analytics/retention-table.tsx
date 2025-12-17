"use client";
import EmptyState from "@/components/EmptyState";

type Row = {
  day: number;
  retained: number;
  percentage: number;
};

export default function RetentionTable({
  cohortSize,
  data,
}: {
  cohortSize: number;
  data: Row[];
}) {
  if (cohortSize === 0) {
    return (
      <EmptyState
        title="No retention data yet"
        description="Users need to trigger the retention event first"
      />
    );
  }

  return (
    <div className="bg-white border rounded p-4 max-w-xl text-gray-700">
      <h2 className="text-lg font-semibold mb-4">Retention</h2>

      <p className="text-sm text-gray-500 mb-3">
        Cohort size: {cohortSize} users
      </p>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2 text-left">Day</th>
            <th className="py-2 text-right">Users Retained</th>
            <th className="py-2 text-right">Retention %</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.day} className="border-b last:border-0">
              <td className="py-2">Day {row.day}</td>
              <td className="py-2 text-right">{row.retained}</td>
              <td className="py-2 text-right">{row.percentage.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
