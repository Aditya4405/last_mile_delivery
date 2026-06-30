import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/profileService';
import { formatDate } from '../../utils';
import StatsCard from '../../components/StatsCard';
import Button from '../../components/Button';
import toast from 'react-hot-toast';
import { FiUser, FiActivity, FiCamera, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const actLogs = await profileService.getActivityLog(user.id);
        setLogs(actLogs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
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
          My Profile
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review details, change security avatar picture, and audit session log credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side avatar card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex flex-col items-center text-center">
          <div className="relative">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt="Avatar avatar"
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
              <FiMail className="text-slate-400" />
              <span className="truncate">{user?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiPhone className="text-slate-400" />
              <span>{user?.phone || 'No phone logged'}</span>
            </div>
            {user?.address && (
              <div className="flex items-start gap-2">
                <FiMapPin className="text-slate-400 mt-0.5" />
                <span className="leading-relaxed">{user.address} (Pincode: {user.zip})</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side Activity Logs audit */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b pb-3">
            <FiActivity className="text-brand-500" />
            Security & Session Logs
          </h3>

          {loading ? (
            <div className="animate-pulse space-y-2 h-20 bg-slate-50 rounded" />
          ) : (
            <div className="divide-y divide-slate-100">
              {logs.map((log) => (
                <div key={log.id} className="py-3 flex justify-between gap-4 text-xs">
                  <div>
                    <p className="font-bold text-slate-800">{log.event}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{log.details}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {formatDate(log.timestamp, 'DD MMM, hh:mm A')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
