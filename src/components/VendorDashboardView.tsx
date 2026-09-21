import React, { useState } from 'react';
import {
  Store,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Clock,
  Wallet,
  ArrowUpRight,
  ShoppingBag,
  ExternalLink,
  Check,
  MapPin,
  Phone,
  User,
  AlertCircle,
  Sparkles,
  Download,
  X,
  PackageCheck,
  Building,
  ArrowLeft
} from 'lucide-react';
import { UniNestUser, EscrowTransaction } from '../types';
import { UNINEST_OFFICIAL_BANK } from '../utils/paymentConfig';

interface VendorDashboardViewProps {
  user: UniNestUser;
  pendingOrders: EscrowTransaction[];
  onConfirmOrderHandover: (orderId: string) => void;
  giftWalletBalance?: number;
  onWithdrawGiftBalance?: (amount: number, bank: string, accountNum: string, accountName: string) => void;
}

const NIGERIAN_BANKS = [
  'United Bank for Africa (UBA)',
  'Access Bank',
  'Guaranty Trust Bank (GTBank)',
  'Zenith Bank',
  'First Bank of Nigeria',
  'OPay Digital Services',
  'Kuda Microfinance Bank',
  'Stanbic IBTC Bank',
  'Fidelity Bank'
];

export const VendorDashboardView: React.FC<VendorDashboardViewProps> = ({
  user,
  pendingOrders,
  onConfirmOrderHandover,
  giftWalletBalance = 48500,
  onWithdrawGiftBalance
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'performance' | 'wallet'>('orders');
  const [currentGiftBalance, setCurrentGiftBalance] = useState(giftWalletBalance);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('15000');
  const [withdrawBank, setWithdrawBank] = useState(NIGERIAN_BANKS[0]);
  const [withdrawAccountNum, setWithdrawAccountNum] = useState(user.phone || '1027118833');
  const [withdrawAccountName, setWithdrawAccountName] = useState(user.name || 'Verified Campus Vendor');
  const [withdrawalSuccess, setWithdrawalSuccess] = useState<string | null>(null);
  const [confirmedOrderSuccess, setConfirmedOrderSuccess] = useState<string | null>(null);

  // Local pending orders that can be interacted with
  const [orders, setOrders] = useState<EscrowTransaction[]>(() => {
    if (pendingOrders && pendingOrders.length > 0) return pendingOrders;
    return [
      {
        id: 'ESC-NDU-9082',
        itemTitle: 'HP Pavilion 15 Laptop (Intel i5, 16GB RAM, 512GB SSD)',
        amount: 145000,
        escrowFee: 7250,
        totalAmount: 152250,
        campus: 'Niger Delta University (NDU)',
        buyerEmail: 'tonye.student@ndu.edu.ng',
        buyerPhone: '08134455667',
        sellerEmail: user.email,
        sellerPhone: user.phone || '09034648644',
        status: 'Pending',
        createdAt: new Date().toISOString().split('T')[0],
        escrowAccountNumber: '1027118833 (UBA Official Escrow Vault)'
      },
      {
        id: 'ESC-FUO-7719',
        itemTitle: 'Standing Reversible Campus Fan (Ox 18-inch Rechargeable)',
        amount: 22000,
        escrowFee: 1100,
        totalAmount: 23100,
        campus: 'Federal University Otuoke (FUOTUOKE)',
        buyerEmail: 'ebi.preye@fuotuoke.edu.ng',
        buyerPhone: '08099887766',
        sellerEmail: user.email,
        sellerPhone: user.phone || '09034648644',
        status: 'Pending',
        createdAt: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        escrowAccountNumber: '1027118833 (UBA Official Escrow Vault)'
      }
    ];
  });

  const totalSalesVolume = 187500;
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending' || o.status?.includes('Pending')).length;
  const pendingFundsInVault = orders
    .filter(o => o.status === 'Pending' || o.status?.includes('Pending'))
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const handleConfirmHandover = (orderId: string) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: 'Payment Released to Seller' } : o))
    );
    onConfirmOrderHandover(orderId);
    setConfirmedOrderSuccess(`Order ${orderId} marked as handed over! Escrow funds cleared to your Gift Wallet balance.`);
    setCurrentGiftBalance(prev => prev + 22000);
    setTimeout(() => setConfirmedOrderSuccess(null), 7000);
  };

  const handleProcessWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(withdrawAmount);
    if (amountNum <= 0) return;
    if (amountNum > currentGiftBalance) {
      alert('Withdrawal amount cannot exceed your available Gift Wallet balance.');
      return;
    }

    setCurrentGiftBalance(prev => prev - amountNum);
    if (onWithdrawGiftBalance) {
      onWithdrawGiftBalance(amountNum, withdrawBank, withdrawAccountNum, withdrawAccountName);
    }

    setWithdrawalSuccess(
      `Withdrawal of ₦${amountNum.toLocaleString()} to ${withdrawBank} (${withdrawAccountNum}) submitted! Cleared via UniNest Sign-Out & Vendor Vault.`
    );
    setShowWithdrawModal(false);
    setTimeout(() => setWithdrawalSuccess(null), 8000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Verified Vendor Ticker & Credentials Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0A1931] text-white shadow-xl relative overflow-hidden border-2 border-[#0A1931]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF6A00]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            {/* Official Ticker Badge */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6A00] text-white text-[11px] font-black uppercase tracking-wider shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                Verified Vendor Ticker
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-bold border border-white/20">
                Ticker ID: VND-BAYELSA-{user.id ? user.id.slice(0, 6).toUpperCase() : '8892'}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                Head of Marketplace Audited ✔
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FF6A00] text-white flex items-center justify-center font-black text-xl shadow-md">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>{user.businessName || `${user.name || 'Campus'} Official Vendor Hub`}</span>
                  <CheckCircle2 className="w-5 h-5 text-[#FF6A00] shrink-0" />
                </h1>
                <p className="text-xs sm:text-sm text-white/80">
                  {user.vendorCategory || 'Campus Electronics, Gadgets, Books & Student Provisions'} • {user.university || 'Niger Delta University'}
                </p>
              </div>
            </div>

            <p className="text-xs text-white/85 leading-relaxed bg-white/5 p-3 rounded-2xl border border-white/10">
              🛡️ <strong>Official Escrow Policy:</strong> Payments from buyers are deposited into the UniNest Vault (<strong>{UNINEST_OFFICIAL_BANK.accountNumber} - {UNINEST_OFFICIAL_BANK.bankName}</strong>) and released to your Gift Wallet after buyer inspection confirmation or within <strong>three working days</strong>.
            </p>
          </div>

          {/* Quick Wallet Card */}
          <div className="p-5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md space-y-3 min-w-[240px] shrink-0">
            <div className="flex items-center justify-between text-xs text-white/70 font-semibold">
              <span>Gift Wallet Balance</span>
              <Wallet className="w-4 h-4 text-[#FF6A00]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              ₦{currentGiftBalance.toLocaleString()}
            </div>
            <p className="text-[10px] text-emerald-300 font-medium">
              ● Ready for Instant Bank Withdrawal
            </p>
            <button
              onClick={() => setShowWithdrawModal(true)}
              id="btn-vendor-withdraw-gift-wallet"
              className="w-full py-2.5 px-4 rounded-xl bg-[#FF6A00] hover:bg-[#E55E00] text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Withdraw to Bank</span>
            </button>
          </div>
        </div>

        {/* Sub Navigation Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#FF6A00] text-white shadow-sm'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Pending Orders ({pendingOrdersCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('performance')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'performance'
                ? 'bg-[#FF6A00] text-white shadow-sm'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Sales Performance</span>
          </button>

          <button
            onClick={() => setActiveTab('wallet')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'wallet'
                ? 'bg-[#FF6A00] text-white shadow-sm'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Gift Wallet &amp; Payouts</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {confirmedOrderSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{confirmedOrderSuccess}</span>
        </div>
      )}

      {withdrawalSuccess && (
        <div className="p-4 rounded-2xl bg-[#0A1931] text-white text-xs font-bold flex items-center gap-2 shadow-sm border border-[#FF6A00]">
          <CheckCircle2 className="w-4 h-4 text-[#FF6A00] shrink-0" />
          <span>{withdrawalSuccess}</span>
        </div>
      )}

      {/* ================= VIEW 1: PENDING MARKETPLACE ORDERS ================= */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border-2 border-[#0A1931]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4 text-amber-700" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#0A1931]">
                  Pending Buyer Orders Held in Escrow Vault
                </h3>
                <p className="text-[11px] text-[#0A1931]/70">
                  Buyers have deposited payment into official escrow vault ({UNINEST_OFFICIAL_BANK.accountNumber}). Deliver the items to clear the funds.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-xs self-start sm:self-auto">
              {pendingOrdersCount} Awaiting Delivery Handover
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {orders.map((order) => {
              const isPending = order.status === 'Pending' || order.status?.includes('Pending');
              return (
                <div
                  key={order.id}
                  className={`p-5 rounded-3xl border-2 transition shadow-xs ${
                    isPending
                      ? 'bg-white border-amber-300'
                      : 'bg-emerald-50/50 border-emerald-200'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-black text-[#0A1931] bg-slate-100 px-2.5 py-1 rounded-lg">
                          {order.id}
                        </span>
                        <span
                          className={`text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                            isPending
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{order.status}</span>
                        </span>
                        <span className="text-[11px] text-[#0A1931]/60">
                          Ordered: {order.createdAt}
                        </span>
                      </div>

                      <h4 className="text-base font-black text-[#0A1931]">
                        {order.itemTitle}
                      </h4>

                      {/* Buyer Details Grid */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-[#0A1931]/80 pt-1">
                        <span className="flex items-center gap-1 font-semibold">
                          <User className="w-3.5 h-3.5 text-[#FF6A00]" />
                          Buyer: {order.buyerEmail}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          {order.buyerPhone || '08134455667'}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-blue-600" />
                          Campus: {order.campus}
                        </span>
                      </div>
                    </div>

                    {/* Price & Action Area */}
                    <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                      <div className="text-left md:text-right">
                        <div className="text-xs text-slate-500 font-bold">Escrow Vault Held</div>
                        <div className="text-xl font-black text-[#0A1931]">
                          ₦{(order.amount || 0).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-emerald-700 font-bold">
                          +5% Escrow Protection Cleared
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        {isPending ? (
                          <>
                            <a
                              href={`https://wa.me/${order.buyerPhone ? `234${order.buyerPhone.replace(/^0/, '')}` : '2349039847154'}?text=${encodeURIComponent(
                                `Hello, this is verified vendor ${user.name || user.businessName} regarding your UniNest order (${order.itemTitle}, ${order.id}). When are you available for pickup/handover?`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1.5"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>WhatsApp Buyer</span>
                            </a>

                            <button
                              onClick={() => handleConfirmHandover(order.id)}
                              id={`btn-confirm-handover-${order.id}`}
                              className="px-4 py-2 rounded-xl bg-[#0A1931] hover:bg-[#152847] text-white font-black text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                            >
                              <PackageCheck className="w-3.5 h-3.5 text-[#FF6A00]" />
                              <span>Confirm Handover</span>
                            </button>
                          </>
                        ) : (
                          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-black flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5" />
                            <span>Payment Released to Gift Wallet</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= VIEW 2: SALES PERFORMANCE ================= */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white border-2 border-[#0A1931]/10 shadow-xs space-y-1">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Total Sales Volume</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-[#0A1931]">
                ₦{(totalSalesVolume || 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-emerald-700 font-semibold">
                ↑ 22.5% increase this semester
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white border-2 border-[#0A1931]/10 shadow-xs space-y-1">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Pending Escrow Funds</span>
                <ShieldCheck className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-600">
                ₦{(pendingFundsInVault || 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-amber-800 font-semibold">
                Held safely in UBA Escrow Vault #1027118833
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white border-2 border-[#0A1931]/10 shadow-xs space-y-1">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Orders Handed Over</span>
                <PackageCheck className="w-4 h-4 text-[#FF6A00]" />
              </div>
              <div className="text-2xl font-black text-[#0A1931]">
                18 Completed
              </div>
              <p className="text-[11px] text-slate-500">
                Zero return or escrow chargeback disputes
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white border-2 border-[#0A1931]/10 shadow-xs space-y-1">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Vendor Trust Score</span>
                <Sparkles className="w-4 h-4 text-[#FF6A00]" />
              </div>
              <div className="text-2xl font-black text-[#FF6A00]">
                99.4%
              </div>
              <p className="text-[11px] text-slate-600 font-bold">
                Audited by Head of Marketplace
              </p>
            </div>
          </div>

          {/* Performance Chart / Breakdown */}
          <div className="p-6 rounded-3xl bg-white border-2 border-[#0A1931]/10 shadow-xs space-y-4">
            <h3 className="text-base font-black text-[#0A1931]">
              Weekly Sales &amp; Clearance Velocity
            </h3>
            <div className="space-y-3">
              {[
                { week: 'Week 1 (Laptops & Electronics)', amount: 65000, percentage: 80 },
                { week: 'Week 2 (Rechargeable Fans & Appliances)', amount: 42000, percentage: 65 },
                { week: 'Week 3 (Campus Provisions & Books)', amount: 38500, percentage: 55 },
                { week: 'Week 4 (Hostel Furniture & Fittings)', amount: 42000, percentage: 70 }
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[#0A1931]">{item.week}</span>
                    <span className="text-[#FF6A00]">₦{(item.amount || 0).toLocaleString()}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#0A1931] to-[#FF6A00] rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= VIEW 3: GIFT WALLET & PAYOUTS ================= */}
      {activeTab === 'wallet' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0A1931] to-[#152847] text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#FF6A00] flex items-center gap-1.5">
                <Wallet className="w-4 h-4" />
                <span>Vendor Gift &amp; Escrow Revenue Balance</span>
              </span>
              <div className="text-3xl sm:text-4xl font-black text-white">
                ₦{currentGiftBalance.toLocaleString()}
              </div>
              <p className="text-xs text-white/80 max-w-lg">
                Revenue from completed marketplace escrow releases and campus gifting donations. Funds can be withdrawn immediately to any registered Nigerian bank.
              </p>
            </div>

            <button
              onClick={() => setShowWithdrawModal(true)}
              id="btn-vendor-withdraw-wallet-tab"
              className="px-6 py-3.5 rounded-2xl bg-[#FF6A00] hover:bg-[#E55E00] text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-lg cursor-pointer self-start md:self-auto"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Withdraw to Bank Account</span>
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-white border-2 border-[#0A1931]/10 shadow-xs space-y-4">
            <h4 className="text-sm font-black text-[#0A1931]">
              Recent Payouts &amp; Escrow Disbursements
            </h4>
            <div className="divide-y divide-slate-100 text-xs">
              {[
                {
                  id: 'PAY-8812',
                  date: 'Today, 11:20 AM',
                  desc: 'Escrow Release: HP Pavilion Laptop',
                  amount: 145000,
                  type: 'inflow',
                  bank: 'UniNest Escrow Vault'
                },
                {
                  id: 'PAY-8790',
                  date: 'Yesterday, 04:15 PM',
                  desc: 'Student Gifting Donation (Sign-Out Support)',
                  amount: 15000,
                  type: 'inflow',
                  bank: 'Direct STS Gift Account'
                },
                {
                  id: 'PAY-8651',
                  date: '3 days ago',
                  desc: 'Bank Withdrawal to UBA (1027118833)',
                  amount: 40000,
                  type: 'outflow',
                  bank: 'United Bank for Africa (UBA)'
                }
              ].map((tx) => (
                <div key={tx.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#0A1931]">{tx.desc}</div>
                    <div className="text-[11px] text-slate-500">
                      {tx.date} • {tx.bank}
                    </div>
                  </div>
                  <div
                    className={`font-black text-sm ${
                      tx.type === 'inflow' ? 'text-emerald-700' : 'text-slate-800'
                    }`}
                  >
                    {tx.type === 'inflow' ? '+' : '-'}₦{(tx.amount || 0).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= WITHDRAWAL MODAL ================= */}
      {showWithdrawModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowWithdrawModal(false);
          }}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full border-2 border-[#0A1931]/20 shadow-2xl flex flex-col max-h-[90vh] my-auto animate-in zoom-in-95 duration-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Header with Back Button */}
            <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-white shrink-0 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  id="btn-vendor-withdraw-back"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition cursor-pointer border border-slate-200 shadow-2xs"
                >
                  <ArrowLeft className="w-4 h-4 text-[#FF6A00]" />
                  <span>Back</span>
                </button>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-[#0A1931]">
                    Withdraw Gift &amp; Revenue
                  </h3>
                  <p className="text-[10px] text-slate-500 font-semibold">
                    Available: ₦{(currentGiftBalance || 0).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowWithdrawModal(false)}
                id="btn-vendor-withdraw-close"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1">
              <form onSubmit={handleProcessWithdrawal} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Amount to Withdraw (₦)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    max={currentGiftBalance}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-black text-[#0A1931] focus:outline-none focus:border-[#FF6A00]"
                    placeholder="e.g. 15000"
                    required
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                    <span>Minimum: ₦1,000</span>
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount(String(currentGiftBalance || 0))}
                      className="text-[#FF6A00] font-bold hover:underline cursor-pointer"
                    >
                      Withdraw All (₦{(currentGiftBalance || 0).toLocaleString()})
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Destination Bank
                  </label>
                  <select
                    value={withdrawBank}
                    onChange={(e) => setWithdrawBank(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-[#0A1931] focus:outline-none focus:border-[#FF6A00]"
                  >
                    {NIGERIAN_BANKS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={withdrawAccountNum}
                    onChange={(e) => setWithdrawAccountNum(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-[#0A1931] focus:outline-none focus:border-[#FF6A00]"
                    placeholder="10-digit NUBAN"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Verified Account Name
                  </label>
                  <input
                    type="text"
                    value={withdrawAccountName}
                    onChange={(e) => setWithdrawAccountName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-[#0A1931] focus:outline-none focus:border-[#FF6A00]"
                    placeholder="Account holder name"
                    required
                  />
                </div>

                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1 text-amber-800">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Sign-Out &amp; Vendor Cashout Verification:</span>
                  </div>
                  <p>
                    Withdrawal requests are disbursed directly to your account. No Paystack fees charged; settlement runs through UniNest Verified Disbursement Vault.
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowWithdrawModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Return / Cancel</span>
                  </button>
                  <button
                    type="submit"
                    id="btn-submit-vendor-withdrawal"
                    className="px-5 py-2.5 rounded-xl bg-[#0A1931] hover:bg-[#152847] text-white font-black text-xs transition shadow-md shadow-[#0A1931]/30 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-[#FF6A00]" />
                    <span>Confirm &amp; Withdraw ₦{Number(withdrawAmount || 0).toLocaleString()}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
