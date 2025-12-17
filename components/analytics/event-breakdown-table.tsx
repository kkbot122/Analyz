"use client";
import EmptyState from "@/components/EmptyState";

type Row = {
  eventName: string;
  count: number;
};

export default function EventBreakdownTable({
  data,
}: {
  data: Row[];
}) {
  if (data.length === 0) {
    return (
      <EmptyState
      title="No events tracked"
      description="Track custom events to see user behavior"
    />
    );
  }

  return (
    <div className="bg-white border rounded p-4 text-gray-700">
      <h2 className="text-lg font-semibold mb-4">
        Event Breakdown
      </h2>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2">Event</th>
            <th className="py-2 text-right">
              Count
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row.eventName}
              className="border-b last:border-0"
            >
              <td className="py-2 font-mono">
                {row.eventName}
              </td>
              <td className="py-2 text-right">
                {row.count}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
