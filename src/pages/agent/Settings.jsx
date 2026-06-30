import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Button from '../../components/Button';
import toast from 'react-hot-toast';
import { FiSettings, FiTruck, FiBell, FiLock } from 'react-icons/fi';

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  
  const [saving, setSaving] = useState(false);
  const [notifs, setNotifs] = useState({
    smsPings: true,
    pushNotifs: true,
  });

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.target);
    const data = {
      phone: formData.get('phone'),
      vehicle: formData.get('vehicle'),
      license: formData.get('license'),
    };

    try {
      await updateProfile(data);
      toast.success('Rider shift profile updated!');
    } catch (err) {
      toast.error('Failed to save profile settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-909 dark:text-white flex items-center gap-2">
          <FiSettings className="text-brand-650" />
          Shift settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure vehicle details, license logs, and notification pings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-6">
          {/* Preferences */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-205 dark:border-slate-750 shadow-card space-y-4">
            <h3 className="text-xs font-bold text-slate-855 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <FiBell className="text-brand-500" />
              Rider Preferences
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-750 dark:text-slate-250">Terminal Dark Mode</p>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`
                    w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300
                    ${isDark ? 'bg-brand-600' : 'bg-slate-300'}
                  `}
                >
                  <div
                    className={`
                      bg-white w-4.5 h-4.5 rounded-full shadow transform transition-transform duration-300
                      ${isDark ? 'translate-x-5' : 'translate-x-0'}
                    `}
                  />
                </button>
              </div>

              <hr className="border-slate-100 dark:border-slate-750" />

              <label className="flex items-start gap-2.5 cursor-pointer text-slate-650 dark:text-slate-350">
                <input
                  type="checkbox"
                  checked={notifs.smsPings}
                  onChange={(e) => setNotifs({ ...notifs, smsPings: e.target.checked })}
                  className="rounded text-brand-605 mt-0.5"
                />
                <div>
                  <p className="font-bold">SMS Dispatch Pings</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Alert via SMS on nearest zone jobs assignment.</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Vehicle edit details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-205 dark:border-slate-750 shadow-card space-y-4">
            <h3 className="text-xs font-bold text-slate-850 dark:text-slate-200 uppercase tracking-wider border-b pb-3 flex items-center gap-1.5">
              <FiTruck className="text-brand-500" />
              Edit Courier Parameters
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Contact Phone" name="phone" defaultValue={user?.phone} required />
                <Select
                  label="Active Dispatch Vehicle"
                  name="vehicle"
                  options={['Electric Bike', 'Motorcycle', 'Mini Van', 'Cargo Truck']}
                  defaultValue={user?.vehicle}
                  required
                />
              </div>

              <Input label="Driving License Plate" name="license" defaultValue={user?.license} required />

              <Button type="submit" variant="primary" loading={saving}>
                Save Courier settings
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
