import React, { useState, useEffect } from 'react';
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  PieChart,
  Calendar,
  Layers,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  RefreshCw,
  X
} from 'lucide-react';
import api from '../api/apiClient';

export default function CustomerPortfolioTab({ currentUser, currency = '$', onRefreshParent }) {
  const [loading, setLoading] = useState(true);
  const [portfolioData, setPortfolioData] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Deposit / Withdraw Modal State
  const [txnModalOpen, setTxnModalOpen] = useState(false);
  const [txnType, setTxnType] = useState('Deposit'); // 'Deposit' | 'Withdrawal'
  const [txnAmount, setTxnAmount] = useState('');
  const [txnMethod, setTxnMethod] = useState('Bank Transfer');
  const [txnDescription, setTxnDescription] = useState('');
  const [submittingTxn, setSubmittingTxn] = useState(false);

  const fetchPortfolio = async () => {
    setLoading(true);
    setError(null);
    try {
      const [portRes, invRes, txnRes] = await Promise.all([
        api.getCustomerPortfolio(),
        api.getCustomerInvestments(),
        api.getCustomerTransactions()
      ]);

      if (portRes.success) setPortfolioData(portRes.data);
      if (invRes.success) setInvestments(invRes.data);
      if (txnRes.success) setTransactions(txnRes.data);
    } catch (err) {
      console.error('Failed to load customer portfolio:', err);
      setError(err.message || 'Unable to load portfolio details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleOpenTxnModal = (type) => {
    setTxnType(type);
    setTxnAmount('');
    setTxnDescription('');
    setFeedback(null);
    setTxnModalOpen(true);
  };

  const handleSubmitTransaction = async (e) => {
    e.preventDefault();
    const amount = Number(txnAmount);
    if (!amount || amount <= 0) {
      setFeedback({ type: 'error', message: 'Please enter a valid amount' });
      return;
    }

    if (txnType === 'Withdrawal') {
      const balance = portfolioData?.user?.walletBalance || 0;
      if (amount > balance) {
        setFeedback({
          type: 'error',
          message: `Withdrawal amount exceeds available wallet balance (${currency}${balance.toLocaleString()})`
        });
        return;
      }
    }

    setSubmittingTxn(true);
    try {
      const res = await api.createCustomerTransaction({
        type: txnType,
        amount,
        paymentMethod: txnMethod,
        description: txnDescription
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          message: res.message || `${txnType} submitted successfully!`
        });
        await fetchPortfolio();
        if (onRefreshParent) onRefreshParent();
        setTimeout(() => {
          setTxnModalOpen(false);
          setFeedback(null);
        }, 1500);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to submit transaction' });
    } finally {
      setSubmittingTxn(false);
    }
  };

  const port = portfolioData?.portfolio || {};
  const user = portfolioData?.user || {};

  return (
    <div className="space-y-6">
      {/* Top Banner & Wallet Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border border-emerald-900/40 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Live Holdings & Capital
            </span>
            <span className="text-xs text-slate-400">· Custodial Portfolio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            My Portfolio & Wallet
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Monitor all deployed investments across administered plans, track capital appreciation, and manage your investor balance.
          </p>
        </div>

        {/* Quick Deposit / Withdraw Buttons */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => handleOpenTxnModal('Deposit')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/25 flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Deposit Funds</span>
          </button>
          <button
            onClick={() => handleOpenTxnModal('Withdrawal')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Withdraw</span>
          </button>
          <button
            onClick={fetchPortfolio}
            className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl border border-slate-700 transition"
            title="Refresh Portfolio"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-xs">{error}</p>
        </div>
      )}

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Portfolio Value */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <span className="text-xs font-medium text-slate-400">Total Portfolio Value</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {currency}{(port.currentPortfolioValue || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-500/80 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> Live market value
          </p>
        </div>

        {/* Total Invested */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <span className="text-xs font-medium text-slate-400">Total Capital Invested</span>
          <p className="text-2xl font-black text-white mt-1">
            {currency}{(port.totalInvested || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-indigo-400/80 mt-1">
            {port.activeInvestmentsCount || 0} active allocations
          </p>
        </div>

        {/* Total Returns */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <span className="text-xs font-medium text-slate-400">Net Returns Generated</span>
          <p className="text-2xl font-black text-teal-400 mt-1">
            +{currency}{(port.totalReturns || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-teal-500/80 mt-1">
            +{port.returnPercentage || 0}% total gain
          </p>
        </div>

        {/* Available Wallet Balance */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <span className="text-xs font-medium text-slate-400">Investor Wallet Balance</span>
          <p className="text-2xl font-black text-purple-400 mt-1">
            {currency}{(user.walletBalance || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-purple-400/80 mt-1">Available for immediate deployment</p>
        </div>
      </div>

      {/* Active Holdings Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            My Active Investments
          </h3>
          <span className="text-xs text-slate-400">{investments.length} holdings</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Plan Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Capital Invested</th>
                <th className="py-3 px-4">Current Valuation</th>
                <th className="py-3 px-4">Total Returns</th>
                <th className="py-3 px-4">Maturity Date</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {investments.map((inv) => (
                <tr key={inv._id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-semibold text-white">{inv.plan?.name || 'Investment Plan'}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {inv.plan?.category || 'Equity'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-200">
                    {currency}{(inv.amount || 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-400">
                    {currency}{(inv.currentValue || inv.amount || 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-teal-400 font-semibold">
                    +{currency}{(inv.returns || Math.max(0, (inv.currentValue || 0) - (inv.amount || 0))).toLocaleString()}
                    <span className="text-[10px] text-slate-400 ml-1">({inv.returnPercentage || 0}%)</span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {inv.maturityDate ? new Date(inv.maturityDate).toLocaleDateString() : 'Open-Ended'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {inv.status || 'Active'}
                    </span>
                  </td>
                </tr>
              ))}
              {investments.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    You have not made any investments yet. Visit the "Explore Plans" tab to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            Wallet & Transaction History
          </h3>
          <span className="text-xs text-slate-400">{transactions.length} transactions</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Txn Reference</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {transactions.map((txn) => (
                <tr key={txn._id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-mono text-slate-400">{txn.transactionId}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        txn.type === 'Deposit'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : txn.type === 'Withdrawal'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-indigo-500/20 text-indigo-400'
                      }`}
                    >
                      {txn.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-200">
                    {currency}{(txn.amount || 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-slate-400">{txn.paymentMethod || 'Bank Transfer'}</td>
                  <td className="py-3 px-4 text-slate-400">
                    {new Date(txn.createdAt).toLocaleDateString()} {new Date(txn.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        txn.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : txn.status === 'Pending'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {txn.status}
                    </span>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">
                    No transactions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL: DEPOSIT / WITHDRAWAL */}
      {/* ======================================================== */}
      {txnModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  {txnType === 'Deposit' ? 'Deposit Funds to Wallet' : 'Request Wallet Withdrawal'}
                </h3>
                <p className="text-xs text-slate-400">
                  {txnType === 'Deposit'
                    ? 'Funds will be immediately credited to your investor wallet.'
                    : 'Withdrawals are queued for administrator approval.'}
                </p>
              </div>
              <button
                onClick={() => setTxnModalOpen(false)}
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

            <form onSubmit={handleSubmitTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Amount ({currency}) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">{currency}</span>
                  <input
                    type="number"
                    min="10"
                    placeholder="1000"
                    value={txnAmount}
                    onChange={(e) => setTxnAmount(e.target.value)}
                    required
                    className="w-full pl-8 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Payment Method</label>
                <select
                  value={txnMethod}
                  onChange={(e) => setTxnMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value="Bank Transfer">Direct Wire / Net Banking</option>
                  <option value="Debit Card">Debit / ATM Card</option>
                  <option value="UPI / Instant">UPI / Instant Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Note / Reference (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Monthly savings deposit"
                  value={txnDescription}
                  onChange={(e) => setTxnDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setTxnModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTxn}
                  className={`px-5 py-2 text-white rounded-xl text-xs font-bold shadow-lg transition ${
                    txnType === 'Deposit'
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                      : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                  }`}
                >
                  {submittingTxn ? 'Processing...' : txnType === 'Deposit' ? 'Add Funds' : 'Request Withdrawal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
