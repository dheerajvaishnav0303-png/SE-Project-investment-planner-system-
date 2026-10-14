import mongoose from 'mongoose';
import User from '../models/User.js';
import InvestmentPlan from '../models/InvestmentPlan.js';
import Investment from '../models/Investment.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';
import FinancialProfile from '../models/FinancialProfile.js';

/**
 * @route   GET /api/admin/dashboard
 * @desc    Comprehensive executive dashboard summary cards with real database data
 * @access  Admin
 */
export const getAdminDashboard = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $in: ['user', 'customer'] } });
    const investments = await Investment.find();
    const transactions = await Transaction.find();
    const plans = await InvestmentPlan.find();

    let totalInvestmentsAmount = 0;
    let totalPortfolioValue = 0;

    investments.forEach((inv) => {
      totalInvestmentsAmount += inv.amount || 0;
      totalPortfolioValue += inv.currentValue || inv.amount || 0;
    });

    const totalReturns = Math.max(0, totalPortfolioValue - totalInvestmentsAmount);
    const totalTransactions = transactions.length;
    const pendingTransactions = transactions.filter((t) => t.status === 'Pending').length;

    // Recent 5 Transactions
    const recentTransactions = await Transaction.find()
      .populate('user', 'name email')
      .populate('plan', 'name')
      .sort({ createdAt: -1 })
      .limit(6);

    // Recent 5 Investments
    const recentInvestments = await Investment.find()
      .populate('user', 'name email')
      .populate('plan', 'name category expectedReturn')
      .sort({ createdAt: -1 })
      .limit(6);

    // Active Plans count
    const activePlansCount = plans.filter((p) => p.status === 'active').length;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalUsers,
          totalInvestments: investments.length,
          totalInvestmentsAmount,
          totalPortfolioValue,
          totalReturns,
          totalTransactions,
          pendingTransactions,
          activePlansCount
        },
        recentTransactions,
        recentInvestments,
        plansSummary: plans.map((p) => ({
          _id: p._id,
          name: p.name,
          category: p.category,
          expectedReturn: p.expectedReturn,
          riskLevel: p.riskLevel,
          status: p.status
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/analytics
 * @desc    Time-series and distribution analytics with real data for charts
 * @access  Admin
 */
export const getAdminAnalytics = async (req, res, next) => {
  try {
    const { range = '30d' } = req.query;

    let days = 30;
    if (range === '7d') days = 7;
    else if (range === '30d') days = 30;
    else if (range === '3m') days = 90;
    else if (range === '6m') days = 180;
    else if (range === '1y') days = 365;

    const startDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * days);

    // 1. User Growth Over Time
    const users = await User.find({ role: { $in: ['user', 'customer'] } }).sort({ createdAt: 1 });
    const userGrowth = [];
    let cumulativeUsers = 0;
    
    // Group users by date intervals
    const intervalDays = Math.max(1, Math.floor(days / 10));
    for (let i = days; i >= 0; i -= intervalDays) {
      const pointDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * i);
      const countUpToDate = users.filter((u) => new Date(u.createdAt) <= pointDate).length;
      userGrowth.push({
        date: pointDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        users: countUpToDate
      });
    }

    // 2. Investment Growth Over Time
    const investments = await Investment.find().populate('plan', 'category');
    const investmentGrowth = [];
    for (let i = days; i >= 0; i -= intervalDays) {
      const pointDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * i);
      const filtered = investments.filter((inv) => new Date(inv.createdAt) <= pointDate);
      const totalAmount = filtered.reduce((acc, curr) => acc + (curr.amount || 0), 0);
      const totalVal = filtered.reduce((acc, curr) => acc + (curr.currentValue || 0), 0);
      investmentGrowth.push({
        date: pointDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        invested: totalAmount,
        portfolioValue: totalVal
      });
    }

    // 3. Transaction Activity Breakdown
    const transactions = await Transaction.find();
    let depositsTotal = 0;
    let withdrawalsTotal = 0;
    let investmentsTotal = 0;

    transactions.forEach((t) => {
      if (t.type === 'Deposit') depositsTotal += t.amount || 0;
      else if (t.type === 'Withdrawal') withdrawalsTotal += t.amount || 0;
      else if (t.type === 'Investment') investmentsTotal += t.amount || 0;
    });

    const transactionActivity = [
      { name: 'Deposits', amount: depositsTotal, color: '#10b981' },
      { name: 'Investments', amount: investmentsTotal, color: '#6366f1' },
      { name: 'Withdrawals', amount: withdrawalsTotal, color: '#f43f5e' }
    ];

    // 4. Portfolio Distribution by Category
    const plans = await InvestmentPlan.find();
    const categoryTotals = {};
    let grandTotalPortfolio = 0;

    investments.forEach((inv) => {
      const cat = inv.plan?.category || 'Equity';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + (inv.currentValue || inv.amount || 0);
      grandTotalPortfolio += inv.currentValue || inv.amount || 0;
    });

    const colorsMap = {
      Equity: '#10b981',
      Debt: '#3b82f6',
      Hybrid: '#f59e0b',
      'High Growth': '#8b5cf6',
      Commodities: '#06b6d4',
      'Real Estate': '#ec4899'
    };

    const portfolioDistribution = Object.entries(categoryTotals).map(([category, value]) => ({
      category,
      value,
      percentage: grandTotalPortfolio > 0 ? Number(((value / grandTotalPortfolio) * 100).toFixed(1)) : 0,
      color: colorsMap[category] || '#64748b'
    }));

    // 5. Returns Timeline
    const returnsTimeline = investmentGrowth.map((point) => ({
      date: point.date,
      returns: Math.max(0, point.portfolioValue - point.invested)
    }));

    res.status(200).json({
      success: true,
      data: {
        range,
        userGrowth,
        investmentGrowth,
        transactionActivity,
        portfolioDistribution,
        returnsTimeline
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with their portfolio metrics and status
 * @access  Admin
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { search = '', status = 'ALL', sort = '-createdAt' } = req.query;

    const query = { role: { $in: ['user', 'customer'] } };

    if (status !== 'ALL') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).sort(sort).select('-password');
    const investments = await Investment.find();

    // Map portfolio stats for each user
    const usersWithStats = users.map((u) => {
      const userInvs = investments.filter((inv) => inv.user.toString() === u._id.toString());
      const totalInvestment = userInvs.reduce((sum, inv) => sum + (inv.amount || 0), 0);
      const portfolioValue = userInvs.reduce((sum, inv) => sum + (inv.currentValue || 0), 0);
      const totalReturns = Math.max(0, portfolioValue - totalInvestment);

      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone || 'N/A',
        status: u.status || 'active',
        role: u.role,
        walletBalance: u.walletBalance || 0,
        registrationDate: u.createdAt,
        totalInvestment,
        portfolioValue,
        totalReturns,
        investmentsCount: userInvs.length
      };
    });

    res.status(200).json({
      success: true,
      count: usersWithStats.length,
      data: usersWithStats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get detailed customer profile, portfolio, investments, and transactions
 * @access  Admin
 */
export const getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const investments = await Investment.find({ user: user._id })
      .populate('plan', 'name category expectedReturn riskLevel durationMonths')
      .sort({ createdAt: -1 });

    const transactions = await Transaction.find({ user: user._id })
      .populate('plan', 'name')
      .sort({ createdAt: -1 });

    const profile = await FinancialProfile.findOne({ name: user.name });

    const totalInvested = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const currentValue = investments.reduce((sum, inv) => sum + (inv.currentValue || 0), 0);
    const totalReturns = Math.max(0, currentValue - totalInvested);

    res.status(200).json({
      success: true,
      data: {
        user,
        portfolioSummary: {
          totalInvested,
          currentValue,
          totalReturns,
          returnPercentage: totalInvested > 0 ? Number(((totalReturns / totalInvested) * 100).toFixed(1)) : 0,
          investmentsCount: investments.length,
          walletBalance: user.walletBalance || 0
        },
        investments,
        transactions,
        financialProfile: profile || null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/users/:id/status
 * @desc    Change user status (active, inactive, blocked)
 * @access  Admin
 */
export const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive', 'blocked'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status value' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.status = status;
    await user.save();

    // Notify user of status change
    await Notification.create({
      recipient: user._id,
      title: `Account Status Updated: ${status.toUpperCase()}`,
      message: `Your account status has been set to ${status} by administration.`,
      type: 'Alert'
    });

    res.status(200).json({
      success: true,
      message: `User status successfully updated to ${status}`,
      data: { _id: user._id, status: user.status }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Admin update user details (name, email, phone, role, status, wallet balance)
 * @access  Admin
 */
export const updateUser = async (req, res, next) => {
  try {
    const { name, email, phone, role, status, walletBalance } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (name && name.trim()) user.name = name.trim();
    if (email && email.trim()) user.email = email.toLowerCase().trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (role && ['user', 'customer', 'admin'].includes(role)) user.role = role;
    if (status && ['active', 'inactive', 'blocked'].includes(status)) user.status = status;
    if (walletBalance !== undefined && !isNaN(walletBalance)) user.walletBalance = Number(walletBalance);

    await user.save();

    // Notify user of profile update by admin
    await Notification.create({
      recipient: user._id,
      title: 'Account Details Updated by Administrator',
      message: `Your account details have been updated. Current status: ${user.status}, Role: ${user.role}.`,
      type: 'Alert'
    });

    res.status(200).json({
      success: true,
      message: `User ${user.name} updated successfully in real-time`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        walletBalance: user.walletBalance,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user account and cascade
 * @access  Admin
 */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    await Investment.deleteMany({ user: user._id });
    await Transaction.deleteMany({ user: user._id });
    await Notification.deleteMany({ recipient: user._id });
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User and all associated investment records removed'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/investments
 * @desc    Get all investments system-wide
 * @access  Admin
 */
export const getAllInvestments = async (req, res, next) => {
  try {
    const investments = await Investment.find()
      .populate('user', 'name email phone')
      .populate('plan', 'name category expectedReturn riskLevel durationMonths')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: investments.length,
      data: investments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/transactions
 * @desc    Get all transactions system-wide
 * @access  Admin
 */
export const getAllTransactions = async (req, res, next) => {
  try {
    const { status, type } = req.query;
    const filter = {};
    if (status && status !== 'ALL') filter.status = status;
    if (type && type !== 'ALL') filter.type = type;

    const transactions = await Transaction.find(filter)
      .populate('user', 'name email phone')
      .populate('plan', 'name category')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/transactions/:id/status
 * @desc    Approve or Reject transaction (e.g. Completed, Cancelled, Failed)
 * @access  Admin
 */
export const updateTransactionStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['Completed', 'Cancelled', 'Failed', 'Pending'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid transaction status' });
    }

    const transaction = await Transaction.findById(req.params.id).populate('user');
    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    const prevStatus = transaction.status;
    transaction.status = status;
    transaction.actionDate = new Date();
    transaction.approvedBy = req.user?._id;
    await transaction.save();

    // If transaction is now Completed, process balance or investment if needed
    if (status === 'Completed' && prevStatus !== 'Completed') {
      const user = await User.findById(transaction.user._id);
      if (user) {
        if (transaction.type === 'Deposit') {
          user.walletBalance = (user.walletBalance || 0) + transaction.amount;
          await user.save();
        } else if (transaction.type === 'Withdrawal') {
          user.walletBalance = Math.max(0, (user.walletBalance || 0) - transaction.amount);
          await user.save();
        }
      }
    }

    // Send customer notification
    await Notification.create({
      recipient: transaction.user._id,
      title: `Transaction ${status}: ${transaction.transactionId}`,
      message: `Your ${transaction.type} transaction of $${transaction.amount.toLocaleString()} has been marked as ${status}.`,
      type: 'Transaction'
    });

    res.status(200).json({
      success: true,
      message: `Transaction ${transaction.transactionId} marked as ${status}`,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/plans
 * @desc    Get all investment plans
 * @access  Admin
 */
export const getAdminPlans = async (req, res, next) => {
  try {
    const plans = await InvestmentPlan.find().sort({ createdAt: -1 });
    const investments = await Investment.find();

    // Compute live investor count and AUM for each plan
    const enrichedPlans = plans.map((p) => {
      const planInvs = investments.filter((i) => i.plan.toString() === p._id.toString());
      const totalAUM = planInvs.reduce((sum, i) => sum + (i.amount || 0), 0);
      return {
        ...p.toObject(),
        totalInvestorsCount: planInvs.length,
        totalAUM
      };
    });

    res.status(200).json({
      success: true,
      count: enrichedPlans.length,
      data: enrichedPlans
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/admin/plans
 * @desc    Create new investment plan (instantly visible on Customer Portal)
 * @access  Admin
 */
export const createPlan = async (req, res, next) => {
  try {
    const {
      name,
      category,
      riskLevel,
      expectedReturn,
      minInvestment,
      durationMonths,
      description,
      assetAllocation,
      featured,
      status
    } = req.body;

    if (!name || !expectedReturn || !minInvestment || !description) {
      return res.status(400).json({
        success: false,
        error: 'Please fill in Plan Name, Expected Return, Min Investment, and Description'
      });
    }

    const existing = await InvestmentPlan.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, error: 'A plan with this name already exists' });
    }

    const plan = await InvestmentPlan.create({
      name,
      category: category || 'Equity',
      riskLevel: riskLevel || 'Moderate',
      expectedReturn: Number(expectedReturn),
      minInvestment: Number(minInvestment),
      durationMonths: Number(durationMonths || 12),
      description,
      assetAllocation: assetAllocation || [{ assetClass: 'Equities', percentage: 70 }, { assetClass: 'Debt', percentage: 30 }],
      featured: Boolean(featured),
      status: status || 'active',
      createdBy: req.user?._id
    });

    // Broadcast notification to all customers
    await Notification.create({
      recipient: null,
      title: `New Investment Plan Launched: ${plan.name}`,
      message: `A new ${plan.category} plan offering ${plan.expectedReturn}% target returns is now available.`,
      type: 'Announcement',
      createdBy: req.user?._id
    });

    res.status(201).json({
      success: true,
      message: `Plan "${plan.name}" created and published to Customer Portal`,
      data: plan
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/plans/:id
 * @desc    Update investment plan
 * @access  Admin
 */
export const updatePlan = async (req, res, next) => {
  try {
    const plan = await InvestmentPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Investment plan not found' });
    }

    const fields = [
      'name',
      'category',
      'riskLevel',
      'expectedReturn',
      'minInvestment',
      'durationMonths',
      'description',
      'assetAllocation',
      'featured',
      'status'
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        plan[field] = req.body[field];
      }
    });

    await plan.save();

    res.status(200).json({
      success: true,
      message: `Plan "${plan.name}" updated successfully`,
      data: plan
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/admin/plans/:id/status
 * @desc    Toggle plan active/inactive
 * @access  Admin
 */
export const togglePlanStatus = async (req, res, next) => {
  try {
    const plan = await InvestmentPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }

    plan.status = plan.status === 'active' ? 'inactive' : 'active';
    await plan.save();

    res.status(200).json({
      success: true,
      message: `Plan status changed to ${plan.status}`,
      data: plan
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/admin/plans/:id
 * @desc    Delete or archive plan
 * @access  Admin
 */
export const deletePlan = async (req, res, next) => {
  try {
    const plan = await InvestmentPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }

    const associatedInvestments = await Investment.countDocuments({ plan: plan._id });
    if (associatedInvestments > 0) {
      plan.status = 'archived';
      await plan.save();
      return res.status(200).json({
        success: true,
        message: 'Plan has active investments. It has been archived instead of deleted.'
      });
    }

    await plan.deleteOne();
    res.status(200).json({ success: true, message: 'Investment plan deleted' });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/reports
 * @desc    Generate structured reports with exportable format (Users, Investments, Transactions, Returns)
 * @access  Admin
 */
export const getAdminReports = async (req, res, next) => {
  try {
    const { type = 'investments' } = req.query;

    let reportData = [];

    if (type === 'users') {
      const users = await User.find({ role: { $in: ['user', 'customer'] } }).sort({ createdAt: -1 });
      const investments = await Investment.find();

      reportData = users.map((u) => {
        const userInvs = investments.filter((i) => i.user.toString() === u._id.toString());
        const totalInvested = userInvs.reduce((acc, i) => acc + (i.amount || 0), 0);
        const currentValue = userInvs.reduce((acc, i) => acc + (i.currentValue || 0), 0);
        return {
          Name: u.name,
          Email: u.email,
          Phone: u.phone || 'N/A',
          Status: u.status,
          RegisteredDate: new Date(u.createdAt).toISOString().split('T')[0],
          TotalInvested: totalInvested,
          CurrentPortfolioValue: currentValue,
          TotalReturns: Math.max(0, currentValue - totalInvested)
        };
      });
    } else if (type === 'investments') {
      const investments = await Investment.find()
        .populate('user', 'name email')
        .populate('plan', 'name category expectedReturn')
        .sort({ createdAt: -1 });

      reportData = investments.map((inv) => ({
        CustomerName: inv.user?.name || 'N/A',
        CustomerEmail: inv.user?.email || 'N/A',
        PlanName: inv.plan?.name || 'N/A',
        Category: inv.plan?.category || 'Equity',
        InvestedAmount: inv.amount,
        CurrentValue: inv.currentValue,
        Returns: inv.returns,
        ReturnRate: `${inv.returnPercentage}%`,
        Status: inv.status,
        StartDate: new Date(inv.startDate).toISOString().split('T')[0]
      }));
    } else if (type === 'transactions') {
      const transactions = await Transaction.find()
        .populate('user', 'name email')
        .populate('plan', 'name')
        .sort({ createdAt: -1 });

      reportData = transactions.map((t) => ({
        TransactionID: t.transactionId,
        Customer: t.user?.name || 'N/A',
        Type: t.type,
        Amount: t.amount,
        Status: t.status,
        PaymentMethod: t.paymentMethod,
        Date: new Date(t.createdAt).toISOString().split('T')[0],
        Description: t.description
      }));
    }

    res.status(200).json({
      success: true,
      type,
      count: reportData.length,
      data: reportData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/notifications
 * @desc    Get all notifications
 * @access  Admin
 */
export const getAdminNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find()
      .populate('recipient', 'name email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/admin/notifications
 * @desc    Send announcement or direct notification
 * @access  Admin
 */
export const createAdminNotification = async (req, res, next) => {
  try {
    const { title, message, type = 'Announcement', recipientId } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, error: 'Please provide title and message' });
    }

    const notif = await Notification.create({
      title,
      message,
      type,
      recipient: recipientId || null, // null means broadcast to all
      createdBy: req.user?._id
    });

    res.status(201).json({
      success: true,
      message: recipientId ? 'Direct notification delivered' : 'Broadcast announcement sent to all customers',
      data: notif
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/settings
 * @desc    Get admin profile and system diagnostics
 * @access  Admin
 */
export const getAdminSettings = async (req, res, next) => {
  try {
    const adminUser = await User.findById(req.user?._id).select('-password');
    const dbState = mongoose.connection.readyState;
    const dbStates = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];

    res.status(200).json({
      success: true,
      data: {
        admin: adminUser,
        system: {
          databaseStatus: dbStates[dbState] || 'Connected',
          dbHost: mongoose.connection.host || 'localhost',
          dbName: mongoose.connection.name || 'investment_planner',
          nodeVersion: process.version,
          platform: process.platform,
          uptimeSeconds: Math.floor(process.uptime()),
          memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/settings/profile
 * @desc    Update admin credentials
 * @access  Admin
 */
export const updateAdminProfile = async (req, res, next) => {
  try {
    const { name, email, newPassword, phone } = req.body;
    const admin = await User.findById(req.user?._id);

    if (!admin) {
      return res.status(404).json({ success: false, error: 'Admin user not found' });
    }

    if (name) admin.name = name;
    if (email) admin.email = email;
    if (phone) admin.phone = phone;
    if (newPassword && newPassword.length >= 6) {
      admin.password = newPassword;
    }

    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Admin profile updated successfully',
      data: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role
      }
    });
  } catch (error) {
    next(error);
  }
};


import { seedInitialDatabase } from '../services/dataSeeder.js';

/**
 * @route   POST /api/admin/seed
 * @desc    Seed demo investors, plans, and transactions
 * @access  Admin
 */
export const seedDemoInvestors = async (req, res, next) => {
  try {
    await seedInitialDatabase();
    res.status(200).json({
      success: true,
      message: 'Demo investor profiles, plans, investments, and transactions seeded successfully'
    });
  } catch (error) {
    next(error);
  }
};
