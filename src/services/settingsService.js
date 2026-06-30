export const settingsService = {
  getSettings: async (userId) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const saved = localStorage.getItem(`settings_${userId}`);
    return saved ? JSON.parse(saved) : {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      language: 'en',
      security2FA: false,
    };
  },

  saveSettings: async (userId, settingsData) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    localStorage.setItem(`settings_${userId}`, JSON.stringify(settingsData));
    return settingsData;
  },
};
