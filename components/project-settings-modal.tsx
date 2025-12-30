"use client";

import { useState, useEffect } from "react";
import { X, Target, Save, Tag, Loader2, AlertCircle, Star } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

type EventRow = {
  name: string; // Raw name
  count: number;
  title: string;
  category: string;
  isCritical: boolean;
};

export function ProjectSettingsModal({
  isOpen,
  onClose,
  projectId,
}: ProjectSettingsModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"general" | "events">("general");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Data State
  const [primaryGoal, setPrimaryGoal] = useState("");
  const [goalWindow, setGoalWindow] = useState(30);
  const [events, setEvents] = useState<EventRow[]>([]);

  // --- Fetch Data on Open ---
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetch(`/api/projects/${projectId}/settings`)
        .then((res) => res.json())
        .then((data) => {
          setPrimaryGoal(data.primaryGoal || "");
          setGoalWindow(data.goalWindow || 30);
          setEvents(data.events || []);
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  // --- ACTIONS ---

  const handleSaveGeneral = async () => {
    setIsSaving(true);
    await fetch(`/api/projects/${projectId}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ primaryGoal, goalWindow }),
    });
    setIsSaving(false);
    router.refresh(); // Refresh dashboard to update Goal Card
    onClose();
  };

  const handleSaveDefinition = async (event: EventRow) => {
    // Optimistic Update
    const newEvents = events.map((e) => (e.name === event.name ? event : e));
    setEvents(newEvents);

    await fetch(`/api/projects/${projectId}/definitions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: event.name,
        title: event.title,
        category: event.category,
        isCritical: event.isCritical,
      }),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl h-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Project Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* TABS */}
        <div className="flex gap-6 px-6 border-b border-gray-100 bg-gray-50/50">
          <button
            onClick={() => setActiveTab("general")}
            className={`py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "general"
                ? "border-[#ed6c42] text-black"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <Target className="w-4 h-4 text-[#ed6c42]" />
            General & Goals
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "events"
                ? "border-[#ed6c42] text-black"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <Tag className="w-4 h-4 text-[#ed6c42]" />
            Event Dictionary
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <>
              {/* --- TAB 1: GENERAL --- */}
              {activeTab === "general" && (
                <div className="space-y-6">
                  {/* Primary Goal Selector */}
                  <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 mb-6">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-600 shrink-0" />
                      <div className="text-sm text-orange-800">
                        <strong>Why set a goal?</strong> The dashboard is
                        currently optimizing for "Funnel Completion". Setting a
                        custom goal (like "Purchase") will update your KPI cards
                        to focus on what matters.
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Success Event
                    </label>
                    <select
                      value={primaryGoal}
                      onChange={(e) => setPrimaryGoal(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:outline-none"
                    >
                      <option value="">Select an event...</option>
                      {events.map((e) => (
                        <option key={e.name} value={e.name}>
                          {e.title ? `${e.title} (${e.name})` : e.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-2">
                      This event will replace "Conversion" on your dashboard.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Conversion Window (Days)
                    </label>
                    <input
                      type="number"
                      value={goalWindow}
                      onChange={(e) => setGoalWindow(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* --- TAB 2: EVENT DICTIONARY --- */}
              {activeTab === "events" && (
                <div>
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-gray-900">
                      Event Definitions
                    </h3>
                    <p className="text-xs text-gray-500">
                      Rename raw technical events into human-readable labels.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {events.map((event, idx) => (
                      <div
                        key={event.name}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 group"
                      >
                        {/* 1. Raw Name (Read Only) */}
                        <div className="w-1/3">
                          <div
                            className="text-xs font-mono font-bold text-gray-700 truncate"
                            title={event.name}
                          >
                            {event.name}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {event.count} occurrences
                          </div>
                        </div>

                        {/* 2. Display Name (Editable) */}
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Display Name"
                            value={event.title}
                            onChange={(e) => {
                              const newEvents = [...events];
                              newEvents[idx].title = e.target.value;
                              setEvents(newEvents);
                            }}
                            onBlur={() => handleSaveDefinition(events[idx])}
                            className="w-full px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg focus:border-black focus:outline-none"
                          />
                        </div>

                        {/* 3. Category (Editable) */}
                        <div className="w-28">
                          <select
                            value={event.category}
                            onChange={(e) => {
                              const newEvents = [...events];
                              newEvents[idx].category = e.target.value;
                              setEvents(newEvents);
                              handleSaveDefinition(newEvents[idx]); // Auto save select
                            }}
                            className="w-full px-2 py-1 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none"
                          >
                            <option value="other">Other</option>
                            <option value="acquisition">Acquisition</option>
                            <option value="activation">Activation</option>
                            <option value="retention">Retention</option>
                          </select>
                        </div>

                        <button
                          onClick={() => {
                            const newEvents = [...events];
                            newEvents[idx].isCritical =
                              !newEvents[idx].isCritical;
                            setEvents(newEvents);
                            handleSaveDefinition(newEvents[idx]);
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            event.isCritical
                              ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                              : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                          }`}
                          title="Mark as Key Metric"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              event.isCritical ? "fill-yellow-600" : ""
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* FOOTER (Only for General Tab) */}
        {activeTab === "general" && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
            <button
              onClick={handleSaveGeneral}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-[#ed6c42] text-white text-sm font-bold rounded-lg hover:bg-[#d9623b] transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
