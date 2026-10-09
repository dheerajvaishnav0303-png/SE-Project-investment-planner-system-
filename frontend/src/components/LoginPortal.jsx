import React, { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2,
  TrendingUp,
  KeyRound
} from 'lucide-react';
import api from '../api/apiClient';

export default function LoginPortal({ onLoginSuccess }) {
  const [activePortal, setActivePortal] = useState('user'); // 'user' | 'admin'
  const [isRegistering, setIsRegistering] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle Login submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegistering) {
        const res = await api.register({ name, email, password });
        if (res.success && res.data) {
          localStorage.setItem('investplan_token', res.data.token);
          localStorage.setItem('investplan_user', JSON.stringify(res.data));
          onLoginSuccess(res.data);
        }
      } else {
        const res = await api.login({
          email,
          password,
          requestedPortal: activePortal
        });

        if (res.success && res.data) {
          localStorage.setItem('investplan_token', res.data.token);
          localStorage.setItem('investplan_user', JSON.stringify(res.data));
          onLoginSuccess(res.data);
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-Click Demo Login
  const handleQuickDemo = (role) => {
    if (role === 'admin') {
      setActivePortal('admin');
      setIsRegistering(false);
      setEmail('admin@investplan.com');
      setPassword('admin123');
    } else {
      setActivePortal('user');
      setIsRegistering(false);
      setEmail('user@investplan.com');
      setPassword('user123');
    }
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div className="max-w-md w-full relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 font-black text-2xl shadow-xl shadow-emerald-500/20 mb-3">
            $
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Investment Planner System
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Choose your portal below to sign in or create an account
          </p>
        </div>

        {/* Portal Switcher Tabs */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl mb-6 shadow-inner">
          <button
            type="button"
            onClick={() => {
              setActivePortal('user');
              setIsRegistering(false);
              setError(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activePortal === 'user'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>User Portal</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActivePortal('admin');
              setIsRegistering(false);
              setError(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activePortal === 'admin'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Portal</span>
          </button>
        </div>

        {/* Form Container */}
        <div className={`bg-slate-900/90 border rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl transition ${
          activePortal === 'admin' ? 'border-indigo-500/30' : 'border-slate-800'
        }`}>
          {/* Header inside form */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-1.5">
                {activePortal === 'admin' ? (
                  <>
                    <ShieldCheck className="w-5 h-5 text-indigo-400" />
                    <span>Admin Security Gateway</span>
                  </>
                ) : isRegistering ? (
                  <>
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <span>Create Investor Account</span>
                  </>
                ) : (
                  <>
                    <User className="w-5 h-5 text-emerald-400" />
                    <span>Investor Sign In</span>
                  </>
                )}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {activePortal === 'admin'
                  ? 'Access administrative controls & analytics'
                  : isRegistering
                  ? 'Start your personalized wealth blueprint'
                  : 'Manage your portfolio, budget & goals'}
              </p>
            </div>

            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              activePortal === 'admin'
                ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
            }`}>
              {activePortal === 'admin' ? 'Admin' : 'User'}
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && activePortal === 'user' && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Alex Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
                <input
                  type="email"
                  placeholder={activePortal === 'admin' ? 'admin@investplan.com' : 'user@investplan.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none ${
                    activePortal === 'admin' ? 'focus:border-indigo-500' : 'focus:border-emerald-500'
                  }`}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none ${
                    activePortal === 'admin' ? 'focus:border-indigo-500' : 'focus:border-emerald-500'
                  }`}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-xl text-sm font-bold shadow-lg transition flex items-center justify-center gap-2 ${
                activePortal === 'admin'
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
              }`}
            >
              <span>{loading ? 'Authenticating...' : isRegistering ? 'Create Investor Account' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* User Registration Toggle */}
          {activePortal === 'user' && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError(null);
                }}
                className="text-xs text-slate-400 hover:text-emerald-400 transition"
              >
                {isRegistering
                  ? 'Already have an account? Sign in here'
                  : "Don't have an account? Create one"}
              </button>
            </div>
          )}

          {/* Quick 1-Click Demo Fill Section */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block text-center mb-2.5">
              Instant 1-Click Demo Access
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemo('user')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 flex items-center justify-center gap-1.5 transition"
              >
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>Fill User Demo</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 flex items-center justify-center gap-1.5 transition"
              >
                <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                <span>Fill Admin Demo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
