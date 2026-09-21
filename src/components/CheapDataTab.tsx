import React, { useState } from 'react';
import { 
  Wifi, 
  Zap, 
  Smartphone, 
  CheckCircle2, 
  Phone, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  ArrowRight,
  TrendingDown,
  X
} from 'lucide-react';
import { DataPlan, DataOrder, UniNestUser } from '../types';
import { DATA_PLANS } from '../data/uninestData';
import { OfficialBankPaymentCard } from './OfficialBankPaymentCard';

interface CheapDataTabProps {
  user: UniNestUser;
  orders: DataOrder[];
  onBuyData: (network: DataPlan['network'], plan: DataPlan, phone: string) => void;
}

export const CheapDataTab: React.FC<CheapDataTabProps> = ({
  user,
  orders,
  onBuyData,
}) => {
  const [selectedNetwork, setSelectedNetwork] = useState<DataPlan['network']>('MTN');
  const [selectedPlanId, setSelectedPlanId] = useState<string>(DATA_PLANS[0].id);
  const [phone, setPhone] = useState(user.phone || '');
  const [successReceipt, setSuccessReceipt] = useState<DataOrder | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const currentNetworkPlans = DATA_PLANS.filter(p => p.network === selectedNetwork);
  const activePlan = DATA_PLANS.find(p => p.id === selectedPlanId) || currentNetworkPlans[0];

  const handleNetworkChange = (net: DataPlan['network']) => {
    setSelectedNetwork(net);
    const firstPlan = DATA_PLANS.find(p => p.network === net);
    if (firstPlan) setSelectedPlanId(firstPlan.id);
  };

  const handlePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setShowPaymentModal(true);
  };

  const userOrders = orders.filter(o => o.userEmail.toLowerCase() === user.email.toLowerCase());

  return (
    <div className="space-y-6">
      {/* Instant Delivery Alert */}
      {successReceipt && (
        <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-xs flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </span>
            <div>
              <h4 className="font-extrabold text-sm">Data Top-Up Successful!</h4>
              <p className="text-xs text-emerald-700">
                <strong>{successReceipt.dataPlan}</strong> delivered instantly to <strong>{successReceipt.phone}</strong> [{successReceipt.network}].
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-200 text-emerald-800 text-xs font-bold shrink-0">
            Delivered ⚡
          </span>
        </div>
      )}

      {/* Hero Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold">
              <Wifi className="w-3.5 h-3.5" />
              <span>UniNest Cheap Data Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Instant Cheap Data for Nigerian Students
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Never miss an online class, assignment upload, or research webinar due to expensive data. Get heavily discounted <strong>MTN, Airtel, Glo, and 9mobile</strong> data bundles with 24/7 instant VTU delivery.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-2xl bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-bold flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-orange-400" />
              <span>Up to 40% Off Standard Rates</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Purchase Form on Left, History & Bundles on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Purchase Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-500" />
              <span>Buy Student Data Bundle</span>
            </h3>

            {/* 1. Network Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                1. Select Network
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['MTN', 'AIRTEL', 'GLO', '9MOBILE'] as const).map((net) => (
                  <button
                    key={net}
                    type="button"
                    onClick={() => handleNetworkChange(net)}
                    className={`py-3 px-2 rounded-2xl font-extrabold text-xs transition border flex flex-col items-center gap-1 ${
                      selectedNetwork === net
                        ? net === 'MTN'
                          ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-sm'
                          : net === 'AIRTEL'
                          ? 'bg-red-600 text-white border-red-700 shadow-sm'
                          : net === 'GLO'
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                          : 'bg-emerald-950 text-emerald-300 border-emerald-800 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{net}</span>
                    <span className="text-[10px] font-normal opacity-90">Instant</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Data Plans Grid */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                2. Choose Data Plan ({selectedNetwork})
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {currentNetworkPlans.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`p-3 rounded-2xl text-left transition border ${
                      selectedPlanId === plan.id
                        ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-md ring-2 ring-orange-500/50'
                        : 'bg-slate-50 text-slate-900 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-black text-sm">{plan.size}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        selectedPlanId === plan.id ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {plan.validity}
                      </span>
                    </div>
                    <div className="mt-1 font-extrabold text-xs text-orange-400">
                      ₦{(plan.price || 0).toLocaleString()}
                    </div>
                    <span className="text-[9px] opacity-75">{plan.type} Bundle</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Phone Number & Checkout */}
            <form onSubmit={handlePurchase} className="space-y-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  3. Recipient Phone Number
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 08123456789"
                    className="w-full h-12 pl-10 pr-3 rounded-2xl bg-slate-50 border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Summary Pill */}
              <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-200 text-xs text-orange-950 flex items-center justify-between">
                <div>
                  <span>Total Due:</span>
                  <strong className="text-sm font-black text-slate-900 ml-1.5">
                    ₦{(activePlan.price || 0).toLocaleString()}
                  </strong>
                  <span className="text-[11px] text-gray-500 ml-1">({selectedNetwork} {activePlan.size})</span>
                </div>
                <span className="text-[11px] text-emerald-700 font-bold">24/7 Instant Topup</span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-sm shadow-lg transition flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>Pay ₦{(activePlan.price || 0).toLocaleString()} &amp; Send Data Now</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Pricing Comparison & Order History (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recent Top-up History */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <span>Recent Data Purchases ({userOrders.length})</span>
            </h3>

            {userOrders.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">
                No past data orders yet. Top up today for cheap internet!
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {userOrders.map((ord) => (
                  <div key={ord.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">
                        ⚡
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-900 text-xs">{ord.dataPlan}</h5>
                        <p className="text-[10px] text-gray-400">{ord.phone} • {ord.transactionDate}</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-600">
                      ₦{(ord.amount || 0).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick FAQ Card */}
          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 text-xs space-y-3">
            <div className="font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>UniNest Student Data Guarantee</span>
            </div>
            <p className="text-gray-600 leading-relaxed">
              All data bundles are 100% genuine SME and Corporate gifting lines directly from telecom operators. Bundles are valid for a full 30 days and work on all 3G, 4G, and 5G smartphones, modems, and routers.
            </p>
          </div>
        </div>
      </div>

      {/* Cheap Data Payment Modal with Proof of Payment */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5 text-orange-600">
                <div className="w-9 h-9 rounded-2xl bg-orange-50 dark:bg-orange-950/50 flex items-center justify-center">
                  <Wifi className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Cheap Student Data Top-Up</h3>
                  <p className="text-[11px] text-slate-500">{selectedNetwork} {activePlan.size} • ₦{(activePlan.price || 0).toLocaleString()}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order summary */}
            <div className="p-3.5 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 text-xs text-orange-950 dark:text-orange-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-orange-700 dark:text-orange-300 block">Recipient Phone</span>
                <span className="font-black text-sm">{phone}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-orange-700 dark:text-orange-300 block">Bundle &amp; Validity</span>
                <span className="font-black text-sm">{activePlan.size} ({activePlan.validity})</span>
              </div>
            </div>

            {/* Payment card with sender details and proof upload */}
            <OfficialBankPaymentCard
              amount={activePlan.price}
              purpose={`Cheap Data: ${selectedNetwork} ${activePlan.size} (${phone})`}
              studentName={user.name}
              studentEmail={user.email}
              studentPhone={phone || user.phone}
              university={user.university}
              paymentCategory="cheap_data"
              onCancel={() => setShowPaymentModal(false)}
              cancelButtonLabel="Decide Not to Pay / Go Back"
              onPaymentSubmitted={() => {
                setShowPaymentModal(false);
                onBuyData(selectedNetwork, activePlan, phone);
                setSuccessReceipt({
                  id: 'data-' + Date.now(),
                  userEmail: user.email,
                  network: selectedNetwork,
                  dataPlan: activePlan.size,
                  amount: activePlan.price,
                  phone,
                  transactionDate: 'Just now',
                  status: 'delivered'
                });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
