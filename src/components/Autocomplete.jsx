import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiX } from 'react-icons/fi';

const Autocomplete = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Search and select...',
  error,
  required = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  // Sync selected option text
  useEffect(() => {
    if (value) {
      const selected = options.find((opt) => opt.value === value);
      if (selected) setSearch(selected.label);
    } else {
      setSearch('');
    }
  }, [value, options]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        // Reset search to current value label if closed
        const selected = options.find((opt) => opt.value === value);
        setSearch(selected ? selected.label : '');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value, options]);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (option) => {
    onChange(option.value);
    setSearch(option.label);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
    setIsOpen(false);
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-350 mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative rounded-lg shadow-subtle">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`
            block w-full rounded-lg border text-sm transition-all focus:outline-none focus:ring-2
            pl-3.5 pr-10 py-2.5 bg-white dark:bg-slate-800
            ${error 
              ? 'border-red-300 dark:border-red-900/50 text-red-900 dark:text-red-300 placeholder-red-350 focus:ring-red-500 focus:border-red-500 bg-red-50/30' 
              : 'border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-brand-500 focus:border-brand-500'
            }
          `}
        />

        <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1 text-slate-400">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <FiX className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="p-1 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <FiChevronDown className={`h-4 w-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 shadow-premium">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <div
                key={opt.value}
                onClick={() => handleSelect(opt)}
                className={`
                  px-3.5 py-2 text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors
                  ${value === opt.value ? 'bg-brand-50 dark:bg-brand-950/20 text-brand-700 dark:text-brand-400 font-medium' : 'text-slate-700 dark:text-slate-200'}
                `}
              >
                {opt.label}
              </div>
            ))
          ) : (
            <div className="px-3.5 py-2.5 text-sm text-slate-500 dark:text-slate-400 text-center">
              No options found
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
          {error.message || error}
        </p>
      )}
    </div>
  );
};

export default Autocomplete;
