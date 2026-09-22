import React, { useState } from 'react';
import { 
  Building, 
  CreditCard, 
  ShieldCheck, 
  Check, 
  RefreshCw, 
  Copy, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Save, 
  RotateCcw,
  Zap,
  Info,
  PhoneCall,
  Eye
} from 'lucide-react';
import { 
  OfficialPaymentConfig, 
  PaymentProcessingMode, 
  useOfficialPaymentConfig, 
  updateOfficialPaymentConfig, 
  resetOfficialPaymentConfig,
  DEFAULT_PAYMENT_CONFIG 
} from '../utils/paymentConfig';

const POPULAR_NIGERIAN_BANKS = [
  { name: 'United Bank for Africa (UBA)', short: 'UBA' },
  { name: 'Guaranty Trust Bank (GTBank)', short: 'GTBank' },
  { name: 'Access Bank', short: 'Access' },
  { name: 'First Bank of Nigeria', short: 'FirstBank' },
  { name: 'Zenith Bank', short: 'Zenith' },
  { name: 'Moniepoint MFB', short: 'Moniepoint' },
  { name: 'OPay Digital Services', short: 'OPay' },
  { name: 'PalmPay Limited', short: 'PalmPay' },
  { name: 'Kuda Microfinance Bank', short: 'Kuda' },
  { name: 'Fidelity Bank', short: 'Fidelity' },
  { name: 'Stanbic IBTC Bank', short: 'Stanbic' },
  { name: 'Wema Bank / ALAT', short: 'ALAT' },
  { name: 'Sterling Bank', short: 'Sterling' },
  { name: 'Union Bank of Nigeria', short: 'Union' },
  { name: 'Ecobank Nigeria', short: 'Ecobank' }
];

interface AdminPaymentSettingsModuleProps {
  adminEmail: string;
  onAddLog: (action: string, details?: string) => void;
}

export const AdminPaymentSettingsModule: React.FC<AdminPaymentSettingsModuleProps> = ({
  adminEmail,
  onAddLog
}) => {
  const currentConfig = useOfficialPaymentConfig();

  // Form State initialized with current live config
  const [paymentMode, setPaymentMode] = useState<PaymentProcessingMode>(currentConfig.paymentMode);
  const [bankName, setBankName] = useState(currentConfig.bankName);
  const [bankShort, setBankShort] = useState(currentConfig.bankShort);
  const [accountNumber, setAccountNumber] = useState(currentConfig.accountNumber);
  const [accountName, setAccountName] = useState(currentConfig.accountName);
  const [accountType, setAccountType] = useState(currentConfig.accountType);
  const [escrowPolicy, setEscrowPolicy] = useState(currentConfig.escrowPolicy);
  const [supportWhatsApp, setSupportWhatsApp] = useState(currentConfig.supportWhatsApp);
  
  // Paystack Settings
  const [paystackPublicKey, setPaystackPublicKey] = useState(currentConfig.paystackPublicKey);
  const [paystackLiveMode, setPaystackLiveMode] = useState(currentConfig.paystackLiveMode);
  const [paystackBusinessName, setPaystackBusinessName] = useState(currentConfig.paystackBusinessName || 'UniNest Technologies Ltd');
  const [paystackAutoApprove, setPaystackAutoApprove] = useState(currentConfig.paystackAutoApprove);

  // Status & UI
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [copiedPreview, setCopiedPreview] = useState(false);

  // Handle bank selection from dropdown
  const handleBankSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected === 'custom') {
      return;
    }
    const found = POPULAR_NIGERIAN_BANKS.find(b => b.name === selected);
    if (found) {
      setBankName(found.name);
      setBankShort(found.short);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(null);

    // Validation
    const cleanAcc = accountNumber.trim().replace(/\s+/g, '');
    if (!cleanAcc || cleanAcc.length < 8) {
      setSaveError('Please enter a valid official bank account number (at least 8-10 digits).');
      return;
    }
    if (!bankName.trim()) {
      setSaveError('Please provide the official bank name.');
      return;
    }
    if (!accountName.trim()) {
      setSaveError('Please provide the registered official account holder name.');
      return;
    }

    const updated = updateOfficialPaymentConfig({
      paymentMode,
      bankName: bankName.trim(),
      bankShort: bankShort.trim() || bankName.trim().slice(0, 6),
      accountNumber: cleanAcc,
      accountName: accountName.trim(),
      accountType: accountType.trim(),
      escrowAccountNumber: cleanAcc,
      escrowPolicy: escrowPolicy.trim(),
      supportWhatsApp: supportWhatsApp.trim().replace(/[^0-9]/g, ''),
      paystackPublicKey: paystackPublicKey.trim(),
      paystackLiveMode,
      paystackBusinessName: paystackBusinessName.trim(),
      paystackAutoApprove
    }, adminEmail);

    setSaveSuccess(`Official payment configuration successfully updated! Active mode: ${paymentMode.toUpperCase()} | Bank: ${updated.bankName} (${updated.accountNumber}).`);
    onAddLog(
      'Payment Settings Updated',
      `Mode: ${paymentMode} | Bank: ${updated.bankShort} - ${updated.accountNumber} (${updated.accountName}) | Paystack: ${paystackLiveMode ? 'Live' : 'Test'}`
    );

    setTimeout(() => {
      setSaveSuccess(null);
    }, 6000);
  };

  const handleResetToDefault = () => {
    if (window.confirm('Are you sure you want to reset payment settings to the factory default institutional account (UBA - 2150445461)?')) {
      const reset = resetOfficialPaymentConfig(adminEmail);
      setPaymentMode(reset.paymentMode);
      setBankName(reset.bankName);
      setBankShort(reset.bankShort);
      setAccountNumber(reset.accountNumber);
      setAccountName(reset.accountName);
      setAccountType(reset.accountType);
      setEscrowPolicy(reset.escrowPolicy);
      setSupportWhatsApp(reset.supportWhatsApp);
      setPaystackPublicKey(reset.paystackPublicKey);
      setPaystackLiveMode(reset.paystackLiveMode);
      setPaystackBusinessName(reset.paystackBusinessName || '');
      setPaystackAutoApprove(reset.paystackAutoApprove);
      setSaveSuccess('Reset to factory default institutional bank (UBA - 2150445461) successfully!');
      onAddLog('Payment Settings Reset', 'Reverted official payment account to factory default UBA Account');
      setTimeout(() => setSaveSuccess(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-[#0A1931] to-slate-900 border border-slate-700 shadow-xl text-white">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FF6A00]/20 text-[#FF6A00] font-mono text-[10px] font-black uppercase tracking-wider border border-[#FF6A00]/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Real-Time Vault Configuration
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
              Active: {paymentMode === 'both' ? 'Hybrid (Bank & Paystack)' : paymentMode === 'paystack' ? 'Paystack Gateway' : 'Bank Transfer Only'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Building className="w-6 h-6 text-[#FF6A00]" />
            Official Bank Account &amp; Paystack Settings
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Configure the institutional bank account for deposits, escrow, STS savings, and marketplace fees, or switch the system to use the <strong>Paystack payment gateway</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 cursor-pointer shadow-xs"
            title="Revert to factory default settings"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-semibold">{saveSuccess}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setSaveSuccess(null)}
            className="text-emerald-400 hover:text-emerald-200 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error Notification */}
      {saveError && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span className="font-semibold">{saveError}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* ================= 1. PAYMENT GATEWAY / PROCESSING MODE ================= */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#FF6A00]" />
                1. Select Primary Payment Channel
              </h3>
              <p className="text-xs text-slate-400">
                Choose how students pay across UniNest (STS savings, lodge escrow, data, crowdfunding).
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Last saved by: <strong className="text-slate-200">{currentConfig.updatedBy || 'admin'}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {/* Option A: Direct Bank Transfer */}
            <div
              onClick={() => setPaymentMode('bank_transfer')}
              className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                paymentMode === 'bank_transfer'
                  ? 'border-[#FF6A00] bg-[#FF6A00]/10 text-white shadow-md'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-[#FF6A00]" />
                    <span className="font-black text-xs uppercase tracking-wide">Direct Bank Transfer</span>
                  </div>
                  {paymentMode === 'bank_transfer' && <Check className="w-4 h-4 text-[#FF6A00]" />}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Students transfer funds to the official bank account (NUBAN) and upload debit alert/receipt proof for admin vetting.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
                • 0% gateway commission<br/>• Instant manual receipt verification
              </div>
            </div>

            {/* Option B: Paystack Gateway Only */}
            <div
              onClick={() => setPaymentMode('paystack')}
              className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                paymentMode === 'paystack'
                  ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-md'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span className="font-black text-xs uppercase tracking-wide">Paystack Gateway</span>
                  </div>
                  {paymentMode === 'paystack' && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Students pay seamlessly through Paystack using ATM cards, USSD, Apple Pay, or dedicated virtual bank accounts.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-emerald-400">
                • 100% automated settlement<br/>• Instant automated wallet crediting
              </div>
            </div>

            {/* Option C: Hybrid / Both Active */}
            <div
              onClick={() => setPaymentMode('both')}
              className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                paymentMode === 'both'
                  ? 'border-sky-500 bg-sky-500/10 text-white shadow-md'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    <span className="font-black text-xs uppercase tracking-wide">Hybrid (Both Active)</span>
                  </div>
                  {paymentMode === 'both' && <Check className="w-4 h-4 text-sky-400" />}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Students get to choose between Direct Official Bank Transfer and Paystack at the payment screen.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-sky-400">
                • Recommended for maximum convenience<br/>• Zero student friction
              </div>
            </div>
          </div>
        </div>

        {/* ================= 2. OFFICIAL BANK ACCOUNT CONFIGURATION ================= */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Building className="w-4 h-4 text-[#FF6A00]" />
                2. Official Institutional Bank Account
              </h3>
              <p className="text-xs text-slate-400">
                Update the official bank details displayed to students on payment cards across the entire platform.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-bold border border-slate-700">
              Current: {bankShort} - {accountNumber}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {/* Quick Bank Selector Dropdown */}
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Select Nigerian Bank Preset
              </label>
              <select
                onChange={handleBankSelect}
                value={POPULAR_NIGERIAN_BANKS.some(b => b.name === bankName) ? bankName : 'custom'}
                className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-[#FF6A00]"
              >
                {POPULAR_NIGERIAN_BANKS.map((b) => (
                  <option key={b.name} value={b.name}>
                    {b.name} ({b.short})
                  </option>
                ))}
                <option value="custom">-- Custom / Other Bank / Fintech --</option>
              </select>
            </div>

            {/* Custom Bank Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Bank Full Name
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. Zenith Bank, OPay, Kuda"
                className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-[#FF6A00]"
                required
              />
            </div>

            {/* Bank Short Code */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Bank Short Code / Display
              </label>
              <input
                type="text"
                value={bankShort}
                onChange={(e) => setBankShort(e.target.value)}
                placeholder="e.g. UBA, GTB, OPAY, KUDA"
                className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-[#FF6A00]"
                required
              />
            </div>

            {/* Account Number */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#FF6A00] uppercase tracking-wider flex items-center justify-between">
                <span>Account Number (NUBAN) *</span>
                <span className="text-[10px] font-mono text-slate-400">{accountNumber.length} digits</span>
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="e.g. 2150445461"
                maxLength={10}
                className="w-full h-10 px-3 rounded-xl bg-slate-800 border-2 border-[#FF6A00]/70 text-sm font-mono font-bold text-white focus:outline-none focus:border-[#FF6A00]"
                required
              />
            </div>

            {/* Account Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Beneficiary / Account Name *
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="e.g. UniNest Operations / Stephen Stanley"
                className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-[#FF6A00]"
                required
              />
            </div>

            {/* Official WhatsApp Desk Line */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Finance Verification WhatsApp Number
              </label>
              <input
                type="text"
                value={supportWhatsApp}
                onChange={(e) => setSupportWhatsApp(e.target.value)}
                placeholder="e.g. 2349039847154"
                className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-[#FF6A00]"
              />
            </div>

            {/* Account Designation / Purpose */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Account Designation / Sub-title
              </label>
              <input
                type="text"
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                placeholder="e.g. UniNest Escrow & Student Accounts Vault"
                className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-[#FF6A00]"
              />
            </div>

            {/* Escrow Guarantee Policy Note */}
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Official Escrow &amp; Deposit Policy Notice
              </label>
              <textarea
                rows={2}
                value={escrowPolicy}
                onChange={(e) => setEscrowPolicy(e.target.value)}
                placeholder="e.g. Payment is sent to Escrow Account and released after buyer confirmation or within 3 working days."
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-[#FF6A00]"
              />
            </div>
          </div>
        </div>

        {/* ================= 3. PAYSTACK GATEWAY CONFIGURATION ================= */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                3. Paystack API &amp; Gateway Configuration
              </h3>
              <p className="text-xs text-slate-400">
                Connect your Paystack merchant keys to enable automated card, USSD, and virtual transfer processing.
              </p>
            </div>
            
            {/* Production Status */}
            <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] font-bold text-emerald-400">Live Production Gateway</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Paystack Public Key */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Paystack Public Key</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${paystackLiveMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'}`}>
                  {paystackLiveMode ? 'Live Key' : 'Test Key'}
                </span>
              </label>
              <input
                type="text"
                value={paystackPublicKey}
                onChange={(e) => setPaystackPublicKey(e.target.value)}
                placeholder={paystackLiveMode ? 'pk_live_...' : 'pk_test_...'}
                className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Merchant Business Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Paystack Merchant / Business Name
              </label>
              <input
                type="text"
                value={paystackBusinessName}
                onChange={(e) => setPaystackBusinessName(e.target.value)}
                placeholder="e.g. UniNest Technologies Ltd"
                className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Automated Credit Toggle */}
            <div className="sm:col-span-2 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Instant Automatic Wallet &amp; Escrow Crediting
                </span>
                <p className="text-[11px] text-slate-400">
                  When enabled, successful Paystack checkouts immediately update student balances without waiting for manual admin approval.
                </p>
              </div>
              <input
                type="checkbox"
                checked={paystackAutoApprove}
                onChange={(e) => setPaystackAutoApprove(e.target.checked)}
                className="w-5 h-5 accent-emerald-500 cursor-pointer rounded"
              />
            </div>
          </div>
        </div>

        {/* ================= 4. LIVE STUDENT PREVIEW ================= */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4 text-sky-400" />
                Live Student Payment Preview
              </h3>
              <p className="text-xs text-slate-400">
                This is how students will see the payment screen with your active configuration.
              </p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Live Preview
            </span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-[#0A1931]/10 text-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#0A1931] text-white flex items-center justify-center font-bold">
                  <Building className="w-4 h-4 text-[#FF6A00]" />
                </div>
                <div>
                  <h4 className="font-black text-xs text-[#0A1931]">UniNest Institutional Payment</h4>
                  <p className="text-[10px] text-slate-500">{accountType}</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                {paymentMode === 'both' ? 'Bank / Paystack Available' : paymentMode === 'paystack' ? 'Paystack Mode' : 'Direct Bank Mode'}
              </span>
            </div>

            {/* Bank details mockup */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Bank Name</span>
                <span className="font-black text-slate-900">{bankName}</span>
                <span className="text-[10px] text-[#FF6A00] font-bold block">({bankShort})</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FF6A00]/10 border border-[#FF6A00]/40 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] uppercase font-bold text-[#FF6A00] block">Account Number</span>
                  <span className="font-mono font-black text-sm text-[#0A1931]">{accountNumber}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(accountNumber);
                    setCopiedPreview(true);
                    setTimeout(() => setCopiedPreview(false), 2000);
                  }}
                  className="mt-1 text-[10px] font-bold text-[#FF6A00] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedPreview ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedPreview ? 'Copied' : 'Test Copy'}</span>
                </button>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Account Name</span>
                <span className="font-bold text-slate-900 uppercase truncate block">{accountName}</span>
                <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3" /> Verified UniNest Vault
                </span>
              </div>
            </div>

            {/* Policy note */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-[#FF6A00] shrink-0 mt-0.5" />
              <span>{escrowPolicy}</span>
            </div>
          </div>
        </div>

        {/* ================= SAVE ACTIONS BAR ================= */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="text-xs text-slate-400">
            Click <strong>Save Payment Settings</strong> to immediately broadcast changes across all student dashboards and payment portals.
          </div>
          <button
            type="submit"
            id="btn-save-payment-settings"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FF6A00] to-amber-500 hover:from-[#e55f00] hover:to-amber-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-500/20 transition transform active:scale-98"
          >
            <Save className="w-4 h-4" />
            <span>Save Payment Settings</span>
          </button>
        </div>

      </form>
    </div>
  );
};
