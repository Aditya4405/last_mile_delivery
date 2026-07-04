import axiosInstance, { isLive } from './axios';
import { getCollection, setCollection } from './db';
import toast from 'react-hot-toast';

export const rateCardService = {
  getRateCards: async () => {
    if (isLive()) {
      try {
        const response = await axiosInstance.get('/api/rate-cards');
        const list = response.data.data || [];
        return list.map(r => ({
          id: String(r.id),
          type: r.cardType || r.type,
          scope: r.scope,
          baseWeight: r.baseWeight,
          basePrice: r.basePrice,
          extraWeightPrice: r.additionalWeightCharge || r.extraWeightPrice,
          codCharge: r.codCharge,
        }));
      } catch (err) {
        console.warn('Backend rate cards offline. Showing local demo rates.');
        toast.error('Rate cards endpoint offline. Showing demo rate cards.', { id: 'backend-offline-ratecards' });
      }
    }

    // Fallback Mock data
    await new Promise((resolve) => setTimeout(resolve, 300));
    return getCollection('rate_cards');
  },

  createRateCard: async (rateData) => {
    if (isLive()) {
      try {
        const response = await axiosInstance.post('/api/rate-cards', {
          cardType: rateData.type,
          scope: rateData.scope,
          baseWeight: parseFloat(rateData.baseWeight),
          basePrice: parseFloat(rateData.basePrice),
          additionalWeightCharge: parseFloat(rateData.extraWeightPrice),
          codCharge: parseFloat(rateData.codCharge)
        });
        const r = response.data.data;
        return {
          id: String(r.id),
          type: r.cardType,
          scope: r.scope,
          baseWeight: r.baseWeight,
          basePrice: r.basePrice,
          extraWeightPrice: r.additionalWeightCharge,
          codCharge: r.codCharge,
        };
      } catch (err) {
        throw new Error(err.response?.data?.message || 'Failed to create rate card.');
      }
    }

    // Fallback Mock data
    await new Promise((resolve) => setTimeout(resolve, 500));
    const rates = getCollection('rate_cards');
    const exists = rates.some(
      (r) =>
        r.type.toLowerCase() === rateData.type.toLowerCase() &&
        r.scope.toLowerCase() === rateData.scope.toLowerCase()
    );
    if (exists) {
      throw new Error(`A rate card for ${rateData.type} - ${rateData.scope} already exists.`);
    }

    const newRate = {
      id: `rate-${Date.now()}`,
      type: rateData.type,
      scope: rateData.scope,
      baseWeight: parseFloat(rateData.baseWeight) || 1,
      basePrice: parseFloat(rateData.basePrice) || 0,
      extraWeightPrice: parseFloat(rateData.extraWeightPrice) || 0,
      codCharge: parseFloat(rateData.codCharge) || 0,
    };

    rates.push(newRate);
    setCollection('rate_cards', rates);
    return newRate;
  },

  updateRateCard: async (id, rateData) => {
    if (isLive()) {
      try {
        const response = await axiosInstance.put(`/api/rate-cards/${id}`, {
          cardType: rateData.type,
          scope: rateData.scope,
          baseWeight: parseFloat(rateData.baseWeight),
          basePrice: parseFloat(rateData.basePrice),
          additionalWeightCharge: parseFloat(rateData.extraWeightPrice),
          codCharge: parseFloat(rateData.codCharge)
        });
        const r = response.data.data;
        return {
          id: String(r.id),
          type: r.cardType,
          scope: r.scope,
          baseWeight: r.baseWeight,
          basePrice: r.basePrice,
          extraWeightPrice: r.additionalWeightCharge,
          codCharge: r.codCharge,
        };
      } catch (err) {
        throw new Error(err.response?.data?.message || 'Failed to update rate card.');
      }
    }

    // Fallback Mock data
    await new Promise((resolve) => setTimeout(resolve, 500));
    const rates = getCollection('rate_cards');
    const index = rates.findIndex((r) => String(r.id) === String(id));
    if (index === -1) throw new Error('Rate card not found.');

    rates[index] = {
      ...rates[index],
      baseWeight: parseFloat(rateData.baseWeight),
      basePrice: parseFloat(rateData.basePrice),
      extraWeightPrice: parseFloat(rateData.extraWeightPrice),
      codCharge: parseFloat(rateData.codCharge),
    };

    setCollection('rate_cards', rates);
    return rates[index];
  },

  deleteRateCard: async (id) => {
    if (isLive()) {
      try {
        await axiosInstance.delete(`/api/rate-cards/${id}`);
        return true;
      } catch (err) {
        throw new Error(err.response?.data?.message || 'Failed to delete rate card.');
      }
    }

    const rates = getCollection('rate_cards');
    const filtered = rates.filter((r) => String(r.id) !== String(id));
    setCollection('rate_cards', filtered);
    return true;
  },

  calculateOrderPrice: async (pickupZone, dropZone, orderType, paymentType, billableWeight) => {
    if (isLive()) {
      try {
        // Backend order calculate charges endpoint:
        // POST /api/orders/calculate
        const response = await axiosInstance.post('/api/orders/calculate', {
          pickupZoneCode: pickupZone,
          deliveryZoneCode: dropZone,
          cardType: orderType === 'B2B' ? 'B2B' : 'B2C',
          isCod: paymentType === 'COD',
          weight: parseFloat(billableWeight) || 0.5,
          length: 10.0,
          breadth: 10.0,
          height: 10.0
        });
        return response.data.data.shippingCharge;
      } catch (err) {
        console.warn('Backend charges calculation failed, falling back to local formulas.');
      }
    }

    // Fallback Mock data calculation logic
    const scope = pickupZone === dropZone ? 'Intra Zone' : 'Inter Zone';
    const rates = getCollection('rate_cards');
    const rateCard = rates.find(
      (r) => r.type.toUpperCase() === orderType.toUpperCase() && r.scope.toLowerCase() === scope.toLowerCase()
    );

    if (!rateCard) {
      const base = orderType === 'B2B' ? 350.0 : 70.0;
      const extra = billableWeight > 2 ? (billableWeight - 2) * 20.0 : 0;
      const cod = paymentType === 'COD' ? 30.0 : 0;
      return base + extra + cod;
    }

    const { baseWeight, basePrice, extraWeightPrice, codCharge } = rateCard;
    let price = basePrice;
    if (billableWeight > baseWeight) {
      price += (billableWeight - baseWeight) * extraWeightPrice;
    }
    if (paymentType === 'COD') {
      price += codCharge;
    }

    return Math.round(price * 100) / 100;
  },
};
