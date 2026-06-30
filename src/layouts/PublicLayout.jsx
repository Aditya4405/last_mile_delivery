import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants';
import { FiTrendingUp } from 'react-icons/fi';

const PublicLayout = () => {
  const { user, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated && user) {
    if (user.role === ROLES.ADMIN) return <Navigate to="/admin" replace />;
    if (user.role === ROLES.CUSTOMER) return <Navigate to="/customer" replace />;
    if (user.role === ROLES.AGENT) return <Navigate to="/agent" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="w-full max-w-md">
        {/* Brand Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-600 dark:bg-brand-500 shadow-md">
            <FiTrendingUp className="h-6 w-6 text-white" />
            <span className="text-xl font-extrabold text-white tracking-tight">
              SwiftRoute
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 font-medium tracking-wide uppercase">
            Last-Mile Operations Telemetry
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white dark:bg-slate-800 py-8 px-6 sm:px-10 rounded-2xl border border-slate-200 dark:border-slate-750 shadow-hover transition-all">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default PublicLayout;
