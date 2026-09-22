import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Store, 
  Clock, 
  AlertCircle, 
  Search, 
  ExternalLink, 
  Check, 
  X, 
  DollarSign, 
  Building, 
  ShoppingBag,
  Send,
  UserCheck
} from 'lucide-react';
import { UniNestUser, MarketplaceItem, EscrowTransaction } from '../types';

interface VendorVerificationRequest {
  id: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  university: string;
  businessName: string;
  vendorCategory: string;
  submittedAt: string;
  status: 'pending' | 'verified_by_head' | 'rejected';
  stsVendorAccountNumber?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

const INITIAL_VENDOR_REQUESTS: VendorVerificationRequest[] = [];

interface HeadOfMarketplaceModuleProps {
  adminEmail: string;
  onAddLog: (action: string, details?: string) => void;
  users?: UniNestUser[];
}

export const HeadOfMarketplaceModule: React.FC<HeadOfMarketplaceModuleProps> = ({
  adminEmail,
  onAddLog,
  users = []
}) => {
  const [requests, setRequests] = useState<VendorVerificationRequest[]>(INITIAL_VENDOR_REQUESTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'verified' | 'escrow_policy'>('pending');
  const [feedback, setFeedback] = useState<string | null>(null);

  const filteredRequests = requests.filter(r => {
    const matchesSearch = 
      r.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.userEmail.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeSubTab === 'pending') return matchesSearch && r.status === 'pending';
    if (activeSubTab === 'verified') return matchesSearch && r.status === 'verified_by_head';
    return matchesSearch;
  });

  const handleApproveVendor = (reqId: string) => {
    const stsAccNumber = `STS-VND-${Math.floor(100000 + Math.random() * 900000)}`;
    setRequests(prev => prev.map(r => {
      if (r.id === reqId) {
        return {
          ...r,
          status: 'verified_by_head',
          stsVendorAccountNumber: stsAccNumber,
          verifiedAt: new Date().toISOString().slice(0, 10),
          verifiedBy: `Head of Marketplace (${adminEmail})`
        };
      }
      return r;
    }));

    const req = requests.find(r => r.id === reqId);
    if (req) {
      onAddLog(
        'Head of Marketplace Vendor Verification',
        `Awarded Verified Vendor Tick and provisioned ${stsAccNumber} for ${req.businessName} (${req.userEmail})`
      );
      setFeedback(`Success! ${req.businessName} has been verified by Head of Marketplace. Verified Vendor Tick awarded and STS Vendor Account ${stsAccNumber} issued.`);
      setTimeout(() => setFeedback(null), 6000);
    }
  };

  const handleRejectVendor = (reqId: string) => {
    setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'rejected' } : r));
    const req = requests.find(r => r.id === reqId);
    if (req) {
      onAddLog('Rejected Vendor Application', `Declined vendor verification for ${req.businessName}`);
      setFeedback(`Declined verification for ${req.businessName}.`);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Banner */}
      <div className="p-6 rounded-3xl bg-[#0A1931] text-white border-2 border-[#0A1931] shadow-lg space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6A00] text-white text-xs font-black uppercase tracking-wider">
              <Store className="w-3.5 h-3.5" />
              <span>Head of Marketplace Authority</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">
              Vendor Verification &amp; STS Vendor Account Provisioning
            </h2>
            <p className="text-xs text-white/80 leading-relaxed">
              <strong>Mandatory Rule:</strong> Verified Vendor Tick is awarded exclusively after verification is confirmed by the Head of Marketplace. Only verified vendors are given STS Vendor Accounts for payouts.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 border border-white/20 text-xs space-y-1 shrink-0">
            <div className="text-[10px] uppercase font-bold text-[#FF6A00]">Official Escrow Account</div>
            <div className="text-lg font-black font-mono">2150445461</div>
            <div className="text-[11px] text-white/80">United Bank for Africa (UBA)</div>
            <div className="text-[10px] text-[#FF6A00] font-bold">Release: After confirmation or within 3 working days</div>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="p-3.5 rounded-xl bg-[#FFFFFF] text-[#0A1931] font-bold text-xs flex items-center gap-2 border-2 border-[#FF6A00]">
            <CheckCircle2 className="w-4 h-4 text-[#FF6A00] shrink-0" />
            <span>{feedback}</span>
          </div>
        )}
      </div>

      {/* Sub Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#0A1931]/15 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'pending'
                ? 'bg-[#0A1931] text-white shadow-md'
                : 'bg-[#FFFFFF] text-[#0A1931] border border-[#0A1931]/20 hover:bg-[#0A1931]/5'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#FF6A00]" />
            <span>Pending Applications ({requests.filter(r => r.status === 'pending').length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('verified')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'verified'
                ? 'bg-[#0A1931] text-white shadow-md'
                : 'bg-[#FFFFFF] text-[#0A1931] border border-[#0A1931]/20 hover:bg-[#0A1931]/5'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#FF6A00]" />
            <span>Verified Vendors &amp; STS Accounts ({requests.filter(r => r.status === 'verified_by_head').length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('escrow_policy')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'escrow_policy'
                ? 'bg-[#0A1931] text-white shadow-md'
                : 'bg-[#FFFFFF] text-[#0A1931] border border-[#0A1931]/20 hover:bg-[#0A1931]/5'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#FF6A00]" />
            <span>Escrow &amp; 3-Day Rule Policy</span>
          </button>
        </div>

        {activeSubTab !== 'escrow_policy' && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#0A1931]/50 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vendor / email..."
              className="pl-9 pr-3 py-1.5 rounded-xl border border-[#0A1931]/20 text-xs bg-[#FFFFFF] text-[#0A1931] focus:outline-none focus:border-[#FF6A00]"
            />
          </div>
        )}
      </div>

      {/* Content depending on subtab */}
      {activeSubTab === 'escrow_policy' ? (
        <div className="p-6 rounded-3xl bg-[#FFFFFF] border-2 border-[#0A1931]/15 space-y-4 text-[#0A1931]">
          <h3 className="text-lg font-black">Official Marketplace &amp; Escrow Directives</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#0A1931]/5 border border-[#0A1931]/15 space-y-2">
              <div className="font-bold text-sm text-[#FF6A00]">1. Escrow Account Number</div>
              <p className="text-[#0A1931]/80 leading-relaxed">
                All marketplace buyer payments are sent to escrow account number <strong>2150445461</strong> (United Bank for Africa - UBA). Buyers must never transfer funds to personal seller accounts.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0A1931]/5 border border-[#0A1931]/15 space-y-2">
              <div className="font-bold text-sm text-[#FF6A00]">2. 3 Working Days Release</div>
              <p className="text-[#0A1931]/80 leading-relaxed">
                Payments are released to the seller after the buyer confirms receipt and inspection, or automatically within three (3) working days if zero disputes are lodged.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0A1931]/5 border border-[#0A1931]/15 space-y-2">
              <div className="font-bold text-sm text-[#FF6A00]">3. Vendor Verification Tick</div>
              <p className="text-[#0A1931]/80 leading-relaxed">
                Students and vendors can list products on the marketplace, but only registered vendors verified by the Head of Marketplace display the verified tick badge and possess an STS Vendor Account.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="p-8 rounded-3xl bg-[#FFFFFF] border border-[#0A1931]/15 text-center text-[#0A1931]/60 text-xs">
              No vendor applications found in this section.
            </div>
          ) : (
            filteredRequests.map(req => (
              <div 
                key={req.id}
                className="p-5 rounded-2xl bg-[#FFFFFF] border-2 border-[#0A1931]/15 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-[#0A1931]"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-[#0A1931]">{req.businessName}</span>
                    {req.status === 'verified_by_head' ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FF6A00] text-white text-[10px] font-black flex items-center gap-1 shadow-xs">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                        Verified Vendor Tick
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#0A1931]/10 text-[#0A1931] text-[10px] font-bold">
                        Pending Head Review
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-1 text-xs text-[#0A1931]/80">
                    <div><strong>Contact:</strong> {req.userName} ({req.userPhone})</div>
                    <div><strong>Email:</strong> {req.userEmail}</div>
                    <div><strong>Campus:</strong> {req.university}</div>
                    <div><strong>Category:</strong> {req.vendorCategory}</div>
                    <div><strong>Applied Date:</strong> {req.submittedAt}</div>
                    {req.stsVendorAccountNumber && (
                      <div className="text-[#FF6A00] font-black">
                        <strong>STS Vendor Account:</strong> {req.stsVendorAccountNumber}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {req.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleApproveVendor(req.id)}
                        className="px-4 py-2 rounded-xl bg-[#FF6A00] hover:bg-[#E55E00] text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Confirm &amp; Award Vendor Tick + STS Account</span>
                      </button>

                      <button
                        onClick={() => handleRejectVendor(req.id)}
                        className="px-3 py-2 rounded-xl border border-[#0A1931]/20 hover:bg-[#0A1931]/5 text-[#0A1931] font-bold text-xs transition cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                        <span>Decline</span>
                      </button>
                    </>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-[#0A1931] text-white text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#FF6A00]" />
                      <span>Verified by Head • STS Account Active</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
