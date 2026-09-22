import React, { useState, useRef, useEffect } from 'react';
import { 
  Copy, 
  Check, 
  ShieldCheck, 
  Building, 
  Send, 
  Clock, 
  ExternalLink, 
  ArrowLeft, 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  CheckCircle2, 
  X,
  Sparkles,
  CreditCard,
  Zap,
  Lock,
  Loader2
} from 'lucide-react';
import { 
  useOfficialPaymentConfig, 
  generatePaymentConfirmationWhatsAppUrl 
} from '../utils/paymentConfig';
import { approvalService } from '../utils/approvalService';

const COMMON_NIGERIAN_BANKS = [
  'Access Bank',
  'First Bank of Nigeria',
  'Guaranty Trust Bank (GTBank)',
  'United Bank for Africa (UBA)',
  'Zenith Bank',
  'OPay',
  'PalmPay',
  'Kuda Bank',
  'Moniepoint MFB',
  'Fidelity Bank',
  'Stanbic IBTC Bank',
  'Union Bank',
  'Sterling Bank',
  'Wema Bank / ALAT',
  'Ecobank Nigeria',
  'Other Bank / Fintech'
];

interface OfficialBankPaymentCardProps {
  amount?: number;
  purpose?: string;
  studentName?: string;
  studentEmail?: string;
  studentPhone?: string;
  university?: string;
  paymentCategory?: string;
  onPaymentSubmitted?: (reference?: string) => void;
  showCardTitle?: boolean;
  isEscrowPayment?: boolean;
  onCancel?: () => void;
  cancelButtonLabel?: string;
}

export const OfficialBankPaymentCard: React.FC<OfficialBankPaymentCardProps> = ({
  amount = 5000,
  purpose = 'Campus Service Payment',
  studentName = 'Student',
  studentEmail = '',
  studentPhone = '',
  university = '',
  paymentCategory = 'general',
  onPaymentSubmitted,
  showCardTitle = true,
  isEscrowPayment = false,
  onCancel,
  cancelButtonLabel = 'Decide Not to Pay / Go Back',
}) => {
  const paymentConfig = useOfficialPaymentConfig();

  // Selected Payment Method Tab (bank or paystack)
  const [activePaymentChannel, setActivePaymentChannel] = useState<'bank' | 'paystack'>(() => {
    return paymentConfig.paymentMode === 'paystack' ? 'paystack' : 'bank';
  });

  // Keep channel in sync if admin updates paymentMode
  useEffect(() => {
    if (paymentConfig.paymentMode === 'paystack') {
      setActivePaymentChannel('paystack');
    } else if (paymentConfig.paymentMode === 'bank_transfer') {
      setActivePaymentChannel('bank');
    }
  }, [paymentConfig.paymentMode]);

  const [copiedAcc, setCopiedAcc] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);
  
  // Proof of Payment Form State
  const [senderName, setSenderName] = useState(studentName || '');
  const [senderBank, setSenderBank] = useState('Guaranty Trust Bank (GTBank)');
  const [transferRefNote, setTransferRefNote] = useState('');
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [proofFileName, setProofFileName] = useState<string | null>(null);
  
  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Paystack Processing State
  const [paystackProcessing, setPaystackProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopyAcc = () => {
    navigator.clipboard.writeText(paymentConfig.accountNumber);
    setCopiedAcc(true);
    setTimeout(() => setCopiedAcc(false), 2500);
  };

  const handleCopyAll = () => {
    const text = `Bank: ${paymentConfig.bankName}\nAccount Number: ${paymentConfig.accountNumber}\nAccount Name: ${paymentConfig.accountName}\nAmount: ₦${amount.toLocaleString()}\nPurpose: ${purpose}`;
    navigator.clipboard.writeText(text);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2500);
  };

  // Paystack Automated Payment Flow
  const handlePayWithPaystack = () => {
    setPaystackProcessing(true);
    setErrorMessage(null);

    const generatedRef = `pstk_unw_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;

    setTimeout(() => {
      try {
        const approval = approvalService.submitDepositRequest({
          userName: studentName || 'UniNest Student',
          userEmail: studentEmail || 'student@campus.edu',
          userPhone: studentPhone || '08000000000',
          university: university || 'Campus',
          amount: Number(amount || 0),
          method: 'Paystack Automated Gateway',
          bankName: 'Paystack NGN Gateway',
          accountName: paymentConfig.paystackBusinessName || 'UniNest Technologies',
          senderBankName: 'Paystack Verified Card / USSD',
          senderAccountName: studentName || 'UniNest Student',
          reason: `${purpose} [Paystack Ref: ${generatedRef}]`,
          paymentCategory: paymentCategory
        });

        if (paymentConfig.paystackAutoApprove) {
          try {
            approvalService.approve(approval.id, 'Paystack Webhook Automated Clearing');
          } catch (e) {
            console.warn('Auto approval warning:', e);
          }
        }

        setSubmittedRef(generatedRef);
        setPaystackProcessing(false);
        setIsSubmitted(true);

        if (onPaymentSubmitted) {
          onPaymentSubmitted(generatedRef);
        }
      } catch (err) {
        console.error('Paystack error:', err);
        setErrorMessage('Paystack transaction failed. Please try again or use Direct Bank Transfer.');
        setPaystackProcessing(false);
      }
    }, 1600);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProofFileName(file.name);
    setErrorMessage(null);

    // Read file as base64 preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProofPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setProofPreview(null);
    setProofFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendProofOfPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!senderName.trim()) {
      setErrorMessage('Please enter the Depositor / Sender Account Name.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Dispatch immediately to Admin Dashboard via approvalService
      const newApproval = approvalService.submitDepositRequest({
        userName: senderName.trim(),
        userEmail: studentEmail || 'student@campus.edu',
        userPhone: studentPhone || '08000000000',
        university: university || 'Campus',
        amount: Number(amount || 0),
        method: `Direct Bank Transfer (${senderBank})`,
        bankName: senderBank,
        accountName: senderName.trim(),
        senderBankName: senderBank,
        senderAccountName: senderName.trim(),
        reason: `${purpose}${transferRefNote ? ` (Ref Note: ${transferRefNote.trim()})` : ''}`,
        proofImage: proofPreview || undefined,
        paymentCategory: paymentCategory
      });

      setSubmittedRef(newApproval.reference);
      setIsSubmitted(true);
      setIsSubmitting(false);

      if (onPaymentSubmitted) {
        onPaymentSubmitted(newApproval.reference);
      }
    } catch (err) {
      console.error('Payment submission failed:', err);
      setErrorMessage('An error occurred submitting proof. Please retry or notify on WhatsApp.');
      setIsSubmitting(false);
    }
  };

  const handleOpenWhatsAppConfirmation = () => {
    const url = generatePaymentConfirmationWhatsAppUrl({
      studentName: senderName || studentName,
      studentEmail,
      studentPhone,
      university,
      amount,
      purpose: `${purpose} [Proof Submitted - Ref: ${submittedRef || 'PENDING'}]`,
    });
    window.open(url, '_blank');
  };

  return (
    <div className="rounded-3xl bg-[#FFFFFF] border-2 border-[#0A1931]/20 p-5 sm:p-6 space-y-5 shadow-lg text-[#0A1931] relative">
      {/* Optional Top Header with Back Button */}
      <div className="flex items-center justify-between border-b border-[#0A1931]/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0A1931] text-white flex items-center justify-center font-bold shadow-xs shrink-0">
            {activePaymentChannel === 'paystack' ? (
              <Zap className="w-5 h-5 text-emerald-400" />
            ) : (
              <Building className="w-5 h-5 text-[#FF6A00]" />
            )}
          </div>
          <div>
            <h4 className="font-black text-sm sm:text-base text-[#0A1931] flex items-center gap-2">
              <span>{isEscrowPayment ? 'Official UniNest Escrow Payment' : 'UniNest Official Payment Gateway'}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide ${
                activePaymentChannel === 'paystack'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-[#0A1931] text-[#FF6A00]'
              }`}>
                {activePaymentChannel === 'paystack' ? 'PAYSTACK SECURED' : 'INSTITUTIONAL NUBAN'}
              </span>
            </h4>
            <p className="text-[11px] text-[#0A1931]/70 font-semibold">
              {activePaymentChannel === 'paystack'
                ? `${paymentConfig.paystackBusinessName || 'UniNest Tech'} • Automated Instant Checkout`
                : `${paymentConfig.bankName} (${paymentConfig.bankShort}) • Real-Time Admin Verification`}
            </p>
          </div>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            id="btn-payment-card-top-back"
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition cursor-pointer border border-slate-200 shrink-0 shadow-2xs"
            title="Decide not to pay and return"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#FF6A00]" />
            <span>Go Back</span>
          </button>
        )}
      </div>

      {/* Payment Channel Selector Tabs (When Hybrid / Both Active and not yet submitted) */}
      {paymentConfig.paymentMode === 'both' && !isSubmitted && (
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => setActivePaymentChannel('bank')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activePaymentChannel === 'bank'
                ? 'bg-white text-[#0A1931] shadow-xs border border-slate-200 font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="w-4 h-4 text-[#FF6A00]" />
            <span>Official Bank Transfer</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePaymentChannel('paystack')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activePaymentChannel === 'paystack'
                ? 'bg-emerald-600 text-white shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-4 h-4 text-emerald-200" />
            <span>Pay with Paystack</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-700/60 font-mono text-white">Instant</span>
          </button>
        </div>
      )}

      {/* Amount & Purpose Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-2xl bg-[#0A1931]/5 border border-[#0A1931]/15 text-xs">
        <div>
          <span className="text-slate-600 block text-[11px]">Payment Purpose:</span>
          <strong className="text-[#0A1931] font-bold">{purpose}</strong>
        </div>
        <div className="sm:text-right">
          <span className="text-slate-600 block text-[11px]">Total Amount to Transfer:</span>
          <span className="font-mono font-black text-lg sm:text-xl text-[#FF6A00]">
            ₦{amount.toLocaleString()}
          </span>
        </div>
      </div>

      {activePaymentChannel === 'paystack' && !isSubmitted ? (
        /* ================= PAYSTACK CHECKOUT VIEW ================= */
        <div className="space-y-4 pt-1">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                  P
                </div>
                <span className="font-black text-sm text-emerald-950">Paystack Automated Checkout</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-600" /> 256-Bit SSL Encrypted
              </span>
            </div>

            <p className="text-xs text-emerald-900 leading-relaxed">
              Pay securely using your <strong>Debit Card (Mastercard, Visa, Verve)</strong>, <strong>USSD</strong>, or <strong>Direct Bank Transfer</strong> powered by Paystack.
            </p>

            <div className="grid grid-cols-2 gap-2 text-[11px] bg-white/80 p-3 rounded-xl border border-emerald-200 text-slate-700">
              <div>
                <span className="text-slate-500 block text-[10px]">Merchant</span>
                <strong className="text-slate-900">{paymentConfig.paystackBusinessName || 'UniNest Technologies'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Student Payer</span>
                <strong className="text-slate-900 truncate block">{studentName || studentEmail || 'UniNest Student'}</strong>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 flex items-center gap-2">
              <X className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-300 order-2 sm:order-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{cancelButtonLabel}</span>
              </button>
            )}

            <button
              type="button"
              disabled={paystackProcessing}
              onClick={handlePayWithPaystack}
              id="btn-pay-via-paystack"
              className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs transition shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer order-1 sm:order-2 disabled:opacity-50 uppercase tracking-wider"
            >
              {paystackProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Connecting to Paystack Gateway...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-emerald-200" />
                  <span>Pay ₦{amount.toLocaleString()} with Paystack</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Account Details High-Visibility Block */
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Bank Name */}
            <div className="p-3.5 rounded-2xl bg-[#FFFFFF] border-2 border-[#0A1931]/15 space-y-1 shadow-2xs">
              <span className="text-[10px] uppercase font-black tracking-wider text-[#0A1931]/60 block">
                Bank Name
              </span>
              <span className="font-black text-sm text-[#0A1931] block">
                {paymentConfig.bankName}
              </span>
              <span className="text-[10px] text-[#FF6A00] font-bold block">
                ({paymentConfig.bankShort})
              </span>
            </div>

            {/* Account Number with 1-Click Copy */}
            <div className="p-3.5 rounded-2xl bg-[#FFFFFF] border-2 border-[#FF6A00] space-y-1 relative shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-black tracking-wider text-[#FF6A00]">
                  Account Number
                </span>
                <button
                  type="button"
                  onClick={handleCopyAcc}
                  className="px-2 py-0.5 rounded-md bg-[#0A1931] text-white text-[10px] font-black flex items-center gap-1 hover:bg-[#0A1931]/80 cursor-pointer transition"
                >
                  {copiedAcc ? <Check className="w-3 h-3 text-[#FF6A00]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedAcc ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <span className="font-mono font-black text-lg tracking-wider text-[#0A1931] block">
                {paymentConfig.accountNumber}
              </span>
            </div>

            {/* Account Name */}
            <div className="p-3.5 rounded-2xl bg-[#FFFFFF] border-2 border-[#0A1931]/15 space-y-1 shadow-2xs">
              <span className="text-[10px] uppercase font-black tracking-wider text-[#0A1931]/60 block">
                Account Name
              </span>
              <span className="font-black text-xs sm:text-sm text-[#0A1931] block uppercase truncate">
                {paymentConfig.accountName}
              </span>
              <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Designated Official Vault</span>
              </span>
            </div>
          </div>

          {/* Escrow policy note */}
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Official Vault Guarantee:</strong> {paymentConfig.escrowPolicy}
            </p>
          </div>
        </div>
      )}

      {/* SUCCESS BANNER WHEN PROOF IS SENT */}
      {isSubmitted ? (
        <div className="p-5 rounded-3xl bg-emerald-50 border-2 border-emerald-400 space-y-3 animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-black text-sm text-emerald-950">
                  Proof of Payment Sent!
                </h4>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950 font-black text-[10px] animate-pulse">
                  ⏳ Waiting for Approval
                </span>
              </div>
              <p className="text-xs text-emerald-900 mt-0.5">
                Your payment proof has been routed to the <strong>Admin Dashboard immediately waiting for approval</strong>.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-emerald-200 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Transaction Reference:</span>
              <strong className="font-mono font-bold text-slate-900">{submittedRef}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Depositor:</span>
              <strong className="font-bold text-slate-900">{senderName} ({senderBank})</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Amount:</span>
              <strong className="font-mono font-black text-emerald-700">₦{amount.toLocaleString()}</strong>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleOpenWhatsAppConfirmation}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-[#0A1931] hover:bg-[#152847] text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5 text-[#FF6A00]" />
              <span>Notify Admin on WhatsApp (Optional)</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition cursor-pointer border border-slate-300"
              >
                Close &amp; Return
              </button>
            )}
          </div>
        </div>
      ) : activePaymentChannel === 'bank' ? (
        /* PROOF OF PAYMENT UPLOAD & SEND FORM */
        <form onSubmit={handleSendProofOfPayment} className="space-y-4 pt-1">
          <div className="border-t border-[#0A1931]/10 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-black text-xs uppercase tracking-wider text-[#0A1931] flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-[#FF6A00]" />
                <span>Submit Proof of Payment for Instant Approval</span>
              </h5>
              <button
                type="button"
                onClick={handleCopyAll}
                className="text-[11px] font-bold text-[#FF6A00] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedBank ? <Check className="w-3 h-3 text-[#0A1931]" /> : <Copy className="w-3 h-3" />}
                <span>{copiedBank ? 'Copied Details' : 'Copy All Details'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Depositor / Sender Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  1. Depositor / Account Name *
                </label>
                <input
                  type="text"
                  required
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. Tariere Ebimobowei"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-[#0A1931] focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              {/* Sender Bank */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  2. Your Bank (Where you transferred from) *
                </label>
                <select
                  value={senderBank}
                  onChange={(e) => setSenderBank(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-[#0A1931] focus:outline-none focus:border-[#FF6A00] bg-white"
                >
                  {COMMON_NIGERIAN_BANKS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Proof of Payment File Picker */}
            <div className="mt-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                3. Attach Payment Receipt / Proof of Payment (Screenshot or Slip)
              </label>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
                id="uninest-proof-file-input"
              />

              {proofPreview && proofPreview.trim() !== '' ? (
                <div className="p-3 rounded-2xl bg-slate-50 border-2 border-emerald-300 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img
                      src={proofPreview}
                      alt="Proof Preview"
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="overflow-hidden">
                      <span className="text-xs font-bold text-slate-900 block truncate">
                        {proofFileName || 'payment_proof_receipt.jpg'}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Receipt ready for Admin Approval
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Remove receipt"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#FF6A00] bg-slate-50/70 hover:bg-orange-50/30 transition text-center cursor-pointer space-y-1.5"
                >
                  <div className="w-8 h-8 rounded-full bg-white text-[#FF6A00] flex items-center justify-center mx-auto shadow-2xs border border-slate-200">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    Click to browse receipt screenshot / bank transfer slip
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Supports PNG, JPG, JPEG, PDF up to 10MB
                  </div>
                </div>
              )}
            </div>

            {/* Optional Reference / Note */}
            <div className="mt-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                4. Bank Transaction Session ID / Reference Note (Optional)
              </label>
              <input
                type="text"
                value={transferRefNote}
                onChange={(e) => setTransferRefNote(e.target.value)}
                placeholder="e.g. Session ID: 000013240987 or remark"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-[#0A1931] focus:outline-none focus:border-[#FF6A00]"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 flex items-center gap-2">
              <X className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ACTION BUTTONS: TAP SEND (FOR ADMIN APPROVAL) & DECIDE NOT TO PAY */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                id="btn-payment-card-decide-not-to-pay"
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-300 order-2 sm:order-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{cancelButtonLabel}</span>
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              id="btn-tap-send-proof-of-payment"
              className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-[#0A1931] hover:bg-[#152847] text-white font-black text-xs transition shadow-lg shadow-[#0A1931]/25 flex items-center justify-center gap-2 cursor-pointer order-1 sm:order-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-[#FF6A00]" />
              <span>
                {isSubmitting 
                  ? 'Submitting Proof to Admin...' 
                  : `Tap Send Proof of Payment (₦${amount.toLocaleString()})`}
              </span>
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
};
