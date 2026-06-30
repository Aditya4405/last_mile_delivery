import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ROLES } from '../constants';

const AuthContext = createContext();

// Pre-seeded users for demo purposes
const MOCK_USERS = [
  {
    id: 'user-admin-1',
    email: 'admin@logitrack.com',
    password: 'password123',
    name: 'Admin User',
    role: ROLES.ADMIN,
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    zoneId: 'zone-5',
  },
  {
    id: 'user-customer-1',
    email: 'customer@logitrack.com',
    password: 'password123',
    name: 'Customer Aditya',
    role: ROLES.CUSTOMER,
    phone: '+91 98765 43211',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    address: 'Block E, Connaught Place, New Delhi',
    zip: '110001',
    company: 'Aditya Retail Corp',
  },
  {
    id: 'user-agent-1',
    email: 'agent@logitrack.com',
    password: 'password123',
    name: 'John Delivery Agent',
    role: ROLES.AGENT,
    phone: '+91 98765 43212',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    status: 'active', // agent specific status: active / inactive
    workload: 3, // current assigned deliveries
    vehicle: 'Electric Bike',
    license: 'DL-98214-A',
  },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Auth State from localStorage and run migration checks
  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem('registered_users');
      if (storedUsers && storedUsers.includes('@swiftroute.com')) {
        const users = JSON.parse(storedUsers);
        const migrated = users.map(u => {
          if (u.email && u.email.endsWith('@swiftroute.com')) {
            u.email = u.email.replace('@swiftroute.com', '@logitrack.com');
          }
          return u;
        });
        localStorage.setItem('registered_users', JSON.stringify(migrated));
      }

      const storedAgents = localStorage.getItem('agents');
      if (storedAgents && storedAgents.includes('@swiftroute.com')) {
        const agents = JSON.parse(storedAgents);
        const migrated = agents.map(a => {
          if (a.email && a.email.endsWith('@swiftroute.com')) {
            a.email = a.email.replace('@swiftroute.com', '@logitrack.com');
          }
          return a;
        });
        localStorage.setItem('agents', JSON.stringify(migrated));
      }

      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (storedUser && storedUser.includes('@swiftroute.com')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      }
    } catch (e) {
      console.error('Browser localstorage migration failed', e);
    }

    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Failed to load authentication state', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password, rememberMe = false) => {
    setLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Get current lists of users (including newly registered ones)
    const users = JSON.parse(localStorage.getItem('registered_users')) || MOCK_USERS;
    const foundUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (foundUser) {
      const mockToken = `mock-jwt-token-${foundUser.role}-${Date.now()}`;
      const safeUser = { ...foundUser };
      delete safeUser.password; // Do not store passwords in memory

      setUser(safeUser);
      setToken(mockToken);

      const storageEngine = rememberMe ? localStorage : sessionStorage;
      storageEngine.setItem('token', mockToken);
      storageEngine.setItem('user', JSON.stringify(safeUser));

      toast.success(`Welcome back, ${safeUser.name}!`);
      setLoading(false);
      return safeUser;
    } else {
      setLoading(false);
      throw new Error('Invalid email or password.');
    }
  };

  const register = async (name, email, password, phone, address = '', zip = '') => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const users = JSON.parse(localStorage.getItem('registered_users')) || [...MOCK_USERS];
    const emailExists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());

    if (emailExists) {
      setLoading(false);
      throw new Error('Email address already registered.');
    }

    const newUser = {
      id: `user-customer-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role: ROLES.CUSTOMER,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 900000)}?w=150`,
      address,
      zip,
    };

    users.push(newUser);
    localStorage.setItem('registered_users', JSON.stringify(users));

    setLoading(false);
    toast.success('Registration successful! You can now log in.');
    return newUser;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    toast.success('Logged out successfully.');
  };

  const updateProfile = async (profileData) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Update local user state
    const updatedUser = { ...user, ...profileData };
    setUser(updatedUser);

    // Save to storage
    const storageEngine = localStorage.getItem('token') ? localStorage : sessionStorage;
    storageEngine.setItem('user', JSON.stringify(updatedUser));

    // Update database file in localstorage
    const users = JSON.parse(localStorage.getItem('registered_users')) || [...MOCK_USERS];
    const index = users.findIndex((u) => u.id === user.id);
    if (index !== -1) {
      users[index] = { ...users[index], ...profileData };
    } else {
      // Seed user into standard array
      const seedUser = MOCK_USERS.find((u) => u.id === user.id);
      if (seedUser) {
        users.push({ ...seedUser, ...profileData });
      }
    }
    localStorage.setItem('registered_users', JSON.stringify(users));

    setLoading(false);
    toast.success('Profile updated successfully.');
    return updatedUser;
  };

  const changePassword = async (oldPassword, newPassword) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const users = JSON.parse(localStorage.getItem('registered_users')) || [...MOCK_USERS];
    const index = users.findIndex((u) => u.id === user.id);
    const databaseUser = index !== -1 ? users[index] : MOCK_USERS.find((u) => u.id === user.id);

    if (databaseUser && databaseUser.password !== oldPassword) {
      setLoading(false);
      throw new Error('Current password is incorrect.');
    }

    if (index !== -1) {
      users[index].password = newPassword;
    } else {
      const newUser = { ...databaseUser, password: newPassword };
      users.push(newUser);
    }

    localStorage.setItem('registered_users', JSON.stringify(users));
    setLoading(false);
    toast.success('Password updated successfully.');
  };

  const forgotPassword = async (email) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const users = JSON.parse(localStorage.getItem('registered_users')) || MOCK_USERS;
    const userExists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!userExists) {
      throw new Error('No account found with this email address.');
    }

    // Set code in session for recovery verification
    sessionStorage.setItem('reset_email', email);
    sessionStorage.setItem('reset_code', '123456'); // Hardcoded demo code
    toast.success('Reset code "123456" sent to your email.');
  };

  const resetPassword = async (email, code, newPassword) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const sessionEmail = sessionStorage.getItem('reset_email');
    const sessionCode = sessionStorage.getItem('reset_code');

    if (email.toLowerCase() !== sessionEmail?.toLowerCase() || code !== sessionCode) {
      throw new Error('Invalid or expired reset code.');
    }

    const users = JSON.parse(localStorage.getItem('registered_users')) || [...MOCK_USERS];
    const index = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());

    if (index !== -1) {
      users[index].password = newPassword;
    } else {
      const seeded = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (seeded) {
        users.push({ ...seeded, password: newPassword });
      }
    }

    localStorage.setItem('registered_users', JSON.stringify(users));
    sessionStorage.removeItem('reset_email');
    sessionStorage.removeItem('reset_code');
    toast.success('Password reset successfully. You can now login.');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        forgotPassword,
        resetPassword,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
