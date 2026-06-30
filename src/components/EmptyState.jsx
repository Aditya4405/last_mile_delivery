import React from 'react';
import { FiInbox } from 'react-icons/fi';
import Button from './Button';

const EmptyState = ({
  title = 'No data available',
  description = 'There are no records matching your request at this time.',
  icon: Icon = FiInbox,
  actionText,
  onActionClick,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 rounded-xl border border-dashed border-slate-300 bg-white shadow-sm ${className}`}>
      <div className="p-4 rounded-full bg-slate-100 text-slate-400 mb-4">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-base font-semibold text-slate-800">
        {title}
      </h3>
      <p className="text-sm text-slate-500 mt-1 max-w-sm leading-relaxed">
        {description}
      </p>
      {actionText && onActionClick && (
        <Button variant="primary" onClick={onActionClick} className="mt-5">
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
