import User from '../models/User.js';
import Investment from '../models/Investment.js';
import Goal from '../models/Goal.js';
import SIP from '../models/SIP.js';
import Transaction from '../models/Transaction.js';
import FinancialProfile from '../models/FinancialProfile.js';
import Notification from '../models/Notification.js';
import bcrypt from 'bcryptjs';

/**
 * @route   GET /api/user/profile
 * @desc    Get complete authenticated user profile
 * @access  Private (Protected)
 */
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const financialProfile = await FinancialProfile.findOne({ user: req.user._id });

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        role: user.role,
        currency: user.currency || '₹',
        walletBalance: user.walletBalance || 0,
        profileDetails: user.profileDetails || {},
        riskProfile: user.riskProfile || {},
        notificationPreferences: user.notificationPreferences || {},
        financialProfile: financialProfile || null,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/user/profile
 * @desc    Update user profile & preferences
 * @access  Private (Protected)
 */
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    const {
      name,
      phone,
      dateOfBirth,
      currency,
      profileDetails,
      riskProfile,
      notificationPreferences
    } = req.body;

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    if (currency) user.currency = currency;

    if (profileDetails) {
      user.profileDetails = {
        ...user.profileDetails,
        ...profileDetails
      };
    }

    if (riskProfile) {
      user.riskProfile = {
        ...user.riskProfile,
        ...riskProfile
      };
    }

    if (notificationPreferences) {
      user.notificationPreferences = {
        ...user.notificationPreferences,
        ...notificationPreferences
      };
    }

    await user.save();

    // Also update FinancialProfile if exists
    let finProfile = await FinancialProfile.findOne({ user: user._id });
    if (finProfile) {
      if (name) finProfile.name = user.name;
      if (currency) finProfile.currency = user.currency;
      if (riskProfile) finProfile.riskProfile = { ...finProfile.riskProfile, ...riskProfile };
      await finProfile.save();
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        currency: user.currency,
        walletBalance: user.walletBalance,
        profileDetails: user.profileDetails,
        riskProfile: user.riskProfile,
        notificationPreferences: user.notificationPreferences
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/user/password
 * @desc    Change password
 * @access  Private (Protected)
 */
export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Please provide current and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Current password does not match'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/user/account
 * @desc    Delete user account and all personal isolated records
 * @access  Private (Protected)
 */
export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    await Promise.all([
      Investment.deleteMany({ user: userId }),
      Goal.deleteMany({ user: userId }),
      SIP.deleteMany({ user: userId }),
      Transaction.deleteMany({ user: userId }),
      FinancialProfile.deleteMany({ user: userId }),
      Notification.deleteMany({ recipient: userId }),
      User.findByIdAndDelete(userId)
    ]);

    res.status(200).json({
      success: true,
      message: 'Your account and all associated financial records have been permanently deleted.'
    });
  } catch (error) {
    next(error);
  }
};
