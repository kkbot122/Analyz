"use client";

import { useRouter, useSearchParams } from "next/navigation";

const RANGES = [7, 30, 90];

interface TimeRangeSelectorProps {
  selected: number;
  projectId: string; // 1. Add projectId to interface
}

export default function TimeRangeSelector({
  selected,
  projectId, // 2. Destructure it here
}: TimeRangeSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setRange(days: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", String(days));
    
    // 3. Use template literal to include projectId
    router.push(`/projects/${projectId}?${params.toString()}`);
  }

  return (
    <div className="flex gap-2">
      {RANGES.map((days) => (
        <button
          key={days}
          onClick={() => setRange(days)}
          className={`px-3 py-1 rounded text-sm border transition-colors ${
            selected === days
              ? "bg-black text-white border-black"
              : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
          }`}
        >
          {days}d
        </button>
      ))}
    </div>
  );
}