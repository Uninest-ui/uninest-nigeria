import React from 'react';
import { Flame, Sparkles, CheckCircle2, TrendingUp } from 'lucide-react';

interface CrowdfundingThermometerProps {
  currentAmount: number;
  targetAmount: number;
  currency?: string;
  isDisbursed?: boolean;
  compact?: boolean;
}

export const CrowdfundingThermometer: React.FC<CrowdfundingThermometerProps> = ({
  currentAmount = 0,
  targetAmount = 0,
  currency = '₦',
  isDisbursed = false,
  compact = false
}) => {
  const safeCurrent = Number(currentAmount || 0);
  const safeTarget = Number(targetAmount || 0);
  const percentage = Math.min(100, Math.round((safeCurrent / (safeTarget || 1)) * 100));
  const isGoalReached = percentage >= 100;
  const deficit = Math.max(0, safeTarget - safeCurrent);

  // Milestones: 25%, 50%, 75%, 100%
  const milestones = [
    { pct: 25, label: '25% Seeded' },
    { pct: 50, label: '50% Halfway' },
    { pct: 75, label: '75% Final Sprint' },
    { pct: 100, label: '100% Funded' }
  ];

  if (compact) {
    return (
      <div className="space-y-1.5 w-full">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isGoalReached ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isGoalReached ? 'bg-emerald-500' : 'bg-rose-600'}`}></span>
            </span>
            <span className="font-bold text-slate-800 text-[11px]">Crowdfunding Thermometer:</span>
          </div>
          <span className="font-black text-rose-600 text-xs font-mono">{percentage}%</span>
        </div>

        {/* Thermometer Stem */}
        <div className="relative flex items-center">
          {/* Bulb base */}
          <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 -mr-1 z-10 shadow-xs ${
            isGoalReached ? 'bg-emerald-600' : 'bg-gradient-to-r from-rose-600 to-red-500'
          }`}>
            <span className="text-[8px] text-white font-bold">₦</span>
          </div>

          {/* Tube */}
          <div className="w-full h-3 bg-slate-200/90 rounded-r-full overflow-hidden relative border border-slate-300/80 shadow-inner">
            <div
              className={`h-full rounded-r-full transition-all duration-1000 relative ${
                isGoalReached
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600'
                  : 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600'
              }`}
              style={{ width: `${percentage}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>

            {/* Milestone Tick Lines */}
            <div className="absolute inset-0 flex justify-between px-1 pointer-events-none">
              <span className="h-full border-r border-slate-400/40 w-1/4" />
              <span className="h-full border-r border-slate-400/40 w-1/4" />
              <span className="h-full border-r border-slate-400/40 w-1/4" />
              <span className="h-full w-1/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50/70 via-white to-amber-50/50 border border-rose-200/80 shadow-xs space-y-3">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white ${isGoalReached ? 'bg-emerald-600' : 'bg-rose-600'}`}>
            <Flame className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 tracking-tight">Campaign Aid Thermometer</h4>
            <p className="text-[10px] text-gray-500">Live verified escrow pledge gauge</p>
          </div>
        </div>

        <div className="text-right">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-black font-mono ${
            isGoalReached ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
          }`}>
            {percentage}% Funded
          </span>
        </div>
      </div>

      {/* Thermometer Stem & Bulb */}
      <div className="relative pt-1 pb-1">
        <div className="flex items-center">
          {/* Mercury Reservoir Bulb */}
          <div className={`relative w-8 h-8 rounded-full flex items-center justify-center shrink-0 -mr-2 z-10 border-2 border-white shadow-md ${
            isGoalReached
              ? 'bg-gradient-to-tr from-emerald-700 to-teal-500 ring-2 ring-emerald-400/50'
              : 'bg-gradient-to-tr from-rose-700 to-red-500 ring-2 ring-rose-400/50'
          }`}>
            <span className="text-white text-xs font-black font-mono">{currency}</span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-white/70 animate-ping" />
          </div>

          {/* Glass Thermometer Tube */}
          <div className="flex-1 h-5 bg-slate-200/90 rounded-r-full p-0.5 border-2 border-slate-300 relative shadow-inner overflow-hidden">
            {/* Mercury Column Fill */}
            <div
              className={`h-full rounded-r-full transition-all duration-1000 relative shadow-xs ${
                isGoalReached
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600'
                  : 'bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600'
              }`}
              style={{ width: `${Math.max(percentage, 3)}%` }}
            >
              {/* Internal Fluid Reflection Gloss */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-white/50 rounded-full" />
              <div className="absolute inset-0 bg-white/10 animate-pulse" />
            </div>

            {/* Graduated Milestone Markings */}
            <div className="absolute inset-0 flex justify-between px-2 pointer-events-none items-center">
              {milestones.map((m) => (
                <div key={m.pct} className="flex flex-col items-center h-full justify-center">
                  <span className="h-3 w-[1px] bg-slate-500/40" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Milestone Labels Underneath */}
        <div className="flex justify-between text-[9px] font-bold text-slate-500 pl-8 pr-1 pt-1.5 font-mono">
          <span>0%</span>
          <span>25%</span>
          <span>50% (Halfway)</span>
          <span>75%</span>
          <span className={isGoalReached ? 'text-emerald-700 font-black' : 'text-slate-700'}>
            100% Goal
          </span>
        </div>
      </div>

      {/* Target & Deficit Summary */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/80">
        <div>
          <span className="text-[11px] text-gray-500">Raised: </span>
          <strong className="text-slate-900 font-extrabold font-mono">
            {currency}{safeCurrent.toLocaleString()}
          </strong>
        </div>

        <div className="text-right">
          {isGoalReached ? (
            <span className="text-emerald-700 font-black flex items-center gap-1 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Fully Funded!
            </span>
          ) : (
            <div>
              <span className="text-[11px] text-gray-500">Deficit: </span>
              <span className="text-rose-700 font-extrabold font-mono text-[11px]">
                {currency}{deficit.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
