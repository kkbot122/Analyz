"use client";

import { Users, MousePointer2, TrendingUp, Activity, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { InfoTooltip } from "@/components/ui/tooltip";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface KpiRowProps {
  kpis: { 
    label: string; 
    value: string | number;
    explanation?: string; 
    change?: number; 
    chartData?: { date: string; value: number }[]; // ✅ ADDED: Chart Data
  }[];
}

export default function KpiRow({ kpis }: KpiRowProps) {
  const icons = [Users, MousePointer2, TrendingUp, Activity];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {kpis.map((kpi, i) => {
        const Icon = icons[i] || Activity;
        
        const change = kpi.change || 0;
        const isPositive = change > 0;
        const isNeutral = change === 0;
        
        let trendColor = "text-gray-500 bg-gray-50";
        let TrendIcon = Minus;
        
        if (!isNeutral) {
            trendColor = isPositive 
                ? "text-emerald-700 bg-emerald-50" 
                : "text-red-700 bg-red-50";
            TrendIcon = isPositive ? ArrowUp : ArrowDown;
        }

        return (
          <div 
            key={i} 
            className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow h-full relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4 relative z-10">
               <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    {kpi.label}
                  </span>
                  {kpi.explanation && <InfoTooltip content={kpi.explanation} />}
               </div>
               <div className="p-2 bg-gray-50 text-black rounded-xl">
                 <Icon className="w-4 h-4" />
               </div>
            </div>

            <div className="flex items-end justify-between gap-2 relative z-10">
                <div className="text-3xl font-black text-gray-900 tracking-tight">
                    {kpi.value.toLocaleString()}
                </div>

                {kpi.change !== undefined && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${trendColor}`}>
                        <TrendIcon className="w-3 h-3" />
                        <span>{Math.abs(change).toFixed(1)}%</span>
                    </div>
                )}
            </div>

            {/* --- SPARKLINE (Background Layer) --- */}
            {kpi.chartData && kpi.chartData.length > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-16 opacity-20 pointer-events-none">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={kpi.chartData}>
                            <defs>
                                <linearGradient id={`gradient-${i}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#000" stopOpacity={0.5}/>
                                    <stop offset="100%" stopColor="#000" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke="#000" 
                                strokeWidth={2}
                                fill={`url(#gradient-${i})`} 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
          </div>
        );
      })}
    </div>
  );
}