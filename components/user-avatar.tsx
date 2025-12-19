"use client";

// Helper: Extract initials (e.g., "Kisna Kanti" -> "KK")
function getInitials(name: string | null | undefined, email: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

// Helper: Generate consistent color from initials
function getAvatarColor(initials: string): { bg: string; text: string } {
  // Simple hash to ensure "KK" always gets the same color
  const hash = initials.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  const colors = [
    { bg: "bg-red-100", text: "text-red-800" },
    { bg: "bg-orange-100", text: "text-orange-800" },
    { bg: "bg-amber-100", text: "text-amber-800" },
    { bg: "bg-green-100", text: "text-green-800" },
    { bg: "bg-emerald-100", text: "text-emerald-800" },
    { bg: "bg-teal-100", text: "text-teal-800" },
    { bg: "bg-cyan-100", text: "text-cyan-800" },
    { bg: "bg-blue-100", text: "text-blue-800" },
    { bg: "bg-indigo-100", text: "text-indigo-800" },
    { bg: "bg-violet-100", text: "text-violet-800" },
    { bg: "bg-purple-100", text: "text-purple-800" },
    { bg: "bg-fuchsia-100", text: "text-fuchsia-800" },
    { bg: "bg-pink-100", text: "text-pink-800" },
    { bg: "bg-rose-100", text: "text-rose-800" },
  ];

  return colors[Math.abs(hash) % colors.length];
}

interface UserAvatarProps {
  user: {
    name?: string | null;
    email: string;
    image?: string | null; // Kept in interface so you don't have to change parent code, but unused.
  };
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

export function UserAvatar({
  user,
  size = "md",
  showTooltip = true,
}: UserAvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  const borderClasses = size === "sm" ? "border-2" : "border-[3px]";
  const initials = getInitials(user.name, user.email);
  const colors = getAvatarColor(initials);

  return (
    <div className="relative group cursor-default select-none">
      <div
        className={`${sizeClasses[size]} ${borderClasses} border-white rounded-full ${colors.bg} ${colors.text} flex items-center justify-center font-bold shadow-sm`}
      >
        {initials}
      </div>
      
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap z-20">
          {user.name || user.email}
          {/* Arrow for tooltip */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}