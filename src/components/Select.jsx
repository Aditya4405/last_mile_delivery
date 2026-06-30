import React, { forwardRef } from 'react';

const Select = forwardRef(({
  label,
  name,
  options = [],
  error,
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
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative rounded-lg shadow-subtle">
        <select
          id={name}
          name={name}
          ref={ref}
          className={`block w-full rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 px-3.5 py-2.5 bg-white appearance-none ${error ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500 bg-red-50/30 ' : 'border-slate-300 text-slate-900 focus:ring-brand-500 focus:border-brand-500' }`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => {
            const isObj = typeof opt === 'object' && opt !== null;
            const val = isObj ? opt.value : opt;
            const lbl = isObj ? opt.label : opt;
            return (
              <option key={val} value={val}>
                {lbl}
              </option>
            );
          })}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
      
      {error && (
        <p className="mt-1.5 text-xs text-red-600" id={`${name}-error`}>
          {error.message || error}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
