import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/dashboardService';
import { orderService } from '../../services/orderService';
import { formatCurrency, formatDate } from '../../utils';
import StatsCard from '../../components/StatsCard';
import Table from '../../components/Table';
import StatusChip from '../../components/Badge';
import Button from '../../components/Button';
import { FiPlusCircle, FiTrendingUp, FiPackage, FiTruck, FiActivity, FiSearch } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [trackQuery, setTrackQuery] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsData = await dashboardService.getCustomerStats(user.id);
        const ordersData = await orderService.getOrders({ customerId: user.id });
        setStats(statsData);
        setRecentOrders(ordersData.slice(0, 5)); // recent 5 orders
      } catch (err) {
        console.error('Failed to load customer metrics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user.id]);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (!trackQuery.trim()) return;
    navigate(`/customer/orders/${trackQuery.trim()}/track`);
  };

  const columns = [
    {
      key: 'id',
      label: 'Order ID',
      render: (val) => <span className="font-bold text-brand-650 dark:text-brand-400">{val}</span>,
    },
    { key: 'dropAddress', label: 'Destination', render: (val) => <span className="truncate max-w-[200px] block">{val}</span> },
    { key: 'price', label: 'Charge', render: (val) => <span>{formatCurrency(val)}</span> },
    { key: 'createdAt', label: 'Date booked', render: (val) => <span>{formatDate(val, 'DD MMM YYYY')}</span> },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusChip status={val} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Link to={`/customer/orders/${row.id}`}>
            <Button size="sm" variant="outline">Details</Button>
          </Link>
          {row.status !== 'delivered' && row.status !== 'failed' && (
            <Link to={`/customer/orders/${row.id}/track`}>
              <Button size="sm" variant="primary" icon={FiTruck}>Track</Button>
            </Link>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Card & Track Shortcut */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-gradient-to-r from-brand-600 to-indigo-650 dark:from-brand-900 dark:to-indigo-950 p-6 rounded-2xl text-white shadow-premium flex flex-col justify-between">
          <div>
            <h1 className="text-xl font-bold">Good day, {user?.name}!</h1>
            <p className="text-xs text-brand-100 mt-1.5 leading-relaxed max-w-md">
              Welcome to the SwiftRoute Logistics portal. Book B2B/B2C deliveries, calculate volumetric weight, and track status telemetry in real-time.
            </p>
          </div>
          <div className="flex items-center gap-3 mt-6">
            <Link to="/customer/book">
              <Button variant="success" icon={FiPlusCircle}>
                Book New Shipment
              </Button>
            </Link>
            <Link to="/customer/orders">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 dark:hover:bg-white/5">
                View All Bookings
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Tracking Widget */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-205 dark:border-slate-750 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FiSearch className="text-brand-500" />
              Quick Tracking Telemetry
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Enter any tracking or manifest ID to access instant telemetry signals.
            </p>
          </div>
          <form onSubmit={handleTrackSubmit} className="mt-4 space-y-3">
            <input
              type="text"
              placeholder="e.g. TRK-9710-112 or ORD-9710"
              value={trackQuery}
              onChange={(e) => setTrackQuery(e.target.value)}
              className="
                block w-full rounded-lg border border-slate-300 dark:border-slate-700 text-xs px-3.5 py-2.5
                bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none
              "
            />
            <Button type="submit" variant="primary" size="sm" className="w-full">
              Locate Package
            </Button>
          </form>
        </div>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatsCard
          title="Total Shipments Booked"
          value={stats?.cards?.totalOrders || 0}
          icon={FiPackage}
          loading={loading}
        />
        <StatsCard
          title="Pending Shipments"
          value={stats?.cards?.pendingDeliveries || 0}
          icon={FiActivity}
          iconBg="bg-amber-50 dark:bg-amber-950/20"
          iconColor="text-amber-600 dark:text-amber-400"
          loading={loading}
        />
        <StatsCard
          title="Delivered Handouts"
          value={stats?.cards?.deliveredOrders || 0}
          icon={FiTruck}
          iconBg="bg-success-50 dark:bg-success-950/20"
          iconColor="text-success-600 dark:text-success-400"
          loading={loading}
        />
        <StatsCard
          title="Total Spent (USD)"
          value={formatCurrency(stats?.cards?.totalSpent || 0)}
          icon={FiTrendingUp}
          iconBg="bg-primary-50 dark:bg-primary-950/20"
          iconColor="text-primary-600"
          loading={loading}
        />
      </div>

      {/* Analytics Charts & Delivery Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-205 dark:border-slate-750 shadow-card">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">
            Weekly Delivery Success Metrics
          </h3>
          <div className="h-64">
            {loading ? (
              <div className="w-full h-full bg-slate-100 dark:bg-slate-700 animate-pulse rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.charts?.deliveryTrend}>
                  <defs>
                    <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
                      borderColor: '#cbd5e1',
                      borderRadius: '8px',
                    }}
                  />
                  <Area type="monotone" dataKey="delivered" stroke="#10b981" fillOpacity={1} fill="url(#colorDelivered)" strokeWidth={2} name="Delivered" />
                  <Area type="monotone" dataKey="pending" stroke="#f59e0b" fillOpacity={1} fill="url(#colorPending)" strokeWidth={2} name="Pending/Transit" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Quick Help FAQs summary */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-205 dark:border-slate-750 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
              Help Center FAQs
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-750 rounded-lg">
                <p className="text-xs font-bold text-slate-750 dark:text-slate-200">How is Volumetric Weight measured?</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">It calculates package dimensions: (Length × Breadth × Height) / 5000 in cm.</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-750 rounded-lg">
                <p className="text-xs font-bold text-slate-750 dark:text-slate-200">Can I edit address post booking?</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Addresses can be modified until an agent picks up the shipment.</p>
              </div>
            </div>
          </div>
          <Link to="/customer/help" className="mt-4">
            <Button variant="outline" className="w-full text-xs">
              Go to Help Center & Raise Tickets
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Orders List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Recent Delivery Manifests
          </h3>
          <Link to="/customer/orders" className="text-xs font-semibold text-brand-650 hover:underline dark:text-brand-405">
            View All Bookings
          </Link>
        </div>
        
        <Table
          columns={columns}
          data={recentOrders}
          loading={loading}
          emptyMessage="You haven't booked any shipments yet."
          pagination={null}
        />
      </div>
    </div>
  );
};

export default CustomerDashboard;
