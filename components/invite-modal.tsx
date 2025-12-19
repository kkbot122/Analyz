"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, X, CheckCircle2, AlertCircle } from "lucide-react";

export function InviteModal({ isOpen, onClose, organizationId }: { isOpen: boolean; onClose: () => void; organizationId: string }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("TEAM_MEMBER");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const router = useRouter();

  if (!isOpen) return null;

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/invite", { // Changed endpoint
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          role,
          organizationId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Invite sent successfully");
        
        if (data.type === "existing_user") {
          // User was added immediately
          router.refresh();
        }
        
        // Reset form after delay
        setTimeout(() => {
          onClose();
          setStatus("idle");
          setEmail("");
          setMessage("");
        }, 3000);
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to send invite");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Something went wrong");
      console.error(error);
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
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-black transition-colors"
            disabled={status === "loading"}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success State */}
        {status === "success" ? (
          <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in slide-in-from-bottom-4">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-medium text-gray-900">Success!</h4>
            <p className="text-gray-500 mt-1">
              {message}
            </p>
          </div>
        ) : (
          /* Form State */
          <form onSubmit={handleInvite} className="space-y-4">
            {status === "error" && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {message}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-colors"
                disabled={status === "loading"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`border rounded-xl p-3 cursor-pointer transition-all ${role === 'TEAM_MEMBER' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input 
                    type="radio" 
                    name="role" 
                    value="TEAM_MEMBER" 
                    checked={role === "TEAM_MEMBER"}
                    onChange={(e) => setRole(e.target.value)}
                    className="sr-only"
                    disabled={status === "loading"}
                  />
                  <span className="block font-medium text-sm">Team Member</span>
                  <span className="block text-xs text-gray-500 mt-1">Read-only access</span>
                </label>

                <label className={`border rounded-xl p-3 cursor-pointer transition-all ${role === 'PROJECT_OWNER' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input 
                    type="radio" 
                    name="role" 
                    value="PROJECT_OWNER" 
                    checked={role === "PROJECT_OWNER"}
                    onChange={(e) => setRole(e.target.value)}
                    className="sr-only"
                    disabled={status === "loading"}
                  />
                  <span className="block font-medium text-sm">Project Manager</span>
                  <span className="block text-xs text-gray-500 mt-1">Can create projects</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {status === "loading" ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                "Send Invitation"
              )}
            </button>
            
            <p className="text-xs text-center text-gray-400 mt-2">
              Existing users will be added immediately. New users will receive an invitation email.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}