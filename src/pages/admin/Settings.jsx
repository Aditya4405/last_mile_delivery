import React, { useState, useEffect } from 'react';
import { settingsService } from '../../services/settingsService';
import Input from '../../components/Input';
import Button from '../../components/Button';
import toast from 'react-hot-toast';
import {
  FiSettings, FiSliders, FiPackage, FiCreditCard, FiMail,
  FiBell, FiActivity, FiShield, FiCpu, FiSearch,
  FiRotateCcw, FiSave, FiAlertTriangle
} from 'react-icons/fi';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // All configuration variables lists
  const [settingsList, setSettingsList] = useState([]);
  const [values, setValues] = useState({});
  const [originalValues, setOriginalValues] = useState({});
  
  // Search query filter
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected configuration tab
  const [activeTab, setActiveTab] = useState('GENERAL');

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await settingsService.getAllSettings();
      setSettingsList(data);
      
      const valObj = {};
      data.forEach((s) => {
        valObj[s.settingKey] = s.settingValue || '';
      });
      setValues(valObj);
      setOriginalValues(valObj);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load global system configurations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleFieldChange = (key, val) => {
    setValues((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    
    // Find modified settings
    const modifiedKeys = Object.keys(values).filter(
      (k) => values[k] !== originalValues[k]
    );

    if (modifiedKeys.length === 0) {
      toast.success('No configuration changes detected.');
      return;
    }

    setSaving(true);
    const savePromise = toast.loading('Saving global configurations...');
    try {
      // Send updates sequentially or in parallel
      await Promise.all(
        modifiedKeys.map((key) =>
          settingsService.updateSetting(key, values[key])
        )
      );
      
      setOriginalValues({ ...values });
      toast.success('System configurations saved successfully!', { id: savePromise });
    } catch (err) {
      console.error(err);
      toast.error('Failed to save some system configurations.', { id: savePromise });
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm('WARNING: Resetting will overwrite all active configurations with base defaults. Continue?')) {
      return;
    }

    setLoading(true);
    try {
      await settingsService.resetToDefaults();
      toast.success('System settings restored to base default values.');
      await fetchSettings();
    } catch (err) {
      console.error(err);
      toast.error('Failed to restore configurations defaults.');
    } finally {
      setLoading(false);
    }
  };

  // Check if there are unsaved changes
  const hasChanges = Object.keys(values).some(
    (k) => values[k] !== originalValues[k]
  );

  // Tabs metadata definitions
  const tabsList = [
    { id: 'GENERAL', label: 'General', icon: FiSettings },
    { id: 'BUSINESS', label: 'Business', icon: FiSliders },
    { id: 'ORDERS', label: 'Orders', icon: FiPackage },
    { id: 'PAYMENTS', label: 'Payments', icon: FiCreditCard },
    { id: 'EMAIL', label: 'Email Server', icon: FiMail },
    { id: 'NOTIFICATIONS', label: 'Notifications', icon: FiBell },
    { id: 'TRACKING', label: 'Tracking', icon: FiActivity },
    { id: 'SECURITY', label: 'Security', icon: FiShield },
    { id: 'SYSTEM', label: 'System', icon: FiCpu },
  ];

  // Helper to render configuration fields based on search & category
  const renderSettingField = (setting) => {
    const key = setting.settingKey;
    const value = values[key] ?? '';
    const description = setting.description;
    
    // Check if value is boolean format
    const isBoolean = value.toLowerCase() === 'true' || value.toLowerCase() === 'false';

    return (
      <div key={key} className="p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-md">
          <label className="text-xs font-bold text-slate-800 tracking-wide font-mono block">
            {key}
          </label>
          <span className="text-[10px] text-slate-455 block leading-normal">
            {description || 'System setting configuration parameter.'}
          </span>
        </div>
        
        <div className="shrink-0 w-full md:w-72">
          {isBoolean ? (
            <label className="inline-flex items-center cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={value.toLowerCase() === 'true'}
                disabled={!setting.editable}
                onChange={(e) => handleFieldChange(key, e.target.checked ? 'true' : 'false')}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
              <span className="ms-3 text-xs font-semibold text-slate-700">
                {value.toUpperCase()}
              </span>
            </label>
          ) : (
            <input
              type={key.includes('PASSWORD') || key.includes('SECRET') ? 'password' : 'text'}
              value={value}
              disabled={!setting.editable}
              onChange={(e) => handleFieldChange(key, e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-white font-medium text-slate-800 disabled:bg-slate-100 disabled:text-slate-450"
            />
          )}
        </div>
      </div>
    );
  };

  // Filter settings matching tab and search query
  const filteredSettings = settingsList.filter((s) => {
    const matchesCategory = s.category === activeTab;
    const matchesSearch =
      searchQuery === '' ||
      s.settingKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // If searching, we skip category filter so user can see match results across any category!
    return searchQuery !== '' ? matchesSearch : matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FiSettings className="text-brand-650" />
            Global System Configurations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure central shipment logistics parameters, business rates, email integrations, and core system properties.
          </p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            icon={FiRotateCcw}
            onClick={handleResetDefaults}
          >
            Reset Defaults
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={FiSave}
            loading={saving}
            onClick={handleSaveChanges}
            disabled={!hasChanges}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* Unsaved Changes Banner */}
      {hasChanges && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-2xl flex items-center gap-3 text-xs shadow-sm">
          <FiAlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
          <div className="flex-1">
            <span className="font-bold">You have unsaved changes!</span> Make sure to save before navigating away to prevent loss of modifications.
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveChanges}
            loading={saving}
            className="!py-1.5 !px-3 bg-amber-600 hover:bg-amber-700 text-white"
          >
            Save Now
          </Button>
        </div>
      )}

      {/* Search and Tabs Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Navigation tabs & search */}
        <div className="space-y-4">
          <div className="relative">
            <FiSearch className="absolute left-3.5 top-3.5 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search setting key..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-white"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-3 flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-1 scrollbar-none">
            {tabsList.map((t) => {
              const TabIcon = t.icon;
              const isActive = activeTab === t.id && searchQuery === '';
              return (
                <button
                  key={t.id}
                  disabled={searchQuery !== ''}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-bold transition-all shrink-0 lg:shrink-1 ${
                    isActive
                      ? 'bg-brand-50 text-brand-650'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50'
                  }`}
                >
                  <TabIcon className="h-4.5 w-4.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Form details area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {searchQuery !== '' 
                  ? `Search Results: "${searchQuery}"` 
                  : `${activeTab} Configuration Panel`}
              </h3>
              
              <span className="text-[10px] bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full font-bold">
                {filteredSettings.length} setting{filteredSettings.length !== 1 ? 's' : ''}
              </span>
            </div>

            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                <span className="text-xs text-slate-500">Loading system settings...</span>
              </div>
            ) : filteredSettings.length > 0 ? (
              <form onSubmit={handleSaveChanges} className="divide-y divide-slate-100">
                <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-100">
                  {filteredSettings.map(renderSettingField)}
                </div>
                
                <div className="px-6 py-4 bg-slate-50/50 border-t flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setValues({ ...originalValues })}
                    disabled={!hasChanges || saving}
                  >
                    Discard Changes
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    loading={saving}
                    disabled={!hasChanges}
                  >
                    Save Tab Changes
                  </Button>
                </div>
              </form>
            ) : (
              <div className="py-20 text-center space-y-3">
                <FiSliders className="h-10 w-10 text-slate-300 mx-auto" />
                <h4 className="text-xs font-bold text-slate-700">No configuration keys matched</h4>
                <p className="text-[11px] text-slate-455 max-w-xs mx-auto">
                  Try typing a different key name, description details, or check other configuration tabs.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
