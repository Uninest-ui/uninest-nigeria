import React from 'react';
import { 
  Sparkles, 
  MessageCircle, 
  ArrowUpRight, 
  CheckCircle2, 
  Compass,
  Clock,
  Building,
  Check,
  Gift
} from 'lucide-react';

interface CampusTickerMarqueeProps {
  onOpenHireScout?: () => void;
  whatsappNumber?: string;
}

export const CampusTickerMarquee: React.FC<CampusTickerMarqueeProps> = ({
  onOpenHireScout,
  whatsappNumber = '2349039847154'
}) => {
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hello%20UniNest%20Desk!%20I%20am%20inquiring%20about%20Marketplace%20Vendor%20Verification%20and%20Escrow%20Protection.`;

  return (
    <>
      <div className="w-full max-w-full min-w-0 bg-[#0A1931] text-white border-y border-white/15 overflow-hidden py-2.5 shadow-md relative select-none">
        {/* Visual Accent Edges with gradient fade */}
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#0A1931] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#0A1931] to-transparent z-10 pointer-events-none" />

        {/* Marquee Track */}
        <div className="flex animate-marquee-left hover:[animation-play-state:paused] items-center gap-8 whitespace-nowrap cursor-pointer">
          {/* Item 1: Escrow Account & 3-Day Rule */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs sm:text-sm font-semibold">
            <Clock className="w-4 h-4 text-[#FF6A00]" />
            <span>
              🛡️ <strong>Official Escrow (2150445461 - UBA):</strong> Payments are sent to escrow account number and released after confirmation or within 3 working days!
            </span>
          </div>

          <div className="text-[#FF6A00] font-bold">•</div>

          {/* Item 2: Verified Vendor Tick & Head of Marketplace */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs sm:text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4 text-[#FF6A00]" />
            <span>
              🏷️ <strong>Verified Vendor Tick:</strong> Granted after verification is confirmed by Head of Marketplace, and only verified vendors receive STS Vendor Accounts!
            </span>
          </div>

          <div className="text-[#FF6A00] font-bold">•</div>

          {/* Item 3: Student and Vendor Listing Rule */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs sm:text-sm font-semibold">
            <Building className="w-4 h-4 text-[#FF6A00]" />
            <span>
              🛍️ <strong>Marketplace Listings:</strong> Students and vendors can list products, but only vendors have a verified tick on their listing!
            </span>
          </div>

          <div className="text-[#FF6A00] font-bold">•</div>

          {/* Item 4: 70% Target Gifts & Tokens Milestone */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs sm:text-sm font-semibold">
            <Gift className="w-4 h-4 text-[#FF6A00]" />
            <span>
              🎁 <strong>UniNest Rewards:</strong> Eligibility for official gifts and cash tokens unlocks once 70% of your savings target is reached!
            </span>
          </div>

          <div className="text-[#FF6A00] font-bold">•</div>

          {/* Item 5: Hire a Scout Coming Soon */}
          <div 
            onClick={onOpenHireScout}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF6A00]/20 border border-[#FF6A00] text-white text-xs sm:text-sm font-semibold hover:bg-[#FF6A00]/30 transition"
          >
            <Compass className="w-4 h-4 text-[#FF6A00]" />
            <span>
              🧭 <strong>Hire a Scout (Coming Soon):</strong> Campus guides and physical lodge inspections launching soon!
            </span>
            <span className="text-[10px] bg-[#FF6A00] text-white px-2 py-0.5 rounded-full font-black">
              View Page
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
