import React from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

const SearchBar = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search here...',
  className = '',
}) => {
  return (
    <div className={`relative w-full ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
        <FiSearch className="h-5 w-5" />
      </div>
      
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          block w-full rounded-lg border border-slate-300 dark:border-slate-700 
          text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
          pl-10 pr-10 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-subtle
        "
      />
      
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-650 dark:hover:text-slate-200"
        >
          <FiX className="h-4.5 w-4.5" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
