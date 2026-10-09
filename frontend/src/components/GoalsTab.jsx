import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  X
} from 'lucide-react';

const CATEGORIES = [
  'Retirement',
  'House Purchase',
  'Emergency Fund',
  'Education',
  'Vehicle',
  'Vacation',
  'Wealth Creation',
  'Other'
];

export default function GoalsTab({ 
  goals = [], 
  currency = '$', 
  monthlySavings = 0, 
  onCreateGoal, 
  onUpdateGoal, 
  onDeleteGoal 
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Wealth Creation',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    priority: 'Medium',
    expectedAnnualReturn: 8
  });

  const totalTarget = goals.reduce((acc, g) => acc + (g.targetAmount || 0), 0);
  const totalSaved = goals.reduce((acc, g) => acc + (g.currentAmount || 0), 0);
  const totalRequiredMonthly = goals.reduce((acc, g) => acc + (g.monthlyRequiredSavings || 0), 0);
  const surplus = monthlySavings - totalRequiredMonthly;
  const isFundable = surplus >= 0;

  const handleOpenAdd = () => {
    setEditingGoal(null);
    // Default target date: 3 years from today
    const d = new Date();
    d.setFullYear(d.getFullYear() + 3);
    const dateStr = d.toISOString().split('T')[0];

    setFormData({
      title: '',
      category: 'Wealth Creation',
      targetAmount: '',
      currentAmount: '',
      targetDate: dateStr,
      priority: 'Medium',
      expectedAnnualReturn: 8
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (goal) => {
    setEditingGoal(goal);
    const dateStr = goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '';
    setFormData({
      title: goal.title || '',
      category: goal.category || 'Wealth Creation',
      targetAmount: goal.targetAmount || '',
      currentAmount: goal.currentAmount || '',
      targetDate: dateStr,
      priority: goal.priority || 'Medium',
      expectedAnnualReturn: goal.expectedAnnualReturn || 8
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        category: formData.category,
        targetAmount: Number(formData.targetAmount),
        currentAmount: Number(formData.currentAmount || 0),
        targetDate: new Date(formData.targetDate),
        priority: formData.priority,
        expectedAnnualReturn: Number(formData.expectedAnnualReturn || 8)
      };

      if (editingGoal) {
        await onUpdateGoal(editingGoal._id, payload);
      } else {
        await onCreateGoal(payload);
      }
      setModalOpen(false);
    } catch (err) {
      alert(err.message || 'Failed to save goal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await onDeleteGoal(id);
      } catch (err) {
        alert(err.message || 'Failed to delete goal');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Financial Goals Roadmap</h1>
          <p className="text-sm text-slate-400">
            Define milestones with target dates. The engine computes exact monthly contributions needed.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Goal</span>
        </button>
      </div>

      {/* Goal Feasibility Banner */}
      <div className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isFundable
          ? 'bg-emerald-950/30 border-emerald-800/60'
          : 'bg-amber-950/30 border-amber-800/60'
      }`}>
        <div className="flex items-start sm:items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${
            isFundable ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }`}>
            {isFundable ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">
              {isFundable ? 'Goals are Fully Funded!' : 'Funding Deficit Detected'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Total monthly requirement across all goals: <span className="text-white font-semibold">{currency}{totalRequiredMonthly.toLocaleString()}</span>. 
              Your disposable savings: <span className="text-emerald-400 font-semibold">{currency}{monthlySavings.toLocaleString()}</span>.
            </p>
          </div>
        </div>

        <div className="text-left md:text-right shrink-0">
          <span className="text-xs text-slate-400 block">Monthly Balance</span>
          <span className={`text-base font-bold ${isFundable ? 'text-emerald-400' : 'text-amber-400'}`}>
            {isFundable ? `+${currency}${surplus.toLocaleString()} Surplus` : `-${currency}${Math.abs(surplus).toLocaleString()} Deficit`}
          </span>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map((goal) => {
          const target = goal.targetAmount || 0;
          const current = goal.currentAmount || 0;
          const progress = goal.progressPercentage || 0;
          const targetDateStr = goal.targetDate ? new Date(goal.targetDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short'
          }) : 'No date';

          return (
            <div
              key={goal._id}
              className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-5 shadow-sm hover:border-slate-600 transition flex flex-col justify-between"
            >
              <div>
                {/* Badges & Actions */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-700 text-slate-200">
                      {goal.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      goal.priority === 'High'
                        ? 'bg-rose-950/80 text-rose-400 border border-rose-800'
                        : goal.priority === 'Medium'
                        ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                        : 'bg-blue-950/80 text-blue-400 border border-blue-800'
                    }`}>
                      {goal.priority}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(goal)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
                      title="Edit Goal"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded-lg transition"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h2 className="text-base font-bold text-white mb-2">{goal.title}</h2>

                {/* Target vs Saved */}
                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Saved:</span>
                    <span className="text-emerald-400 font-bold">{currency}{current.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Target:</span>
                    <span className="text-white font-semibold">{currency}{target.toLocaleString()}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden mt-1.5">
                    <div
                      className="h-2 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all"
                      style={{ width: `${Math.min(100, progress)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
                    <span>{progress}% Completed</span>
                    <span>Remaining: {currency}{Math.max(0, target - current).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Monthly Requirement Box */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-center justify-between text-xs mt-3">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Target: {targetDateStr}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Required SIP</span>
                  <span className="font-bold text-emerald-400">
                    {currency}{Number(goal.monthlyRequiredSavings || 0).toLocaleString()}/mo
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Goal Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" />
                <span>{editingGoal ? 'Edit Goal' : 'Create Financial Goal'}</span>
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Goal Title</label>
                <input
                  type="text"
                  placeholder="e.g. Dream Home Downpayment"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Target Amount ({currency})</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="50000"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Current Saved ({currency})</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="5000"
                    value={formData.currentAmount}
                    onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Target Date</label>
                  <input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Expected Return (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    step="0.5"
                    value={formData.expectedAnnualReturn}
                    onChange={(e) => setFormData({ ...formData, expectedAnnualReturn: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20"
                >
                  {submitting ? 'Saving...' : editingGoal ? 'Update Goal' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
