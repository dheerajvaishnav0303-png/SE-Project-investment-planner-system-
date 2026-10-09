import Investment from '../models/Investment.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';

/**
 * @route   GET /api/investments
 * @desc    Get all investments belonging strictly to authenticated user
 * @access  Private (Protected)
 */
export const getInvestments = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { type, search, sort = '-createdAt' } = req.query;

    const filter = { user: userId };
    if (type && type !== 'ALL') {
      filter.investmentType = type;
    }
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const investments = await Investment.find(filter)
      .populate('plan', 'name category expectedReturn')
      .sort(sort);

    // Summary calculations strictly for this user
    const totalInvested = investments.reduce((sum, i) => sum + (i.amount || 0), 0);
    const currentValue = investments.reduce((sum, i) => sum + (i.currentValue || 0), 0);
    const totalReturns = currentValue - totalInvested;
    const returnPercentage = totalInvested > 0 ? Number(((totalReturns / totalInvested) * 100).toFixed(2)) : 0;

    res.status(200).json({
      success: true,
      count: investments.length,
      summary: {
        totalInvested,
        currentValue,
        totalReturns,
        returnPercentage
      },
      data: investments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/investments
 * @desc    Create a new investment record for authenticated user
 * @access  Private (Protected)
 */
export const createInvestment = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      name,
      investmentName,
      investmentType,
      type,
      amount,
      investedAmount,
      currentValue,
      units = 0,
      expectedReturn = 10,
      startDate,
      purchaseDate,
      maturityDate,
      notes,
      planId
    } = req.body;

    const finalName = (name || investmentName || '').trim();
    const finalAmount = Number(amount !== undefined ? amount : investedAmount);
    const finalType = investmentType || type || 'Mutual Funds';
    const finalCurrentValue = Number(currentValue !== undefined ? currentValue : finalAmount);

    if (!finalName || isNaN(finalAmount) || finalAmount < 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid investment name and amount'
      });
    }

    const investment = await Investment.create({
      user: userId,
      name: finalName,
      investmentType: finalType,
      amount: finalAmount,
      currentValue: finalCurrentValue,
      units: Number(units || 0),
      expectedReturn: Number(expectedReturn || 10),
      startDate: startDate || purchaseDate || new Date(),
      maturityDate: maturityDate ? new Date(maturityDate) : null,
      notes: notes || '',
      plan: planId || null,
      status: 'Active'
    });

    // Create a transaction record for this user
    await Transaction.create({
      user: userId,
      type: 'Investment',
      amount: finalAmount,
      investment: investment._id,
      paymentMethod: 'Bank Transfer',
      status: 'Completed',
      description: `Investment in ${finalName} (${finalType})`,
      actionDate: new Date()
    });

    // Notify user
    await Notification.create({
      recipient: userId,
      title: `Investment Recorded: ${finalName}`,
      message: `Your allocation of ${req.user.currency || '₹'}${finalAmount.toLocaleString()} has been added to your portfolio.`,
      type: 'Investment'
    });

    res.status(201).json({
      success: true,
      message: 'Investment record created successfully',
      data: investment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/investments/:id
 * @desc    Get single investment by ID (ownership verified)
 * @access  Private (Protected)
 */
export const getInvestmentById = async (req, res, next) => {
  try {
    const investment = await Investment.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('plan');

    if (!investment) {
      return res.status(404).json({
        success: false,
        error: 'Investment record not found or access denied.'
      });
    }

    res.status(200).json({
      success: true,
      data: investment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/investments/:id
 * @desc    Update investment record (ownership verified)
 * @access  Private (Protected)
 */
export const updateInvestment = async (req, res, next) => {
  try {
    const investment = await Investment.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!investment) {
      return res.status(404).json({
        success: false,
        error: 'Investment record not found or unauthorized.'
      });
    }

    const {
      name,
      investmentName,
      investmentType,
      amount,
      investedAmount,
      currentValue,
      units,
      expectedReturn,
      status,
      notes
    } = req.body;

    if (name || investmentName) investment.name = (name || investmentName).trim();
    if (investmentType) investment.investmentType = investmentType;
    if (amount !== undefined || investedAmount !== undefined) {
      investment.amount = Number(amount !== undefined ? amount : investedAmount);
    }
    if (currentValue !== undefined) {
      investment.currentValue = Number(currentValue);
    }
    if (units !== undefined) investment.units = Number(units);
    if (expectedReturn !== undefined) investment.expectedReturn = Number(expectedReturn);
    if (status) investment.status = status;
    if (notes !== undefined) investment.notes = notes;

    await investment.save();

    res.status(200).json({
      success: true,
      message: 'Investment record updated successfully',
      data: investment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/investments/:id
 * @desc    Delete investment record (ownership verified)
 * @access  Private (Protected)
 */
export const deleteInvestment = async (req, res, next) => {
  try {
    const investment = await Investment.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!investment) {
      return res.status(404).json({
        success: false,
        error: 'Investment record not found or unauthorized.'
      });
    }

    await investment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Investment record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
