import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-905 border-t border-slate-200 dark:border-slate-800 transition-colors py-5 px-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xxs text-slate-400 dark:text-slate-500 font-medium tracking-wide">
          © {new Date().getFullYear()} SwiftRoute Logistics Inc. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-xxs font-bold text-slate-500 dark:text-slate-400">
          <span className="hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer">SLA Agreement</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer">Security Telemetry</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-slate-400 dark:text-slate-500 font-mono">v1.2.0-Production</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
