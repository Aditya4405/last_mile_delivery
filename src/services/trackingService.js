import axiosInstance, { isLive } from './axios';
import { getCollection } from './db';
import toast from 'react-hot-toast';

export const trackingService = {
  trackOrder: async (trackingNumber) => {
    if (isLive()) {
      try {
        const response = await axiosInstance.get(`/api/tracking/${trackingNumber}`);
        const t = response.data.data;
        return {
          id: String(t.orderId || t.id),
          trackingNumber: t.trackingNumber,
          status: t.status,
          pickupAddress: t.pickupAddress,
          dropAddress: t.deliveryAddress || t.dropAddress,
          estimatedDelivery: t.estimatedDeliveryTime || t.estimatedDelivery,
          assignedAgentName: t.agentName || 'Awaiting Assignment',
          timeline: t.timeline || [
            {
              status: t.status,
              title: t.status.replace('_', ' '),
              description: 'In transit under manifest checks.',
              timestamp: new Date().toISOString(),
              isCompleted: true,
              isActive: true,
            }
          ]
        };
      } catch (err) {
        console.warn('Backend tracking request failed, falling back to demo tracking lookup.', err);
        toast.error('Tracking endpoint offline. Showing demo tracking.', { id: 'backend-offline-tracking' });
      }
    }

    // Fallback Mock data
    await new Promise((resolve) => setTimeout(resolve, 300));
    const orders = getCollection('orders');
    const order = orders.find(
      (o) =>
        String(o.trackingNumber).toLowerCase() === String(trackingNumber).toLowerCase() ||
        String(o.id).toLowerCase() === String(trackingNumber).toLowerCase()
    );

    if (!order) {
      throw new Error('Tracking number not found in manifest.');
    }

    return {
      id: String(order.id),
      trackingNumber: order.trackingNumber,
      status: order.status,
      pickupAddress: order.pickupAddress,
      dropAddress: order.dropAddress,
      estimatedDelivery: order.estimatedDelivery,
      assignedAgentName: order.assignedAgentName || 'Awaiting Assignment',
      timeline: order.timeline,
    };
  },
};
