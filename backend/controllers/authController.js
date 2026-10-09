import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import FinancialProfile from '../models/FinancialProfile.js';
import Notification from '../models/Notification.js';

const JWT_SECRET = process.env.JWT_SECRET || 'investplan_super_secret_jwt_key_2026';

// Helper to generate JWT token
export const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: '30d'
  });
};

/**
 * Seed default Admin and User accounts if they do not exist
 */
export const ensureDefaultAccounts = async () => {
  try {
    // Check Admin
    const adminExists = await User.findOne({ email: 'admin@investplan.com' });
    if (!adminExists) {
      await User.create({
        name: 'Chief Investment Officer',
        email: 'admin@investplan.com',
        password: 'admin123',
        role: 'admin',
        currency: '₹'
      });
      console.log('[Auth] Default Admin account created (admin@investplan.com / admin123)');
    }

    // Check Demo Investor User
    const userExists = await User.findOne({ email: 'user@investplan.com' });
    if (!userExists) {
      const demoUser = await User.create({
        name: 'Alex Johnson',
        email: 'user@investplan.com',
        password: 'user123',
        role: 'customer',
        currency: '₹',
        walletBalance: 25000
      });

      // Ensure profile exists for demo user
      await FinancialProfile.findOneAndUpdate(
        { user: demoUser._id },
        {
          user: demoUser._id,
          name: demoUser.name,
          currency: '₹',
          income: { primaryMonthly: 50000, secondaryMonthly: 10000, otherMonthly: 0 },
          expenses: { housing: 15000, food: 8000, utilities: 3000, transport: 4000, healthcare: 2000, entertainment: 3000, debtEmi: 5000, other: 2000 },
          currentSavings: { cashAndBank: 40000, emergencyFund: 50000, existingInvestments: 100000 }
        },
        { upsert: true, new: true }
      );
      console.log('[Auth] Default User account created (user@investplan.com / user123)');
    }
  } catch (error) {
    console.warn('[Auth] Error checking default accounts:', error.message);
  }
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new investor user with completely isolated empty data
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, currency = '₹' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email, and password'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email already exists'
      });
    }

    // Create user with ZERO wallet balance and empty profile
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone || '',
      currency,
      role: 'customer',
      status: 'active',
      walletBalance: 0
    });

    // Create isolated, empty FinancialProfile for this specific user
    await FinancialProfile.create({
      user: user._id,
      name: user.name,
      currency,
      income: { primaryMonthly: 0, secondaryMonthly: 0, otherMonthly: 0 },
      expenses: { housing: 0, food: 0, utilities: 0, transport: 0, healthcare: 0, entertainment: 0, debtEmi: 0, other: 0 },
      currentSavings: { cashAndBank: 0, emergencyFund: 0, existingInvestments: 0 },
      riskProfile: {
        tolerance: 'Moderate',
        horizonYears: 10,
        riskScore: 5,
        notes: 'New investor account initialized with zero default holdings.'
      }
    });

    // Send a welcome notification to this user
    await Notification.create({
      recipient: user._id,
      title: 'Welcome to InvestPlan!',
      message: 'Your personal financial dashboard is active. Start by adding your first investment, goal, or SIP plan.',
      type: 'System'
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        currency: user.currency,
        walletBalance: user.walletBalance,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login for User or Admin portal
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password, requestedPortal } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    // Find user and include password
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({
        success: false,
        error: 'Your account has been suspended by administration.'
      });
    }

    // Role-based portal validation
    if (requestedPortal === 'admin' && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access Denied: Administrator privileges are required to enter the Admin Portal.'
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        currency: user.currency || '₹',
        walletBalance: user.walletBalance || 0,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client clears token)
 * @access  Public
 */
export const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

/**
 * @route   GET /api/auth/me
 * @desc    Get currently logged in user info
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, error: 'Not authorized, token missing' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        currency: user.currency || '₹',
        walletBalance: user.walletBalance || 0,
        status: user.status
      }
    });
  } catch (error) {
    res.status(401).json({ success: false, error: 'Token invalid or expired' });
  }
};
