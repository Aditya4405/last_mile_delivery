import React from 'react';
import { motion } from 'framer-motion';
import { ImSpinner2 } from 'react-icons/im';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  icon: Icon,
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-brand-600 hover:bg-brand-700 text-white focus:ring-brand-500 shadow-sm hover:shadow dark:bg-brand-500 dark:hover:bg-brand-600',
    secondary: 'bg-slate-200 hover:bg-slate-350 text-slate-800 focus:ring-slate-400 dark:bg-slate-800 dark:hover:bg-slate-705 dark:text-slate-100',
    success: 'bg-success-600 hover:bg-success-700 text-white focus:ring-success-500 shadow-sm dark:bg-success-500 dark:hover:bg-success-600',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-sm dark:bg-red-500 dark:hover:bg-red-600',
    outline: 'border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 focus:ring-brand-500',
    ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 focus:ring-slate-400',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <motion.button
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <ImSpinner2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
      {!loading && Icon && <Icon className="-ml-0.5 mr-2 h-4.5 w-4.5" />}
      {children}
    </motion.button>
  );
};

export default Button;
