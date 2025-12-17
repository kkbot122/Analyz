"use client";

type Step = {
  step: string;
  users: number;
};

export default function FunnelTable({
  data,
}: {
  data: Step[];
}) {
  if (data.length < 2) return null;

  const first = data[0].users;

  return (
    <div className="bg-white border rounded p-4 max-w-xl text-gray-700 ">
      <h2 className="text-lg font-semibold mb-4">
        Funnel: Page View → User Dashboard
      </h2>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2 text-left">Step</th>
            <th className="py-2 text-right">Users</th>
            <th className="py-2 text-right">Conversion</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => {
            const conversion =
              idx === 0
                ? "100%"
                : `${((row.users / first) * 100).toFixed(
                    1
                  )}%`;

            return (
              <tr
                key={row.step}
                className="border-b last:border-0"
              >
                <td className="py-2">{row.step}</td>
                <td className="py-2 text-right">
                  {row.users}
                </td>
                <td className="py-2 text-right">
                  {conversion}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
