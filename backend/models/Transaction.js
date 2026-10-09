import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      unique: true,
      required: true,
      default: () => `TXN-${Math.floor(100000 + Math.random() * 900000)}`
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['Investment', 'Deposit', 'Withdrawal', 'SIP', 'Return', 'Redemption'],
      required: true
    },
    amount: {
      type: Number,
      required: [true, 'Please provide transaction amount'],
      min: [0, 'Amount cannot be negative']
    },
    investment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Investment'
    },
    sip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SIP'
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InvestmentPlan'
    },
    paymentMethod: {
      type: String,
      default: 'Bank Transfer'
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed', 'Cancelled'],
      default: 'Completed'
    },
    description: {
      type: String,
      default: ''
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    actionDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Transaction', TransactionSchema);
