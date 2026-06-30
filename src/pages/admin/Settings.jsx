import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import toast from 'react-hot-toast';
import { FiSettings, FiUser, FiBell, FiShield } from 'react-icons/fi';

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);

  const [notifs, setNotifs] = useState({
    systemLogs: true,
    revenueAlerts: false,
    dispatchPings: true,
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    // Simulate database delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSaving(false);
    toast.success('Admin preferences updated.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FiSettings className="text-brand-650" />
          System Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Adjust central dispatch parameters, security settings, and terminal preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-6">
          {/* Quick preferences */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <FiBell className="text-brand-500" />
              Notifications
            </h3>
            
            <div className="space-y-4 text-xs">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifs.systemLogs}
                  onChange={(e) => setNotifs({ ...notifs, systemLogs: e.target.checked })}
                  className="rounded text-brand-600 mr-1 mt-0.5"
                />
                <div>
                  <p className="font-semibold text-slate-700">System Activity Logs</p>
                  <p className="text-[10px] text-slate-455 mt-0.5">Alert on every customer order registration.</p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifs.dispatchPings}
                  onChange={(e) => setNotifs({ ...notifs, dispatchPings: e.target.checked })}
                  className="rounded text-brand-600 mr-1 mt-0.5"
                />
                <div>
                  <p className="font-semibold text-slate-700">Rider Dispatch Alerts</p>
                  <p className="text-[10px] text-slate-455 mt-0.5">Alert if a package breaches SLA pickup window times.</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* General */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-3">
              System Admin Profile
            </h3>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Admin Name" defaultValue={user?.name} required />
                <Input label="Support Email" defaultValue={user?.email} required readOnly />
              </div>
              <Button type="submit" variant="primary" loading={saving}>
                Save System Settings
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
