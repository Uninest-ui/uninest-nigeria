import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Store, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Star, 
  CheckCircle2, 
  Sparkles,
  ExternalLink,
  Home,
  Truck,
  Award,
  ArrowRight,
  Shield,
  ShoppingBag,
  Clock,
  Compass,
  Zap,
  Check,
  X,
  Plus
} from 'lucide-react';
import { VerifiedBusiness, BusinessReview, UniNestUser } from '../types';

interface VerifiedBusinessesTabProps {
  user?: UniNestUser;
  currentUserEmail?: string;
  currentUserName?: string;
  businesses?: VerifiedBusiness[];
  onAddBusiness?: (business: any) => void;
  onRegisterBusiness?: (business: any) => void;
  onAddReview?: (businessId: string, review: Omit<BusinessReview, 'id' | 'date'>) => void;
}

export const VerifiedBusinessesTab: React.FC<VerifiedBusinessesTabProps> = ({
  user,
  currentUserEmail = '',
  currentUserName = 'Student',
  businesses = [],
  onAddReview
}) => {
  const [activeReviewTarget, setActiveReviewTarget] = useState<'scout' | 'marketplace' | null>(null);
  const [reviewStars, setReviewStars] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewSuccess, setReviewSuccess] = useState<boolean>(false);
  const [selectedGallery, setSelectedGallery] = useState<{ title: string; images: string[] } | null>(null);

  const studentName = user?.name || currentUserName || 'Verified Student';
  const studentSchool = user?.university || 'Nigerian University';

  // Official Contacts (Scouts and Marketplace: +234 903 464 8644)
  const SCOUT_WHATSAPP = '2349034648644';
  const SCOUT_PHONE = '09034648644';
  const scoutMessage = encodeURIComponent(
    `Hello Head of Campus Scouts! I am chatting from UniNest (${studentSchool}) to request a lodge inspection, hostel booking verification, or campus scout assistance.`
  );
  const scoutWhatsAppUrl = `https://wa.me/${SCOUT_WHATSAPP}?text=${scoutMessage}`;

  const MARKETPLACE_WHATSAPP = '2349034648644';
  const MARKETPLACE_PHONE = '09034648644';
  const marketplaceMessage = encodeURIComponent(
    `Hello Head of UniNest Marketplace! I want to place an order from UniNest (${studentSchool}) for campus items/services with hostel delivery.`
  );
  const marketplaceWhatsAppUrl = `https://wa.me/${MARKETPLACE_WHATSAPP}?text=${marketplaceMessage}`;

  const handleOpenWhatsApp = (url: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCall = (phone: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    window.location.href = `tel:${phone}`;
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    if (onAddReview && activeReviewTarget) {
      const targetId = activeReviewTarget === 'scout' ? 'biz-head-scouts' : 'biz-head-marketplace';
      onAddReview(targetId, {
        studentName,
        studentSchool,
        rating: reviewStars,
        comment: reviewComment.trim()
      });
    }

    setReviewSuccess(true);
    setTimeout(() => {
      setReviewSuccess(false);
      setActiveReviewTarget(null);
      setReviewComment('');
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Official UniNest Directory • 5★ Verified Profiles Only</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Verified Scouts &amp; Marketplace
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              We have eliminated unverified third-party agents. UniNest now connects you directly with the official <strong>Head of Campus Scouts</strong> for lodge inspections, and the <strong>Head of UniNest Marketplace</strong> to place orders with instant hostel delivery.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-emerald-300/90 font-medium">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                No More Unregulated Agents
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Zero Extortion Lodge Inspections
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                15-30 Min Hostel Delivery
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              onClick={() => handleOpenWhatsApp(scoutWhatsAppUrl)}
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/40 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Head of Scouts</span>
            </button>
            <button
              onClick={() => handleOpenWhatsApp(marketplaceWhatsAppUrl)}
              className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-900/40 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>WhatsApp Head of Marketplace</span>
            </button>
          </div>
        </div>
      </div>

      {/* Anti-Agent Safety Notice Bar */}
      <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-blue-950 text-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-blue-900">UniNest Anti-Extortion Policy: </span>
            <span className="text-blue-800">
              Only two verified official profiles are authorized on UniNest: <strong>Campus Scout</strong> and <strong>UniNest Marketplace (Place Your Order)</strong>. Click any card below to chat immediately on WhatsApp!
            </span>
          </div>
        </div>
        <span className="hidden md:inline-flex px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-extrabold text-[11px] whitespace-nowrap">
          2 Official Profiles
        </span>
      </div>

      {/* ================= ONLY TWO PROFILES ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ---------------- PROFILE 1: CAMPUS SCOUT ---------------- */}
        <div
          onClick={() => handleOpenWhatsApp(scoutWhatsAppUrl)}
          className="bg-white rounded-3xl border-2 border-emerald-500/80 shadow-md hover:shadow-xl hover:border-emerald-600 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between group relative"
        >
          {/* Top highlight bar */}
          <div className="h-2 bg-gradient-to-r from-emerald-600 to-teal-500 w-full" />

          <div className="p-6 sm:p-7 space-y-5">
            {/* Header badges */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black border border-emerald-300">
                  <Award className="w-3.5 h-3.5 text-emerald-700" />
                  <span>5★ VERIFIED CAMPUS SCOUT</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mt-2 group-hover:text-emerald-700 transition">
                  Campus Scout
                </h3>
                <p className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 mt-0.5">
                  <span>Representative: UniNest Campus Scout</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-extrabold block">
                  Zero Agent Extortion
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">Official UniNest Staff</span>
              </div>
            </div>

            {/* Campus & Location */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 text-xs text-slate-700">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="leading-snug">
                <span className="font-extrabold text-slate-900">
                  All Campuses (NDU, BMU, FUOTUOKE, UNIPORT, DELSU, UNILAG)
                </span>
                <div className="text-[11px] text-slate-500">
                  Student Union Plaza &amp; Verified Lodges Inspection Hub
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 leading-relaxed">
              Official UniNest Campus Scout. Get verified lodge inspections, off-campus accommodation bookings, roommate matching, and water/security audits with 0% agent extortion. Chat directly with the Head of Scouts on WhatsApp to inspect lodges or secure verified housing.
            </p>

            {/* Core Services Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                <div className="flex items-center gap-1.5 font-extrabold text-emerald-950">
                  <Home className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Free Lodge Inspections</span>
                </div>
                <p className="text-[10px] text-emerald-800">
                  Self-contain, single rooms, shared flats without extortion fees.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                <div className="flex items-center gap-1.5 font-extrabold text-emerald-950">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Borehole &amp; Light Audit</span>
                </div>
                <p className="text-[10px] text-emerald-800">
                  We check constant water, solar power, and security gates.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                <div className="flex items-center gap-1.5 font-extrabold text-emerald-950">
                  <Compass className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Roommate Pairing</span>
                </div>
                <p className="text-[10px] text-emerald-800">
                  Safe roommate matching with verified students in your faculty.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                <div className="flex items-center gap-1.5 font-extrabold text-emerald-950">
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Direct WhatsApp Video</span>
                </div>
                <p className="text-[10px] text-emerald-800">
                  Live video walkthrough of lodges sent to your WhatsApp.
                </p>
              </div>
            </div>

            {/* Photos Preview */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span>Verified Inspection Lodges:</span>
                <span className="text-emerald-700">Photos taken on campus</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {[
                  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop&q=80'
                ].map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt="Lodge inspection photo"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedGallery({
                        title: 'Campus Scout Lodge Inspections',
                        images: [
                          'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&auto=format&fit=crop&q=80',
                          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&auto=format&fit=crop&q=80',
                          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop&q=80'
                        ]
                      });
                    }}
                    className="w-20 h-16 rounded-xl object-cover border border-slate-200 shrink-0 hover:scale-105 transition shadow-xs"
                  />
                ))}
              </div>
            </div>

            {/* Ratings & Student Feedback */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="font-black text-slate-900">5.0</span>
                <span className="text-slate-500 font-medium">(48 Verified Inspections)</span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveReviewTarget('scout');
                }}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer hover:underline"
              >
                + Leave Review
              </button>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-[11px] text-slate-700 italic">
              "The Head of Scouts responded on WhatsApp immediately, did a video tour of the lodge, and verified the borehole water before I paid. 100% safe!"
              <div className="text-[10px] font-bold text-emerald-800 not-italic pt-1">
                — Tariere Ebimobowei (NDU Amassoma)
              </div>
            </div>
          </div>

          {/* Action Bar (Click anywhere or click button) */}
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={(e) => handleOpenWhatsApp(scoutWhatsAppUrl, e)}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-md shadow-emerald-700/30 cursor-pointer group-hover:scale-[1.02]"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Chat with Head of Scouts on WhatsApp</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>

            <button
              type="button"
              onClick={(e) => handleCall(SCOUT_PHONE, e)}
              className="py-3 px-4 rounded-xl bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Call Head of Scouts"
            >
              <Phone className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Call</span>
            </button>
          </div>
        </div>

        {/* ---------------- PROFILE 2: UNINEST MARKET PLACE (PLACE YOUR ORDER) ---------------- */}
        <div
          onClick={() => handleOpenWhatsApp(marketplaceWhatsAppUrl)}
          className="bg-white rounded-3xl border-2 border-amber-500/80 shadow-md hover:shadow-xl hover:border-amber-600 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between group relative"
        >
          {/* Top highlight bar */}
          <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-500 w-full" />

          <div className="p-6 sm:p-7 space-y-5">
            {/* Header badges */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-950 text-xs font-black border border-amber-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  <span>5★ VERIFIED CAMPUS MARKETPLACE</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mt-2 group-hover:text-amber-700 transition">
                  UniNest Market Place — Place Your Order
                </h3>
                <p className="text-xs font-bold text-amber-700 flex items-center gap-1.5 mt-0.5">
                  <span>Representative: Campus Orders Desk (Head of Marketplace)</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-extrabold block">
                  15-30 Min Delivery
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">Escrow Guaranteed</span>
              </div>
            </div>

            {/* Campus & Location */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 text-xs text-slate-700">
              <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-snug">
                <span className="font-extrabold text-slate-900">
                  All Campuses (Direct Hostel Doorstep Delivery)
                </span>
                <div className="text-[11px] text-slate-500">
                  UniNest Central Campus Hub &amp; Hostels Dispatch Office
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 leading-relaxed">
              Official UniNest Campus Marketplace. Place your order for student laptops, phones, power banks, fast chargers, scientific calculators, textbooks, provisions, meals, and campus supplies. Express direct delivery to your hostel room with 100% Escrow buyer protection.
            </p>

            {/* Core Services Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 space-y-1">
                <div className="flex items-center gap-1.5 font-extrabold text-amber-950">
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                  <span>Gadgets &amp; Laptops</span>
                </div>
                <p className="text-[10px] text-amber-800">
                  UK/US used laptops, original chargers, power banks, calculators.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 space-y-1">
                <div className="flex items-center gap-1.5 font-extrabold text-amber-950">
                  <Truck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Hostel Doorstep Delivery</span>
                </div>
                <p className="text-[10px] text-amber-800">
                  Fast 15-30 mins delivery directly to your hostel gate or room.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 space-y-1">
                <div className="flex items-center gap-1.5 font-extrabold text-amber-950">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>100% Escrow Protection</span>
                </div>
                <p className="text-[10px] text-amber-800">
                  Funds released only after you test and confirm your order.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 space-y-1">
                <div className="flex items-center gap-1.5 font-extrabold text-amber-950">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Hot Meals &amp; Groceries</span>
                </div>
                <p className="text-[10px] text-amber-800">
                  Piping hot student meals, soups, and provisions delivered fresh.
                </p>
              </div>
            </div>

            {/* Photos Preview */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span>Featured Campus Items:</span>
                <span className="text-amber-700">Gadgets, Books &amp; Meals</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {[
                  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80'
                ].map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt="Marketplace item photo"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedGallery({
                        title: 'UniNest Marketplace Inventory',
                        images: [
                          'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80',
                          'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80',
                          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80'
                        ]
                      });
                    }}
                    className="w-20 h-16 rounded-xl object-cover border border-slate-200 shrink-0 hover:scale-105 transition shadow-xs"
                  />
                ))}
              </div>
            </div>

            {/* Ratings & Student Feedback */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="font-black text-slate-900">5.0</span>
                <span className="text-slate-500 font-medium">(62 Orders Fulfilled)</span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveReviewTarget('marketplace');
                }}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 cursor-pointer hover:underline"
              >
                + Leave Review
              </button>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 text-[11px] text-slate-700 italic">
              "Placed my order directly on WhatsApp with the Head of Marketplace. Got my laptop charger delivered to my hostel in 20 minutes. Very reliable!"
              <div className="text-[10px] font-bold text-amber-900 not-italic pt-1">
                — Kemegha Ayiba (FUOTUOKE Computer Science)
              </div>
            </div>
          </div>

          {/* Action Bar (Click anywhere or click button) */}
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={(e) => handleOpenWhatsApp(marketplaceWhatsAppUrl, e)}
              className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-md shadow-amber-600/30 cursor-pointer group-hover:scale-[1.02]"
            >
              <MessageCircle className="w-4 h-4 fill-slate-950" />
              <span>Place Your Order — WhatsApp Head of Marketplace</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>

            <button
              type="button"
              onClick={(e) => handleCall(MARKETPLACE_PHONE, e)}
              className="py-3 px-4 rounded-xl bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Call Marketplace Desk"
            >
              <Phone className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Call</span>
            </button>
          </div>
        </div>

      </div>

      {/* Review Modal */}
      {activeReviewTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600">
                  Submit Student Review
                </span>
                <h3 className="font-extrabold text-base text-slate-900">
                  {activeReviewTarget === 'scout' ? 'Rate Campus Scout' : 'Rate UniNest Marketplace'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveReviewTarget(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reviewSuccess ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-black text-slate-900 text-base">Review Published!</h4>
                <p className="text-xs text-slate-600">Thank you for sharing your feedback.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Star Rating:</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setReviewStars(s)}
                        className="p-1 cursor-pointer hover:scale-110 transition"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            s <= reviewStars ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-800 ml-2">{reviewStars} Stars</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Your Feedback:</label>
                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe your lodge inspection or order delivery experience..."
                    required
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveReviewTarget(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {selectedGallery && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">{selectedGallery.title}</h3>
              <button
                type="button"
                onClick={() => setSelectedGallery(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {selectedGallery.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt="Gallery item"
                  className="w-full h-44 rounded-2xl object-cover border border-slate-200 shadow-xs"
                />
              ))}
            </div>

            <div className="text-right pt-2">
              <button
                type="button"
                onClick={() => setSelectedGallery(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
