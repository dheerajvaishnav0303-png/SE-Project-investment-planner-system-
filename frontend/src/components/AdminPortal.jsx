import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  ArrowLeftRight,
  Briefcase,
  BarChart3,
  FileText,
  Bell,
  Settings,
  LogOut,
  Search,
  Plus,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Filter,
  Eye,
  Trash2,
  Edit,
  Shield,
  Database,
  Server,
  DollarSign,
  Activity,
  Layers,
  Calendar,
  Check,
  X,
  UserCheck,
  UserX,
  Send,
  ExternalLink,
  ChevronRight,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Clock
} from 'lucide-react';
import api from '../api/apiClient';

export default function AdminPortal({ currentUser, onLogout, onSwitchToCustomerView }) {
  // Navigation State
  const [activeSection, setActiveSection] = useState('overview');
  const [globalSearch, setGlobalSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Data States
  const [dashboardData, setDashboardData] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [investmentsList, setInvestmentsList] = useState([]);
  const [plansList, setPlansList] = useState([]);
  const [transactionsList, setTransactionsList] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsRange, setAnalyticsRange] = useState('30d');
  const [reportsData, setReportsData] = useState([]);
  const [reportType, setReportType] = useState('investments');
  const [notificationsList, setNotificationsList] = useState([]);
  const [settingsData, setSettingsData] = useState(null);

  // Filter States
  const [userStatusFilter, setUserStatusFilter] = useState('ALL');
  const [txnStatusFilter, setTxnStatusFilter] = useState('ALL');
  const [txnTypeFilter, setTxnTypeFilter] = useState('ALL');
  const [planCategoryFilter, setPlanCategoryFilter] = useState('ALL');

  // Modals
  const [selectedUserModal, setSelectedUserModal] = useState(null);
  const [editingUserModal, setEditingUserModal] = useState(null);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // Real-Time Live Sync Engine States
  const [liveSyncEnabled, setLiveSyncEnabled] = useState(true);
  const [syncIntervalSeconds, setSyncIntervalSeconds] = useState(4);
  const [lastSyncTime, setLastSyncTime] = useState(new Date());
  const [isSyncing, setIsSyncing] = useState(false);
  const [previousUserCount, setPreviousUserCount] = useState(null);

  // Real-Time User Edit Form
  const [userEditForm, setUserEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'customer',
    status: 'active',
    walletBalance: 0
  });

  // Forms
  const [planForm, setPlanForm] = useState({
    name: '',
    category: 'Equity',
    riskLevel: 'Moderate',
    expectedReturn: '',
    minInvestment: '',
    durationMonths: '12',
    description: '',
    featured: false,
    status: 'active'
  });

  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'Announcement',
    recipientId: ''
  });

  const [adminProfileForm, setAdminProfileForm] = useState({
    name: currentUser?.name || 'Super Administrator',
    email: currentUser?.email || 'admin@investplan.com',
    phone: currentUser?.phone || '+1 (555) 019-2834',
    newPassword: ''
  });

  // Show temporary toast message
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Dashboard Overview
  const loadDashboard = useCallback(async () => {
    try {
      const res = await api.getAdminDashboard();
      if (res.success) setDashboardData(res.data);
    } catch (err) {
      showToast('error', err.message || 'Failed to fetch dashboard data');
    }
  }, []);

  // Fetch Users
  const loadUsers = useCallback(async () => {
    try {
      const res = await api.getAdminUsers({ status: userStatusFilter, search: globalSearch });
      if (res.success) setUsersList(res.data);
    } catch (err) {
      showToast('error', err.message || 'Failed to fetch users');
    }
  }, [userStatusFilter, globalSearch]);

  // Fetch Investments
  const loadInvestments = useCallback(async () => {
    try {
      const res = await api.getAdminInvestments();
      if (res.success) setInvestmentsList(res.data);
    } catch (err) {
      showToast('error', err.message || 'Failed to fetch investments');
    }
  }, []);

  // Fetch Plans
  const loadPlans = useCallback(async () => {
    try {
      const res = await api.getAdminPlans();
      if (res.success) setPlansList(res.data);
    } catch (err) {
      showToast('error', err.message || 'Failed to fetch plans');
    }
  }, []);

  // Fetch Transactions
  const loadTransactions = useCallback(async () => {
    try {
      const res = await api.getAdminTransactions({
        status: txnStatusFilter !== 'ALL' ? txnStatusFilter : undefined,
        type: txnTypeFilter !== 'ALL' ? txnTypeFilter : undefined
      });
      if (res.success) setTransactionsList(res.data);
    } catch (err) {
      showToast('error', err.message || 'Failed to fetch transactions');
    }
  }, [txnStatusFilter, txnTypeFilter]);

  // Fetch Analytics
  const loadAnalytics = useCallback(async () => {
    try {
      const res = await api.getAdminAnalytics(analyticsRange);
      if (res.success) setAnalyticsData(res.data);
    } catch (err) {
      showToast('error', err.message || 'Failed to fetch analytics');
    }
  }, [analyticsRange]);

  // Fetch Reports
  const loadReports = useCallback(async () => {
    try {
      const res = await api.getAdminReports(reportType);
      if (res.success) setReportsData(res.data);
    } catch (err) {
      showToast('error', err.message || 'Failed to fetch report');
    }
  }, [reportType]);

  // Fetch Notifications
  const loadNotifications = useCallback(async () => {
    try {
      const res = await api.getAdminNotifications();
      if (res.success) setNotificationsList(res.data);
    } catch (err) {
      showToast('error', err.message || 'Failed to fetch notifications');
    }
  }, []);

  // Fetch Settings
  const loadSettings = useCallback(async () => {
    try {
      const res = await api.getAdminSettings();
      if (res.success) {
        setSettingsData(res.data);
        if (res.data.admin) {
          setAdminProfileForm((prev) => ({
            ...prev,
            name: res.data.admin.name || prev.name,
            email: res.data.admin.email || prev.email,
            phone: res.data.admin.phone || prev.phone
          }));
        }
      }
    } catch (err) {
      showToast('error', err.message || 'Failed to fetch settings');
    }
  }, []);

  // Initial and section-based loading
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (activeSection === 'users') loadUsers();
    else if (activeSection === 'investments') loadInvestments();
    else if (activeSection === 'plans') loadPlans();
    else if (activeSection === 'transactions') loadTransactions();
    else if (activeSection === 'analytics') loadAnalytics();
    else if (activeSection === 'reports') loadReports();
    else if (activeSection === 'notifications') loadNotifications();
    else if (activeSection === 'settings') loadSettings();
  }, [
    activeSection,
    loadUsers,
    loadInvestments,
    loadPlans,
    loadTransactions,
    loadAnalytics,
    loadReports,
    loadNotifications,
    loadSettings
  ]);

  // Refresh current view
  const handleRefresh = async () => {
    setLoading(true);
    await Promise.all([
      loadDashboard(),
      activeSection === 'users' && loadUsers(),
      activeSection === 'investments' && loadInvestments(),
      activeSection === 'plans' && loadPlans(),
      activeSection === 'transactions' && loadTransactions(),
      activeSection === 'analytics' && loadAnalytics(),
      activeSection === 'reports' && loadReports(),
      activeSection === 'notifications' && loadNotifications(),
      activeSection === 'settings' && loadSettings()
    ]);
    setLoading(false);
  };

  // Real-Time Background Live Sync Effect
  useEffect(() => {
    if (!liveSyncEnabled) return;

    const intervalId = setInterval(async () => {
      setIsSyncing(true);
      try {
        const [dashRes, usersRes] = await Promise.all([
          api.getAdminDashboard().catch(() => null),
          api.getAdminUsers({ status: userStatusFilter, search: globalSearch }).catch(() => null)
        ]);

        if (dashRes?.success && dashRes.data) {
          setDashboardData(dashRes.data);
        }

        if (usersRes?.success && Array.isArray(usersRes.data)) {
          // Detect newly joined users in real time
          if (previousUserCount !== null && usersRes.data.length > previousUserCount) {
            const newestUser = usersRes.data[0];
            showToast('success', `⚡ Real-time Update: New Investor "${newestUser?.name || 'User'}" joined!`);
          }
          setPreviousUserCount(usersRes.data.length);
          setUsersList(usersRes.data);
        }

        setLastSyncTime(new Date());
      } catch {
        // Silent catch for smooth background sync
      } finally {
        setIsSyncing(false);
      }
    }, syncIntervalSeconds * 1000);

    return () => clearInterval(intervalId);
  }, [liveSyncEnabled, syncIntervalSeconds, userStatusFilter, globalSearch, previousUserCount]);

  // Real-Time User Edit Handlers
  const handleOpenEditUser = (user) => {
    setEditingUserModal(user);
    setUserEditForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'customer',
      status: user.status || 'active',
      walletBalance: user.walletBalance !== undefined ? user.walletBalance : 0
    });
  };

  const handleSaveUserUpdate = async (e) => {
    e.preventDefault();
    if (!editingUserModal) return;
    setActionLoading(true);

    try {
      const res = await api.updateAdminUser(editingUserModal._id, userEditForm);
      if (res.success) {
        showToast('success', `Real-time update: User "${userEditForm.name}" updated successfully!`);

        // Immediate optimistic UI update
        setUsersList((prev) =>
          prev.map((u) => (u._id === editingUserModal._id ? { ...u, ...userEditForm } : u))
        );

        if (selectedUserModal && selectedUserModal.user._id === editingUserModal._id) {
          setSelectedUserModal((prev) => ({
            ...prev,
            user: { ...prev.user, ...userEditForm },
            portfolioSummary: {
              ...prev.portfolioSummary,
              walletBalance: userEditForm.walletBalance
            }
          }));
        }

        setEditingUserModal(null);
        await Promise.all([loadUsers(), loadDashboard()]);
      } else {
        showToast('error', res.error || 'Failed to update user');
      }
    } catch (err) {
      showToast('error', err.message || 'Error updating user');
    } finally {
      setActionLoading(false);
    }
  };

  // User Actions
  const handleViewUser = async (userId) => {
    setActionLoading(true);
    try {
      const res = await api.getAdminUserDetails(userId);
      if (res.success) {
        setSelectedUserModal(res.data);
      }
    } catch (err) {
      showToast('error', err.message || 'Failed to load user details');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateUserStatus = async (userId, newStatus) => {
    try {
      const res = await api.updateAdminUserStatus(userId, newStatus);
      if (res.success) {
        showToast('success', `User status updated to ${newStatus}`);
        loadUsers();
        if (selectedUserModal && selectedUserModal.user._id === userId) {
          setSelectedUserModal((prev) => ({
            ...prev,
            user: { ...prev.user, status: newStatus }
          }));
        }
      }
    } catch (err) {
      showToast('error', err.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${userName}" and all associated investments?`)) {
      return;
    }
    try {
      const res = await api.deleteAdminUser(userId);
      if (res.success) {
        showToast('success', `User "${userName}" deleted successfully`);
        setSelectedUserModal(null);
        loadUsers();
        loadDashboard();
      }
    } catch (err) {
      showToast('error', err.message || 'Failed to delete user');
    }
  };

  // Transaction Actions
  const handleUpdateTxnStatus = async (txnId, status) => {
    setActionLoading(true);
    try {
      const res = await api.updateAdminTransactionStatus(txnId, status);
      if (res.success) {
        showToast('success', `Transaction marked as ${status}`);
        loadTransactions();
        loadDashboard();
      }
    } catch (err) {
      showToast('error', err.message || 'Failed to update transaction');
    } finally {
      setActionLoading(false);
    }
  };

  // Plan Actions
  const handleOpenPlanModal = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setPlanForm({
        name: plan.name,
        category: plan.category,
        riskLevel: plan.riskLevel,
        expectedReturn: plan.expectedReturn,
        minInvestment: plan.minInvestment,
        durationMonths: plan.durationMonths || 12,
        description: plan.description,
        featured: Boolean(plan.featured),
        status: plan.status || 'active'
      });
    } else {
      setEditingPlan(null);
      setPlanForm({
        name: '',
        category: 'Equity',
        riskLevel: 'Moderate',
        expectedReturn: '',
        minInvestment: '',
        durationMonths: '12',
        description: '',
        featured: false,
        status: 'active'
      });
    }
    setPlanModalOpen(true);
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    if (!planForm.name || !planForm.expectedReturn || !planForm.minInvestment) {
      showToast('error', 'Please fill in Plan Name, Expected Return, and Min Investment');
      return;
    }

    setActionLoading(true);
    try {
      if (editingPlan) {
        const res = await api.updateAdminPlan(editingPlan._id, planForm);
        if (res.success) {
          showToast('success', `Plan "${planForm.name}" updated successfully`);
        }
      } else {
        const res = await api.createAdminPlan(planForm);
        if (res.success) {
          showToast('success', `Plan "${planForm.name}" published to Customer Portal!`);
        }
      }
      setPlanModalOpen(false);
      loadPlans();
      loadDashboard();
    } catch (err) {
      showToast('error', err.message || 'Failed to save investment plan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTogglePlanStatus = async (planId) => {
    try {
      const res = await api.toggleAdminPlanStatus(planId);
      if (res.success) {
        showToast('success', `Plan status toggled to ${res.data.status}`);
        loadPlans();
      }
    } catch (err) {
      showToast('error', err.message || 'Failed to toggle plan status');
    }
  };

  const handleDeletePlan = async (planId, planName) => {
    if (!window.confirm(`Are you sure you want to delete or archive plan "${planName}"?`)) return;
    try {
      const res = await api.deleteAdminPlan(planId);
      if (res.success) {
        showToast('success', res.message || 'Plan deleted / archived');
        loadPlans();
        loadDashboard();
      }
    } catch (err) {
      showToast('error', err.message || 'Failed to delete plan');
    }
  };

  // Notification Actions
  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notificationForm.title || !notificationForm.message) {
      showToast('error', 'Please provide a title and message');
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.createAdminNotification(notificationForm);
      if (res.success) {
        showToast('success', res.message || 'Notification delivered successfully');
        setShowNotificationModal(false);
        setNotificationForm({ title: '', message: '', type: 'Announcement', recipientId: '' });
        loadNotifications();
      }
    } catch (err) {
      showToast('error', err.message || 'Failed to send notification');
    } finally {
      setActionLoading(false);
    }
  };

  // Admin Profile Update
  const handleUpdateAdminProfile = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.updateAdminProfile(adminProfileForm);
      if (res.success) {
        showToast('success', 'Admin profile updated successfully');
        setAdminProfileForm((prev) => ({ ...prev, newPassword: '' }));
        loadSettings();
      }
    } catch (err) {
      showToast('error', err.message || 'Failed to update admin profile');
    } finally {
      setActionLoading(false);
    }
  };

  // Demo Data Reset
  const handleSeedDemoData = async () => {
    if (!window.confirm('Reset/seed demo investors, plans, and transaction data in MongoDB?')) return;
    setActionLoading(true);
    try {
      const res = await api.seedAdminDemo();
      if (res.success) {
        showToast('success', 'Demo data seeded successfully into MongoDB');
        await handleRefresh();
      }
    } catch (err) {
      showToast('error', err.message || 'Failed to seed demo data');
    } finally {
      setActionLoading(false);
    }
  };

  // Export CSV Helper
  const handleExportCSV = () => {
    if (!reportsData || reportsData.length === 0) {
      showToast('error', 'No report data available to export');
      return;
    }

    const headers = Object.keys(reportsData[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));

    reportsData.forEach((row) => {
      const values = headers.map((header) => {
        const val = row[header] ?? '';
        const escaped = ('' + val).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `investplan_${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', `Exported ${reportsData.length} records to CSV!`);
  };

  // Navigation Items
  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users, badge: dashboardData?.summary?.totalUsers },
    { id: 'investments', label: 'Investments', icon: TrendingUp },
    { id: 'plans', label: 'Investment Plans', icon: Briefcase, badge: dashboardData?.summary?.activePlansCount },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: ArrowLeftRight,
      pendingBadge: dashboardData?.summary?.pendingTransactions
    },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const summary = dashboardData?.summary || {};

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md transition-all animate-bounce ${
            toast.type === 'error'
              ? 'bg-rose-950/90 border-rose-800 text-rose-200'
              : 'bg-emerald-950/90 border-emerald-800 text-emerald-200'
          }`}
        >
          {toast.type === 'error' ? <AlertTriangle className="w-5 h-5 text-rose-400" /> : <CheckCircle className="w-5 h-5 text-emerald-400" />}
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 select-none">
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/25">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-base tracking-tight">InvestPlan</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Admin
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Enterprise Control</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.pendingBadge > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-slate-950 animate-pulse">
                    {item.pendingBadge}
                  </span>
                )}
                {!item.pendingBadge && item.badge !== undefined && (
                  <span className={`text-xs px-2 py-0.5 rounded-md ${isActive ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer / Profile */}
        <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-900/50">
          {onSwitchToCustomerView && (
            <button
              onClick={onSwitchToCustomerView}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-800/40 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preview Customer View</span>
            </button>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser?.name?.charAt(0) || 'A'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-200 truncate">{currentUser?.name || 'Administrator'}</p>
                <p className="text-[10px] text-slate-400 truncate">{currentUser?.email || 'admin@investplan.com'}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOP NAVBAR */}
        <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-10">
          {/* Section Title & Subtitle */}
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight capitalize flex items-center gap-2">
              {activeSection === 'overview' && 'Executive Overview'}
              {activeSection === 'users' && 'Investor Accounts Management'}
              {activeSection === 'investments' && 'Global Investment Portfolios'}
              {activeSection === 'plans' && 'Investment Plan Catalog'}
              {activeSection === 'transactions' && 'Financial Transactions Ledger'}
              {activeSection === 'analytics' && 'Analytics & Performance Metrics'}
              {activeSection === 'reports' && 'Exportable Audit & Business Reports'}
              {activeSection === 'notifications' && 'System Announcements & Alerts'}
              {activeSection === 'settings' && 'System Diagnostics & Configuration'}
            </h1>
            <p className="text-xs text-slate-400">
              Live enterprise management synchronized with MongoDB cluster
            </p>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Quick search..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-56 pl-9 pr-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            {/* Real-time Live Sync Indicator & Controls */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs shadow-inner">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  {liveSyncEnabled && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  )}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${liveSyncEnabled ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                </span>
                <span className="font-semibold text-slate-200 hidden xl:inline">
                  {liveSyncEnabled ? 'Real-Time Sync' : 'Sync Paused'}
                </span>
              </div>

              <div className="h-3.5 w-px bg-slate-800 hidden sm:block" />

              {/* Auto Sync Toggle */}
              <button
                type="button"
                onClick={() => {
                  setLiveSyncEnabled(!liveSyncEnabled);
                  showToast('success', !liveSyncEnabled ? 'Live auto-sync resumed' : 'Live auto-sync paused');
                }}
                title={liveSyncEnabled ? 'Pause Live Sync' : 'Resume Live Sync'}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase transition ${
                  liveSyncEnabled
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {liveSyncEnabled ? 'LIVE' : 'PAUSED'}
              </button>

              {/* Sync Interval Selector */}
              <select
                value={syncIntervalSeconds}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSyncIntervalSeconds(val);
                  showToast('success', `Real-time sync rate set to ${val}s`);
                }}
                className="bg-slate-800 text-[10px] text-slate-300 border border-slate-700 rounded px-1.5 py-0.5 focus:outline-none"
                title="Polling interval rate"
              >
                <option value="3">3s</option>
                <option value="5">5s</option>
                <option value="10">10s</option>
              </select>

              {/* Spinning sync activity icon */}
              <RefreshCw
                className={`w-3 h-3 text-slate-400 transition ${isSyncing ? 'animate-spin text-indigo-400' : ''}`}
                title={`Last synced at ${lastSyncTime.toLocaleTimeString()}`}
              />
            </div>

            {/* Quick Action: New Plan Button */}
            <button
              onClick={() => handleOpenPlanModal()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Plan</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              title="Refresh MongoDB Data"
              className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-700 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>

            {/* Notifications Button */}
            <button
              onClick={() => {
                setActiveSection('notifications');
                setShowNotificationModal(true);
              }}
              title="Broadcast Announcement"
              className="relative p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-700 transition"
            >
              <Bell className="w-4 h-4" />
              {dashboardData?.summary?.pendingTransactions > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>
          </div>
        </header>

        {/* DYNAMIC VIEW CONTAINER */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
          {/* ======================================================== */}
          {/* 1. DASHBOARD OVERVIEW */}
          {/* ======================================================== */}
          {activeSection === 'overview' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* 6 Real KPI Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {/* 1. Total Users */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm hover:border-slate-700 transition">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-medium">Total Investors</span>
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-white">{summary.totalUsers ?? 0}</p>
                  <p className="text-[11px] text-blue-400/80 mt-1 flex items-center gap-1">
                    <UserCheck className="w-3 h-3" /> Active accounts
                  </p>
                </div>

                {/* 2. Total Investments Count & Capital */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm hover:border-slate-700 transition">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-medium">Total Invested</span>
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-white">
                    ${(summary.totalInvestmentsAmount ?? 0).toLocaleString()}
                  </p>
                  <p className="text-[11px] text-indigo-400/80 mt-1">
                    {summary.totalInvestments ?? 0} active allocations
                  </p>
                </div>

                {/* 3. Total Portfolio Value / AUM */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm hover:border-slate-700 transition">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-medium">Total AUM</span>
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-emerald-400">
                    ${(summary.totalPortfolioValue ?? 0).toLocaleString()}
                  </p>
                  <p className="text-[11px] text-emerald-500/80 mt-1 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" /> Real-time valuation
                  </p>
                </div>

                {/* 4. Total Returns */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm hover:border-slate-700 transition">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-medium">Customer Returns</span>
                    <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
                      <Percent className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-teal-400">
                    +${(summary.totalReturns ?? 0).toLocaleString()}
                  </p>
                  <p className="text-[11px] text-teal-500/80 mt-1">
                    {summary.totalInvestmentsAmount > 0
                      ? `${((summary.totalReturns / summary.totalInvestmentsAmount) * 100).toFixed(1)}% net yield`
                      : '0.0% net yield'}
                  </p>
                </div>

                {/* 5. Total Transactions */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm hover:border-slate-700 transition">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-medium">Transactions</span>
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                      <ArrowLeftRight className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-white">{summary.totalTransactions ?? 0}</p>
                  <p className="text-[11px] text-purple-400/80 mt-1">Deposits & Investments</p>
                </div>

                {/* 6. Pending Transactions */}
                <div className={`p-4 rounded-2xl bg-slate-900 border transition ${
                  summary.pendingTransactions > 0 ? 'border-amber-500/50 bg-amber-950/20' : 'border-slate-800'
                }`}>
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-medium">Pending Action</span>
                    <div className={`p-2 rounded-lg ${summary.pendingTransactions > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <p className={`text-2xl font-black ${summary.pendingTransactions > 0 ? 'text-amber-400 animate-pulse' : 'text-white'}`}>
                    {summary.pendingTransactions ?? 0}
                  </p>
                  <p className="text-[11px] text-amber-400/80 mt-1">
                    {summary.pendingTransactions > 0 ? 'Approval required' : 'All transactions clear'}
                  </p>
                </div>
              </div>

              {/* Quick Admin Actions Bar */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-900/40 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Administrator Quick Operations</h3>
                  <p className="text-xs text-slate-400">Directly deploy investment plans, broadcast announcements, or refresh investor test data</p>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => handleOpenPlanModal()}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Investment Plan</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection('notifications');
                      setShowNotificationModal(true);
                    }}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Broadcast Message</span>
                  </button>
                  <button
                    onClick={handleSeedDemoData}
                    disabled={actionLoading}
                    className="px-3.5 py-2 bg-purple-900/40 hover:bg-purple-800/50 text-purple-300 rounded-xl text-xs font-semibold flex items-center gap-2 border border-purple-800/40 transition"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>Seed Demo Investors</span>
                  </button>
                </div>
              </div>

              {/* Live Tables Grid: Recent Investments & Recent Transactions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Investments */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      Recent Customer Investments
                    </h3>
                    <button
                      onClick={() => setActiveSection('investments')}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                    >
                      View All <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3">Investor</th>
                          <th className="py-2.5 px-3">Plan</th>
                          <th className="py-2.5 px-3">Amount</th>
                          <th className="py-2.5 px-3">Current Val</th>
                          <th className="py-2.5 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {(dashboardData?.recentInvestments || []).slice(0, 5).map((inv) => (
                          <tr key={inv._id} className="hover:bg-slate-800/40 transition">
                            <td className="py-2.5 px-3 font-medium text-white">{inv.user?.name || 'Customer'}</td>
                            <td className="py-2.5 px-3 text-slate-300">{inv.plan?.name || 'Investment Plan'}</td>
                            <td className="py-2.5 px-3 font-semibold text-slate-200">${(inv.amount || 0).toLocaleString()}</td>
                            <td className="py-2.5 px-3 text-emerald-400 font-semibold">${(inv.currentValue || inv.amount || 0).toLocaleString()}</td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                {inv.status || 'Active'}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {(!dashboardData?.recentInvestments || dashboardData.recentInvestments.length === 0) && (
                          <tr>
                            <td colSpan="5" className="py-6 text-center text-slate-500">
                              No investments recorded yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent Transactions with Live Action */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <ArrowLeftRight className="w-4 h-4 text-purple-400" />
                      Recent Financial Transactions
                    </h3>
                    <button
                      onClick={() => setActiveSection('transactions')}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                    >
                      View All <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3">Txn ID</th>
                          <th className="py-2.5 px-3">Investor</th>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 px-3">Amount</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {(dashboardData?.recentTransactions || []).slice(0, 5).map((txn) => (
                          <tr key={txn._id} className="hover:bg-slate-800/40 transition">
                            <td className="py-2.5 px-3 font-mono text-slate-400">{txn.transactionId}</td>
                            <td className="py-2.5 px-3 font-medium text-white">{txn.user?.name || 'Customer'}</td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  txn.type === 'Deposit'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : txn.type === 'Withdrawal'
                                    ? 'bg-rose-500/20 text-rose-400'
                                    : 'bg-indigo-500/20 text-indigo-400'
                                }`}
                              >
                                {txn.type}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-200">${(txn.amount || 0).toLocaleString()}</td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  txn.status === 'Completed'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : txn.status === 'Pending'
                                    ? 'bg-amber-500/20 text-amber-400 animate-pulse'
                                    : 'bg-slate-700 text-slate-400'
                                }`}
                              >
                                {txn.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              {txn.status === 'Pending' ? (
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => handleUpdateTxnStatus(txn._id, 'Completed')}
                                    title="Approve Transaction"
                                    className="p-1 rounded bg-emerald-950 text-emerald-400 hover:bg-emerald-900 border border-emerald-800"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleUpdateTxnStatus(txn._id, 'Cancelled')}
                                    title="Reject Transaction"
                                    className="p-1 rounded bg-rose-950 text-rose-400 hover:bg-rose-900 border border-rose-800"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-500">Processed</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Active Catalog Overview */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-indigo-400" />
                      Published Investment Plans in Market
                    </h3>
                    <p className="text-xs text-slate-400">Available to customers on the frontend portal</p>
                  </div>
                  <button
                    onClick={() => setActiveSection('plans')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                  >
                    Manage Plans <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(dashboardData?.plansSummary || []).map((p) => (
                    <div key={p._id} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                          {p.category}
                        </span>
                        <span className="text-xs font-bold text-emerald-400">+{p.expectedReturn}% p.a.</span>
                      </div>
                      <h4 className="text-sm font-bold text-white truncate">{p.name}</h4>
                      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-700/50">
                        <span>Risk: {p.riskLevel}</span>
                        <span className="text-emerald-400 font-medium capitalize">{p.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 2. USERS MANAGEMENT */}
          {/* ======================================================== */}
          {activeSection === 'users' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Header & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2">
                  {['ALL', 'active', 'inactive', 'blocked'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setUserStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition ${
                        userStatusFilter === st
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {st === 'ALL' ? 'All Investors' : st}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filter by name, email, phone..."
                      value={globalSearch}
                      onChange={(e) => setGlobalSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{usersList.length} Investors</span>
                </div>
              </div>

              {/* Users Table */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Investor Name</th>
                        <th className="py-3 px-4">Contact</th>
                        <th className="py-3 px-4">Registration</th>
                        <th className="py-3 px-4">Total Invested</th>
                        <th className="py-3 px-4">Portfolio Value</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {usersList.map((user) => (
                        <tr key={user._id} className="hover:bg-slate-800/50 transition">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-xs">
                                {user.name?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <p className="font-semibold text-white">{user.name}</p>
                                <p className="text-[10px] text-slate-400">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">{user.phone}</td>
                          <td className="py-3 px-4 text-slate-400">
                            {new Date(user.registrationDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-200">
                            ${(user.totalInvestment || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 font-bold text-emerald-400">
                            ${(user.portfolioValue || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                                user.status === 'active'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : user.status === 'inactive'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              }`}
                            >
                              {user.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditUser(user)}
                                title="Real-Time Edit User Account"
                                className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-lg border border-amber-500/30 flex items-center gap-1 transition text-xs"
                              >
                                <Edit className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleViewUser(user._id)}
                                title="Inspect User Portfolio & Account"
                                className="px-2.5 py-1 bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 rounded-lg border border-indigo-800/50 flex items-center gap-1 transition"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Details</span>
                              </button>
                              <select
                                value={user.status}
                                onChange={(e) => handleUpdateUserStatus(user._id, e.target.value)}
                                className="bg-slate-800 text-[10px] text-slate-300 border border-slate-700 rounded-lg px-2 py-1 focus:outline-none"
                              >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="blocked">Blocked</option>
                              </select>
                              <button
                                onClick={() => handleDeleteUser(user._id, user.name)}
                                title="Delete User Account"
                                className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {usersList.length === 0 && (
                        <tr>
                          <td colSpan="7" className="py-8 text-center text-slate-500">
                            No investor profiles matching the criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 3. INVESTMENTS MANAGEMENT */}
          {/* ======================================================== */}
          {activeSection === 'investments' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Investments Header Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-xs text-slate-400 font-medium">Total Capital Deployed</span>
                  <p className="text-2xl font-black text-white mt-1">
                    ${investmentsList.reduce((s, i) => s + (i.amount || 0), 0).toLocaleString()}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">{investmentsList.length} active customer allocations</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-xs text-slate-400 font-medium">Current Portfolio AUM</span>
                  <p className="text-2xl font-black text-emerald-400 mt-1">
                    ${investmentsList.reduce((s, i) => s + (i.currentValue || i.amount || 0), 0).toLocaleString()}
                  </p>
                  <p className="text-[11px] text-emerald-500/80 mt-1">Real-time aggregate valuation</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-xs text-slate-400 font-medium">Net Return Generated</span>
                  <p className="text-2xl font-black text-teal-400 mt-1">
                    +${Math.max(
                      0,
                      investmentsList.reduce((s, i) => s + (i.currentValue || 0) - (i.amount || 0), 0)
                    ).toLocaleString()}
                  </p>
                  <p className="text-[11px] text-teal-500/80 mt-1">Distributed gains across all plans</p>
                </div>
              </div>

              {/* Table of All Investments */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    All Live Customer Investments
                  </h3>
                  <span className="text-xs text-slate-400">{investmentsList.length} records found</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Investor</th>
                        <th className="py-3 px-4">Investment Plan</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Capital Invested</th>
                        <th className="py-3 px-4">Current Value</th>
                        <th className="py-3 px-4">Total Return</th>
                        <th className="py-3 px-4">Start Date</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {investmentsList.map((inv) => (
                        <tr key={inv._id} className="hover:bg-slate-800/50 transition">
                          <td className="py-3 px-4">
                            <p className="font-semibold text-white">{inv.user?.name || 'Customer'}</p>
                            <p className="text-[10px] text-slate-400">{inv.user?.email}</p>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-200">{inv.plan?.name || 'Investment Plan'}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              {inv.plan?.category || 'Equity'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-200">${(inv.amount || 0).toLocaleString()}</td>
                          <td className="py-3 px-4 font-bold text-emerald-400">${(inv.currentValue || inv.amount || 0).toLocaleString()}</td>
                          <td className="py-3 px-4 text-teal-400 font-semibold">
                            +${(inv.returns || Math.max(0, (inv.currentValue || 0) - (inv.amount || 0))).toLocaleString()}
                            <span className="text-[10px] text-slate-400 ml-1">({inv.returnPercentage || 0}%)</span>
                          </td>
                          <td className="py-3 px-4 text-slate-400">{new Date(inv.startDate).toLocaleDateString()}</td>
                          <td className="py-3 px-4">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              {inv.status || 'Active'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {investmentsList.length === 0 && (
                        <tr>
                          <td colSpan="8" className="py-8 text-center text-slate-500">
                            No investment records found in the database.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 4. INVESTMENT PLANS MANAGEMENT */}
          {/* ======================================================== */}
          {activeSection === 'plans' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Header & Create Plan trigger */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-400" />
                    Investment Product Catalog
                  </h3>
                  <p className="text-xs text-slate-400">
                    Plans configured here are instantaneously available on the customer portal for investments
                  </p>
                </div>
                <button
                  onClick={() => handleOpenPlanModal()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Plan</span>
                </button>
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plansList.map((plan) => (
                  <div
                    key={plan._id}
                    className={`rounded-2xl bg-slate-900 border transition-all p-5 flex flex-col justify-between shadow-sm ${
                      plan.status === 'active' ? 'border-slate-800 hover:border-slate-700' : 'border-rose-900/40 bg-slate-900/60 opacity-75'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {plan.category}
                          </span>
                          {plan.featured && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Featured
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleTogglePlanStatus(plan._id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                            plan.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                          }`}
                        >
                          {plan.status === 'active' ? 'Active' : 'Inactive'}
                        </button>
                      </div>

                      {/* Title & Description */}
                      <h4 className="text-base font-bold text-white mb-1">{plan.name}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-4">{plan.description}</p>

                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 mb-4">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Expected Return</span>
                          <span className="text-base font-black text-emerald-400">+{plan.expectedReturn}% p.a.</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Min Investment</span>
                          <span className="text-sm font-bold text-slate-200">${(plan.minInvestment || 0).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Risk Profile</span>
                          <span className="text-xs font-semibold text-amber-400">{plan.riskLevel}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Lock-in / Duration</span>
                          <span className="text-xs font-semibold text-slate-300">{plan.durationMonths || 12} Months</span>
                        </div>
                      </div>

                      {/* Live DB Aggregates for this plan */}
                      <div className="flex items-center justify-between text-xs text-slate-400 px-1 py-1">
                        <span>Total Investors: <strong className="text-white">{plan.totalInvestorsCount ?? 0}</strong></span>
                        <span>Plan AUM: <strong className="text-emerald-400">${(plan.totalAUM ?? 0).toLocaleString()}</strong></span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2 mt-2">
                      <button
                        onClick={() => handleOpenPlanModal(plan)}
                        className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 border border-slate-700 transition"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit Plan</span>
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan._id, plan.name)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                        title="Delete / Archive Plan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 5. TRANSACTION MANAGEMENT */}
          {/* ======================================================== */}
          {activeSection === 'transactions' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Filter Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2">
                  {['ALL', 'Pending', 'Completed', 'Cancelled'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setTxnStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                        txnStatusFilter === st
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {st === 'ALL' ? 'All Status' : st}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={txnTypeFilter}
                    onChange={(e) => setTxnTypeFilter(e.target.value)}
                    className="bg-slate-800 text-xs text-slate-300 border border-slate-700 rounded-xl px-3 py-1.5 focus:outline-none"
                  >
                    <option value="ALL">All Types</option>
                    <option value="Deposit">Deposits</option>
                    <option value="Withdrawal">Withdrawals</option>
                    <option value="Investment">Investments</option>
                  </select>
                  <span className="text-xs text-slate-400 font-medium">{transactionsList.length} Transactions</span>
                </div>
              </div>

              {/* Transactions Ledger Table */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Transaction ID</th>
                        <th className="py-3 px-4">Investor</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Method</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Approval Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {transactionsList.map((txn) => (
                        <tr key={txn._id} className="hover:bg-slate-800/50 transition">
                          <td className="py-3 px-4 font-mono font-medium text-slate-300">{txn.transactionId}</td>
                          <td className="py-3 px-4">
                            <p className="font-semibold text-white">{txn.user?.name || 'Customer'}</p>
                            <p className="text-[10px] text-slate-400">{txn.user?.email}</p>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                txn.type === 'Deposit'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : txn.type === 'Withdrawal'
                                  ? 'bg-rose-500/20 text-rose-400'
                                  : 'bg-indigo-500/20 text-indigo-400'
                              }`}
                            >
                              {txn.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-200">${(txn.amount || 0).toLocaleString()}</td>
                          <td className="py-3 px-4 text-slate-400">{txn.paymentMethod || 'Bank Transfer'}</td>
                          <td className="py-3 px-4 text-slate-400">
                            {new Date(txn.createdAt).toLocaleDateString()} {new Date(txn.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                                txn.status === 'Completed'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : txn.status === 'Pending'
                                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse'
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              }`}
                            >
                              {txn.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {txn.status === 'Pending' ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleUpdateTxnStatus(txn._id, 'Completed')}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm transition"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() => handleUpdateTxnStatus(txn._id, 'Cancelled')}
                                  className="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-lg text-xs font-semibold flex items-center gap-1 border border-rose-800 transition"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Reject</span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-500">Processed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {transactionsList.length === 0 && (
                        <tr>
                          <td colSpan="8" className="py-8 text-center text-slate-500">
                            No transactions found matching the filter criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 6. ANALYTICS & CHARTS */}
          {/* ======================================================== */}
          {activeSection === 'analytics' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Range Filters */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-400" />
                  Portfolio & System Analytics Engine
                </h3>
                <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl">
                  {['7d', '30d', '3m', '6m', '1y'].map((rng) => (
                    <button
                      key={rng}
                      onClick={() => setAnalyticsRange(rng)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase transition ${
                        analyticsRange === rng ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {rng}
                    </button>
                  ))}
                </div>
              </div>

              {/* Real Chart Visualizations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Investment Growth Over Time */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">Investment Capital & AUM Growth</h4>
                      <p className="text-xs text-slate-400">Total Capital Deployed vs Real Valuation</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-indigo-400">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Invested
                      </span>
                      <span className="flex items-center gap-1 text-emerald-400">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Valuation
                      </span>
                    </div>
                  </div>

                  {/* Dynamic SVG Chart */}
                  <div className="h-64 flex items-end gap-2 pt-6 pb-2 px-2 border-b border-slate-800">
                    {(analyticsData?.investmentGrowth || []).map((pt, idx) => {
                      const maxVal = Math.max(...(analyticsData.investmentGrowth.map((p) => p.portfolioValue || 1)));
                      const heightPercent = maxVal > 0 ? (pt.portfolioValue / maxVal) * 85 : 10;
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative">
                          <div className="absolute -top-7 hidden group-hover:flex bg-slate-800 text-[10px] text-white px-2 py-0.5 rounded shadow z-10 whitespace-nowrap">
                            ${(pt.portfolioValue || 0).toLocaleString()}
                          </div>
                          <div className="w-full flex items-end gap-1 h-full justify-center">
                            <div
                              style={{ height: `${heightPercent}%` }}
                              className="w-1/2 bg-indigo-500/80 rounded-t group-hover:bg-indigo-400 transition-all"
                            />
                            <div
                              style={{ height: `${Math.min(100, heightPercent * 1.15)}%` }}
                              className="w-1/2 bg-emerald-500/80 rounded-t group-hover:bg-emerald-400 transition-all"
                            />
                          </div>
                          <span className="text-[10px] text-slate-500 truncate w-full text-center">{pt.date}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Portfolio Category Distribution */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <h4 className="text-sm font-bold text-white">Portfolio Distribution by Asset Class</h4>
                  <p className="text-xs text-slate-400">Breakdown of total AUM across market categories</p>

                  <div className="space-y-3 pt-2">
                    {(analyticsData?.portfolioDistribution || []).map((cat) => (
                      <div key={cat.category} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-200">{cat.category}</span>
                          <span className="text-slate-400 font-mono">
                            ${(cat.value || 0).toLocaleString()} ({cat.percentage}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            style={{
                              width: `${cat.percentage}%`,
                              backgroundColor: cat.color || '#6366f1'
                            }}
                            className="h-full rounded-full transition-all duration-500"
                          />
                        </div>
                      </div>
                    ))}
                    {(!analyticsData?.portfolioDistribution || analyticsData.portfolioDistribution.length === 0) && (
                      <p className="text-xs text-slate-500 py-6 text-center">No portfolio allocations to display.</p>
                    )}
                  </div>
                </div>

                {/* 3. Transaction Volume Breakdown */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <h4 className="text-sm font-bold text-white">Transaction Liquidity Breakdown</h4>
                  <p className="text-xs text-slate-400">Deposits, Direct Investments, and Withdrawals</p>

                  <div className="grid grid-cols-3 gap-3 pt-2">
                    {(analyticsData?.transactionActivity || []).map((act) => (
                      <div key={act.name} className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-1">
                        <span className="text-xs font-semibold" style={{ color: act.color }}>
                          {act.name}
                        </span>
                        <p className="text-lg font-black text-white">${(act.amount || 0).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. User Acquisition Growth */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <h4 className="text-sm font-bold text-white">Cumulative Investor Signups</h4>
                  <p className="text-xs text-slate-400">Total customer onboardings over period</p>

                  <div className="h-44 flex items-end gap-2 pt-6 pb-2 px-2 border-b border-slate-800">
                    {(analyticsData?.userGrowth || []).map((pt, idx) => {
                      const maxUsers = Math.max(...(analyticsData.userGrowth.map((p) => p.users || 1)));
                      const h = maxUsers > 0 ? (pt.users / maxUsers) * 80 : 10;
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative">
                          <div className="absolute -top-7 hidden group-hover:flex bg-slate-800 text-[10px] text-white px-2 py-0.5 rounded shadow z-10">
                            {pt.users} users
                          </div>
                          <div
                            style={{ height: `${h}%` }}
                            className="w-full bg-blue-500/80 rounded-t group-hover:bg-blue-400 transition-all"
                          />
                          <span className="text-[10px] text-slate-500 truncate w-full text-center">{pt.date}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 7. REPORTS & CSV EXPORT */}
          {/* ======================================================== */}
          {activeSection === 'reports' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Header with Type selector & CSV Export Button */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {[
                    { id: 'investments', label: 'Investments Report' },
                    { id: 'users', label: 'Investors Summary' },
                    { id: 'transactions', label: 'Transactions Ledger' }
                  ].map((rep) => (
                    <button
                      key={rep.id}
                      onClick={() => setReportType(rep.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                        reportType === rep.id ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {rep.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition self-start sm:self-auto"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Report (CSV)</span>
                </button>
              </div>

              {/* Report Preview Table */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white capitalize">{reportType} Audit Data Preview</h4>
                  <span className="text-xs text-slate-400">{reportsData.length} records ready for audit export</span>
                </div>
                <div className="overflow-x-auto max-h-[500px]">
                  {reportsData.length > 0 ? (
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-800/90 text-slate-400 uppercase text-[10px] sticky top-0">
                        <tr>
                          {Object.keys(reportsData[0]).map((col) => (
                            <th key={col} className="py-3 px-4 whitespace-nowrap">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {reportsData.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40 transition">
                            {Object.values(row).map((val, cellIdx) => (
                              <td key={cellIdx} className="py-2.5 px-4 whitespace-nowrap">
                                {typeof val === 'number' && colIsCurrency(Object.keys(row)[cellIdx])
                                  ? `$${val.toLocaleString()}`
                                  : String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="py-12 text-center text-slate-500 text-xs">No records available for this report type.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 8. NOTIFICATIONS & BROADCASTS */}
          {/* ======================================================== */}
          {activeSection === 'notifications' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Create Broadcast Announcement Form */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Send className="w-4 h-4 text-indigo-400" />
                      Send Customer Announcement or Direct Alert
                    </h3>
                    <p className="text-xs text-slate-400">
                      Sent notifications are pushed live to customer dashboards and alert badges
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSendNotification} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1">Notification Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Q4 Target Return Adjustment or System Maintenance"
                      value={notificationForm.title}
                      onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                    <select
                      value={notificationForm.type}
                      onChange={(e) => setNotificationForm({ ...notificationForm, type: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                    >
                      <option value="Announcement">Announcement (General)</option>
                      <option value="Alert">Alert (High Priority)</option>
                      <option value="Investment">Investment Update</option>
                      <option value="Transaction">Transaction Alert</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Recipient</label>
                    <select
                      value={notificationForm.recipientId}
                      onChange={(e) => setNotificationForm({ ...notificationForm, recipientId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                    >
                      <option value="">Broadcast to All Customers</option>
                      {usersList.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1">Message Content</label>
                    <textarea
                      rows={3}
                      placeholder="Detailed update or announcement for investors..."
                      value={notificationForm.message}
                      onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>

                  <div className="sm:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{actionLoading ? 'Dispatching...' : 'Dispatch Notification'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Notification Logs */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">Sent Announcements History</h4>
                  <span className="text-xs text-slate-400">{notificationsList.length} delivered</span>
                </div>
                <div className="divide-y divide-slate-800">
                  {notificationsList.map((n) => (
                    <div key={n._id} className="p-4 hover:bg-slate-800/40 transition flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                            {n.type}
                          </span>
                          <h5 className="text-sm font-bold text-white">{n.title}</h5>
                        </div>
                        <p className="text-xs text-slate-300">{n.message}</p>
                        <p className="text-[10px] text-slate-500">
                          To: {n.recipient ? n.recipient.name || n.recipient.email : 'All Customers (Broadcast)'} •{' '}
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-500 px-2 py-1 rounded bg-slate-800 shrink-0">
                        {n.read ? 'Read' : 'Delivered'}
                      </span>
                    </div>
                  ))}
                  {notificationsList.length === 0 && (
                    <div className="py-8 text-center text-slate-500 text-xs">No notifications recorded yet.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 9. SETTINGS & DIAGNOSTICS */}
          {/* ======================================================== */}
          {activeSection === 'settings' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Admin Profile Form */}
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Shield className="w-4 h-4 text-indigo-400" />
                      Administrator Credentials
                    </h3>
                    <p className="text-xs text-slate-400">Update system administrator credentials and access keys</p>
                  </div>

                  <form onSubmit={handleUpdateAdminProfile} className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Administrator Name</label>
                      <input
                        type="text"
                        value={adminProfileForm.name}
                        onChange={(e) => setAdminProfileForm({ ...adminProfileForm, name: e.target.value })}
                        required
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={adminProfileForm.email}
                        onChange={(e) => setAdminProfileForm({ ...adminProfileForm, email: e.target.value })}
                        required
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={adminProfileForm.phone}
                        onChange={(e) => setAdminProfileForm({ ...adminProfileForm, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">New Password (leave blank to keep current)</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={adminProfileForm.newPassword}
                        onChange={(e) => setAdminProfileForm({ ...adminProfileForm, newPassword: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition mt-2"
                    >
                      {actionLoading ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                  </form>
                </div>

                {/* MongoDB Diagnostics Panel */}
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Database className="w-4 h-4 text-emerald-400" />
                      Live Database & Cluster Diagnostics
                    </h3>
                    <p className="text-xs text-slate-400">Real-time health and environment telemetry</p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                      <span className="text-xs text-slate-400">MongoDB Connection</span>
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        {settingsData?.system?.databaseStatus || 'Connected'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                      <span className="text-xs text-slate-400">Database Name</span>
                      <span className="text-xs font-mono font-semibold text-slate-200">
                        {settingsData?.system?.dbName || 'investment_planner'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                      <span className="text-xs text-slate-400">Cluster Host</span>
                      <span className="text-xs font-mono text-slate-300">
                        {settingsData?.system?.dbHost || '127.0.0.1:27017'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                      <span className="text-xs text-slate-400">Node Runtime</span>
                      <span className="text-xs font-mono text-slate-300">{settingsData?.system?.nodeVersion || 'v20.x'}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                      <span className="text-xs text-slate-400">System Heap Memory</span>
                      <span className="text-xs font-semibold text-purple-400">
                        {settingsData?.system?.memoryUsageMB || 42} MB
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                      <span className="text-xs text-slate-400">Service Uptime</span>
                      <span className="text-xs font-semibold text-slate-300">
                        {Math.floor((settingsData?.system?.uptimeSeconds || 360) / 60)} minutes
                      </span>
                    </div>
                  </div>

                  {/* Seed Demo Button */}
                  <div className="pt-2">
                    <button
                      onClick={handleSeedDemoData}
                      disabled={actionLoading}
                      className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 flex items-center justify-center gap-2 transition"
                    >
                      <Database className="w-3.5 h-3.5" />
                      <span>Re-seed Demo Investors & Portfolios</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ======================================================== */}
      {/* MODAL: USER DETAILS & PORTFOLIO */}
      {/* ======================================================== */}
      {selectedUserModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-lg flex items-center justify-center">
                  {selectedUserModal.user.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedUserModal.user.name}</h3>
                  <p className="text-xs text-slate-400">
                    {selectedUserModal.user.email} • {selectedUserModal.user.phone || 'No phone'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserModal(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Portfolio Overview Numbers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[10px] text-slate-400">Total Invested</span>
                <p className="text-base font-bold text-white">
                  ${(selectedUserModal.portfolioSummary?.totalInvested || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[10px] text-slate-400">Portfolio Value</span>
                <p className="text-base font-bold text-emerald-400">
                  ${(selectedUserModal.portfolioSummary?.currentValue || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[10px] text-slate-400">Total Returns</span>
                <p className="text-base font-bold text-teal-400">
                  +${(selectedUserModal.portfolioSummary?.totalReturns || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[10px] text-slate-400">Wallet Balance</span>
                <p className="text-base font-bold text-purple-400">
                  ${(selectedUserModal.portfolioSummary?.walletBalance || 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* User Investments List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Active Customer Investments</h4>
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/80 text-slate-400 text-[10px]">
                    <tr>
                      <th className="py-2 px-3">Plan</th>
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3">Amount</th>
                      <th className="py-2 px-3">Value</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {(selectedUserModal.investments || []).map((inv) => (
                      <tr key={inv._id}>
                        <td className="py-2 px-3 font-semibold text-white">{inv.plan?.name || 'Investment Plan'}</td>
                        <td className="py-2 px-3 text-slate-400">{inv.plan?.category || 'Equity'}</td>
                        <td className="py-2 px-3 font-semibold text-slate-200">${(inv.amount || 0).toLocaleString()}</td>
                        <td className="py-2 px-3 font-bold text-emerald-400">${(inv.currentValue || inv.amount || 0).toLocaleString()}</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {(!selectedUserModal.investments || selectedUserModal.investments.length === 0) && (
                      <tr>
                        <td colSpan="5" className="py-4 text-center text-slate-500">
                          This investor has no active investments.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Status and Actions */}
            {/* Quick Status and Actions */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Update Status:</span>
                {['active', 'inactive', 'blocked'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateUserStatus(selectedUserModal.user._id, st)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition ${
                      selectedUserModal.user.status === st
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
                <button
                  onClick={() => handleOpenEditUser(selectedUserModal.user)}
                  className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ml-1"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              </div>

              <button
                onClick={() => handleDeleteUser(selectedUserModal.user._id, selectedUserModal.user.name)}
                className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-xl text-xs font-semibold border border-rose-800 transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: REAL-TIME USER UPDATE */}
      {/* ======================================================== */}
      {editingUserModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Real-Time User Update
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Live
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">Modify investor profile, credentials, and wallet balance</p>
                </div>
              </div>
              <button
                onClick={() => setEditingUserModal(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSaveUserUpdate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={userEditForm.name}
                    onChange={(e) => setUserEditForm({ ...userEditForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={userEditForm.email}
                    onChange={(e) => setUserEditForm({ ...userEditForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={userEditForm.phone}
                    onChange={(e) => setUserEditForm({ ...userEditForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Wallet Balance (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={userEditForm.walletBalance}
                    onChange={(e) => setUserEditForm({ ...userEditForm, walletBalance: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Account Role</label>
                  <select
                    value={userEditForm.role}
                    onChange={(e) => setUserEditForm({ ...userEditForm, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="customer">Customer / Investor</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Account Status</label>
                  <select
                    value={userEditForm.status}
                    onChange={(e) => setUserEditForm({ ...userEditForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="active">Active (Full Access)</option>
                    <option value="inactive">Inactive (Limited)</option>
                    <option value="blocked">Blocked / Suspended</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUserModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
                >
                  {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save Real-Time</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CREATE / EDIT INVESTMENT PLAN */}
      {/* ======================================================== */}
      {planModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingPlan ? 'Edit Investment Plan' : 'Create New Investment Plan'}
                </h3>
                <p className="text-xs text-slate-400">
                  Configured parameters will be published directly to the Customer Portal
                </p>
              </div>
              <button
                onClick={() => setPlanModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Plan Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Blue-Chip Equity Alpha, Global Balanced Debt"
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={planForm.category}
                    onChange={(e) => setPlanForm({ ...planForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="Equity">Equity (Shares/Index)</option>
                    <option value="Debt">Debt (Bonds/Fixed)</option>
                    <option value="Hybrid">Hybrid (Balanced)</option>
                    <option value="High Growth">High Growth (Aggressive)</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Commodities">Commodities / Gold</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Risk Profile</label>
                  <select
                    value={planForm.riskLevel}
                    onChange={(e) => setPlanForm({ ...planForm, riskLevel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="Low">Low Risk</option>
                    <option value="Moderate">Moderate Risk</option>
                    <option value="High">High Risk</option>
                    <option value="Very High">Very High Risk</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Return (% p.a.) *</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="14.5"
                    value={planForm.expectedReturn}
                    onChange={(e) => setPlanForm({ ...planForm, expectedReturn: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Min Investment ($) *</label>
                  <input
                    type="number"
                    placeholder="1000"
                    value={planForm.minInvestment}
                    onChange={(e) => setPlanForm({ ...planForm, minInvestment: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Duration (Months)</label>
                  <input
                    type="number"
                    placeholder="12"
                    value={planForm.durationMonths}
                    onChange={(e) => setPlanForm({ ...planForm, durationMonths: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Plan Description</label>
                <textarea
                  rows={3}
                  placeholder="Detail the strategy, benchmark, and investment thesis..."
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={planForm.featured}
                    onChange={(e) => setPlanForm({ ...planForm, featured: e.target.checked })}
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <span>Mark as Featured Plan</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={planForm.status === 'active'}
                    onChange={(e) => setPlanForm({ ...planForm, status: e.target.checked ? 'active' : 'inactive' })}
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <span>Active & Open for Investment</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPlanModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition"
                >
                  {actionLoading ? 'Saving...' : editingPlan ? 'Update Plan' : 'Publish Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to determine if a report column represents currency
function colIsCurrency(colName) {
  if (!colName) return false;
  const name = colName.toLowerCase();
  return (
    name.includes('invested') ||
    name.includes('value') ||
    name.includes('amount') ||
    name.includes('returns') ||
    name.includes('capital')
  );
}
