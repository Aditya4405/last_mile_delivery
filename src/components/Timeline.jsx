import React from 'react';
import { FiCheck, FiTruck, FiMapPin, FiCheckCircle, FiPackage, FiAlertCircle } from 'react-icons/fi';
import { formatDate } from '../utils';
import { ORDER_STATUS } from '../constants';

const Timeline = ({ events = [], activeStatus }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case ORDER_STATUS.PENDING:
        return FiPackage;
      case ORDER_STATUS.ASSIGNED:
        return FiCheck;
      case ORDER_STATUS.PICKED_UP:
        return FiPackage;
      case ORDER_STATUS.IN_TRANSIT:
        return FiTruck;
      case ORDER_STATUS.OUT_FOR_DELIVERY:
        return FiTruck;
      case ORDER_STATUS.DELIVERED:
        return FiCheckCircle;
      case ORDER_STATUS.FAILED:
        return FiAlertCircle;
      default:
        return FiMapPin;
    }
  };

  const getStatusStepColor = (status, isCompleted, isActive) => {
    if (status === ORDER_STATUS.FAILED) {
      return 'bg-red-500 text-white ring-red-200 dark:ring-red-950/50';
    }
    if (isActive) {
      return 'bg-brand-600 text-white ring-brand-200 dark:ring-brand-950/50 scale-110';
    }
    if (isCompleted) {
      return 'bg-success-500 text-white ring-success-200 dark:ring-success-950/50';
    }
    return 'bg-slate-200 text-slate-550 dark:bg-slate-700 dark:text-slate-400 ring-slate-100 dark:ring-slate-800';
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {events.map((event, idx) => {
          const Icon = getStatusIcon(event.status);
          const isLast = idx === events.length - 1;
          
          return (
            <li key={event.id || idx}>
              <div className="relative pb-8">
                {/* Connecting Line */}
                {!isLast && (
                  <span
                    className={`
                      absolute top-5 left-5 -ml-px h-full w-0.5
                      ${event.isCompleted ? 'bg-success-400 dark:bg-success-700' : 'bg-slate-200 dark:bg-slate-700'}
                    `}
                    aria-hidden="true"
                  />
                )}
                
                <div className="relative flex space-x-3 items-start">
                  <div>
                    <span
                      className={`
                        h-10 w-10 rounded-full flex items-center justify-center ring-4 transition-all duration-200
                        ${getStatusStepColor(event.status, event.isCompleted, event.isActive)}
                      `}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {event.title}
                      </p>
                      {event.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          {event.description}
                        </p>
                      )}
                      {event.notes && (
                        <p className="text-xs text-red-650 dark:text-red-400 mt-1 italic font-medium">
                          Reason: {event.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-xs whitespace-nowrap text-slate-500 dark:text-slate-400">
                      <time dateTime={event.timestamp}>
                        {formatDate(event.timestamp, 'DD MMM, hh:mm A')}
                      </time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Timeline;
