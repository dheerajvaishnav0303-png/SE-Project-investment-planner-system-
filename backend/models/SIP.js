import mongoose from 'mongoose';

const SIPSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Please provide a name for this SIP plan'],
      trim: true
    },
    investmentType: {
      type: String,
      enum: [
        'Mutual Funds',
        'Stocks',
        'Fixed Deposits',
        'Gold',
        'Index Funds',
        'Other'
      ],
      default: 'Mutual Funds'
    },
    monthlyAmount: {
      type: Number,
      required: [true, 'Please provide monthly SIP amount'],
      min: [1, 'Monthly amount must be greater than zero']
    },
    durationYears: {
      type: Number,
      required: [true, 'Please provide duration in years'],
      default: 5,
      min: 1
    },
    expectedReturn: {
      type: Number,
      required: [true, 'Please provide expected annual return rate'],
      default: 12,
      min: 0,
      max: 50
    },
    initialInvestment: {
      type: Number,
      default: 0,
      min: 0
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Active', 'Paused', 'Completed', 'Cancelled'],
      default: 'Active'
    },
    totalInvested: {
      type: Number,
      default: 0
    },
    currentValue: {
      type: Number,
      default: 0
    },
    estimatedReturns: {
      type: Number,
      default: 0
    },
    finalProjectedValue: {
      type: Number,
      default: 0
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook to compute SIP projections
SIPSchema.pre('save', function (next) {
  const pmt = this.monthlyAmount || 0;
  const n = (this.durationYears || 1) * 12; // months
  const r = (this.expectedReturn || 12) / 100 / 12; // monthly rate
  const initial = this.initialInvestment || 0;

  // Formula: FV = P*(1+r)^n + PMT * [((1+r)^n - 1) / r] * (1+r)
  let fv = 0;
  const totalDeposited = initial + pmt * n;

  if (r > 0) {
    const fvInitial = initial * Math.pow(1 + r, n);
    const fvSip = pmt * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    fv = Math.round(fvInitial + fvSip);
  } else {
    fv = totalDeposited;
  }

  this.finalProjectedValue = fv;
  this.estimatedReturns = Math.max(0, fv - totalDeposited);

  if (!this.totalInvested || this.totalInvested === 0) {
    this.totalInvested = initial > 0 ? initial : pmt;
    this.currentValue = this.totalInvested;
  }

  next();
});

export default mongoose.model('SIP', SIPSchema);
