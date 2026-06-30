import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const NotificationContext = createContext();

const MOCK_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'New Order Created',
    message: 'Order #ORD-9821 has been successfully registered by Customer Aditya.',
    type: 'order',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    read: false,
  },
  {
    id: 'notif-2',
    title: 'Agent Assigned',
    message: 'Delivery Agent John Doe has been assigned to Order #ORD-9710.',
    type: 'assignment',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    read: false,
  },
  {
    id: 'notif-3',
    title: 'Out for Delivery',
    message: 'Order #ORD-9605 is out for delivery with Agent Sarah Smith.',
    type: 'delivery',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    read: true,
  },
];

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : MOCK_NOTIFICATIONS;
  });

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = (title, message, type = 'info') => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    
    // Trigger React Hot Toast
    toast(
      (t) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-800">{title}</span>
          <span className="text-xs text-slate-600 mt-0.5">{message}</span>
        </div>
      ),
      {
        duration: 4000,
        position: 'top-right',
        style: {
          background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
          color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a',
          border: '1px solid ' + (document.documentElement.classList.contains('dark') ? '#334155' : '#e2e8f0'),
        },
      }
    );
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
    toast.success('Notification center cleared');
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
