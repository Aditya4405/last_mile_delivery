import axiosInstance, { isLive } from './axios';
import toast from 'react-hot-toast';

const MOCK_SETTINGS = [
  { settingKey: 'COMPANY_NAME', settingValue: 'LogiTrack Logistics', category: 'GENERAL', description: 'Official company business name.', editable: true },
  { settingKey: 'COMPANY_EMAIL', settingValue: 'support@logitrack.in', category: 'GENERAL', description: 'Primary customer support email.', editable: true },
  { settingKey: 'COMPANY_PHONE', settingValue: '+91 98765 43210', category: 'GENERAL', description: 'Primary support contact number.', editable: true },
  { settingKey: 'MIN_PARCEL_WEIGHT', settingValue: '0.1', category: 'ORDERS', description: 'Minimum allowed shipment weight in kilograms.', editable: true },
  { settingKey: 'MAX_PARCEL_WEIGHT', settingValue: '100.0', category: 'ORDERS', description: 'Maximum allowed shipment weight in kilograms.', editable: true },
  { settingKey: 'TRACKING_NUMBER_PREFIX', settingValue: 'TRK', category: 'TRACKING', description: 'Prefix character string prepended to new shipment numbers.', editable: true },
  { settingKey: 'TRACKING_NUMBER_LENGTH', settingValue: '12', category: 'TRACKING', description: 'Length of randomized tracking numbers.', editable: true },
  { settingKey: 'ENABLE_COD', settingValue: 'true', category: 'PAYMENTS', description: 'Enable/disable Cash on Delivery checkout method.', editable: true },
  { settingKey: 'MAX_COD_AMOUNT', settingValue: '50000.0', category: 'PAYMENTS', description: 'Maximum allowed COD value per transaction.', editable: true },
  { settingKey: 'ENABLE_RAZORPAY', settingValue: 'true', category: 'PAYMENTS', description: 'Enable online gateway processing powered by Razorpay.', editable: true },
  { settingKey: 'DEFAULT_COD_CHARGE', settingValue: '50.0', category: 'PAYMENTS', description: 'Default fallback charge applied to Cash on Delivery orders.', editable: true },
  { settingKey: 'DEFAULT_ETA_SPEED', settingValue: '35.0', category: 'TRACKING', description: 'Average fleet transit speed in km/h for ETA routing estimations.', editable: true }
];

export const settingsService = {
  getAllSettings: async () => {
    if (isLive()) {
      try {
        const response = await axiosInstance.get('/api/settings');
        return response.data.data || [];
      } catch (err) {
        console.warn('Backend settings offline. Showing local demo configurations.', err);
      }
    }

    // Fallback Mock data
    await new Promise((resolve) => setTimeout(resolve, 200));
    const stored = localStorage.getItem('demo_settings');
    if (stored) return JSON.parse(stored);
    localStorage.setItem('demo_settings', JSON.stringify(MOCK_SETTINGS));
    return MOCK_SETTINGS;
  },

  updateSetting: async (key, val) => {
    if (isLive()) {
      try {
        const response = await axiosInstance.put(`/api/settings/${key}?value=${val}`);
        return response.data.data;
      } catch (err) {
        throw new Error(err.response?.data?.message || 'Failed to update configuration parameter.');
      }
    }

    // Fallback Mock data
    const stored = JSON.parse(localStorage.getItem('demo_settings')) || MOCK_SETTINGS;
    const index = stored.findIndex((s) => s.settingKey === key);
    if (index !== -1) {
      stored[index].settingValue = String(val);
      localStorage.setItem('demo_settings', JSON.stringify(stored));
    }
    return true;
  },

  resetToDefaults: async () => {
    if (isLive()) {
      try {
        await axiosInstance.post('/api/settings/reset');
        return true;
      } catch (err) {
        throw new Error(err.response?.data?.message || 'Failed to reset configurations.');
      }
    }

    // Fallback Mock data
    localStorage.setItem('demo_settings', JSON.stringify(MOCK_SETTINGS));
    return true;
  },
};
