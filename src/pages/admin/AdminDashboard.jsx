import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { formatCurrency, formatDate } from '../../utils';
import StatsCard from '../../components/StatsCard';
import Table from '../../components/Table';
import StatusChip from '../../components/Badge';
import Button from '../../components/Button';
import L from 'leaflet';
import { FiTrendingUp, FiCheckCircle, FiUsers, FiPackage, FiTruck, FiActivity } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

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

  // Map initialization
  useEffect(() => {
    if (!loading && mapContainerRef.current && !mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([28.57, 77.22], 11); // Center around New Delhi / NCR

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(mapRef.current);

      // Add zoom control
      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);

      // Add driver markers
      const drivers = [
        { name: 'John Delivery Agent', coords: [28.63, 77.22], status: 'Active', vehicle: 'Electric Bike (DL-3C-SN-8714)', workload: 2 },
        { name: 'Sarah Smith', coords: [28.625, 77.37], status: 'Active', vehicle: 'Mini Cargo Van (DL-5S-TY-1002)', workload: 1 },
        { name: 'Mike Tyson', coords: [28.54, 77.28], status: 'Inactive', vehicle: 'Motorcycle (DL-9C-WA-4521)', workload: 0 },
      ];

      drivers.forEach(driver => {
        const icon = L.divIcon({
          html: `
            <div class="relative flex items-center justify-center w-8 h-8">
              <div class="absolute w-8 h-8 ${driver.status === 'Active' ? 'bg-blue-500' : 'bg-slate-400'} rounded-full opacity-20 animate-ping"></div>
              <div class="relative w-6 h-6 ${driver.status === 'Active' ? 'bg-blue-600' : 'bg-slate-500'} border-2 border-white rounded-full shadow-lg flex items-center justify-center text-white">
                <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" class="w-3 h-3" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
              </div>
            </div>
          `,
          className: 'custom-div-icon',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        L.marker(driver.coords, { icon })
          .addTo(mapRef.current)
          .bindPopup(`
            <div class="text-xxs space-y-1 p-1">
              <p class="font-bold text-slate-900">${driver.name}</p>
              <p class="text-[9px] text-slate-500 font-medium">Vehicle: ${driver.vehicle}</p>
              <p class="text-[9px] text-slate-500 font-medium">Status: <span class="font-bold text-blue-600">${driver.status}</span></p>
              <p class="text-[9px] text-slate-500 font-medium">Workload: ${driver.workload} active order(s)</p>
            </div>
          `);
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [loading]);

  const COLORS = ['#2563eb', '#3c5c91', '#10b981', '#f59e0b'];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Admin Control Center</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time tracking of active shipments, delivery dispatches, and COD collections.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/orders">
            <Button variant="outline" size="sm">Manage Orders</Button>
          </Link>
          <Link to="/admin/reports">
            <Button variant="primary" size="sm" icon={FiTrendingUp}>Logistics Reports</Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <StatsCard
          title="Total Delivery Charges"
          value={formatCurrency(data?.cards?.revenue || 0)}
          icon={FiTrendingUp}
          loading={loading}
        />
        <StatsCard
          title="Total Shipments"
          value={data?.cards?.orders || 0}
          icon={FiPackage}
          iconBg="bg-blue-50 "
          iconColor="text-blue-600"
          loading={loading}
        />
        <StatsCard
          title="Active Clients"
          value={data?.cards?.customers || 0}
          icon={FiUsers}
          iconBg="bg-indigo-50 "
          iconColor="text-indigo-600"
          loading={loading}
        />
        <StatsCard
          title="Active Executives"
          value={data?.cards?.agents || 0}
          icon={FiTruck}
          iconBg="bg-emerald-50 "
          iconColor="text-emerald-600"
          loading={loading}
        />
        <StatsCard
          title="Pending Pickups"
          value={data?.cards?.pendingDeliveries || 0}
          icon={FiActivity}
          iconBg="bg-amber-50 "
          iconColor="text-amber-600"
          loading={loading}
        />
        <StatsCard
          title="Success Rate"
          value={data?.cards?.successRate || '100%'}
          icon={FiCheckCircle}
          iconBg="bg-purple-50 "
          iconColor="text-purple-600"
          loading={loading}
        />
      </div>

      {/* Live operations map */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              LogiTrack Fleet Operations Map
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Live GPS coordinates of delivery agents and consignment tracking in NCR.
            </p>
          </div>
          <span className="text-[9px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-200/50">
            FLEET LIVE
          </span>
        </div>

        <div className="h-80 w-full rounded-xl overflow-hidden border border-slate-200">
          {loading ? (
            <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center text-xs text-slate-400">
              Loading Map Canvas...
            </div>
          ) : (
            <div ref={mapContainerRef} className="w-full h-full z-10" />
          )}
        </div>
      </div>

      {/* Graphical Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-card">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
            Delivery Charges & Shipments Performance
          </h3>
          <div className="h-72">
            {loading ? (
              <div className="w-full h-full bg-slate-100 rounded-lg animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.charts?.monthlyRevenue}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), 'Charges']}
                    contentStyle={{
                      background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
                      borderColor: '#cbd5e1',
                      borderRadius: '8px',
                    }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#2563eb" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2.5} name="Charges" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Zone Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex flex-col">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
            Zone Shipment shares
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
      <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-card">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
          Latest Delivery Status Log
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
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" />
                    )}
                    <div className="relative flex space-x-3 text-xs">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <FiActivity className="h-4 w-4" />
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="font-bold text-slate-800">{act.title}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{act.description}</p>
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
