import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate } from '../../utils';
import Button from '../../components/Button';
import { FiBell, FiTrash2, FiCheck, FiFilter } from 'react-icons/fi';

const NotificationsCenter = () => {
  const { notifications, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications();
  const [filter, setFilter] = useState('all'); // all, unread, read

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FiBell className="text-brand-600" />
            Notification Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Audit and review dispatch and security alerts.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={FiCheck} onClick={markAllAsRead}>
            Mark All Read
          </Button>
          <Button variant="danger" size="sm" icon={FiTrash2} onClick={clearAll}>
            Clear All
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-subtle w-fit text-xs font-semibold text-slate-600">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${filter === 'all' ? 'bg-brand-600 text-white shadow-sm' : 'hover:bg-slate-50 text-slate-500'}`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${filter === 'unread' ? 'bg-brand-600 text-white shadow-sm' : 'hover:bg-slate-50 text-slate-500'}`}
        >
          Unread ({notifications.filter(n => !n.read).length})
        </button>
        <button
          onClick={() => setFilter('read')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${filter === 'read' ? 'bg-brand-600 text-white shadow-sm' : 'hover:bg-slate-50 text-slate-500'}`}
        >
          Read ({notifications.filter(n => n.read).length})
        </button>
      </div>

      {/* Notifications Grid list */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden divide-y divide-slate-100">
        {filteredNotifs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No notifications in this category inbox.
          </div>
        ) : (
          filteredNotifs.map((n) => (
            <div
              key={n.id}
              className={`p-4 flex items-start justify-between gap-4 transition-colors ${!n.read ? 'bg-brand-50/10 ' : ''}`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className={`text-xs ${!n.read ? 'font-bold text-slate-900 ' : 'text-slate-700 '}`}>
                    {n.title}
                  </p>
                  {!n.read && (
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {n.message}
                </p>
                <span className="text-[10px] text-slate-400 block">
                  {formatDate(n.createdAt)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {!n.read && (
                  <button
                    onClick={() => markAsRead(n.id)}
                    className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-slate-50"
                    title="Mark as Read"
                  >
                    <FiCheck className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(n.id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-50"
                  title="Delete"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsCenter;
