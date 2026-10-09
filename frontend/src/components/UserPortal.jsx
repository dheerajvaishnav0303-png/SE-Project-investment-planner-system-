import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  LayoutDashboard,
  PieChart,
  TrendingUp,
  Target,
  Clock,
  Calculator,
  ArrowLeftRight,
  Sparkles,
  Bell,
  User,
  Settings,
  LogOut,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  DollarSign,
  Wallet,
  Shield,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Edit,
  Eye,
  Check,
  X,
  ChevronRight,
  Menu,
  Sliders,
  Award,
  Layers,
  Percent,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import api from '../api/apiClient';

export default function UserPortal({ currentUser, onLogout, onSwitchToAdminView }) {
  // Navigation State
  const [activeSection, setActiveSection] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Core Data States (strictly for authenticated user)
  const [summary, setSummary] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [goals, setGoals] = useState([]);
  const [sips, setSips] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [profileData, setProfileData] = useState(null);

  // Filters & Search
  const [investmentSearch, setInvestmentSearch] = useState('');
  const [investmentTypeFilter, setInvestmentTypeFilter] = useState('ALL');
  const [investmentSort, setInvestmentSort] = useState('-createdAt');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState('ALL');

  // Modals
  const [investmentModalOpen, setInvestmentModalOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [deleteAccountModalOpen, setDeleteAccountModalOpen] = useState(false);

  // Form States
  const [investmentForm, setInvestmentForm] = useState({
    name: '',
    investmentType: 'Mutual Funds',
    amount: '',
    currentValue: '',
    units: '',
    expectedReturn: '12',
    startDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [goalForm, setGoalForm] = useState({
    title: '',
    category: 'Custom Goal',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    priority: 'Medium',
    expectedAnnualReturn: '8'
  });

  const [sipForm, setSipForm] = useState({
    name: '',
    investmentType: 'Mutual Funds',
    monthlyAmount: '5000',
    durationYears: '5',
    expectedReturn: '12',
    initialInvestment: '0',
    notes: ''
  });

  const [depositForm, setDepositForm] = useState({ amount: '', paymentMethod: 'UPI / Net Banking', description: 'Wallet Deposit' });
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', paymentMethod: 'Bank Wire', description: 'Wallet Withdrawal' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  // User Profile Form
  const [userProfileForm, setUserProfileForm] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    dateOfBirth: '',
    currency: currentUser?.currency || '₹',
    monthlyIncome: 0,
    monthlyExpenses: 0,
    monthlySavings: 0,
    riskPreference: 'Moderate',
    horizonYears: 10
  });

  // Financial Calculators State
  const [activeCalculator, setActiveCalculator] = useState('sip'); // sip | lumpsum | compound | goal | loan
  const [calcInputs, setCalcInputs] = useState({
    sipMonthly: 5000,
    sipYears: 10,
    sipRate: 12,
    lumpSumAmount: 50000,
    lumpSumYears: 5,
    lumpSumRate: 12,
    ciPrincipal: 100000,
    ciRate: 8,
    ciYears: 5,
    ciFrequency: 12,
    goalTarget: 1000000,
    goalYears: 7,
    goalRate: 10,
    loanPrincipal: 500000,
    loanRate: 9.5,
    loanTenureMonths: 60
  });

  const currency = userProfileForm.currency || currentUser?.currency || summary?.currency || '₹';

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch all user data strictly for the logged-in user
  const loadUserData = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, invRes, goalRes, sipRes, txnRes, notifRes, profRes] = await Promise.all([
        api.getSummary().catch(() => ({ success: false })),
        api.getInvestments({ search: investmentSearch, type: investmentTypeFilter, sort: investmentSort }).catch(() => ({ success: false })),
        api.getGoals().catch(() => ({ success: false })),
        api.getSIPs().catch(() => ({ success: false })),
        api.getTransactions({ type: transactionTypeFilter }).catch(() => ({ success: false })),
        api.getNotifications().catch(() => ({ success: false })),
        api.getUserProfile().catch(() => ({ success: false }))
      ]);

      if (sumRes.success) setSummary(sumRes.data);
      if (invRes.success) setInvestments(invRes.data || []);
      if (goalRes.success) setGoals(goalRes.data || []);
      if (sipRes.success) setSips(sipRes.data || []);
      if (txnRes.success) setTransactions(txnRes.data || []);
      if (notifRes.success) {
        setNotifications(notifRes.data || []);
        setUnreadNotifCount(notifRes.unreadCount || 0);
      }
      if (profRes.success && profRes.data) {
        setProfileData(profRes.data);
        setUserProfileForm({
          name: profRes.data.name || '',
          phone: profRes.data.phone || '',
          dateOfBirth: profRes.data.dateOfBirth ? profRes.data.dateOfBirth.split('T')[0] : '',
          currency: profRes.data.currency || '₹',
          monthlyIncome: profRes.data.financialProfile?.income?.primaryMonthly || 0,
          monthlyExpenses: profRes.data.financialProfile?.calculatedMetrics?.totalMonthlyExpenses || 0,
          monthlySavings: profRes.data.financialProfile?.calculatedMetrics?.monthlySavings || 0,
          riskPreference: profRes.data.riskProfile?.tolerance || 'Moderate',
          horizonYears: profRes.data.riskProfile?.horizonYears || 10
        });
      }
    } catch (err) {
      console.error('Failed to load user data:', err);
      showToast('error', err.message || 'Failed to sync your portfolio records');
    } finally {
      setLoading(false);
    }
  }, [investmentSearch, investmentTypeFilter, investmentSort, transactionTypeFilter]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Dynamic greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // --- INVESTMENT ACTIONS ---
  const handleOpenAddInvestment = () => {
    setEditingInvestment(null);
    setInvestmentForm({
      name: '',
      investmentType: 'Mutual Funds',
      amount: '',
      currentValue: '',
      units: '',
      expectedReturn: '12',
      startDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setInvestmentModalOpen(true);
  };

  const handleOpenEditInvestment = (inv) => {
    setEditingInvestment(inv);
    setInvestmentForm({
      name: inv.name,
      investmentType: inv.investmentType || 'Mutual Funds',
      amount: String(inv.amount),
      currentValue: String(inv.currentValue || inv.amount),
      units: String(inv.units || ''),
      expectedReturn: String(inv.expectedReturn || 12),
      startDate: inv.startDate ? new Date(inv.startDate).toISOString().split('T')[0] : '',
      notes: inv.notes || ''
    });
    setInvestmentModalOpen(true);
  };

  const handleSaveInvestment = async (e) => {
    e.preventDefault();
    if (!investmentForm.name || !investmentForm.amount) {
      showToast('error', 'Please provide an investment name and invested amount');
      return;
    }

    setActionLoading(true);
    try {
      if (editingInvestment) {
        const res = await api.updateInvestment(editingInvestment._id, investmentForm);
        if (res.success) {
          showToast('success', `Investment "${investmentForm.name}" updated successfully!`);
        }
      } else {
        const res = await api.createInvestment(investmentForm);
        if (res.success) {
          showToast('success', `Investment "${investmentForm.name}" added to your portfolio!`);
        }
      }
      setInvestmentModalOpen(false);
      loadUserData();
    } catch (err) {
      showToast('error', err.message || 'Failed to save investment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteInvestment = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from your portfolio?`)) return;
    try {
      const res = await api.deleteInvestment(id);
      if (res.success) {
        showToast('success', `Investment "${name}" deleted`);
        loadUserData();
      }
    } catch (err) {
      showToast('error', err.message || 'Failed to delete investment');
    }
  };

  // --- GOAL ACTIONS ---
  const handleOpenAddGoal = () => {
    setEditingGoal(null);
    setGoalForm({
      title: '',
      category: 'Custom Goal',
      targetAmount: '',
      currentAmount: '',
      targetDate: '',
      priority: 'Medium',
      expectedAnnualReturn: '8'
    });
    setGoalModalOpen(true);
  };

  const handleOpenEditGoal = (goal) => {
    setEditingGoal(goal);
    setGoalForm({
      title: goal.title,
      category: goal.category || 'Custom Goal',
      targetAmount: String(goal.targetAmount),
      currentAmount: String(goal.currentAmount || 0),
      targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '',
      priority: goal.priority || 'Medium',
      expectedAnnualReturn: String(goal.expectedAnnualReturn || 8)
    });
    setGoalModalOpen(true);
  };

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    if (!goalForm.title || !goalForm.targetAmount || !goalForm.targetDate) {
      showToast('error', 'Please provide goal title, target amount, and target date');
      return;
    }

    setActionLoading(true);
    try {
      if (editingGoal) {
        const res = await api.updateGoal(editingGoal._id, goalForm);
        if (res.success) {
          showToast('success', `Goal "${goalForm.title}" updated!`);
        }
      } else {
        const res = await api.createGoal(goalForm);
        if (res.success) {
          showToast('success', `Goal "${goalForm.title}" created successfully!`);
        }
      }
      setGoalModalOpen(false);
      loadUserData();
    } catch (err) {
      showToast('error', err.message || 'Failed to save goal');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteGoal = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete goal "${title}"?`)) return;
    try {
      const res = await api.deleteGoal(id);
      if (res.success) {
        showToast('success', `Goal "${title}" deleted`);
        loadUserData();
      }
    } catch (err) {
      showToast('error', err.message || 'Failed to delete goal');
    }
  };

  // --- SIP ACTIONS ---
  const handleSaveSIPPlan = async (e) => {
    e.preventDefault();
    if (!sipForm.name || !sipForm.monthlyAmount) {
      showToast('error', 'Please enter a SIP plan name and monthly commitment amount');
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.createSIP(sipForm);
      if (res.success) {
        showToast('success', `SIP plan "${sipForm.name}" activated!`);
        setSipForm({
          name: '',
          investmentType: 'Mutual Funds',
          monthlyAmount: '5000',
          durationYears: '5',
          expectedReturn: '12',
          initialInvestment: '0',
          notes: ''
        });
        loadUserData();
      }
    } catch (err) {
      showToast('error', err.message || 'Failed to activate SIP plan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleSIPStatus = async (sip) => {
    const newStatus = sip.status === 'Active' ? 'Paused' : 'Active';
    try {
      const res = await api.updateSIP(sip._id, { status: newStatus });
      if (res.success) {
        showToast('success', `SIP plan status set to ${newStatus}`);
        loadUserData();
      }
    } catch (err) {
      showToast('error', err.message || 'Failed to update SIP status');
    }
  };

  const handleDeleteSIP = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete SIP plan "${name}"?`)) return;
    try {
      const res = await api.deleteSIP(id);
      if (res.success) {
        showToast('success', `SIP plan "${name}" deleted`);
        loadUserData();
      }
    } catch (err) {
      showToast('error', err.message || 'Failed to delete SIP');
    }
  };

  // --- WALLET & TRANSACTION ACTIONS ---
  const handleDeposit = async (e) => {
    e.preventDefault();
    const amount = Number(depositForm.amount);
    if (!amount || amount <= 0) {
      showToast('error', 'Please enter a valid deposit amount');
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.createTransaction({
        type: 'Deposit',
        amount,
        paymentMethod: depositForm.paymentMethod,
        description: depositForm.description
      });
      if (res.success) {
        showToast('success', `${currency}${amount.toLocaleString()} added to your wallet!`);
        setDepositModalOpen(false);
        setDepositForm({ amount: '', paymentMethod: 'UPI / Net Banking', description: 'Wallet Deposit' });
        loadUserData();
      }
    } catch (err) {
      showToast('error', err.message || 'Deposit failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amount = Number(withdrawForm.amount);
    const balance = profileData?.walletBalance || 0;
    if (!amount || amount <= 0) {
      showToast('error', 'Please enter a valid withdrawal amount');
      return;
    }
    if (amount > balance) {
      showToast('error', `Insufficient wallet balance (${currency}${balance.toLocaleString()})`);
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.createTransaction({
        type: 'Withdrawal',
        amount,
        paymentMethod: withdrawForm.paymentMethod,
        description: withdrawForm.description
      });
      if (res.success) {
        showToast('success', 'Withdrawal request queued for processing!');
        setWithdrawModalOpen(false);
        setWithdrawForm({ amount: '', paymentMethod: 'Bank Wire', description: 'Wallet Withdrawal' });
        loadUserData();
      }
    } catch (err) {
      showToast('error', err.message || 'Withdrawal request failed');
    } finally {
      setActionLoading(false);
    }
  };

  // --- NOTIFICATION ACTIONS ---
  const handleMarkNotificationRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
      setUnreadNotifCount((c) => Math.max(0, c - 1));
    } catch {
      // silent
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadNotifCount(0);
      showToast('success', 'All notifications marked as read');
    } catch {
      // silent
    }
  };

  // --- PROFILE & ACCOUNT ACTIONS ---
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.updateUserProfile({
        name: userProfileForm.name,
        phone: userProfileForm.phone,
        dateOfBirth: userProfileForm.dateOfBirth,
        currency: userProfileForm.currency,
        riskProfile: {
          tolerance: userProfileForm.riskPreference,
          horizonYears: Number(userProfileForm.horizonYears)
        }
      });

      // Also update financial profile budget
      await api.updateProfile({
        income: { primaryMonthly: Number(userProfileForm.monthlyIncome) },
        expenses: { housing: Number(userProfileForm.monthlyExpenses) },
        currency: userProfileForm.currency
      });

      if (res.success) {
        showToast('success', 'Profile and preferences updated successfully!');
        loadUserData();
      }
    } catch (err) {
      showToast('error', err.message || 'Failed to update profile');
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('error', 'New passwords do not match');
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      if (res.success) {
        showToast('success', 'Password changed successfully!');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      showToast('error', err.message || 'Failed to change password');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setActionLoading(true);
    try {
      await api.deleteAccount();
      alert('Your account has been deleted permanently. You will now be logged out.');
      onLogout();
    } catch (err) {
      showToast('error', err.message || 'Failed to delete account');
      setActionLoading(false);
    }
  };

  // --- CALCULATOR CALCULATIONS ---
  const calcResults = useMemo(() => {
    // 1. SIP
    const sipPmt = Number(calcInputs.sipMonthly) || 0;
    const sipN = (Number(calcInputs.sipYears) || 0) * 12;
    const sipR = (Number(calcInputs.sipRate) || 0) / 100 / 12;
    const sipInvested = sipPmt * sipN;
    let sipFV = 0;
    if (sipR > 0) {
      sipFV = Math.round(sipPmt * ((Math.pow(1 + sipR, sipN) - 1) / sipR) * (1 + sipR));
    } else {
      sipFV = sipInvested;
    }
    const sipGains = Math.max(0, sipFV - sipInvested);

    // 2. Lump Sum
    const lsP = Number(calcInputs.lumpSumAmount) || 0;
    const lsY = Number(calcInputs.lumpSumYears) || 0;
    const lsR = (Number(calcInputs.lumpSumRate) || 0) / 100;
    const lsFV = Math.round(lsP * Math.pow(1 + lsR, lsY));
    const lsGains = Math.max(0, lsFV - lsP);

    // 3. Compound Interest
    const ciP = Number(calcInputs.ciPrincipal) || 0;
    const ciR = (Number(calcInputs.ciRate) || 0) / 100;
    const ciY = Number(calcInputs.ciYears) || 0;
    const ciF = Number(calcInputs.ciFrequency) || 12;
    const ciFV = Math.round(ciP * Math.pow(1 + ciR / ciF, ciF * ciY));
    const ciInterest = Math.max(0, ciFV - ciP);

    // 4. Goal Target Calculator
    const gTarget = Number(calcInputs.goalTarget) || 0;
    const gYears = Number(calcInputs.goalYears) || 1;
    const gN = gYears * 12;
    const gR = (Number(calcInputs.goalRate) || 0) / 100 / 12;
    let gMonthlyReq = 0;
    if (gR > 0) {
      const factor = (Math.pow(1 + gR, gN) - 1) / gR;
      gMonthlyReq = Math.round(gTarget / (factor * (1 + gR)));
    } else {
      gMonthlyReq = Math.round(gTarget / gN);
    }

    // 5. Loan / EMI
    const lP = Number(calcInputs.loanPrincipal) || 0;
    const lR = (Number(calcInputs.loanRate) || 0) / 100 / 12;
    const lN = Number(calcInputs.loanTenureMonths) || 1;
    let emi = 0;
    if (lR > 0) {
      emi = Math.round((lP * lR * Math.pow(1 + lR, lN)) / (Math.pow(1 + lR, lN) - 1));
    } else {
      emi = Math.round(lP / lN);
    }
    const loanTotalPayable = emi * lN;
    const loanTotalInterest = Math.max(0, loanTotalPayable - lP);

    return {
      sipInvested,
      sipFV,
      sipGains,
      lsFV,
      lsGains,
      ciFV,
      ciInterest,
      gMonthlyReq,
      emi,
      loanTotalPayable,
      loanTotalInterest
    };
  }, [calcInputs]);

  // Derived user statistics from backend summary
  const port = summary?.portfolioOverview || {};
  const totalInvested = port.totalInvested || 0;
  const currentValue = port.currentValue || 0;
  const totalProfitLoss = port.totalProfitLoss || 0;
  const returnPercentage = port.returnPercentage || 0;
  const monthlyInvestment = port.monthlyInvestment || 0;
  const numberOfInvestments = port.numberOfInvestments || 0;

  const isNewUser = investments.length === 0 && goals.length === 0 && sips.length === 0;

  // Sidebar Menu Items
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'portfolio', label: 'My Portfolio', icon: PieChart },
    { id: 'investments', label: 'Investments', icon: TrendingUp, badge: investments.length },
    { id: 'goals', label: 'Financial Goals', icon: Target, badge: goals.length },
    { id: 'sips', label: 'SIP Planner', icon: Clock, badge: sips.length },
    { id: 'calculators', label: 'Calculators', icon: Calculator },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight, badge: transactions.length },
    { id: 'insights', label: 'Insights', icon: Sparkles },
    { id: 'notifications', label: 'Notifications', icon: Bell, alertCount: unreadNotifCount },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-hidden selection:bg-emerald-500 selection:text-slate-950">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md transition-all animate-bounce ${
            toast.type === 'error'
              ? 'bg-rose-950/90 border-rose-800 text-rose-200'
              : 'bg-emerald-950/90 border-emerald-800 text-emerald-200'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5 text-rose-400" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 transition-transform duration-300 md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              {currency}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-base tracking-tight">InvestPlan</span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  User
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Personal Wealth Suite</p>
            </div>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.alertCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950">
                    {item.alertCount}
                  </span>
                )}
                {!item.alertCount && item.badge !== undefined && item.badge > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-md ${isActive ? 'bg-emerald-500/30 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom User Card & Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2 bg-slate-900/50">
          {onSwitchToAdminView && (
            <button
              onClick={onSwitchToAdminView}
              className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-800/50 flex items-center justify-center gap-2 transition"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Return to Admin Console</span>
            </button>
          )}

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{currentUser?.name || 'Investor'}</p>
                <p className="text-[10px] text-slate-400 truncate">{currentUser?.email}</p>
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

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOP NAVBAR */}
        <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                {greeting}, {currentUser?.name || 'Investor'} 👋
              </h2>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Secure isolated portfolio environment • Account ID: {currentUser?._id ? `...${currentUser._id.slice(-6)}` : 'Active'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Wallet pill */}
            <div
              onClick={() => setDepositModalOpen(true)}
              className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-slate-600 text-xs transition"
              title="Click to Deposit Funds"
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400 hidden sm:inline">Wallet:</span>
              <span className="font-bold text-white">
                {currency}{(profileData?.walletBalance || currentUser?.walletBalance || 0).toLocaleString()}
              </span>
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => setActiveSection('notifications')}
              className="relative p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-700 transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center justify-center animate-pulse">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Refresh Button */}
            <button
              onClick={loadUserData}
              disabled={loading}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-700 transition"
              title="Sync Portfolio Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            {/* Add Investment CTA */}
            <button
              onClick={handleOpenAddInvestment}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="hidden sm:inline">Add Investment</span>
            </button>
          </div>
        </header>

        {/* DYNAMIC VIEW ROUTER */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950">
          {/* ======================================================== */}
          {/* 1. DASHBOARD VIEW */}
          {/* ======================================================== */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* 6 Key Portfolio KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
                {/* 1. Total Invested */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                  <span className="text-[11px] font-medium text-slate-400 block mb-1">Total Invested</span>
                  <p className="text-xl sm:text-2xl font-black text-white">
                    {currency}{totalInvested.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">Principal capital</p>
                </div>

                {/* 2. Current Value */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                  <span className="text-[11px] font-medium text-slate-400 block mb-1">Current Value</span>
                  <p className="text-xl sm:text-2xl font-black text-emerald-400">
                    {currency}{currentValue.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-emerald-500/80 mt-1 flex items-center gap-0.5">
                    <ArrowUpRight className="w-3 h-3" /> Live valuation
                  </p>
                </div>

                {/* 3. Total Profit / Loss */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                  <span className="text-[11px] font-medium text-slate-400 block mb-1">Total Profit/Loss</span>
                  <p className={`text-xl sm:text-2xl font-black ${totalProfitLoss >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
                    {totalProfitLoss >= 0 ? '+' : ''}{currency}{totalProfitLoss.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">Net capital returns</p>
                </div>

                {/* 4. Overall Return % */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                  <span className="text-[11px] font-medium text-slate-400 block mb-1">Overall Return</span>
                  <p className={`text-xl sm:text-2xl font-black ${returnPercentage >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {returnPercentage >= 0 ? '+' : ''}{returnPercentage}%
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">Portfolio yield</p>
                </div>

                {/* 5. Monthly Investment */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                  <span className="text-[11px] font-medium text-slate-400 block mb-1">Monthly Investment</span>
                  <p className="text-xl sm:text-2xl font-black text-purple-400">
                    {currency}{monthlyInvestment.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-purple-400/80 mt-1">Active SIP deployment</p>
                </div>

                {/* 6. Number of Investments */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                  <span className="text-[11px] font-medium text-slate-400 block mb-1">Allocations</span>
                  <p className="text-xl sm:text-2xl font-black text-white">{numberOfInvestments}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{sips.length} active SIPs</p>
                </div>
              </div>

              {/* Empty State Banner if completely new user */}
              {isNewUser && (
                <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-indigo-950/30 border border-emerald-900/40 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">Welcome to your Investment Planner!</h3>
                    <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto mt-1">
                      Your portfolio is currently empty and ready for deployment. Your data is 100% private and isolated to your account.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={handleOpenAddInvestment}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>Add Investment</span>
                    </button>
                    <button
                      onClick={handleOpenAddGoal}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-2 transition"
                    >
                      <Target className="w-4 h-4 text-emerald-400" />
                      <span>Create Financial Goal</span>
                    </button>
                    <button
                      onClick={() => setActiveSection('sips')}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-2 transition"
                    >
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span>Start SIP Plan</span>
                    </button>
                    <button
                      onClick={() => setActiveSection('calculators')}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-2 transition"
                    >
                      <Calculator className="w-4 h-4 text-indigo-400" />
                      <span>Explore Calculators</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Chart & Asset Allocation Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Performance Chart */}
                <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        Portfolio Performance Over Time
                      </h3>
                      <p className="text-xs text-slate-400">Total Capital Invested vs Real Market Value</p>
                    </div>
                    {investments.length > 0 && (
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 text-slate-400">
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-600" /> Invested
                        </span>
                        <span className="flex items-center gap-1 text-emerald-400">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Current Value
                        </span>
                      </div>
                    )}
                  </div>

                  {/* SVG Chart or Empty State */}
                  {summary?.performanceChart && summary.performanceChart.length > 0 ? (
                    <div className="h-56 flex items-end gap-3 pt-6 pb-2 px-2 border-b border-slate-800">
                      {summary.performanceChart.map((pt, idx) => {
                        const maxVal = Math.max(...summary.performanceChart.map((p) => p.value || 1));
                        const hInvested = maxVal > 0 ? (pt.invested / maxVal) * 80 : 10;
                        const hValue = maxVal > 0 ? (pt.value / maxVal) * 80 : 10;
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative">
                            <div className="absolute -top-7 hidden group-hover:flex bg-slate-800 text-[10px] text-white px-2 py-0.5 rounded shadow z-10 whitespace-nowrap">
                              {currency}{pt.value.toLocaleString()}
                            </div>
                            <div className="w-full flex items-end gap-1 h-full justify-center">
                              <div
                                style={{ height: `${hInvested}%` }}
                                className="w-1/2 bg-slate-600 rounded-t group-hover:bg-slate-500 transition-all"
                              />
                              <div
                                style={{ height: `${hValue}%` }}
                                className="w-1/2 bg-emerald-500 rounded-t group-hover:bg-emerald-400 transition-all"
                              />
                            </div>
                            <span className="text-[10px] text-slate-500 truncate w-full text-center">{pt.date}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-56 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-xl">
                      <TrendingUp className="w-8 h-8 text-slate-600 mb-2" />
                      <p className="text-xs font-semibold text-slate-400">No portfolio timeline data yet</p>
                      <p className="text-[11px] text-slate-500 max-w-xs mt-0.5">
                        Performance charts will populate dynamically as you record investments and track valuation growth.
                      </p>
                    </div>
                  )}
                </div>

                {/* Asset Allocation */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-purple-400" />
                      Asset Allocation
                    </h3>
                    <p className="text-xs text-slate-400">Calculated strictly from your investments</p>
                  </div>

                  <div className="space-y-3 pt-2">
                    {(summary?.assetAllocation || []).map((cat) => {
                      const colors = {
                        'Mutual Funds': 'bg-emerald-500',
                        'Stocks': 'bg-blue-500',
                        'Fixed Deposits': 'bg-amber-500',
                        'Gold': 'bg-yellow-500',
                        'Other': 'bg-purple-500'
                      };
                      return (
                        <div key={cat.name} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-slate-200">{cat.name}</span>
                            <span className="text-slate-400 font-mono">
                              {currency}{cat.value.toLocaleString()} ({cat.percentage}%)
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              style={{ width: `${cat.percentage}%` }}
                              className={`h-full rounded-full ${colors[cat.name] || 'bg-emerald-500'} transition-all`}
                            />
                          </div>
                        </div>
                      );
                    })}
                    {investments.length === 0 && (
                      <div className="py-8 text-center text-slate-500 text-xs">
                        No asset distribution yet. Add your first investment to calculate allocation.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Investments & Goals Widgets */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Investments */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white">Recent Investments</h3>
                    <button
                      onClick={() => setActiveSection('investments')}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                    >
                      View All <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="divide-y divide-slate-800">
                    {investments.slice(0, 4).map((inv) => (
                      <div key={inv._id} className="py-2.5 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white">{inv.name}</p>
                          <span className="text-[10px] text-slate-400">{inv.investmentType}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-emerald-400">{currency}{(inv.currentValue || inv.amount).toLocaleString()}</p>
                          <p className="text-[10px] text-slate-500">Inv: {currency}{inv.amount.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                    {investments.length === 0 && (
                      <p className="py-6 text-center text-xs text-slate-500">No investments added yet.</p>
                    )}
                  </div>
                </div>

                {/* Financial Goals Progress */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white">Financial Goals Progress</h3>
                    <button
                      onClick={() => setActiveSection('goals')}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                    >
                      View All <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {goals.slice(0, 3).map((g) => (
                      <div key={g._id} className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-white">{g.title}</span>
                          <span className="font-bold text-emerald-400">{g.progressPercentage || 0}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-700 overflow-hidden">
                          <div
                            style={{ width: `${Math.min(100, g.progressPercentage || 0)}%` }}
                            className="h-full bg-emerald-500 rounded-full"
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>{currency}{(g.currentAmount || 0).toLocaleString()} saved</span>
                          <span>Target: {currency}{g.targetAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                    {goals.length === 0 && (
                      <p className="py-6 text-center text-xs text-slate-500">No financial goals set yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 2. MY PORTFOLIO VIEW */}
          {/* ======================================================== */}
          {activeSection === 'portfolio' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Header & Wallet Operations */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border border-emerald-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Portfolio Asset Breakdown</h3>
                  <p className="text-xs text-slate-400 mt-1">Complete aggregate valuation and liquid capital reserves</p>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setDepositModalOpen(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Deposit Funds</span>
                  </button>
                  <button
                    onClick={() => setWithdrawModalOpen(true)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
                  >
                    <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
                    <span>Withdraw</span>
                  </button>
                </div>
              </div>

              {/* Holdings Table */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">Holdings & Deployed Capital</h4>
                  <span className="text-xs text-slate-400">{investments.length} total assets</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Asset Name</th>
                        <th className="py-3 px-4">Asset Class</th>
                        <th className="py-3 px-4">Invested Capital</th>
                        <th className="py-3 px-4">Current Valuation</th>
                        <th className="py-3 px-4">Profit/Loss</th>
                        <th className="py-3 px-4">Target Return</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {investments.map((inv) => {
                        const gain = (inv.currentValue || inv.amount) - inv.amount;
                        return (
                          <tr key={inv._id} className="hover:bg-slate-800/50 transition">
                            <td className="py-3 px-4 font-semibold text-white">{inv.name}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                                {inv.investmentType || 'Mutual Funds'}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-200">
                              {currency}{inv.amount.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 font-bold text-emerald-400">
                              {currency}{(inv.currentValue || inv.amount).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 font-semibold">
                              <span className={gain >= 0 ? 'text-teal-400' : 'text-rose-400'}>
                                {gain >= 0 ? '+' : ''}{currency}{gain.toLocaleString()}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-400">{inv.expectedReturn || 10}% p.a.</td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleOpenEditInvestment(inv)}
                                className="p-1 text-slate-400 hover:text-white mr-1"
                                title="Edit Investment"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteInvestment(inv._id, inv.name)}
                                className="p-1 text-slate-400 hover:text-rose-400"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {investments.length === 0 && (
                        <tr>
                          <td colSpan="7" className="py-8 text-center text-slate-500">
                            Your portfolio is currently empty. Click "Add Investment" to record your assets.
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
          {/* 3. MY INVESTMENTS VIEW */}
          {/* ======================================================== */}
          {activeSection === 'investments' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Header & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                  {['ALL', 'Mutual Funds', 'Stocks', 'Fixed Deposits', 'Gold', 'Real Estate', 'Crypto'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setInvestmentTypeFilter(t)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        investmentTypeFilter === t
                          ? 'bg-emerald-500 text-slate-950 shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search investments..."
                      value={investmentSearch}
                      onChange={(e) => setInvestmentSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <button
                    onClick={handleOpenAddInvestment}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Add New</span>
                  </button>
                </div>
              </div>

              {/* Investments Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {investments.map((inv) => {
                  const gain = (inv.currentValue || inv.amount) - inv.amount;
                  const retPct = inv.amount > 0 ? ((gain / inv.amount) * 100).toFixed(1) : 0;
                  return (
                    <div
                      key={inv._id}
                      className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm hover:border-slate-700 transition flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {inv.investmentType || 'Mutual Funds'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {inv.startDate ? new Date(inv.startDate).toLocaleDateString() : ''}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-base font-bold text-white truncate">{inv.name}</h4>
                          {inv.notes && <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{inv.notes}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Invested Amount</span>
                            <span className="font-bold text-slate-200">{currency}{inv.amount.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Current Valuation</span>
                            <span className="font-bold text-emerald-400">{currency}{(inv.currentValue || inv.amount).toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Profit/Loss</span>
                            <span className={`font-semibold ${gain >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
                              {gain >= 0 ? '+' : ''}{currency}{gain.toLocaleString()} ({retPct}%)
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Units</span>
                            <span className="font-semibold text-slate-300">{inv.units || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2 mt-3">
                        <button
                          onClick={() => handleOpenEditInvestment(inv)}
                          className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteInvestment(inv._id, inv.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {investments.length === 0 && (
                  <div className="col-span-full p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <TrendingUp className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-sm font-bold text-white">No investments yet</p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Start recording your stocks, mutual funds, gold, and fixed deposits to track your net worth.
                    </p>
                    <button
                      onClick={handleOpenAddInvestment}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Add Your First Investment</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 4. FINANCIAL GOALS VIEW */}
          {/* ======================================================== */}
          {activeSection === 'goals' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-400" />
                    Target-Based Financial Goals
                  </h3>
                  <p className="text-xs text-slate-400">Track and fund milestones independently</p>
                </div>
                <button
                  onClick={handleOpenAddGoal}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Create Financial Goal</span>
                </button>
              </div>

              {/* Goals Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map((goal) => {
                  const rem = Math.max(0, goal.targetAmount - (goal.currentAmount || 0));
                  return (
                    <div
                      key={goal._id}
                      className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm hover:border-slate-700 transition flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {goal.category || 'Goal'}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400">
                            Due: {goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : 'Target'}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-base font-bold text-white">{goal.title}</h4>
                          <p className="text-xs text-slate-400 mt-1">
                            {currency}{(goal.currentAmount || 0).toLocaleString()} / {currency}{goal.targetAmount.toLocaleString()}
                          </p>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              style={{ width: `${Math.min(100, goal.progressPercentage || 0)}%` }}
                              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500">
                            <span>{goal.progressPercentage || 0}% funded</span>
                            <span>{currency}{rem.toLocaleString()} remaining</span>
                          </div>
                        </div>

                        {/* Monthly SIP requirement to achieve goal */}
                        {goal.monthlyRequiredSavings > 0 && (
                          <div className="p-2.5 rounded-xl bg-slate-800/60 text-xs text-slate-300 flex justify-between">
                            <span className="text-slate-400">Required Monthly SIP:</span>
                            <span className="font-bold text-emerald-400">{currency}{goal.monthlyRequiredSavings.toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2 mt-4">
                        <button
                          onClick={() => handleOpenEditGoal(goal)}
                          className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteGoal(goal._id, goal.title)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                          title="Delete Goal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {goals.length === 0 && (
                  <div className="col-span-full p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <Target className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-sm font-bold text-white">No financial goals created</p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Define milestones like Emergency Fund, House Down Payment, or Education and track your systematic progress.
                    </p>
                    <button
                      onClick={handleOpenAddGoal}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Create Your First Goal</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 5. SIP PLANNER VIEW */}
          {/* ======================================================== */}
          {activeSection === 'sips' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Interactive SIP Planning Card */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <form onSubmit={handleSaveSIPPlan} className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-400" />
                      Systematic Investment Plan (SIP) Simulator
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Calculate wealth accumulation and save your recurring plan</p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Plan Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Nifty 50 Index SIP, Bluechip Wealth Corpus"
                      value={sipForm.name}
                      onChange={(e) => setSipForm({ ...sipForm, name: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Monthly Contribution ({currency}) *</label>
                      <input
                        type="number"
                        min="100"
                        step="500"
                        value={sipForm.monthlyAmount}
                        onChange={(e) => setSipForm({ ...sipForm, monthlyAmount: e.target.value })}
                        required
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Duration (Years) *</label>
                      <input
                        type="number"
                        min="1"
                        max="40"
                        value={sipForm.durationYears}
                        onChange={(e) => setSipForm({ ...sipForm, durationYears: e.target.value })}
                        required
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Expected Return (% p.a.)</label>
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        max="35"
                        value={sipForm.expectedReturn}
                        onChange={(e) => setSipForm({ ...sipForm, expectedReturn: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Asset Class</label>
                      <select
                        value={sipForm.investmentType}
                        onChange={(e) => setSipForm({ ...sipForm, investmentType: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                      >
                        <option value="Mutual Funds">Mutual Funds</option>
                        <option value="Index Funds">Index Funds</option>
                        <option value="Stocks">Direct Stocks</option>
                        <option value="Gold">Digital Gold</option>
                        <option value="Fixed Deposits">Recurring Deposit</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/25 transition mt-2 flex items-center justify-center gap-1.5"
                  >
                    <span>Save SIP Plan to My Account</span>
                  </button>
                </form>

                {/* Live Simulation Display */}
                {(() => {
                  const m = Number(sipForm.monthlyAmount) || 0;
                  const y = Number(sipForm.durationYears) || 0;
                  const r = (Number(sipForm.expectedReturn) || 0) / 100 / 12;
                  const n = y * 12;
                  const totalDeposited = m * n;
                  let fv = 0;
                  if (r > 0) {
                    fv = Math.round(m * ((Math.pow(1 + r, n) - 1) / r) * (1 + r));
                  } else {
                    fv = totalDeposited;
                  }
                  const gains = Math.max(0, fv - totalDeposited);

                  return (
                    <div className="flex flex-col justify-between p-5 rounded-2xl bg-slate-800/60 border border-slate-700/50 space-y-4">
                      <div>
                        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                          Projected Wealth Accumulation
                        </span>
                        <h4 className="text-3xl font-black text-white mt-1">{currency}{fv.toLocaleString()}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">Value at the end of {y} years</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Total Deposited</span>
                          <span className="text-base font-bold text-slate-200">{currency}{totalDeposited.toLocaleString()}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Wealth Gain</span>
                          <span className="text-base font-bold text-emerald-400">+{currency}{gains.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="space-y-1 pt-2">
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>Deposited ({fv > 0 ? Math.round((totalDeposited / fv) * 100) : 0}%)</span>
                          <span>Gain ({fv > 0 ? Math.round((gains / fv) * 100) : 0}%)</span>
                        </div>
                        <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-700">
                          <div
                            style={{ width: `${fv > 0 ? (totalDeposited / fv) * 100 : 50}%` }}
                            className="h-full bg-slate-500"
                          />
                          <div
                            style={{ width: `${fv > 0 ? (gains / fv) * 100 : 50}%` }}
                            className="h-full bg-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Saved Active SIPs List */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">My Active SIP Plans</h4>
                  <span className="text-xs text-slate-400">{sips.length} plans saved</span>
                </div>
                <div className="divide-y divide-slate-800">
                  {sips.map((sip) => (
                    <div key={sip._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{sip.name}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            {sip.investmentType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {currency}{sip.monthlyAmount.toLocaleString()}/month • {sip.durationYears} Years @ {sip.expectedReturn}% p.a.
                        </p>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block">Projected Value</span>
                          <span className="text-xs font-bold text-emerald-400">
                            {currency}{(sip.finalProjectedValue || 0).toLocaleString()}
                          </span>
                        </div>
                        <button
                          onClick={() => handleToggleSIPStatus(sip)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                            sip.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {sip.status}
                        </button>
                        <button
                          onClick={() => handleDeleteSIP(sip._id, sip.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                          title="Delete SIP Plan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {sips.length === 0 && (
                    <p className="p-8 text-center text-xs text-slate-500">
                      No SIP plans saved yet. Simulate and save your first plan using the form above.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 6. FINANCIAL CALCULATORS VIEW */}
          {/* ======================================================== */}
          {activeSection === 'calculators' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Calculator Tabs */}
              <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-slate-900 border border-slate-800">
                {[
                  { id: 'sip', label: 'SIP Calculator' },
                  { id: 'lumpsum', label: 'Lump Sum Calculator' },
                  { id: 'compound', label: 'Compound Interest' },
                  { id: 'goal', label: 'Goal Target Planner' },
                  { id: 'loan', label: 'Loan / EMI Calculator' }
                ].map((calc) => (
                  <button
                    key={calc.id}
                    onClick={() => setActiveCalculator(calc.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      activeCalculator === calc.id
                        ? 'bg-emerald-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {calc.label}
                  </button>
                ))}
              </div>

              {/* Calculator Workspace */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. SIP CALCULATOR */}
                {activeCalculator === 'sip' && (
                  <>
                    <div className="space-y-4">
                      <h4 className="text-base font-bold text-white">Monthly SIP Calculator</h4>
                      <div>
                        <div className="flex justify-between text-xs text-slate-300 mb-1">
                          <span>Monthly Investment</span>
                          <span className="font-bold">{currency}{Number(calcInputs.sipMonthly).toLocaleString()}</span>
                        </div>
                        <input
                          type="range"
                          min="500"
                          max="100000"
                          step="500"
                          value={calcInputs.sipMonthly}
                          onChange={(e) => setCalcInputs({ ...calcInputs, sipMonthly: e.target.value })}
                          className="w-full accent-emerald-500"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-slate-300 mb-1">
                          <span>Investment Period</span>
                          <span className="font-bold">{calcInputs.sipYears} Years</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="30"
                          value={calcInputs.sipYears}
                          onChange={(e) => setCalcInputs({ ...calcInputs, sipYears: e.target.value })}
                          className="w-full accent-emerald-500"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-slate-300 mb-1">
                          <span>Expected Return Rate (p.a.)</span>
                          <span className="font-bold">{calcInputs.sipRate}%</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="30"
                          step="0.5"
                          value={calcInputs.sipRate}
                          onChange={(e) => setCalcInputs({ ...calcInputs, sipRate: e.target.value })}
                          className="w-full accent-emerald-500"
                        />
                      </div>
                    </div>
                    <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex flex-col justify-between space-y-4">
                      <div>
                        <span className="text-xs text-slate-400">Total Future Wealth</span>
                        <p className="text-3xl font-black text-emerald-400 mt-1">
                          {currency}{calcResults.sipFV.toLocaleString()}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Total Invested</span>
                          <span className="font-bold text-slate-200">{currency}{calcResults.sipInvested.toLocaleString()}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Wealth Gain</span>
                          <span className="font-bold text-teal-400">+{currency}{calcResults.sipGains.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* 2. LUMP SUM CALCULATOR */}
                {activeCalculator === 'lumpsum' && (
                  <>
                    <div className="space-y-4">
                      <h4 className="text-base font-bold text-white">One-Time Lump Sum Calculator</h4>
                      <div>
                        <div className="flex justify-between text-xs text-slate-300 mb-1">
                          <span>Initial Investment</span>
                          <span className="font-bold">{currency}{Number(calcInputs.lumpSumAmount).toLocaleString()}</span>
                        </div>
                        <input
                          type="range"
                          min="5000"
                          max="1000000"
                          step="5000"
                          value={calcInputs.lumpSumAmount}
                          onChange={(e) => setCalcInputs({ ...calcInputs, lumpSumAmount: e.target.value })}
                          className="w-full accent-emerald-500"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-slate-300 mb-1">
                          <span>Tenure (Years)</span>
                          <span className="font-bold">{calcInputs.lumpSumYears} Years</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="30"
                          value={calcInputs.lumpSumYears}
                          onChange={(e) => setCalcInputs({ ...calcInputs, lumpSumYears: e.target.value })}
                          className="w-full accent-emerald-500"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-slate-300 mb-1">
                          <span>Expected Return (% p.a.)</span>
                          <span className="font-bold">{calcInputs.lumpSumRate}%</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="30"
                          step="0.5"
                          value={calcInputs.lumpSumRate}
                          onChange={(e) => setCalcInputs({ ...calcInputs, lumpSumRate: e.target.value })}
                          className="w-full accent-emerald-500"
                        />
                      </div>
                    </div>
                    <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex flex-col justify-between space-y-4">
                      <div>
                        <span className="text-xs text-slate-400">Total Maturity Value</span>
                        <p className="text-3xl font-black text-emerald-400 mt-1">
                          {currency}{calcResults.lsFV.toLocaleString()}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Initial Capital</span>
                          <span className="font-bold text-slate-200">{currency}{Number(calcInputs.lumpSumAmount).toLocaleString()}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Estimated Returns</span>
                          <span className="font-bold text-teal-400">+{currency}{calcResults.lsGains.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* 3. COMPOUND INTEREST */}
                {activeCalculator === 'compound' && (
                  <>
                    <div className="space-y-4">
                      <h4 className="text-base font-bold text-white">Compound Interest Growth</h4>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Principal Amount ({currency})</label>
                        <input
                          type="number"
                          value={calcInputs.ciPrincipal}
                          onChange={(e) => setCalcInputs({ ...calcInputs, ciPrincipal: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Annual Interest Rate (%)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={calcInputs.ciRate}
                            onChange={(e) => setCalcInputs({ ...calcInputs, ciRate: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Tenure (Years)</label>
                          <input
                            type="number"
                            value={calcInputs.ciYears}
                            onChange={(e) => setCalcInputs({ ...calcInputs, ciYears: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex flex-col justify-between space-y-4">
                      <div>
                        <span className="text-xs text-slate-400">Future Balance</span>
                        <p className="text-3xl font-black text-emerald-400 mt-1">
                          {currency}{calcResults.ciFV.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                        <span className="text-[10px] text-slate-400 block">Total Compound Interest Earned</span>
                        <span className="text-base font-bold text-teal-400">+{currency}{calcResults.ciInterest.toLocaleString()}</span>
                      </div>
                    </div>
                  </>
                )}

                {/* 4. GOAL TARGET */}
                {activeCalculator === 'goal' && (
                  <>
                    <div className="space-y-4">
                      <h4 className="text-base font-bold text-white">Goal Target SIP Planner</h4>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Target Wealth Goal ({currency})</label>
                        <input
                          type="number"
                          value={calcInputs.goalTarget}
                          onChange={(e) => setCalcInputs({ ...calcInputs, goalTarget: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Years to Reach Goal</label>
                          <input
                            type="number"
                            value={calcInputs.goalYears}
                            onChange={(e) => setCalcInputs({ ...calcInputs, goalYears: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Expected Return (%)</label>
                          <input
                            type="number"
                            step="0.5"
                            value={calcInputs.goalRate}
                            onChange={(e) => setCalcInputs({ ...calcInputs, goalRate: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex flex-col justify-between space-y-4">
                      <div>
                        <span className="text-xs text-slate-400">Required Monthly SIP</span>
                        <p className="text-3xl font-black text-emerald-400 mt-1">
                          {currency}{calcResults.gMonthlyReq.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Invest {currency}{calcResults.gMonthlyReq.toLocaleString()} every month for {calcInputs.goalYears} years to reach {currency}{Number(calcInputs.goalTarget).toLocaleString()}.
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* 5. LOAN / EMI */}
                {activeCalculator === 'loan' && (
                  <>
                    <div className="space-y-4">
                      <h4 className="text-base font-bold text-white">Loan & EMI Calculator</h4>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Loan Amount ({currency})</label>
                        <input
                          type="number"
                          value={calcInputs.loanPrincipal}
                          onChange={(e) => setCalcInputs({ ...calcInputs, loanPrincipal: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Interest Rate (% p.a.)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={calcInputs.loanRate}
                            onChange={(e) => setCalcInputs({ ...calcInputs, loanRate: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Tenure (Months)</label>
                          <input
                            type="number"
                            value={calcInputs.loanTenureMonths}
                            onChange={(e) => setCalcInputs({ ...calcInputs, loanTenureMonths: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex flex-col justify-between space-y-4">
                      <div>
                        <span className="text-xs text-slate-400">Monthly EMI Payable</span>
                        <p className="text-3xl font-black text-rose-400 mt-1">
                          {currency}{calcResults.emi.toLocaleString()}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Total Interest</span>
                          <span className="font-bold text-rose-400">{currency}{calcResults.loanTotalInterest.toLocaleString()}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Total Payable</span>
                          <span className="font-bold text-slate-200">{currency}{calcResults.loanTotalPayable.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 7. TRANSACTIONS VIEW */}
          {/* ======================================================== */}
          {activeSection === 'transactions' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2">
                  {['ALL', 'Investment', 'Deposit', 'Withdrawal', 'SIP'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTransactionTypeFilter(t)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        transactionTypeFilter === t
                          ? 'bg-emerald-500 text-slate-950 shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDepositModalOpen(true)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Deposit</span>
                  </button>
                  <button
                    onClick={() => setWithdrawModalOpen(true)}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
                  >
                    <ArrowDownRight className="w-3.5 h-3.5" />
                    <span>Withdraw</span>
                  </button>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Txn ID</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Method</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Description</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {transactions.map((txn) => (
                        <tr key={txn._id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4 font-mono font-medium text-slate-300">{txn.transactionId}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
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
                          <td className="py-3 px-4 font-bold text-white">
                            {currency}{(txn.amount || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-slate-400">{txn.paymentMethod}</td>
                          <td className="py-3 px-4 text-slate-400">
                            {new Date(txn.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-slate-300 truncate max-w-xs">{txn.description}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                txn.status === 'Completed'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                              }`}
                            >
                              {txn.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {transactions.length === 0 && (
                        <tr>
                          <td colSpan="7" className="py-8 text-center text-slate-500">
                            No transactions available.
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
          {/* 8. PERSONALIZED INSIGHTS VIEW */}
          {/* ======================================================== */}
          {activeSection === 'insights' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Personal Financial Insights</h3>
                    <p className="text-xs text-slate-400">Real-time intelligence generated solely from your portfolio</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  {(summary?.insights || []).map((ins, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-start gap-3"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{ins.text}</p>
                    </div>
                  ))}

                  {(!summary?.insights || summary.insights.length === 0) && (
                    <div className="py-12 text-center text-slate-500 space-y-2">
                      <Sparkles className="w-8 h-8 mx-auto text-slate-600" />
                      <p className="text-sm font-semibold text-slate-300">
                        Add your first investment to start receiving personalized insights.
                      </p>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Once you add assets or create financial goals, our engine calculates risk diversification and milestone timelines.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 9. NOTIFICATIONS VIEW */}
          {/* ======================================================== */}
          {activeSection === 'notifications' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Notifications & Alerts</h3>
                  {unreadNotifCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950">
                      {unreadNotifCount} unread
                    </span>
                  )}
                </div>
                {unreadNotifCount > 0 && (
                  <button
                    onClick={handleMarkAllNotificationsRead}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    Mark All as Read
                  </button>
                )}
              </div>

              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm divide-y divide-slate-800">
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => !n.read && handleMarkNotificationRead(n._id)}
                    className={`p-4 transition flex items-start justify-between gap-4 cursor-pointer ${
                      n.read ? 'bg-slate-900/40 hover:bg-slate-900' : 'bg-emerald-950/20 hover:bg-emerald-950/30'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                          {n.type}
                        </span>
                        <h5 className="text-xs sm:text-sm font-bold text-white">{n.title}</h5>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
                      <span className="text-[10px] text-slate-500 block">
                        {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <p className="p-8 text-center text-xs text-slate-500">No notifications available.</p>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 10. PROFILE & BUDGET VIEW */}
          {/* ======================================================== */}
          {activeSection === 'profile' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <form onSubmit={handleUpdateProfile} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Investor Profile & Financial Blueprint</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Customize your personal income, savings, and risk preference</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={userProfileForm.name}
                      onChange={(e) => setUserProfileForm({ ...userProfileForm, name: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={userProfileForm.phone}
                      onChange={(e) => setUserProfileForm({ ...userProfileForm, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Currency Symbol</label>
                    <select
                      value={userProfileForm.currency}
                      onChange={(e) => setUserProfileForm({ ...userProfileForm, currency: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    >
                      <option value="₹">₹ (Indian Rupee)</option>
                      <option value="$">$ (US Dollar)</option>
                      <option value="€">€ (Euro)</option>
                      <option value="£">£ (British Pound)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Risk Preference</label>
                    <select
                      value={userProfileForm.riskPreference}
                      onChange={(e) => setUserProfileForm({ ...userProfileForm, riskPreference: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    >
                      <option value="Conservative">Conservative (Low Risk)</option>
                      <option value="Moderate">Moderate (Balanced Growth)</option>
                      <option value="Aggressive">Aggressive (Maximum Capital Gain)</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">Monthly Cash Flow</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Monthly Inflows ({currency})</label>
                      <input
                        type="number"
                        min="0"
                        value={userProfileForm.monthlyIncome}
                        onChange={(e) => setUserProfileForm({ ...userProfileForm, monthlyIncome: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Monthly Living Expenses ({currency})</label>
                      <input
                        type="number"
                        min="0"
                        value={userProfileForm.monthlyExpenses}
                        onChange={(e) => setUserProfileForm({ ...userProfileForm, monthlyExpenses: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Investment Horizon (Years)</label>
                      <input
                        type="number"
                        min="1"
                        max="40"
                        value={userProfileForm.horizonYears}
                        onChange={(e) => setUserProfileForm({ ...userProfileForm, horizonYears: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-xl text-xs font-bold shadow-md transition"
                  >
                    {actionLoading ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* 11. SETTINGS & DANGER ZONE VIEW */}
          {/* ======================================================== */}
          {activeSection === 'settings' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Security & Password */}
              <form onSubmit={handleChangePassword} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white">Account Security</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Change your account password</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Current Password</label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">New Password</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition"
                >
                  Update Password
                </button>
              </form>

              {/* Danger Zone: Delete Account */}
              <div className="p-6 rounded-3xl bg-rose-950/20 border border-rose-900/40 space-y-3">
                <h4 className="text-sm font-bold text-rose-400">Danger Zone</h4>
                <p className="text-xs text-slate-400">
                  Permanently delete your investor account and all associated investments, goals, SIP plans, and transaction history.
                  This action cannot be undone.
                </p>
                <button
                  onClick={() => setDeleteAccountModalOpen(true)}
                  className="px-4 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded-xl text-xs font-bold border border-rose-800 transition"
                >
                  Delete My Account
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT INVESTMENT */}
      {/* ======================================================== */}
      {investmentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingInvestment ? 'Edit Investment' : 'Add Investment'}
              </h3>
              <button onClick={() => setInvestmentModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveInvestment} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Investment Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Reliance Industries, Parag Parikh Flexi Cap"
                  value={investmentForm.name}
                  onChange={(e) => setInvestmentForm({ ...investmentForm, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Asset Class</label>
                  <select
                    value={investmentForm.investmentType}
                    onChange={(e) => setInvestmentForm({ ...investmentForm, investmentType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="Mutual Funds">Mutual Funds</option>
                    <option value="Stocks">Stocks / Equities</option>
                    <option value="Fixed Deposits">Fixed Deposit</option>
                    <option value="Gold">Gold</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Crypto">Crypto</option>
                    <option value="Bonds">Bonds</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Expected Return (% p.a.)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={investmentForm.expectedReturn}
                    onChange={(e) => setInvestmentForm({ ...investmentForm, expectedReturn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Invested Amount ({currency}) *</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="50000"
                    value={investmentForm.amount}
                    onChange={(e) => setInvestmentForm({ ...investmentForm, amount: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Current Value ({currency})</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Defaults to invested amount"
                    value={investmentForm.currentValue}
                    onChange={(e) => setInvestmentForm({ ...investmentForm, currentValue: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Units (Optional)</label>
                  <input
                    type="number"
                    step="0.001"
                    placeholder="e.g. 50"
                    value={investmentForm.units}
                    onChange={(e) => setInvestmentForm({ ...investmentForm, units: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Purchase Date</label>
                  <input
                    type="date"
                    value={investmentForm.startDate}
                    onChange={(e) => setInvestmentForm({ ...investmentForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Long term retirement core holding"
                  value={investmentForm.notes}
                  onChange={(e) => setInvestmentForm({ ...investmentForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setInvestmentModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-xl text-xs font-bold transition"
                >
                  {actionLoading ? 'Saving...' : editingInvestment ? 'Update Investment' : 'Save Investment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT FINANCIAL GOAL */}
      {/* ======================================================== */}
      {goalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingGoal ? 'Edit Financial Goal' : 'Create Financial Goal'}
              </h3>
              <button onClick={() => setGoalModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Goal Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Emergency Fund, House Down Payment"
                  value={goalForm.title}
                  onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={goalForm.category}
                    onChange={(e) => setGoalForm({ ...goalForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="Emergency Fund">Emergency Fund</option>
                    <option value="House">House Purchase</option>
                    <option value="Education">Education</option>
                    <option value="Car">Car</option>
                    <option value="Bike">Bike</option>
                    <option value="Travel">Travel</option>
                    <option value="Retirement">Retirement</option>
                    <option value="Custom Goal">Custom Goal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
                  <select
                    value={goalForm.priority}
                    onChange={(e) => setGoalForm({ ...goalForm, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Amount ({currency}) *</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="100000"
                    value={goalForm.targetAmount}
                    onChange={(e) => setGoalForm({ ...goalForm, targetAmount: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Current Saved ({currency})</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={goalForm.currentAmount}
                    onChange={(e) => setGoalForm({ ...goalForm, currentAmount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Date *</label>
                <input
                  type="date"
                  value={goalForm.targetDate}
                  onChange={(e) => setGoalForm({ ...goalForm, targetDate: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setGoalModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-xl text-xs font-bold transition"
                >
                  {actionLoading ? 'Saving...' : editingGoal ? 'Update Goal' : 'Save Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: DEPOSIT */}
      {/* ======================================================== */}
      {depositModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Deposit to Investor Wallet</h3>
              <button onClick={() => setDepositModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Deposit Amount ({currency}) *</label>
                <input
                  type="number"
                  min="100"
                  placeholder="5000"
                  value={depositForm.amount}
                  onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Payment Method</label>
                <select
                  value={depositForm.paymentMethod}
                  onChange={(e) => setDepositForm({ ...depositForm, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option value="UPI / Net Banking">UPI / Instant Net Banking</option>
                  <option value="Debit Card">Debit / ATM Card</option>
                  <option value="Bank Wire">Bank Wire / IMPS</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDepositModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-xl text-xs font-bold transition"
                >
                  Authorize Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: WITHDRAW */}
      {/* ======================================================== */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Withdraw Funds</h3>
              <button onClick={() => setWithdrawModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Withdrawal Amount ({currency}) *</span>
                  <span className="text-slate-500">
                    Max: {currency}{(profileData?.walletBalance || 0).toLocaleString()}
                  </span>
                </div>
                <input
                  type="number"
                  min="100"
                  max={profileData?.walletBalance || 0}
                  placeholder="2000"
                  value={withdrawForm.amount}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-white"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setWithdrawModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition"
                >
                  Submit Withdrawal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: DELETE ACCOUNT CONFIRMATION */}
      {/* ======================================================== */}
      {deleteAccountModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-rose-900/60 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-rose-400">Permanently Delete Account?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will permanently delete your account (<strong>{currentUser?.email}</strong>) and erase all your investments,
              financial goals, SIP plans, and transactions from the database.
            </p>
            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setDeleteAccountModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Keep Account
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={actionLoading}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition"
              >
                Yes, Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
