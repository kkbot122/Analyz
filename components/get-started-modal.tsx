"use client";

import { useState, useEffect } from "react";
import {
  X,
  Copy,
  Check,
  Terminal,
  Code2,
  Activity,
  ChevronRight,
  ArrowLeft,
  FileCode,
} from "lucide-react";

interface GetStartedModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  docsUrl?: string; // Optional prop for the documentation URL
}

const STEPS = [
  { id: 1, title: "Installation", icon: Terminal },
  { id: 2, title: "Setup", icon: Code2 },
  { id: 3, title: "More Info", icon: Activity },
];

export function GetStartedModal({
  isOpen,
  onClose,
  apiKey,
  docsUrl = "https://github.com/kkbot122/Analyz-Analytics-SDK", // Default URL placeholder
}: GetStartedModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [copied, setCopied] = useState<string | null>(null);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // --- Actions ---

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // --- Helper Classes ---
  const buttonBase =
    "flex items-center justify-center transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#d9623b] disabled:opacity-50 disabled:cursor-not-allowed";

  // Code Snippets
  const installCommand = "npm install @analyz-product-analytics/analytics-sdk";

  const providerCode = `'use client';

import { useEffect } from 'react';
import { init, startPageTracking } from '@analyz-product-analytics/analytics-sdk';

export function AnalyticsProvider() {
  useEffect(() => {
    init('${apiKey}');
    startPageTracking();
  }, []);

  return null;
}`;

  return (
    // Overlay
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      {/* Modal Container */}
      <div className="bg-white w-full max-w-[650px] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 relative">
        {/* Header (Orange/Warm Theme) */}
        <div className="bg-[#FFF8F6] p-6 border-b border-orange-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-[#2D3648]">
              Connect your app
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 hover:bg-white/50 p-1 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper */}
          <div className="relative px-4">
            {/* Connecting Line */}
            <div className="absolute top-[18px] left-8 right-8 h-0.5 bg-orange-200/60 -z-0" />

            <div className="flex justify-between relative z-10">
              {STEPS.map((step) => {
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;

                return (
                  <div
                    key={step.id}
                    className="flex flex-col items-center gap-2"
                  >
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                        ${
                          isActive
                            ? "border-[#d9623b] bg-white text-[#d9623b] scale-110 shadow-lg shadow-orange-100"
                            : isCompleted
                            ? "border-[#d9623b] bg-[#d9623b] text-white"
                            : "border-orange-100 bg-[#FFF8F6] text-orange-300"
                        }
                      `}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <step.icon className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${
                        isActive ? "text-[#8a3c23]" : "text-gray-400"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8 min-h-[400px] flex flex-col">
          {/* STEP 1: Installation */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Install the SDK
                </h3>
                <p className="text-gray-500 text-sm">
                  Run this command in your project terminal to add the package.
                </p>
              </div>

              <div className="bg-[#1E293B] rounded-xl p-4 relative group border border-gray-700 shadow-inner">
                <code className="text-orange-300 font-mono text-sm block pl-2 pr-10 break-all">
                  npm install{" "}
                  <span className="text-white">
                    @analyz-product-analytics/analytics-sdk
                  </span>
                </code>
                <button
                  onClick={() => copyToClipboard(installCommand, "install")}
                  className="absolute top-3 right-3 p-2 bg-gray-700/50 hover:bg-gray-600 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  {copied === "install" ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Initialization */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in slide-in-from-right-4 fade-in duration-300">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Create Tracking Component
                </h3>
                <p className="text-gray-500 text-sm">
                  Create a file{" "}
                  <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded text-gray-700">
                    components/AnalyticsProvider.tsx
                  </span>{" "}
                  and paste this code:
                </p>
              </div>

              {/* Code Snippet */}
              <div className="bg-[#1E293B] rounded-xl p-4 relative group border border-gray-700 shadow-inner overflow-hidden">
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
                  {copied === "init" ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 flex gap-3 items-start">
                <div className="min-w-[4px] h-full bg-orange-400 rounded-full mt-1"></div>
                <p className="text-xs text-orange-800 leading-relaxed">
                  <strong>Final Step:</strong> Import this component and render
                  it inside your{" "}
                  <code className="bg-orange-100 px-1 rounded">
                    app/layout.tsx
                  </code>{" "}
                  body.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: Documentation Link */}
          {currentStep === 3 && (
            <div className="flex flex-col items-center justify-center text-center h-full py-6 animate-in slide-in-from-right-4 fade-in duration-300">
              <div className="flex flex-col items-center w-full">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  For more Information
                </h3>
                <p className="text-gray-500 text-sm mb-8">
                  Visit our documentation to explore how to use the SDK
                </p>
                {/* UPDATED: Converted Button to Anchor Link */}
                <a
                  href={docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${buttonBase} bg-[#2D3648] hover:bg-black text-white w-full py-3 rounded-xl no-underline`}
                >
                  View Documentation
                </a>
              </div>
            </div>
          )}

          {/* Footer Navigation Buttons */}
          <div className="mt-auto pt-8 flex items-center justify-between border-t border-gray-50">
            {currentStep > 1 ? (
              <button
                onClick={handleBack}
                className={`${buttonBase} text-gray-500 hover:text-gray-900 px-2 py-2 gap-2 text-sm`}
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < 3 && (
              <button
                onClick={handleNext}
                className={`${buttonBase} bg-[#2D3648] hover:bg-black text-white px-6 py-2.5 rounded-full gap-2 text-sm`}
              >
                Next Step <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}