"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Copy,
  Check,
  Terminal,
  Code2,
  FileCode,
  Loader2,
  Zap,
  LayoutDashboard
} from "lucide-react";

interface SetupGuideProps {
  projectId: string;
}

export default function SetupGuide({ projectId }: SetupGuideProps) {
  const router = useRouter();
  const [copied, setCopied] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // --- 1. Auto-Poll for First Event ---
  useEffect(() => {
    const checkData = async () => {
      try {
        // Simple endpoint to check count (you can reuse your analytics query or make a lightweight one)
        // For now, we just refresh the page context to see if server-side counts updated
        router.refresh(); 
      } catch (e) {
        console.error(e);
      }
    };

    // Poll every 10 seconds
    const interval = setInterval(checkData, 10000);
    return () => clearInterval(interval);
  }, [router]);

  // --- 2. Copy Helper ---
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // --- 3. Code Snippets ---
  const installCommand = "npm install @analyz-product-analytics/analytics-sdk";
  const providerCode = `'use client';

import { useEffect } from 'react';
import { init, startPageTracking } from '@analyz-product-analytics/analytics-sdk';

export function AnalyticsProvider() {
  useEffect(() => {
    init('${projectId}'); // Your Project ID
    startPageTracking();
  }, []);

  return null;
}`;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-6">
           <Zap className="w-8 h-8 text-[#ed6c42]" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Let's set up your project
        </h2>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Your project is created but waiting for data. Follow these steps to send your first event.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* --- LEFT COLUMN: Instructions --- */}
        <div className="space-y-6">
          
          {/* STEP 1: Install */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 font-bold">1</div>
              <h3 className="font-bold text-gray-900">Install the SDK</h3>
            </div>
            
            <div className="bg-[#1E293B] rounded-xl p-4 relative group border border-gray-700 shadow-inner">
               <code className="text-orange-300 font-mono text-sm block pl-2 pr-10 break-all">
                 npm install <span className="text-white">@analyz-product-analytics/analytics-sdk</span>
               </code>
               <button
                 onClick={() => copyToClipboard(installCommand, "install")}
                 className="absolute top-3 right-3 p-2 bg-gray-700/50 hover:bg-gray-600 rounded-lg text-gray-400 hover:text-white transition-colors"
               >
                 {copied === "install" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
               </button>
            </div>
          </div>

          {/* STEP 2: Initialize */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 font-bold">2</div>
              <h3 className="font-bold text-gray-900">Initialize Provider</h3>
            </div>
            
            <p className="text-sm text-gray-500 mb-4">
              Create <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded text-gray-700">components/AnalyticsProvider.tsx</span>
            </p>

            <div className="bg-[#1E293B] rounded-xl p-4 relative group border border-gray-700 shadow-inner">
               <div className="flex items-center gap-2 mb-3 text-xs text-gray-400 border-b border-gray-700 pb-2">
                 <FileCode className="w-3 h-3" />
                 components/AnalyticsProvider.tsx
               </div>
               <pre className="text-gray-300 font-mono text-xs leading-relaxed overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 pb-2">
                 {providerCode}
               </pre>
               <button
                 onClick={() => copyToClipboard(providerCode, "init")}
                 className="absolute top-12 right-3 p-2 bg-gray-700/50 hover:bg-gray-600 rounded-lg text-gray-400 hover:text-white transition-colors"
               >
                 {copied === "init" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
               </button>
            </div>
          </div>

        </div>

        {/* --- RIGHT COLUMN: Status & Verification --- */}
        <div className="space-y-6">
           
           {/* Status Card */}
           <div className="bg-white rounded-2xl border border-[#ed6c42] p-8 shadow-sm text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ed6c42] to-transparent animate-pulse"></div>
              
              <div className="mx-auto w-16 h-16 bg-[#ed6c42] rounded-full flex items-center justify-center mb-4 relative">
                 <span className="absolute inline-flex h-full w-full rounded-full bg-[#ed6c42] opacity-20 animate-ping"></span>
                 <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2">Listening for events...</h3>
              <p className="text-sm text-gray-500 mb-6">
                We are waiting for the first event to arrive. Once detected, this page will automatically refresh.
              </p>

              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-200">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Live Connection</span>
              </div>
           </div>

           {/* Manual Refresh Option */}
           <div className="text-center">
             <button 
               onClick={() => router.refresh()}
               className="text-sm text-gray-400 hover:text-gray-900 font-medium underline underline-offset-4 transition-colors"
             >
               I've installed it, check again
             </button>
           </div>

        </div>
      </div>
    </div>
  );
}