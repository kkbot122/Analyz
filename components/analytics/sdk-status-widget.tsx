import { Activity, Wifi, WifiOff, Globe, Laptop } from "lucide-react";

interface SdkStatusWidgetProps {
  lastEvent: {
    createdAt: Date;
    properties?: any; // To check for 'url' or 'host'
  } | null;
}

// Helper: Format relative time (No external lib needed)
function timeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 30) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function SdkStatusWidget({ lastEvent }: SdkStatusWidgetProps) {
  // 1. Determine Status based on time
  const now = new Date();
  let status: "live" | "idle" | "disconnected" = "disconnected";
  let timeLabel = "No data yet";
  
  if (lastEvent) {
    const diffMinutes = (now.getTime() - lastEvent.createdAt.getTime()) / 1000 / 60;
    
    if (diffMinutes < 5) status = "live";        // < 5 mins = Live
    else if (diffMinutes < 60) status = "idle";  // < 1 hour = Idle
    else status = "disconnected";                // > 1 hour = Disconnected/Offline

    timeLabel = timeAgo(lastEvent.createdAt);
  }

  // 2. Determine Environment (Dev vs Prod)
  // Assumes your SDK sends 'url' or 'host' in properties
  const url = lastEvent?.properties?.url || lastEvent?.properties?.host || "";
  const isDev = url.includes("localhost") || url.includes("127.0.0.1");
  const EnvironmentIcon = isDev ? Laptop : Globe;

  // 3. Status Styles
  const styles = {
    live: {
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
      icon: Wifi,
      label: "System Operational"
    },
    idle: {
      bg: "bg-amber-50",
      border: "border-amber-100",
      text: "text-amber-700",
      dot: "bg-amber-500",
      icon: Activity,
      label: "Waiting for events"
    },
    disconnected: {
      bg: "bg-gray-50",
      border: "border-gray-100",
      text: "text-gray-500",
      dot: "bg-gray-400",
      icon: WifiOff,
      label: "No recent data"
    }
  }[status];

  const StatusIcon = styles.icon;

  return (
    <div className={`rounded-[24px] p-6 shadow-sm border ${styles.bg} ${styles.border} mb-6`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg bg-white/60 ${styles.text}`}>
                <StatusIcon className="w-4 h-4" />
            </div>
            <span className={`text-sm font-bold ${styles.text}`}>SDK Status</span>
        </div>
        
        {/* Pulsing Dot */}
        <div className="relative flex h-3 w-3">
          {status === "live" && (
             <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${styles.dot} opacity-75`}></span>
          )}
          <span className={`relative inline-flex rounded-full h-3 w-3 ${styles.dot}`}></span>
        </div>
      </div>

      {/* Main Status Text */}
      <div className="mb-4">
        <h4 className={`text-lg font-black ${styles.text} tracking-tight`}>
            {styles.label}
        </h4>
        <p className={`text-xs font-medium ${styles.text} opacity-80 mt-1`}>
            Last heartbeat: {timeLabel}
        </p>
      </div>

      {/* Footer Info (Environment) */}
      {lastEvent && (
          <div className="pt-4 border-t border-black/5 flex items-center gap-2">
            <EnvironmentIcon className={`w-3 h-3 ${styles.text} opacity-70`} />
            <span className={`text-[10px] uppercase font-bold tracking-wider ${styles.text} opacity-70`}>
                {isDev ? "Development Env" : "Production Env"}
            </span>
          </div>
      )}
    </div>
  );
}