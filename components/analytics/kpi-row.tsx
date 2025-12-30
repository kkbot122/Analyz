import { Users, MousePointer2, TrendingUp, Activity } from "lucide-react";
import { InfoTooltip } from "@/components/ui/tooltip";

interface KpiRowProps {
  kpis: { 
    label: string; 
    value: string | number;
    explanation?: string; // Added optional explanation
  }[];
}

export default function KpiRow({ kpis }: KpiRowProps) {
  const icons = [Users, MousePointer2, TrendingUp, Activity];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {kpis.map((kpi, i) => {
        const Icon = icons[i] || Activity;
        return (
          <div 
            key={i} 
            className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow h-full"
          >
            <div className="flex justify-between items-start mb-4">
               {/* Label + Tooltip Container */}
               <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    {kpi.label}
                  </span>
                  {/* Render tooltip if explanation exists */}
                  {kpi.explanation && <InfoTooltip content={kpi.explanation} />}
               </div>

               <div className="p-2 bg-gray-50 text-black rounded-xl">
                 <Icon className="w-4 h-4" />
               </div>
            </div>
            <div className="text-3xl font-black text-gray-900 tracking-tight">
              {kpi.value.toLocaleString()}
            </div>
          </div>
        );
      })}
    </div>
  );
}