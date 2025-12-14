"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FolderPlus } from "lucide-react";
import Link from "next/link";

export default function NewProjectPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function createProject() {
    if (!name.trim()) return;
    
    setLoading(true);

    try {
      // Note: Ensure your API route folder name matches this path (plural 'projects' vs singular 'project')
      const res = await fetch("/api/projects/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (res.ok) {
        // Refresh the router to update the dashboard data cache before navigating
        router.refresh();
        router.push("/dashboard");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create project");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-black selection:bg-orange-200">
      {/* Simple Navbar */}
      <nav className="border-b border-transparent">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-20">
            <Link 
              href="/dashboard" 
              className="flex items-center text-sm font-medium text-gray-500 hover:text-black transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-md mx-auto px-4 py-12 md:py-20">
        {/* Hero / Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-6">
            <FolderPlus className="w-8 h-8 text-[#ea582c]" />
          </div>
          
          <h1 className="text-3xl font-medium tracking-tight mb-3">
            Create a new project
          </h1>
          
          <p className="text-gray-500 text-lg">
            Projects hold your analytics data and settings.
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Marketing Site, Mobile App"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-colors text-lg placeholder-gray-400"
                disabled={loading}
                autoFocus
              />
            </div>

            <button
              onClick={createProject}
              disabled={!name.trim() || loading}
              className="w-full bg-black text-white py-3.5 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-lg"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </button>
        </div>
      </main>
    </div>
  );
}