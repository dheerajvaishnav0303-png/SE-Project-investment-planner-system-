import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

/**
 * @route   GET /api/transactions
 * @desc    Get all transactions belonging strictly to authenticated user
 * @access  Private (Protected)
 */
export const getTransactions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { type, status } = req.query;

    const filter = { user: userId };
    if (type && type !== 'ALL') filter.type = type;
    if (status && status !== 'ALL') filter.status = status;

    const transactions = await Transaction.find(filter)
      .populate('investment', 'name investmentType')
      .populate('sip', 'name monthlyAmount')
      .populate('plan', 'name category')
      .sort({ createdAt: -1 });

    let totalDeposits = 0;
    let totalWithdrawals = 0;
    let totalInvestments = 0;

    transactions.forEach((t) => {
      if (t.type === 'Deposit' && t.status === 'Completed') totalDeposits += t.amount || 0;
      if (t.type === 'Withdrawal' && t.status === 'Completed') totalWithdrawals += t.amount || 0;
      if ((t.type === 'Investment' || t.type === 'SIP') && t.status === 'Completed') totalInvestments += t.amount || 0;
    });

    res.status(200).json({
      success: true,
      count: transactions.length,
      summary: {
        totalDeposits,
        totalWithdrawals,
        totalInvestments
      },
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/transactions
 * @desc    Create a deposit or withdrawal transaction for authenticated user
 * @access  Private (Protected)
 */
export const createTransaction = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { type, amount, paymentMethod = 'Bank Transfer', description } = req.body;

    if (!type || !amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide valid transaction type and amount'
      });
    }

    const numAmount = Number(amount);
    const user = await User.findById(userId);

    // If withdrawal, verify user balance
    if (type === 'Withdrawal') {
      if ((user.walletBalance || 0) < numAmount) {
        return res.status(400).json({
          success: false,
          error: `Insufficient wallet balance (${user.currency || '₹'}${(user.walletBalance || 0).toLocaleString()}) for withdrawal.`
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
      title: `${type} Transaction: ${transaction.transactionId}`,
      message: isDeposit
        ? `${user.currency || '₹'}${numAmount.toLocaleString()} added to your wallet balance.`
        : `Your withdrawal request of ${user.currency || '₹'}${numAmount.toLocaleString()} has been queued for verification.`,
      type: 'Transaction'
    });

    res.status(201).json({
      success: true,
      message: isDeposit ? 'Deposit completed successfully' : 'Withdrawal request submitted',
      data: {
        transaction,
        walletBalance: user.walletBalance
      }
    });
  } catch (error) {
    next(error);
  }
};
