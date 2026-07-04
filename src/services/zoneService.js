import axiosInstance, { isLive } from './axios';
import { getCollection, setCollection } from './db';
import toast from 'react-hot-toast';

export const zoneService = {
  getZones: async (filters = {}) => {
    if (isLive()) {
      try {
        const response = await axiosInstance.get('/api/zones');
        let list = response.data.data || [];
        
        // Map backend response fields (id, name, code, description) to match frontend keys
        let zones = list.map(z => ({
          id: String(z.id),
          name: z.name,
          code: z.code,
          description: z.description,
        }));

        if (filters.search) {
          const q = filters.search.toLowerCase();
          zones = zones.filter(
            (z) =>
              z.name.toLowerCase().includes(q) ||
              z.code.toLowerCase().includes(q) ||
              (z.description && z.description.toLowerCase().includes(q))
          );
        }
        return zones;
      } catch (err) {
        console.warn('Backend zones offline. Showing local demo zones.');
        toast.error('Zones endpoint offline. Showing demo zones.', { id: 'backend-offline-zones' });
      }
    }

    // Fallback Mock data
    await new Promise((resolve) => setTimeout(resolve, 300));
    let zones = getCollection('zones');

    if (filters.search) {
      const q = filters.search.toLowerCase();
      zones = zones.filter(
        (z) =>
          z.name.toLowerCase().includes(q) ||
          z.code.toLowerCase().includes(q) ||
          z.description.toLowerCase().includes(q)
      );
    }
    return zones;
  },

  getZoneById: async (id) => {
    if (isLive()) {
      try {
        const response = await axiosInstance.get(`/api/zones/${id}`);
        const z = response.data.data;
        return {
          id: String(z.id),
          name: z.name,
          code: z.code,
          description: z.description,
        };
      } catch (err) {
        console.warn(err);
      }
    }

    // Fallback Mock data
    await new Promise((resolve) => setTimeout(resolve, 200));
    const zones = getCollection('zones');
    const zone = zones.find((z) => String(z.id) === String(id));
    if (!zone) throw new Error('Zone not found.');
    return zone;
  },

  createZone: async (zoneData) => {
    if (isLive()) {
      try {
        const response = await axiosInstance.post('/api/zones', {
          name: zoneData.name,
          code: zoneData.code.toUpperCase(),
          description: zoneData.description
        });
        const z = response.data.data;
        return {
          id: String(z.id),
          name: z.name,
          code: z.code,
          description: z.description,
        };
      } catch (err) {
        throw new Error(err.response?.data?.message || 'Failed to create zone.');
      }
    }

    // Fallback Mock data
    await new Promise((resolve) => setTimeout(resolve, 400));
    const zones = getCollection('zones');
    if (zones.some((z) => z.code.toLowerCase() === zoneData.code.toLowerCase())) {
      throw new Error('A zone with this code already exists.');
    }

    const newZone = {
      id: `zone-${Date.now()}`,
      name: zoneData.name,
      code: zoneData.code.toUpperCase(),
      description: zoneData.description || '',
    };

    zones.push(newZone);
    setCollection('zones', zones);
    return newZone;
  },

  updateZone: async (id, zoneData) => {
    if (isLive()) {
      try {
        const response = await axiosInstance.put(`/api/zones/${id}`, {
          name: zoneData.name,
          code: zoneData.code.toUpperCase(),
          description: zoneData.description
        });
        const z = response.data.data;
        return {
          id: String(z.id),
          name: z.name,
          code: z.code,
          description: z.description,
        };
      } catch (err) {
        throw new Error(err.response?.data?.message || 'Failed to update zone.');
      }
    }

    // Fallback Mock data
    await new Promise((resolve) => setTimeout(resolve, 400));
    const zones = getCollection('zones');
    const index = zones.findIndex((z) => String(z.id) === String(id));
    if (index === -1) throw new Error('Zone not found.');

    if (
      zones.some(
        (z) => String(z.id) !== String(id) && z.code.toLowerCase() === zoneData.code.toLowerCase()
      )
    ) {
      throw new Error('A zone with this code already exists.');
    }

    zones[index] = { ...zones[index], ...zoneData, code: zoneData.code.toUpperCase() };
    setCollection('zones', zones);
    return zones[index];
  },

  deleteZone: async (id) => {
    if (isLive()) {
      try {
        await axiosInstance.delete(`/api/zones/${id}`);
        return true;
      } catch (err) {
        throw new Error(err.response?.data?.message || 'Failed to delete zone.');
      }
    }

    const zones = getCollection('zones');
    const areas = getCollection('areas');
    const linkedAreas = areas.filter((a) => String(a.zoneId) === String(id));
    if (linkedAreas.length > 0) {
      throw new Error(
        `Cannot delete zone. It has ${linkedAreas.length} linked areas. Delete those areas first.`
      );
    }

    const filtered = zones.filter((z) => String(z.id) !== String(id));
    setCollection('zones', filtered);
    return true;
  },
};
