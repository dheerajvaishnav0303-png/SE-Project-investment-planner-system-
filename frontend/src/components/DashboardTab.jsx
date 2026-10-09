import React from 'react';
import { 
  TrendingUp, 
  Wallet, 
  CreditCard, 
  PiggyBank, 
  Percent, 
  ShieldCheck, 
  Target, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

export default function DashboardTab({ summary, onNavigate }) {
  if (!summary) return null;

  const currency = summary.currency || '$';
  const formatMoney = (val) => `${currency}${Number(val || 0).toLocaleString()}`;

  const income = summary.monthlyIncome || 0;
  const expenses = summary.monthlyExpenses || 0;
  const savings = summary.monthlySavings || 0;
  const savingsRate = summary.savingsRate || 0;

  const emergency = summary.emergencyFund || {};
  const emergencyPct = emergency.recommended > 0 
    ? Math.min(100, Math.round((emergency.current / emergency.recommended) * 100)) 
    : 0;

  const goals = summary.goals || {};
  const investment = summary.investmentOverview || {};
  const isFundable = investment.isFullyFundable;

  return (
    <div className="space-y-6">
      {/* Top Greeting & Status Banner */}
      <div className="bg-gradient-to-r from-slate-800/90 via-slate-800/60 to-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {summary.riskProfile?.tolerance || 'Moderate'} Investor
              </span>
              <span className="text-xs text-slate-400">· Horizon: {summary.riskProfile?.horizonYears || 10} Years</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Welcome back, {summary.profileName}!
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Your financial blueprint is active. You generate <span className="text-emerald-400 font-semibold">{formatMoney(savings)}</span> in net monthly savings ({savingsRate}% savings rate) to deploy toward your goals.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('profile')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium rounded-xl border border-slate-700 transition"
            >
              Update Budget
            </button>
            <button
              onClick={() => onNavigate('plan')}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-semibold rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
            >
              <span>View Full Plan</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Income Card */}
        <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-5 shadow-sm hover:border-slate-600 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Monthly Income</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{formatMoney(income)}</div>
          <div className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
            <span className="text-emerald-400 font-medium">Primary + Secondary</span>
            <span>inflows</span>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-5 shadow-sm hover:border-slate-600 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Monthly Expenses</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{formatMoney(expenses)}</div>
          <div className="text-xs text-slate-400 mt-1.5">
            Fixed living costs & discretionary
          </div>
        </div>

        {/* Monthly Savings Card */}
        <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-5 shadow-sm hover:border-slate-600 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Net Monthly Savings</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400">{formatMoney(savings)}</div>
          <div className="text-xs text-slate-400 mt-1.5">
            Free cash flow for investments
          </div>
        </div>

        {/* Savings Rate Card */}
        <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-5 shadow-sm hover:border-slate-600 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Savings Rate</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{savingsRate}%</div>
          <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className={`h-1.5 rounded-full ${savingsRate >= 30 ? 'bg-emerald-400' : savingsRate >= 15 ? 'bg-amber-400' : 'bg-rose-400'}`}
              style={{ width: `${Math.min(100, savingsRate)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Middle Row: Emergency Fund & Goals Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emergency Fund Card */}
        <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Emergency Liquidity Reserve</h2>
                <p className="text-xs text-slate-400">Recommended: 6 months of expenses</p>
              </div>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              emergency.status === 'Healthy'
                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                : emergency.status === 'Adequate'
                ? 'bg-blue-950/80 text-blue-400 border-blue-800'
                : 'bg-rose-950/80 text-rose-400 border-rose-800'
            }`}>
              {emergency.status}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-baseline text-sm">
              <span className="text-slate-400">Current Reserve:</span>
              <span className="text-white font-semibold">{formatMoney(emergency.current)}</span>
            </div>
            <div className="flex justify-between items-baseline text-sm">
              <span className="text-slate-400">6-Month Target ({formatMoney(expenses)}/mo):</span>
              <span className="text-slate-300 font-semibold">{formatMoney(emergency.recommended)}</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-700/60 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  emergencyPct >= 100 ? 'bg-emerald-400' : 'bg-gradient-to-r from-amber-500 to-emerald-400'
                }`}
                style={{ width: `${emergencyPct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>{emergencyPct}% Funded</span>
              <span>{emergencyPct >= 100 ? 'Target Achieved' : `${formatMoney(emergency.recommended - emergency.current)} needed`}</span>
            </div>
          </div>
        </div>

        {/* Goals Summary Card */}
        <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Active Goals Overview</h2>
                  <p className="text-xs text-slate-400">{goals.count || 0} financial targets registered</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('goals')}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 font-medium"
              >
                <span>Manage</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/50">
                <p className="text-xs text-slate-400">Total Goals Target</p>
                <p className="text-lg font-bold text-white mt-0.5">{formatMoney(goals.totalTarget)}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/50">
                <p className="text-xs text-slate-400">Saved Towards Goals</p>
                <p className="text-lg font-bold text-emerald-400 mt-0.5">{formatMoney(goals.totalSaved)}</p>
              </div>
            </div>

            {/* Feasibility Alert */}
            <div className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs ${
              isFundable 
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
            }`}>
              {isFundable ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <div>
                <span className="font-semibold">
                  Required Monthly SIP: {formatMoney(goals.totalRequiredMonthly)}
                </span>
                <span className="ml-1 opacity-90">
                  {isFundable
                    ? `· Fully covered by your ${formatMoney(savings)} savings (surplus ${formatMoney(investment.surplusOrDeficit)}/mo)`
                    : `· Deficit of ${formatMoney(Math.abs(investment.surplusOrDeficit))}/mo. Consider adjusting target dates or expenses.`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recommended Allocation & 10/20 Year Wealth Projections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Asset Allocation Preview */}
        <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Recommended Allocation</h2>
              <p className="text-xs text-slate-400">{investment.strategyName}</p>
            </div>
            <span className="px-2 py-0.5 text-xs font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              ~{investment.blendedAnnualReturn}% Return
            </span>
          </div>

          <div className="space-y-3">
            {investment.topAllocations?.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{item.assetClass}</span>
                  <span className="text-slate-400 font-semibold">{item.percentage}% ({formatMoney(item.monthlyAmount)}/mo)</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full"
                    style={{ width: `${item.percentage}%`, backgroundColor: item.color || '#10b981' }}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate('plan')}
            className="w-full mt-5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-900 border border-slate-700 rounded-xl transition flex items-center justify-center gap-1.5"
          >
            <span>Explore Complete Allocation Strategy</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Wealth Compounding Projections Highlight */}
        <div className="lg:col-span-2 bg-slate-800/70 border border-slate-700/60 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white">Long-Term Wealth Trajectory</h2>
                <p className="text-xs text-slate-400">Assuming consistent monthly deployment of {formatMoney(savings)} at {investment.blendedAnnualReturn}% return</p>
              </div>
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              {/* 10-Year Milestone */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-slate-700/60">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">10-Year Horizon</span>
                  <span className="text-[11px] text-slate-400">Decade Milestone</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {formatMoney(investment.projection10Yr?.futureValue)}
                </div>
                <div className="mt-3 space-y-1 text-xs border-t border-slate-800 pt-3">
                  <div className="flex justify-between text-slate-400">
                    <span>Principal Invested:</span>
                    <span className="text-slate-300 font-medium">{formatMoney(investment.projection10Yr?.totalInvested)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Compound Wealth Gained:</span>
                    <span>+{formatMoney(investment.projection10Yr?.wealthGained)}</span>
                  </div>
                </div>
              </div>

              {/* 20-Year Milestone */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-slate-700/60">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-400">20-Year Horizon</span>
                  <span className="text-[11px] text-slate-400">Financial Freedom</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-300">
                  {formatMoney(investment.projection20Yr?.futureValue)}
                </div>
                <div className="mt-3 space-y-1 text-xs border-t border-slate-800 pt-3">
                  <div className="flex justify-between text-slate-400">
                    <span>Principal Invested:</span>
                    <span className="text-slate-300 font-medium">{formatMoney(investment.projection20Yr?.totalInvested)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Compound Wealth Gained:</span>
                    <span>+{formatMoney(investment.projection20Yr?.wealthGained)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-4 text-center">
            *Projections demonstrate power of compounding using regular monthly SIP with annual portfolio rebalancing.
          </p>
        </div>
      </div>
    </div>
  );
}
