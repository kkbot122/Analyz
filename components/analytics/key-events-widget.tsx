import { Star, ArrowRight } from "lucide-react";

interface KeyEvent {
  eventName: string;
  count: number;
}

interface KeyEventsWidgetProps {
  data: KeyEvent[];
  onOpenSettings?: () => void; // Optional: Could link to settings later
}

export default function KeyEventsWidget({ data }: KeyEventsWidgetProps) {
  return (
    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-yellow-100 flex flex-col h-[300px] relative overflow-hidden">
      {/* Decorative Background Gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

      {/* Header */}
      <div className="font-bold text-gray-900 text-sm mb-6 flex items-center gap-2 relative z-10">
        <div className="p-1.5 bg-yellow-100 text-yellow-700 rounded-lg">
          <Star className="w-4 h-4 fill-yellow-500" />
        </div>
        Key Metrics
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-2 -mr-2 relative z-10">
        {data.length === 0 ? (
          // --- EMPTY STATE ---
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mb-3">
              <Star className="w-5 h-5 text-gray-300" />
            </div>
            <p className="text-sm font-bold text-gray-900">No pinned events</p>
            <p className="text-xs text-gray-500 max-w-[180px] mt-1">
              Go to <span className="font-bold">Settings &gt; Event Dictionary</span> to pin critical events here.
            </p>
          </div>
        ) : (
          // --- LIST STATE ---
          <div className="space-y-3">
            {data.map((event, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 hover:bg-yellow-50/50 transition-colors group border border-transparent hover:border-yellow-100"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
                  <span className="text-sm font-medium text-gray-700 truncate group-hover:text-gray-900">
                    {event.eventName}
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-900 font-mono">
                  {event.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}