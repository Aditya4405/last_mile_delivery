import React from 'react';
import { ImSpinner2 } from 'react-icons/im';

// Full Page Spinner
export const Loader = ({ message = 'Loading, please wait...' }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        <ImSpinner2 className="h-10 w-10 animate-spin text-brand-650 dark:text-brand-500" />
        {message && (
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

// Inline Spinner
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };
  return (
    <ImSpinner2 className={`animate-spin text-brand-600 dark:text-brand-500 ${sizes[size]} ${className}`} />
  );
};

// Skeleton Loader Block
export const SkeletonLoader = ({ count = 3, className = 'h-6 w-full' }) => {
  return (
    <div className="space-y-3 w-full animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`bg-slate-200 dark:bg-slate-700 rounded-lg ${className}`} />
      ))}
    </div>
  );
};

export default Loader;
