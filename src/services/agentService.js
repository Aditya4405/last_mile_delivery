import axiosInstance, { isLive } from './axios';
import { getCollection, setCollection } from './db';
import { ROLES } from '../constants';
import toast from 'react-hot-toast';

export const agentService = {
  getAgents: async (filters = {}) => {
    if (isLive()) {
      try {
        const response = await axiosInstance.get('/api/admin/agents');
        const list = response.data.data || [];
        
        let agents = list.map(a => ({
          id: String(a.id),
          name: a.fullName || a.name,
          email: a.email,
          phone: a.phone,
          role: ROLES.AGENT,
          status: a.available ? 'active' : 'inactive',
          workload: a.workload || 0,
          vehicle: a.vehicleType || 'Electric Bike',
          license: a.licenseNumber || 'DL-98214-A',
          rating: a.rating || 5.0,
          zoneId: a.zoneId ? String(a.zoneId) : undefined,
        }));

        if (filters.status) {
          agents = agents.filter((a) => a.status === filters.status);
        }
        if (filters.zoneId) {
          agents = agents.filter((a) => String(a.zoneId) === String(filters.zoneId));
        }
        if (filters.search) {
          const q = filters.search.toLowerCase();
          agents = agents.filter(
            (a) =>
              (a.name && a.name.toLowerCase().includes(q)) ||
              (a.email && a.email.toLowerCase().includes(q)) ||
              (a.phone && a.phone.toLowerCase().includes(q)) ||
              (a.vehicle && a.vehicle.toLowerCase().includes(q))
          );
        }

        return agents;
      } catch (err) {
        console.warn('Backend agents list offline. Showing demo agents.', err);
        toast.error('Agent lookup offline. Showing demo fleet.', { id: 'backend-offline-agents' });
      }
    }

    // Fallback Mock data
    await new Promise((resolve) => setTimeout(resolve, 300));
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
    if (isLive()) {
      try {
        // Register agent user account
        await axiosInstance.post('/api/auth/register', {
          email: agentData.email,
          password: 'password123',
          fullName: agentData.name,
          phone: agentData.phone,
          role: 'DELIVERY_AGENT'
        });

        // Now fetch newly registered agent to update vehicle & license details
        const listRes = await axiosInstance.get('/api/admin/agents');
        const list = listRes.data.data || [];
        const newAgent = list.find(a => a.email.toLowerCase() === agentData.email.toLowerCase());

        if (newAgent) {
          // Update vehicle & license details
          const updateRes = await axiosInstance.put(`/api/admin/agents/${newAgent.id}`, {
            vehicleType: agentData.vehicle || 'Electric Bike',
            licenseNumber: agentData.license || 'N/A'
          });
          const saved = updateRes.data.data;
          return {
            id: String(saved.id),
            name: saved.fullName,
            email: saved.email,
            phone: saved.phone,
            role: ROLES.AGENT,
            status: saved.available ? 'active' : 'inactive',
            workload: saved.workload || 0,
            vehicle: saved.vehicleType,
            license: saved.licenseNumber,
            rating: saved.rating || 5.0,
          };
        }
        
        throw new Error('Agent registration completed but profile mapping failed.');
      } catch (err) {
        throw new Error(err.response?.data?.message || 'Agent creation failed.');
      }
    }

    // Fallback Mock data
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
    if (isLive()) {
      try {
        const payload = {
          vehicleType: agentData.vehicle || agentData.vehicleType,
          licenseNumber: agentData.license || agentData.licenseNumber
        };
        const response = await axiosInstance.put(`/api/admin/agents/${id}`, payload);
        const saved = response.data.data;
        return {
          id: String(saved.id),
          name: saved.fullName,
          email: saved.email,
          phone: saved.phone,
          role: ROLES.AGENT,
          status: saved.available ? 'active' : 'inactive',
          workload: saved.workload || 0,
          vehicle: saved.vehicleType,
          license: saved.licenseNumber,
          rating: saved.rating || 5.0,
        };
      } catch (err) {
        throw new Error(err.response?.data?.message || 'Agent update failed.');
      }
    }

    // Fallback Mock data
    await new Promise((resolve) => setTimeout(resolve, 300));
    const agents = getCollection('agents');
    const index = agents.findIndex((a) => String(a.id) === String(id));
    if (index === -1) throw new Error('Agent not found.');

    agents[index] = { ...agents[index], ...agentData };
    setCollection('agents', agents);
    return agents[index];
  },

  deleteAgent: async (id) => {
    if (isLive()) {
      try {
        await axiosInstance.delete(`/api/admin/agents/${id}`);
        return true;
      } catch (err) {
        throw new Error(err.response?.data?.message || 'Agent delete failed.');
      }
    }

    const agents = getCollection('agents');
    const filtered = agents.filter((a) => String(a.id) !== String(id));
    setCollection('agents', filtered);
    return true;
  },

  toggleAvailability: async (id) => {
    if (isLive()) {
      try {
        // Toggle current agent's availability state (calls own PUT endpoint)
        // Wait: toggleAvailability is called by current agent on their dashboard availability toggle
        // Backend maps available true/false parameter. Let's get profile to know active status first
        const profileRes = await axiosInstance.get('/api/agents/profile');
        const active = profileRes.data.data.available;
        const response = await axiosInstance.put(`/api/agents/availability?available=${!active}`);
        return response.data.data.available ? 'active' : 'inactive';
      } catch (err) {
        console.error(err);
      }
    }

    // Fallback Mock data
    await new Promise((resolve) => setTimeout(resolve, 200));
    const agents = getCollection('agents');
    const index = agents.findIndex((a) => String(a.id) === String(id));
    if (index === -1) throw new Error('Agent not found.');

    const newStatus = agents[index].status === 'active' ? 'inactive' : 'active';
    agents[index].status = newStatus;
    setCollection('agents', agents);
    return newStatus;
  },

  getNearestAgents: async (zoneId) => {
    if (isLive()) {
      try {
        // Call backend admin agents list and filter active agents in the zone
        const listRes = await axiosInstance.get('/api/admin/agents');
        const list = listRes.data.data || [];
        return list
          .filter(a => a.available && String(a.zoneId) === String(zoneId))
          .map(a => ({
            id: String(a.id),
            name: a.fullName,
            workload: a.workload || 0,
            vehicle: a.vehicleType || 'Bike',
          }))
          .sort((a, b) => a.workload - b.workload);
      } catch (err) {
        console.warn('Backend agents lookup failed, falling back to nearest mock agents.');
      }
    }

    // Fallback Mock data
    await new Promise((resolve) => setTimeout(resolve, 300));
    const agents = getCollection('agents');
    return agents
      .filter((a) => a.status === 'active' && a.zoneId === zoneId)
      .sort((a, b) => a.workload - b.workload);
  },
};
