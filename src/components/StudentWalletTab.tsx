import React, { useState, useMemo } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Gift,
  PiggyBank,
  TrendingUp,
  Search,
  Filter,
  Download,
  Printer,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Sparkles,
  DollarSign,
  Building,
  CreditCard,
  Share2,
  AlertCircle,
  FileText,
  ChevronRight,
  PlusCircle,
  Send,
  Eye,
  X,
  Lock,
  Phone,
  ArrowLeft
} from 'lucide-react';
import { STSSavingsAccount, UniNestUser, StudentGift } from '../types';
import { getStudentSTSWalletNumber } from '../utils/walletUtils';
import { OfficialBankPaymentCard } from './OfficialBankPaymentCard';

interface StudentWalletTabProps {
  user: UniNestUser;
  account?: STSSavingsAccount;
  onDeposit: (amount: number, description: string) => void;
  onWithdraw?: (amount: number, bankName: string, accNumber: string, accName: string, reason: string) => void;
  onGiftStudent?: (gift: Omit<StudentGift, 'id' | 'date'>) => void;
  onRequestLoan?: (amount: number, purpose: string, durationMonths: number) => void;
  onRepayLoan?: (amount: number) => void;
}

export const StudentWalletTab: React.FC<StudentWalletTabProps> = ({
  user,
  account,
  onDeposit,
  onWithdraw,
  onGiftStudent,
}) => {
  const safeUser = user || {
    name: 'Student',
    email: 'student@campus.ng',
    university: 'Nigerian University',
    department: 'General Studies',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  };

  // Filter States
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [timeRange, setTimeRange] = useState<string>('all');

  // Modals
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('5000');
  const [depositDesc, setDepositDesc] = useState('Pocket money savings deposit');
  const [depositMethod, setDepositMethod] = useState<'bank_transfer' | 'ussd'>('bank_transfer');
  const [depositSuccessMsg, setDepositSuccessMsg] = useState<string | null>(null);

  // Withdrawal Modal
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('5000');
  const [withdrawBank, setWithdrawBank] = useState('Access Bank');
  const [withdrawAccNumber, setWithdrawAccNumber] = useState('');
  const [withdrawAccName, setWithdrawAccName] = useState(user.name || '');
  const [withdrawReason, setWithdrawReason] = useState('Sign Out Cash Out - Departmental & Faculty Clearance');
  const [withdrawSuccessMsg, setWithdrawSuccessMsg] = useState<string | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  // Receipt Modal
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState<any | null>(null);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  // Statement of Account Modal
  const [showStatementModal, setShowStatementModal] = useState(false);

  // STS Wallet Number
  const stsWalletNumber = getStudentSTSWalletNumber(user.email, user.phone);
  const [copiedSTS, setCopiedSTS] = useState(false);

  const handleCopySTSWallet = () => {
    navigator.clipboard.writeText(stsWalletNumber);
    setCopiedSTS(true);
    setTimeout(() => setCopiedSTS(false), 2500);
  };

  const handleShareSTSWallet = () => {
    const text = `🎓 *MY UNINEST STS WALLET NUMBER*\n` +
      `Hey! You can gift me feeding allowance, exam handouts support, or sign-out cash directly into my UniNest Student Wallet:\n\n` +
      `• *STS Wallet ID*: ${stsWalletNumber}\n` +
      `• *Student*: ${user.name || 'UniNest Student'}\n` +
      `• *Campus*: ${user.university || 'Niger Delta University'}\n` +
      `• 0% fee on all student peer gifts!\n\n` +
      `https://uninest.ng`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Safe transactions list
  const allTransactions = useMemo(() => {
    if (account?.transactions && account.transactions.length > 0) {
      return account.transactions;
    }
    // Default seed transactions
    return [
      {
        id: 'tx-1',
        type: 'deposit' as const,
        amount: 15000,
        date: 'Aug 15, 2026',
        description: 'First semester initial sign-out seed deposit',
        balanceAfter: 15000
      },
      {
        id: 'tx-2',
        type: 'deposit' as const,
        amount: 30000,
        date: 'Aug 20, 2026',
        description: 'Monthly student allowance deposit',
        balanceAfter: 45000
      },
      {
        id: 'tx-gift-1',
        type: 'gift_sent' as const,
        amount: 5000,
        date: 'Aug 26, 2026',
        description: 'Student Gift Sent to Ebiere Tonye (Exam Handouts)',
        recipientOrSender: 'Ebiere Tonye (FUOTUOKE)',
        balanceAfter: 40000
      },
      {
        id: 'tx-gift-2',
        type: 'gift_received' as const,
        amount: 10000,
        date: 'Aug 28, 2026',
        description: 'Student Gift Received from Engr. Preye (NDU Alumni)',
        recipientOrSender: 'Engr. Preye',
        balanceAfter: 50000
      },
      {
        id: 'tx-3',
        type: 'deposit' as const,
        amount: 20000,
        date: 'Aug 29, 2026',
        description: 'Side hustle project savings',
        balanceAfter: 70000
      },
      {
        id: 'tx-4',
        type: 'interest' as const,
        amount: 500,
        date: 'Sep 01, 2026',
        description: 'UniNest Save-Till-Sign-out monthly compound reward',
        balanceAfter: 70500
      }
    ];
  }, [account]);

  const currentBalance = account?.currentBalance || 70500;
  const giftWithdrawableBalance = account?.giftAccountBalance ?? account?.giftBalance ?? 15000;
  // Master wallet balance carrying total amount (locked STS savings + spendable gift account)
  const totalWalletAmount = account?.walletBalance ?? (currentBalance + giftWithdrawableBalance);
  const withdrawalDate = account?.withdrawalDate || 'Nov 30, 2026';
  const minSavingsLimit = 200;
  const targetGoalAmount = account?.targetAmount || 250000;
  const progressPercent = Math.min(100, Math.round((currentBalance / (targetGoalAmount || 1)) * 100));

  // Compute stats
  const totalDeposited = useMemo(() => {
    return allTransactions
      .filter((t) => t.type === 'deposit')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [allTransactions]);

  const totalGiftsReceived = useMemo(() => {
    return allTransactions
      .filter((t) => t.type === 'gift_received')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [allTransactions]);

  const totalGiftsSent = useMemo(() => {
    return allTransactions
      .filter((t) => t.type === 'gift_sent')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [allTransactions]);

  const totalInterest = useMemo(() => {
    return allTransactions
      .filter((t) => t.type === 'interest')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [allTransactions]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((tx) => {
      // Type filter
      let matchType = true;
      if (filterType === 'deposits') matchType = tx.type === 'deposit';
      else if (filterType === 'gifts_received') matchType = tx.type === 'gift_received';
      else if (filterType === 'gifts_sent') matchType = tx.type === 'gift_sent';
      else if (filterType === 'interest') matchType = tx.type === 'interest';
      else if (filterType === 'payouts') matchType = tx.type === 'signout_payout';

      // Search filter
      const q = searchQuery.toLowerCase();
      const matchQuery =
        q === '' ||
        tx.description.toLowerCase().includes(q) ||
        tx.id.toLowerCase().includes(q) ||
        (tx.recipientOrSender && tx.recipientOrSender.toLowerCase().includes(q));

      // Time range filter
      let matchTime = true;
      if (timeRange === 'sep2026') matchTime = tx.date.includes('Sep');
      else if (timeRange === 'aug2026') matchTime = tx.date.includes('Aug');

      return matchType && matchQuery && matchTime;
    });
  }, [allTransactions, filterType, searchQuery, timeRange]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRef(key);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(depositAmount);
    if (!num || num < minSavingsLimit) {
      alert(`Minimum savings deposit is ₦${minSavingsLimit}.`);
      return;
    }

    onDeposit(num, depositDesc || `Pocket money savings via ${depositMethod.toUpperCase()}`);
    setDepositSuccessMsg(`Deposit request of ₦${num.toLocaleString()} submitted! As required, an Admin must confirm your deposit before it is credited to your active balance.`);
    setTimeout(() => {
      setDepositSuccessMsg(null);
      setShowDepositModal(false);
    }, 2800);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);
    const num = Number(withdrawAmount);
    if (!num || num < 500) {
      setWithdrawError('Minimum withdrawal amount is ₦500.');
      return;
    }
    // Student wallet and history can only withdraw from gift amount!
    if (num > giftWithdrawableBalance) {
      setWithdrawError(
        `Withdrawal restricted: You can only withdraw from your Gift Amount (₦${giftWithdrawableBalance.toLocaleString()} available). Your core STS savings (₦${currentBalance.toLocaleString()}) is locked until your scheduled graduation withdrawal date (${withdrawalDate}).`
      );
      return;
    }
    if (!withdrawAccNumber || withdrawAccNumber.length < 10) {
      setWithdrawError('Please enter a valid 10-digit NUBAN account number.');
      return;
    }
    if (!withdrawAccName.trim()) {
      setWithdrawError('Please enter the bank account name.');
      return;
    }

    if (onWithdraw) {
      onWithdraw(num, withdrawBank, withdrawAccNumber, withdrawAccName, withdrawReason);
    }

    // Automated WhatsApp routing to +234 903 984 7154 with all form details
    const withdrawMsg = `💸 *UNINEST STUDENT WALLET WITHDRAWAL REQUEST*\n` +
      `------------------------------------------\n` +
      `• Student Name: ${safeUser.name || 'Student'}\n` +
      `• Email: ${safeUser.email}\n` +
      `• Phone: ${safeUser.phone || '08000000000'}\n` +
      `• University: ${safeUser.university || 'Nigerian University'}\n` +
      `• Withdrawal Amount: ₦${num.toLocaleString()}\n` +
      `• Bank Name: ${withdrawBank}\n` +
      `• Account Number: ${withdrawAccNumber}\n` +
      `• Account Name: ${withdrawAccName}\n` +
      `• Purpose / Category: ${withdrawReason}\n` +
      `• Remaining Total Wallet: ₦${Math.max(0, totalWalletAmount - num).toLocaleString()}\n` +
      `• Remaining Gift Balance: ₦${Math.max(0, giftWithdrawableBalance - num).toLocaleString()}\n` +
      `• Date: ${new Date().toLocaleString()}\n` +
      `------------------------------------------\n` +
      `Please disburse funds from the student wallet to the specified account.`;

    window.open(`https://wa.me/2349039847154?text=${encodeURIComponent(withdrawMsg)}`, '_blank');

    setWithdrawSuccessMsg(`Withdrawal of ₦${num.toLocaleString()} submitted! Details automated to the finance desk on WhatsApp (+234 903 984 7154). Funds will disburse within 15-30 minutes.`);
    setTimeout(() => {
      setWithdrawSuccessMsg(null);
      setShowWithdrawModal(false);
      setWithdrawAccNumber('');
    }, 3500);
  };

  const handlePrintStatement = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-bold border border-orange-500/30">
              <Wallet className="w-3.5 h-3.5 text-orange-400" />
              <span>UniNest Student Digital Wallet &amp; Savings Ledger</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Student Wallet &amp; History
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Track your STS graduation savings, bank withdrawals and payouts, side-hustle deposits, and 70% milestone gifts eligibility with verified institutional vault protection.
            </p>
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-200 text-xs font-semibold flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[10px] uppercase">Notice</span>
              <span>STS Program is available for Bayelsa State universities &amp; Abia State University (ABSU) • ₦500 to open STS account for first timers. Direct Bank &amp; USSD active.</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowDepositModal(true)}
              id="btn-wallet-deposit"
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-orange-950/40 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Deposit / Save Funds</span>
            </button>

            <button
              onClick={() => setShowWithdrawModal(true)}
              id="btn-wallet-withdraw"
              className="px-4 py-2.5 rounded-2xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 text-xs font-bold transition flex items-center gap-2 border border-emerald-500/40 backdrop-blur-xs cursor-pointer shadow-sm"
            >
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              <span>Withdraw to Bank</span>
            </button>

            <button
              onClick={() => setShowStatementModal(true)}
              id="btn-wallet-statement"
              className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-2 border border-white/20 backdrop-blur-xs cursor-pointer"
              title="View & Download Official Statement"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Statement</span>
            </button>
          </div>
        </div>

        {/* Balance Overview Grid */}
        <div className="mt-6 pt-6 border-t border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Total Wallet Balance</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white">
              ₦{totalWalletAmount.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <span>● Master Wallet (Carries Total Amount)</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Sign-Out Target Goal</span>
              <PiggyBank className="w-3.5 h-3.5 text-orange-400" />
            </div>
            <div className="text-2xl font-black text-orange-300">
              ₦{targetGoalAmount.toLocaleString()}
            </div>
            <div className="w-full bg-slate-700/60 rounded-full h-1.5 overflow-hidden mt-2">
              <div
                className="bg-gradient-to-r from-orange-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 font-bold flex justify-between pt-0.5">
              <span>{progressPercent}% Achieved</span>
              <span>Class of {account?.expectedSignOutYear || '2028'}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Withdrawable (Gift Amount)</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-300">
              ₦{giftWithdrawableBalance.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-400 font-bold">
              Gift or withdraw from gift balance
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Locked Savings Vault</span>
              <Lock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-300">
              ₦{currentBalance.toLocaleString()}
            </div>
            <div className="text-[10px] text-amber-200 font-medium">
              🔒 Locked till {withdrawalDate}
            </div>
          </div>
        </div>

        {/* Savings Rule & Withdrawal Policy Banner */}
        <div className="mt-4 p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 text-slate-200">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Savings Rules:</strong> Money is locked till your withdrawal date (<strong>{withdrawalDate}</strong>). Minimum savings is <strong>₦200</strong>. You can only withdraw from your <strong>gift amount (₦{giftWithdrawableBalance.toLocaleString()})</strong>. You cannot gift from your STS account or locked savings wallet.
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[10px] shrink-0 self-start sm:self-auto">
            Min Savings: ₦200
          </span>
        </div>
      </div>

      {/* ================= DEDICATED STUDENT STS WALLET NUMBER CARD (FOR GIFTS) ================= */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-black/20 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-xs flex items-center gap-1">
                <Gift className="w-3 h-3 text-amber-200" />
                Dedicated STS Gift Wallet
              </span>
              <span className="text-[11px] text-amber-100 font-semibold">
                0% Transfer Charge • Instant Inflow
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black tracking-tight">
              Receive Gifts with Your STS Wallet Number
            </h3>
            <p className="text-xs text-amber-100 leading-relaxed">
              Share this unique STS wallet number with classmates, parents, and alumni sponsors. Anyone can send you exam handout funds, sign-out celebrations, or food stipends directly into your savings!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/40 border border-white/20 backdrop-blur-md flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 shadow-inner">
            <div>
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block">
                Your STS Wallet Number
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono tracking-wider text-white">
                {stsWalletNumber}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopySTSWallet}
                className="px-3.5 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-black hover:bg-amber-50 transition shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {copiedSTS ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-700" />}
                <span>{copiedSTS ? 'Copied!' : 'Copy Wallet ID'}</span>
              </button>

              <button
                type="button"
                onClick={handleShareSTSWallet}
                className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition flex items-center justify-center cursor-pointer shrink-0"
                title="Share on WhatsApp"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by transaction reference, description, peer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          {/* Time Range Filter */}
          <div className="flex items-center gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white text-slate-700"
            >
              <option value="all">All Time</option>
              <option value="sep2026">September 2026</option>
              <option value="aug2026">August 2026</option>
            </select>

            <button
              onClick={() => setShowStatementModal(true)}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print Ledger</span>
            </button>
          </div>
        </div>

        {/* Transaction Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'all', label: `All Activity (${allTransactions.length})` },
            { id: 'deposits', label: 'Deposits & Inflow' },
            { id: 'interest', label: 'Gifts & Milestone Rewards' },
            { id: 'payouts', label: 'Withdrawals & Payouts' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterType(cat.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                filterType === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction History Table / Cards */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-sm font-black text-slate-900">
              Verified Wallet Transactions ({filteredTransactions.length})
            </h2>
            <p className="text-xs text-gray-600">
              Immutable student financial records with cryptographic reference IDs and running balances.
            </p>
          </div>

          <div className="text-xs font-bold text-slate-500">
            Current Balance: <strong className="text-slate-900">₦{currentBalance.toLocaleString()}</strong>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Wallet className="w-10 h-10 text-gray-300 mx-auto" />
            <div className="text-xs font-bold text-slate-800">
              No transactions found matching your criteria.
            </div>
            <button
              onClick={() => {
                setFilterType('all');
                setSearchQuery('');
                setTimeRange('all');
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTransactions.map((tx) => {
              const isDeposit = tx.type === 'deposit';
              const isGiftReceived = tx.type === 'gift_received';
              const isGiftSent = tx.type === 'gift_sent';
              const isInterest = tx.type === 'interest';
              const isPayout = tx.type === 'signout_payout';

              const isInflow = isDeposit || isGiftReceived || isInterest;
              const refNumber = `UNW-${tx.id.toUpperCase()}-${tx.amount}`;

              return (
                <div
                  key={tx.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        isDeposit
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : isGiftReceived
                          ? 'bg-purple-50 text-purple-600 border border-purple-200'
                          : isGiftSent
                          ? 'bg-rose-50 text-rose-600 border border-rose-200'
                          : isInterest
                          ? 'bg-amber-50 text-amber-600 border border-amber-200'
                          : 'bg-blue-50 text-blue-600 border border-blue-200'
                      }`}
                    >
                      {isDeposit && <ArrowDownLeft className="w-5 h-5" />}
                      {isGiftReceived && <Gift className="w-5 h-5" />}
                      {isGiftSent && <ArrowUpRight className="w-5 h-5" />}
                      {isInterest && <TrendingUp className="w-5 h-5" />}
                      {isPayout && <Building className="w-5 h-5" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xs font-black text-slate-900">
                          {tx.description}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            isInflow
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isInflow ? 'Inflow' : 'Outflow'}
                        </span>
                        {tx.description.includes('Pending Admin Confirmation') && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <Clock className="w-2.5 h-2.5 text-amber-600" />
                            <span>Pending Admin Verification</span>
                          </span>
                        )}
                        {(tx.description.includes('Approved by Admin') || tx.description.includes('Confirmed & Approved')) && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            <span>Admin Confirmed</span>
                          </span>
                        )}
                        {tx.description.includes('Rejected by Admin') && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300">
                            <AlertCircle className="w-2.5 h-2.5 text-rose-600" />
                            <span>Rejected by Admin</span>
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-600">
                        <span className="flex items-center gap-1 font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {refNumber}
                        </span>
                        <button
                          onClick={() => handleCopy(refNumber, tx.id)}
                          className="text-gray-600 hover:text-slate-800 transition"
                          title="Copy Reference"
                        >
                          {copiedRef === tx.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {tx.date}
                        </span>
                        {tx.recipientOrSender && (
                          <>
                            <span>•</span>
                            <span className="text-slate-700 font-semibold">
                              {tx.recipientOrSender}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-12 sm:pl-0">
                    <div className="text-left sm:text-right">
                      <div
                        className={`text-sm font-black ${
                          isInflow ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isInflow ? `+₦${(tx.amount || 0).toLocaleString()}` : `-₦${(tx.amount || 0).toLocaleString()}`}
                      </div>
                      {tx.balanceAfter !== undefined && (
                        <div className="text-[10px] text-gray-600 font-medium">
                          Bal After: ₦{(tx.balanceAfter || 0).toLocaleString()}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedTxForReceipt(tx)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      title="View Digital Receipt"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Receipt</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Deposit Funds Modal */}
      {showDepositModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDepositModal(false);
          }}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] my-auto animate-in fade-in zoom-in duration-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Header: Never scrolls off the screen */}
            <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-white shrink-0 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  id="btn-deposit-modal-back"
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-1.5 text-xs font-black transition cursor-pointer border border-slate-200 shadow-2xs"
                  title="Go back"
                >
                  <ArrowLeft className="w-4 h-4 text-[#FF6A00]" />
                  <span>Back</span>
                </button>
                <div className="w-7 h-7 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xs">
                  ₦
                </div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 truncate">
                  Save / Deposit to Wallet
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDepositModal(false)}
                id="btn-deposit-modal-close"
                className="p-1.5 rounded-xl text-gray-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1">
              {depositSuccessMsg ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p>{depositSuccessMsg}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">
                        Deposit Amount (₦)
                      </label>
                      <span className="text-[10px] font-extrabold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                        Min Savings: ₦200
                      </span>
                    </div>
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      min="200"
                      step="100"
                      required
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                    <div className="flex items-center gap-2 pt-1.5 flex-wrap">
                      {['200', '500', '1000', '2000', '5000'].map((amt) => (
                        <button
                          type="button"
                          key={amt}
                          onClick={() => setDepositAmount(amt)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-700 hover:bg-orange-100 hover:text-orange-700 transition cursor-pointer"
                        >
                          +₦{Number(amt).toLocaleString()}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-500 pt-1">
                      🔒 Money saved is locked till your scheduled withdrawal date ({withdrawalDate}).
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Deposit Description (Strictly for Sign Out Expenses Purposes) *
                    </label>
                    <select
                      value={depositDesc}
                      onChange={(e) => setDepositDesc(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none mb-1.5 font-bold text-[#0A1931]"
                    >
                      <option value="Final Year Project Binding & Printing">Final Year Project Binding &amp; Printing</option>
                      <option value="Departmental & Faculty Sign-Out Clearance">Departmental &amp; Faculty Sign-Out Clearance</option>
                      <option value="Convocation Gown & Academic Hood Rental">Convocation Gown &amp; Academic Hood Rental</option>
                      <option value="Sign-Out Week Celebration & Class Dinner">Sign-Out Week Celebration &amp; Class Dinner</option>
                      <option value="NYSC Relocation & Survival Stash">NYSC Relocation &amp; Survival Stash</option>
                      <option value="Professional Certification & Induction Dues">Professional Certification &amp; Induction Dues</option>
                    </select>
                    <p className="text-[11px] text-[#FF6A00] font-bold">
                      Notice: Deposit description is strictly for sign out expenses purposes.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Payment Channel
                      </label>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        No Paystack Option For Now
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'bank_transfer', label: 'Direct Bank (UBA Official)' },
                        { id: 'ussd', label: 'Instant USSD Transfer' }
                      ].map((m) => (
                        <button
                          type="button"
                          key={m.id}
                          onClick={() => setDepositMethod(m.id as any)}
                          className={`p-2 rounded-xl text-[11px] font-bold border transition ${
                            depositMethod === m.id
                              ? 'bg-orange-50 border-orange-500 text-orange-800'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10.5px] text-slate-500 mt-1.5 leading-tight">
                      STS program is available for Bayelsa State universities and Abia State University (ABSU). ₦500 to open STS account for first timers. Paystack card processing is temporarily inactive; all deposits process directly via official institutional bank vault.
                    </p>
                  </div>

                  {depositMethod === 'bank_transfer' ? (
                    <div className="space-y-3 pt-1">
                      <OfficialBankPaymentCard
                        amount={Number(depositAmount || 5000)}
                        purpose={depositDesc || 'Student Wallet Deposit'}
                        studentName={safeUser.name}
                        studentEmail={safeUser.email}
                        studentPhone={safeUser.phone}
                        university={safeUser.university}
                        showCardTitle={false}
                        paymentCategory="student_wallet"
                        onCancel={() => setShowDepositModal(false)}
                        cancelButtonLabel="Go Back / Return to Wallet"
                        onPaymentSubmitted={() => {
                          onDeposit(Number(depositAmount || 5000), depositDesc || 'Pocket money savings via UBA Bank Transfer');
                          setDepositSuccessMsg(`₦${Number(depositAmount || 5000).toLocaleString()} deposit confirmation automated to WhatsApp!`);
                          setTimeout(() => {
                            setDepositSuccessMsg(null);
                            setShowDepositModal(false);
                          }, 2500);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="space-y-3 pt-1">
                      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-2">
                        <div className="flex items-center gap-2 font-black text-amber-900">
                          <Phone className="w-4 h-4 text-amber-700" />
                          <span>USSD Instant Bank Deposit Code</span>
                        </div>
                        <p className="text-[11px] text-amber-800 leading-relaxed">
                          Dial <strong>*919*3*1027118833*{depositAmount || 5000}#</strong> on your registered bank mobile line to credit the UniNest STS Vault (United Bank for Africa).
                        </p>
                        <div className="text-[10px] font-bold text-slate-600">
                          Bayelsa and ABSU student verification is auto-matched via phone number.
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onDeposit(Number(depositAmount || 5000), `${depositDesc} (USSD Transfer)`);
                          setDepositSuccessMsg(`USSD transfer instructions sent! Verification queued.`);
                          setTimeout(() => {
                            setDepositSuccessMsg(null);
                            setShowDepositModal(false);
                          }, 2500);
                        }}
                        className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition shadow-md shadow-orange-950/20 cursor-pointer"
                      >
                        I Have Completed USSD Transfer
                      </button>
                    </div>
                  )}

                  {/* Always Visible Go Back / Cancel button */}
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowDepositModal(false)}
                      id="btn-deposit-modal-bottom-cancel"
                      className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
                    >
                      <ArrowLeft className="w-4 h-4 text-slate-500" />
                      <span>Go Back / Cancel Deposit</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Funds to Bank Modal */}
      {showWithdrawModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowWithdrawModal(false);
          }}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] my-auto animate-in fade-in zoom-in duration-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-white shrink-0 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  id="btn-withdraw-modal-back"
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-1.5 text-xs font-black transition cursor-pointer border border-slate-200 shadow-2xs"
                  title="Go back"
                >
                  <ArrowLeft className="w-4 h-4 text-emerald-600" />
                  <span>Back</span>
                </button>
                <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 truncate">
                    Sign-Out Cash Out
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowWithdrawModal(false)}
                id="btn-withdraw-modal-close"
                className="p-1.5 rounded-xl text-gray-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1">
              {withdrawSuccessMsg ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p>{withdrawSuccessMsg}</p>
                </div>
              ) : (
                <form onSubmit={handleWithdrawSubmit} className="space-y-3">
                  {/* Gift Account Payout Information */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">Gift Account Withdrawal</span>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                        Direct Bank Payout
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Withdraw your received gifts, peer tokens, and campus rewards directly into your verified Nigerian bank account.
                    </p>
                    <div className="text-[11px] font-bold text-slate-800 pt-1 border-t border-slate-200 flex items-center justify-between">
                      <span>Available Withdrawable Gift Balance:</span>
                      <span className="text-sm font-black text-[#FF6A00]">₦{giftWithdrawableBalance.toLocaleString()}</span>
                    </div>
                  </div>

                  {withdrawError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{withdrawError}</span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">
                        Withdrawal Amount (₦) *
                      </label>
                      <button
                        type="button"
                        onClick={() => setWithdrawAmount(String(giftWithdrawableBalance))}
                        className="text-[10px] font-black text-emerald-700 hover:underline cursor-pointer"
                      >
                        Max Gift Amount: ₦{giftWithdrawableBalance.toLocaleString()}
                      </button>
                    </div>
                    <input
                      type="number"
                      min="500"
                      max={giftWithdrawableBalance}
                      step="500"
                      required
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="e.g. 5000"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Bank Name *
                      </label>
                      <select
                        value={withdrawBank}
                        onChange={(e) => setWithdrawBank(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="Access Bank">Access Bank</option>
                        <option value="GTBank (Guaranty Trust)">GTBank</option>
                        <option value="Zenith Bank">Zenith Bank</option>
                        <option value="OPay">OPay</option>
                        <option value="Palmpay">Palmpay</option>
                        <option value="Kuda Bank">Kuda Bank</option>
                        <option value="United Bank for Africa (UBA)">UBA</option>
                        <option value="First Bank of Nigeria">First Bank</option>
                        <option value="Fidelity Bank">Fidelity Bank</option>
                        <option value="Stanbic IBTC">Stanbic IBTC</option>
                        <option value="FCMB">FCMB</option>
                        <option value="Moniepoint">Moniepoint</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        NUBAN Account No. *
                      </label>
                      <input
                        type="text"
                        maxLength={10}
                        required
                        placeholder="10-digit number"
                        value={withdrawAccNumber}
                        onChange={(e) => setWithdrawAccNumber(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Account Beneficiary Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tariere Ebimobowei"
                      value={withdrawAccName}
                      onChange={(e) => setWithdrawAccName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Withdrawal Purpose (Strictly for Sign Out Cash Out) *
                    </label>
                    <select
                      value={withdrawReason}
                      onChange={(e) => setWithdrawReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold text-[#0A1931]"
                    >
                      <option value="Sign Out Cash Out - Departmental & Faculty Clearance">Sign Out Cash Out - Departmental &amp; Faculty Clearance</option>
                      <option value="Sign Out Cash Out - Convocation Payout">Sign Out Cash Out - Convocation Payout</option>
                      <option value="Sign Out Cash Out - Final Year Project Sign-Off">Sign Out Cash Out - Final Year Project Sign-Off</option>
                      <option value="Sign Out Cash Out - Class Sign-Out Celebration">Sign Out Cash Out - Class Sign-Out Celebration</option>
                    </select>
                    <p className="text-[11px] text-[#FF6A00] font-black mt-1">
                      Withdrawal is for sign out cash out.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Withdrawal request details are verified and automated to the finance desk WhatsApp (+234 903 984 7154).</span>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowWithdrawModal(false)}
                      className="w-1/3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Return</span>
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      <span>Confirm &amp; Withdraw ₦{Number(withdrawAmount || 0).toLocaleString()}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Digital Receipt Modal */}
      {selectedTxForReceipt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedTxForReceipt(null);
          }}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] my-auto animate-in fade-in zoom-in duration-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-white shrink-0 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTxForReceipt(null)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-1 text-xs font-black transition cursor-pointer border border-slate-200 shadow-2xs"
                  title="Go back"
                >
                  <ArrowLeft className="w-4 h-4 text-emerald-600" />
                  <span>Back</span>
                </button>
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <h3 className="text-sm font-black text-slate-900">
                  Digital Receipt
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTxForReceipt(null)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>SUCCESSFUL • VERIFIED</span>
                </div>
                <div className="text-3xl font-black text-slate-900">
                  ₦{(selectedTxForReceipt.amount || 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-600 font-semibold">
                  {selectedTxForReceipt.description}
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-gray-600">Reference:</span>
                  <span className="font-mono font-bold text-slate-900">
                    UNW-{selectedTxForReceipt.id.toUpperCase()}-{selectedTxForReceipt.amount}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-gray-600">Date &amp; Time:</span>
                  <span className="font-bold">{selectedTxForReceipt.date}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-gray-600">Student Account:</span>
                  <span className="font-bold">{safeUser.name || safeUser.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-gray-600">Institution:</span>
                  <span className="font-bold">{safeUser.university}</span>
                </div>
                {selectedTxForReceipt.balanceAfter !== undefined && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-gray-600">Running Balance After:</span>
                    <span className="font-bold text-emerald-700">
                      ₦{(selectedTxForReceipt.balanceAfter || 0).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handlePrintStatement}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTxForReceipt(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Wallet</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Statement of Account Modal */}
      {showStatementModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowStatementModal(false);
          }}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] my-auto animate-in fade-in duration-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-4 sm:p-5 bg-white shrink-0 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowStatementModal(false)}
                  id="btn-statement-modal-back"
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-1.5 text-xs font-black transition cursor-pointer border border-slate-200 shadow-2xs"
                  title="Go back"
                >
                  <ArrowLeft className="w-4 h-4 text-orange-600" />
                  <span>Back</span>
                </button>
                <Wallet className="w-5 h-5 text-orange-500 shrink-0" />
                <div>
                  <div className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                    UniNest Official Statement of Student Account
                  </div>
                  <div className="text-[10px] text-gray-500 hidden sm:block">
                    Student Finance &amp; STS Clearance Verification Ledger
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowStatementModal(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-4 sm:p-6 space-y-5 flex-1">
              <div>
                <span className="text-gray-600 block">Account Name:</span>
                <strong className="text-slate-900">{safeUser.name || 'Student Account'}</strong>
              </div>
              <div>
                <span className="text-gray-600 block">Institution:</span>
                <strong className="text-slate-900">{safeUser.university}</strong>
              </div>
              <div>
                <span className="text-gray-600 block">Current Balance:</span>
                <strong className="text-emerald-700 font-black">
                  ₦{currentBalance.toLocaleString()}
                </strong>
              </div>
              <div>
                <span className="text-gray-600 block">Statement Date:</span>
                <strong className="text-slate-900">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                </strong>
              </div>
            </div>

            {/* Statement Ledger Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Reference</th>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-right">Amount (₦)</th>
                    <th className="p-3 text-right">Balance (₦)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {allTransactions.map((tx) => {
                    const isInflow =
                      tx.type === 'deposit' || tx.type === 'gift_received' || tx.type === 'interest';
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50">
                        <td className="p-3 whitespace-nowrap text-slate-500">{tx.date}</td>
                        <td className="p-3 font-mono text-[10px] text-slate-500">
                          UNW-{tx.id.toUpperCase()}
                        </td>
                        <td className="p-3 font-medium">{tx.description}</td>
                        <td
                          className={`p-3 text-right font-bold ${
                            isInflow ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {isInflow ? `+${(tx.amount || 0).toLocaleString()}` : `-${(tx.amount || 0).toLocaleString()}`}
                        </td>
                        <td className="p-3 text-right font-extrabold text-slate-900">
                          {tx.balanceAfter !== undefined
                            ? `₦${(tx.balanceAfter || 0).toLocaleString()}`
                            : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Statement Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Digitally signed and cryptographically verified by UniNest Escrow Systems Nigeria.</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintStatement}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Official Statement</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
