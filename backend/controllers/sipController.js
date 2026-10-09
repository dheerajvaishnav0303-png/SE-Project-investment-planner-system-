import SIP from '../models/SIP.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';

/**
 * @route   GET /api/sips
 * @desc    Get all SIP plans belonging strictly to authenticated user
 * @access  Private (Protected)
 */
export const getSIPs = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const sips = await SIP.find({ user: userId }).sort({ createdAt: -1 });

    const totalMonthlySIP = sips
      .filter((s) => s.status === 'Active')
      .reduce((sum, s) => sum + (s.monthlyAmount || 0), 0);

    const totalInvestedInSIPs = sips.reduce((sum, s) => sum + (s.totalInvested || 0), 0);
    const totalProjectedSIPValue = sips.reduce((sum, s) => sum + (s.finalProjectedValue || 0), 0);

    res.status(200).json({
      success: true,
      count: sips.length,
      summary: {
        totalMonthlySIP,
        totalInvestedInSIPs,
        totalProjectedSIPValue,
        activeSIPsCount: sips.filter((s) => s.status === 'Active').length
      },
      data: sips
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/sips
 * @desc    Create new SIP plan for authenticated user
 * @access  Private (Protected)
 */
export const createSIP = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      name,
      investmentType = 'Mutual Funds',
      monthlyAmount,
      durationYears = 5,
      expectedReturn = 12,
      initialInvestment = 0,
      notes
    } = req.body;

    if (!name || !monthlyAmount || Number(monthlyAmount) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid SIP plan name and monthly contribution amount'
      });
    }

    const sip = await SIP.create({
      user: userId,
      name: name.trim(),
      investmentType,
      monthlyAmount: Number(monthlyAmount),
      durationYears: Number(durationYears || 5),
      expectedReturn: Number(expectedReturn || 12),
      initialInvestment: Number(initialInvestment || 0),
      notes: notes || '',
      status: 'Active'
    });

    // If initial investment was made, record transaction
    if (Number(initialInvestment) > 0) {
      await Transaction.create({
        user: userId,
        type: 'SIP',
        amount: Number(initialInvestment),
        sip: sip._id,
        paymentMethod: 'Bank Transfer',
        status: 'Completed',
        description: `Initial allocation for SIP ${sip.name}`,
        actionDate: new Date()
      });
    }

    // User notification
    await Notification.create({
      recipient: userId,
      title: `SIP Initiated: ${sip.name}`,
      message: `Your systematic investment plan of ${req.user.currency || '₹'}${sip.monthlyAmount.toLocaleString()}/month is active for ${sip.durationYears} years.`,
      type: 'SIP'
    });

    res.status(201).json({
      success: true,
      message: 'SIP plan created successfully',
      data: sip
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/sips/:id
 * @desc    Get single SIP by ID (ownership verified)
 * @access  Private (Protected)
 */
export const getSIPById = async (req, res, next) => {
  try {
    const sip = await SIP.findOne({ _id: req.params.id, user: req.user._id });

    if (!sip) {
      return res.status(404).json({
        success: false,
        error: 'SIP plan not found or unauthorized.'
      });
    }

    res.status(200).json({
      success: true,
      data: sip
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/sips/:id
 * @desc    Update SIP plan (ownership verified)
 * @access  Private (Protected)
 */
export const updateSIP = async (req, res, next) => {
  try {
    const sip = await SIP.findOne({ _id: req.params.id, user: req.user._id });

    if (!sip) {
      return res.status(404).json({
        success: false,
        error: 'SIP plan not found or unauthorized.'
      });
    }

    const {
      name,
      investmentType,
      monthlyAmount,
      durationYears,
      expectedReturn,
      status,
      notes
    } = req.body;

    if (name) sip.name = name.trim();
    if (investmentType) sip.investmentType = investmentType;
    if (monthlyAmount !== undefined) sip.monthlyAmount = Number(monthlyAmount);
    if (durationYears !== undefined) sip.durationYears = Number(durationYears);
    if (expectedReturn !== undefined) sip.expectedReturn = Number(expectedReturn);
    if (status) sip.status = status;
    if (notes !== undefined) sip.notes = notes;

    await sip.save();

    res.status(200).json({
      success: true,
      message: 'SIP plan updated successfully',
      data: sip
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/sips/:id
 * @desc    Delete SIP plan (ownership verified)
 * @access  Private (Protected)
 */
export const deleteSIP = async (req, res, next) => {
  try {
    const sip = await SIP.findOne({ _id: req.params.id, user: req.user._id });

    if (!sip) {
      return res.status(404).json({
        success: false,
        error: 'SIP plan not found or unauthorized.'
      });
    }

    await sip.deleteOne();

    res.status(200).json({
      success: true,
      message: 'SIP plan removed successfully'
    });
  } catch (error) {
    next(error);
  }
};
