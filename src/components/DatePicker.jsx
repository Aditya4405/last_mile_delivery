import React, { forwardRef } from 'react';
import { FiCalendar } from 'react-icons/fi';

const DatePicker = forwardRef(({
  label,
  name,
  error,
  required = false,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-slate-700 dark:text-slate-350 mb-1.5"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative rounded-lg shadow-subtle">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
          <FiCalendar className="h-5 w-5" />
        </div>
        
        <input
          id={name}
          name={name}
          type="date"
          ref={ref}
          className={`
            block w-full rounded-lg border text-sm transition-all focus:outline-none focus:ring-2
            pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-800
            ${error 
              ? 'border-red-300 dark:border-red-900/50 text-red-900 dark:text-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50/30' 
              : 'border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-brand-500 focus:border-brand-500'
            }
          `}
          {...props}
        />
      </div>
      
      {error && (
        <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
          {error.message || error}
        </p>
      )}
    </div>
  );
});

DatePicker.displayName = 'DatePicker';

export default DatePicker;
