import User from '../models/User.js';
import InvestmentPlan from '../models/InvestmentPlan.js';
import Investment from '../models/Investment.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';

/**
 * @route   GET /api/customer/portfolio
 * @desc    Get logged-in customer's real portfolio summary, stats, and distribution
 * @access  Customer (Private)
 */
export const getCustomerPortfolio = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const investments = await Investment.find({ user: userId })
      .populate('plan', 'name category expectedReturn riskLevel durationMonths')
      .sort({ createdAt: -1 });

    const transactions = await Transaction.find({ user: userId })
      .populate('plan', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    let totalInvested = 0;
    let currentPortfolioValue = 0;
    const categoryTotals = {};

    investments.forEach((inv) => {
      if (inv.status === 'Active') {
        totalInvested += inv.amount || 0;
        currentPortfolioValue += inv.currentValue || inv.amount || 0;

        const cat = inv.plan?.category || 'Equity';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + (inv.currentValue || inv.amount || 0);
      }
    });

    const totalReturns = Math.max(0, currentPortfolioValue - totalInvested);
    const returnPercentage = totalInvested > 0 ? Number(((totalReturns / totalInvested) * 100).toFixed(2)) : 0;

    const assetAllocation = Object.entries(categoryTotals).map(([category, value]) => ({
      category,
      value,
      percentage: currentPortfolioValue > 0 ? Number(((value / currentPortfolioValue) * 100).toFixed(1)) : 0
    }));

    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          status: user.status,
          walletBalance: user.walletBalance || 0
        },
        portfolio: {
          totalInvested,
          currentPortfolioValue,
          totalReturns,
          returnPercentage,
          activeInvestmentsCount: investments.filter((i) => i.status === 'Active').length,
          assetAllocation
        },
        investments,
        recentTransactions: transactions
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/customer/plans
 * @desc    Get all active investment plans created by Admin
 * @access  Customer (Public/Private)
 */
export const getAvailablePlans = async (req, res, next) => {
  try {
    const plans = await InvestmentPlan.find({ status: 'active' }).sort({ featured: -1, createdAt: -1 });
    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/customer/investments
 * @desc    Get customer's personal investments
 * @access  Customer (Private)
 */
export const getMyInvestments = async (req, res, next) => {
  try {
    const investments = await Investment.find({ user: req.user._id })
      .populate('plan')
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
 * @route   POST /api/customer/investments
 * @desc    Invest into an Admin-created plan (Instantly visible in Admin Portal)
 * @access  Customer (Private)
 */
export const createInvestment = async (req, res, next) => {
  try {
    const { planId, amount, paymentMethod = 'Wallet Balance', notes } = req.body;
    const userId = req.user._id;

    if (!planId || !amount) {
      return res.status(400).json({ success: false, error: 'Please select a plan and specify amount' });
    }

    const plan = await InvestmentPlan.findById(planId);
    if (!plan || plan.status !== 'active') {
      return res.status(404).json({ success: false, error: 'Selected investment plan is currently unavailable' });
    }

    const investAmount = Number(amount);
    if (investAmount < plan.minInvestment) {
      return res.status(400).json({
        success: false,
        error: `Minimum investment for ${plan.name} is $${plan.minInvestment.toLocaleString()}`
      });
    }

    const user = await User.findById(userId);

    // If paying via wallet, check balance
    if (paymentMethod === 'Wallet Balance') {
      if ((user.walletBalance || 0) < investAmount) {
        return res.status(400).json({
          success: false,
          error: `Insufficient wallet balance ($${(user.walletBalance || 0).toLocaleString()}). Please deposit funds first or select bank payment.`
        });
      }
      user.walletBalance -= investAmount;
      await user.save();
    }

    // Calculate maturity date
    const maturityDate = new Date();
    maturityDate.setMonth(maturityDate.getMonth() + (plan.durationMonths || 12));

    // Create Investment Record
    const investment = await Investment.create({
      user: userId,
      plan: plan._id,
      amount: investAmount,
      currentValue: investAmount, // Starts at initial capital
      returns: 0,
      returnPercentage: 0,
      startDate: new Date(),
      maturityDate,
      status: 'Active',
      notes: notes || `Direct allocation into ${plan.name}`
    });

    // Create Transaction Record
    const transaction = await Transaction.create({
      transactionId: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      user: userId,
      type: 'Investment',
      amount: investAmount,
      plan: plan._id,
      investment: investment._id,
      paymentMethod,
      status: 'Completed',
      description: `Deployment into ${plan.name}`,
      actionDate: new Date()
    });

    // Update plan aggregates
    plan.totalInvestorsCount = (plan.totalInvestorsCount || 0) + 1;
    plan.totalAUM = (plan.totalAUM || 0) + investAmount;
    await plan.save();

    // Create confirmation notification for customer
    await Notification.create({
      recipient: userId,
      title: `Investment Confirmed: ${plan.name}`,
      message: `Your investment of $${investAmount.toLocaleString()} has been activated successfully.`,
      type: 'Investment'
    });

    res.status(201).json({
      success: true,
      message: `Successfully invested $${investAmount.toLocaleString()} in ${plan.name}`,
      data: {
        investment,
        transaction,
        remainingWalletBalance: user.walletBalance
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/customer/transactions
 * @desc    Get customer's personal transactions
 * @access  Customer (Private)
 */
export const getMyTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .populate('plan', 'name')
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
 * @route   POST /api/customer/transactions
 * @desc    Create Deposit or Withdrawal request
 * @access  Customer (Private)
 */
export const createTransaction = async (req, res, next) => {
  try {
    const { type, amount, paymentMethod = 'Bank Transfer', description } = req.body;
    const userId = req.user._id;

    if (!type || !amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, error: 'Please provide valid transaction type and amount' });
    }

    const numAmount = Number(amount);
    const user = await User.findById(userId);

    // If withdrawal, check wallet
    if (type === 'Withdrawal') {
      if ((user.walletBalance || 0) < numAmount) {
        return res.status(400).json({
          success: false,
          error: `Withdrawal amount exceeds available wallet balance ($${(user.walletBalance || 0).toLocaleString()})`
        });
      }
    }

    const isDeposit = type === 'Deposit';
    const status = isDeposit ? 'Completed' : 'Pending'; // Deposits complete immediately; withdrawals queue for admin approval

    if (isDeposit) {
      user.walletBalance = (user.walletBalance || 0) + numAmount;
      await user.save();
    }

    const transaction = await Transaction.create({
      transactionId: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      user: userId,
      type,
      amount: numAmount,
      paymentMethod,
      status,
      description: description || `${type} via ${paymentMethod}`,
      actionDate: isDeposit ? new Date() : null
    });

    await Notification.create({
      recipient: userId,
      title: `${type} Request: ${transaction.transactionId}`,
      message: isDeposit
        ? `$${numAmount.toLocaleString()} added to your wallet balance.`
        : `Your withdrawal request of $${numAmount.toLocaleString()} has been submitted for admin approval.`,
      type: 'Transaction'
    });

    res.status(201).json({
      success: true,
      message: isDeposit ? 'Funds added to wallet successfully' : 'Withdrawal request submitted for admin approval',
      data: {
        transaction,
        walletBalance: user.walletBalance
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/customer/notifications
 * @desc    Get customer's notifications (direct + broadcast)
 * @access  Customer (Private)
 */
export const getMyNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({
      $or: [{ recipient: userId }, { recipient: null }]
    }).sort({ createdAt: -1 });

    const unreadCount = notifications.filter((n) => !n.read).length;

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/customer/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Customer (Private)
 */
export const markNotificationRead = async (req, res, next) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    notif.read = true;
    await notif.save();

    res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
};
