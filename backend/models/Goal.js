import mongoose from 'mongoose';

const GoalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Goal title/name is required'],
      trim: true
    },
    category: {
      type: String,
      enum: [
        'Emergency Fund',
        'Education',
        'Bike',
        'Car',
        'Travel',
        'House',
        'Retirement',
        'Custom Goal',
        'Wealth Creation',
        'Other'
      ],
      default: 'Custom Goal'
    },
    targetAmount: {
      type: Number,
      required: [true, 'Target amount is required'],
      min: [1, 'Target amount must be greater than zero']
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    targetDate: {
      type: Date,
      required: [true, 'Target date is required']
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium'
    },
    expectedAnnualReturn: {
      type: Number,
      default: 8,
      min: 0,
      max: 30
    },
    monthlyRequiredSavings: {
      type: Number,
      default: 0
    },
    progressPercentage: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['In Progress', 'Achieved', 'Paused'],
      default: 'In Progress'
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook to calculate required monthly savings and progress percentage
GoalSchema.pre('save', function (next) {
  const target = this.targetAmount || 0;
  const current = this.currentAmount || 0;

  // Calculate Progress Percentage
  if (target > 0) {
    this.progressPercentage = Number(Math.min(100, Math.max(0, (current / target) * 100)).toFixed(1));
    if (current >= target) {
      this.status = 'Achieved';
    }
  }

  // Calculate remaining months until target date
  const now = new Date();
  const targetDate = new Date(this.targetDate);
  const diffTime = targetDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const monthsRemaining = Math.max(1, Math.round(diffDays / 30.4375));

  const remainingPrincipal = Math.max(0, target - current);

  if (remainingPrincipal <= 0) {
    this.monthlyRequiredSavings = 0;
  } else {
    const annualRate = (this.expectedAnnualReturn || 0) / 100;
    const monthlyRate = annualRate / 12;

    if (monthlyRate > 0) {
      const fvCurrent = current * Math.pow(1 + monthlyRate, monthsRemaining);
      const remainingDeficit = Math.max(0, target - fvCurrent);
      const factor = (Math.pow(1 + monthlyRate, monthsRemaining) - 1) / monthlyRate;
      this.monthlyRequiredSavings = Math.round(remainingDeficit / factor);
    } else {
      this.monthlyRequiredSavings = Math.round(remainingPrincipal / monthsRemaining);
    }
  }

  next();
});

export default mongoose.model('Goal', GoalSchema);
