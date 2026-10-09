import FinancialProfile from '../models/FinancialProfile.js';

/**
 * @route   GET /api/profile
 * @desc    Get the active financial profile for authenticated user
 * @access  Private (Protected)
 */
export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let profile = await FinancialProfile.findOne({ user: userId });

    if (!profile) {
      // Create clean empty profile for this specific user
      profile = new FinancialProfile({
        user: userId,
        name: req.user.name,
        currency: req.user.currency || '₹',
        income: {
          primaryMonthly: 0,
          secondaryMonthly: 0,
          otherMonthly: 0
        },
        expenses: {
          housing: 0,
          food: 0,
          utilities: 0,
          transport: 0,
          healthcare: 0,
          entertainment: 0,
          debtEmi: 0,
          other: 0
        },
        currentSavings: {
          cashAndBank: 0,
          emergencyFund: 0,
          existingInvestments: 0
        },
        riskProfile: {
          tolerance: req.user.riskProfile?.tolerance || 'Moderate',
          horizonYears: req.user.riskProfile?.horizonYears || 10,
          riskScore: req.user.riskProfile?.riskScore || 5,
          notes: 'Personal financial profile'
        }
      });

      await profile.save();
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/profile
 * @desc    Update financial profile for authenticated user
 * @access  Private (Protected)
 */
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let profile = await FinancialProfile.findOne({ user: userId });

    if (!profile) {
      profile = new FinancialProfile({ user: userId });
    }

    const {
      name,
      age,
      occupation,
      currency,
      income,
      expenses,
      currentSavings,
      riskProfile
    } = req.body;

    if (name) profile.name = name;
    if (age !== undefined) profile.age = age;
    if (occupation !== undefined) profile.occupation = occupation;
    if (currency) profile.currency = currency;

    if (income) {
      profile.income = {
        primaryMonthly: Number(income.primaryMonthly || 0),
        secondaryMonthly: Number(income.secondaryMonthly || 0),
        otherMonthly: Number(income.otherMonthly || 0)
      };
    }

    if (expenses) {
      profile.expenses = {
        housing: Number(expenses.housing || 0),
        food: Number(expenses.food || 0),
        utilities: Number(expenses.utilities || 0),
        transport: Number(expenses.transport || 0),
        healthcare: Number(expenses.healthcare || 0),
        entertainment: Number(expenses.entertainment || 0),
        debtEmi: Number(expenses.debtEmi || 0),
        other: Number(expenses.other || 0)
      };
    }

    if (currentSavings) {
      profile.currentSavings = {
        cashAndBank: Number(currentSavings.cashAndBank || 0),
        emergencyFund: Number(currentSavings.emergencyFund || 0),
        existingInvestments: Number(currentSavings.existingInvestments || 0)
      };
    }

    if (riskProfile) {
      profile.riskProfile = {
        tolerance: riskProfile.tolerance || profile.riskProfile?.tolerance || 'Moderate',
        horizonYears: Number(riskProfile.horizonYears || profile.riskProfile?.horizonYears || 10),
        riskScore: Number(riskProfile.riskScore || profile.riskProfile?.riskScore || 5),
        notes: riskProfile.notes || profile.riskProfile?.notes || ''
      };
    }

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Financial profile updated successfully',
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/profile/reset
 * @desc    Reset financial profile to zero for authenticated user
 * @access  Private (Protected)
 */
export const resetProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let profile = await FinancialProfile.findOne({ user: userId });

    if (!profile) {
      profile = new FinancialProfile({ user: userId });
    }

    profile.income = { primaryMonthly: 0, secondaryMonthly: 0, otherMonthly: 0 };
    profile.expenses = { housing: 0, food: 0, utilities: 0, transport: 0, healthcare: 0, entertainment: 0, debtEmi: 0, other: 0 };
    profile.currentSavings = { cashAndBank: 0, emergencyFund: 0, existingInvestments: 0 };
    profile.riskProfile = { tolerance: 'Moderate', horizonYears: 10, riskScore: 5, notes: '' };

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Financial profile cleared successfully',
      data: profile
    });
  } catch (error) {
    next(error);
  }
};
