import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Breadcrumbs from './Breadcrumbs';
import Footer from './Footer';
import { FiGrid, FiPlusCircle, FiList, FiUser, FiHelpCircle, FiSettings } from 'react-icons/fi';

const CustomerLayout = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return null;

  // Protect Route
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== ROLES.CUSTOMER) {
    return <Navigate to="/unauthorized" replace />;
  }

  const customerMenu = [
    { label: 'Overview Dashboard', path: '/customer', icon: FiGrid, end: true },
    { label: 'Create Delivery Order', path: '/customer/book', icon: FiPlusCircle },
    { label: 'My Order History', path: '/customer/orders', icon: FiList },
    { label: 'Profile Account', path: '/customer/profile', icon: FiUser },
    { label: 'Help Desk Center', path: '/customer/help', icon: FiHelpCircle },
    { label: 'Profile Settings', path: '/customer/settings', icon: FiSettings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex transition-colors duration-200">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        menuItems={customerMenu}
      />
      
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        <Navbar onToggleSidebar={() => setSidebarOpen(true)} />
        
        <main className="flex-1 px-6 py-6 overflow-y-auto">
          <Breadcrumbs />
          <Outlet />
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default CustomerLayout;
