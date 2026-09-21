import React, { useState, useEffect } from 'react';
import {
  Award,
  DollarSign,
  Copy,
  Check,
  Share2,
  ExternalLink,
  ArrowUpRight,
  CreditCard,
  Building2,
  TrendingUp,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  Users,
  Sparkles,
  AlertCircle,
  HelpCircle,
  QrCode,
  Download,
  Send,
  FileText,
  BadgeCheck,
  RefreshCw,
  ShoppingBag,
  BookOpen,
  Wifi,
  Gift,
  HeartHandshake
} from 'lucide-react';
import { UniNestUser, CampusScoutProfile, ScoutCommissionTransaction, ScoutPayoutRequest, ScoutServiceType } from '../types';
import { scoutReferralService } from '../utils/scoutReferralService';

interface ScoutCommissionDashboardProps {
  user: UniNestUser;
  onNavigateTab?: (tab: string) => void;
}

const NIGERIAN_BANKS = [
  'GTBank (Guaranty Trust)',
  'Access Bank',
  'Zenith Bank',
  'United Bank for Africa (UBA)',
  'First Bank of Nigeria',
  'Kuda Microfinance Bank',
  'OPay Digital Services',
  'PalmPay',
  'Moniepoint Microfinance Bank',
  'Fidelity Bank',
  'Stanbic IBTC Bank',
  'Wema Bank / ALAT',
  'Sterling Bank',
  'Union Bank of Nigeria',
  'Ecobank Nigeria'
];

export const ScoutCommissionDashboard: React.FC<ScoutCommissionDashboardProps> = ({
  user,
  onNavigateTab
}) => {
  const safeUser = user || {
    name: 'Campus Scout',
    email: 'scout@uninest.ng',
    university: 'Niger Delta University (NDU)',
    department: 'Engineering',
    phone: '08139045612'
  };

  // Scout profile state
  const [scout, setScout] = useState<CampusScoutProfile>(() => {
    return scoutReferralService.getOrCreateScoutForUser(safeUser);
  });

  const [transactions, setTransactions] = useState<ScoutCommissionTransaction[]>(() => {
    const all = scoutReferralService.getTransactions();
    return all.filter(t => t.scoutCode === scout.scoutCode || t.scoutEmail === scout.email);
  });

  const [payouts, setPayouts] = useState<ScoutPayoutRequest[]>(() => {
    const all = scoutReferralService.getPayoutRequests();
    return all.filter(p => p.scoutCode === scout.scoutCode || p.scoutEmail === scout.email);
  });

  // UI States
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showTestPayModal, setShowTestPayModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<ScoutPayoutRequest | null>(null);

  // Filter & Search
  const [activeFilter, setActiveFilter] = useState<'all' | 'cleared' | 'escrow_pending' | 'paid_out'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Payout Form
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutBank, setPayoutBank] = useState(scout.bankName || 'GTBank (Guaranty Trust)');
  const [payoutAcctNumber, setPayoutAcctNumber] = useState(scout.accountNumber || '0129845512');
  const [payoutAcctName, setPayoutAcctName] = useState(scout.accountName || scout.name);
  const [payoutError, setPayoutError] = useState<string | null>(null);
  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState<string | null>(null);

  // Custom Code Form
  const [customCodeInput, setCustomCodeInput] = useState(scout.scoutCode);
  const [customCodeError, setCustomCodeError] = useState<string | null>(null);

  // Test Payment simulation
  const [testServiceName, setTestServiceName] = useState<ScoutServiceType>('Marketplace Escrow');
  const [testAmount, setTestAmount] = useState('50000');
  const [testClientName, setTestClientName] = useState('Ebiere Tammy');
  const [testClientEmail, setTestClientEmail] = useState('ebiere.tammy@fuotuoke.edu.ng');

  // Interactive 5% Calculator
  const [calcStudents, setCalcStudents] = useState<number>(12);
  const [calcAvgSpend, setCalcAvgSpend] = useState<number>(85000);

  // Sync state when external commission payments happen
  useEffect(() => {
    const handleScoutUpdated = () => {
      const updatedScout = scoutReferralService.getOrCreateScoutForUser(safeUser);
      setScout(updatedScout);
      const allTxs = scoutReferralService.getTransactions();
      setTransactions(allTxs.filter(t => t.scoutCode === updatedScout.scoutCode || t.scoutEmail === updatedScout.email));
      const allPayouts = scoutReferralService.getPayoutRequests();
      setPayouts(allPayouts.filter(p => p.scoutCode === updatedScout.scoutCode || p.scoutEmail === updatedScout.email));
    };

    window.addEventListener('uninest_scout_commission_credited', handleScoutUpdated);
    window.addEventListener('uninest_scout_updated', handleScoutUpdated);
    window.addEventListener('uninest_scout_payout_completed', handleScoutUpdated);

    return () => {
      window.removeEventListener('uninest_scout_commission_credited', handleScoutUpdated);
      window.removeEventListener('uninest_scout_updated', handleScoutUpdated);
      window.removeEventListener('uninest_scout_payout_completed', handleScoutUpdated);
    };
  }, [safeUser]);

  // Derived dedicated referral link
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://uninest.ng';
  const dedicatedReferralLink = `${origin}/?ref=${scout.scoutCode}`;

  const copyToClipboard = (text: string, isLink = true) => {
    navigator.clipboard.writeText(text);
    if (isLink) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 3000);
    }
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(
      `Hey students! 🎓 I am a verified Campus Scout for UniNest (${scout.university}).\n\n` +
      `Are you looking for verified student lodges (self-contain/flats), peer academic research assistance, cheap data bundles, or secure student escrow for laptops/gadgets?\n\n` +
      `Check out UniNest via my dedicated scout link:\n${dedicatedReferralLink}\n\n` +
      `Enjoy safe campus transactions protected by student escrow!`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleCustomCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customCodeInput.trim().toUpperCase().replace(/\s+/g, '-');
    if (clean.length < 5) {
      setCustomCodeError('Referral code must be at least 5 characters long.');
      return;
    }
    const updated = scoutReferralService.updateScoutProfile(scout.id, { scoutCode: clean });
    if (updated) {
      setScout(updated);
      setShowCodeModal(false);
      setCustomCodeError(null);
    }
  };

  const handlePayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutError(null);
    const amt = Number(payoutAmount);

    if (isNaN(amt) || amt <= 0) {
      setPayoutError('Please enter a valid payout amount in Naira.');
      return;
    }

    if (amt > (scout.availableBalance || 0)) {
      setPayoutError(`Insufficient cleared balance! Maximum available for withdrawal is ₦${(scout.availableBalance || 0).toLocaleString()}.`);
      return;
    }

    if (!payoutAcctNumber || payoutAcctNumber.length !== 10) {
      setPayoutError('Please enter a valid 10-digit NUBAN Nigerian bank account number.');
      return;
    }

    const result = scoutReferralService.requestPayout({
      scoutId: scout.id,
      amount: amt,
      bankName: payoutBank,
      accountNumber: payoutAcctNumber,
      accountName: payoutAcctName
    });

    if (result.success && result.payout) {
      setPayoutSuccessMsg(result.message);
      setActiveReceipt(result.payout);
      setShowPayoutModal(false);
      setShowReceiptModal(true);
      setPayoutAmount('');
      // refresh scout and payouts
      const updated = scoutReferralService.getOrCreateScoutForUser(safeUser);
      setScout(updated);
      setPayouts(scoutReferralService.getPayoutRequests().filter(p => p.scoutCode === updated.scoutCode));
    } else {
      setPayoutError(result.message);
    }
  };

  const handleTestPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(testAmount);
    if (isNaN(amt) || amt <= 0) return;

    scoutReferralService.recordCommissionPayment({
      scoutCode: scout.scoutCode,
      clientName: testClientName.trim() || 'Campus Student',
      clientEmail: testClientEmail.trim() || 'client@campus.ng',
      clientUniversity: scout.university,
      serviceType: testServiceName,
      serviceDescription: `Payment for ${testServiceName} via scout link (${scout.scoutCode})`,
      grossAmount: amt,
      channel: 'dedicated_link',
      isEscrow: testServiceName === 'Marketplace Escrow'
    });

    setShowTestPayModal(false);
    // Refresh local lists
    const updated = scoutReferralService.getOrCreateScoutForUser(safeUser);
    setScout(updated);
    setTransactions(scoutReferralService.getTransactions().filter(t => t.scoutCode === updated.scoutCode));
  };

  // Filtered transactions
  const filteredTransactions = transactions.filter(t => {
    const matchFilter = 
      activeFilter === 'all' 
        ? true 
        : activeFilter === 'cleared' 
          ? t.status === 'cleared' 
          : activeFilter === 'escrow_pending'
            ? t.status === 'escrow_pending'
            : t.status === 'paid_out';

    const matchSearch = 
      t.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.serviceDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.paymentReference.toLowerCase().includes(searchQuery.toLowerCase());

    return matchFilter && matchSearch;
  });

  const getServiceIcon = (type: ScoutServiceType) => {
    switch (type) {
      case 'Marketplace Escrow':
        return <ShoppingBag className="w-4 h-4 text-purple-600" />;
      case 'Academic Assist':
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'Cheap Student Data':
        return <Wifi className="w-4 h-4 text-amber-600" />;
      case 'STS Gifting':
        return <Gift className="w-4 h-4 text-rose-600" />;
      case 'Crowdfunding Donation':
        return <HeartHandshake className="w-4 h-4 text-emerald-600" />;
      case 'Lodge & Hostel Verification':
      default:
        return <Building2 className="w-4 h-4 text-orange-600" />;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn" id="scouts-commission-dashboard">
      {/* ================= 1. SCOUT PROFILE & DEDICATED REFERRAL LINK BANNER ================= */}
      <div className="bg-gradient-to-br from-slate-900 via-[#111c33] to-slate-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Scout Identity */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold">
              <Award className="w-3.5 h-3.5" />
              <span>Official UniNest Referral Program • 5% Direct Commission</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Referral Dashboard
            </h1>

            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Share your dedicated referral link with fellow students across Nigerian campuses. Whenever anyone pays for verified lodges, marketplace escrow, academic research assistance, cheap data, or sign-out gifts through your link, <strong>you earn an instant 5% cash commission</strong> credited directly to your bank account!
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-300">
              <span className="font-semibold text-white flex items-center gap-1">
                <BadgeCheck className="w-4 h-4 text-emerald-400" />
                {scout.name}
              </span>
              <span>•</span>
              <span className="text-slate-400">{scout.university}</span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono font-bold">
                5% Direct Commission
              </span>
            </div>
          </div>

          {/* Right Action: Instant Bank Payout Button */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => setShowPayoutModal(true)}
              id="btn-withdraw-scout-commission"
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm transition shadow-lg flex items-center justify-center gap-2 cursor-pointer group hover:scale-[1.02]"
            >
              <CreditCard className="w-4 h-4 text-emerald-200 group-hover:animate-pulse" />
              <span>Withdraw to Bank (NIP)</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowTestPayModal(true)}
              id="btn-simulate-client-payment"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate Client Payment (5%)</span>
            </button>
          </div>
        </div>

        {/* Dedicated Link Box */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <div className="lg:col-span-8 bg-slate-950/90 border border-slate-700/80 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                Your Dedicated Scout Referral Link
              </span>
              <div className="font-mono text-xs sm:text-sm text-slate-200 truncate bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 select-all">
                {dedicatedReferralLink}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => copyToClipboard(dedicatedReferralLink, true)}
                id="btn-copy-dedicated-scout-link"
                className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
              </button>

              <button
                onClick={shareOnWhatsApp}
                id="btn-share-scout-link-whatsapp"
                className="px-3.5 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share WhatsApp</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 bg-slate-950/70 border border-slate-800 rounded-xl p-3 sm:p-4 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Unique Referral Code
              </span>
              <div className="font-mono text-sm font-black text-white flex items-center gap-1.5 mt-0.5">
                <span>{scout.scoutCode}</span>
                <button
                  onClick={() => copyToClipboard(scout.scoutCode, false)}
                  className="text-slate-400 hover:text-white transition p-1"
                  title="Copy code"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowCodeModal(true)}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-2 transition"
            >
              Customize Code
            </button>
          </div>
        </div>
      </div>

      {/* ================= 2. COMMISSION STATS METRICS (5% MODEL) ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total 5% Commission Earned */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between gap-2 text-slate-500 text-xs font-semibold mb-2">
            <span>Total 5% Commission</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
            ₦{(scout.totalEarnings || 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <span>Cumulative gross 5% earnings</span>
          </p>
        </div>

        {/* Available Balance Ready for Withdrawal */}
        <div className="bg-white rounded-2xl p-5 border-2 border-emerald-500/40 bg-emerald-50/20 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between gap-2 text-slate-600 text-xs font-semibold mb-2">
            <span className="text-emerald-900 font-bold">Cleared &amp; Ready for Payout</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            ₦{(scout.availableBalance || 0).toLocaleString()}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <button
              onClick={() => setShowPayoutModal(true)}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline flex items-center gap-1 cursor-pointer"
            >
              <span>Instant Bank Transfer</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
            <span className="text-[10px] text-emerald-600 font-semibold">Instant NIP</span>
          </div>
        </div>

        {/* Escrow Pending Commission */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between gap-2 text-slate-500 text-xs font-semibold mb-2">
            <span>Escrow Protected (Pending)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            ₦{(scout.pendingBalance || 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Clears upon client item inspection or project delivery
          </p>
        </div>

        {/* Total Referrals & Volume */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between gap-2 text-slate-500 text-xs font-semibold mb-2">
            <span>Paying Clients / Referrals</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {scout.paidTransactionsCount || 0} <span className="text-sm font-normal text-slate-500">students</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Total Withdrawn: <strong>₦{(scout.totalWithdrawn || 0).toLocaleString()}</strong>
          </p>
        </div>
      </div>

      {/* ================= 3. INTERACTIVE 5% COMMISSION CALCULATOR ================= */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campus Earnings Estimator</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Calculate Your 5% Commission Potential
            </h2>
            <p className="text-xs text-slate-500">
              See how much you can earn bi-weekly or monthly by recommending UniNest on your campus.
            </p>
          </div>

          <div className="bg-slate-900 text-white px-5 py-3 rounded-xl flex items-center gap-3">
            <div>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                Estimated 5% Commission
              </span>
              <span className="text-xl sm:text-2xl font-black text-white">
                ₦{Math.round(calcStudents * calcAvgSpend * 0.05).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Slider 1: Students */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Referred Paying Students</span>
              <span className="font-bold text-slate-900 font-mono text-sm">{calcStudents} students</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={calcStudents}
              onChange={(e) => setCalcStudents(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>1 student</span>
              <span>50 students</span>
              <span>100 students</span>
            </div>
          </div>

          {/* Slider 2: Average Transaction */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Average Student Payment (₦)</span>
              <span className="font-bold text-slate-900 font-mono text-sm">₦{calcAvgSpend.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="5000"
              max="350000"
              step="5000"
              value={calcAvgSpend}
              onChange={(e) => setCalcAvgSpend(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>₦5k (Data/Gifts)</span>
              <span>₦150k (Hostel Rent)</span>
              <span>₦350k (Laptops/Flats)</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <span>
            💡 <em>Hostel accommodation leases (₦100k - ₦250k) and Final Year Project assistance (₦20k - ₦40k) yield the highest commissions!</em>
          </span>
          <button
            onClick={() => copyToClipboard(dedicatedReferralLink, true)}
            className="text-amber-600 font-bold hover:underline inline-flex items-center gap-1"
          >
            <span>Share your link now</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ================= 4. REAL-TIME COMMISSION TRANSACTIONS LEDGER ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Commission Earnings Ledger</span>
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {filteredTransactions.length} records
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Live tracking of all transactions paid by students using your dedicated link or code.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student or ref..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 w-40 sm:w-52"
              />
            </div>

            {/* Filter Tabs */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  activeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter('cleared')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  activeFilter === 'cleared' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cleared
              </button>
              <button
                onClick={() => setActiveFilter('escrow_pending')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  activeFilter === 'escrow_pending' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pending
              </button>
            </div>
          </div>
        </div>

        {/* Table / List */}
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <DollarSign className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No Commission Records Found</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No payments match your current filter. Copy and share your dedicated scout link across campus WhatsApp groups to start receiving 5% on student orders!
            </p>
            <button
              onClick={() => copyToClipboard(dedicatedReferralLink, true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition inline-flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy My Scout Link</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4">Date &amp; Service</th>
                  <th className="py-3 px-4">Student (Client)</th>
                  <th className="py-3 px-4 text-right">Client Paid (₦)</th>
                  <th className="py-3 px-4 text-right">Your 5% Commission</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Payment Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-slate-100 shrink-0">
                          {getServiceIcon(tx.serviceType)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{tx.serviceType}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-1 max-w-xs">{tx.serviceDescription}</p>
                          <span className="text-[10px] text-slate-400 font-mono">{tx.date}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{tx.clientName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{tx.clientEmail}</p>
                      {tx.clientUniversity && (
                        <p className="text-[10px] text-slate-400">{tx.clientUniversity}</p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      ₦{(tx.grossAmount || 0).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-mono font-black text-sm border border-emerald-200">
                        +₦{(tx.commissionAmount || 0).toLocaleString()}
                      </div>
                      <span className="block text-[10px] text-emerald-600 font-semibold mt-0.5">5% rate</span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {tx.status === 'cleared' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <Check className="w-3 h-3" />
                          <span>Cleared</span>
                        </span>
                      )}
                      {tx.status === 'escrow_pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3" />
                          <span>Escrow Lock</span>
                        </span>
                      )}
                      {tx.status === 'paid_out' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          <Check className="w-3 h-3" />
                          <span>Disbursed</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-[11px] text-slate-500">
                      {tx.paymentReference}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Payout History Section */}
        {payouts.length > 0 && (
          <div className="p-5 bg-slate-50 border-t border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-slate-500" />
              <span>Bank Withdrawal History (NIP Transfer Records)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {payouts.map((p) => (
                <div 
                  key={p.id}
                  onClick={() => {
                    setActiveReceipt(p);
                    setShowReceiptModal(true);
                  }}
                  className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 shadow-xs cursor-pointer transition group"
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-xs font-black text-slate-900 font-mono">
                      ₦{(p.amount || 0).toLocaleString()}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-0.5">
                      <Check className="w-2.5 h-2.5" />
                      <span>Settled</span>
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-700 font-semibold truncate">
                    {p.bankName} • {p.accountNumber}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Ref: {p.transferReference || p.id}
                  </p>
                  <div className="mt-2 text-[10px] text-emerald-600 font-bold group-hover:underline flex items-center gap-0.5">
                    <span>View Transfer Receipt</span>
                    <ArrowUpRight className="w-2.5 h-2.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ================= 5. CAMPUS SCOUT GUIDELINES & PROMO STRATEGY ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-black">
            1
          </div>
          <h4 className="text-sm font-bold text-slate-900">How to Share Your Link</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Paste your dedicated link in your departmental WhatsApp groups, Telegram channels, and hostel roommate forums when students ask for off-campus lodges, project assistance, or safe gadget sellers.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-black">
            2
          </div>
          <h4 className="text-sm font-bold text-slate-900">Automatic 5% Tracking</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            When a visitor opens your link, your scout code is permanently remembered on their device. Whenever they initiate an escrow transaction, pay for academic assist, or buy student data, you receive 5% immediately.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-black">
            3
          </div>
          <h4 className="text-sm font-bold text-slate-900">Instant Nigerian Bank Payouts</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Cleared commission can be withdrawn directly to your GTBank, Access, Kuda, OPay, Palmpay, or Zenith Bank account with zero deduction fees via NIP transfer.
          </p>
        </div>
      </div>

      {/* ================= MODAL: WITHDRAW COMMISSION TO NIGERIAN BANK ================= */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-200 relative animate-scaleUp">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  <span>Withdraw Scout Commission</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Instant NIP disbursement to your Nigerian bank account.
                </p>
              </div>
              <button
                onClick={() => setShowPayoutModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {payoutError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{payoutError}</span>
              </div>
            )}

            <form onSubmit={handlePayoutSubmit} className="space-y-4">
              {/* Available balance highlight */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-800 block">Available for Payout</span>
                  <span className="text-xl font-black text-emerald-700 font-mono">
                    ₦{(scout.availableBalance || 0).toLocaleString()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPayoutAmount(String(scout.availableBalance))}
                  className="text-xs font-bold text-emerald-800 bg-emerald-200/70 hover:bg-emerald-200 px-2.5 py-1 rounded-lg transition"
                >
                  Withdraw All
                </button>
              </div>

              {/* Amount to withdraw */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Withdrawal Amount (₦) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₦</span>
                  <input
                    type="number"
                    min="500"
                    max={scout.availableBalance}
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    placeholder="e.g. 25000"
                    required
                    className="w-full pl-8 pr-4 py-2.5 text-sm font-mono font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Bank Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Destination Bank *
                </label>
                <select
                  value={payoutBank}
                  onChange={(e) => setPayoutBank(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {NIGERIAN_BANKS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  10-Digit NUBAN Account Number *
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={payoutAcctNumber}
                  onChange={(e) => setPayoutAcctNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="0123456789"
                  required
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Account Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Account Name *
                </label>
                <input
                  type="text"
                  value={payoutAcctName}
                  onChange={(e) => setPayoutAcctName(e.target.value)}
                  placeholder="Full Legal Name on Bank Account"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scout.availableBalance <= 0}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Confirm Instant Transfer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CUSTOMIZE SCOUT CODE ================= */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-200 relative animate-scaleUp">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>Customize Your Scout Code</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Pick a short, memorable campus handle for your dedicated link.
                </p>
              </div>
              <button
                onClick={() => setShowCodeModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {customCodeError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{customCodeError}</span>
              </div>
            )}

            <form onSubmit={handleCustomCodeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Referral Code (Uppercase letters, numbers &amp; hyphens)
                </label>
                <input
                  type="text"
                  value={customCodeInput}
                  onChange={(e) => setCustomCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. SCOUT-NDU-TARIERE"
                  required
                  className="w-full px-3 py-2 text-sm font-mono font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Your dedicated link will update to: <strong>{origin}/?ref={customCodeInput.trim().toUpperCase() || 'CODE'}</strong>
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCodeModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  Save Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: SIMULATE CLIENT PAYMENT (5% TEST) ================= */}
      {showTestPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-200 relative animate-scaleUp">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-amber-500" />
                  <span>Simulate Client Payment</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Simulate a student ordering a campus service through your link to verify your 5% commission credit.
                </p>
              </div>
              <button
                onClick={() => setShowTestPayModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTestPaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Service Category
                </label>
                <select
                  value={testServiceName}
                  onChange={(e) => setTestServiceName(e.target.value as ScoutServiceType)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="Marketplace Escrow">Marketplace Escrow (Laptop / Phone / Bed)</option>
                  <option value="Academic Assist">Academic Assist (Project / SPSS Analysis)</option>
                  <option value="Lodge & Hostel Verification">Lodge &amp; Hostel Verification (Amassoma / Yenagoa)</option>
                  <option value="Cheap Student Data">Cheap Student Data (MTN / Airtel Bundles)</option>
                  <option value="STS Gifting">STS Sign-out Cash Gift</option>
                  <option value="Crowdfunding Donation">Crowdfunding Campaign Donation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Gross Payment Amount (₦)
                </label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  value={testAmount}
                  onChange={(e) => setTestAmount(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Real-time 5% preview */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-900">Your 5% Commission:</span>
                <span className="font-mono font-black text-emerald-700 text-sm">
                  +₦{Math.round(Number(testAmount || 0) * 0.05).toLocaleString()}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Client Student Name
                </label>
                <input
                  type="text"
                  value={testClientName}
                  onChange={(e) => setTestClientName(e.target.value)}
                  placeholder="e.g. Victor Okon"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTestPayModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  Trigger 5% Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DISBURSEMENT RECEIPT ================= */}
      {showReceiptModal && activeReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-200 relative animate-scaleUp text-slate-900">
            <div className="text-center pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                Disbursement Verified &amp; Settled
              </h3>
              <p className="text-xs text-slate-500">
                UniNest NIP Instant Transfer Receipt
              </p>
            </div>

            <div className="my-4 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Payout Amount:</span>
                <span className="font-mono font-black text-emerald-600 text-sm">
                  ₦{(activeReceipt.amount || 0).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Beneficiary Scout:</span>
                <span className="font-bold text-slate-800">{activeReceipt.scoutName}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Destination Bank:</span>
                <span className="font-bold text-slate-800">{activeReceipt.bankName}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Account Number:</span>
                <span className="font-mono font-bold text-slate-800">{activeReceipt.accountNumber}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">NIP Transfer Ref:</span>
                <span className="font-mono text-slate-700 text-[11px]">{activeReceipt.transferReference}</span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-slate-500">Settled At:</span>
                <span className="text-slate-700">{activeReceipt.paidAt || activeReceipt.requestedAt}</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 flex items-center gap-2 mb-4">
              <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Funds have been delivered directly to your bank account without transaction deductions.</span>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowReceiptModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
