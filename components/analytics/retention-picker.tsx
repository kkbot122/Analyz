"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Repeat, Settings2, X, Check } from "lucide-react";

interface RetentionPickerProps {
  availableEvents: string[];
  currentEvent: string;
  eventDictionary?: Record<string, string>;
}

export default function RetentionPicker({ availableEvents, currentEvent, eventDictionary = {} }: RetentionPickerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const applyRetentionEvent = (eventName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("retentionEvent", eventName);
    router.push(`?${params.toString()}`, { scroll: false });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Trigger */}
      <button 
        onClick={() => setIsOpen(true)}
        className="font-bold text-gray-900 text-sm flex items-center gap-2 hover:bg-gray-50 -ml-2 px-2 py-1 rounded-lg transition-colors"
      >
        <Repeat className="w-4 h-4 text-gray-400" />
        Retention: <span className="text-black underline decoration-gray-300 underline-offset-2">{eventDictionary[currentEvent] || currentEvent}</span>
        <Settings2 className="w-3 h-3 text-gray-300 ml-1" />
      </button>

      {/* Popover */}
      {isOpen && (
        <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            
            <div className="absolute top-8 left-0 z-50 w-[280px] bg-white rounded-2xl shadow-xl border border-gray-200 p-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-500 uppercase">Cohort Entry Event</span>
                    <button onClick={() => setIsOpen(false)}>
                        <X className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                    Select the event that adds a user to the retention cohort. We track if they return after this action.
                </p>

                <div className="max-h-[200px] overflow-y-auto space-y-1 pr-1">
                    {availableEvents.map(event => (
                        <button
                            key={event}
                            onClick={() => applyRetentionEvent(event)}
                            className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                                currentEvent === event 
                                    ? "bg-black text-white font-medium" 
                                    : "text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            <span className="truncate">{eventDictionary[event] || event}</span>
                            {currentEvent === event && <Check className="w-3 h-3" />}
                        </button>
                    ))}
                </div>
            </div>
        </>
      )}
    </div>
  );
}