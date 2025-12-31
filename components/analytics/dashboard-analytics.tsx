"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { BarChart3, ChevronDown, Filter, PieChart, Check, LayoutGrid } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, CartesianGrid } from "recharts";
import { format, subDays } from "date-fns";

interface Project {
  id: string;
  name: string;
}

interface DailyStat {
  date: string; // ISO date string (YYYY-MM-DD)
  count: number;
}

interface DashboardAnalyticsProps {
  projects: Project[];
  // Map of projectId -> Array of daily stats
  data: Record<string, DailyStat[]>;
}

export function DashboardAnalytics({ projects, data }: DashboardAnalyticsProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 1. Calculate Aggregated Stats based on selection
  const { totalViews, chartData } = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const d = subDays(new Date(), 29 - i);
      return format(d, "yyyy-MM-dd");
    });

    let currentStats: Record<string, number> = {}; // date -> count

    if (selectedProjectId === "all") {
      Object.values(data).forEach((projectDailyStats) => {
        projectDailyStats.forEach((stat) => {
          currentStats[stat.date] = (currentStats[stat.date] || 0) + stat.count;
        });
      });
    } else {
      const projectStats = data[selectedProjectId] || [];
      projectStats.forEach((stat) => {
        currentStats[stat.date] = stat.count;
      });
    }

    const finalChartData = last30Days.map((date) => ({
      date,
      views: currentStats[date] || 0,
    }));

    const total = finalChartData.reduce((acc, curr) => acc + curr.views, 0);

    return { totalViews: total, chartData: finalChartData };
  }, [selectedProjectId, data]);

  // Get current label for the dropdown
  const currentLabel = selectedProjectId === "all" 
    ? "All Projects" 
    : projects.find(p => p.id === selectedProjectId)?.name || "Unknown Project";

  // Styling Constants
  const cardClass = "bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md";

  // Empty State
  if (projects.length === 0) {
    return (
      <div className={`${cardClass} min-h-[350px] flex flex-col justify-center items-center text-center border-dashed`}>
        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 mb-4 animate-in zoom-in-50">
          <PieChart className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">No analytics yet</h3>
        <p className="text-sm text-gray-500 max-w-xs">
          Join or create a project to start visualizing your data.
        </p>
      </div>
    );
  }

  return (
    <div className={`${cardClass} flex flex-col relative z-20`}>
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
        
        {/* Metric Title */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-[#ea582c]">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total Views (30d)</p>
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">
              {totalViews.toLocaleString()}
            </h3>
          </div>
        </div>

        {/* CUSTOM DROPDOWN */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-full shadow-sm hover:border-gray-300 hover:shadow-md transition-all group min-w-[180px] justify-between"
          >
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${selectedProjectId === 'all' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                <span className="text-sm font-bold text-gray-700">{currentLabel}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 origin-top-right">
                
                {/* Header Label */}
                <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Filter by Source
                </div>

                {/* 'All Projects' Option */}
                <button
                    onClick={() => { setSelectedProjectId("all"); setIsDropdownOpen(false); }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors text-left group"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-orange-50 text-orange-600 rounded-lg">
                            <LayoutGrid className="w-4 h-4" />
                        </div>
                        <span className="text-gray-700 group-hover:text-black">All Projects</span>
                    </div>
                    {selectedProjectId === "all" && <Check className="w-4 h-4 text-orange-600" />}
                </button>

                <div className="h-px bg-gray-50 my-1 mx-2" />

                {/* Project List */}
                <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                    {projects.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => { setSelectedProjectId(p.id); setIsDropdownOpen(false); }}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors text-left group"
                        >
                            <span className="text-gray-600 group-hover:text-black truncate pl-2">{p.name}</span>
                            {selectedProjectId === p.id && <Check className="w-4 h-4 text-blue-600" />}
                        </button>
                    ))}
                </div>
            </div>
          )}
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 w-full h-[250px] min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ea582c" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#ea582c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <Tooltip
              cursor={{ stroke: "#ea582c", strokeWidth: 1, strokeDasharray: "4 4" }}
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: "16px",
                border: "1px solid #f3f4f6",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                padding: "12px 16px",
              }}
              itemStyle={{ color: "#000", fontWeight: "900", fontSize: "14px" }}
              labelStyle={{ color: "#6b7280", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}
              formatter={(value: number | undefined) => [(value || 0).toLocaleString(), "Views"]}
            />
            <XAxis 
                dataKey="date" 
                hide 
                axisLine={false}
                tickLine={false}
            />
            <Area
              type="monotone"
              dataKey="views"
              stroke="#ea582c"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorViews)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}