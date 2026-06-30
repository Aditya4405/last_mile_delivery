import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService';
import { formatCurrency } from '../../utils';
import Select from '../../components/Select';
import Button from '../../components/Button';
import StatsCard from '../../components/StatsCard';
import toast from 'react-hot-toast';
import { FiPieChart, FiDownload, FiDollarSign, FiPackage, FiTruck, FiClock } from 'react-icons/fi';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const Reports = () => {
  const [reportType, setReportType] = useState('orders');
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const data = await reportService.getReportData(reportType);
      setReportData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [reportType]);

  const handleExport = async () => {
    try {
      if (reportType === 'orders') {
        await reportService.exportOrdersReport();
      } else if (reportType === 'revenue') {
        await reportService.exportRevenueReport();
      } else {
        // Fallback demo export
        reportService.exportToCSV('generic_report', ['Metrics', 'Value'], [
          ['SLA Compliance', '98%'],
          ['Transit Factor', '0.4']
        ]);
      }
      toast.success('Logistics report exported successfully!');
    } catch (err) {
      toast.error('Failed to compile export sheet.');
    }
  };

  const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FiPieChart className="text-brand-600" />
            Operations Analytics Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate and export system-wide logistics telemetry summaries.
          </p>
        </div>
        
        <Button variant="primary" icon={FiDownload} onClick={handleExport} disabled={loading}>
          Export Report Sheet
        </Button>
      </div>

      {/* Select Report Panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle flex flex-col sm:flex-row sm:items-center gap-4">
        <span className="text-xs font-bold text-slate-550 shrink-0">Select Analysis Template:</span>
        <Select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          options={[
            { value: 'orders', label: 'Order Volume Distribution' },
            { value: 'revenue', label: 'Financial Revenue Ledger' },
            { value: 'delivery', label: 'Delivery SLA Compliance & Speeds' },
            { value: 'agents', label: 'Agent Courier Load Profiles' },
          ]}
          className="max-w-xs"
        />
      </div>

      {/* Dynamic Summary Cards */}
      {!loading && reportData?.summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {reportType === 'orders' && (
            <>
              <StatsCard title="Delivered Shipments" value={reportData.summary.delivered} icon={FiTruck} />
              <StatsCard title="Pending Dispatches" value={reportData.summary.pending} icon={FiPackage} iconBg="bg-amber-50" iconColor="text-amber-600" />
              <StatsCard title="Failed Attempts" value={reportData.summary.failed} icon={FiPackage} iconBg="bg-red-50" iconColor="text-red-600" />
            </>
          )}
          {reportType === 'revenue' && (
            <>
              <StatsCard title="Total Cash flow" value={formatCurrency(reportData.summary.totalRevenue)} icon={FiDollarSign} />
              <StatsCard title="Prepaid Revenue" value={formatCurrency(reportData.summary.prepaidRevenue)} icon={FiDollarSign} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
              <StatsCard title="COD Collected" value={formatCurrency(reportData.summary.codRevenue)} icon={FiDollarSign} iconBg="bg-blue-50" iconColor="text-blue-600" />
            </>
          )}
          {reportType === 'delivery' && (
            <>
              <StatsCard title="Avg Transit Time" value={reportData.summary.avgDeliveryTime} icon={FiClock} />
              <StatsCard title="On-Time Rate" value={reportData.summary.onTimeRate} icon={FiTruck} iconBg="bg-success-50" iconColor="text-success-600" />
              <StatsCard title="SLA Compliance" value={reportData.summary.slaCompliance} icon={FiPieChart} iconBg="bg-indigo-50" iconColor="text-indigo-600" />
            </>
          )}
          {reportType === 'agents' && (
            <>
              <StatsCard title="Total Registered Riders" value={reportData.summary.totalAgents} icon={FiUsers} />
              <StatsCard title="Riders Active" value={reportData.summary.activeAgents} icon={FiUsers} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
              <StatsCard title="Average Rider Rating" value={`★ ${reportData.summary.avgRating}`} icon={FiTruck} iconBg="bg-amber-50" iconColor="text-amber-600" />
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
          ) : (
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
              ) : (
                <BarChart data={reportData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="workload" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Jobs Active" />
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
