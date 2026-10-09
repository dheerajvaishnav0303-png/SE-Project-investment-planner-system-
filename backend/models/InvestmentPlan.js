import mongoose from 'mongoose';

const InvestmentPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide an investment plan name'],
      trim: true,
      unique: true
    },
    category: {
      type: String,
      enum: ['Equity', 'Debt', 'Hybrid', 'Commodities', 'Real Estate', 'Retirement', 'High Growth'],
      default: 'Equity'
    },
    riskLevel: {
      type: String,
      enum: ['Low', 'Moderate', 'High', 'Very High'],
      default: 'Moderate'
    },
    expectedReturn: {
      type: Number,
      required: [true, 'Please provide expected return percentage'],
      min: 0,
      max: 100
    },
    minInvestment: {
      type: Number,
      required: [true, 'Please provide minimum investment amount'],
      min: 100,
      default: 1000
    },
    durationMonths: {
      type: Number,
      required: [true, 'Please provide duration in months'],
      min: 1,
      default: 12
    },
    description: {
      type: String,
      required: [true, 'Please provide a plan description'],
      trim: true
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'archived'],
      default: 'active'
    },
    assetAllocation: [
      {
        assetClass: { type: String, required: true },
        percentage: { type: Number, required: true, min: 0, max: 100 },
        color: { type: String, default: '#10b981' }
      }
    ],
    featured: {
      type: Boolean,
      default: false
    },
    totalInvestorsCount: {
      type: Number,
      default: 0
    },
    totalAUM: {
      type: Number,
      default: 0
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('InvestmentPlan', InvestmentPlanSchema);
