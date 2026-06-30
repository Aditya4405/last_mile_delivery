import { getCollection, setCollection } from './db';

export const rateCardService = {
  getRateCards: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return getCollection('rate_cards');
  },

  createRateCard: async (rateData) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const rates = getCollection('rate_cards');

    // Prevent duplicate scope + type configs
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
      type: rateData.type, // B2B / B2C
      scope: rateData.scope, // Intra Zone / Inter Zone
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
    await new Promise((resolve) => setTimeout(resolve, 500));
    const rates = getCollection('rate_cards');
    const index = rates.findIndex((r) => r.id === id);
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
    await new Promise((resolve) => setTimeout(resolve, 400));
    const rates = getCollection('rate_cards');
    const filtered = rates.filter((r) => r.id !== id);
    setCollection('rate_cards', filtered);
    return true;
  },

  calculateOrderPrice: async (pickupZone, dropZone, orderType, paymentType, billableWeight) => {
    // Determine scope
    const scope = pickupZone === dropZone ? 'Intra Zone' : 'Inter Zone';
    const rates = getCollection('rate_cards');
    const rateCard = rates.find(
      (r) => r.type.toUpperCase() === orderType.toUpperCase() && r.scope.toLowerCase() === scope.toLowerCase()
    );

    if (!rateCard) {
      // Fallback standard calculation if ratecard missing
      const base = orderType === 'B2B' ? 25.0 : 8.0;
      const extra = billableWeight > 2 ? (billableWeight - 2) * 2.5 : 0;
      const cod = paymentType === 'COD' ? 2.0 : 0;
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
