import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Check, Bell } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-black selection:bg-orange-200">
      {/* Navbar */}
      <nav className="border-b border-transparent">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-black tracking-tight">Analyz</span>
            </div>

            {/* Centered Links */}
            <div className="hidden md:flex space-x-8 items-center text-sm font-medium text-gray-900">
              <Link href="#" className="flex items-center hover:text-black transition-colors">
                Automations <ChevronDown className="ml-1 w-4 h-4" />
              </Link>
              <Link href="#" className="flex items-center hover:text-black transition-colors">
                Integrations <ChevronDown className="ml-1 w-4 h-4" />
              </Link>
              <Link href="#" className="hover:text-black transition-colors">
                Reports
              </Link>
              <Link href="#" className="hover:text-black transition-colors">
                Pricing & Plans
              </Link>
            </div>

            {/* Right Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/auth/login" className="text-sm font-medium hover:text-gray-600">
                Log in
              </Link>
              <Link href="/auth/register" className="text-sm font-medium bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        
        {/* Hero Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end mb-16">
          {/* Left: Heading */}
          <div>
            <h1 className="text-5xl md:text-7xl font-medium tracking-tight leading-[1.1]">
              Track Behavior. Manage Projects. Grow Smarter.
            </h1>
          </div>

          {/* Right: Subtext + CTA */}
          <div className="lg:pl-10 pb-2">
            <p className="text-lg text-gray-700 mb-8 max-w-md leading-relaxed">
              Gain real-time insights to optimize your sales process, identify
              opportunities for growth, and keep your clients engaged at every
              step of their journey.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-black text-white px-8 py-3.5 rounded-xl font-medium hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl">
                Get Started
              </button>
              <button className="bg-[#f3f3f1] text-black px-8 py-3.5 rounded-xl font-medium hover:bg-[#e5e5e3] transition-colors">
                Find your plan
              </button>
            </div>
          </div>
        </div>

        {/* Bento Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[500px]">
          
          {/* Card 1: Orange Feature List (Span 3) */}
          <div className="md:col-span-3 bg-[#ea582c] rounded-3xl p-8 flex flex-col justify-between text-black relative overflow-hidden group">
            <div>
              <span className="text-xl font-medium opacity-80">Featured</span>
            </div>
            {/* Hover effect gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>

            <div className="space-y-4 mt-8">
              {['Sales Analytics', 'Client Tracking', 'Custom Reports', 'Automation Workflows'].map((item, idx) => (
                <div key={idx} className="border-b border-black/20 pb-3 last:border-0 cursor-pointer hover:pl-2 transition-all">
                  <span className="text-lg font-regular">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Illustration/Dashboard Mockup (Span 5) */}
          <div className="md:col-span-5 bg-[#f4f4f0] rounded-3xl relative overflow-hidden flex flex-col justify-center items-center p-8">
            
            {/* Mock Floating Elements */}
            <div className="absolute top-8 left-8 bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 w-64 z-10">
              <div className="relative w-10 h-10">
                {/* CSS Donut Chart */}
                <div className="w-10 h-10 rounded-full border-4 border-gray-100 border-t-black transform -rotate-45"></div>
              </div>
              <div>
                <div className="text-lg font-bold leading-none">68% <span className="text-gray-400 text-sm font-normal">/ 12,800</span></div>
                <div className="text-xs text-gray-500 mt-1">Customer Retention</div>
              </div>
              <span className="ml-auto bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded">80%</span>
            </div>

            {/* Central Illustration Placeholder */}
            {/* Note: I used an SVG here to mimic the drawing in the image */}
            <div className="relative w-full h-64 mt-12">
               <svg viewBox="0 0 400 300" className="w-full h-full text-black" fill="none" stroke="currentColor" strokeWidth="1.5">
                  {/* Abstract Person */}
                  <path d="M200 150 C200 150 160 180 160 220 L160 300 L240 300 L240 220 C240 180 200 150 200 150 Z" fill="white" stroke="black"/>
                  <circle cx="200" cy="120" r="30" fill="white" stroke="black"/>
                  {/* Abstract Charts */}
                  <rect x="250" y="180" width="80" height="120" rx="8" fill="white" stroke="black"/>
                  <path d="M270 240 L290 220 L310 260" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="70" y="140" width="100" height="80" rx="8" fill="white" stroke="black"/>
                  <line x1="80" y1="160" x2="160" y2="160" opacity="0.2" stroke="black"/>
                  <line x1="80" y1="175" x2="140" y2="175" opacity="0.2" stroke="black"/>
               </svg>

               {/* "Task Completed" Badge */}
               <div className="absolute top-1/2 left-0 bg-black text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-xl transform -translate-y-4 -translate-x-2">
                 <div className="bg-white/20 p-0.5 rounded-full">
                   <Check className="w-3 h-3" />
                 </div>
                 <span className="text-sm font-medium">Task Completed</span>
               </div>
            </div>

            {/* Bottom Notification */}
            <div className="absolute bottom-6 right-6 bg-white p-3 pr-8 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3 animate-pulse">
               <div className="bg-yellow-300 p-2 rounded-lg">
                 <Bell className="w-4 h-4 text-black" />
               </div>
               <div>
                 <div className="text-xs font-bold text-black">New lead added.</div>
                 <div className="text-[10px] text-gray-500">Follow up to maximize conversions.</div>
               </div>
               <span className="absolute top-3 right-3 text-[9px] text-gray-400">just now</span>
            </div>
          </div>

          {/* Card 3: Photo (Span 4) */}
          <div className="md:col-span-4 rounded-3xl overflow-hidden relative min-h-[300px] md:min-h-0">
             {/* Using a placeholder from Unsplash that matches the vibe */}
             <Image 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2576&auto=format&fit=crop"
                alt="Woman working on laptop"
                fill
                className="object-cover"
              />
          </div>

        </div>
      </main>
    </div>
  );
}