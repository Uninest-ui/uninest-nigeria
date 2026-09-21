import React, { useState } from 'react';
import { 
  Compass, 
  Sparkles, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Bell, 
  Building, 
  Check,
  Send,
  MessageCircle
} from 'lucide-react';
import { UniNestUser } from '../types';

interface HireAScoutComingSoonTabProps {
  user?: UniNestUser;
}

export const HireAScoutComingSoonTab: React.FC<HireAScoutComingSoonTabProps> = ({ user }) => {
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [university, setUniversity] = useState(user?.university || 'Niger Delta University (NDU)');
  const [interestType, setInterestType] = useState<'need_scout' | 'become_scout'>('need_scout');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribed(true);
    const text = `🧭 *UNINEST HIRE A SCOUT - WAITING LIST*\n` +
      `• *Name*: ${name}\n` +
      `• *Phone*: ${phone}\n` +
      `• *University*: ${university}\n` +
      `• *Role*: ${interestType === 'need_scout' ? 'Looking to hire a scout (Fresher/Student)' : 'Interested in becoming a verified scout'}\n` +
      `Please notify me immediately when the Hire a Scout service launches!`;
    window.open(`https://wa.me/2349039847154?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-4">
      {/* Hero Banner */}
      <div className="rounded-3xl bg-[#0A1931] text-white p-8 md:p-12 relative overflow-hidden border border-[#0A1931]/20 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF6A00] text-white text-xs font-black tracking-wider uppercase">
            <Clock className="w-3.5 h-3.5" />
            <span>Service Coming Soon</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Hire a Verified <span className="text-[#FF6A00]">Campus Scout</span>
          </h1>

          <p className="text-white/80 text-sm sm:text-base leading-relaxed">
            Freshers arriving in a new town? Need a trusted senior student to guide you through campus, inspect off-campus lodges, and help with resumption? The UniNest Scout Network is preparing to launch with strict background verification.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-white/90 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#FF6A00]" />
              Physical Hostel Inspections
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#FF6A00]" />
              Campus Orientation &amp; Tours
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#FF6A00]" />
              Safe Escort &amp; Luggage Support
            </span>
          </div>
        </div>

        {/* Decorative Background Accents */}
        <div className="absolute -right-12 -bottom-12 w-80 h-80 rounded-full bg-[#FF6A00]/15 blur-3xl pointer-events-none" />
        <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden lg:block opacity-20 pointer-events-none">
          <Compass className="w-64 h-64 text-[#FF6A00]" />
        </div>
      </div>

      {/* Value Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-[#FFFFFF] border-2 border-[#0A1931]/10 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#0A1931] text-[#FF6A00] flex items-center justify-center font-bold">
            <Building className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#0A1931]">1. Physical Lodge Inspections</h3>
          <p className="text-sm text-[#0A1931]/80 leading-relaxed">
            Never pay for off-campus housing blindly. A verified scout visits the lodge, verifies water, light, caretaker credentials, and distance to school gate before you make a commitment.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#FFFFFF] border-2 border-[#0A1931]/10 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#0A1931] text-[#FF6A00] flex items-center justify-center font-bold">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#0A1931]">2. Campus Navigation &amp; Tours</h3>
          <p className="text-sm text-[#0A1931]/80 leading-relaxed">
            Avoid getting lost on day one. Scouts guide freshers through faculty complexes, lecture theatres, health centres, student affairs, and screening halls.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#FFFFFF] border-2 border-[#0A1931]/10 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#0A1931] text-[#FF6A00] flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#0A1931]">3. Strictly Vetted Senior Students</h3>
          <p className="text-sm text-[#0A1931]/80 leading-relaxed">
            All prospective scouts will undergo school ID confirmation, matriculation validation, and clear safety training to guarantee student peace of mind.
          </p>
        </div>
      </div>

      {/* Waiting List / Early Access Card */}
      <div className="p-8 rounded-3xl bg-[#FFFFFF] border-2 border-[#0A1931]/15 shadow-md">
        <div className="max-w-xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <span className="px-3 py-1 rounded-full bg-[#0A1931] text-[#FF6A00] text-xs font-bold uppercase tracking-wider">
              Priority Waitlist
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0A1931]">
              Get Notified When Scouts Launch
            </h2>
            <p className="text-xs sm:text-sm text-[#0A1931]/70">
              Join the priority notification list to be first in line when verified scouts go live on your campus.
            </p>
          </div>

          {isSubscribed ? (
            <div className="p-6 rounded-2xl bg-[#0A1931] text-white text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-[#FF6A00] mx-auto" />
              <h4 className="text-lg font-bold">You are on the Priority Waitlist!</h4>
              <p className="text-xs text-white/80">
                We have recorded your details. You will receive an instant notification on WhatsApp as soon as Scout bookings open at {university}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0A1931] uppercase tracking-wider mb-1.5">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ebikake Preye"
                  className="w-full px-4 py-3 rounded-xl border border-[#0A1931]/20 bg-[#FFFFFF] text-[#0A1931] text-sm focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0A1931] uppercase tracking-wider mb-1.5">
                    WhatsApp Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 08123456789"
                    className="w-full px-4 py-3 rounded-xl border border-[#0A1931]/20 bg-[#FFFFFF] text-[#0A1931] text-sm focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0A1931] uppercase tracking-wider mb-1.5">
                    Your University / Campus
                  </label>
                  <input
                    type="text"
                    required
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="e.g. Niger Delta University (NDU)"
                    className="w-full px-4 py-3 rounded-xl border border-[#0A1931]/20 bg-[#FFFFFF] text-[#0A1931] text-sm focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0A1931] uppercase tracking-wider mb-1.5">
                  I am interested in:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setInterestType('need_scout')}
                    className={`py-3 px-4 rounded-xl text-xs font-bold border-2 transition text-left flex items-center justify-between cursor-pointer ${
                      interestType === 'need_scout'
                        ? 'bg-[#0A1931] text-white border-[#0A1931]'
                        : 'bg-[#FFFFFF] text-[#0A1931] border-[#0A1931]/20 hover:border-[#0A1931]/40'
                    }`}
                  >
                    <span>I Need a Scout (Fresher / Student)</span>
                    {interestType === 'need_scout' && <Check className="w-4 h-4 text-[#FF6A00]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setInterestType('become_scout')}
                    className={`py-3 px-4 rounded-xl text-xs font-bold border-2 transition text-left flex items-center justify-between cursor-pointer ${
                      interestType === 'become_scout'
                        ? 'bg-[#0A1931] text-white border-[#0A1931]'
                        : 'bg-[#FFFFFF] text-[#0A1931] border-[#0A1931]/20 hover:border-[#0A1931]/40'
                    }`}
                  >
                    <span>I Want to Become a Scout</span>
                    {interestType === 'become_scout' && <Check className="w-4 h-4 text-[#FF6A00]" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-[#FF6A00] hover:bg-[#E55E00] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Join Waitlist &amp; Notify Me on WhatsApp</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
