import { getCollection } from './db';

export const trackingService = {
  trackOrder: async (trackingNumber) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const orders = getCollection('orders');
    const order = orders.find(
      (o) =>
        o.trackingNumber.toLowerCase() === trackingNumber.toLowerCase() ||
        o.id.toLowerCase() === trackingNumber.toLowerCase()
    );

    if (!order) {
      throw new Error('Tracking number not found in manifest.');
    }

    return {
      id: order.id,
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
