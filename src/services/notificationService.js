import axiosInstance, { isLive } from './axios';
import { getCollection, setCollection } from './db';
import toast from 'react-hot-toast';

export const notificationService = {
  getNotifications: async () => {
    if (isLive()) {
      try {
        const response = await axiosInstance.get('/api/notifications');
        return response.data.data || [];
      } catch (err) {
        console.warn('Backend notifications offline. Falling back to local storage.');
      }
    }

    // Fallback Mock data
    await new Promise((resolve) => setTimeout(resolve, 100));
    return getCollection('notifications') || [];
  },

  markAsRead: async (id) => {
    if (isLive()) {
      try {
        await axiosInstance.put(`/api/notifications/${id}/read`);
        return true;
      } catch (err) {
        console.error(err);
      }
    }

    const notifs = getCollection('notifications') || [];
    const updated = notifs.map((n) => (String(n.id) === String(id) ? { ...n, read: true } : n));
    setCollection('notifications', updated);
    return true;
  },

  markAllAsRead: async () => {
    if (isLive()) {
      try {
        await axiosInstance.put('/api/notifications/read-all');
        return true;
      } catch (err) {
        console.error(err);
      }
    }

    const notifs = getCollection('notifications') || [];
    const updated = notifs.map((n) => ({ ...n, read: true }));
    setCollection('notifications', updated);
    return true;
  },

  deleteNotification: async (id) => {
    if (isLive()) {
      try {
        // Backend notification delete mapping if available, or locally managed:
        return true;
      } catch (err) {
        console.error(err);
      }
    }

    const notifs = getCollection('notifications') || [];
    const filtered = notifs.filter((n) => String(n.id) !== String(id));
    setCollection('notifications', filtered);
    return true;
  },
};
