import React, { useState, useEffect } from 'react';
import { 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Wallet, 
  CreditCard, 
  PiggyBank, 
  DollarSign,
  User,
  ShieldCheck
} from 'lucide-react';

export default function ProfileTab({ profile, onUpdateProfile, onResetProfile }) {
  const [formData, setFormData] = useState({
    name: '',
    age: 30,
    occupation: '',
    currency: '$',
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
    }
  });

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        age: profile.age || 30,
        occupation: profile.occupation || '',
        currency: profile.currency || '$',
        income: {
          primaryMonthly: profile.income?.primaryMonthly || 0,
          secondaryMonthly: profile.income?.secondaryMonthly || 0,
          otherMonthly: profile.income?.otherMonthly || 0
        },
        expenses: {
          housing: profile.expenses?.housing || 0,
          food: profile.expenses?.food || 0,
          utilities: profile.expenses?.utilities || 0,
          transport: profile.expenses?.transport || 0,
          healthcare: profile.expenses?.healthcare || 0,
          entertainment: profile.expenses?.entertainment || 0,
          debtEmi: profile.expenses?.debtEmi || 0,
          other: profile.expenses?.other || 0
        },
        currentSavings: {
          cashAndBank: profile.currentSavings?.cashAndBank || 0,
          emergencyFund: profile.currentSavings?.emergencyFund || 0,
          existingInvestments: profile.currentSavings?.existingInvestments || 0
        }
      });
    }
  }, [profile]);

  // Handle nested input changes
  const handleNestedChange = (group, field, value) => {
    const num = Math.max(0, Number(value) || 0);
    setFormData((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [field]: num
      }
    }));
  };

  // Real-time live derived calculations
  const totalIncome =
    (formData.income.primaryMonthly || 0) +
    (formData.income.secondaryMonthly || 0) +
    (formData.income.otherMonthly || 0);

  const totalExpenses =
    (formData.expenses.housing || 0) +
    (formData.expenses.food || 0) +
    (formData.expenses.utilities || 0) +
    (formData.expenses.transport || 0) +
    (formData.expenses.healthcare || 0) +
    (formData.expenses.entertainment || 0) +
    (formData.expenses.debtEmi || 0) +
    (formData.expenses.other || 0);

  const netSavings = Math.max(0, totalIncome - totalExpenses);
  const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : 0;
  const emergencyRecommended = totalExpenses * 6;
  const curr = formData.currency || '$';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      await onUpdateProfile(formData);
      setFeedback({ type: 'success', message: 'Financial profile and budget saved successfully!' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save profile' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Income & Monthly Budget</h1>
          <p className="text-sm text-slate-400">
            Define your inflows, baseline expenses, and current liquid assets to calculate exact investable savings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onResetProfile}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Values</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-sm animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/80 border-rose-800 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Input Fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* Investor Personal Details Card */}
          <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-emerald-400" />
              <span>Personal Information</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Age</label>
                <input
                  type="number"
                  min="18"
                  max="100"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Occupation / Profession</label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Currency Symbol</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="$">$ (USD / CAD / AUD)</option>
                  <option value="₹">₹ (INR)</option>
                  <option value="€">€ (EUR)</option>
                  <option value="£">£ (GBP)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Income Sources Card */}
          <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>Monthly Inflows (Income)</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Primary Monthly Salary</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2 text-slate-500 text-sm">{curr}</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.income.primaryMonthly}
                    onChange={(e) => handleNestedChange('income', 'primaryMonthly', e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Secondary / Freelance</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2 text-slate-500 text-sm">{curr}</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.income.secondaryMonthly}
                    onChange={(e) => handleNestedChange('income', 'secondaryMonthly', e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Other Recurring Income</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2 text-slate-500 text-sm">{curr}</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.income.otherMonthly}
                    onChange={(e) => handleNestedChange('income', 'otherMonthly', e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Expenses Breakdown */}
          <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4 text-rose-400" />
              <span>Monthly Expenses & Commitments</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Housing (Rent/EMI)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-500 text-sm">{curr}</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.expenses.housing}
                    onChange={(e) => handleNestedChange('expenses', 'housing', e.target.value)}
                    className="w-full pl-7 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Food & Groceries</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-500 text-sm">{curr}</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.expenses.food}
                    onChange={(e) => handleNestedChange('expenses', 'food', e.target.value)}
                    className="w-full pl-7 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Utilities & Bills</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-500 text-sm">{curr}</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.expenses.utilities}
                    onChange={(e) => handleNestedChange('expenses', 'utilities', e.target.value)}
                    className="w-full pl-7 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Transportation</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-500 text-sm">{curr}</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.expenses.transport}
                    onChange={(e) => handleNestedChange('expenses', 'transport', e.target.value)}
                    className="w-full pl-7 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Healthcare & Insurance</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-500 text-sm">{curr}</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.expenses.healthcare}
                    onChange={(e) => handleNestedChange('expenses', 'healthcare', e.target.value)}
                    className="w-full pl-7 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Entertainment / Dining</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-500 text-sm">{curr}</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.expenses.entertainment}
                    onChange={(e) => handleNestedChange('expenses', 'entertainment', e.target.value)}
                    className="w-full pl-7 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Debt / Loans / EMI</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-500 text-sm">{curr}</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.expenses.debtEmi}
                    onChange={(e) => handleNestedChange('expenses', 'debtEmi', e.target.value)}
                    className="w-full pl-7 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Other Discretionary</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-500 text-sm">{curr}</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.expenses.other}
                    onChange={(e) => handleNestedChange('expenses', 'other', e.target.value)}
                    className="w-full pl-7 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Current Savings & Existing Corpus */}
          <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <PiggyBank className="w-4 h-4 text-cyan-400" />
              <span>Current Assets & Existing Savings</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Cash in Bank / Checking</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2 text-slate-500 text-sm">{curr}</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.currentSavings.cashAndBank}
                    onChange={(e) => handleNestedChange('currentSavings', 'cashAndBank', e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Dedicated Emergency Fund</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2 text-slate-500 text-sm">{curr}</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.currentSavings.emergencyFund}
                    onChange={(e) => handleNestedChange('currentSavings', 'emergencyFund', e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Existing Investments (Stocks/MF)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2 text-slate-500 text-sm">{curr}</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.currentSavings.existingInvestments}
                    onChange={(e) => handleNestedChange('currentSavings', 'existingInvestments', e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Live Dynamic Calculations Summary */}
        <div className="space-y-6">
          <div className="sticky top-24 bg-slate-800/80 border border-slate-700/70 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-700 pb-3">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span>Live Monthly Calculation</span>
            </h3>

            {/* Inflows vs Outflows */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Total Monthly Inflows:</span>
                <span className="font-semibold text-emerald-400">{curr}{totalIncome.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Total Monthly Outflows:</span>
                <span className="font-semibold text-rose-400">-{curr}{totalExpenses.toLocaleString()}</span>
              </div>
              <div className="border-t border-slate-700 pt-3 flex justify-between items-center">
                <span className="text-sm font-bold text-white">Net Monthly Savings:</span>
                <span className="text-xl font-black text-emerald-400">{curr}{netSavings.toLocaleString()}</span>
              </div>
            </div>

            {/* Savings Rate Gauge */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Computed Savings Rate</span>
                <span className="font-bold text-white text-sm">{savingsRate}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full ${
                    savingsRate >= 30 ? 'bg-emerald-400' : savingsRate >= 15 ? 'bg-amber-400' : 'bg-rose-400'
                  }`}
                  style={{ width: `${Math.min(100, savingsRate)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                {savingsRate >= 30
                  ? '🌟 Outstanding! You save > 30% of income.'
                  : savingsRate >= 15
                  ? '👍 Good! Standard recommended benchmark is 20%+.'
                  : '⚠️ High expenses. Trimming discretionary costs will boost investments.'}
              </p>
            </div>

            {/* Emergency Reserve Benchmark */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                <ShieldCheck className="w-4 h-4" />
                <span>6-Month Safety Target</span>
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>Target: {curr}{emergencyRecommended.toLocaleString()}</span>
                <span>Current: {curr}{formData.currentSavings.emergencyFund.toLocaleString()}</span>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Financial Profile'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
