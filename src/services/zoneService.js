import { getCollection, setCollection } from './db';

export const zoneService = {
  getZones: async (filters = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
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
    await new Promise((resolve) => setTimeout(resolve, 200));
    const zones = getCollection('zones');
    const zone = zones.find((z) => z.id === id);
    if (!zone) throw new Error('Zone not found.');
    return zone;
  },

  createZone: async (zoneData) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const zones = getCollection('zones');
    
    // Check if code exists
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
    await new Promise((resolve) => setTimeout(resolve, 500));
    const zones = getCollection('zones');
    const index = zones.findIndex((z) => z.id === id);
    if (index === -1) throw new Error('Zone not found.');

    // Check code uniqueness excluding current zone
    if (
      zones.some(
        (z) => z.id !== id && z.code.toLowerCase() === zoneData.code.toLowerCase()
      )
    ) {
      throw new Error('A zone with this code already exists.');
    }

    zones[index] = { ...zones[index], ...zoneData, code: zoneData.code.toUpperCase() };
    setCollection('zones', zones);
    return zones[index];
  },

  deleteZone: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const zones = getCollection('zones');
    
    // Check if areas are linked to this zone
    const areas = getCollection('areas');
    const linkedAreas = areas.filter((a) => a.zoneId === id);
    if (linkedAreas.length > 0) {
      throw new Error(
        `Cannot delete zone. It has ${linkedAreas.length} linked areas. Delete those areas first.`
      );
    }

    const filtered = zones.filter((z) => z.id !== id);
    setCollection('zones', filtered);
    return true;
  },
};
