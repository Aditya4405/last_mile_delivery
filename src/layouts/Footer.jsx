import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 transition-colors py-5 px-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xxs text-slate-400 font-medium tracking-wide">
          © {new Date().getFullYear()} LogiTrack Logistics Pvt Ltd. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-xxs font-bold text-slate-500">
          <span className="hover:text-brand-600 cursor-pointer">SLA Agreement</span>
          <span className="text-slate-300">•</span>
          <span className="hover:text-brand-600 cursor-pointer">Route Audit Logs</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-400 font-mono">v1.2.0-Production</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
