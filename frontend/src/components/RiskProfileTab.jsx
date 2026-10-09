import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  Flame, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

const RISK_TIERS = [
  {
    id: 'Conservative',
    title: 'Conservative',
    badge: 'Capital Preservation',
    color: 'border-blue-500/50 bg-blue-500/5 text-blue-400',
    activeRing: 'ring-2 ring-blue-500 bg-blue-500/10 border-blue-500',
    icon: ShieldCheck,
    expectedReturn: '6.5% - 8.0%',
    volatility: 'Low',
    horizon: '1 - 3 Years',
    allocationPreview: '55% Debt & Bonds, 20% Index Equities, 15% Gold, 10% Cash',
    description: 'Designed for investors seeking stability, low drawdown risk, and predictable capital preservation.'
  },
  {
    id: 'Moderate',
    title: 'Moderate',
    badge: 'Balanced Growth',
    color: 'border-emerald-500/50 bg-emerald-500/5 text-emerald-400',
    activeRing: 'ring-2 ring-emerald-500 bg-emerald-500/10 border-emerald-500',
    icon: TrendingUp,
    expectedReturn: '9.5% - 11.5%',
    volatility: 'Medium',
    horizon: '5 - 10 Years',
    allocationPreview: '55% Equities (Large/Mid-cap), 30% Debt/Bonds, 10% Gold, 5% Cash',
    description: 'Balances capital appreciation with sufficient fixed-income buffer to cushion against market downturns.'
  },
  {
    id: 'Aggressive',
    title: 'Aggressive',
    badge: 'Maximum Capital Expansion',
    color: 'border-purple-500/50 bg-purple-500/5 text-purple-400',
    activeRing: 'ring-2 ring-purple-500 bg-purple-500/10 border-purple-500',
    icon: Flame,
    expectedReturn: '12.0% - 15.0%',
    volatility: 'High',
    horizon: '10+ Years',
    allocationPreview: '85% Diversified Equities (Tech/Mid/Small-cap), 10% Bonds, 5% Gold',
    description: 'Aimed at long-term wealth compounding with tolerance for sharp short-term market swings.'
  }
];

export default function RiskProfileTab({ profile, onUpdateProfile, onNavigate }) {
  const [selectedTolerance, setSelectedTolerance] = useState('Moderate');
  const [horizonYears, setHorizonYears] = useState(10);
  const [riskScore, setRiskScore] = useState(6);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (profile?.riskProfile) {
      setSelectedTolerance(profile.riskProfile.tolerance || 'Moderate');
      setHorizonYears(profile.riskProfile.horizonYears || 10);
      setRiskScore(profile.riskProfile.riskScore || 6);
      setNotes(profile.riskProfile.notes || '');
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      await onUpdateProfile({
        riskProfile: {
          tolerance: selectedTolerance,
          horizonYears,
          riskScore,
          notes
        }
      });
      setFeedback({ type: 'success', message: 'Risk profile updated! Your investment plan has been recalibrated.' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update risk profile' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Risk Assessment & Tolerance</h1>
          <p className="text-sm text-slate-400">
            Define your risk appetite, horizon, and volatility comfort to tailor the asset allocation algorithm.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Updating...' : 'Save Risk Profile'}</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/80 border-rose-800 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* 3 Risk Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {RISK_TIERS.map((tier) => {
          const Icon = tier.icon;
          const isSelected = selectedTolerance === tier.id;

          return (
            <div
              key={tier.id}
              onClick={() => {
                setSelectedTolerance(tier.id);
                if (tier.id === 'Conservative') setRiskScore(3);
                if (tier.id === 'Moderate') setRiskScore(6);
                if (tier.id === 'Aggressive') setRiskScore(9);
              }}
              className={`cursor-pointer rounded-2xl p-6 border transition-all relative ${
                isSelected
                  ? tier.activeRing
                  : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600 hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl border ${tier.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                {isSelected && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-slate-950">
                    Active
                  </span>
                )}
              </div>

              <h2 className="text-xl font-bold text-white mb-1">{tier.title}</h2>
              <p className="text-xs font-medium text-emerald-400 mb-3">{tier.badge}</p>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">{tier.description}</p>

              <div className="space-y-2 border-t border-slate-700/50 pt-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Expected Annual Return:</span>
                  <span className="text-white font-semibold">{tier.expectedReturn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Market Volatility:</span>
                  <span className="text-slate-300 font-medium">{tier.volatility}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Recommended Horizon:</span>
                  <span className="text-slate-300 font-medium">{tier.horizon}</span>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-slate-700/40 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300 block mb-0.5">Asset Blend:</span>
                {tier.allocationPreview}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sliders: Horizon and Risk Score */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Investment Horizon Slider */}
        <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-white">Investment Time Horizon</h2>
              <p className="text-xs text-slate-400">How long do you plan to invest before major liquidation?</p>
            </div>
            <span className="text-xl font-black text-emerald-400 bg-slate-900 px-3 py-1 rounded-xl border border-slate-700">
              {horizonYears} Years
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="35"
            value={horizonYears}
            onChange={(e) => setHorizonYears(Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400 mt-4"
          />

          <div className="flex justify-between text-[11px] text-slate-500 mt-2">
            <span>1 Year (Short)</span>
            <span>10 Years (Medium)</span>
            <span>20+ Years (Generational)</span>
          </div>
        </div>

        {/* Self-Assessed Risk Score Slider */}
        <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-white">Risk Score (1 to 10)</h2>
              <p className="text-xs text-slate-400">1 = Avoid all volatility · 10 = Max aggressive growth</p>
            </div>
            <span className="text-xl font-black text-indigo-400 bg-slate-900 px-3 py-1 rounded-xl border border-slate-700">
              {riskScore}/10
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="10"
            value={riskScore}
            onChange={(e) => {
              const val = Number(e.target.value);
              setRiskScore(val);
              if (val <= 4) setSelectedTolerance('Conservative');
              else if (val <= 7) setSelectedTolerance('Moderate');
              else setSelectedTolerance('Aggressive');
            }}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-400 mt-4"
          />

          <div className="flex justify-between text-[11px] text-slate-500 mt-2">
            <span>1-4: Conservative</span>
            <span>5-7: Moderate</span>
            <span>8-10: Aggressive</span>
          </div>
        </div>
      </div>

      {/* Strategy Action Card */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white">Ready to examine your customized asset model?</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Your {selectedTolerance} risk posture directs how your monthly disposable savings is partitioned across equities, bonds, and gold.
          </p>
        </div>
        <button
          onClick={() => onNavigate('plan')}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold transition shrink-0"
        >
          <span>View Investment Plan</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
