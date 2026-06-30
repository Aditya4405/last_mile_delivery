import { getCollection, setCollection } from './db';

export const areaService = {
  getAreas: async (filters = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    let areas = getCollection('areas');
    const zones = getCollection('zones');

    // Populate zone details
    areas = areas.map((a) => {
      const zone = zones.find((z) => z.id === a.zoneId);
      return {
        ...a,
        zoneName: zone ? zone.name : 'Unknown Zone',
      };
    });

    if (filters.zoneId) {
      areas = areas.filter((a) => a.zoneId === filters.zoneId);
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
    await new Promise((resolve) => setTimeout(resolve, 500));
    const areas = getCollection('areas');
    const index = areas.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Area not found.');

    if (areas.some((a) => a.id !== id && a.zip === areaData.zip)) {
      throw new Error('An area with this Pincode already exists.');
    }

    areas[index] = { ...areas[index], ...areaData };
    setCollection('areas', areas);
    return areas[index];
  },

  deleteArea: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const areas = getCollection('areas');
    const filtered = areas.filter((a) => a.id !== id);
    setCollection('areas', filtered);
    return true;
  },
};
