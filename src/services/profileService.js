import { getCollection } from './db';

export const profileService = {
  uploadAvatar: async (userId, fileBase64) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    // Simulate image upload by saving base64 to localstorage user profile
    const registered = JSON.parse(localStorage.getItem('registered_users')) || [];
    const index = registered.findIndex((u) => u.id === userId);
    if (index !== -1) {
      registered[index].avatar = fileBase64;
      localStorage.setItem('registered_users', JSON.stringify(registered));
    }
    return fileBase64;
  },

  getActivityLog: async (userId) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    // Seed some mock logs
    return [
      { id: 'act-1', event: 'Profile Updated', details: 'Changed telephone number details.', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
      { id: 'act-2', event: 'Security Credentials', details: 'Changed account passcode.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
      { id: 'act-3', event: 'Session Login', details: 'Authenticated via Chrome Browser (Windows OS).', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() },
    ];
  },

  raiseTicket: async (ticketData) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const tickets = getCollection('tickets') || [];
    const newTicket = {
      id: `TCK-${Math.floor(100 + Math.random() * 900)}`,
      subject: ticketData.subject,
      orderId: ticketData.orderId || 'General',
      status: 'Open',
      message: ticketData.message,
      createdAt: new Date().toISOString(),
    };
    tickets.unshift(newTicket);
    localStorage.setItem('tickets', JSON.stringify(tickets));
    return newTicket;
  },

  getTickets: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return getCollection('tickets') || [];
  },
};
