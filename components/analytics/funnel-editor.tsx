"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowDownUp,
  Plus,
  X,
  ArrowRight,
  Settings2,
  AlertCircle,
} from "lucide-react"; // ✅ Added AlertCircle

interface FunnelEditorProps {
  availableEvents: string[];
  eventDictionary?: Record<string, string>;
}

export default function FunnelEditor({
  availableEvents,
  eventDictionary = {},
}: FunnelEditorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const [steps, setSteps] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null); // ✅ Error State

  // 1. Load Funnel from URL
  useEffect(() => {
    const funnelParam = searchParams.get("funnel");
    if (funnelParam) {
      setSteps(funnelParam.split(","));
    } else {
      setSteps(["page_view", "signup_started", "signup_completed"]);
    }
  }, [searchParams]);

  // 2. Sync to URL
  const applyFunnel = (newSteps: string[]) => {
    // ✅ VALIDATION: Prevent single-step funnels
    if (newSteps.length < 2) {
      setError("A funnel needs at least 2 steps.");
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("funnel", newSteps.join(","));

    router.push(`?${params.toString()}`, { scroll: false });
    setIsOpen(false);
    setError(null);
  };

  // --- Local Editing Logic ---
  const [localSteps, setLocalSteps] = useState<string[]>([]);

  const openEditor = () => {
    setLocalSteps([...steps]);
    setError(null);
    setIsOpen(true);
  };

  const addStep = (eventName: string) => {
    if (!eventName) return;
    setLocalSteps([...localSteps, eventName]);
    setError(null); // Clear error on action
  };

  const removeStep = (index: number) => {
    const newSteps = [...localSteps];
    newSteps.splice(index, 1);
    setLocalSteps(newSteps);
    setError(null); // Clear error on action
  };

  return (
    <div className="relative">
      <button
        onClick={openEditor}
        className="font-bold text-gray-900 text-sm flex items-center gap-2 hover:bg-gray-50 -ml-2 px-2 py-1 rounded-lg transition-colors"
      >
        <ArrowDownUp className="w-4 h-4 text-gray-400" />
        Funnel Analysis
        <Settings2 className="w-3 h-3 text-gray-300 ml-1" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute top-8 left-0 z-50 w-[320px] bg-white rounded-2xl shadow-xl border border-gray-200 p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-gray-500 uppercase">
                Edit Funnel Steps
              </span>
              <button onClick={() => setIsOpen(false)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              {localSteps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 truncate">
                    {eventDictionary[step] || step}
                  </div>
                  <button
                    onClick={() => removeStep(idx)}
                    className="text-gray-400 hover:text-red-500 p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              <div className="flex items-center gap-2">
                <div className="w-6 shrink-0" />
                <select
                  className="flex-1 px-3 py-2 bg-white border border-gray-200 border-dashed rounded-lg text-sm text-gray-500 focus:outline-none hover:border-gray-400 cursor-pointer"
                  onChange={(e) => {
                    addStep(e.target.value);
                    e.target.value = "";
                  }}
                  value=""
                >
                  <option value="" disabled>
                    + Add step...
                  </option>
                  {availableEvents.map((e) => (
                    <option key={e} value={e}>
                      {eventDictionary[e] || e}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ✅ ERROR MESSAGE DISPLAY */}
            {error && (
              <div className="mb-3 px-3 py-2 bg-red-50 text-red-600 text-xs font-medium rounded-lg flex items-center gap-2">
                <AlertCircle className="w-3 h-3" />
                {error}
              </div>
            )}

            <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => applyFunnel(localSteps)}
                className="px-3 py-1.5 bg-[#ed6c42] text-white text-xs font-bold rounded-lg hover:bg-[#d9623b] transition-colors"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
