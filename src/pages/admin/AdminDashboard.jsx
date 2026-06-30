import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { formatCurrency, formatDate } from '../../utils';
import StatsCard from '../../components/StatsCard';
import Table from '../../components/Table';
import StatusChip from '../../components/Badge';
import Button from '../../components/Button';
import { FiTrendingUp, FiDollarSign, FiUsers, FiPackage, FiTruck, FiActivity } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const stats = await dashboardService.getAdminStats();
      setData(stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b'];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-909 dark:text-white">Admin Operations Terminal</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time telemetry analysis of zones, dispatches, and financial ledger items.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/orders">
            <Button variant="outline" size="sm">Manage Orders</Button>
          </Link>
          <Link to="/admin/reports">
            <Button variant="primary" size="sm" icon={FiTrendingUp}>Financial Analytics</Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(data?.cards?.revenue || 0)}
          icon={FiDollarSign}
          loading={loading}
        />
        <StatsCard
          title="Total Orders"
          value={data?.cards?.orders || 0}
          icon={FiPackage}
          iconBg="bg-blue-50 dark:bg-blue-955/10"
          iconColor="text-blue-600"
          loading={loading}
        />
        <StatsCard
          title="Active Customers"
          value={data?.cards?.customers || 0}
          icon={FiUsers}
          iconBg="bg-indigo-50 dark:bg-indigo-955/10"
          iconColor="text-indigo-600"
          loading={loading}
        />
        <StatsCard
          title="Active Agents"
          value={data?.cards?.agents || 0}
          icon={FiTruck}
          iconBg="bg-emerald-50 dark:bg-emerald-955/10"
          iconColor="text-emerald-600"
          loading={loading}
        />
        <StatsCard
          title="Pending Dispatches"
          value={data?.cards?.pendingDeliveries || 0}
          icon={FiActivity}
          iconBg="bg-amber-50 dark:bg-amber-955/10"
          iconColor="text-amber-605"
          loading={loading}
        />
        <StatsCard
          title="Success Rate"
          value={data?.cards?.successRate || '100%'}
          icon={FiTrendingUp}
          iconBg="bg-purple-50 dark:bg-purple-955/10"
          iconColor="text-purple-600"
          loading={loading}
        />
      </div>

      {/* Graphical Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-205 dark:border-slate-750 shadow-card">
          <h3 className="text-xs font-bold text-slate-905 dark:text-white uppercase tracking-wider mb-4">
            Revenue & Shipments Performance
          </h3>
          <div className="h-72">
            {loading ? (
              <div className="w-full h-full bg-slate-100 rounded-lg animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.charts?.monthlyRevenue}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
                      borderColor: '#cbd5e1',
                      borderRadius: '8px',
                    }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2.5} name="Revenue ($)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Zone Distribution Pie Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-205 dark:border-slate-750 shadow-card flex flex-col">
          <h3 className="text-xs font-bold text-slate-905 dark:text-white uppercase tracking-wider mb-4">
            Zone Traffic Shares
          </h3>
          <div className="h-48 flex-1 relative flex items-center justify-center">
            {loading ? (
              <div className="w-28 h-28 rounded-full border-4 border-slate-100 animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.charts?.zoneDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {data?.charts?.zoneDistribution?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* Custom Labels List */}
          {!loading && (
            <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] font-semibold text-slate-500">
              {data?.charts?.zoneDistribution?.map((z, idx) => (
                <div key={idx} className="flex items-center gap-1.5 truncate">
                  <span className="w-2.5 h-2.5 rounded-full block shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="truncate">{z.name} ({z.value})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Latest activities list log */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-205 dark:border-slate-750 shadow-card">
        <h3 className="text-xs font-bold text-slate-905 dark:text-white uppercase tracking-wider mb-4">
          Latest Dispatch Telemetry Signals
        </h3>

        {loading ? (
          <div className="animate-pulse space-y-2.5 h-20 bg-slate-100 rounded-lg" />
        ) : (
          <div className="flow-root">
            <ul className="-mb-8">
              {data?.activities?.map((act, idx) => (
                <li key={act.id}>
                  <div className="relative pb-6">
                    {idx !== data.activities.length - 1 && (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200 dark:bg-slate-750" />
                    )}
                    <div className="relative flex space-x-3 text-xs">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-brand-50 dark:bg-brand-950/20 text-brand-655 flex items-center justify-center">
                          <FiActivity className="h-4.5 w-4.5" />
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="font-bold text-slate-805 dark:text-slate-100">{act.title}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-405 mt-0.5 leading-relaxed">{act.description}</p>
                        </div>
                        <div className="text-right text-[10px] text-slate-400 font-medium">
                          {formatDate(act.time, 'hh:mm A')}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
