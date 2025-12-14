import Link from "next/link";
import {
  ChevronDown,
  Check,
  Bell,
  BarChart3,
  Zap,
  ArrowRight,
  Layout,
  Users,
  CheckCircle2,
  Command,
  Twitter,
  Linkedin,
  Github,
  Youtube,
  ShieldCheck, // New icon
  Activity,    // New icon
  Globe,       // New icon
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-black selection:bg-orange-200 font-sans">
      {/* Navbar */}
      <nav className="border-b border-transparent sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight">Analyz</span>
            </div>

            {/* Centered Links */}
            <div className="hidden md:flex space-x-8 items-center text-sm font-medium text-gray-900">
              <Link href="#" className="flex items-center hover:text-black transition-colors">
                Platform <ChevronDown className="ml-1 w-4 h-4" />
              </Link>
              <Link href="#" className="flex items-center hover:text-black transition-colors">
                Solutions <ChevronDown className="ml-1 w-4 h-4" />
              </Link>
              <Link href="#" className="hover:text-black transition-colors">
                Pricing
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
        
        {/* 1. Hero Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end mb-16">
          <div>
            <h1 className="text-5xl md:text-7xl font-medium tracking-tight leading-[1.1]">
              Track Behavior. Manage Projects. Grow Smarter.
            </h1>
          </div>
          <div className="lg:pl-10 pb-2">
            <p className="text-lg text-gray-700 mb-8 max-w-md leading-relaxed">
              Gain real-time insights to optimize your sales process, identify
              opportunities for growth, and keep your clients engaged at every
              step of their journey.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/auth/register" className="bg-black text-white px-8 py-3.5 rounded-xl font-medium hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl">
                Get Started
              </Link>
              <button className="bg-[#f3f3f1] text-black px-8 py-3.5 rounded-xl font-medium hover:bg-[#e5e5e3] transition-colors">
                Find your plan
              </button>
            </div>
          </div>
        </div>

        {/* 2. Bento Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[500px]">
          
          {/* Card 1: Orange Feature List (Span 3) */}
          <div className="md:col-span-3 bg-[#ea582c] rounded-3xl p-8 flex flex-col justify-between text-black relative overflow-hidden group">
            <div><span className="text-xl font-medium opacity-80">Featured</span></div>
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
            <div className="absolute top-8 left-8 bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 w-64 z-10">
              <div className="relative w-10 h-10">
                <div className="w-10 h-10 rounded-full border-4 border-gray-100 border-t-black transform -rotate-45"></div>
              </div>
              <div>
                <div className="text-lg font-bold leading-none">68% <span className="text-gray-400 text-sm font-normal">/ 12,800</span></div>
                <div className="text-xs text-gray-500 mt-1">Customer Retention</div>
              </div>
              <span className="ml-auto bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded">80%</span>
            </div>
            <div className="relative w-full h-64 mt-12">
               <svg viewBox="0 0 400 300" className="w-full h-full text-black" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M200 150 C200 150 160 180 160 220 L160 300 L240 300 L240 220 C240 180 200 150 200 150 Z" fill="white" stroke="black"/>
                  <circle cx="200" cy="120" r="30" fill="white" stroke="black"/>
                  <rect x="250" y="180" width="80" height="120" rx="8" fill="white" stroke="black"/>
                  <path d="M270 240 L290 220 L310 260" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="70" y="140" width="100" height="80" rx="8" fill="white" stroke="black"/>
                  <line x1="80" y1="160" x2="160" y2="160" opacity="0.2" stroke="black"/>
                  <line x1="80" y1="175" x2="140" y2="175" opacity="0.2" stroke="black"/>
               </svg>
               <div className="absolute top-1/2 left-0 bg-black text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-xl transform -translate-y-4 -translate-x-2">
                 <div className="bg-white/20 p-0.5 rounded-full"><Check className="w-3 h-3" /></div>
                 <span className="text-sm font-medium">Task Completed</span>
               </div>
            </div>
            <div className="absolute bottom-6 right-6 bg-white p-3 pr-8 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3">
               <div className="bg-yellow-300 p-2 rounded-lg"><Bell className="w-4 h-4 text-black" /></div>
               <div>
                 <div className="text-xs font-bold text-black">New lead added.</div>
                 <div className="text-[10px] text-gray-500">Follow up to maximize conversions.</div>
               </div>
               <span className="absolute top-3 right-3 text-[9px] text-gray-400">just now</span>
            </div>
          </div>

          {/* Card 3: NEW Infrastructure/Security Card (Dark Theme) (Span 4) */}
          <div className="md:col-span-4 bg-zinc-800 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden text-white">
             {/* Content */}
             <div className="relative z-10">
                <h2 className="text-xl font-semibold tracking-tight text-balance mb-6">
                   Secure, scalable infrastructure
                </h2>
                <div className="space-y-6">
                    {/* Item 1 */}
                   <div className="flex gap-4">
                      <div className="bg-zinc-800 p-2 rounded-lg h-fit">
                         <ShieldCheck className="w-5 h-5 text-[#ea582c]" />
                      </div>
                      <div>
                         <h3 className="font-medium text-zinc-100">Enterprise Security</h3>
                         <p className="text-sm text-zinc-400 mt-1">Bank-grade encryption and automated audit logs.</p>
                      </div>
                   </div>
                   {/* Item 2 */}
                    <div className="flex gap-4">
                      <div className="bg-zinc-800 p-2 rounded-lg h-fit">
                         <Activity className="w-5 h-5 text-[#ea582c]" />
                      </div>
                      <div>
                         <h3 className="font-medium text-zinc-100">99.99% Uptime</h3>
                         <p className="text-sm text-zinc-400 mt-1">Redundant systems ensure your data is always available.</p>
                      </div>
                   </div>
                   {/* Item 3 */}
                   <div className="flex gap-4">
                      <div className="bg-zinc-800 p-2 rounded-lg h-fit">
                         <Globe className="w-5 h-5 text-[#ea582c]" />
                      </div>
                      <div>
                         <h3 className="font-medium text-zinc-100">Global Scale</h3>
                         <p className="text-sm text-zinc-400 mt-1">Deploy locally, scale globally with our edge network.</p>
                      </div>
                   </div>
                </div>
             </div>

             {/* Decorative Graph/Activity Visual at bottom */}
             <div className="mt-8 relative h-24 w-full bg-zinc-800/50 rounded-xl border border-zinc-700/50 overflow-hidden">
                 <svg className="absolute bottom-0 left-0 right-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 300 150">
                    <defs>
                       <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#ea582c" stopOpacity="0.5" />
                          <stop offset="100%" stopColor="#ea582c" stopOpacity="0" />
                       </linearGradient>
                    </defs>
                    <path d="M0 100 C 50 100, 70 40, 110 70 C 150 100, 170 30, 210 60 C 250 90, 270 50, 300 40 L 300 150 L 0 150 Z" fill="url(#gradient)" />
                    <path d="M0 100 C 50 100, 70 40, 110 70 C 150 100, 170 30, 210 60 C 250 90, 270 50, 300 40" stroke="#ea582c" strokeWidth="2" fill="none" />
                 </svg>
             </div>
          </div>

        </div>

        {/* 3. Features Section */}
        <div className="flex flex-col gap-24 mt-24 md:mt-32">
          {/* Feature 1 */}
          <div className="items-center grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-24">
            <div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-zinc-900 text-balance">
                Unlock the power of data-driven insights
              </h2>
              <p className="text-base mt-4 font-medium text-zinc-500 leading-relaxed">
                Analyze key metrics instantly to guide strategic decisions and stay
                ahead of the curve. Our unified dashboard brings clarity to chaos.
              </p>
              <ul className="mt-8 text-base font-medium text-zinc-900 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                {["Real-time analytics", "Actionable insights", "Proactive security", "Unified integrations"].map((feature, i) => (
                  <li key={i}>
                    <div className="relative flex flex-row items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#ea582c]" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            {/* Visual Placeholder */}
            <div className="p-8 pb-0 overflow-hidden md:order-first bg-zinc-50 rounded-2xl border border-gray-100 min-h-[300px] flex items-end justify-center relative">
               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-10"><BarChart3 className="w-48 h-48 text-black" /></div>
               <div className="w-full h-56 bg-white shadow-[0_0_40px_-15px_rgba(0,0,0,0.1)] rounded-t-xl border border-gray-100 p-6">
                  <div className="flex gap-2 mb-6">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 bg-gray-100 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-100 rounded w-1/2"></div>
                    <div className="flex gap-2 mt-4 items-end h-24">
                      <div className="w-8 bg-[#ea582c] opacity-20 h-12 rounded-t"></div>
                      <div className="w-8 bg-[#ea582c] opacity-40 h-16 rounded-t"></div>
                      <div className="w-8 bg-[#ea582c] opacity-60 h-10 rounded-t"></div>
                      <div className="w-8 bg-[#ea582c] h-20 rounded-t"></div>
                      <div className="w-8 bg-[#ea582c] opacity-80 h-14 rounded-t"></div>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="items-center grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-24 md:flex-row-reverse">
            <div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-zinc-900 text-balance">
                Automate and scale your workflows
              </h2>
              <p className="text-base mt-4 font-medium text-zinc-500 leading-relaxed">
                Streamline tasks with automated processes and robust integration support. Focus on the work that matters.
              </p>
              <ul className="mt-8 text-base font-medium text-zinc-900 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                 {["Smart triggers", "API connectivity", "Instant notifications", "Team collaboration"].map((feature, i) => (
                  <li key={i}>
                    <div className="relative flex flex-row items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#ea582c]" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            {/* Visual Placeholder */}
            <div className="p-8 pb-0 overflow-hidden bg-zinc-50 rounded-2xl border border-gray-100 min-h-[300px] flex flex-col justify-center relative">
               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-10"><Zap className="w-48 h-48 text-black" /></div>
               <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-3 w-3/4">
                    <div className="bg-blue-100 p-2 rounded-lg"><Bell className="w-4 h-4 text-blue-600"/></div>
                    <div className="text-sm font-medium">New Lead Received</div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 rotate-90" />
                   <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-3 w-3/4">
                    <div className="bg-[#ea582c]/20 p-2 rounded-lg"><Zap className="w-4 h-4 text-[#ea582c]"/></div>
                    <div className="text-sm font-medium">Auto-assign to Sales</div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* 4. How It Works (Steps) Section */}
        <div className="mt-32">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-zinc-900 text-balance">
              Get started in four simple steps
            </h2>
            <p className="text-base mt-4 font-medium text-zinc-500">
              Complete these quick steps to launch your organization and start managing your projects in no time.
            </p>
          </div>

          <div className="relative max-w-xl mx-auto mt-12">
            <div className="absolute left-[11px] top-2 bottom-2 w-px bg-zinc-200"></div>
            <div className="relative space-y-8">
              {[
                { icon: Users, title: "Create your account", text: "Sign up in seconds with your email and password to get started." },
                { icon: Layout, title: "Create Organization", text: "Set up your workspace and invite your initial team members." },
                { icon: BarChart3, title: "Launch first Project", text: "Initialize your first analytics project and get your API keys." },
                { icon: Zap, title: "Start Tracking", text: "Integrate our SDK and watch real-time data flow into your dashboard." }
              ].map((step, idx) => (
                <div key={idx} className="relative pl-10">
                  <div className={`absolute top-0 left-0 flex items-center justify-center rounded-full w-6 h-6 ring-4 ring-white ${idx === 0 ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-500'}`}>
                    <span className="text-xs font-bold">{idx + 1}</span>
                  </div>
                  <div className="p-5 shadow-sm bg-gradient-to-b from-zinc-50 to-zinc-100/50 border border-zinc-100 rounded-xl hover:border-zinc-300 transition-colors">
                    <h3 className="text-base font-semibold tracking-tight text-zinc-900 flex items-center gap-2">
                      <step.icon className="w-4 h-4 text-[#d9623b]" />
                      {step.title}
                    </h3>
                    <p className="text-sm text-zinc-500 mt-1">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>

      {/* 5. Footer */}
      <footer className="border-t border-gray-100 bg-zinc-50/50 mt-24 md:mt-32">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-x-8 gap-y-24">
                <div className="col-span-full md:col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl font-black tracking-tight">Analyz</span>
                    </div>
                    <p className="text-sm text-gray-500">
                        Empowering teams to track, analyze, and optimize project workflows in real-time.
                    </p>
                </div>
                {/* Links ... (Collapsed for brevity, same as previous) */}
                <div className="space-y-4">
                  <h2 className="text-base font-semibold text-zinc-900">Company</h2>
                  <ul className="mt-4 space-y-2">
                    {['About', 'Mission', 'Leadership Team'].map((item) => (
                      <li key={item}><a href="#" className="text-sm font-medium text-zinc-600 hover:text-black transition-colors">{item}</a></li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-4">
                  <h2 className="text-base font-semibold text-zinc-900">Services</h2>
                  <ul className="mt-4 space-y-2">
                    {['Marketing', 'Analytics', 'Insights'].map((item) => (
                      <li key={item}><a href="#" className="text-sm font-medium text-zinc-600 hover:text-black transition-colors">{item}</a></li>
                    ))}
                  </ul>
                </div>
                 <div className="space-y-4">
                  <h2 className="text-base font-semibold text-zinc-900">Resources</h2>
                  <ul className="mt-4 space-y-2">
                    {['Documentation', 'Guides'].map((item) => (
                      <li key={item}><a href="#" className="text-sm font-medium text-zinc-600 hover:text-black transition-colors">{item}</a></li>
                    ))}
                  </ul>
                </div>
                 <div className="space-y-4">
                  <h2 className="text-base font-semibold text-zinc-900">Support</h2>
                  <ul className="mt-4 space-y-2">
                    {['Pricing', 'API Status'].map((item) => (
                      <li key={item}><a href="#" className="text-sm font-medium text-zinc-600 hover:text-black transition-colors">{item}</a></li>
                    ))}
                  </ul>
                </div>
            </div>
            <div className="flex flex-col justify-between pt-12 mt-12 border-t gap-8 sm:flex-row sm:items-center border-zinc-200">
                <h2 className="text-sm font-medium text-zinc-400">
                    Copyright © 2025 <span className="text-[#ea582c] font-bold">Analyz</span>. All rights reserved.
                </h2>
                <div className="flex items-center gap-4 text-zinc-500">
                    <a href="#" className="hover:text-black transition-colors"><Twitter className="w-5 h-5" /></a>
                    <a href="#" className="hover:text-black transition-colors"><Linkedin className="w-5 h-5" /></a>
                    <a href="#" className="hover:text-black transition-colors"><Github className="w-5 h-5" /></a>
                    <a href="#" className="hover:text-black transition-colors"><Youtube className="w-5 h-5" /></a>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
}