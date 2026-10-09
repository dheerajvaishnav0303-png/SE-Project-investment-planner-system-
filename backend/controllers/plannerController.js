import FinancialProfile from '../models/FinancialProfile.js';
import Goal from '../models/Goal.js';
import Investment from '../models/Investment.js';
import SIP from '../models/SIP.js';
import Transaction from '../models/Transaction.js';
import { generatePlan } from '../services/plannerEngine.js';

/**
 * @route   GET /api/planner/summary
 * @desc    Get dashboard executive overview for authenticated user ONLY
 * @access  Private (Protected)
 */
export const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Load user's isolated data
    let profile = await FinancialProfile.findOne({ user: userId });
    if (!profile) {
      profile = new FinancialProfile({
        user: userId,
        name: req.user.name,
        currency: req.user.currency || '₹'
      });
      await profile.save();
    }

    const goals = await Goal.find({ user: userId }).sort({ targetDate: 1 });
    const investments = await Investment.find({ user: userId }).sort({ createdAt: -1 });
    const sips = await SIP.find({ user: userId }).sort({ createdAt: -1 });
    const transactions = await Transaction.find({ user: userId }).sort({ createdAt: -1 });

    // Core Portfolio Numbers
    let totalInvested = 0;
    let currentValue = 0;
    const categoryTotals = {
      'Mutual Funds': 0,
      'Stocks': 0,
      'Fixed Deposits': 0,
      'Gold': 0,
      'Other': 0
    };

    investments.forEach((inv) => {
      totalInvested += inv.amount || 0;
      currentValue += inv.currentValue || inv.amount || 0;

      const type = inv.investmentType || 'Mutual Funds';
      if (categoryTotals[type] !== undefined) {
        categoryTotals[type] += inv.currentValue || inv.amount || 0;
      } else {
        categoryTotals['Other'] += inv.currentValue || inv.amount || 0;
      }
    });

    const totalProfitLoss = currentValue - totalInvested;
    const returnPercentage = totalInvested > 0 ? Number(((totalProfitLoss / totalInvested) * 100).toFixed(2)) : 0;

    // Monthly Investment (from active SIPs + profile savings)
    const activeSIPs = sips.filter((s) => s.status === 'Active');
    const monthlySIPTotal = activeSIPs.reduce((sum, s) => sum + (s.monthlyAmount || 0), 0);

    // Asset Allocation percentages (ONLY from current user's investments)
    const assetAllocation = Object.entries(categoryTotals).map(([name, val]) => ({
      name,
      value: val,
      percentage: currentValue > 0 ? Number(((val / currentValue) * 100).toFixed(1)) : 0
    }));

    // Goals overview
    const totalGoalTarget = goals.reduce((sum, g) => sum + (g.targetAmount || 0), 0);
    const totalGoalSaved = goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);
    const goalsOverallProgress = totalGoalTarget > 0 ? Number(((totalGoalSaved / totalGoalTarget) * 100).toFixed(1)) : 0;
    const totalRequiredMonthlyForGoals = goals.reduce((sum, g) => sum + (g.monthlyRequiredSavings || 0), 0);

    // Profile Budget Metrics
    const metrics = profile.calculatedMetrics || {};
    const monthlySavings = metrics.monthlySavings || 0;
    const monthlyIncome = metrics.totalMonthlyIncome || 0;
    const monthlyExpenses = metrics.totalMonthlyExpenses || 0;

    // Performance History Chart points (based strictly on user's investment dates)
    const performanceChart = [];
    if (investments.length > 0) {
      // Group by investment creation timeline
      let runningInvested = 0;
      let runningValue = 0;
      const sortedInvs = [...investments].sort((a, b) => new Date(a.startDate || a.createdAt) - new Date(b.startDate || b.createdAt));
      
      sortedInvs.forEach((inv) => {
        runningInvested += inv.amount || 0;
        runningValue += inv.currentValue || inv.amount || 0;
        performanceChart.push({
          date: new Date(inv.startDate || inv.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
          invested: runningInvested,
          value: runningValue
        });
      });
    }

    // Personalized Insights strictly from user's data
    const insights = [];
    if (investments.length === 0 && goals.length === 0 && sips.length === 0) {
      // Empty state insight
    } else {
      if (returnPercentage > 0) {
        insights.push({
          type: 'positive',
          text: `Your portfolio has increased by ${returnPercentage}% overall.`
        });
      } else if (returnPercentage < 0) {
        insights.push({
          type: 'warning',
          text: `Your portfolio is down by ${Math.abs(returnPercentage)}%. Consider long-term compounding.`
        });
      }

      if (monthlySIPTotal > 0) {
        insights.push({
          type: 'info',
          text: `You have ${activeSIPs.length} active SIP commitments totaling ${req.user.currency || '₹'}${monthlySIPTotal.toLocaleString()}/month.`
        });
      }

      const emergencyGoal = goals.find((g) => g.category === 'Emergency Fund' || g.title.toLowerCase().includes('emergency'));
      if (emergencyGoal && emergencyGoal.targetAmount > 0) {
        insights.push({
          type: 'milestone',
          text: `You are ${emergencyGoal.progressPercentage}% toward your emergency fund goal.`
        });
      } else if (goals.length > 0) {
        insights.push({
          type: 'milestone',
          text: `You are tracking ${goals.length} active financial goals (${goalsOverallProgress}% overall funding).`
        });
      }
    }

    const summary = {
      profileName: req.user.name,
      currency: req.user.currency || profile.currency || '₹',
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        walletBalance: req.user.walletBalance || 0
      },
      portfolioOverview: {
        totalInvested,
        currentValue,
        totalProfitLoss,
        returnPercentage,
        monthlyInvestment: monthlySIPTotal || monthlySavings,
        numberOfInvestments: investments.length,
        activeSIPsCount: activeSIPs.length,
        goalsCount: goals.length,
        transactionsCount: transactions.length
      },
      assetAllocation,
      performanceChart,
      goalsOverview: {
        totalCount: goals.length,
        totalTarget: totalGoalTarget,
        totalSaved: totalGoalSaved,
        overallProgress: goalsOverallProgress,
        totalRequiredMonthly: totalRequiredMonthlyForGoals
      },
      monthlyBudget: {
        income: monthlyIncome,
        expenses: monthlyExpenses,
        savings: monthlySavings,
        savingsRate: metrics.savingsRate || 0
      },
      emergencyFund: {
        current: (profile.currentSavings?.emergencyFund || 0) + (profile.currentSavings?.cashAndBank || 0),
        recommended: metrics.emergencyFundRecommended || 0,
        status: metrics.emergencyFundStatus || 'Adequate'
      },
      recentInvestments: investments.slice(0, 5),
      recentTransactions: transactions.slice(0, 5),
      recentGoals: goals.slice(0, 4),
      insights
    };

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/planner/plan
 * @desc    Get tailored investment plan and asset allocation for authenticated user
 * @access  Private (Protected)
 */
export const getPlan = async (req, res, next) => {
  try {
    const userId = req.user._id;

    let profile = await FinancialProfile.findOne({ user: userId });
    if (!profile) {
      profile = new FinancialProfile({
        user: userId,
        name: req.user.name,
        currency: req.user.currency || '₹'
      });
      await profile.save();
    }

    const goals = await Goal.find({ user: userId });
    const plan = generatePlan(profile, goals);

    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (error) {
    next(error);
  }
};
