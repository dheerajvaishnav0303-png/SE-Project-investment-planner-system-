import React, { useState } from 'react';
import { 
  TrendingUp, 
  PieChart, 
  BarChart3, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function InvestmentPlanTab({ plan, currency = '$', onNavigate }) {
  const [selectedHorizon, setSelectedHorizon] = useState(10);

  if (!plan) {
    return (
      <div className="p-12 text-center text-slate-400">
        Loading tailored investment plan...
      </div>
    );
  }

  const formatMoney = (val) => `${currency}${Number(val || 0).toLocaleString()}`;
  const allocations = plan.assetAllocation || [];
  const projections = plan.projections || [];
  const activeProjection = projections.find((p) => p.years === selectedHorizon) || projections[3] || {};

  return (
    <div className="space-y-6">
      {/* Strategy Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {plan.riskTolerance} Portfolio
              </span>
              <span className="text-xs text-slate-400">· Algorithm Strategy Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {plan.strategyName}
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              {plan.description}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/80 border border-slate-700 p-4 rounded-xl self-start md:self-auto">
            <div>
              <span className="text-xs text-slate-400 block">Blended Expected Return</span>
              <span className="text-2xl font-black text-emerald-400">
                {plan.blendedAnnualReturn}% <span className="text-xs text-slate-400 font-normal">/ yr</span>
              </span>
            </div>
            <div className="w-px h-10 bg-slate-700" />
            <div>
              <span className="text-xs text-slate-400 block">Monthly SIP Deployment</span>
              <span className="text-2xl font-black text-white">
                {formatMoney(plan.monthlySavingsBudget)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Allocation Breakdown */}
      <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-emerald-400" />
              <span>Recommended Asset Class Distribution</span>
            </h2>
            <p className="text-xs text-slate-400">
              Systematic monthly dollar allocation based on your {formatMoney(plan.monthlySavingsBudget)} net savings budget
            </p>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-700">
            Total 100% Allocated
          </span>
        </div>

        {/* Unified Multi-Colored Distribution Bar */}
        <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-700">
          {allocations.map((item, idx) => (
            <div
              key={idx}
              className="h-full transition-all hover:opacity-90"
              style={{
                width: `${item.percentage}%`,
                backgroundColor: item.color || '#10b981'
              }}
              title={`${item.assetClass}: ${item.percentage}%`}
            />
          ))}
        </div>

        {/* Detailed Grid of Asset Classes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allocations.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                    {item.category}
                  </span>
                  <span className="text-xs font-bold text-white flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.color }} />
                    {item.percentage}%
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white">{item.assetClass}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Monthly SIP:</span>
                <span className="font-bold text-emerald-400 text-sm">{formatMoney(item.monthlyAmount)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compound Wealth Projections Engine */}
      <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span>Compound Wealth Compounding Engine</span>
            </h2>
            <p className="text-xs text-slate-400">
              Future value with monthly additions of {formatMoney(plan.monthlySavingsBudget)} compounded at {plan.blendedAnnualReturn}%
            </p>
          </div>

          {/* Horizon Year Pills */}
          <div className="flex flex-wrap gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700">
            {[1, 3, 5, 10, 15, 20, 25, 30].map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedHorizon(yr)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  selectedHorizon === yr
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {yr}Y
              </button>
            ))}
          </div>
        </div>

        {/* Selected Horizon Focused Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              {activeProjection.years}-Year Milestone Corpus
            </span>
            <div className="text-3xl sm:text-4xl font-black text-white">
              {formatMoney(activeProjection.futureValue)}
            </div>
            <p className="text-xs text-slate-400">Estimated total portfolio value</p>
          </div>

          <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-6">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Your Capital Invested
            </span>
            <div className="text-2xl font-bold text-slate-300">
              {formatMoney(activeProjection.totalInvested)}
            </div>
            <p className="text-xs text-slate-400">Accumulated principal deposits</p>
          </div>

          <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-6">
            <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
              Compounded Wealth Gained
            </span>
            <div className="text-2xl font-bold text-emerald-400">
              +{formatMoney(activeProjection.wealthGained)}
            </div>
            <p className="text-xs text-slate-400">Pure compounding interest created</p>
          </div>
        </div>

        {/* Projections Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-700/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-700">
              <tr>
                <th className="p-3.5">Time Horizon</th>
                <th className="p-3.5">Total Invested</th>
                <th className="p-3.5">Projected Value</th>
                <th className="p-3.5">Wealth Multiplier</th>
                <th className="p-3.5 text-right">Compounded Gains</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {projections.map((p) => {
                const multiplier = p.totalInvested > 0 ? (p.futureValue / p.totalInvested).toFixed(2) : 1;
                const isSelected = p.years === selectedHorizon;

                return (
                  <tr
                    key={p.years}
                    onClick={() => setSelectedHorizon(p.years)}
                    className={`cursor-pointer transition hover:bg-slate-800/60 ${
                      isSelected ? 'bg-emerald-500/10' : ''
                    }`}
                  >
                    <td className="p-3.5 font-bold text-white flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{p.years} Years</span>
                    </td>
                    <td className="p-3.5 text-slate-300">{formatMoney(p.totalInvested)}</td>
                    <td className="p-3.5 font-bold text-emerald-400 text-sm">{formatMoney(p.futureValue)}</td>
                    <td className="p-3.5 text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-800 font-semibold text-slate-200">
                        {multiplier}x
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-semibold text-teal-300">
                      +{formatMoney(p.wealthGained)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Execution Best Practices */}
      <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-bold text-white flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Execution Blueprint & Action Steps</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/40">
            <span className="font-bold text-white block mb-1">1. Automated Monthly Standing Order</span>
            Set up automatic direct debit transfers on salary credit day directly into chosen index mutual funds and bond baskets.
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/40">
            <span className="font-bold text-white block mb-1">2. Semi-Annual Rebalancing</span>
            Review asset weights every 6 to 12 months. Trim overweight assets and top up lagging ones to keep to your {plan.riskTolerance} model.
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/40">
            <span className="font-bold text-white block mb-1">3. Step-Up SIP With Salary Increments</span>
            Increase monthly contributions by 5-10% annually with each promotion or raise to supercharge compound interest.
          </div>
        </div>
      </div>
    </div>
  );
}
