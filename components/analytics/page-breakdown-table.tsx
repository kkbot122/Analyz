"use client";
import EmptyState from "@/components/EmptyState";

type Row = {
  path: string;
  count: number;
};

export default function PageBreakdownTable({
  data,
}: {
  data: Row[];
}) {
  if (data.length === 0) {
    return (
      <EmptyState
      title="No page data available"
      description="Page views will appear once users navigate your site"
    />
    );
  }

  return (
    <div className="bg-white border rounded p-4 text-gray-700">
      <h2 className="text-lg font-semibold mb-4">
        Page Breakdown (last 30 days)
      </h2>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2">Page</th>
            <th className="py-2 text-right">
              Page Views
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row.path}
              className="border-b last:border-0"
            >
              <td className="py-2 font-mono">
                {row.path}
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
