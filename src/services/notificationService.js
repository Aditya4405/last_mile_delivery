import { getCollection, setCollection } from './db';

export const notificationService = {
  getNotifications: async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return getCollection('notifications') || [];
  },

  markAsRead: async (id) => {
    const notifs = getCollection('notifications') || [];
    const updated = notifs.map((n) => (n.id === id ? { ...n, read: true } : n));
    setCollection('notifications', updated);
    return true;
  },

  markAllAsRead: async () => {
    const notifs = getCollection('notifications') || [];
    const updated = notifs.map((n) => ({ ...n, read: true }));
    setCollection('notifications', updated);
    return true;
  },

  deleteNotification: async (id) => {
    const notifs = getCollection('notifications') || [];
    const filtered = notifs.filter((n) => n.id !== id);
    setCollection('notifications', filtered);
    return true;
  },
};
