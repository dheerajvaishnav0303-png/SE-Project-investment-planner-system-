import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    dateOfBirth: {
      type: Date
    },
    role: {
      type: String,
      enum: ['user', 'customer', 'admin'],
      default: 'customer'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'blocked'],
      default: 'active'
    },
    currency: {
      type: String,
      default: '₹'
    },
    walletBalance: {
      type: Number,
      default: 0,
      min: 0
    },
    profileDetails: {
      monthlyIncome: { type: Number, default: 0, min: 0 },
      monthlySavings: { type: Number, default: 0, min: 0 },
      investmentExperience: { type: String, default: 'Beginner' },
      riskPreference: { type: String, default: 'Moderate' },
      investmentObjectives: [{ type: String }]
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
    notificationPreferences: {
      email: { type: Boolean, default: true },
      sipReminders: { type: Boolean, default: true },
      goalAlerts: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false }
    }
  },
  {
    timestamps: true
  }
);

// Hash password prior to saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', UserSchema);
