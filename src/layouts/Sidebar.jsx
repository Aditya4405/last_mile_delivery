import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiLogOut, FiX, FiTrendingUp } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose, menuItems = [] }) => {
  const { logout, user } = useAuth();

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800
          transition-transform duration-300 transform lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header Logo */}
        <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiTrendingUp className="h-6 w-6 text-brand-400" />
            <span className="text-lg font-black tracking-tight text-white">
              LogiTrack
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="px-6 py-4.5 border-b border-slate-800 flex items-center gap-3">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'}
            alt="Profile Avatar"
            className="h-10 w-10 rounded-full border-2 border-slate-800 object-cover"
          />
          <div className="truncate">
            <p className="text-xs font-bold text-white truncate">{user?.name || 'Loading...'}</p>
            <p className="text-[10px] text-slate-400 font-medium capitalize mt-0.5 tracking-wider bg-slate-800/80 px-1.5 py-0.5 rounded inline-block">
              {user?.role}
            </p>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={onClose} // close drawer on link click in mobile
              className={({ isActive }) => `
                flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
                ${isActive
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-900/30'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }
              `}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="
              flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg text-sm font-semibold text-slate-400 
              hover:bg-red-950/20 hover:text-red-400 border border-transparent hover:border-red-900/30 transition-all
            "
          >
            <FiLogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
