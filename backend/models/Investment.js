import mongoose from 'mongoose';

const InvestmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Please provide an investment name'],
      trim: true
    },
    investmentType: {
      type: String,
      enum: [
        'Mutual Funds',
        'Stocks',
        'Fixed Deposits',
        'Gold',
        'Real Estate',
        'Crypto',
        'Bonds',
        'Other'
      ],
      default: 'Mutual Funds'
    },
    amount: {
      type: Number,
      required: [true, 'Please provide investment amount'],
      min: [0, 'Amount cannot be negative']
    },
    currentValue: {
      type: Number,
      required: true,
      min: [0, 'Current value cannot be negative']
    },
    units: {
      type: Number,
      default: 0
    },
    expectedReturn: {
      type: Number,
      default: 10
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    maturityDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['Active', 'Matured', 'Liquidated', 'Cancelled'],
      default: 'Active'
    },
    notes: {
      type: String,
      default: ''
    },
    returns: {
      type: Number,
      default: 0
    },
    returnPercentage: {
      type: Number,
      default: 0
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InvestmentPlan',
      required: false
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook to calculate returns
InvestmentSchema.pre('save', function (next) {
  if (this.currentValue !== undefined && this.amount !== undefined) {
    this.returns = Number((this.currentValue - this.amount).toFixed(2));
    this.returnPercentage = this.amount > 0 ? Number(((this.returns / this.amount) * 100).toFixed(2)) : 0;
  }
  next();
});

export default mongoose.model('Investment', InvestmentSchema);
