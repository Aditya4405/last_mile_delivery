import dayjs from 'dayjs';
import { ORDER_STATUS } from '../constants';

export const formatDate = (date, formatStr = 'DD MMM YYYY, hh:mm A') => {
  if (!date) return '-';
  return dayjs(date).format(formatStr);
};

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const getStatusColors = (status) => {
  switch (status) {
    case ORDER_STATUS.PENDING:
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/20',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-900/50',
      };
    case ORDER_STATUS.ASSIGNED:
      return {
        bg: 'bg-blue-50 dark:bg-blue-950/20',
        text: 'text-blue-700 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-900/50',
      };
    case ORDER_STATUS.PICKED_UP:
      return {
        bg: 'bg-indigo-50 dark:bg-indigo-950/20',
        text: 'text-indigo-700 dark:text-indigo-400',
        border: 'border-indigo-200 dark:border-indigo-900/50',
      };
    case ORDER_STATUS.IN_TRANSIT:
      return {
        bg: 'bg-primary-50 dark:bg-primary-950/20',
        text: 'text-primary-700 dark:text-primary-400',
        border: 'border-primary-200 dark:border-primary-900/50',
      };
    case ORDER_STATUS.OUT_FOR_DELIVERY:
      return {
        bg: 'bg-purple-50 dark:bg-purple-950/20',
        text: 'text-purple-700 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-900/50',
      };
    case ORDER_STATUS.DELIVERED:
      return {
        bg: 'bg-success-50 dark:bg-success-950/20',
        text: 'text-success-700 dark:text-success-400',
        border: 'border-success-200 dark:border-success-900/50',
      };
    case ORDER_STATUS.FAILED:
      return {
        bg: 'bg-red-50 dark:bg-red-950/20',
        text: 'text-red-700 dark:text-red-400',
        border: 'border-red-200 dark:border-red-900/50',
      };
    default:
      return {
        bg: 'bg-slate-50 dark:bg-slate-800',
        text: 'text-slate-700 dark:text-slate-300',
        border: 'border-slate-200 dark:border-slate-700',
      };
  }
};

export const calculateVolumetricWeight = (length, breadth, height) => {
  const l = parseFloat(length) || 0;
  const b = parseFloat(breadth) || 0;
  const h = parseFloat(height) || 0;
  // Standard logistics volumetric divisor is 5000 (for cm)
  return Math.round(((l * b * h) / 5000) * 100) / 100;
};

export const calculateBillableWeight = (actualWeight, volumetricWeight) => {
  const actual = parseFloat(actualWeight) || 0;
  const volumetric = parseFloat(volumetricWeight) || 0;
  return Math.max(actual, volumetric);
};

// Storage Helpers
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  },
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};
