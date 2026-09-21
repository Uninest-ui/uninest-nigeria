import React, { useState, useEffect } from 'react';
import { Award, Check, X, ShieldCheck, ArrowUpRight, Sparkles } from 'lucide-react';
import { scoutReferralService } from '../utils/scoutReferralService';
import { CampusScoutProfile } from '../types';

interface ActiveScoutBannerProps {
  onOpenScoutDashboard?: () => void;
}

export const ActiveScoutBanner: React.FC<ActiveScoutBannerProps> = ({ onOpenScoutDashboard }) => {
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [activeScout, setActiveScout] = useState<CampusScoutProfile | undefined>(undefined);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check URL parameters on mount
    const codeFromUrl = scoutReferralService.initUrlReferralCode();
    const current = codeFromUrl || scoutReferralService.getActiveReferralCode();
    if (current) {
      setActiveCode(current);
      setActiveScout(scoutReferralService.findScoutByCode(current));
    }

    const handleActiveChange = (e: any) => {
      const updatedCode = e.detail?.code;
      setActiveCode(updatedCode || null);
      if (updatedCode) {
        setActiveScout(scoutReferralService.findScoutByCode(updatedCode));
        setIsDismissed(false);
      } else {
        setActiveScout(undefined);
      }
    };

    window.addEventListener('uninest_scout_active_changed', handleActiveChange);
    return () => {
      window.removeEventListener('uninest_scout_active_changed', handleActiveChange);
    };
  }, []);

  if (!activeCode || isDismissed) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 text-slate-950 px-4 py-2.5 text-xs font-semibold shadow-md flex items-center justify-between gap-3 sticky top-0 z-40 animate-slideDown">
      <div className="flex items-center gap-2 overflow-hidden">
        <div className="w-6 h-6 rounded-full bg-slate-950 text-amber-400 flex items-center justify-center shrink-0">
          <Award className="w-3.5 h-3.5" />
        </div>
        <div className="truncate text-slate-950">
          <span className="font-black text-slate-950">
            {activeScout ? `Connected to Campus Scout ${activeScout.name} (${activeScout.university})` : `Active Scout Referral: ${activeCode}`}
          </span>
          <span className="hidden sm:inline text-slate-900 font-medium ml-1.5">
            • 5% scout commission will be credited to this verified student peer on your transactions at no extra cost to you!
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {onOpenScoutDashboard && (
          <button
            onClick={onOpenScoutDashboard}
            className="px-2.5 py-1 rounded-md bg-slate-950 hover:bg-slate-900 text-amber-400 font-bold text-[11px] transition inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Scout Hub</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        )}
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 rounded-md hover:bg-amber-600 text-slate-900 transition"
          title="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
