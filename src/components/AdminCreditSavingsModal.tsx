import React, { useState, useEffect } from 'react';
import { 
  PiggyBank, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ArrowRight, 
  CreditCard, 
  Building2, 
  FileText, 
  Sparkles, 
  Copy, 
  Check, 
  Share2, 
  UserCheck, 
  ShieldCheck,
  Gift,
  Plus
} from 'lucide-react';
import { UniNestUser, STSSavingsAccount } from '../types';
import { savingsCreditService, ManualSavingsCreditResult } from '../utils/savingsCreditService';

interface AdminCreditSavingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UniNestUser[];
  stsSavingsAccounts?: STSSavingsAccount[];
  preSelectedUserEmail?: string;
  adminEmail?: string;
  onSuccessCredit?: (result: ManualSavingsCreditResult) => void;
  onAddLog?: (action: string, details?: string) => void;
}

export const AdminCreditSavingsModal: React.FC<AdminCreditSavingsModalProps> = ({
  isOpen,
  onClose,
  users,
  stsSavingsAccounts = [],
  preSelectedUserEmail,
  adminEmail = 'admin@uninest.com',
  onSuccessCredit,
  onAddLog
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UniNestUser | null>(null);
  const [creditAmount, setCreditAmount] = useState<string>('10000');
  const [paymentMethod, setPaymentMethod] = useState<string>('Direct Bank Transfer to Zenith Vault');
  const [reference, setReference] = useState<string>(() => `MNL-DEP-${Date.now().toString().slice(-6)}`);
  const [depositorName, setDepositorName] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [creditType, setCreditType] = useState<'locked_savings' | 'gift_account'>('locked_savings');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [creditResult, setCreditResult] = useState<ManualSavingsCreditResult | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Initialize or update selected user
  useEffect(() => {
    if (preSelectedUserEmail) {
      const match = users.find(u => u.email.toLowerCase() === preSelectedUserEmail.toLowerCase());
      if (match) {
        setSelectedUser(match);
        setDepositorName(match.name || '');
      }
    } else if (!selectedUser && users.length > 0) {
      // Default to first student if available
      const firstStudent = users.find(u => u.role !== 'admin') || users[0];
      if (firstStudent) {
        setSelectedUser(firstStudent);
        setDepositorName(firstStudent.name || '');
      }
    }
  }, [preSelectedUserEmail, users]);

  // Regenerate reference on open
  useEffect(() => {
    if (isOpen) {
      setReference(`MNL-DEP-${Date.now().toString().slice(-6)}`);
      setCreditResult(null);
      setErrorMsg(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filtered users for search selector
  const filteredUsers = users.filter(u => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.phone || '').toLowerCase().includes(q) ||
      (u.university || '').toLowerCase().includes(q) ||
      ((u as any).matricNo || '').toLowerCase().includes(q)
    );
  });

  // Get active savings account for the selected user
  const activeSavingsAccount = selectedUser
    ? stsSavingsAccounts.find(a => a.userEmail.toLowerCase() === selectedUser.email.toLowerCase()) ||
      savingsCreditService.getAccountByEmail(selectedUser.email)
    : null;

  const currentLockedSavings = activeSavingsAccount?.currentBalance || 0;
  const currentGiftBalance = activeSavingsAccount?.giftAccountBalance ?? activeSavingsAccount?.giftBalance ?? 0;
  const targetTotal = activeSavingsAccount?.targetAmount || 250000;
  const target70Percent = Math.round(targetTotal * 0.7);

  const numericAmount = Math.max(0, Number(creditAmount) || 0);
  const projectedBalance = creditType === 'locked_savings'
    ? currentLockedSavings + numericAmount
    : currentGiftBalance + numericAmount;

  const willHit70Percent = creditType === 'locked_savings' && projectedBalance >= target70Percent;

  const handleQuickAdd = (addVal: number) => {
    const current = Number(creditAmount) || 0;
    setCreditAmount(String(current + addVal));
  };

  const handleSubmitCredit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedUser) {
      setErrorMsg('Please select a student / user account.');
      return;
    }

    if (numericAmount <= 0) {
      setErrorMsg('Please enter a valid deposit amount greater than ₦0.');
      return;
    }

    if (!reference.trim()) {
      setErrorMsg('Please provide a payment reference / session ID.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = savingsCreditService.creditUserSavingsManually({
        userEmail: selectedUser.email,
        userName: selectedUser.name,
        university: selectedUser.university,
        department: selectedUser.department,
        amount: numericAmount,
        paymentMethod: paymentMethod.trim(),
        reference: reference.trim(),
        depositorName: depositorName.trim() || selectedUser.name,
        note: note.trim() || 'Manual payment verified by admin',
        adminEmail,
        creditType
      });

      if (onAddLog) {
        onAddLog(
          'Admin Credited User Savings (Manual Pay)',
          `₦${numericAmount.toLocaleString()} credited to ${selectedUser.name} (${selectedUser.email}) via ${paymentMethod} - Ref: ${reference.trim()}`
        );
      }

      if (onSuccessCredit) {
        onSuccessCredit(result);
      }

      setCreditResult(result);
      setIsSubmitting(false);
    } catch (err: any) {
      console.error('Error crediting savings:', err);
      setErrorMsg(err?.message || 'Failed to process manual credit. Please check the details.');
      setIsSubmitting(false);
    }
  };

  const copyReceipt = () => {
    if (!creditResult || !selectedUser) return;
    const text = `UNINEST SAVINGS MANUAL DEPOSIT RECEIPT
Receipt Ref: ${creditResult.receiptNumber}
Student: ${selectedUser.name} (${selectedUser.email})
University: ${selectedUser.university || 'UniNest Campus'}
Amount Credited: ₦${(creditResult.amountCredited || 0).toLocaleString()}
Previous Balance: ₦${(creditResult.previousBalance || 0).toLocaleString()}
New STS Balance: ₦${(creditResult.newBalance || 0).toLocaleString()}
Payment Method: ${paymentMethod}
Date: ${creditResult.date}
Verified by: UniNest Admin (${adminEmail})`;

    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    });
  };

  const shareWhatsAppConfirmation = () => {
    if (!creditResult || !selectedUser) return;
    const studentName = selectedUser.name || 'Student';
    const amountStr = `₦${(creditResult.amountCredited || 0).toLocaleString()}`;
    const newBalStr = `₦${(creditResult.newBalance || 0).toLocaleString()}`;
    const msg = `Hello ${studentName}! 🎓 Your manual savings deposit of ${amountStr} has been verified and credited to your UniNest STS account. Your new balance is ${newBalStr}. Keep building your sign-out clearance fund! (Ref: ${creditResult.receiptNumber})`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        id="admin-credit-savings-modal-card"
        className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-auto text-slate-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border-b border-slate-800 p-5 sm:p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <PiggyBank className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Credit User Savings Balance</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  Manual Payment Desk
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Increase any student's STS savings balance after manual bank transfer, cash, or POS payment.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {creditResult ? (
            /* SUCCESS RECEIPT VIEW */
            <div className="space-y-5 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-white">Savings Balance Successfully Credited!</h4>
                <p className="text-xs text-emerald-300/80">
                  The student&apos;s STS ledger and wallet balances have been updated instantly.
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400">
                  <span>RECEIPT REFERENCE</span>
                  <strong className="text-white font-bold">{creditResult.receiptNumber}</strong>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span>Student Name:</span>
                  <strong className="text-white font-sans">{selectedUser?.name}</strong>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span>Student Email:</span>
                  <strong className="text-emerald-400">{selectedUser?.email}</strong>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span>Institution:</span>
                  <span className="text-slate-300 font-sans">{selectedUser?.university || 'Campus'}</span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span>Amount Added:</span>
                  <strong className="text-emerald-400 text-sm font-bold">
                    +₦{(creditResult.amountCredited || 0).toLocaleString()}
                  </strong>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span>Previous Balance:</span>
                  <span className="text-slate-400">₦{(creditResult.previousBalance || 0).toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-sm">
                  <span className="font-sans font-bold text-slate-200">New STS Savings Balance:</span>
                  <strong className="text-white font-bold text-base text-emerald-300">
                    ₦{(creditResult.newBalance || 0).toLocaleString()}
                  </strong>
                </div>

                {creditResult.newBalance >= target70Percent && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-sans text-xs flex items-center gap-2 mt-2">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      <strong>70% Milestone Achieved!</strong> This student is now eligible for official UniNest clearance gift packages!
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={copyReceipt}
                  className="flex-1 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 border border-slate-700"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{isCopied ? 'Receipt Copied!' : 'Copy Official Receipt'}</span>
                </button>

                <button
                  type="button"
                  onClick={shareWhatsAppConfirmation}
                  className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Send WhatsApp Alert to Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCreditResult(null);
                    setCreditAmount('10000');
                    setReference(`MNL-DEP-${Date.now().toString().slice(-6)}`);
                  }}
                  className="px-4 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
                >
                  Credit Another
                </button>
              </div>
            </div>
          ) : (
            /* MANUAL CREDIT INPUT FORM */
            <form onSubmit={handleSubmitCredit} className="space-y-5">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. User Selection & Search */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>1. Select Student / User to Credit</span>
                  <span className="text-[10px] text-slate-400">Total Users: {users.length}</span>
                </label>

                {/* Search box if admin wants to switch user */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search user by name, email, phone, or matric no..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Quick user selection list if searching */}
                {searchQuery.trim() && (
                  <div className="max-h-36 overflow-y-auto rounded-xl bg-slate-950/90 border border-slate-800 divide-y divide-slate-800/80 p-1">
                    {filteredUsers.length === 0 ? (
                      <div className="p-3 text-center text-xs text-slate-500">No users match &quot;{searchQuery}&quot;</div>
                    ) : (
                      filteredUsers.slice(0, 5).map(u => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            setSelectedUser(u);
                            setDepositorName(u.name || '');
                            setSearchQuery('');
                          }}
                          className={`w-full p-2 text-left rounded-lg transition flex items-center justify-between ${
                            selectedUser?.email === u.email ? 'bg-emerald-500/20 text-white' : 'hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          <div>
                            <span className="font-bold text-xs block">{u.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{u.email}</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {u.university ? u.university.slice(0, 20) : 'Campus'}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}

                {/* Currently Selected User Profile Card */}
                {selectedUser && (
                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80'}
                        alt={selectedUser.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{selectedUser.name}</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                            {selectedUser.role}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono block">{selectedUser.email}</span>
                        <span className="text-[10px] text-slate-500 block truncate max-w-xs">
                          {selectedUser.university} {selectedUser.department ? `• ${selectedUser.department}` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-right shrink-0">
                      <span className="text-[10px] text-slate-400 block uppercase font-mono">Current STS Savings</span>
                      <strong className="text-emerald-400 text-sm font-bold font-mono">
                        ₦{currentLockedSavings.toLocaleString()}
                      </strong>
                      <span className="text-[10px] text-slate-500 block font-mono">
                        Target: ₦{targetTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Manual Payment Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Amount */}
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>2. Amount Paid Manually (NGN) *</span>
                    <span className="text-[10px] text-slate-400">Enter cash or transfer amount</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₦</span>
                    <input
                      type="number"
                      required
                      min="100"
                      step="100"
                      value={creditAmount}
                      onChange={(e) => setCreditAmount(e.target.value)}
                      placeholder="e.g. 20000"
                      className="w-full h-11 pl-8 pr-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold text-base focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Quick-add chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-500 self-center mr-1">Quick Add:</span>
                    {[2000, 5000, 10000, 20000, 50000, 100000].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setCreditAmount(String(val))}
                        className="px-2 py-0.8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold font-mono border border-slate-700 transition"
                      >
                        +₦{val.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Method / Channel */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Payment Channel / Source *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Direct Bank Transfer to Zenith Vault">Direct Bank Transfer to Zenith Vault</option>
                    <option value="Mobile App / USSD Transfer">Mobile App / USSD Transfer</option>
                    <option value="Campus Lodge Desk Cash Handover">Campus Lodge Desk Cash Handover</option>
                    <option value="POS Agent / Scout Collection">POS Agent / Scout Collection</option>
                    <option value="Bank Branch Slip Deposit">Bank Branch Slip Deposit</option>
                    <option value="WhatsApp Payment Clearing">WhatsApp Proof Clearing</option>
                    <option value="Other Manual Clearing">Other Manual Clearing</option>
                  </select>
                </div>

                {/* Reference ID */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Payment Reference / Session ID *</label>
                  <input
                    type="text"
                    required
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="e.g. MNL-DEP-89342 or Bank Session ID"
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Depositor / Sender Account Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Depositor Name (Sender on Bank Slip)</label>
                  <input
                    type="text"
                    value={depositorName}
                    onChange={(e) => setDepositorName(e.target.value)}
                    placeholder="e.g. Chinedu Okafor (Parent / Student)"
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Destination Target Allocation */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Credit Destination *</label>
                  <select
                    value={creditType}
                    onChange={(e: any) => setCreditType(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="locked_savings">Core STS Locked Savings (Save Till Sign-Out)</option>
                    <option value="gift_account">STS Spendable Gift Account (Withdrawable)</option>
                  </select>
                </div>

                {/* Admin Internal Note */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-300">Admin Audit Note (Optional)</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Verified in official Zenith statement. Proof checked on WhatsApp."
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* 3. Live Balance Calculation Preview */}
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Current Balance:</span>
                  <span className="font-mono text-slate-300">₦{currentLockedSavings.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Manual Credit to Add:</span>
                  <span className="font-mono text-emerald-400 font-bold">+₦{numericAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-bold pt-2 border-t border-emerald-500/20">
                  <span className="text-white">Projected Savings Balance:</span>
                  <span className="font-mono text-emerald-300 text-base">
                    ₦{projectedBalance.toLocaleString()}
                  </span>
                </div>

                {willHit70Percent && (
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-300 text-[11px] flex items-center gap-1.5 mt-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Reaches 70% threshold (₦{target70Percent.toLocaleString()}) — Qualifies student for graduation gift packages!</span>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || numericAmount <= 0}
                  className="px-6 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-emerald-950 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Processing Credit...</span>
                  ) : (
                    <>
                      <PiggyBank className="w-4 h-4" />
                      <span>Credit ₦{numericAmount.toLocaleString()} to User</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
