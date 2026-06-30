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
    primary: 'bg-brand-50  text-brand-700  border border-brand-200 ',
    success: 'bg-success-50  text-success-700  border border-success-200 ',
    danger: 'bg-red-50  text-red-700  border border-red-205 ',
    warning: 'bg-amber-50  text-amber-700  border border-amber-205 ',
    info: 'bg-primary-50  text-primary-700  border border-primary-205 ',
    slate: 'bg-slate-50  text-slate-700  border border-slate-200 ',
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
