import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Breadcrumbs from './Breadcrumbs';
import Footer from './Footer';
import { FiGrid, FiPackage, FiTruck, FiUsers, FiMap, FiMapPin, FiDollarSign, FiPieChart, FiSettings } from 'react-icons/fi';

const AdminLayout = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return null; // wait for context initialisation

  // Protect Admin Route
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== ROLES.ADMIN) {
    return <Navigate to="/unauthorized" replace />;
  }

  const adminMenu = [
    { label: 'Dashboard', path: '/admin', icon: FiGrid, end: true },
    { label: 'Manage Orders', path: '/admin/orders', icon: FiPackage },
    { label: 'Manage Agents', path: '/admin/agents', icon: FiTruck },
    { label: 'Manage Customers', path: '/admin/customers', icon: FiUsers },
    { label: 'Manage Zones', path: '/admin/zones', icon: FiMap },
    { label: 'Manage Areas', path: '/admin/areas', icon: FiMapPin },
    { label: 'Rate Cards', path: '/admin/rates', icon: FiDollarSign },
    { label: 'Analytics Reports', path: '/admin/reports', icon: FiPieChart },
    { label: 'System Settings', path: '/admin/settings', icon: FiSettings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-905 flex transition-colors duration-200">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        menuItems={adminMenu}
      />
      
      {/* Main Panel Content Area */}
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

export default AdminLayout;
