import React from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const StatsCard = ({
  title,
  value,
  icon: Icon,
  iconBg = 'bg-brand-50 ',
  iconColor = 'text-brand-650 ',
  trend,
  trendType = 'up', // up, down, neutral
  description,
  loading = false,
  className = '',
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse shadow-card">
        <div className="flex justify-between items-start">
          <div className="space-y-2.5">
            <div className="h-4 w-24 bg-slate-200 rounded-md" />
            <div className="h-8 w-16 bg-slate-200 rounded-md" />
          </div>
          <div className="h-10 w-10 bg-slate-200 rounded-full" />
        </div>
        <div className="h-4 w-32 bg-slate-200 rounded-md mt-4" />
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`bg-white rounded-xl border border-slate-200 p-6 shadow-card hover:shadow-hover transition-all duration-200 ${className}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">
            {value}
          </h3>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg ${iconBg} ${iconColor}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 mt-4">
        {trend && (
          <span
            className={`inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded ${trendType === 'up' && 'bg-success-50 text-success-700 '} ${trendType === 'down' && 'bg-red-50 text-red-700 '} ${trendType === 'neutral' && 'bg-slate-50 text-slate-600 '}`}
          >
            {trendType === 'up' && <FiTrendingUp className="mr-0.5" />}
            {trendType === 'down' && <FiTrendingDown className="mr-0.5" />}
            {trend}
          </span>
        )}
        {description && (
          <span className="text-xs text-slate-500">
            {description}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default StatsCard;
