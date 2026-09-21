import React, { useState } from 'react';
import { 
  TrendingUp, 
  PiggyBank, 
  Sparkles, 
  Target, 
  Calendar, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowUpRight,
  Clock,
  Layers,
  Percent
} from 'lucide-react';

interface SavingsGoalChartProps {
  currentBalance: number;
  targetGoalAmount: number;
  graduationYear?: string;
  monthlyDeposit?: number;
  onUpdateGoal?: (newGoal: number) => void;
}

export const SavingsGoalChart: React.FC<SavingsGoalChartProps> = ({
  currentBalance = 0,
  targetGoalAmount = 150000,
  graduationYear = '2027',
  monthlyDeposit = 10000,
  onUpdateGoal
}) => {
  const safeBalance = Number(currentBalance || 0);
  const safeGoal = Number(targetGoalAmount || 150000);
  const [simulatedMonthly, setSimulatedMonthly] = useState<number>(monthlyDeposit || 10000);
  const percentComplete = Math.min(100, Math.round((safeBalance / (safeGoal || 1)) * 100));
  const remaining = Math.max(0, safeGoal - safeBalance);
  
  // Months needed at current monthly pace
  const monthsToGoal = Math.ceil(remaining / (simulatedMonthly || 1));

  // Academic stages progression milestones
  const stages = [
    { level: '100L', targetPct: 20, amount: Math.round(safeGoal * 0.2), label: 'Year 1 Foundation' },
    { level: '200L', targetPct: 45, amount: Math.round(safeGoal * 0.45), label: 'Year 2 Momentum' },
    { level: '300L', targetPct: 75, amount: Math.round(safeGoal * 0.75), label: 'Year 3 Internship' },
    { level: '400L / 500L', targetPct: 100, amount: safeGoal, label: 'Sign-Out & Clearance' },
  ];

  // 12-month projection data for SVG line / area chart
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const chartPoints = months.map((month, i) => {
    // Current trajectory towards graduation target with 70% gifts unlock threshold
    const projected = Math.min(safeGoal * 1.15, safeBalance + (simulatedMonthly * i));
    const targetLine = (safeGoal / 12) * (i + 1);
    return {
      month,
      projected: Math.round(projected),
      targetLine: Math.round(targetLine)
    };
  });

  const maxVal = Math.max(safeGoal * 1.2, ...chartPoints.map(p => p.projected));

  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-[10px] font-black uppercase tracking-wider">
            <Target className="w-3.5 h-3.5 text-orange-600" />
            <span>STS Sign-Out Goal Projection Chart</span>
          </div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Sign-Out Savings Milestone Trajectory</span>
            <span className="text-xs px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold font-mono flex items-center gap-1">
              🎁 70% Goal = Gift Eligible
            </span>
          </h3>
          <p className="text-xs text-slate-500">
            Automated timeline tracking your pocket money savings, gifts received, and eligibility for official UniNest gifts once you reach 70% of your target.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Progress to Goal</span>
            <span className="text-xl font-black text-orange-600 font-mono">{percentComplete}%</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 font-black text-sm shadow-2xs">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Visual Progress Bar with Academic Year Pins */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold text-slate-700">
          <span>Current Stash: ₦{safeBalance.toLocaleString()}</span>
          <span>Target Goal: ₦{safeGoal.toLocaleString()}</span>
        </div>

        {/* Bar */}
        <div className="relative w-full h-4 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 transition-all duration-1000 relative shadow-sm"
            style={{ width: `${percentComplete}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>

        {/* Milestone Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          {stages.map((st) => {
            const isReached = safeBalance >= st.amount;
            return (
              <div
                key={st.level}
                className={`p-3 rounded-2xl border transition ${
                  isReached
                    ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                    : 'bg-slate-50/60 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-extrabold">
                  <span>{st.level}</span>
                  {isReached ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <span className="text-[10px] text-slate-400 font-mono">{st.targetPct}%</span>
                  )}
                </div>
                <div className="text-xs font-black mt-1 font-mono">
                  ₦{(st.amount || 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">
                  {st.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* 70% Rewards Milestone Callout */}
        <div className="p-3 rounded-2xl bg-orange-50/80 border border-orange-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-lg bg-[#FF6A00] text-white text-[10px] font-black">70% Milestone</span>
            <span className="text-slate-800">
              <strong>UniNest Rewards Unlock:</strong> Reaching 70% (₦{Math.round(safeGoal * 0.7).toLocaleString()}) unlocks official UniNest gifts &amp; tokens.
            </span>
          </div>
          <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full shrink-0 self-start sm:self-auto ${
            safeBalance >= safeGoal * 0.7 
              ? 'bg-emerald-100 text-emerald-800' 
              : 'bg-amber-100 text-amber-900'
          }`}>
            {safeBalance >= safeGoal * 0.7 ? 'Unlocked 🎉' : `${Math.round((safeBalance / (safeGoal * 0.7 || 1)) * 100)}% to unlock`}
          </span>
        </div>
      </div>

      {/* SVG Trajectory Chart */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
            <span className="text-xs font-bold text-slate-300">Projected Stash Trajectory (Next 12 Months)</span>
          </div>
          <span className="text-[11px] font-mono text-amber-400 font-bold">
            Est. Sign-Out Fund: ₦{Math.round(safeBalance + simulatedMonthly * 12).toLocaleString()} • Gift Eligible at 70%
          </span>
        </div>

        {/* Interactive SVG Trend Visualizer */}
        <div className="h-44 w-full relative pt-2">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 500 140" preserveAspectRatio="none">
            <defs>
              <linearGradient id="goalAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Target Baseline dashed line */}
            <line
              x1="0"
              y1={140 - (targetGoalAmount / maxVal) * 120}
              x2="500"
              y2={140 - (targetGoalAmount / maxVal) * 120}
              stroke="#64748b"
              strokeDasharray="4 4"
              strokeWidth="1.5"
            />

            {/* Projected Area Path */}
            <path
              d={`
                M 0 140
                ${chartPoints.map((pt, idx) => {
                  const x = (idx / (chartPoints.length - 1)) * 500;
                  const y = 140 - (pt.projected / maxVal) * 120;
                  return `L ${x} ${y}`;
                }).join(' ')}
                L 500 140 Z
              `}
              fill="url(#goalAreaGrad)"
            />

            {/* Projected Line Path */}
            <path
              d={`
                ${chartPoints.map((pt, idx) => {
                  const x = (idx / (chartPoints.length - 1)) * 500;
                  const y = 140 - (pt.projected / maxVal) * 120;
                  return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')}
              `}
              fill="none"
              stroke="#fb923c"
              strokeWidth="3"
            />

            {/* Points */}
            {chartPoints.map((pt, idx) => {
              const x = (idx / (chartPoints.length - 1)) * 500;
              const y = 140 - (pt.projected / maxVal) * 120;
              return (
                <circle
                  key={pt.month}
                  cx={x}
                  cy={y}
                  r="3.5"
                  fill="#ffffff"
                  stroke="#ea580c"
                  strokeWidth="2"
                />
              );
            })}
          </svg>

          {/* Month labels along bottom */}
          <div className="flex justify-between text-[9px] text-slate-400 font-mono pt-1">
            {months.map(m => <span key={m}>{m}</span>)}
          </div>
        </div>
      </div>

      {/* Interactive Savings Pace Simulator Slider */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <h4 className="text-xs font-black text-amber-950">
              Interactive Goal Pace Simulator
            </h4>
          </div>
          <span className="text-xs font-black text-amber-900 font-mono">
            Saving: ₦{simulatedMonthly.toLocaleString()} / month
          </span>
        </div>

        <input
          type="range"
          min="2000"
          max="50000"
          step="1000"
          value={simulatedMonthly}
          onChange={(e) => setSimulatedMonthly(Number(e.target.value))}
          className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
        />

        <div className="flex flex-wrap items-center justify-between text-xs text-amber-900 pt-1">
          <span>
            Pace: <strong>~{monthsToGoal} months</strong> to reach ₦{safeGoal.toLocaleString()}
          </span>
          <span className="text-emerald-700 font-extrabold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Protected by UniNest Escrow
          </span>
        </div>
      </div>
    </div>
  );
};
