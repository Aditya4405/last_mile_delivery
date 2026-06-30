import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Breadcrumbs from './Breadcrumbs';
import Footer from './Footer';
import { FiGrid, FiTruck, FiTrendingUp, FiSettings } from 'react-icons/fi';

const AgentLayout = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return null;

  // Protect Route
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== ROLES.AGENT) {
    return <Navigate to="/unauthorized" replace />;
  }

  const agentMenu = [
    { label: 'Agent Dashboard', path: '/agent', icon: FiGrid, end: true },
    { label: 'Assigned Shipments', path: '/agent/shipments', icon: FiTruck },
    { label: 'My Performance', path: '/agent/profile', icon: FiTrendingUp },
    { label: 'Shift Settings', path: '/agent/settings', icon: FiSettings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-905 flex transition-colors duration-200">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        menuItems={agentMenu}
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

export default AgentLayout;
