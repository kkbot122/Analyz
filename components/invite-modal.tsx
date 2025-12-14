"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, X } from "lucide-react";

export function InviteModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("TEAM_MEMBER");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/org/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });

    setLoading(false);

    if (res.ok) {
      alert("User added successfully!");
      router.refresh();
      onClose();
      setEmail("");
    } else {
      const data = await res.json();
      alert(data.error || "Failed to invite");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-orange-50 text-[#ea582c] rounded-lg">
                <Users className="w-5 h-5" />
             </div>
             <h3 className="text-xl font-semibold">Invite Member</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <div className="grid grid-cols-2 gap-3">
                {/* Option 1: Team Member */}
                <label className={`border rounded-xl p-3 cursor-pointer transition-all ${role === 'TEAM_MEMBER' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input 
                        type="radio" 
                        name="role" 
                        value="TEAM_MEMBER" 
                        checked={role === "TEAM_MEMBER"}
                        onChange={(e) => setRole(e.target.value)}
                        className="sr-only"
                    />
                    <span className="block font-medium text-sm">Team Member</span>
                    <span className="block text-xs text-gray-500 mt-1">Read-only access</span>
                </label>

                {/* Option 2: Project Owner */}
                <label className={`border rounded-xl p-3 cursor-pointer transition-all ${role === 'PROJECT_OWNER' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input 
                        type="radio" 
                        name="role" 
                        value="PROJECT_OWNER" 
                        checked={role === "PROJECT_OWNER"}
                        onChange={(e) => setRole(e.target.value)}
                        className="sr-only"
                    />
                    <span className="block font-medium text-sm">Project Manager</span>
                    <span className="block text-xs text-gray-500 mt-1">Can create projects</span>
                </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 mt-4"
          >
            {loading ? "Adding..." : "Add to Organization"}
          </button>
        </form>
      </div>
    </div>
  );
}