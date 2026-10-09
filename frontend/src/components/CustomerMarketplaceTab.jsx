import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  TrendingUp,
  ShieldAlert,
  Clock,
  DollarSign,
  ArrowUpRight,
  CheckCircle,
  AlertCircle,
  Layers,
  Sparkles,
  Wallet,
  X
} from 'lucide-react';
import api from '../api/apiClient';

export default function CustomerMarketplaceTab({ currentUser, currency = '$', onInvestmentSuccess }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [investAmount, setInvestAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Wallet Balance');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [userWalletBalance, setUserWalletBalance] = useState(0);

  // Fetch available plans and wallet balance
  const loadPlansAndWallet = async () => {
    setLoading(true);
    setError(null);
    try {
      const [plansRes, portfolioRes] = await Promise.all([
        api.getCustomerPlans(),
        api.getCustomerPortfolio()
      ]);

      if (plansRes.success) setPlans(plansRes.data);
      if (portfolioRes.success && portfolioRes.data.user) {
        setUserWalletBalance(portfolioRes.data.user.walletBalance || 0);
      }
    } catch (err) {
      console.error('Failed to load plans:', err);
      setError(err.message || 'Unable to retrieve published investment plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlansAndWallet();
  }, []);

  const handleOpenInvestModal = (plan) => {
    setSelectedPlan(plan);
    setInvestAmount(String(plan.minInvestment || 1000));
    setPaymentMethod('Wallet Balance');
    setNotes('');
    setFeedback(null);
  };

  const handleConfirmInvestment = async (e) => {
    e.preventDefault();
    if (!selectedPlan) return;

    const amount = Number(investAmount);
    if (amount < selectedPlan.minInvestment) {
      setFeedback({
        type: 'error',
        message: `Minimum required investment is ${currency}${selectedPlan.minInvestment.toLocaleString()}`
      });
      return;
    }

    if (paymentMethod === 'Wallet Balance' && userWalletBalance < amount) {
      setFeedback({
        type: 'error',
        message: `Insufficient wallet balance (${currency}${userWalletBalance.toLocaleString()}). Select Bank Transfer or deposit funds first.`
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createCustomerInvestment({
        planId: selectedPlan._id,
        amount,
        paymentMethod,
        notes
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Successfully allocated ${currency}${amount.toLocaleString()} into ${selectedPlan.name}!`
        });
        if (res.data?.remainingWalletBalance !== undefined) {
          setUserWalletBalance(res.data.remainingWalletBalance);
        }
        setTimeout(() => {
          setSelectedPlan(null);
          setFeedback(null);
          if (onInvestmentSuccess) onInvestmentSuccess();
        }, 1500);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Investment failed' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-900/40 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              Admin Curated Products
            </span>
            <span className="text-xs text-slate-400">· Real-time Market Opportunities</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Explore Investment Plans
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Choose from professionally structured portfolios designed by wealth managers. Directly allocate capital using your investor wallet or linked bank account.
          </p>
        </div>

        {/* Wallet Balance Capsule */}
        <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-700/80 p-4 rounded-xl self-start md:self-auto">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Available Wallet Balance</span>
            <span className="text-xl font-black text-white">
              {currency}{userWalletBalance.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-xs">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading investment opportunities...</p>
        </div>
      ) : (
        /* Plans Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className={`rounded-2xl bg-slate-900/90 border transition-all p-6 flex flex-col justify-between shadow-lg hover:shadow-indigo-500/10 ${
                plan.featured ? 'border-indigo-500/50 relative' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md">
                  ★ High Conviction
                </div>
              )}

              <div className="space-y-4">
                {/* Category & Risk */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    {plan.category}
                  </span>
                  <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {plan.riskLevel} Risk
                  </span>
                </div>

                {/* Plan Name & Desc */}
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-3 leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                {/* Expected Return Highlight Box */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/30 via-slate-800/60 to-slate-900 border border-emerald-900/40 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Target Annual Return</span>
                    <span className="text-2xl font-black text-emerald-400">
                      +{plan.expectedReturn}% <span className="text-xs font-medium text-slate-400">p.a.</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Min. Entry</span>
                    <span className="text-sm font-bold text-white">
                      {currency}{(plan.minInvestment || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Duration & Investors */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Horizon: <strong>{plan.durationMonths || 12} Mos</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-end">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    <span>Allocated: <strong>{currency}{(plan.totalAUM || 0).toLocaleString()}</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-4 border-t border-slate-800">
                <button
                  onClick={() => handleOpenInvestModal(plan)}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Invest Now</span>
                </button>
              </div>
            </div>
          ))}

          {plans.length === 0 && (
            <div className="col-span-full p-12 text-center text-slate-500 rounded-2xl bg-slate-900 border border-slate-800">
              No active investment plans currently published. Check back soon!
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: INVEST NOW */}
      {/* ======================================================== */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                  Portfolio Deployment
                </span>
                <h3 className="text-base font-bold text-white">{selectedPlan.name}</h3>
                <p className="text-xs text-slate-400">Target return: +{selectedPlan.expectedReturn}% p.a.</p>
              </div>
              <button
                onClick={() => setSelectedPlan(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {feedback && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  feedback.type === 'error'
                    ? 'bg-rose-950/80 border border-rose-800 text-rose-300'
                    : 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
                }`}
              >
                {feedback.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleConfirmInvestment} className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <label className="font-medium text-slate-300">Investment Amount ({currency}) *</label>
                  <span className="text-slate-500">Min: {currency}{selectedPlan.minInvestment.toLocaleString()}</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">{currency}</span>
                  <input
                    type="number"
                    min={selectedPlan.minInvestment}
                    step="100"
                    placeholder={String(selectedPlan.minInvestment)}
                    value={investAmount}
                    onChange={(e) => setInvestAmount(e.target.value)}
                    required
                    className="w-full pl-8 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value="Wallet Balance">
                    Investor Wallet Balance ({currency}{userWalletBalance.toLocaleString()})
                  </option>
                  <option value="Bank Transfer">Direct Bank Wire / Net Banking</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Investment Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Retirement allocation, 5-year target"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-[11px] text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Lock-in Duration:</span>
                  <span className="text-slate-200 font-semibold">{selectedPlan.durationMonths || 12} Months</span>
                </div>
                <div className="flex justify-between">
                  <span>Management Fee:</span>
                  <span className="text-emerald-400 font-semibold">0.0% (Zero Fee Promotion)</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPlan(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5"
                >
                  <span>{submitting ? 'Confirming...' : 'Authorize Investment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
