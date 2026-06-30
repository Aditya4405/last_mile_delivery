import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/profileService';
import { dashboardService } from '../../services/dashboardService';
import { formatDate } from '../../utils';
import StatsCard from '../../components/StatsCard';
import Button from '../../components/Button';
import toast from 'react-hot-toast';
import { FiUser, FiActivity, FiCamera, FiTruck, FiStar, FiTrendingUp } from 'react-icons/fi';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const actLogs = await profileService.getActivityLog(user.id);
        const statsData = await dashboardService.getAgentStats(user.id);
        setLogs(actLogs);
        setStats(statsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.id]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await updateProfile({ avatar: reader.result });
        toast.success('Profile avatar updated!');
      } catch (err) {
        toast.error('Failed to upload image avatar.');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FiUser className="text-brand-600" />
          Rider Performance Profile
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review dispatch records, delivery success charts, and vehicle logs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex flex-col items-center text-center">
          <div className="relative">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
              alt="Avatar"
              className="h-28 w-28 rounded-full border-4 border-slate-100 object-cover shadow-subtle"
            />
            <label className="absolute bottom-0 right-0 p-2 bg-brand-600 hover:bg-brand-700 text-white rounded-full cursor-pointer shadow-md transition-colors">
              <FiCamera className="h-4 w-4" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploading} />
            </label>
          </div>

          <h3 className="text-base font-bold text-slate-900 mt-4">{user?.name}</h3>
          <p className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded mt-2 uppercase tracking-wide">
            {user?.role} account
          </p>

          <div className="w-full text-left text-xs space-y-3 mt-6 pt-6 border-t border-slate-100 text-slate-600">
            <div className="flex items-center gap-2">
              <FiTruck className="text-slate-400" />
              <span>Vehicle: {user?.vehicle || 'Electric Scooter'}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiStar className="text-amber-500" />
              <span>License: {user?.license || 'DL-98214-A'}</span>
            </div>
          </div>
        </div>

        {/* Chart performance */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
              Weekly SLA Performance (Deliveries Handled)
            </h3>
            
            <div className="h-56">
              {loading ? (
                <div className="w-full h-full bg-slate-100 rounded-lg animate-pulse" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.charts?.performanceData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip />
                    <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Delivered" />
                    <Bar dataKey="failed" fill="#ef4444" radius={[4, 4, 0, 0]} name="Failed" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Activity audit logs */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b pb-3">
              <FiActivity className="text-brand-500" />
              Rider Duty Logs
            </h3>

            <div className="divide-y divide-slate-100 text-xs">
              {logs.map((log) => (
                <div key={log.id} className="py-3 flex justify-between gap-4">
                  <div>
                    <p className="font-bold text-slate-800">{log.event}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{log.details}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {formatDate(log.timestamp, 'DD MMM, hh:mm A')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
