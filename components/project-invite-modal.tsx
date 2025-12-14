"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, X, CheckCircle2, AlertCircle } from "lucide-react";

export function ProjectInviteModal({ 
  isOpen, 
  onClose, 
  projectId 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  projectId: string; 
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER"); // Default role
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  if (!isOpen) return null;

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/projects/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          projectId, 
          role // Pass the selected role here
        }),
      });

      if (res.ok) {
        setStatus("success");
        router.refresh();
        setTimeout(() => {
            onClose();
            setStatus("idle");
            setEmail("");
            setRole("MEMBER"); // Reset role
        }, 2000);
      } else {
        const data = await res.json();
        setErrorMessage(data.error || "Failed to invite");
        setStatus("error");
      }
    } catch (error) {
      setErrorMessage("Something went wrong");
      setStatus("error");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 relative overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <UserPlus className="w-5 h-5" />
             </div>
             <h3 className="text-xl font-semibold">Add to Project</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success View */}
        {status === "success" ? (
             <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in slide-in-from-bottom-4">
                <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-medium text-gray-900">Invite Sent!</h4>
                <p className="text-gray-500 mt-1">
                    {email} has been added as a {role === 'OWNER' ? 'Manager' : 'Member'}.
                </p>
            </div>
        ) : (
            /* Form View */
            <form onSubmit={handleInvite} className="space-y-4">
            
            {status === "error" && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errorMessage}
                </div>
            )}

            {/* Email Input */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Email</label>
                <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-colors"
                    disabled={status === "loading"}
                />
            </div>

            {/* Role Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Role</label>
                <div className="grid grid-cols-2 gap-3">
                    {/* Option 1: Member */}
                    <label className={`border rounded-xl p-3 cursor-pointer transition-all ${role === 'MEMBER' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input 
                            type="radio" 
                            name="projectRole" 
                            value="MEMBER" 
                            checked={role === "MEMBER"}
                            onChange={(e) => setRole(e.target.value)}
                            className="sr-only"
                            disabled={status === "loading"}
                        />
                        <span className={`block font-medium text-sm ${role === 'MEMBER' ? 'text-blue-900' : 'text-gray-900'}`}>Member</span>
                        <span className={`block text-xs mt-1 ${role === 'MEMBER' ? 'text-blue-700' : 'text-gray-500'}`}>Standard access</span>
                    </label>

                    {/* Option 2: Owner */}
                    <label className={`border rounded-xl p-3 cursor-pointer transition-all ${role === 'OWNER' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input 
                            type="radio" 
                            name="projectRole" 
                            value="OWNER" 
                            checked={role === "OWNER"}
                            onChange={(e) => setRole(e.target.value)}
                            className="sr-only"
                            disabled={status === "loading"}
                        />
                        <span className={`block font-medium text-sm ${role === 'OWNER' ? 'text-blue-900' : 'text-gray-900'}`}>Manager</span>
                        <span className={`block text-xs mt-1 ${role === 'OWNER' ? 'text-blue-700' : 'text-gray-500'}`}>Full project control</span>
                    </label>
                </div>
            </div>

            <div className="pt-2">
                <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {status === "loading" ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Adding...
                        </>
                    ) : (
                        "Add Member"
                    )}
                </button>
                <p className="text-xs text-center text-gray-400 mt-3">
                    User will be added to the Organization automatically.
                </p>
            </div>
            </form>
        )}
      </div>
    </div>
  );
}