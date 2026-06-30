import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import toast from 'react-hot-toast';
import { FiUser, FiLock, FiSettings, FiBell, FiCamera } from 'react-icons/fi';

const Settings = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  
  const [uploading, setUploading] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Profile Form
  const {
    register: regProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: errorsProfile },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.address || '',
      zip: user?.zip || '',
    },
  });

  // Password Form
  const {
    register: regPass,
    handleSubmit: handlePassSubmit,
    reset: resetPass,
    formState: { errors: errorsPass },
  } = useForm({
    defaultValues: {
      oldPassword: '',
      newPassword: '',
    },
  });

  const onUpdateProfile = async (data) => {
    setUpdatingProfile(true);
    try {
      await updateProfile(data);
    } catch (err) {
      toast.error('Failed to update details.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const onChangePassword = async (data) => {
    setUpdatingPassword(true);
    try {
      await changePassword(data.oldPassword, data.newPassword);
      resetPass();
    } catch (err) {
      toast.error(err.message || 'Passcode change failed.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await updateProfile({ avatar: reader.result });
        toast.success('Avatar updated successfully!');
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
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <FiSettings className="text-brand-650" />
          Profile Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-405 mt-1">
          Configure security credentials, notifications, and profile details.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left avatar upload */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-205 dark:border-slate-750 shadow-card flex flex-col items-center text-center">
            <div className="relative">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt="Profile Avatar"
                className="h-28 w-28 rounded-full border-4 border-slate-100 object-cover shadow-subtle"
              />
              <label className="absolute bottom-0 right-0 p-2 bg-brand-600 hover:bg-brand-700 text-white rounded-full cursor-pointer shadow-md transition-colors">
                <FiCamera className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
            
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-4">
              {user?.name}
            </h3>
            <p className="text-xxs text-slate-500 dark:text-slate-400 capitalize bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded mt-1.5 font-bold">
              {user?.role} Account
            </p>
          </div>

          {/* Preferences Card */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-205 dark:border-slate-750 shadow-card space-y-4">
            <h3 className="text-xs font-bold text-slate-850 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <FiBell className="text-brand-500" />
              General Preferences
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-750 dark:text-slate-250">Toggle Dark Mode</p>
                  <p className="text-[10px] text-slate-500">Enable modern logistics dark theme</p>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`
                    w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-350
                    ${isDark ? 'bg-brand-655' : 'bg-slate-300'}
                  `}
                >
                  <div
                    className={`
                      bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-350
                      ${isDark ? 'translate-x-5' : 'translate-x-0'}
                    `}
                  />
                </button>
              </div>

              <hr className="border-slate-100 dark:border-slate-750" />

              <label className="flex items-start gap-2.5 cursor-pointer text-slate-600 dark:text-slate-350">
                <input type="checkbox" defaultChecked className="rounded text-brand-600 mr-1 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-750 dark:text-slate-250">Email Telemetry Signals</p>
                  <p className="text-[10px] text-slate-450 mt-0.5">Receive updates on dispatch and pickup SLA events.</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Profile edit & passwords fields */}
        <div className="md:col-span-2 space-y-6">
          {/* Details edit */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-205 dark:border-slate-750 shadow-card space-y-5">
            <h3 className="text-xs font-bold text-slate-850 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b pb-3">
              <FiUser className="text-brand-500" />
              Edit Personal Info
            </h3>

            <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Name / Company"
                  name="name"
                  error={errorsProfile.name}
                  required
                  {...regProfile('name', { required: 'Name is required' })}
                />
                <Input
                  label="Phone Number"
                  name="phone"
                  error={errorsProfile.phone}
                  required
                  {...regProfile('phone', { required: 'Phone is required' })}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Pickup/Drop Base Address"
                  name="address"
                  className="col-span-2"
                  error={errorsProfile.address}
                  {...regProfile('address')}
                />
                <Input
                  label="Zip Code"
                  name="zip"
                  error={errorsProfile.zip}
                  {...regProfile('zip')}
                />
              </div>

              <Button type="submit" variant="primary" loading={updatingProfile}>
                Save Changes
              </Button>
            </form>
          </div>

          {/* Passwords change */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-205 dark:border-slate-750 shadow-card space-y-5">
            <h3 className="text-xs font-bold text-slate-850 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b pb-3">
              <FiLock className="text-brand-500" />
              Change Passcode Credentials
            </h3>

            <form onSubmit={handlePassSubmit(onChangePassword)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Current Password"
                  name="oldPassword"
                  type="password"
                  placeholder="••••••••"
                  error={errorsPass.oldPassword}
                  required
                  {...regPass('oldPassword', { required: 'Current password is required' })}
                />
                <Input
                  label="New Password"
                  name="newPassword"
                  type="password"
                  placeholder="••••••••"
                  error={errorsPass.newPassword}
                  required
                  {...regPass('newPassword', {
                    required: 'New password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' },
                  })}
                />
              </div>

              <Button type="submit" variant="outline" loading={updatingPassword}>
                Update Password
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
