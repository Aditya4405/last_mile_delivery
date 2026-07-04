import axiosInstance, { isLive } from './axios';
import { getCollection } from './db';
import { ORDER_STATUS } from '../constants';
import toast from 'react-hot-toast';

export const dashboardService = {
  getAdminStats: async () => {
    if (isLive()) {
      try {
        const response = await axiosInstance.get('/api/dashboard/admin');
        return response.data.data;
      } catch (err) {
        console.warn('Backend server offline. Showing demo statistics.', err);
        toast.error('Backend server offline. Showing demo statistics.', { id: 'backend-offline-admin' });
      }
    }

    // Fallback Mock data
    await new Promise((resolve) => setTimeout(resolve, 300));
    const orders = getCollection('orders');
    const agents = getCollection('agents');
    const registeredUsers = JSON.parse(localStorage.getItem('registered_users')) || [];
    const customersCount = registeredUsers.filter(u => u.role === 'customer').length + 1;
    const revenue = orders.reduce((sum, o) => sum + (o.price || 0), 0);
    const pendingOrders = orders.filter((o) => o.status !== ORDER_STATUS.DELIVERED && o.status !== ORDER_STATUS.FAILED).length;
    const deliveredCount = orders.filter((o) => o.status === ORDER_STATUS.DELIVERED).length;
    const totalFinished = orders.filter((o) => o.status === ORDER_STATUS.DELIVERED || o.status === ORDER_STATUS.FAILED).length;
    const successRate = totalFinished > 0 ? Math.round((deliveredCount / totalFinished) * 100) : 100;

    const monthlyRevenue = [
      { month: 'Jan', revenue: 125000, orders: 450 },
      { month: 'Feb', revenue: 192000, orders: 720 },
      { month: 'Mar', revenue: 310000, orders: 1100 },
      { month: 'Apr', revenue: 245000, orders: 950 },
      { month: 'May', revenue: 380000, orders: 1400 },
      { month: 'Jun', revenue: revenue + 420000, orders: orders.length + 1600 },
    ];

    const zoneDistribution = [
      { name: 'Central Zone', value: orders.filter((o) => o.pickupZone === 'zone-5' || o.dropZone === 'zone-5').length },
      { name: 'North Zone', value: orders.filter((o) => o.pickupZone === 'zone-1' || o.dropZone === 'zone-1').length },
      { name: 'South Zone', value: orders.filter((o) => o.pickupZone === 'zone-2' || o.dropZone === 'zone-2').length },
      { name: 'East/West', value: orders.filter((o) => ['zone-3', 'zone-4'].includes(o.pickupZone) || ['zone-3', 'zone-4'].includes(o.dropZone)).length },
    ];

    const activities = orders.slice(0, 5).map((o) => ({
      id: o.id,
      title: `Order ${o.id} status changed`,
      description: `Status updated to "${o.status.replace('_', ' ')}" for drop address "${o.dropAddress ? o.dropAddress.split(',')[0] : 'Address'}".`,
      time: o.createdAt,
    }));

    return {
      cards: {
        revenue,
        orders: orders.length,
        customers: customersCount,
        agents: agents.length,
        pendingDeliveries: pendingOrders,
        successRate: `${successRate}%`,
      },
      charts: {
        monthlyRevenue,
        zoneDistribution,
      },
      activities,
    };
  },

  getCustomerStats: async (customerId) => {
    if (isLive()) {
      try {
        const response = await axiosInstance.get('/api/dashboard/customer');
        return response.data.data;
      } catch (err) {
        console.warn('Backend server offline. Showing demo customer stats.', err);
        toast.error('Backend server offline. Showing demo statistics.', { id: 'backend-offline-customer' });
      }
    }

    // Fallback Mock data
    await new Promise((resolve) => setTimeout(resolve, 200));
    const orders = getCollection('orders').filter((o) => o.customerId === customerId);
    const totalOrders = orders.length;
    const pendingCount = orders.filter((o) => o.status !== ORDER_STATUS.DELIVERED && o.status !== ORDER_STATUS.FAILED).length;
    const deliveredCount = orders.filter((o) => o.status === ORDER_STATUS.DELIVERED).length;
    const failedCount = orders.filter((o) => o.status === ORDER_STATUS.FAILED).length;
    const totalSpent = orders.reduce((sum, o) => sum + (o.price || 0), 0);

    const deliveryTrend = [
      { week: 'Week 1', delivered: 1, pending: 0 },
      { week: 'Week 2', delivered: 2, pending: 1 },
      { week: 'Week 3', delivered: 3, pending: 2 },
      { week: 'Week 4', delivered: deliveredCount, pending: pendingCount },
    ];

    return {
      cards: {
        totalOrders,
        pendingDeliveries: pendingCount,
        deliveredOrders: deliveredCount,
        cancelledOrders: failedCount,
        totalSpent,
      },
      charts: {
        deliveryTrend,
      },
    };
  },

  getAgentStats: async (agentId) => {
    if (isLive()) {
      try {
        const response = await axiosInstance.get('/api/dashboard/agent');
        return response.data.data;
      } catch (err) {
        console.warn('Backend server offline. Showing demo agent performance metrics.', err);
        toast.error('Backend server offline. Showing demo statistics.', { id: 'backend-offline-agent' });
      }
    }

    // Fallback Mock data
    await new Promise((resolve) => setTimeout(resolve, 200));
    const orders = getCollection('orders').filter((o) => o.assignedAgentId === agentId);
    const agent = getCollection('agents').find((a) => a.id === agentId);
    const todayCount = orders.length;
    const pendingPickups = orders.filter((o) => o.status === ORDER_STATUS.ASSIGNED).length;
    const completed = orders.filter((o) => o.status === ORDER_STATUS.DELIVERED).length;
    const failed = orders.filter((o) => o.status === ORDER_STATUS.FAILED).length;

    const performanceData = [
      { day: 'Mon', completed: 2, failed: 0 },
      { day: 'Tue', completed: 4, failed: 0 },
      { day: 'Wed', completed: todayCount + 3, failed: failed },
    ];

    return {
      cards: {
        todayDeliveries: todayCount,
        pendingPickups,
        completedDeliveries: completed,
        failedDeliveries: failed,
        rating: agent ? agent.rating : 5.0,
      },
      charts: {
        performanceData,
      },
    };
  },
};
