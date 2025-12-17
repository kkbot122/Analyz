"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function CreateOrgPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 1. Get 'status' to check if session is ready
  const { update, status } = useSession();

  async function createOrg() {
    if (!name.trim()) return;

    // 2. SAFETY CHECK: Block request if session isn't ready
    if (status !== "authenticated") {
      alert("Session is initializing. Please wait a moment and try again.");
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await fetch("/api/org/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      // 3. Handle 401 specifically (Race condition fallback)
      if (res.status === 401) {
         window.location.reload(); // Force session refresh
         return;
      }

      if (res.ok) {
        await update();
        
        // Wait a moment for session to sync
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        router.refresh(); // Refresh server components
        router.push("/dashboard");
      } else {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          alert(data.error || "Failed to create organization");
        } catch {
          console.error("Server Error Response:", text);
          alert("Server error occurred. Check browser console for details.");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Optional: Show a loading state if session is still figuring itself out
  const isSessionLoading = status === "loading";

  return (
    <div className="min-h-screen bg-white text-black selection:bg-orange-200">
      {/* Navbar - Matches Landing Page */}
      <nav className="border-b border-transparent">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-black tracking-tight">
                Analyz
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Hero Section */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-50 rounded-2xl mb-6">
            <Building className="w-10 h-10 text-[#ea582c]" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight leading-[1.1] mb-4">
            Start your first organization
          </h1>
          
          <p className="text-lg text-gray-700 leading-relaxed max-w-lg mx-auto">
            Create an organization to manage projects, invite team members, and track analytics in one place.
          </p>
        </div>

        {/* Form Section */}
        <div className="max-w-md mx-auto">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your organization name"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-colors text-lg placeholder-gray-400"
                disabled={loading || isSessionLoading}
              />
              <p className="text-sm text-gray-500 mt-2">
                This will be the name of your workspace
              </p>
            </div>

            <button
              onClick={createOrg}
              // 4. Disable button while session is loading
              disabled={!name.trim() || loading || isSessionLoading}
              className="w-full bg-black text-white py-3.5 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {loading || isSessionLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {isSessionLoading ? "Initializing..." : "Creating..."}
                </>
              ) : (
                "Create Organization"
              )}
            </button>

            <div className="mt-8 pt-8 border-t border-gray-100">
              <p className="text-sm text-gray-600 text-center">
                You'll become the <span className="font-medium text-black">Organization Owner</span> with full access to all features.
              </p>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Need help? <a href="#" className="text-black font-medium hover:underline">Read our guide</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}