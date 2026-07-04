import axiosInstance, { isLive } from './axios';
import { getCollection, setCollection } from './db';
import { ORDER_STATUS } from '../constants';
import toast from 'react-hot-toast';

export const orderService = {
  getOrders: async (filters = {}) => {
    if (isLive()) {
      try {
        const params = {
          page: filters.page || 0,
          size: filters.size || 100,
          search: filters.search || undefined,
          status: filters.status || undefined,
        };
        const response = await axiosInstance.get('/api/orders', { params });
        // Map backend Spring Boot Page object structure content to array
        const list = response.data.data.content || [];
        return list.map(o => ({
          ...o,
          id: String(o.id),
          price: o.shippingCharge
        }));
      } catch (err) {
        console.warn('Backend orders unavailable, falling back to demo data', err);
        toast.error('Backend offline. Showing demo orders.', { id: 'backend-offline-orders' });
      }
    }

    // Fallback Mock data
    await new Promise((resolve) => setTimeout(resolve, 300));
    let orders = getCollection('orders');

    if (filters.status) {
      orders = orders.filter((o) => o.status === filters.status);
    }
    if (filters.customerId) {
      orders = orders.filter((o) => o.customerId === filters.customerId);
    }
    if (filters.agentId) {
      orders = orders.filter((o) => o.assignedAgentId === filters.agentId);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      orders = orders.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.trackingNumber.toLowerCase().includes(q) ||
          (o.pickupAddress && o.pickupAddress.toLowerCase().includes(q)) ||
          (o.dropAddress && o.dropAddress.toLowerCase().includes(q))
      );
    }

    return orders;
  },

  getOrderById: async (id) => {
    if (isLive()) {
      try {
        const response = await axiosInstance.get(`/api/orders/${id}`);
        const o = response.data.data;
        return {
          ...o,
          id: String(o.id),
          price: o.shippingCharge,
          timeline: o.timeline || [
            {
              status: o.status,
              title: o.status.replace('_', ' '),
              description: 'Updated via logistics backend tracking timeline.',
              timestamp: o.updatedAt || new Date().toISOString(),
              isCompleted: true,
              isActive: true,
            }
          ]
        };
      } catch (err) {
        console.warn('Backend order lookup failed, falling back to demo', err);
      }
    }

    // Fallback Mock data
    await new Promise((resolve) => setTimeout(resolve, 200));
    const orders = getCollection('orders');
    const order = orders.find((o) => String(o.id) === String(id) || o.trackingNumber === id);
    if (!order) throw new Error('Order not found.');
    return order;
  },

  createOrder: async (orderData, user) => {
    if (isLive()) {
      try {
        const payload = {
          pickupAddress: orderData.pickupAddress,
          pickupCity: orderData.pickupCity || 'City',
          pickupPincode: orderData.pickupPincode || '110001',
          deliveryAddress: orderData.dropAddress || orderData.deliveryAddress,
          deliveryCity: orderData.deliveryCity || 'City',
          deliveryPincode: orderData.deliveryPincode || '110016',
          weight: parseFloat(orderData.actualWeight) || parseFloat(orderData.weight) || 0.5,
          length: parseFloat(orderData.length) || 10.0,
          breadth: parseFloat(orderData.breadth) || 10.0,
          height: parseFloat(orderData.height) || 10.0,
          isCod: orderData.paymentType === 'COD',
          codAmount: orderData.paymentType === 'COD' ? (parseFloat(orderData.price) || 0.0) : 0.0,
          cardType: orderData.orderType === 'B2B' ? 'B2B' : 'B2C',
          recipientName: orderData.recipientName || 'Recipient Name',
          recipientPhone: orderData.recipientPhone || '9876543210'
        };
        const response = await axiosInstance.post('/api/orders', payload);
        const o = response.data.data;
        return {
          ...o,
          id: String(o.id),
          price: o.shippingCharge
        };
      } catch (err) {
        console.error('API create order failed', err);
        throw new Error(err.response?.data?.message || 'Failed to submit consignment to backend.');
      }
    }

    // Fallback Mock data
    await new Promise((resolve) => setTimeout(resolve, 400));
    const orders = getCollection('orders');
    const count = orders.length + 1000;
    const orderId = `ORD-${count}`;
    const trackingNumber = `TRK-${count}-${Math.floor(100 + Math.random() * 900)}`;

    const newOrder = {
      id: orderId,
      trackingNumber,
      pickupAddress: orderData.pickupAddress,
      pickupZone: orderData.pickupZone,
      dropAddress: orderData.dropAddress,
      dropZone: orderData.dropZone,
      length: parseFloat(orderData.length) || 0,
      breadth: parseFloat(orderData.breadth) || 0,
      height: parseFloat(orderData.height) || 0,
      actualWeight: parseFloat(orderData.actualWeight) || 0,
      volumetricWeight: parseFloat(orderData.volumetricWeight) || 0,
      billableWeight: parseFloat(orderData.billableWeight) || 0,
      orderType: orderData.orderType,
      paymentType: orderData.paymentType,
      price: parseFloat(orderData.price) || 20.0,
      estimatedDelivery: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      status: ORDER_STATUS.PENDING,
      customerId: user.id,
      customerName: user.name,
      assignedAgentId: null,
      assignedAgentName: null,
      createdAt: new Date().toISOString(),
      timeline: [
        {
          status: ORDER_STATUS.PENDING,
          title: 'Order Created',
          description: `Order registered under invoice. Estimated delivery in 24 hours.`,
          timestamp: new Date().toISOString(),
          isCompleted: true,
          isActive: true,
        },
      ],
    };

    orders.unshift(newOrder);
    setCollection('orders', orders);

    const notifs = getCollection('notifications') || [];
    notifs.unshift({
      id: `notif-${Date.now()}`,
      title: 'Order Created Successfully (Demo)',
      message: `Your order ${orderId} has been successfully registered.`,
      type: 'order',
      createdAt: new Date().toISOString(),
      read: false,
    });
    setCollection('notifications', notifs);

    return newOrder;
  },

  updateOrder: async (id, updatedData) => {
    if (isLive()) {
      try {
        const response = await axiosInstance.put(`/api/orders/${id}`, updatedData);
        return response.data.data;
      } catch (err) {
        console.error(err);
      }
    }

    // Fallback Mock data
    const orders = getCollection('orders');
    const index = orders.findIndex((o) => String(o.id) === String(id));
    if (index === -1) throw new Error('Order not found.');
    orders[index] = { ...orders[index], ...updatedData };
    setCollection('orders', orders);
    return orders[index];
  },

  deleteOrder: async (id) => {
    if (isLive()) {
      try {
        await axiosInstance.delete(`/api/orders/${id}`);
        return true;
      } catch (err) {
        console.error(err);
      }
    }

    const orders = getCollection('orders');
    const filtered = orders.filter((o) => String(o.id) !== String(id));
    setCollection('orders', filtered);
    return true;
  },

  assignAgent: async (orderId, agentId) => {
    if (isLive()) {
      try {
        const response = await axiosInstance.post(`/api/orders/assign-agent?orderId=${orderId}`, {
          agentId,
          autoAssign: false
        });
        return response.data.data;
      } catch (err) {
        throw new Error(err.response?.data?.message || 'Agent assignment failed.');
      }
    }

    // Fallback Mock data
    await new Promise((resolve) => setTimeout(resolve, 300));
    const orders = getCollection('orders');
    const agents = getCollection('agents');

    const orderIdx = orders.findIndex((o) => String(o.id) === String(orderId));
    if (orderIdx === -1) throw new Error('Order not found.');

    const agent = agents.find((a) => String(a.id) === String(agentId));
    if (!agent) throw new Error('Agent not found.');

    agent.workload += 1;
    setCollection('agents', agents);

    orders[orderIdx].assignedAgentId = agent.id;
    orders[orderIdx].assignedAgentName = agent.name;
    orders[orderIdx].status = ORDER_STATUS.ASSIGNED;
    
    orders[orderIdx].timeline.forEach((t) => { t.isActive = false; });
    orders[orderIdx].timeline.push({
      status: ORDER_STATUS.ASSIGNED,
      title: 'Agent Assigned',
      description: `Package assigned to agent ${agent.name} (${agent.vehicle}) for shipment.`,
      timestamp: new Date().toISOString(),
      isCompleted: true,
      isActive: true,
    });

    setCollection('orders', orders);
    return orders[orderIdx];
  },

  updateStatus: async (orderId, status, notes = '', image = '', otp = '') => {
    if (isLive()) {
      try {
        const response = await axiosInstance.put(`/api/orders/${orderId}/status?status=${status}&remarks=${notes}`);
        return response.data.data;
      } catch (err) {
        throw new Error(err.response?.data?.message || 'Status transition denied.');
      }
    }

    // Fallback Mock data
    await new Promise((resolve) => setTimeout(resolve, 300));
    const orders = getCollection('orders');
    const index = orders.findIndex((o) => String(o.id) === String(orderId));
    if (index === -1) throw new Error('Order not found.');

    const order = orders[index];
    if (status === ORDER_STATUS.DELIVERED && otp && otp !== '1234') {
      throw new Error('Invalid OTP code. Please enter the correct customer OTP.');
    }

    order.status = status;
    order.timeline.forEach((t) => { t.isActive = false; });

    let title = 'Status Updated';
    let description = `Package updated to ${status}.`;

    switch (status) {
      case ORDER_STATUS.PICKED_UP:
        title = 'Shipment Picked Up';
        description = 'The agent has received the packet and is loading it.';
        break;
      case ORDER_STATUS.IN_TRANSIT:
        title = 'In Transit';
        description = 'The package is moving between logistics hubs.';
        break;
      case ORDER_STATUS.OUT_FOR_DELIVERY:
        title = 'Out for Delivery';
        description = 'The delivery agent is en route to the drop address.';
        break;
      case ORDER_STATUS.DELIVERED:
        title = 'Delivered';
        description = 'Package successfully handed over. Signature verified.';
        break;
      case ORDER_STATUS.FAILED:
        title = 'Delivery Failed';
        description = `Attempt failed. Notes: ${notes}`;
        break;
    }

    order.timeline.push({
      status,
      title,
      description,
      notes: status === ORDER_STATUS.FAILED ? notes : undefined,
      timestamp: new Date().toISOString(),
      isCompleted: true,
      isActive: true,
    });

    setCollection('orders', orders);
    return order;
  },

  cancelOrder: async (orderId) => {
    if (isLive()) {
      try {
        const response = await axiosInstance.post(`/api/orders/${orderId}/cancel`);
        return response.data.data;
      } catch (err) {
        throw new Error(err.response?.data?.message || 'Cancellation request failed.');
      }
    }

    // Fallback Mock data
    const orders = getCollection('orders');
    const index = orders.findIndex((o) => String(o.id) === String(orderId));
    if (index === -1) throw new Error('Order not found.');

    const order = orders[index];
    order.status = ORDER_STATUS.FAILED;
    order.timeline.forEach((t) => { t.isActive = false; });
    order.timeline.push({
      status: ORDER_STATUS.FAILED,
      title: 'Order Cancelled',
      description: 'The order was cancelled by the customer.',
      timestamp: new Date().toISOString(),
      isCompleted: true,
      isActive: true,
    });

    setCollection('orders', orders);
    return order;
  },
};
