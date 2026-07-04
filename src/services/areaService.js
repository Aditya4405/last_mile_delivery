import axiosInstance, { isLive } from './axios';
import { getCollection, setCollection } from './db';
import toast from 'react-hot-toast';

export const areaService = {
  getAreas: async (filters = {}) => {
    if (isLive()) {
      try {
        const response = await axiosInstance.get('/api/areas');
        let list = response.data.data || [];
        
        let areas = list.map(a => ({
          id: String(a.id),
          name: a.name,
          zip: a.pincode || a.zip || '',
          zoneId: String(a.zoneId),
          zoneName: a.zoneName || 'Unknown Zone',
        }));

        if (filters.zoneId) {
          areas = areas.filter((a) => String(a.zoneId) === String(filters.zoneId));
        }
        if (filters.search) {
          const q = filters.search.toLowerCase();
          areas = areas.filter(
            (a) =>
              a.name.toLowerCase().includes(q) ||
              a.zip.toLowerCase().includes(q) ||
              a.zoneName.toLowerCase().includes(q)
          );
        }
        return areas;
      } catch (err) {
        console.warn('Backend areas offline. Showing local demo areas.');
        toast.error('Areas endpoint offline. Showing demo areas.', { id: 'backend-offline-areas' });
      }
    }

    // Fallback Mock data
    await new Promise((resolve) => setTimeout(resolve, 300));
    let areas = getCollection('areas');
    const zones = getCollection('zones');

    areas = areas.map((a) => {
      const zone = zones.find((z) => String(z.id) === String(a.zoneId));
      return {
        ...a,
        zoneName: zone ? zone.name : 'Unknown Zone',
      };
    });

    if (filters.zoneId) {
      areas = areas.filter((a) => String(a.zoneId) === String(filters.zoneId));
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      areas = areas.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.zip.toLowerCase().includes(q) ||
          a.zoneName.toLowerCase().includes(q)
      );
    }
    return areas;
  },

  createArea: async (areaData) => {
    if (isLive()) {
      try {
        const response = await axiosInstance.post('/api/areas', {
          name: areaData.name,
          pincode: areaData.zip || areaData.pincode,
          zoneId: parseInt(areaData.zoneId)
        });
        const a = response.data.data;
        return {
          id: String(a.id),
          name: a.name,
          zip: a.pincode,
          zoneId: String(a.zoneId),
        };
      } catch (err) {
        throw new Error(err.response?.data?.message || 'Failed to create area.');
      }
    }

    // Fallback Mock data
    await new Promise((resolve) => setTimeout(resolve, 500));
    const areas = getCollection('areas');
    if (areas.some((a) => a.zip === areaData.zip)) {
      throw new Error('An area with this Pincode already exists.');
    }

    const newArea = {
      id: `area-${Date.now()}`,
      name: areaData.name,
      zip: areaData.zip,
      zoneId: areaData.zoneId,
    };

    areas.push(newArea);
    setCollection('areas', areas);
    return newArea;
  },

  updateArea: async (id, areaData) => {
    if (isLive()) {
      try {
        const response = await axiosInstance.put(`/api/areas/${id}`, {
          name: areaData.name,
          pincode: areaData.zip || areaData.pincode,
          zoneId: parseInt(areaData.zoneId)
        });
        const a = response.data.data;
        return {
          id: String(a.id),
          name: a.name,
          zip: a.pincode,
          zoneId: String(a.zoneId),
        };
      } catch (err) {
        throw new Error(err.response?.data?.message || 'Failed to update area.');
      }
    }

    // Fallback Mock data
    await new Promise((resolve) => setTimeout(resolve, 500));
    const areas = getCollection('areas');
    const index = areas.findIndex((a) => String(a.id) === String(id));
    if (index === -1) throw new Error('Area not found.');

    if (areas.some((a) => String(a.id) !== String(id) && a.zip === areaData.zip)) {
      throw new Error('An area with this Pincode already exists.');
    }

    areas[index] = { ...areas[index], ...areaData };
    setCollection('areas', areas);
    return areas[index];
  },

  deleteArea: async (id) => {
    if (isLive()) {
      try {
        await axiosInstance.delete(`/api/areas/${id}`);
        return true;
      } catch (err) {
        throw new Error(err.response?.data?.message || 'Failed to delete area.');
      }
    }

    const areas = getCollection('areas');
    const filtered = areas.filter((a) => String(a.id) !== String(id));
    setCollection('areas', filtered);
    return true;
  },
};
