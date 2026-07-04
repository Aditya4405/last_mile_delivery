import React from 'react';
import { Link } from 'react-router-dom';
import { FiShield, FiMapPin, FiTruck, FiArrowRight, FiActivity } from 'react-icons/fi';

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col justify-between selection:bg-brand-500 selection:text-white overflow-hidden relative font-sans">
      
      {/* Background Glowing Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none"></div>

      {/* Header Navigation */}
      <header className="border-b border-slate-800/60 backdrop-blur-md bg-[#0b0f19]/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <FiActivity className="h-5.5 w-5.5 text-white" />
            </div>
            <span className="text-lg font-black tracking-wider text-white font-mono">
              LogiTrack
            </span>
          </div>

          <div className="flex items-center gap-6">
            <Link 
              to="/login" 
              className="text-xs font-bold text-slate-300 hover:text-white transition-colors uppercase tracking-wider"
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="text-xs font-bold bg-white text-slate-900 px-5 py-2.5 rounded-full hover:bg-slate-100 transition-all hover:scale-105 shadow-md shadow-white/5 active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero & Portals Section */}
      <main className="max-w-6xl mx-auto px-6 py-16 flex-1 flex flex-col justify-center items-center gap-16 relative z-10">
        
        {/* Badge & Typography */}
        <div className="text-center space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-slate-800/80 border border-slate-700/50 px-4 py-2 rounded-full text-[10px] font-bold text-slate-300 tracking-widest uppercase">
            <span>🚀</span> NEXT-GEN LAST-MILE ROSTER FOUNDATION
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Scalable Last-Mile Logistics <span className="bg-gradient-to-r from-brand-400 to-indigo-400 bg-clip-text text-transparent">Perfected</span>
          </h1>
          
          <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            LogiTrack orchestrates deliveries with clean architectures, dynamic zone detections, role-based authorization structures, and plug-and-play rate card pricing modules.
          </p>
        </div>

        {/* Portal Entry Grids */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          
          {/* Admin Card */}
          <div className="bg-[#121826]/80 border border-slate-800/80 rounded-3xl p-8 hover:border-brand-500/40 hover:bg-[#141b2c] transition-all group relative overflow-hidden flex flex-col justify-between h-72 shadow-xl shadow-black/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl group-hover:bg-brand-500/10 transition-all"></div>
            
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20 text-brand-400">
                <FiShield className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-white tracking-wider uppercase">Admin Portal</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Control dynamic rate cards, view active shipment dispatches, audit delivery agents, and manage configuration settings.
                </p>
              </div>
            </div>

            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-xs font-bold text-brand-400 group-hover:text-brand-300 transition-colors pt-4"
            >
              <span>Enter Console</span>
              <FiArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Customer Card */}
          <div className="bg-[#121826]/80 border border-slate-800/80 rounded-3xl p-8 hover:border-emerald-500/40 hover:bg-[#121c27] transition-all group relative overflow-hidden flex flex-col justify-between h-72 shadow-xl shadow-black/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all"></div>
            
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                <FiMapPin className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-white tracking-wider uppercase">Customer Portal</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Book new package shipments, estimate transit pricing charges, monitor real-time tracking maps, and process payments.
                </p>
              </div>
            </div>

            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors pt-4"
            >
              <span>Book Shipment</span>
              <FiArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Agent Card */}
          <div className="bg-[#121826]/80 border border-slate-800/80 rounded-3xl p-8 hover:border-indigo-500/40 hover:bg-[#151a2d] transition-all group relative overflow-hidden flex flex-col justify-between h-72 shadow-xl shadow-black/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all"></div>
            
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
                <FiTruck className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-white tracking-wider uppercase">Agent Portal</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Toggle online shift availability, view assigned routing directions, and update delivery statuses at drop-offs.
                </p>
              </div>
            </div>

            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors pt-4"
            >
              <span>View Duty</span>
              <FiArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900/60 py-6 text-center text-[10px] text-slate-500 tracking-wider relative z-10">
        © {new Date().getFullYear()} LogiTrack Logistics Network. All rights reserved.
      </footer>

    </div>
  );
};

export default Landing;
