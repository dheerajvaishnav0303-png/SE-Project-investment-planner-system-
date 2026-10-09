import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  UserCheck, 
  ShieldAlert, 
  Target, 
  TrendingUp, 
  RefreshCw, 
  Shield,
  LogOut,
  User,
  Briefcase,
  Wallet,
  Bell,
  Check,
  X
} from 'lucide-react';
import api from '../api/apiClient';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  profileName, 
  currency, 
  backendOnline, 
  onRefresh, 
  currentUser, 
  onLogout 
}) {
  const isAdmin = currentUser?.role === 'admin';
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  // Fetch notifications for customer
  const loadCustomerNotifications = async () => {
    if (!currentUser || isAdmin) return;
    try {
      const res = await api.getCustomerNotifications();
      if (res.success) {
        setNotifications(res.data);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch {
      // Ignore background notification fetch errors
    }
  };

  useEffect(() => {
    loadCustomerNotifications();
    const interval = setInterval(loadCustomerNotifications, 30000);
    return () => clearInterval(interval);
  }, [currentUser, isAdmin]);

  const handleMarkRead = async (id) => {
    try {
      await api.markCustomerNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // silent
    }
  };

  // Nav items based on role
  const customerNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'marketplace', label: 'Explore Plans', icon: Briefcase },
    { id: 'portfolio', label: 'My Portfolio', icon: Wallet },
    { id: 'profile', label: 'Income & Budget', icon: UserCheck },
    { id: 'risk', label: 'Risk Profile', icon: ShieldAlert },
    { id: 'goals', label: 'Financial Goals', icon: Target },
    { id: 'plan', label: 'SIP Engine', icon: TrendingUp }
  ];

  const adminNavItems = [
    { id: 'admin', label: 'Admin Console', icon: Shield, isAdmin: true },
    { id: 'dashboard', label: 'Customer Preview', icon: LayoutDashboard }
  ];

  const navItems = isAdmin ? adminNavItems : customerNavItems;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={() => setActiveTab(isAdmin ? 'admin' : 'dashboard')}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl shadow-lg ${
              isAdmin 
                ? 'bg-gradient-to-tr from-indigo-600 to-purple-500 text-white shadow-indigo-500/20' 
                : 'bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 shadow-emerald-500/20'
            }`}>
              {currency || '$'}
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
                InvestPlan <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  isAdmin 
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {isAdmin ? 'Admin Console' : 'Pro'}
                </span>
              </span>
              <p className="text-xs text-slate-400 hidden sm:block">Investment Planner System</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              if (item.isAdmin) {
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-sm'
                        : 'text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/40 border border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                      Master
                    </span>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User profile, Backend status & Notifications */}
          <div className="flex items-center space-x-3">
            {/* MongoDB Online status */}
            <div className="hidden lg:flex items-center space-x-2 text-xs px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700">
              <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-slate-300">{backendOnline ? 'API Connected' : 'Offline'}</span>
            </div>

            {/* Customer Notifications Dropdown */}
            {!isAdmin && (
              <div className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  title="Notifications & Announcements"
                  className="relative p-2 text-slate-400 hover:text-white bg-slate-800/70 hover:bg-slate-700/70 rounded-xl border border-slate-700 transition"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold text-white">Announcements & Alerts</span>
                      <button
                        onClick={() => setNotifDropdownOpen(false)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {notifications.map((n) => (
                        <div
                          key={n._id}
                          className={`p-2.5 rounded-xl border transition text-xs space-y-1 ${
                            n.read
                              ? 'bg-slate-800/40 border-slate-800 text-slate-400'
                              : 'bg-indigo-950/30 border-indigo-800/50 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-white">{n.title}</span>
                            {!n.read && (
                              <button
                                onClick={() => handleMarkRead(n._id)}
                                title="Mark Read"
                                className="text-indigo-400 hover:text-white"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <p className="text-[11px] leading-relaxed">{n.message}</p>
                          <span className="text-[9px] text-slate-500 block">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                      {notifications.length === 0 && (
                        <p className="text-center text-xs text-slate-500 py-4">No notifications.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Info Capsule */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                isAdmin ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-slate-200 leading-tight">
                  {currentUser?.name || profileName || 'Investor'}
                </p>
                <span className={`text-[10px] font-medium capitalize ${
                  isAdmin ? 'text-indigo-400' : 'text-emerald-400'
                }`}>
                  {isAdmin ? 'Administrator' : currentUser?.role || 'Customer'}
                </span>
              </div>
            </div>

            <button
              onClick={onRefresh}
              title="Refresh Data"
              className="p-2 text-slate-400 hover:text-white bg-slate-800/70 hover:bg-slate-700/70 rounded-xl border border-slate-700 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              title="Sign Out"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-400 hover:text-white bg-rose-950/30 hover:bg-rose-900/60 rounded-xl border border-rose-800/50 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="md:hidden flex overflow-x-auto space-x-1 py-2 border-t border-slate-800 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition ${
                  isActive
                    ? item.isAdmin
                      ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
