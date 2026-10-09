import mongoose from 'mongoose';

const FinancialProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    name: {
      type: String,
      trim: true,
      default: 'Investor'
    },
    age: {
      type: Number,
      min: 18,
      max: 100,
      default: 28
    },
    occupation: {
      type: String,
      trim: true,
      default: ''
    },
    currency: {
      type: String,
      default: '₹'
    },
    income: {
      primaryMonthly: { type: Number, default: 0, min: 0 },
      secondaryMonthly: { type: Number, default: 0, min: 0 },
      otherMonthly: { type: Number, default: 0, min: 0 }
    },
    expenses: {
      housing: { type: Number, default: 0, min: 0 },
      food: { type: Number, default: 0, min: 0 },
      utilities: { type: Number, default: 0, min: 0 },
      transport: { type: Number, default: 0, min: 0 },
      healthcare: { type: Number, default: 0, min: 0 },
      entertainment: { type: Number, default: 0, min: 0 },
      debtEmi: { type: Number, default: 0, min: 0 },
      other: { type: Number, default: 0, min: 0 }
    },
    currentSavings: {
      cashAndBank: { type: Number, default: 0, min: 0 },
      emergencyFund: { type: Number, default: 0, min: 0 },
      existingInvestments: { type: Number, default: 0, min: 0 }
    },
    riskProfile: {
      tolerance: {
        type: String,
        enum: ['Conservative', 'Moderate', 'Aggressive'],
        default: 'Moderate'
      },
      horizonYears: {
        type: Number,
        default: 10,
        min: 1,
        max: 50
      },
      riskScore: {
        type: Number,
        default: 5,
        min: 1,
        max: 10
      },
      notes: {
        type: String,
        default: 'Balanced growth seeking reasonable capital appreciation with moderate volatility tolerance.'
      }
    },
    calculatedMetrics: {
      totalMonthlyIncome: { type: Number, default: 0 },
      totalMonthlyExpenses: { type: Number, default: 0 },
      monthlySavings: { type: Number, default: 0 },
      savingsRate: { type: Number, default: 0 },
      emergencyFundRecommended: { type: Number, default: 0 },
      emergencyFundStatus: {
        type: String,
        enum: ['Deficit', 'Adequate', 'Healthy'],
        default: 'Adequate'
      }
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook to compute derived financial metrics
FinancialProfileSchema.pre('save', function (next) {
  const inc = this.income || {};
  const exp = this.expenses || {};
  const savings = this.currentSavings || {};

  const totalIncome = (inc.primaryMonthly || 0) + (inc.secondaryMonthly || 0) + (inc.otherMonthly || 0);
  const totalExpenses =
    (exp.housing || 0) +
    (exp.food || 0) +
    (exp.utilities || 0) +
    (exp.transport || 0) +
    (exp.healthcare || 0) +
    (exp.entertainment || 0) +
    (exp.debtEmi || 0) +
    (exp.other || 0);

  const monthlySavings = Math.max(0, totalIncome - totalExpenses);
  const savingsRate = totalIncome > 0 ? Number(((monthlySavings / totalIncome) * 100).toFixed(1)) : 0;

  // 6 months of expenses recommended for emergency fund
  const emergencyFundRecommended = totalExpenses * 6;
  const currentEmergencyFund = (savings.emergencyFund || 0) + (savings.cashAndBank || 0);

  let emergencyFundStatus = 'Adequate';
  if (currentEmergencyFund < emergencyFundRecommended * 0.5) {
    emergencyFundStatus = 'Deficit';
  } else if (currentEmergencyFund >= emergencyFundRecommended) {
    emergencyFundStatus = 'Healthy';
  }

  this.calculatedMetrics = {
    totalMonthlyIncome: totalIncome,
    totalMonthlyExpenses: totalExpenses,
    monthlySavings,
    savingsRate,
    emergencyFundRecommended,
    emergencyFundStatus
  };

  next();
});

export default mongoose.model('FinancialProfile', FinancialProfileSchema);
