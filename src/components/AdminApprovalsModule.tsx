import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Search, 
  Filter, 
  ShieldCheck, 
  Check, 
  X, 
  ExternalLink,
  Phone,
  Mail,
  Building,
  RefreshCw,
  Eye,
  AlertTriangle,
  Image as ImageIcon,
  Download,
  PiggyBank,
  Plus,
  Sparkles
} from 'lucide-react';
import { DepositWithdrawalApproval } from '../types';
import { approvalService } from '../utils/approvalService';

interface AdminApprovalsModuleProps {
  adminEmail: string;
  onAddLog: (action: string, details?: string) => void;
  onOpenManualCreditModal?: (email?: string) => void;
}

export const AdminApprovalsModule: React.FC<AdminApprovalsModuleProps> = ({
  adminEmail,
  onAddLog,
  onOpenManualCreditModal
}) => {
  const [approvals, setApprovals] = useState<DepositWithdrawalApproval[]>(() => approvalService.getAll());
  const [filterType, setFilterType] = useState<'all' | 'pending' | 'deposit' | 'withdrawal'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Rejection modal state
  const [rejectModalItem, setRejectModalItem] = useState<DepositWithdrawalApproval | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Proof image lightbox modal state
  const [previewProofModal, setPreviewProofModal] = useState<DepositWithdrawalApproval | null>(null);

  const refreshList = () => {
    setApprovals(approvalService.getAll());
  };

  // Real-time synchronization when a student submits payment proof
  useEffect(() => {
    const handleFinanceUpdate = () => {
      refreshList();
    };
    window.addEventListener('uninest_finance_update', handleFinanceUpdate);
    return () => {
      window.removeEventListener('uninest_finance_update', handleFinanceUpdate);
    };
  }, []);

  const handleApprove = (item: DepositWithdrawalApproval) => {
    const success = approvalService.approve(item.id, adminEmail, `Approved by ${adminEmail}`);
    if (success) {
      refreshList();
      onAddLog(
        `Approved ${item.type.toUpperCase()}`,
        `₦${(item.amount || 0).toLocaleString()} for ${item.userName} (${item.university}) - Ref: ${item.reference}`
      );
      setFeedbackMsg({
        type: 'success',
        text: `Successfully approved ${item.type} request of ₦${(item.amount || 0).toLocaleString()} for ${item.userName}!`
      });
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalItem || !rejectReason.trim()) return;

    const success = approvalService.reject(rejectModalItem.id, adminEmail, rejectReason.trim());
    if (success) {
      refreshList();
      onAddLog(
        `Rejected ${rejectModalItem.type.toUpperCase()}`,
        `Ref: ${rejectModalItem.reference} for ${rejectModalItem.userName} - Reason: ${rejectReason.trim()}`
      );
      setFeedbackMsg({
        type: 'error',
        text: `Rejected ${rejectModalItem.type} request of ₦${(rejectModalItem.amount || 0).toLocaleString()} for ${rejectModalItem.userName}.`
      });
      setTimeout(() => setFeedbackMsg(null), 4000);
      setRejectModalItem(null);
      setRejectReason('');
    }
  };

  const filteredApprovals = approvals.filter(item => {
    const matchesFilter = 
      filterType === 'all' ? true :
      filterType === 'pending' ? item.status === 'pending' :
      item.type === filterType;

    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      item.userName.toLowerCase().includes(q) ||
      item.userEmail.toLowerCase().includes(q) ||
      item.reference.toLowerCase().includes(q) ||
      item.university.toLowerCase().includes(q) ||
      (item.accountNumber && item.accountNumber.includes(q)) ||
      (item.bankName && item.bankName.toLowerCase().includes(q));

    return matchesFilter && matchesSearch;
  });

  const pendingCount = approvals.filter(a => a.status === 'pending').length;
  const approvedCount = approvals.filter(a => a.status === 'approved').length;
  const totalDepositPending = approvals
    .filter(a => a.status === 'pending' && a.type === 'deposit')
    .reduce((acc, a) => acc + a.amount, 0);
  const totalWithdrawalPending = approvals
    .filter(a => a.status === 'pending' && a.type === 'withdrawal')
    .reduce((acc, a) => acc + a.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-black text-white">Deposit &amp; Withdrawal Approvals</h2>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-black text-xs animate-pulse">
                {pendingCount} Pending Action
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Control automated wallet top-ups, bank transfers, and 1-time emergency early withdrawals across all campuses.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onOpenManualCreditModal && (
            <button
              type="button"
              onClick={() => onOpenManualCreditModal()}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-950/50"
            >
              <PiggyBank className="w-4 h-4" />
              <span>+ Credit Savings (Paid Manually)</span>
            </button>
          )}

          <button
            onClick={refreshList}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-2 cursor-pointer w-fit"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Stat Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Requests</span>
          <p className="text-2xl font-black text-amber-400 font-mono">{pendingCount}</p>
          <span className="text-[10px] text-slate-500">Requires admin authorization</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Approved Total</span>
          <p className="text-2xl font-black text-emerald-400 font-mono">{approvedCount}</p>
          <span className="text-[10px] text-slate-500">Credited / Disbursed</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Deposits</span>
          <p className="text-2xl font-black text-blue-400 font-mono">₦{(totalDepositPending || 0).toLocaleString()}</p>
          <span className="text-[10px] text-slate-500">Awaiting bank verification</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Payouts</span>
          <p className="text-2xl font-black text-purple-400 font-mono">₦{(totalWithdrawalPending || 0).toLocaleString()}</p>
          <span className="text-[10px] text-slate-500">Awaiting bank transfer</span>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedbackMsg && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-bold animate-in fade-in slide-in-from-top-2 ${
          feedbackMsg.type === 'success' 
            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
            : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {(['pending', 'all', 'deposit', 'withdrawal'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilterType(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition capitalize whitespace-nowrap cursor-pointer ${
                filterType === tab
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab === 'all' ? 'All Records' : tab === 'pending' ? `Pending (${pendingCount})` : `${tab}s`}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student, ref, acct..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-amber-500"
          />
        </div>
      </div>

      {/* Approvals List */}
      <div className="space-y-3">
        {filteredApprovals.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto opacity-70" />
            <h4 className="text-base font-extrabold text-white">No requests match this filter</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              All financial transactions are up to date! New deposit receipts and withdrawal applications will appear here in real time.
            </p>
          </div>
        ) : (
          filteredApprovals.map(item => {
            const isDeposit = item.type === 'deposit';
            const isPending = item.status === 'pending';

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isPending
                    ? 'bg-slate-900/95 border-amber-500/40 shadow-lg shadow-amber-950/20'
                    : item.status === 'approved'
                    ? 'bg-slate-900/70 border-slate-800 opacity-90'
                    : 'bg-slate-900/50 border-rose-900/40 opacity-75'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Transaction Meta */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                        isDeposit
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                      }`}>
                        {isDeposit ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                        {item.type.toUpperCase()}
                      </span>

                      {item.paymentCategory === 'sts_activation' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/50 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          STS Form Activation (₦500)
                        </span>
                      )}

                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        item.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse'
                          : item.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}>
                        {item.status.toUpperCase()}
                      </span>

                      <span className="text-[11px] font-mono text-slate-400">
                        Ref: <strong className="text-slate-200">{item.reference}</strong>
                      </span>

                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.date}
                      </span>
                    </div>

                    {/* Student Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Student Name</span>
                        <strong className="text-slate-100 font-semibold">{item.userName}</strong>
                        <p className="text-[11px] text-slate-400">{item.userEmail}</p>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">University &amp; Phone</span>
                        <span className="text-slate-300 block truncate">{item.university}</span>
                        <span className="text-[11px] text-amber-400 font-mono">{item.userPhone}</span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">
                          {isDeposit ? 'Deposit Channel' : 'Destination Bank Account'}
                        </span>
                        {isDeposit ? (
                          <span className="text-slate-200 font-medium">{item.method || 'Bank Transfer'}</span>
                        ) : (
                          <div className="text-slate-200">
                            <span className="font-bold text-amber-300">{item.bankName}</span>: {item.accountNumber} ({item.accountName})
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Purpose / Reason & Proof Attachment */}
                    <div className="space-y-2 pt-1">
                      {item.reason && (
                        <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                          💬 <strong className="text-slate-200">Purpose / Note:</strong> {item.reason}
                        </p>
                      )}

                      {/* Payment Proof Receipt Slip Preview */}
                      {item.proofImage && item.proofImage.trim() !== '' ? (
                        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <img
                              src={item.proofImage}
                              alt="Proof Receipt"
                              className="w-12 h-12 rounded-lg object-cover border border-emerald-500/40 shrink-0 cursor-pointer hover:opacity-90"
                              onClick={() => setPreviewProofModal(item)}
                            />
                            <div className="overflow-hidden">
                              <span className="text-xs font-bold text-emerald-400 block truncate">
                                Proof of Payment Receipt Attached
                              </span>
                              <span className="text-[10px] text-slate-400">
                                Sender: {item.senderAccountName || item.userName} ({item.senderBankName || 'Bank Transfer'})
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setPreviewProofModal(item)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Proof</span>
                          </button>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                          <span>Sender Account: {item.senderAccountName || item.accountName || item.userName} • Bank: {item.senderBankName || item.bankName || 'Direct Transfer'}</span>
                        </div>
                      )}
                    </div>

                    {/* Review Info if resolved */}
                    {item.reviewedBy && (
                      <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-2">
                        <span>Reviewed by: <strong className="text-slate-400">{item.reviewedBy}</strong></span>
                        {item.reviewedAt && <span>• {item.reviewedAt}</span>}
                        {item.rejectionReason && (
                          <span className="text-rose-400 font-medium">• Reason: {item.rejectionReason}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Amount & Action Buttons */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">Amount</span>
                      <span className="text-2xl font-black font-mono text-emerald-400">
                        ₦{(item.amount || 0).toLocaleString()}
                      </span>
                    </div>

                    {isPending ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setRejectModalItem(item)}
                          className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                        <button
                          onClick={() => handleApprove(item)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve {isDeposit ? 'Deposit' : 'Payout'}</span>
                        </button>
                      </div>
                    ) : (
                      <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                        item.status === 'approved' ? 'text-emerald-400 bg-emerald-950/40' : 'text-rose-400 bg-rose-950/40'
                      }`}>
                        {item.status === 'approved' ? '✓ Processed' : '✗ Declined'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Proof of Payment Lightbox Modal */}
      {previewProofModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                <ImageIcon className="w-5 h-5" />
                <h3>Verified Payment Proof Slip</h3>
              </div>
              <button
                onClick={() => setPreviewProofModal(null)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Student / Sender:</span>
                  <strong className="text-white">{previewProofModal.userName}</strong>
                  <span className="text-slate-400 block text-[11px]">{previewProofModal.userEmail} • {previewProofModal.userPhone}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">Amount:</span>
                  <span className="font-mono font-black text-emerald-400 text-lg">
                    ₦{(previewProofModal.amount || 0).toLocaleString()}
                  </span>
                  <span className="text-amber-400 block text-[10px] font-mono">Ref: {previewProofModal.reference}</span>
                </div>
              </div>

              {/* The Image Preview */}
              <div className="max-h-[60vh] overflow-auto rounded-2xl border border-slate-800 bg-slate-950 flex items-center justify-center p-2">
                {previewProofModal.proofImage && previewProofModal.proofImage.trim() !== '' ? (
                  <img
                    src={previewProofModal.proofImage}
                    alt="Payment Proof Receipt"
                    className="max-w-full max-h-[55vh] object-contain rounded-xl"
                  />
                ) : (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    No image file attached. Bank Reference and transfer details verified.
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPreviewProofModal(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 cursor-pointer"
              >
                Close Preview
              </button>

              {previewProofModal.status === 'pending' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const item = previewProofModal;
                      setPreviewProofModal(null);
                      setRejectModalItem(item);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      handleApprove(previewProofModal);
                      setPreviewProofModal(null);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve Payment (₦{(previewProofModal.amount || 0).toLocaleString()})</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
                <AlertTriangle className="w-5 h-5" />
                <h3>Reject {rejectModalItem.type.toUpperCase()} Request</h3>
              </div>
              <button
                onClick={() => setRejectModalItem(null)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Rejecting request of <strong className="text-white font-mono">₦{(rejectModalItem.amount || 0).toLocaleString()}</strong> for{' '}
              <strong className="text-amber-400">{rejectModalItem.userName}</strong>. Provide a reason so the student can rectify their submission.
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Rejection Reason *
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Bank transfer reference could not be matched with bank statement. Please re-upload valid proof."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-amber-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition cursor-pointer"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
