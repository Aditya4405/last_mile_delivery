import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService';
import { zoneService } from '../../services/zoneService';
import { formatCurrency } from '../../utils';
import { ORDER_STATUS } from '../../constants';
import Select from '../../components/Select';
import Button from '../../components/Button';
import StatsCard from '../../components/StatsCard';
import toast from 'react-hot-toast';
import { FiPieChart, FiDownload, FiDollarSign, FiPackage, FiTruck, FiClock, FiUsers, FiFilter, FiRefreshCw } from 'react-icons/fi';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { getCollection } from '../../services/db';

const Reports = () => {
  const [reportType, setReportType] = useState('orders');
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  
  // Dashboard Telemetry Stats
  const [dashboardSummary, setDashboardSummary] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    delivered: 0,
    cancelled: 0,
    codPending: 0,
    avgDeliveryTime: 0,
  });

  // Report Specific Data
  const [reportData, setReportData] = useState(null);

  // Filters State
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [status, setStatus] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [paymentType, setPaymentType] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [agentId, setAgentId] = useState('');

  // Dropdown lists
  const [zones, setZones] = useState([]);
  const [agents, setAgents] = useState([]);

  // Load lists on mount
  useEffect(() => {
    const loadDropdownLists = async () => {
      try {
        const zonesList = getCollection('zones') || [];
        const agentsList = getCollection('agents') || [];
        setZones(zonesList.map(z => ({ value: z.id, label: z.name })));
        setAgents(agentsList.map(a => ({ value: a.id, label: a.name })));
      } catch (err) {
        console.error('Failed to load filter choices', err);
      }
    };
    loadDropdownLists();
  }, []);

  const getFilterPayload = () => {
    const payload = {};
    if (fromDate) payload.fromDate = fromDate;
    if (toDate) payload.toDate = toDate;
    if (status) payload.status = status;
    if (zoneId) {
      // If zoneId is numeric, send as number. If starts with string "zone-", clean it or send raw.
      const cleanedZone = zoneId.toString().replace('zone-', '');
      payload.zoneId = isNaN(cleanedZone) ? 1 : parseInt(cleanedZone, 10);
    }
    if (paymentType) payload.paymentType = paymentType;
    if (customerId) payload.customerId = parseInt(customerId, 10) || undefined;
    if (agentId) {
      const cleanedAgent = agentId.toString().replace('agent-', '');
      payload.agentId = isNaN(cleanedAgent) ? 1 : parseInt(cleanedAgent, 10);
    }
    return payload;
  };

  const fetchDashboardSummary = async () => {
    setSummaryLoading(true);
    try {
      const filters = getFilterPayload();
      const response = await reportService.getReportData('dashboard-summary', filters);
      if (response) {
        setDashboardSummary(response);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard summary metrics', err);
    } finally {
      setSummaryLoading(false);
    }
  };

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const filters = getFilterPayload();
      const data = await reportService.getReportData(reportType, filters);
      setReportData(data);
    } catch (err) {
      console.error('Failed to retrieve report data', err);
      toast.error('Failed to retrieve report analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Run on mount or filter apply
  useEffect(() => {
    fetchDashboardSummary();
    fetchReportData();
  }, [reportType]);

  const handleApplyFilters = () => {
    fetchDashboardSummary();
    fetchReportData();
    toast.success('Filters applied to logistics telemetry!');
  };

  const handleResetFilters = () => {
    setFromDate('');
    setToDate('');
    setStatus('');
    setZoneId('');
    setPaymentType('');
    setCustomerId('');
    setAgentId('');
    toast.success('Filters reset.');
  };

  const handleExport = async (format) => {
    try {
      const filters = getFilterPayload();
      await reportService.exportToFormat(format, reportType, filters);
      toast.success(`${format.toUpperCase()} report exported successfully!`);
    } catch (err) {
      console.error(err);
      toast.error(`Failed to export ${format.toUpperCase()} report.`);
    }
  };

  const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444'];

  const statusOptions = Object.entries(ORDER_STATUS).map(([key, val]) => ({
    value: val,
    label: key.replace('_', ' '),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FiPieChart className="text-brand-600" />
            Operations Analytics Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate, filter, and export system-wide logistics telemetry reports.
          </p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" icon={FiDownload} onClick={() => handleExport('pdf')} disabled={loading}>
            Export PDF
          </Button>
          <Button variant="primary" size="sm" icon={FiDownload} onClick={() => handleExport('excel')} disabled={loading}>
            Export Excel
          </Button>
          <Button variant="outline" size="sm" icon={FiDownload} onClick={() => handleExport('csv')} disabled={loading}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* Top Overview Telemetry Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <StatsCard title="Total Revenue" value={summaryLoading ? '...' : formatCurrency(dashboardSummary.totalRevenue)} icon={FiDollarSign} />
        <StatsCard title="Total Orders" value={summaryLoading ? '...' : dashboardSummary.totalOrders} icon={FiPackage} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatsCard title="Delivered" value={summaryLoading ? '...' : dashboardSummary.delivered} icon={FiTruck} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        <StatsCard title="Cancelled" value={summaryLoading ? '...' : dashboardSummary.cancelled} icon={FiPackage} iconBg="bg-red-50" iconColor="text-red-600" />
        <StatsCard title="COD Pending" value={summaryLoading ? '...' : formatCurrency(dashboardSummary.codPending)} icon={FiDollarSign} iconBg="bg-amber-50" iconColor="text-amber-600" />
        <StatsCard title="Avg Transit" value={summaryLoading ? '...' : `${dashboardSummary.avgDeliveryTime} hrs`} icon={FiClock} iconBg="bg-indigo-50" iconColor="text-indigo-600" />
      </div>

      {/* Filter Control Matrix Panel */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <FiFilter className="text-brand-600" /> Report Query Filters
          </h3>
          <Button variant="outline" size="xs" icon={FiRefreshCw} onClick={handleResetFilters}>
            Reset
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Select
            label="Template Type"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            options={[
              { value: 'orders', label: 'Order Volume Distribution' },
              { value: 'revenue', label: 'Financial Revenue Ledger' },
              { value: 'delivery', label: 'Delivery SLA Compliance & Speeds' },
              { value: 'agents', label: 'Agent Courier Load Profiles' },
              { value: 'customers', label: 'Customer Booking Volumes' },
              { value: 'zones', label: 'Zone Operations distribution' },
              { value: 'areas', label: 'Area City distribution' },
            ]}
          />

          <div className="flex flex-col">
            <label className="text-xs font-bold text-slate-550 mb-1.5">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 bg-white text-slate-900"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-bold text-slate-550 mb-1.5">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 bg-white text-slate-900"
            />
          </div>

          <Select
            label="Order Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={statusOptions}
            placeholder="All Statuses"
          />

          <Select
            label="Operational Zone"
            value={zoneId}
            onChange={(e) => setZoneId(e.target.value)}
            options={zones}
            placeholder="All Zones"
          />

          <Select
            label="Payment Type"
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
            options={[
              { value: 'COD', label: 'COD' },
              { value: 'PREPAID', label: 'Prepaid' },
            ]}
            placeholder="All Payment Types"
          />

          <div className="flex flex-col">
            <label className="text-xs font-bold text-slate-550 mb-1.5">Customer ID</label>
            <input
              type="number"
              placeholder="e.g. 1"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 bg-white text-slate-900"
            />
          </div>

          <Select
            label="Courier Rider"
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            options={agents}
            placeholder="All Riders"
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="primary" size="sm" icon={FiFilter} onClick={handleApplyFilters}>
            Apply Filters
          </Button>
        </div>
      </div>

      {/* Dynamic Report Details Overview */}
      {!loading && reportData?.summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {reportType === 'orders' && (
            <>
              <StatsCard title="Delivered Volume" value={reportData.summary.delivered} icon={FiTruck} />
              <StatsCard title="Pending Volume" value={reportData.summary.pending} icon={FiPackage} iconBg="bg-amber-50" iconColor="text-amber-600" />
              <StatsCard title="Failed Volume" value={reportData.summary.failed} icon={FiPackage} iconBg="bg-red-50" iconColor="text-red-600" />
            </>
          )}
          {reportType === 'revenue' && (
            <>
              <StatsCard title="Total Cash Flow" value={formatCurrency(reportData.summary.totalRevenue)} icon={FiDollarSign} />
              <StatsCard title="Prepaid Volume" value={formatCurrency(reportData.summary.prepaidRevenue)} icon={FiDollarSign} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
              <StatsCard title="COD Collected" value={formatCurrency(reportData.summary.codRevenue)} icon={FiDollarSign} iconBg="bg-blue-50" iconColor="text-blue-600" />
            </>
          )}
          {reportType === 'delivery' && (
            <>
              <StatsCard title="Avg Delivery Speed" value={reportData.summary.avgDeliveryTime} icon={FiClock} />
              <StatsCard title="On-Time Rate" value={reportData.summary.onTimeRate} icon={FiTruck} iconBg="bg-success-50" iconColor="text-success-600" />
              <StatsCard title="SLA Compliance" value={reportData.summary.slaCompliance} icon={FiPieChart} iconBg="bg-indigo-50" iconColor="text-indigo-600" />
            </>
          )}
          {reportType === 'agents' && (
            <>
              <StatsCard title="Total Registered Riders" value={reportData.summary.totalAgents} icon={FiUsers} />
              <StatsCard title="Active On-Shift" value={reportData.summary.activeAgents} icon={FiUsers} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
              <StatsCard title="Average Satisfaction" value={`★ ${reportData.summary.avgRating}`} icon={FiTruck} iconBg="bg-amber-50" iconColor="text-amber-600" />
            </>
          )}
        </div>
      )}

      {/* Analytics Chart Container */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-6">
          Visualization: {reportType.toUpperCase()} DATA ANALYSIS
        </h3>
        
        <div className="h-80 flex items-center justify-center">
          {loading ? (
            <div className="w-full h-full bg-slate-100 rounded-lg animate-pulse" />
          ) : reportData?.chartData ? (
            <ResponsiveContainer width="100%" height="100%">
              {reportType === 'orders' ? (
                <PieChart>
                  <Pie
                    data={reportData.chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {reportData.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              ) : reportType === 'revenue' ? (
                <BarChart data={reportData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} name="Value ($)" />
                </BarChart>
              ) : reportType === 'delivery' ? (
                <BarChart data={reportData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} name="Percentage Shares" />
                </BarChart>
              ) : reportType === 'agents' ? (
                <BarChart data={reportData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="workload" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Jobs Active" />
                </BarChart>
              ) : reportType === 'customers' ? (
                <BarChart data={reportData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="bookings" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Bookings Made" />
                </BarChart>
              ) : reportType === 'zones' ? (
                <BarChart data={reportData.zoneDistribution || reportData.chartData || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Shipments Managed" />
                </BarChart>
              ) : (
                <BarChart data={reportData.areaDistribution || reportData.chartData || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#ec4899" radius={[4, 4, 0, 0]} name="Shipments Delivered" />
                </BarChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="text-slate-400 text-xs font-semibold">No telemetry chart metrics available for selection</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
