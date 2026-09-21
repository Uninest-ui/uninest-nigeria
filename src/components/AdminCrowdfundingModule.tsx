import React, { useState } from 'react';
import { 
  HeartHandshake, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Search, 
  FileSpreadsheet, 
  Lock, 
  ExternalLink, 
  UploadCloud, 
  FileText, 
  Eye, 
  CreditCard, 
  PiggyBank, 
  Receipt, 
  Check, 
  X, 
  Users,
  Building2,
  Phone,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { CrowdfundingCampaign } from '../types';

interface AdminCrowdfundingModuleProps {
  campaigns: CrowdfundingCampaign[];
  onApproveCampaign: (campaignId: string) => void;
  onRejectCampaign: (campaignId: string, reason: string) => void;
  onMarkCampaignAsPaid: (
    campaignId: string, 
    payoutData: { 
      amount: number; 
      proofUrl: string; 
      proofName: string; 
      reference: string; 
      note?: string; 
    }
  ) => void;
  onAddLog: (action: string, details?: string) => void;
}

export const AdminCrowdfundingModule: React.FC<AdminCrowdfundingModuleProps> = ({
  campaigns,
  onApproveCampaign,
  onRejectCampaign,
  onMarkCampaignAsPaid,
  onAddLog
}) => {
  const [activeSection, setActiveSection] = useState<'pending' | 'live' | 'disbursed'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Modals
  const [selectedProofCampaign, setSelectedProofCampaign] = useState<CrowdfundingCampaign | null>(null);
  const [rejectingCampaign, setRejectingCampaign] = useState<CrowdfundingCampaign | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Insufficient or unverified institutional fee documentation.');
  
  // Payout / Mark as Paid Modal State
  const [payoutCampaign, setPayoutCampaign] = useState<CrowdfundingCampaign | null>(null);
  const [payoutAmount, setPayoutAmount] = useState<string>('');
  const [payoutRef, setPayoutRef] = useState<string>('');
  const [payoutProofName, setPayoutProofName] = useState<string>('');
  const [payoutProofUrl, setPayoutProofUrl] = useState<string>('');
  const [payoutNote, setPayoutNote] = useState<string>('');
  const [payoutError, setPayoutError] = useState<string | null>(null);

  // Viewing Disbursed Receipt
  const [viewingDisbursementProof, setViewingDisbursementProof] = useState<CrowdfundingCampaign | null>(null);

  // Categorized lists
  const pendingCampaigns = campaigns.filter(c => c.status === 'pending');
  const liveCampaigns = campaigns.filter(c => c.status === 'approved');
  const disbursedCampaigns = campaigns.filter(c => c.status === 'paid_out');

  // Metrics
  const totalEscrowRaised = campaigns.reduce((sum, c) => sum + (c.currentRaised || 0), 0);
  const totalDisbursedVolume = disbursedCampaigns.reduce((sum, c) => sum + (c.paidOutAmount || c.currentRaised || 0), 0);
  const activeEscrowHeld = liveCampaigns.reduce((sum, c) => sum + (c.currentRaised || 0), 0);

  // CSV Export Handler
  const handleExportCSV = () => {
    const headers = [
      'Campaign ID',
      'Beneficiary Name',
      'Email',
      'Phone',
      'Institution',
      'Department',
      'Level',
      'Matric Number',
      'Title',
      'Category',
      'Target Amount (NGN)',
      'Current Raised (NGN)',
      'Donors Count',
      'Status',
      'Escrow Account',
      'Beneficiary Bank',
      'Account Number',
      'Account Name',
      'Paid Out Amount (NGN)',
      'Payout Reference',
      'Disbursement Date',
      'Created At'
    ];

    const rows = campaigns.map(c => [
      c.id,
      `"${c.studentName.replace(/"/g, '""')}"`,
      c.studentEmail,
      c.studentPhone,
      `"${c.institution.replace(/"/g, '""')}"`,
      `"${c.department.replace(/"/g, '""')}"`,
      c.level,
      c.matricNumber || '',
      `"${c.title.replace(/"/g, '""')}"`,
      c.category,
      c.targetAmount,
      c.currentRaised,
      c.donorsCount,
      c.status,
      'ACCT_uninest_escrow_0192',
      `"${c.bankName || ''}"`,
      `'${c.accountNumber || ''}`,
      `"${c.accountName || ''}"`,
      c.paidOutAmount || (c.status === 'paid_out' ? c.currentRaised : 0),
      c.payoutReference || '',
      c.paidOutAt || '',
      c.createdAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `uninest_crowdfunding_escrow_audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onAddLog('Exported Crowdfunding Escrow Report', `Generated CSV of ${campaigns.length} campaigns for external audit`);
  };

  // Handle Approve
  const handleApprove = (camp: CrowdfundingCampaign) => {
    onApproveCampaign(camp.id);
    onAddLog('Approved Crowdfunding Campaign', `Title: "${camp.title}" for ${camp.studentName} [Moved to Live Campaigns]`);
    setActiveSection('live');
  };

  // Handle Reject
  const handleConfirmReject = () => {
    if (!rejectingCampaign) return;
    onRejectCampaign(rejectingCampaign.id, rejectionReason);
    onAddLog('Rejected Crowdfunding Request', `Title: "${rejectingCampaign.title}" by ${rejectingCampaign.studentName} - Reason: ${rejectionReason}`);
    setRejectingCampaign(null);
  };

  // Open Payout Modal
  const openPayoutModal = (camp: CrowdfundingCampaign) => {
    setPayoutCampaign(camp);
    setPayoutAmount(String(camp.currentRaised || camp.targetAmount));
    setPayoutRef(`PAY-ESCROW-${Date.now().toString().slice(-6)}`);
    setPayoutProofName('');
    setPayoutProofUrl('');
    setPayoutNote(`Disbursed via UniNest Paystack Escrow to ${camp.bankName} (${camp.accountNumber}) for ${camp.category}`);
    setPayoutError(null);
  };

  // Handle Payout File Upload
  const handlePayoutFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPayoutProofName(file.name);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPayoutProofUrl(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Confirm Mark as Paid
  const handleConfirmPayout = () => {
    if (!payoutCampaign) return;
    const amt = Number(payoutAmount);
    if (!amt || amt <= 0) {
      setPayoutError('Please enter a valid payout amount.');
      return;
    }
    if (!payoutProofUrl && !payoutProofName) {
      setPayoutError('Payment proof upload is required (bank transfer slip or receipt).');
      return;
    }

    onMarkCampaignAsPaid(payoutCampaign.id, {
      amount: amt,
      proofUrl: payoutProofUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      proofName: payoutProofName || 'NIBSS_Disbursement_Slip.pdf',
      reference: payoutRef || `ESCROW-${Date.now()}`,
      note: payoutNote
    });

    onAddLog('Marked Campaign as Paid', `Disbursed ₦${amt.toLocaleString()} to ${payoutCampaign.studentName} (${payoutCampaign.bankName}). Proof attached.`);
    setPayoutCampaign(null);
    setActiveSection('disbursed');
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Paystack Escrow Integration Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Paystack Escrow Sub-Account: Active</span>
              <span className="text-slate-500">•</span>
              <span className="font-mono text-slate-300">ACCT_uninest_escrow_0192</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <HeartHandshake className="w-6 h-6 text-orange-400" />
              <span>Crowdfunding &amp; Paystack Escrow Administration</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              Manage student assistance requests, verify academic &amp; STS proofs, govern escrow collections, and disburse verified funds with public proof of payment.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleExportCSV}
              id="btn-export-crowdfund-csv"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
              title="Download full CSV report of all campaigns"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export to CSV</span>
            </button>
          </div>
        </div>

        {/* 4 Escrow Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold">PENDING APPROVALS</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono flex items-center gap-2">
              <span>{pendingCampaigns.length}</span>
              {pendingCampaigns.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                  Action Required
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500">Requires proof verification</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold">LIVE CAMPAIGNS</span>
              <ShieldCheck className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-blue-400 font-mono">
              {liveCampaigns.length}
            </div>
            <p className="text-[10px] text-slate-500">Raising funds on public portal</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold">ESCROW VAULT HELD</span>
              <Lock className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              ₦{activeEscrowHeld.toLocaleString()}
            </div>
            <p className="text-[10px] text-emerald-500">Active donations in Paystack Escrow</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold">TOTAL DISBURSED (PAID)</span>
              <Receipt className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-purple-300 font-mono">
              ₦{totalDisbursedVolume.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-500">{disbursedCampaigns.length} student aids disbursed with proof</p>
          </div>
        </div>
      </div>

      {/* 2. Sub Navigation: Pending / Live / Disbursed */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveSection('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSection === 'pending'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Requests</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              pendingCampaigns.length > 0 ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300'
            }`}>
              {pendingCampaigns.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSection('live')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSection === 'live'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Live Campaigns</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-black">
              {liveCampaigns.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSection('disbursed')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSection === 'disbursed'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Disbursed &amp; Paid Out</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-black">
              {disbursedCampaigns.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search beneficiary, matric, or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* ================= SECTION 1: PENDING REQUESTS TABLE ================= */}
      {activeSection === 'pending' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <span>Pending Crowdfunding Requests</span>
                <span className="text-xs font-normal text-slate-400">({pendingCampaigns.length} awaiting audit)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Review student claims, inspect uploaded institutional invoices, and verify STS savings before approving.
              </p>
            </div>
          </div>

          {pendingCampaigns.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 rounded-3xl border border-slate-800 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="font-bold text-white text-sm">All Pending Requests Reviewed!</p>
              <p className="text-xs text-slate-400">There are no unreviewed crowdfunding requests at this moment.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase tracking-wider font-bold border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Beneficiary Student</th>
                      <th className="px-4 py-3">Institution &amp; Level</th>
                      <th className="px-4 py-3">Cause &amp; Goal</th>
                      <th className="px-4 py-3">Proof &amp; STS</th>
                      <th className="px-4 py-3 text-right">Approval Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {pendingCampaigns.map((camp) => (
                      <tr key={camp.id} className="hover:bg-slate-800/50 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={camp.studentAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(camp.studentName)}`}
                              alt={camp.studentName}
                              referrerPolicy="no-referrer"
                              className="w-8 h-8 rounded-full object-cover border border-slate-700"
                            />
                            <div>
                              <p className="font-bold text-white">{camp.studentName}</p>
                              <p className="text-[11px] text-slate-400">{camp.studentEmail}</p>
                              <p className="text-[10px] text-slate-500">{camp.studentPhone}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-200">{camp.institution}</p>
                          <p className="text-[11px] text-slate-400">{camp.department} • {camp.level}</p>
                          {camp.matricNumber && (
                            <p className="text-[10px] font-mono text-slate-500">Matric: {camp.matricNumber}</p>
                          )}
                        </td>

                        <td className="px-4 py-3 max-w-xs">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-orange-500/20 text-orange-400 border border-orange-500/30">
                            {camp.category}
                          </span>
                          <p className="font-bold text-white mt-1 truncate">{camp.title}</p>
                          <p className="text-[11px] text-emerald-400 font-mono font-bold">Target: ₦{(camp.targetAmount || 0).toLocaleString()}</p>
                        </td>

                        <td className="px-4 py-3 space-y-1">
                          <button
                            onClick={() => setSelectedProofCampaign(camp)}
                            className="px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Inspect Proof File</span>
                          </button>

                          {camp.hasSTSAccount && (
                            <div className="flex items-center gap-1 text-[10px] text-amber-400">
                              <PiggyBank className="w-3 h-3" />
                              <span>STS Saved: ₦{(camp.stsSavingsBalance || 0).toLocaleString()}</span>
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApprove(camp)}
                              id={`btn-approve-cf-${camp.id}`}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1 cursor-pointer"
                              title="Approve and make public on UniNest"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>

                            <button
                              onClick={() => { setRejectingCampaign(camp); setRejectionReason('Insufficient or unverified institutional fee documentation.'); }}
                              id={`btn-reject-cf-${camp.id}`}
                              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                              title="Decline request with reason"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= SECTION 2: LIVE CAMPAIGNS TABLE WITH "MARK AS PAID" ================= */}
      {activeSection === 'live' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-white text-base">Live Active Campaigns ({liveCampaigns.length})</h3>
              <p className="text-xs text-slate-400">
                Active student campaigns raising funds via UniNest Paystack Escrow. Disburse to beneficiary upon goal completion.
              </p>
            </div>
          </div>

          {liveCampaigns.length === 0 ? (
            <div className="p-10 text-center bg-slate-900 rounded-3xl border border-slate-800 space-y-2">
              <ShieldCheck className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="font-bold text-white text-sm">No Live Campaigns Currently Active</p>
              <p className="text-xs text-slate-400">Approve pending requests above to make them live on the student portal.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase tracking-wider font-bold border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Campaign &amp; Student</th>
                      <th className="px-4 py-3">Institution &amp; Bank</th>
                      <th className="px-4 py-3">Target Amount</th>
                      <th className="px-4 py-3">Raised in Escrow</th>
                      <th className="px-4 py-3">Progress</th>
                      <th className="px-4 py-3 text-right">Escrow Payout Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {liveCampaigns.map((camp) => {
                      const percent = Math.min(100, Math.round((camp.currentRaised / camp.targetAmount) * 100));
                      const isFunded = camp.currentRaised >= camp.targetAmount;

                      return (
                        <tr key={camp.id} className="hover:bg-slate-800/50 transition">
                          <td className="px-4 py-3 max-w-xs">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-blue-500/20 text-blue-300">
                              {camp.category}
                            </span>
                            <p className="font-bold text-white mt-1">{camp.title}</p>
                            <p className="text-[11px] text-slate-400">
                              Beneficiary: <strong className="text-slate-200">{camp.studentName}</strong>
                            </p>
                          </td>

                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-200">{camp.institution}</p>
                            <p className="text-[11px] text-slate-400">{camp.bankName} • {camp.accountNumber}</p>
                            <p className="text-[10px] text-slate-500">Name: {camp.accountName}</p>
                          </td>

                          <td className="px-4 py-3 font-mono font-bold text-slate-300">
                            ₦{(camp.targetAmount || 0).toLocaleString()}
                          </td>

                          <td className="px-4 py-3 font-mono font-black text-emerald-400">
                            ₦{(camp.currentRaised || 0).toLocaleString()}
                            <span className="block text-[10px] font-normal text-slate-400 font-sans">
                              {camp.donorsCount} donor{camp.donorsCount === 1 ? '' : 's'}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <div className="w-28 space-y-1">
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="font-mono text-amber-400 font-bold">{percent}%</span>
                                {isFunded && <span className="text-emerald-400 font-bold">100% Goal</span>}
                              </div>
                              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    isFunded ? 'bg-emerald-500' : 'bg-orange-500'
                                  }`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openPayoutModal(camp)}
                                id={`btn-mark-paid-${camp.id}`}
                                className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5 cursor-pointer"
                                title="Upload disbursement proof and mark as paid"
                              >
                                <Receipt className="w-3.5 h-3.5" />
                                <span>Mark as Paid</span>
                              </button>

                              <button
                                onClick={() => setSelectedProofCampaign(camp)}
                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                                title="Inspect Student Proofs"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= SECTION 3: DISBURSED & PAID OUT ARCHIVE ================= */}
      {activeSection === 'disbursed' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base">Disbursed Campaigns Archive ({disbursedCampaigns.length})</h3>
              <p className="text-xs text-slate-400">
                All crowdfunding campaigns that have been officially paid out with proof receipts uploaded.
              </p>
            </div>
          </div>

          {disbursedCampaigns.length === 0 ? (
            <div className="p-10 text-center bg-slate-900 rounded-3xl border border-slate-800 space-y-2">
              <Receipt className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="font-bold text-white text-sm">No Disbursed Campaigns Yet</p>
              <p className="text-xs text-slate-400">Campaigns marked as paid with proof will appear in this audited record.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase tracking-wider font-bold border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Beneficiary &amp; Campaign</th>
                      <th className="px-4 py-3">Destination Bank</th>
                      <th className="px-4 py-3">Disbursed Amount</th>
                      <th className="px-4 py-3">Payout Reference</th>
                      <th className="px-4 py-3">Paid Date</th>
                      <th className="px-4 py-3 text-right">Payment Slip</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {disbursedCampaigns.map((camp) => (
                      <tr key={camp.id} className="hover:bg-slate-800/50 transition">
                        <td className="px-4 py-3">
                          <p className="font-bold text-white">{camp.studentName}</p>
                          <p className="text-[11px] text-slate-400 truncate max-w-xs">{camp.title}</p>
                          <p className="text-[10px] text-slate-500">{camp.institution}</p>
                        </td>

                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-200">{camp.bankName}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{camp.accountNumber}</p>
                          <p className="text-[10px] text-slate-500">{camp.accountName}</p>
                        </td>

                        <td className="px-4 py-3 font-mono font-black text-emerald-400 text-sm">
                          ₦{(camp.paidOutAmount || camp.currentRaised || 0).toLocaleString()}
                        </td>

                        <td className="px-4 py-3 font-mono text-[11px] text-slate-300">
                          {camp.payoutReference || 'ESCROW-PAY-NIBSS'}
                        </td>

                        <td className="px-4 py-3 text-slate-400 text-[11px]">
                          {camp.paidOutAt || 'Aug 20, 2026'}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setViewingDisbursementProof(camp)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs transition flex items-center gap-1.5 ml-auto cursor-pointer"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>View Proof Slip</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL: "MARK AS PAID" WITH UPLOAD FOR PAYMENT PROOF ================= */}
      {payoutCampaign && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-white animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">Disburse Escrow &amp; Mark as Paid</h3>
                  <p className="text-[10px] text-slate-400">Upload official transfer slip for public transparency</p>
                </div>
              </div>
              <button
                onClick={() => setPayoutCampaign(null)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {payoutError && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{payoutError}</span>
              </div>
            )}

            <div className="space-y-4 text-xs">
              {/* Beneficiary Details Pre-filled */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <p className="text-[11px] text-slate-400 font-bold uppercase">Beneficiary Bank Destination:</p>
                <div className="grid grid-cols-2 gap-2 text-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Student:</span>
                    <span className="font-bold">{payoutCampaign.studentName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Institution:</span>
                    <span className="font-semibold truncate block">{payoutCampaign.institution}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Bank Name:</span>
                    <span className="font-bold text-amber-400">{payoutCampaign.bankName || 'Access Bank'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Account Number:</span>
                    <span className="font-mono font-bold text-emerald-400">{payoutCampaign.accountNumber}</span>
                  </div>
                </div>
              </div>

              {/* Payout Amount & Reference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Amount to Disburse (₦ NGN) *
                  </label>
                  <input
                    type="number"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                    required
                  />
                  <span className="text-[10px] text-slate-500">
                    Total Raised in Escrow: ₦{(payoutCampaign.currentRaised || 0).toLocaleString()}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Payment Transfer Reference *
                  </label>
                  <input
                    type="text"
                    value={payoutRef}
                    onChange={(e) => setPayoutRef(e.target.value)}
                    placeholder="e.g. PAY-ESCROW-2026-9041"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                    required
                  />
                </div>
              </div>

              {/* UPLOAD PAYMENT PROOF */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-emerald-400">
                    Upload Payment Proof Receipt (Slip / Confirmation) *
                  </label>
                  <span className="text-[10px] font-black text-emerald-400 uppercase bg-emerald-500/20 px-2 py-0.5 rounded-md">
                    Required
                  </span>
                </div>

                <p className="text-[10px] text-slate-400">
                  Upload screenshot of bank transfer confirmation, NIBSS slip, or Paystack transfer debit advisory.
                </p>

                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handlePayoutFileUpload}
                  className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
                  required
                />

                {payoutProofName && (
                  <p className="text-xs text-emerald-400 font-bold flex items-center gap-1 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Proof file attached: {payoutProofName}</span>
                  </p>
                )}
              </div>

              {/* Disbursement Notes */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Disbursement Notes / Bursary Memo (Optional)
                </label>
                <input
                  type="text"
                  value={payoutNote}
                  onChange={(e) => setPayoutNote(e.target.value)}
                  placeholder="e.g. Disbursed via Access Bank NIBSS directly to student's fee account"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPayoutCampaign(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmPayout}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Payout &amp; Mark as Paid</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: STUDENT PROOF VIEWER ================= */}
      {selectedProofCampaign && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-white">Student Uploaded Proof Documents</h3>
                <p className="text-[11px] text-slate-400">
                  {selectedProofCampaign.studentName} ({selectedProofCampaign.institution})
                </p>
              </div>
              <button
                onClick={() => setSelectedProofCampaign(null)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <p className="font-bold text-amber-400">{selectedProofCampaign.proofDocumentType || 'Institutional Document'}</p>
                <p className="text-[11px] text-slate-300">Filename: {selectedProofCampaign.proofDocumentName || 'verification_doc.pdf'}</p>
              </div>

              {/* Image Preview */}
              <div className="rounded-2xl overflow-hidden border border-slate-800 bg-black max-h-72 flex items-center justify-center">
                <img
                  src={selectedProofCampaign.proofDocumentUrl || 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80'}
                  alt="Proof document"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* STS Proof Statement */}
              {selectedProofCampaign.hasSTSAccount && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <PiggyBank className="w-3.5 h-3.5" />
                    <span>STS Savings Commitment:</span>
                  </p>
                  <p className="text-[11px] text-slate-300">
                    {selectedProofCampaign.stsProofNote || `Student has saved ₦${(selectedProofCampaign.stsSavingsBalance || 0).toLocaleString()} in STS.`}
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedProofCampaign(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs"
                >
                  Close Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: REJECT REASON MODAL ================= */}
      {rejectingCampaign && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Reject Crowdfunding Request</span>
              </h3>
              <button
                onClick={() => setRejectingCampaign(null)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                Provide feedback to <strong>{rejectingCampaign.studentName}</strong> explaining why this campaign cannot be approved at this time:
              </p>

              <div>
                <label className="block font-bold text-slate-400 text-[11px] mb-1">Common Reasons:</label>
                <div className="space-y-1.5">
                  {[
                    'Insufficient or unverified institutional fee documentation.',
                    'Invoice date expired or already cleared by faculty.',
                    'Non-eligible cause under UniNest campus guidelines.',
                    'Duplicate campaign request submitted.'
                  ].map((r, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRejectionReason(r)}
                      className={`w-full text-left p-2 rounded-xl border text-[11px] transition ${
                        rejectionReason === r 
                          ? 'bg-rose-500/20 border-rose-500 text-rose-200' 
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-400 text-[11px] mb-1">Custom Feedback Note:</label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingCampaign(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DISBURSEMENT RECEIPT VIEWER ================= */}
      {viewingDisbursementProof && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-emerald-400">Official Payment Proof Receipt</h3>
                <p className="text-[11px] text-slate-400">Beneficiary: {viewingDisbursementProof.studentName}</p>
              </div>
              <button
                onClick={() => setViewingDisbursementProof(null)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold">Disbursed Amount:</span>
                  <span className="font-mono font-black text-white text-sm">
                    ₦{(viewingDisbursementProof.paidOutAmount || viewingDisbursementProof.currentRaised || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Transfer Reference:</span>
                  <span className="font-mono text-slate-200">{viewingDisbursementProof.payoutReference || 'ESCROW-PAY-NIBSS'}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Destination:</span>
                  <span className="text-slate-200">{viewingDisbursementProof.bankName} ({viewingDisbursementProof.accountNumber})</span>
                </div>
              </div>

              {/* Receipt Image */}
              <div className="rounded-2xl overflow-hidden border border-slate-800 bg-black max-h-72 flex items-center justify-center">
                <img
                  src={viewingDisbursementProof.payoutProofUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80'}
                  alt="Payment receipt slip"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              </div>

              {viewingDisbursementProof.payoutDestinationNote && (
                <p className="text-[11px] text-slate-300 p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <strong>Admin Note:</strong> {viewingDisbursementProof.payoutDestinationNote}
                </p>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setViewingDisbursementProof(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs"
                >
                  Close Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
