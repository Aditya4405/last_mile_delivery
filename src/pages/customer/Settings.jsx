import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Button from '../../components/Button';
import toast from 'react-hot-toast';
import { FiUser, FiLock, FiSettings, FiBell, FiCamera } from 'react-icons/fi';

const Settings = () => {
  const { user, updateProfile, changePassword } = useAuth();
  
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
      gstNumber: user?.gstNumber || '',
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
      toast.error('Failed to update profile details.');
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
      toast.error(err.message || 'Passcode update failed.');
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
        toast.error('Failed to upload avatar.');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 md:px-0">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FiSettings className="text-blue-600 shrink-0" />
          Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure safety parameters, notifications, language choices, and profile details.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left avatar upload & preferences */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-card flex flex-col items-center text-center">
            <div className="relative">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt="Profile Avatar"
                className="h-28 w-28 rounded-full border-4 border-slate-100 object-cover shadow-subtle"
              />
              <label className="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full cursor-pointer shadow-md transition-colors">
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
            
            <h3 className="text-sm font-bold text-slate-900 mt-4">
              {user?.name}
            </h3>
            <p className="text-xxs text-slate-500 capitalize bg-slate-100 px-2 py-0.5 rounded mt-1.5 font-bold">
              {user?.role} Account
            </p>
          </div>

          {/* Preferences Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-card space-y-5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <FiBell className="text-blue-600 shrink-0" />
              General Preferences
            </h3>

            <div className="space-y-4 text-xs">
              <label className="flex items-start gap-2.5 cursor-pointer text-slate-600">
                <input type="checkbox" defaultChecked className="rounded text-blue-600 mr-1 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">Email Tracking Alerts</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Receive email notifications on shipment pickup and dispatch events.</p>
                </div>
              </label>

              <hr className="border-slate-100" />

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-800">Language Preference</label>
                <select className="w-full text-xs rounded-lg border border-slate-300 bg-white text-slate-900 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option value="en">English (default)</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="mr">मराठी (Marathi)</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                  <option value="te">తెలుగు (Telugu)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Profile edit & passwords fields */}
        <div className="md:col-span-2 space-y-6">
          {/* Details edit */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-card space-y-5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-3">
              <FiUser className="text-blue-600 shrink-0" />
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
                  placeholder="+91 XXXXX XXXXX"
                  error={errorsProfile.phone}
                  required
                  {...regProfile('phone', { required: 'Phone is required' })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Preferred Pickup/Drop Address"
                  name="address"
                  className="sm:col-span-2"
                  error={errorsProfile.address}
                  {...regProfile('address')}
                />
                <Input
                  label="Pincode"
                  name="zip"
                  placeholder="e.g. 110001"
                  error={errorsProfile.zip}
                  {...regProfile('zip')}
                />
              </div>

              <div className="grid grid-cols-1">
                <Input
                  label="GST Number (Optional)"
                  name="gstNumber"
                  placeholder="e.g. 07AAAAA1111A1Z1"
                  error={errorsProfile.gstNumber}
                  {...regProfile('gstNumber')}
                />
              </div>

              <Button type="submit" variant="primary" loading={updatingProfile}>
                Save Changes
              </Button>
            </form>
          </div>

          {/* Passwords change */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-card space-y-5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-3">
              <FiLock className="text-blue-600 shrink-0" />
              Change Password Credentials
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
