import { getCollection, setCollection } from './db';
import { ORDER_STATUS } from '../constants';

export const orderService = {
  getOrders: async (filters = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
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
          o.pickupAddress.toLowerCase().includes(q) ||
          o.dropAddress.toLowerCase().includes(q)
      );
    }

    return orders;
  },

  getOrderById: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const orders = getCollection('orders');
    const order = orders.find((o) => o.id === id || o.trackingNumber === id);
    if (!order) throw new Error('Order not found.');
    return order;
  },

  createOrder: async (orderData, user) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
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
      estimatedDelivery: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24h ETA
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

    // Increment notification in context (simulated trigger by creating event)
    const notifs = getCollection('notifications') || [];
    notifs.unshift({
      id: `notif-${Date.now()}`,
      title: 'Order Created Successfully',
      message: `Your order ${orderId} has been successfully registered for dispatch.`,
      type: 'order',
      createdAt: new Date().toISOString(),
      read: false,
    });
    setCollection('notifications', notifs);

    return newOrder;
  },

  updateOrder: async (id, updatedData) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const orders = getCollection('orders');
    const index = orders.findIndex((o) => o.id === id);
    if (index === -1) throw new Error('Order not found.');

    orders[index] = { ...orders[index], ...updatedData };
    setCollection('orders', orders);
    return orders[index];
  },

  deleteOrder: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const orders = getCollection('orders');
    const filtered = orders.filter((o) => o.id !== id);
    setCollection('orders', filtered);
    return true;
  },

  assignAgent: async (orderId, agentId) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const orders = getCollection('orders');
    const agents = getCollection('agents');

    const orderIdx = orders.findIndex((o) => o.id === orderId);
    if (orderIdx === -1) throw new Error('Order not found.');

    const agent = agents.find((a) => a.id === agentId);
    if (!agent) throw new Error('Agent not found.');

    // Update agent workload and status if necessary
    agent.workload += 1;
    setCollection('agents', agents);

    // Update order with agent details and update timeline
    orders[orderIdx].assignedAgentId = agent.id;
    orders[orderIdx].assignedAgentName = agent.name;
    orders[orderIdx].status = ORDER_STATUS.ASSIGNED;
    
    // Add event to timeline
    orders[orderIdx].timeline.forEach((t) => {
      t.isActive = false;
    });
    orders[orderIdx].timeline.push({
      status: ORDER_STATUS.ASSIGNED,
      title: 'Agent Assigned',
      description: `Package assigned to agent ${agent.name} (${agent.vehicle}) for shipment.`,
      timestamp: new Date().toISOString(),
      isCompleted: true,
      isActive: true,
    });

    setCollection('orders', orders);

    // Add notification
    const notifs = getCollection('notifications') || [];
    notifs.unshift({
      id: `notif-${Date.now()}`,
      title: 'Agent Assigned',
      message: `${agent.name} was assigned to order ${orderId}.`,
      type: 'assignment',
      createdAt: new Date().toISOString(),
      read: false,
    });
    setCollection('notifications', notifs);

    return orders[orderIdx];
  },

  updateStatus: async (orderId, status, notes = '', image = '', otp = '') => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const orders = getCollection('orders');
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) throw new Error('Order not found.');

    const order = orders[index];
    
    // Validate OTP if status is delivered
    if (status === ORDER_STATUS.DELIVERED && otp && otp !== '1234') {
      throw new Error('Invalid OTP code. Please enter the correct customer OTP.');
    }

    order.status = status;
    
    // Update timeline
    order.timeline.forEach((t) => {
      t.isActive = false;
    });

    let title = '';
    let description = '';

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
      default:
        title = 'Status Updated';
        description = `Package updated to ${status}.`;
    }

    order.timeline.push({
      status,
      title,
      description,
      notes: status === ORDER_STATUS.FAILED ? notes : undefined,
      image: image || undefined,
      timestamp: new Date().toISOString(),
      isCompleted: true,
      isActive: true,
    });

    // If order was delivered or failed, reduce workload of agent
    if (status === ORDER_STATUS.DELIVERED || status === ORDER_STATUS.FAILED) {
      if (order.assignedAgentId) {
        const agents = getCollection('agents');
        const agentIdx = agents.findIndex((a) => a.id === order.assignedAgentId);
        if (agentIdx !== -1 && agents[agentIdx].workload > 0) {
          agents[agentIdx].workload -= 1;
          setCollection('agents', agents);
        }
      }
    }

    setCollection('orders', orders);

    // Notify customer
    const notifs = getCollection('notifications') || [];
    notifs.unshift({
      id: `notif-${Date.now()}`,
      title: `Order Update: ${title}`,
      message: `Your package ${orderId} has been updated to "${status}".`,
      type: 'delivery',
      createdAt: new Date().toISOString(),
      read: false,
    });
    setCollection('notifications', notifs);

    return order;
  },

  cancelOrder: async (orderId) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const orders = getCollection('orders');
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) throw new Error('Order not found.');

    const order = orders[index];
    order.status = ORDER_STATUS.FAILED;
    
    order.timeline.forEach((t) => {
      t.isActive = false;
    });

    order.timeline.push({
      status: ORDER_STATUS.FAILED,
      title: 'Order Cancelled',
      description: 'The order was cancelled by the customer.',
      timestamp: new Date().toISOString(),
      isCompleted: true,
      isActive: true,
    });

    // Release agent
    if (order.assignedAgentId) {
      const agents = getCollection('agents');
      const agentIdx = agents.findIndex((a) => a.id === order.assignedAgentId);
      if (agentIdx !== -1 && agents[agentIdx].workload > 0) {
        agents[agentIdx].workload -= 1;
        setCollection('agents', agents);
      }
    }

    setCollection('orders', orders);
    return order;
  },
};
