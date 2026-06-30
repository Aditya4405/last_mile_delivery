import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/dashboardService';
import { agentService } from '../../services/agentService';
import { orderService } from '../../services/orderService';
import { formatDate } from '../../utils';
import StatsCard from '../../components/StatsCard';
import Table from '../../components/Table';
import StatusChip from '../../components/Badge';
import Button from '../../components/Button';
import MapPlaceholder from '../../components/MapPlaceholder';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiPackage, FiTruck, FiAlertCircle, FiStar, FiActivity } from 'react-icons/fi';

const AgentDashboard = () => {
  const { user, updateProfile } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activeShipments, setActiveShipments] = useState([]);
  const [availability, setAvailability] = useState(user?.status === 'active');

  const fetchAgentDashboard = async () => {
    try {
      const statsData = await dashboardService.getAgentStats(user.id);
      const ordersData = await orderService.getOrders({ agentId: user.id });
      setStats(statsData);
      // Filter only unresolved shipments
      setActiveShipments(ordersData.filter(o => o.status !== 'delivered' && o.status !== 'failed'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentDashboard();
  }, [user.id]);

  const handleToggleAvailability = async () => {
    try {
      const newStatus = await agentService.toggleAvailability(user.id);
      setAvailability(newStatus === 'active');
      // Sync auth state
      await updateProfile({ status: newStatus });
      toast.success(`Duty status changed to: ${newStatus.toUpperCase()}`);
    } catch (err) {
      toast.error('Failed to update availability.');
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'Order ID',
      render: (val) => <span className="font-bold text-brand-605">{val}</span>,
    },
    { key: 'pickupAddress', label: 'Pickup Point', render: (val) => <span className="truncate max-w-[150px] block">{val}</span> },
    { key: 'dropAddress', label: 'Drop Point', render: (val) => <span className="truncate max-w-[150px] block">{val}</span> },
    { key: 'paymentType', label: 'Billing Mode' },
    { key: 'status', label: 'SLA Status', render: (val) => <StatusChip status={val} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Link to={`/agent/shipments/${row.id}/status`}>
          <Button size="sm" variant="primary">Update Status</Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Shift Toggle Banner */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-205 dark:border-slate-750 shadow-card flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-909 dark:text-white">Courier Shift Panel</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Toggle availability status to receive route dispatches.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold ${availability ? 'text-success-605' : 'text-slate-400'}`}>
            {availability ? 'ONLINE & ACTIVE' : 'OFFLINE (SHIFTS CLOSED)'}
          </span>
          <button
            onClick={handleToggleAvailability}
            className={`
              w-12 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300
              ${availability ? 'bg-success-500' : 'bg-slate-300 dark:bg-slate-700'}
            `}
          >
            <div
              className={`
                bg-white w-5 h-5 rounded-full shadow transform transition-transform duration-300
                ${availability ? 'translate-x-5' : 'translate-x-0'}
              `}
            />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Today's Dispatches"
          value={stats?.cards?.todayDeliveries || 0}
          icon={FiTruck}
          loading={loading}
        />
        <StatsCard
          title="Pickups Pending"
          value={stats?.cards?.pendingPickups || 0}
          icon={FiPackage}
          iconBg="bg-amber-50 dark:bg-amber-950/20"
          iconColor="text-amber-600"
          loading={loading}
        />
        <StatsCard
          title="Delivered Handouts"
          value={stats?.cards?.completedDeliveries || 0}
          icon={FiCheckCircle}
          iconBg="bg-success-50 dark:bg-success-950/20"
          iconColor="text-success-600"
          loading={loading}
        />
        <StatsCard
          title="Failed Attempts"
          value={stats?.cards?.failedDeliveries || 0}
          icon={FiAlertCircle}
          iconBg="bg-red-50 dark:bg-red-955/10"
          iconColor="text-red-600"
          loading={loading}
        />
        <StatsCard
          title="Performance Rating"
          value={`${stats?.cards?.rating || 5.0} / 5.0`}
          icon={FiStar}
          iconBg="bg-primary-50 dark:bg-primary-955/10"
          iconColor="text-primary-600"
          className="col-span-2 lg:col-span-1"
          loading={loading}
        />
      </div>

      {/* Map telemetry & assigned jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active route preview mapping */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold text-slate-850 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <FiActivity className="text-brand-500" />
            Active Route Mapping
          </h3>
          {activeShipments.length > 0 ? (
            <MapPlaceholder
              pickupAddress={activeShipments[0].pickupAddress}
              dropAddress={activeShipments[0].dropAddress}
              status={activeShipments[0].status}
              agentName={user.name}
            />
          ) : (
            <div className="bg-white dark:bg-slate-800 border p-12 text-center rounded-xl text-xs text-slate-500">
              No active transits. Open availability switch to accept courier tickets.
            </div>
          )}
        </div>

        {/* Dispatch lists info */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-855 dark:text-slate-205 uppercase tracking-wider">
            Shift Workload Guidelines
          </h3>
          <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-750 text-xxs text-slate-500 dark:text-slate-400 space-y-3">
            <p>
              <strong className="text-slate-700 dark:text-slate-200">1. Verification OTPs:</strong> All delivery handouts must conclude with matching customer safety passcodes (System default: <strong className="text-slate-800 dark:text-white">1234</strong>).
            </p>
            <p>
              <strong className="text-slate-700 dark:text-slate-200">2. Issue Uploads:</strong> In case of failed attempts, specify exact reasoning descriptions (e.g. customer unavailable, building closed) and note details inside telemetry flags.
            </p>
          </div>
        </div>
      </div>

      {/* Active Jobs Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Assigned Shipping Manifests
        </h3>
        <Table
          columns={columns}
          data={activeShipments}
          loading={loading}
          emptyMessage="No shipments currently assigned to you."
          pagination={null}
        />
      </div>
    </div>
  );
};

export default AgentDashboard;
