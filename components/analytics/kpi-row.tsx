"use client";

type KPI = {
  label: string;
  value: string | number;
};

export default function KpiRow({ kpis }: { kpis: KPI[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-gray-800">
      {kpis.map((kpi) => (
        <div key={kpi.label} className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-500">{kpi.label}</div>
          <div className="text-3xl font-bold mt-1">{kpi.value}</div>
        </div>
      ))}
    </div>
  );
}
