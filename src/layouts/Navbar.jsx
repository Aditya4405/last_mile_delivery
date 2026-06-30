import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiBell, FiChevronDown, FiUser, FiSettings, FiLogOut, FiCheck, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { formatDate } from '../utils';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);

  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  // Click outside listener to dismiss menus
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setShowNotificationsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur border-b border-slate-200 flex items-center justify-between px-6 transition-colors">
      {/* Mobile Hamburger */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
        >
          <FiMenu className="h-5 w-5" />
        </button>
        
        {/* Dynamic Greeting */}
        <div className="hidden sm:block">
          <h2 className="text-sm font-bold text-slate-800">
            Welcome back, {user?.name || 'User'}
          </h2>
          <p className="text-[10px] text-slate-500">
            Operations Telemetry Terminal
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications Dropdown */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setShowNotificationsMenu((prev) => !prev)}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-550 shadow-subtle transition-all relative"
          >
            <FiBell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotificationsMenu && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-hover z-40 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] font-bold text-brand-650 hover:text-brand-700"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 no-scrollbar">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-slate-500">
                    No notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`p-3.5 flex items-start gap-2.5 transition-colors cursor-pointer hover:bg-slate-50 ${!n.read ? 'bg-brand-50/20 ' : ''}`}
                    >
                      <div className="flex-1">
                        <p className={`text-xs ${!n.read ? 'font-bold text-slate-900 ' : 'text-slate-705 '}`}>
                          {n.title}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                          {n.message}
                        </p>
                        <span className="text-[8px] text-slate-400 block mt-1">
                          {formatDate(n.createdAt, 'DD MMM, hh:mm A')}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {!n.read && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(n.id);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-brand-600"
                            title="Mark as Read"
                          >
                            <FiCheck className="h-3 w-3" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(n.id);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-red-500"
                          title="Delete"
                        >
                          <FiTrash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-center">
                <Link
                  to={user?.role === 'admin' ? '/admin/notifications' : user?.role === 'customer' ? '/customer/notifications' : '/agent/notifications'}
                  onClick={() => setShowNotificationsMenu(false)}
                  className="text-[10px] font-bold text-brand-650 hover:underline"
                >
                  View Notification Center
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu((prev) => !prev)}
            className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all text-left shadow-subtle"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt="Avatar"
              className="h-7 w-7 rounded-full object-cover"
            />
            <FiChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white shadow-hover z-40 overflow-hidden py-1">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {user?.name}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {user?.email}
                </p>
              </div>

              <Link
                to={user?.role === 'admin' ? '/admin/settings' : user?.role === 'customer' ? '/customer/profile' : '/agent/profile'}
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <FiUser className="h-4 w-4" />
                <span>My Profile</span>
              </Link>

              <Link
                to={user?.role === 'admin' ? '/admin/settings' : user?.role === 'customer' ? '/customer/settings' : '/agent/settings'}
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <FiSettings className="h-4 w-4" />
                <span>Settings</span>
              </Link>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                }}
                className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-xs font-semibold text-red-650 hover:bg-red-50 border-t border-slate-100 transition-colors"
              >
                <FiLogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
