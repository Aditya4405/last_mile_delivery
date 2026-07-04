import axios from 'axios';

export const addressService = {
  getSuggestions: async (query) => {
    if (!query || query.length < 3) return [];
    try {
      // Free Nominatim API (OpenStreetMap)
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: query,
          format: 'json',
          countrycodes: 'in',
          limit: 5,
          addressdetails: 1,
        },
        headers: {
          'Accept-Language': 'en'
        }
      });
      
      return response.data.map(item => {
        const address = item.address || {};
        const city = address.city || address.town || address.village || address.suburb || address.state_district || '';
        const pincode = address.postcode || '';
        return {
          displayName: item.display_name,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          city,
          pincode,
        };
      });
    } catch (error) {
      console.error('Error geocoding address suggestions:', error);
      return [];
    }
  },
};
