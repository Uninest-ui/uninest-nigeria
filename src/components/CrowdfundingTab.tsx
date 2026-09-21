import React, { useState } from 'react';
import { 
  HeartHandshake, 
  ShieldCheck, 
  PlusCircle, 
  Search, 
  Sparkles, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  UploadCloud, 
  FileText, 
  Share2, 
  Eye, 
  Lock, 
  PiggyBank, 
  Building2, 
  Clock, 
  Users, 
  ChevronRight, 
  ExternalLink,
  X,
  CreditCard,
  Send,
  HelpCircle,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { CrowdfundingCampaign, CrowdfundingCategory, UniNestUser, STSSavingsAccount } from '../types';
import { NIGERIAN_UNIVERSITIES } from '../data/uninestData';
import { OfficialBankPaymentCard } from './OfficialBankPaymentCard';

interface CrowdfundingTabProps {
  user?: UniNestUser;
  currentUser?: UniNestUser;
  campaigns?: CrowdfundingCampaign[];
  stsSavingsAccount?: STSSavingsAccount;
  onRequestHelp?: (campaignData: Omit<CrowdfundingCampaign, 'id' | 'currentRaised' | 'status' | 'donations' | 'donorsCount' | 'createdAt'>) => void;
  onRequestCampaign?: (campaignData: Omit<CrowdfundingCampaign, 'id' | 'currentRaised' | 'status' | 'donations' | 'donorsCount' | 'createdAt'>) => void;
  onDonate?: (campaignId: string, amount: number | any, donorName?: string, donorEmail?: string, message?: string, isAnonymous?: boolean) => void;
  onDonateToCampaign?: (campaignId: string, donation: { amount: number; donorName: string; donorEmail: string; message?: string; isAnonymous?: boolean }) => void;
}

export const CrowdfundingTab: React.FC<CrowdfundingTabProps> = ({
  user,
  currentUser,
  campaigns = [],
  stsSavingsAccount,
  onRequestHelp,
  onRequestCampaign,
  onDonate,
  onDonateToCampaign
}) => {
  const effectiveUser: UniNestUser = user || currentUser || {
    id: 'student-default',
    name: 'Verified Student',
    email: 'student@campus.edu',
    phone: '08123456789',
    university: 'Niger Delta University (NDU)',
    department: 'Civil Engineering',
    role: 'student',
    roommateProfileComplete: true
  };

  const submitHelpHandler = onRequestHelp || onRequestCampaign || (() => {});

  const [activeSubTab, setActiveSubTab] = useState<'approved' | 'request' | 'my_requests'>('approved');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('all');

  // Request Help Modal / Form State
  const [campaignTitle, setCampaignTitle] = useState('');
  const [category, setCategory] = useState<CrowdfundingCategory>('School Fees & Tuition');
  const [targetAmount, setTargetAmount] = useState('');
  const [story, setStory] = useState('');
  const [institution, setInstitution] = useState(effectiveUser.university || 'Niger Delta University (NDU)');
  const [department, setDepartment] = useState(effectiveUser.department || '');
  const [level, setLevel] = useState('300L');
  const [matricNumber, setMatricNumber] = useState('');
  
  // STS Connection
  const [linkSTS, setLinkSTS] = useState(true);
  const [stsProofNote, setStsProofNote] = useState('');
  const [stsProofFileName, setStsProofFileName] = useState('');
  const [stsProofFileUrl, setStsProofFileUrl] = useState('');

  // Uploaded Proof
  const [proofDocName, setProofDocName] = useState('');
  const [proofDocUrl, setProofDocUrl] = useState('');
  const [proofDocType, setProofDocType] = useState('School Fee Assessment Invoice');
  
  // Bank Account for disbursement
  const [bankName, setBankName] = useState('Access Bank');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState(effectiveUser.name || '');

  // Submission Feedback
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Donate Modal State
  const [selectedCampaignForDonation, setSelectedCampaignForDonation] = useState<CrowdfundingCampaign | null>(null);
  const [donationAmount, setDonationAmount] = useState<number>(5000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donorName, setDonorName] = useState(effectiveUser.name || '');
  const [donorEmail, setDonorEmail] = useState(effectiveUser.email || '');
  const [donorMessage, setDonorMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [paystackStep, setPaystackStep] = useState<'form' | 'processing' | 'success'>('form');
  const [paystackRef, setPaystackRef] = useState('');
  const [donationPaymentChannel, setDonationPaymentChannel] = useState<'bank' | 'paystack'>('bank');

  // Proof Document Viewer Modal
  const [viewingProofCampaign, setViewingProofCampaign] = useState<CrowdfundingCampaign | null>(null);
  const [viewingPayoutReceiptCampaign, setViewingPayoutReceiptCampaign] = useState<CrowdfundingCampaign | null>(null);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);

  // Filter approved campaigns for public showcase
  const approvedCampaigns = (campaigns || []).filter(c => c && (c.status === 'approved' || c.status === 'paid_out'));

  const filteredApprovedCampaigns = approvedCampaigns.filter(c => {
    const matchCategory = selectedCategory === 'all' || c.category === selectedCategory;
    const matchUni = selectedUniversity === 'all' || (c.institution && c.institution.toLowerCase().includes(selectedUniversity.toLowerCase()));
    const matchSearch = !searchQuery.trim() ||
                        (c.title && c.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        (c.studentName && c.studentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        (c.story && c.story.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        (c.department && c.department.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchUni && matchSearch;
  });

  const myCampaigns = (campaigns || []).filter(
    c => c && c.studentEmail && effectiveUser.email && c.studentEmail.toLowerCase() === effectiveUser.email.toLowerCase()
  );

  // Handle Proof Document Upload
  const handleProofFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofDocName(file.name);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setProofDocUrl(uploadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle STS Proof Upload
  const handleSTSFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStsProofFileName(file.name);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setStsProofFileUrl(uploadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Request Help Form Submit
  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];

    const targetNum = Number(targetAmount);
    if (!campaignTitle.trim()) errors.push('Campaign title is required');
    if (!targetNum || targetNum < 5000) errors.push('Minimum target amount is ₦5,000');
    if (!story.trim() || story.trim().length < 40) errors.push('Please provide a detailed explanation of your need (at least 40 characters)');
    if (!accountNumber || accountNumber.length < 10) errors.push('Please enter a valid 10-digit NUBAN bank account number');
    if (!proofDocName && !proofDocUrl) errors.push('Please upload verification proof (e.g. fee invoice, medical note, or project memo)');

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors([]);

    const newCampaignData: Omit<CrowdfundingCampaign, 'id' | 'currentRaised' | 'status' | 'donations' | 'donorsCount' | 'createdAt'> = {
      studentEmail: effectiveUser.email,
      studentName: effectiveUser.name || 'Verified Student',
      studentPhone: effectiveUser.phone || '08000000000',
      studentAvatar: effectiveUser.avatarUrl,
      institution: institution || effectiveUser.university || 'Nigerian University',
      department: department || effectiveUser.department || 'General Studies',
      level: level || '300L',
      matricNumber: matricNumber || 'MAT/2026/001',
      title: campaignTitle.trim(),
      category: category,
      targetAmount: targetNum,
      story: story.trim(),
      hasSTSAccount: linkSTS,
      stsSavingsBalance: linkSTS ? (stsSavingsAccount?.currentBalance || 25000) : 0,
      stsTargetGoal: linkSTS ? (stsSavingsAccount?.targetGoalName || 'Graduation & Project STS') : undefined,
      stsProofNote: stsProofNote.trim() || (linkSTS ? `Committed ₦${(stsSavingsAccount?.currentBalance || 25000).toLocaleString()} through UniNest STS savings.` : undefined),
      stsProofUrl: stsProofFileUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80',
      proofDocumentName: proofDocName || 'Student_Verification_Document.pdf',
      proofDocumentUrl: proofDocUrl || 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
      proofDocumentType: proofDocType,
      bankName: bankName,
      accountNumber: accountNumber,
      accountName: accountName || effectiveUser.name || 'Student Account'
    };

    submitHelpHandler(newCampaignData);

    setSubmitSuccess('Help Request submitted successfully! It has been routed to the UniNest Admin desk for review and proof verification.');
    setActiveSubTab('my_requests');

    // Reset Form
    setCampaignTitle('');
    setTargetAmount('');
    setStory('');
    setProofDocName('');
    setProofDocUrl('');
    setStsProofFileName('');
    setStsProofFileUrl('');
    setStsProofNote('');
    setTimeout(() => setSubmitSuccess(null), 8000);
  };

  // Open Paystack Donation Modal
  const openDonationModal = (campaign: CrowdfundingCampaign) => {
    setSelectedCampaignForDonation(campaign);
    setShowComingSoonModal(true);
  };

  // Execute Paystack Escrow Checkout
  const handleExecutePaystackDonation = () => {
    if (!selectedCampaignForDonation) return;
    const finalAmount = customAmount ? Number(customAmount) : donationAmount;
    if (!finalAmount || finalAmount < 500) {
      alert('Minimum donation amount is ₦500');
      return;
    }

    setPaystackStep('processing');
    const generatedRef = `pstk_escrow_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`;
    setPaystackRef(generatedRef);

    // Simulate Paystack secure gateway tokenization and escrow lock
    setTimeout(() => {
      const donationPayload = {
        amount: finalAmount,
        donorName: isAnonymous ? 'Anonymous Donor' : (donorName || 'Generous Supporter'),
        donorEmail: donorEmail || effectiveUser.email || 'donor@campus.ng',
        message: donorMessage || 'Wishing you academic success and breakthrough!',
        isAnonymous
      };

      if (onDonateToCampaign) {
        onDonateToCampaign(selectedCampaignForDonation.id, donationPayload);
      } else if (onDonate) {
        onDonate(
          selectedCampaignForDonation.id,
          donationPayload,
          donationPayload.donorName,
          donationPayload.donorEmail,
          donationPayload.message,
          donationPayload.isAnonymous
        );
      }
      setPaystackStep('success');
    }, 1600);
  };

  return (
    <div id="uninest-crowdfunding-module" className="space-y-6">
      {/* Service Coming Soon Notice Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
                Service Coming Soon
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-black">
                Escrow Gateway Setup
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              UniNest Student Crowdfunding &amp; Mutual Aid portal is undergoing final institutional compliance and Paystack escrow vault onboarding. <strong>Service coming soon!</strong>
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowComingSoonModal(true)}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shrink-0 cursor-pointer text-center"
        >
          Check Status
        </button>
      </div>

      {/* 1. Header Banner with Paystack Escrow Trust Guarantee */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0a0f1d] via-[#111827] to-[#0a0f1d] text-white p-6 sm:p-8 border border-white/10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>UniNest Student Crowdfunding &amp; Mutual Aid</span>
              <span className="text-white/40">•</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Lock className="w-3 h-3" /> Paystack Escrow Protected
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Support Deserving Students With <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">100% Escrow Accountability</span>
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Every campaign is rigorously audited by UniNest Administration with uploaded proof documents and STS savings commitment. All donations are held in UniNest&apos;s dedicated Paystack Escrow vault and only disbursed upon verified milestone clearance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
            <button
              onClick={() => setActiveSubTab('request')}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-lg shadow-orange-500/20 transition flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Request Student Help</span>
            </button>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Only Admin-Approved Campaigns are Live</span>
            </div>
          </div>
        </div>

        {/* Quick Escrow Trust Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold shrink-0">1</div>
            <div>
              <p className="font-bold text-white text-[11px]">Upload Proof &amp; STS</p>
              <p className="text-[10px] text-slate-400">Bills &amp; STS proof required</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold shrink-0">2</div>
            <div>
              <p className="font-bold text-white text-[11px]">Admin Approval</p>
              <p className="text-[10px] text-slate-400">Strict verification gate</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold shrink-0">3</div>
            <div>
              <p className="font-bold text-white text-[11px]">Paystack Escrow</p>
              <p className="text-[10px] text-slate-400">Locked in escrow vault</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold shrink-0">4</div>
            <div>
              <p className="font-bold text-white text-[11px]">Disbursed with Proof</p>
              <p className="text-[10px] text-slate-400">Public transfer receipt</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Success Alert */}
      {submitSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">{submitSuccess}</p>
            <p className="text-[11px] text-emerald-700">
              You can track the progress and status under the <strong>&quot;My Aid Requests&quot;</strong> tab below.
            </p>
          </div>
        </div>
      )}

      {/* 3. Sub Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('approved')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'approved'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Public Live Campaigns</span>
            <span className="px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px]">
              {approvedCampaigns.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('request')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'request'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Request Help Form</span>
          </button>

          <button
            onClick={() => setActiveSubTab('my_requests')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'my_requests'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>My Aid Requests</span>
            {myCampaigns.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px]">
                {myCampaigns.length}
              </span>
            )}
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Paystack Merchant: #UNINEST-ESCROW-01</span>
        </div>
      </div>

      {/* ================= VIEW 1: PUBLIC APPROVED CAMPAIGNS WITH PROGRESS BARS ================= */}
      {activeSubTab === 'approved' && (
        <div className="space-y-6">
          {/* Filters and Search Bar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-5 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search by student name, cause, school or course..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500 bg-slate-50/50"
                />
              </div>

              <div className="sm:col-span-4">
                <select
                  value={selectedUniversity}
                  onChange={(e) => setSelectedUniversity(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500 bg-slate-50/50"
                >
                  <option value="all">All Tertiary Institutions</option>
                  <option value="NDU">Niger Delta University (NDU)</option>
                  <option value="BMU">Bayelsa Medical University (BMU)</option>
                  <option value="FUOTUOKE">Federal University Otuoke</option>
                  <option value="UNIPORT">University of Port Harcourt (UNIPORT)</option>
                  <option value="RSU">Rivers State University (RSU)</option>
                  <option value="DELSU">Delta State University (DELSU)</option>
                  <option value="UAT">University of Africa, Toru-Orua</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500 bg-slate-50/50"
                >
                  <option value="all">All Cause Categories</option>
                  <option value="School Fees & Tuition">School Fees &amp; Tuition</option>
                  <option value="Final Year Project">Final Year Project</option>
                  <option value="Medical & Emergency">Medical &amp; Emergency</option>
                  <option value="Hostel & Accommodation">Hostel &amp; Accommodation</option>
                  <option value="Laptop & Study Equipment">Laptop &amp; Equipment</option>
                  <option value="Exam Handouts & Clearance">Exam Clearance</option>
                </select>
              </div>
            </div>
          </div>

          {/* Campaign Cards Grid */}
          {filteredApprovedCampaigns.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mx-auto">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">No Approved Campaigns Match Your Filters</h3>
              <p className="text-slate-500 text-xs max-w-md mx-auto">
                Try clearing your search query or selecting &quot;All Categories&quot;. New campaigns are published once approved by the UniNest admin desk.
              </p>
              <button
                onClick={() => { setSelectedCategory('all'); setSelectedUniversity('all'); setSearchQuery(''); }}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredApprovedCampaigns.map((campaign) => {
                const percent = Math.min(100, Math.round((campaign.currentRaised / campaign.targetAmount) * 100));
                const isFullyFunded = campaign.currentRaised >= campaign.targetAmount;
                const isPaidOut = campaign.status === 'paid_out';

                return (
                  <div
                    key={campaign.id}
                    className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition duration-300 flex flex-col justify-between overflow-hidden group"
                  >
                    <div>
                      {/* Card Top Category & Campus Bar */}
                      <div className="p-5 pb-3 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-orange-50 text-orange-700 border border-orange-200">
                            {campaign.category}
                          </span>

                          {isPaidOut ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Disbursed / Paid Out
                            </span>
                          ) : isFullyFunded ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-teal-100 text-teal-800 border border-teal-300">
                              <CheckCircle2 className="w-3 h-3 text-teal-600" />
                              100% Funded
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <ShieldCheck className="w-3 h-3 text-blue-600" />
                              Admin Verified
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-orange-600 transition">
                          {campaign.title}
                        </h3>

                        {/* Student Beneficiary Info */}
                        <div className="flex items-center gap-3 pt-1">
                          <img
                            src={campaign.studentAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(campaign.studentName)}`}
                            alt={campaign.studentName}
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 rounded-full object-cover border border-slate-200"
                          />
                          <div className="text-xs">
                            <p className="font-bold text-slate-900 flex items-center gap-1">
                              <span>{campaign.studentName}</span>
                              <ShieldCheck className="w-3 h-3 text-emerald-600" title="Verified Student" />
                            </p>
                            <p className="text-[11px] text-slate-500 truncate max-w-[200px]">
                              {campaign.institution} • {campaign.department}
                            </p>
                          </div>
                        </div>

                        {/* STS Connection Tag */}
                        {campaign.hasSTSAccount && (
                          <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                            <PiggyBank className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <p className="font-bold text-amber-950">Verified STS Saver Commitment</p>
                              <p className="text-[10px] text-amber-800">
                                Student has saved <strong>₦{(campaign.stsSavingsBalance || 0).toLocaleString()}</strong> in their STS account towards this goal.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Story Excerpt */}
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                          {campaign.story}
                        </p>
                      </div>

                      {/* Proof Documents preview trigger */}
                      <div className="px-5 pb-2">
                        <button
                          onClick={() => setViewingProofCampaign(campaign)}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Verified Proof Document ({campaign.proofDocumentType || 'Invoice/Memo'})</span>
                          <Eye className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar & Donation Bottom Footer */}
                    <div className="p-5 pt-3 bg-slate-50/80 border-t border-slate-100 space-y-3">
                      {/* Financial Progress Numbers */}
                      <div className="space-y-1.5">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="text-lg font-black text-slate-900">₦{(campaign.currentRaised || 0).toLocaleString()}</span>
                            <span className="text-xs text-slate-500 font-medium ml-1">raised of ₦{(campaign.targetAmount || 0).toLocaleString()}</span>
                          </div>
                          <span className="text-xs font-extrabold text-orange-600 font-mono">{percent}%</span>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              isPaidOut 
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                                : isFullyFunded
                                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500'
                                  : 'bg-gradient-to-r from-orange-500 to-amber-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-slate-400" />
                            <strong>{campaign.donorsCount}</strong> supporter{campaign.donorsCount === 1 ? '' : 's'}
                          </span>
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> UniNest Escrow
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-1 flex items-center gap-2">
                        {isPaidOut ? (
                          <button
                            onClick={() => setViewingPayoutReceiptCampaign(campaign)}
                            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>View Disbursement Proof</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => openDonationModal(campaign)}
                            className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-600/20 transition flex items-center justify-center gap-1.5 cursor-pointer transform hover:-translate-y-0.5"
                          >
                            <HeartHandshake className="w-3.5 h-3.5" />
                            <span>Donate via Paystack</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (navigator.share) {
                              navigator.share({
                                title: campaign.title,
                                text: `Please support ${campaign.studentName}'s verified campaign on UniNest: ${campaign.title}`,
                                url: window.location.href
                              }).catch(() => {});
                            } else {
                              navigator.clipboard.writeText(`${window.location.href} - Help ${campaign.studentName}: ${campaign.title}`);
                              alert('Campaign link copied to clipboard!');
                            }
                          }}
                          className="p-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition cursor-pointer"
                          title="Share Campaign"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= VIEW 2: "REQUEST HELP" FORM WITH UPLOAD FOR PROOF AND STS ================= */}
      {activeSubTab === 'request' && (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="space-y-1 pb-3 border-b border-slate-200">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold">
              <PlusCircle className="w-3.5 h-3.5 text-orange-600" />
              <span>Student Aid Application Desk</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Apply for Verified Student Crowdfunding
            </h2>
            <p className="text-xs text-slate-500">
              Submit your educational need along with authentic institutional proof and your STS savings commitment. Our administration verifies all documents within 24 hours before launching your public live campaign.
            </p>
          </div>

          {formErrors.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Please correct the following:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-rose-700 pl-1">
                {formErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleRequestSubmit} className="space-y-5">
            {/* 1. Academic Affiliation */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-orange-500" />
                <span>1. Academic Verification Details</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Tertiary Institution *
                  </label>
                  <select
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    {NIGERIAN_UNIVERSITIES.map((uni) => (
                      <option key={uni} value={uni}>{uni}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Department &amp; Faculty *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Civil Engineering, Faculty of Tech"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Current Level *
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="100L">100L (Freshman)</option>
                    <option value="200L">200L</option>
                    <option value="300L">300L</option>
                    <option value="400L">400L (Penultimate / Finalist)</option>
                    <option value="Final Year (500L)">Final Year (500L)</option>
                    <option value="Postgraduate / Masters">Postgraduate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Matriculation / Registration Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NDU/2021/ENG/0491"
                    value={matricNumber}
                    onChange={(e) => setMatricNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* 2. Campaign Cause & Funding Goal */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Urgent Tuition Clearance for Final Year Degree Examinations"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Primary Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CrowdfundingCategory)}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="School Fees & Tuition">School Fees &amp; Tuition Clearance</option>
                    <option value="Final Year Project">Final Year Project &amp; Thesis Materials</option>
                    <option value="Medical & Emergency">Medical &amp; Emergency Health Bills</option>
                    <option value="Hostel & Accommodation">Hostel &amp; Accommodation Eviction</option>
                    <option value="Laptop & Study Equipment">Laptop &amp; Tech Study Equipment</option>
                    <option value="Exam Handouts & Clearance">Exam Clearance &amp; Textbooks</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Funding Target Amount (in ₦ NGN) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">₦</span>
                    <input
                      type="number"
                      placeholder="e.g. 150000"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      className="w-full pl-8 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 font-mono"
                      min="5000"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Minimum target is ₦5,000.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Detailed Story &amp; Context *
                </label>
                <textarea
                  rows={4}
                  placeholder="Explain why you need help, what happened, the deadline, and how this funding will help you complete your studies..."
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            </div>

            {/* 3. STS (Save Till Sign-Out) Commitment Link */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PiggyBank className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-bold text-slate-900">2. Link Your STS Savings Commitment</span>
                </div>
                <label className="flex items-center gap-2 text-xs font-bold text-orange-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={linkSTS}
                    onChange={(e) => setLinkSTS(e.target.checked)}
                    className="rounded-sm text-orange-600 focus:ring-orange-500"
                  />
                  <span>Attach STS Verification</span>
                </label>
              </div>

              <p className="text-[11px] text-slate-600">
                Donors trust campaigns where the student has actively contributed personal savings into UniNest STS. Your active STS balance of <strong>₦{(stsSavingsAccount?.currentBalance || 0).toLocaleString()}</strong> will be verified and tagged with a &quot;Verified STS Saver&quot; trust badge.
              </p>

              {linkSTS && (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      STS Note / Personal Contribution Statement
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. I have saved ₦45,000 towards clearance. Seeking community support for the remaining balance."
                      value={stsProofNote}
                      onChange={(e) => setStsProofNote(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-amber-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Upload STS Balance Screenshot / Passbook (Optional)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleSTSFileUpload}
                        className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-600 file:text-white hover:file:bg-amber-700 cursor-pointer"
                      />
                      {stsProofFileName && (
                        <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {stsProofFileName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Upload Proof of Need (MANDATORY FOR ADMIN APPROVAL) */}
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-900">3. Upload Proof of Need (Required for Admin Approval)</span>
                </div>
                <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                  Mandatory Audit
                </span>
              </div>

              <p className="text-[11px] text-slate-600">
                Upload official documentation supporting your claim: school bursary invoice, course registration slip, medical hospital referral, HOD project recommendation memo, or landlord eviction notice.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Document Classification *
                  </label>
                  <select
                    value={proofDocType}
                    onChange={(e) => setProofDocType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-blue-200 bg-white"
                  >
                    <option value="School Fee Assessment Invoice">School Fee Assessment Invoice</option>
                    <option value="Project Topic Approval Memo">Project Topic Approval Memo / Bill</option>
                    <option value="Medical Diagnostic & Treatment Bill">Medical Diagnostic &amp; Treatment Bill</option>
                    <option value="Landlord Notice to Quit & Tenancy">Landlord Notice to Quit &amp; Tenancy</option>
                    <option value="Technician Hardware Repair Bill">Technician Hardware Repair Bill</option>
                    <option value="Departmental Handout Assessment">Departmental Handout Assessment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Upload Document File (.PDF or Image) *
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleProofFileUpload}
                    className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer w-full"
                    required
                  />
                  {proofDocName && (
                    <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1 mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Uploaded: {proofDocName}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 5. Beneficiary Bank Details for Escrow Disbursement */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>4. Bank Account for Direct Escrow Disbursement</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Bank Name *
                  </label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Access Bank">Access Bank</option>
                    <option value="GTBank">Guaranty Trust Bank (GTBank)</option>
                    <option value="Zenith Bank">Zenith Bank</option>
                    <option value="First Bank">First Bank of Nigeria</option>
                    <option value="UBA">United Bank for Africa (UBA)</option>
                    <option value="Kuda Bank">Kuda Microfinance Bank</option>
                    <option value="OPay">OPay Digital Services</option>
                    <option value="Palmpay">Palmpay</option>
                    <option value="Fidelity Bank">Fidelity Bank</option>
                    <option value="Sterling Bank">Sterling Bank</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    10-Digit NUBAN Account Number *
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="0123456789"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Account Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Account Name on Bank App"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submission Actions */}
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setActiveSubTab('approved')}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-lg shadow-orange-500/20 transition flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Request to Admin for Review</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= VIEW 3: "MY AID REQUESTS" (STATUS TRACKER) ================= */}
      {activeSubTab === 'my_requests' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-base">
              My Submitted Crowdfunding Requests ({myCampaigns.length})
            </h3>
            <button
              onClick={() => setActiveSubTab('request')}
              className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Request</span>
            </button>
          </div>

          {myCampaigns.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
              <Clock className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="font-bold text-slate-800 text-sm">You haven&apos;t submitted any aid requests yet.</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Need help with tuition fees, final year projects, or hostel eviction? Submit a verified request to launch your campaign.
              </p>
              <button
                onClick={() => setActiveSubTab('request')}
                className="px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold"
              >
                Create First Request
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myCampaigns.map((camp) => {
                const percent = Math.min(100, Math.round((camp.currentRaised / camp.targetAmount) * 100));

                return (
                  <div
                    key={camp.id}
                    className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-orange-600">{camp.category}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-500">Submitted on {camp.createdAt}</span>
                        </div>
                        <h4 className="font-black text-slate-900 text-base mt-0.5">{camp.title}</h4>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {camp.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
                            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                            Pending Admin Review
                          </span>
                        )}
                        {camp.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Approved &amp; Live Publicly
                          </span>
                        )}
                        {camp.status === 'paid_out' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                            Disbursed / Paid with Proof
                          </span>
                        )}
                        {camp.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                            Declined by Admin
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-500 block text-[11px]">Funding Target</span>
                        <span className="font-black text-slate-900 text-sm font-mono">₦{(camp.targetAmount || 0).toLocaleString()}</span>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-500 block text-[11px]">Amount Raised in Escrow</span>
                        <span className="font-black text-emerald-600 text-sm font-mono">₦{(camp.currentRaised || 0).toLocaleString()} ({percent}%)</span>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-500 block text-[11px]">Supporters / Donors</span>
                        <span className="font-black text-slate-900 text-sm">{camp.donorsCount} Donors</span>
                      </div>
                    </div>

                    {/* Payout Details if Paid Out */}
                    {camp.isPaidOut && (
                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <p className="font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Funds Disbursed to {camp.bankName} ({camp.accountNumber})</span>
                          </p>
                          <p className="text-[11px] text-emerald-800">
                            Reference: <strong>{camp.payoutReference || 'ESCROW-PAY-NIBSS'}</strong> • Paid: {camp.paidOutAt}
                          </p>
                        </div>
                        <button
                          onClick={() => setViewingPayoutReceiptCampaign(camp)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition shrink-0"
                        >
                          View Official Receipt
                        </button>
                      </div>
                    )}

                    {/* Rejection reason if rejected */}
                    {camp.status === 'rejected' && camp.rejectionReason && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                        <strong>Admin Feedback:</strong> {camp.rejectionReason}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL: PAYSTACK ESCROW DONATION MODAL ================= */}
      {selectedCampaignForDonation && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                  ₦
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Paystack Escrow Donation</h3>
                  <p className="text-[10px] text-slate-500">Secured via UniNest Institutional Escrow</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCampaignForDonation(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {paystackStep === 'form' && (
              <div className="space-y-4 text-xs">
                {/* Beneficiary Summary */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <p className="text-[11px] text-slate-500">Supporting Student Beneficiary:</p>
                  <p className="font-bold text-slate-900 text-sm">{selectedCampaignForDonation.studentName}</p>
                  <p className="text-[11px] text-slate-600 truncate">{selectedCampaignForDonation.title}</p>
                </div>

                {/* Preset Amount Chips */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700 text-xs">Select Contribution Amount (NGN)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[1000, 2500, 5000, 10000, 20000, 50000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => { setDonationAmount(amt); setCustomAmount(''); }}
                        className={`py-2 rounded-xl font-bold text-xs border transition cursor-pointer ${
                          !customAmount && donationAmount === amt
                            ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        ₦{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount */}
                <div>
                  <label className="block font-bold text-slate-700 text-[11px] mb-1">Or Enter Custom Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 font-bold text-slate-400">₦</span>
                    <input
                      type="number"
                      placeholder="e.g. 15000"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border border-slate-200 font-mono"
                    />
                  </div>
                </div>

                {/* Donor Details */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 text-[11px]">Your Display Name</label>
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="rounded-sm text-orange-600"
                      />
                      <span>Donate Anonymously</span>
                    </label>
                  </div>
                  {!isAnonymous && (
                    <input
                      type="text"
                      placeholder="Your name or organization"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 text-[11px] mb-1">Words of Encouragement (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Keep pushing, we are proud of you!"
                    value={donorMessage}
                    onChange={(e) => setDonorMessage(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>

                {/* Payment Channel Selector */}
                <div className="space-y-2">
                  <label className="block font-bold text-slate-700 text-xs">
                    Choose Donation Payment Channel
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDonationPaymentChannel('bank')}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition text-left cursor-pointer ${
                        donationPaymentChannel === 'bank'
                          ? 'bg-orange-50 border-orange-500 text-orange-950 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-extrabold text-[12px]">Direct Bank (UBA)</div>
                      <div className="text-[10px] text-slate-500">Manual transfer + WhatsApp verification</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDonationPaymentChannel('paystack')}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition text-left cursor-pointer ${
                        donationPaymentChannel === 'paystack'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-extrabold text-[12px]">Paystack Gateway</div>
                      <div className="text-[10px] text-slate-500">Debit card / USSD checkout</div>
                    </button>
                  </div>
                </div>

                {donationPaymentChannel === 'bank' ? (
                  <div className="pt-1">
                    <OfficialBankPaymentCard
                      amount={customAmount ? Number(customAmount) : donationAmount}
                      purpose={`Emergency Crowdfunding Donation: ${selectedCampaignForDonation.title} (Beneficiary: ${selectedCampaignForDonation.studentName})`}
                      studentName={isAnonymous ? 'Anonymous Donor' : (donorName || effectiveUser.name)}
                      studentEmail={donorEmail || effectiveUser.email}
                      studentPhone={effectiveUser.phone}
                      university={selectedCampaignForDonation.institution}
                      showCardTitle={false}
                      onPaymentSubmitted={() => {
                        const finalAmt = customAmount ? Number(customAmount) : donationAmount;
                        if (onDonate) {
                          onDonate(
                            selectedCampaignForDonation.id,
                            finalAmt,
                            isAnonymous ? 'Anonymous Donor' : donorName,
                            donorEmail,
                            donorMessage,
                            isAnonymous
                          );
                        } else if (onDonateToCampaign) {
                          onDonateToCampaign(selectedCampaignForDonation.id, {
                            amount: finalAmt,
                            donorName: isAnonymous ? 'Anonymous Donor' : donorName,
                            donorEmail,
                            message: donorMessage,
                            isAnonymous
                          });
                        }
                        setPaystackStep('success');
                      }}
                    />
                  </div>
                ) : (
                  <>
                    {/* Paystack Guarantee */}
                    <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-[11px] text-emerald-900 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>UniNest Paystack Escrow Subaccount #0192</span>
                      </div>
                      <p className="text-[10px] text-emerald-800">
                        Funds are isolated safely in escrow until the student&apos;s educational milestones are certified by UniNest.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleExecutePaystackDonation}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>
                        Proceed to Pay ₦{(customAmount ? Number(customAmount) : donationAmount).toLocaleString()} via Paystack
                      </span>
                    </button>
                  </>
                )}
              </div>
            )}

            {paystackStep === 'processing' && (
              <div className="py-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Connecting to Paystack Secure Gateway...</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Locking ₦{(customAmount ? Number(customAmount) : donationAmount).toLocaleString()} into UniNest Escrow Subaccount.
                  </p>
                </div>
              </div>
            )}

            {paystackStep === 'success' && (
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-slate-900 text-base">Donation Deposited into Escrow!</h4>
                  <p className="text-xs text-slate-600">
                    Thank you! Your donation has been recorded and credited to <strong>{selectedCampaignForDonation.studentName}</strong>.
                  </p>
                  <p className="text-[11px] font-mono text-slate-400 pt-1">
                    Ref: {paystackRef}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCampaignForDonation(null)}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL: PROOF DOCUMENT VIEWER ================= */}
      {viewingProofCampaign && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Official Proof of Need Document</h3>
                <p className="text-[11px] text-slate-500">Verified by UniNest Administration</p>
              </div>
              <button
                onClick={() => setViewingProofCampaign(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900">
                <p className="font-bold">{viewingProofCampaign.proofDocumentType || 'Institutional Document'}</p>
                <p className="text-[11px] text-blue-700">File: {viewingProofCampaign.proofDocumentName || 'document.pdf'}</p>
              </div>

              {/* Document Image Preview */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 max-h-80 flex items-center justify-center">
                <img
                  src={viewingProofCampaign.proofDocumentUrl || 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80'}
                  alt="Proof Document"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* STS Proof if available */}
              {viewingProofCampaign.hasSTSAccount && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-1 text-[11px] text-amber-900">
                  <p className="font-bold flex items-center gap-1.5">
                    <PiggyBank className="w-3.5 h-3.5 text-amber-600" />
                    <span>STS Savings Passbook Verification:</span>
                  </p>
                  <p>{viewingProofCampaign.stsProofNote || `Verified student savings balance of ₦${(viewingProofCampaign.stsSavingsBalance || 0).toLocaleString()}.`}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-500">Beneficiary: {viewingProofCampaign.studentName} ({viewingProofCampaign.institution})</span>
                <button
                  onClick={() => setViewingProofCampaign(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
                >
                  Close Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DISBURSEMENT PAYMENT PROOF VIEWER ================= */}
      {viewingPayoutReceiptCampaign && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Escrow Disbursement Receipt &amp; Proof</h3>
                <p className="text-[10px] text-emerald-600 font-bold">100% Verified Payment to Beneficiary</p>
              </div>
              <button
                onClick={() => setViewingPayoutReceiptCampaign(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold">Amount Disbursed:</span>
                  <span className="font-black text-sm font-mono text-emerald-700">
                    ₦{(viewingPayoutReceiptCampaign.paidOutAmount || viewingPayoutReceiptCampaign.currentRaised || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-emerald-800">
                  <span>Transfer Ref:</span>
                  <span className="font-mono">{viewingPayoutReceiptCampaign.payoutReference || 'ESCROW-PAY-NIBSS-9941'}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-emerald-800">
                  <span>Paid on:</span>
                  <span>{viewingPayoutReceiptCampaign.paidOutAt || 'Aug 20, 2026'}</span>
                </div>
              </div>

              {/* Uploaded Payment Proof Slip */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 max-h-80 flex items-center justify-center">
                <img
                  src={viewingPayoutReceiptCampaign.payoutProofUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80'}
                  alt="Payment Proof Receipt"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              </div>

              {viewingPayoutReceiptCampaign.payoutDestinationNote && (
                <p className="text-[11px] text-slate-600 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <strong>Admin Note:</strong> {viewingPayoutReceiptCampaign.payoutDestinationNote}
                </p>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setViewingPayoutReceiptCampaign(null)}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
                >
                  Close Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Coming Soon Modal */}
      {showComingSoonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 text-center space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
              <Clock className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider border border-amber-200">
                Service Notice
              </span>
              <h3 className="text-xl font-black text-slate-900">
                Service Coming Soon
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed pt-1">
                Student Crowdfunding &amp; Mutual Aid service is currently finalizing its Paystack escrow compliance to guarantee 100% fraud-free student disbursements. <strong>Service coming soon!</strong>
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 text-left space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>What will be supported at launch:</span>
              </div>
              <ul className="list-disc list-inside text-amber-800 space-y-0.5 pl-1">
                <li>Verified institutional bill and tuition requests</li>
                <li>Hostel accommodation emergency aid</li>
                <li>Final year project kit crowdfunding</li>
                <li>Zero-loss Paystack escrow vault security</li>
              </ul>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowComingSoonModal(false)}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-md cursor-pointer"
              >
                Okay, Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
