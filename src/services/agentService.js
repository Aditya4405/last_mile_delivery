import { getCollection, setCollection } from './db';
import { ROLES } from '../constants';

export const agentService = {
  getAgents: async (filters = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    let agents = getCollection('agents');

    if (filters.status) {
      agents = agents.filter((a) => a.status === filters.status);
    }
    if (filters.zoneId) {
      agents = agents.filter((a) => a.zoneId === filters.zoneId);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      agents = agents.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.phone.toLowerCase().includes(q) ||
          a.vehicle.toLowerCase().includes(q)
      );
    }

    return agents;
  },

  createAgent: async (agentData) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const agents = getCollection('agents');

    if (agents.some((a) => a.email.toLowerCase() === agentData.email.toLowerCase())) {
      throw new Error('An agent account with this email already exists.');
    }

    const newAgent = {
      id: `user-agent-${Date.now()}`,
      name: agentData.name,
      email: agentData.email.toLowerCase(),
      phone: agentData.phone,
      role: ROLES.AGENT,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 900000)}?w=150`,
      status: 'active',
      workload: 0,
      vehicle: agentData.vehicle || 'Bike',
      license: agentData.license || 'N/A',
      rating: 5.0,
      zoneId: agentData.zoneId,
    };

    agents.push(newAgent);
    setCollection('agents', agents);
    return newAgent;
  },

  updateAgent: async (id, agentData) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const agents = getCollection('agents');
    const index = agents.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Agent not found.');

    agents[index] = { ...agents[index], ...agentData };
    setCollection('agents', agents);
    return agents[index];
  },

  deleteAgent: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const agents = getCollection('agents');
    const filtered = agents.filter((a) => a.id !== id);
    setCollection('agents', filtered);
    return true;
  },

  toggleAvailability: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const agents = getCollection('agents');
    const index = agents.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Agent not found.');

    const newStatus = agents[index].status === 'active' ? 'inactive' : 'active';
    agents[index].status = newStatus;
    setCollection('agents', agents);
    return newStatus;
  },

  getNearestAgents: async (zoneId) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const agents = getCollection('agents');
    
    // Nearest is represented by active agents in the same zone, sorted by lower workload first
    return agents
      .filter((a) => a.status === 'active' && a.zoneId === zoneId)
      .sort((a, b) => a.workload - b.workload);
  },
};
