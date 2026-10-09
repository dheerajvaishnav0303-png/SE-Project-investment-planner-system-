import Goal from '../models/Goal.js';
import Notification from '../models/Notification.js';

/**
 * @route   GET /api/goals
 * @desc    Get all financial goals belonging strictly to authenticated user
 * @access  Private (Protected)
 */
export const getGoals = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const goals = await Goal.find({ user: userId }).sort({ targetDate: 1 });

    res.status(200).json({
      success: true,
      count: goals.length,
      data: goals
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/goals
 * @desc    Create a new financial goal for authenticated user
 * @access  Private (Protected)
 */
export const createGoal = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      title,
      name,
      category = 'Custom Goal',
      targetAmount,
      currentAmount = 0,
      targetDate,
      priority = 'Medium',
      expectedAnnualReturn = 8
    } = req.body;

    const goalTitle = title || name;

    if (!goalTitle || !targetAmount || !targetDate) {
      return res.status(400).json({
        success: false,
        error: 'Please provide goal title/name, target amount, and target date'
      });
    }

    const goal = await Goal.create({
      user: userId,
      title: goalTitle.trim(),
      category,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount || 0),
      targetDate: new Date(targetDate),
      priority,
      expectedAnnualReturn: Number(expectedAnnualReturn || 8)
    });

    // Create user notification
    await Notification.create({
      recipient: userId,
      title: `Goal Created: ${goal.title}`,
      message: `Your target of ${req.user.currency || '₹'}${goal.targetAmount.toLocaleString()} has been set for ${new Date(goal.targetDate).toLocaleDateString()}.`,
      type: 'Goal'
    });

    res.status(201).json({
      success: true,
      message: 'Financial goal created successfully',
      data: goal
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/goals/:id
 * @desc    Get single financial goal by ID (strictly verified for ownership)
 * @access  Private (Protected)
 */
export const getGoalById = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Financial goal not found or you do not have permission to view it.'
      });
    }

    res.status(200).json({
      success: true,
      data: goal
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/goals/:id
 * @desc    Update financial goal (strictly verified for ownership)
 * @access  Private (Protected)
 */
export const updateGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Financial goal not found or unauthorized.'
      });
    }

    const {
      title,
      name,
      category,
      targetAmount,
      currentAmount,
      targetDate,
      priority,
      expectedAnnualReturn,
      status
    } = req.body;

    if (title || name) goal.title = (title || name).trim();
    if (category) goal.category = category;
    if (targetAmount !== undefined) goal.targetAmount = Number(targetAmount);
    if (currentAmount !== undefined) goal.currentAmount = Number(currentAmount);
    if (targetDate) goal.targetDate = new Date(targetDate);
    if (priority) goal.priority = priority;
    if (expectedAnnualReturn !== undefined) goal.expectedAnnualReturn = Number(expectedAnnualReturn);
    if (status) goal.status = status;

    await goal.save();

    res.status(200).json({
      success: true,
      message: 'Goal updated successfully',
      data: goal
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/goals/:id
 * @desc    Delete financial goal (strictly verified for ownership)
 * @access  Private (Protected)
 */
export const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Financial goal not found or unauthorized.'
      });
    }

    await goal.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Financial goal deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
