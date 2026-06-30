import React from 'react';
import { getStatusColors } from '../utils';
import { ORDER_STATUS_LABELS } from '../constants';

// Generic Badge
export const Badge = ({
  children,
  variant = 'info', // success, danger, warning, primary, info, slate
  className = '',
}) => {
  const styles = {
    primary: 'bg-brand-50 dark:bg-brand-950/20 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-900/50',
    success: 'bg-success-50 dark:bg-success-950/20 text-success-700 dark:text-success-400 border border-success-200 dark:border-success-900/50',
    danger: 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-205 dark:border-red-900/50',
    warning: 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-205 dark:border-amber-900/50',
    info: 'bg-primary-50 dark:bg-primary-950/20 text-primary-700 dark:text-primary-400 border border-primary-205 dark:border-primary-900/50',
    slate: 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};

// Logistics Order Status Chip
export const StatusChip = ({ status, className = '' }) => {
  const colors = getStatusColors(status);
  const label = ORDER_STATUS_LABELS[status] || status;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${colors.bg} ${colors.text} ${colors.border} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
      {label}
    </span>
  );
};

export default Badge;
