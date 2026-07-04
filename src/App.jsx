import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import CustomerLayout from './layouts/CustomerLayout';
import AgentLayout from './layouts/AgentLayout';

// Shared Components
import Loader from './components/Loader';

// Error Views
import { NotFoundPage, ForbiddenPage, ServerErrorPage, MaintenancePage } from './components/ErrorPages';

// Lazy Loaded Pages
// Auth Pages
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const Landing = lazy(() => import('./pages/Landing'));


// Customer Pages
const CustomerDashboard = lazy(() => import('./pages/customer/CustomerDashboard'));
const CreateOrder = lazy(() => import('./pages/customer/CreateOrder'));
const OrderHistory = lazy(() => import('./pages/customer/OrderHistory'));
const OrderDetails = lazy(() => import('./pages/customer/OrderDetails'));
const LiveTracking = lazy(() => import('./pages/customer/LiveTracking'));
const HelpCenter = lazy(() => import('./pages/customer/HelpCenter'));
const CustomerSettings = lazy(() => import('./pages/customer/Settings'));
const CustomerProfile = lazy(() => import('./pages/customer/Profile'));
const CustomerPayments = lazy(() => import('./pages/customer/Payments'));

// Agent Pages
const AgentDashboard = lazy(() => import('./pages/agent/AgentDashboard'));
const AssignedShipments = lazy(() => import('./pages/agent/AssignedShipments'));
const StatusUpdate = lazy(() => import('./pages/agent/StatusUpdate'));
const AgentProfile = lazy(() => import('./pages/agent/Profile'));
const AgentSettings = lazy(() => import('./pages/agent/Settings'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ManageCustomers = lazy(() => import('./pages/admin/ManageCustomers'));
const ManageAgents = lazy(() => import('./pages/admin/ManageAgents'));
const ManageOrders = lazy(() => import('./pages/admin/ManageOrders'));
const AssignAgent = lazy(() => import('./pages/admin/AssignAgent'));
const ManageZones = lazy(() => import('./pages/admin/ManageZones'));
const ManageAreas = lazy(() => import('./pages/admin/ManageAreas'));
const ManageRateCards = lazy(() => import('./pages/admin/ManageRateCards'));
const Reports = lazy(() => import('./pages/admin/Reports'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const AdminPayments = lazy(() => import('./pages/admin/Payments'));

// Shared Notifications Center
const NotificationsCenter = lazy(() => import('./pages/common/NotificationsCenter'));

const App = () => {
  return (
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Suspense fallback={<Loader message="Initializing LogiTrack Logistics Control Center..." />}>
              <Routes>
                {/* Public Auth Routes */}
                <Route element={<PublicLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                </Route>

                {/* Landing Page */}
                <Route path="/" element={<Landing />} />

                {/* Customer Dashboard Routes */}
                <Route path="/customer" element={<CustomerLayout />}>
                  <Route index element={<CustomerDashboard />} />
                  <Route path="book" element={<CreateOrder />} />
                  <Route path="orders" element={<OrderHistory />} />
                  <Route path="orders/:id" element={<OrderDetails />} />
                  <Route path="orders/:id/track" element={<LiveTracking />} />
                  <Route path="payments" element={<CustomerPayments />} />
                  <Route path="profile" element={<CustomerProfile />} />
                  <Route path="help" element={<HelpCenter />} />
                  <Route path="settings" element={<CustomerSettings />} />
                  <Route path="notifications" element={<NotificationsCenter />} />
                </Route>

                {/* Agent Dashboard Routes */}
                <Route path="/agent" element={<AgentLayout />}>
                  <Route index element={<AgentDashboard />} />
                  <Route path="shipments" element={<AssignedShipments />} />
                  <Route path="shipments/:id/status" element={<StatusUpdate />} />
                  <Route path="profile" element={<AgentProfile />} />
                  <Route path="settings" element={<AgentSettings />} />
                  <Route path="notifications" element={<NotificationsCenter />} />
                </Route>

                {/* Admin Dashboard Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="orders" element={<ManageOrders />} />
                  <Route path="orders/:id/assign" element={<AssignAgent />} />
                  <Route path="agents" element={<ManageAgents />} />
                  <Route path="customers" element={<ManageCustomers />} />
                  <Route path="zones" element={<ManageZones />} />
                  <Route path="areas" element={<ManageAreas />} />
                  <Route path="rates" element={<ManageRateCards />} />
                  <Route path="payments" element={<AdminPayments />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="notifications" element={<NotificationsCenter />} />
                </Route>

                {/* System Error & Boundary Routes */}
                <Route path="/unauthorized" element={<ForbiddenPage />} />
                <Route path="/server-error" element={<ServerErrorPage />} />
                <Route path="/maintenance" element={<MaintenancePage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
            <Toaster position="top-right" />
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
  );
};

export default App;
