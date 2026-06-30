import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  name,
  type = 'text',
  error,
  icon: Icon,
  className = '',
  required = false,
  placeholder = '',
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
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Icon className="h-5 w-5" />
          </div>
        )}
        
        <input
          id={name}
          name={name}
          type={type}
          ref={ref}
          placeholder={placeholder}
          className={`
            block w-full rounded-lg border text-sm transition-all focus:outline-none focus:ring-2
            ${Icon ? 'pl-10' : 'pl-3.5'} pr-3.5 py-2.5
            ${error 
              ? 'border-red-300 dark:border-red-900/50 text-red-900 dark:text-red-300 placeholder-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50/30 dark:bg-red-950/10' 
              : 'border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-brand-500 focus:border-brand-500 bg-white dark:bg-slate-800'
            }
          `}
          {...props}
        />
      </div>
      
      {error && (
        <p className="mt-1.5 text-xs text-red-600 dark:text-red-400" id={`${name}-error`}>
          {error.message || error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
