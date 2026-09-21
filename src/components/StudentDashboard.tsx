import React, { useState } from 'react';
import { 
  Home, 
  BookOpen, 
  GraduationCap, 
  LogOut, 
  MessageSquare, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  ShieldCheck, 
  Bell, 
  Sparkles, 
  User, 
  Send, 
  Building, 
  PhoneCall, 
  Share2, 
  Filter, 
  Check,
  PiggyBank,
  Users,
  ShoppingBag,
  Wifi,
  Zap,
  ArrowRight,
  Store,
  BellRing,
  Star,
  HelpCircle,
  Gift,
  HeartHandshake,
  Award,
  Wallet,
  Compass,
  Layers,
  Clock,
  Briefcase,
  Copy,
  UserCheck,
  X,
  MessageCircle,
  Phone,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  PlusCircle,
  ArrowUpRight,
  Headphones,
  CreditCard
} from 'lucide-react';
import { UNINEST_OFFICIAL_BANK, generatePaymentConfirmationWhatsAppUrl } from '../utils/paymentConfig';
import { CampusJobsTab } from './CampusJobsTab';
import { 
  UniNestUser, 
  STSAccount, 
  STSSavingsAccount, 
  NewsItem, 
  ChatMessage,
  BayelsaRoommateProfile,
  AccommodationListing,
  AcademicAssistRequest,
  MarketplaceItem,
  EscrowTransaction,
  DataPlan,
  DataOrder,
  VerifiedBusiness,
  BusinessReview,
  StudentTestimonial,
  PhoneNotificationItem,
  FAQItem,
  StudentGift,
  StudentQuestion,
  QuestionAnswer,
  CrowdfundingCampaign
} from '../types';
import { UniNestLogo } from './UniNestLogo';
import { STSSavingsTab } from './STSSavingsTab';
import { BayelsaHousingTab } from './BayelsaHousingTab';
import { AcademicAssistTab } from './AcademicAssistTab';
import { MarketplaceEscrowTab } from './MarketplaceEscrowTab';
import { CheapDataTab } from './CheapDataTab';
import { UserProfileModal } from './UserProfileModal';
import { CampusTickerMarquee } from './CampusTickerMarquee';
import { VerifiedBusinessesTab } from './VerifiedBusinessesTab';
import { CampusPhoneNotifications } from './CampusPhoneNotifications';
import { FAQSection } from './FAQSection';
import { InterUniversityQAHub } from './InterUniversityQAHub';
import { CrowdfundingTab } from './CrowdfundingTab';
import { ScoutCommissionDashboard } from './ScoutCommissionDashboard';
import { HireAScoutComingSoonTab } from './HireAScoutComingSoonTab';
import { StudentWalletTab } from './StudentWalletTab';
import { CrossCampusMapTab } from './CrossCampusMapTab';
import { DarkModeToggle } from './DarkModeToggle';
import { StudentSupportDeskTab } from './StudentSupportDeskTab';
import happyNigerianStudentImg from '../assets/images/uninest_brand_rep_1789411622796.jpg';

interface StudentDashboardProps {
  user: UniNestUser;
  onUpdateUser: (updatedUser: UniNestUser, originalEmail?: string) => void;
  stsAccount?: STSAccount;
  stsSavingsAccount?: STSSavingsAccount;
  roommates: BayelsaRoommateProfile[];
  accommodations: AccommodationListing[];
  academicRequests: AcademicAssistRequest[];
  marketplaceItems: MarketplaceItem[];
  escrowTransactions: EscrowTransaction[];
  dataOrders: DataOrder[];
  news: NewsItem[];
  crowdfundingCampaigns?: CrowdfundingCampaign[];
  onLogout: () => void;
  onDepositSTS: (amount: number, desc: string) => void;
  onRequestSTSLoan: (amount: number, purpose: string, duration: number) => void;
  onRepaySTSLoan: (amount: number) => void;
  onRequestRoommate: (profile: Omit<BayelsaRoommateProfile, 'id'>) => void;
  onSubmitAcademicRequest: (req: Omit<AcademicAssistRequest, 'id' | 'createdAt'>) => void;
  onPostMarketplaceItem: (item: Omit<MarketplaceItem, 'id' | 'postedAt'>) => void;
  onInitiateEscrow: (item: MarketplaceItem) => void;
  onReleaseEscrow: (escrowId: string) => void;
  onRelistMarketplaceItem?: (itemId: string) => void;
  onBuyData: (network: DataPlan['network'], plan: DataPlan, phone: string) => void;
  isSubscribedNewsletter: boolean;
  onSubscribeNewsletter: (email: string) => void;
  onRequestCrowdfundingHelp?: (data: Omit<CrowdfundingCampaign, 'id' | 'createdAt' | 'currentRaised' | 'donorsCount' | 'status' | 'donations'>) => void;
  onDonateToCampaign?: (campaignId: string, donation: { amount: number; donorName: string; donorEmail: string; message?: string; isAnonymous?: boolean }) => void;
  verifiedBusinesses?: VerifiedBusiness[];
  onAddVerifiedBusiness?: (biz: Omit<VerifiedBusiness, 'id' | 'isVerified' | 'rating' | 'reviewsCount' | 'reviews' | 'createdAt'>) => void;
  onAddBusinessReview?: (businessId: string, review: Omit<BusinessReview, 'id' | 'date'>) => void;
  testimonials?: StudentTestimonial[];
  onAddTestimonial?: (testimonial: Omit<StudentTestimonial, 'id' | 'date' | 'verifiedStudent'>) => void;
  phoneNotifications?: PhoneNotificationItem[];
  onMarkPhoneNotificationAsRead?: (id: string) => void;
  onSendPhoneNotification?: (notif: Omit<PhoneNotificationItem, 'id' | 'timeAgo' | 'date' | 'isRead'>) => void;
  subscribers?: string[];
  faqs?: FAQItem[];
  onGiftStudent?: (gift: Omit<StudentGift, 'id' | 'date'>) => void;
  onWithdrawSTS?: (amount: number, bankName: string, accNumber: string, accName: string, reason: string) => void;
  studentQuestions?: StudentQuestion[];
  onAddQuestion?: (question: Omit<StudentQuestion, 'id' | 'answersCount' | 'createdAt' | 'status' | 'answers'>) => void;
  onAddAnswer?: (questionId: string, answer: Omit<QuestionAnswer, 'id' | 'createdAt' | 'upvotes'>) => void;
  onUpvoteAnswer?: (questionId: string, answerId: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  onUpdateUser,
  stsAccount,
  stsSavingsAccount,
  roommates,
  accommodations,
  academicRequests,
  marketplaceItems,
  escrowTransactions,
  dataOrders,
  news,
  onLogout,
  onDepositSTS,
  onRequestSTSLoan,
  onRepaySTSLoan,
  onRequestRoommate,
  onSubmitAcademicRequest,
  onPostMarketplaceItem,
  onInitiateEscrow,
  onReleaseEscrow,
  onRelistMarketplaceItem,
  onBuyData,
  isSubscribedNewsletter,
  onSubscribeNewsletter,
  crowdfundingCampaigns = [],
  onRequestCrowdfundingHelp = (_data: any) => {},
  onDonateToCampaign = (_campaignId: string, _donation: { amount: number; donorName: string; donorEmail: string; message?: string; isAnonymous?: boolean }) => {},
  verifiedBusinesses = [],
  onAddVerifiedBusiness = () => {},
  onAddBusinessReview = () => {},
  testimonials = [],
  onAddTestimonial = () => {},
  phoneNotifications = [],
  onMarkPhoneNotificationAsRead = () => {},
  onSendPhoneNotification = () => {},
  subscribers = [],
  faqs = [],
  onGiftStudent,
  onWithdrawSTS,
  studentQuestions = [],
  onAddQuestion = () => {},
  onAddAnswer = () => {},
  onUpvoteAnswer = () => {},
}) => {
  const safeUser: UniNestUser = user || {
    id: 'user-default',
    name: 'Student',
    email: 'student@uninest.ng',
    university: 'Bayelsa Medical University (BMU, Yenagoa)',
    department: 'Medicine & Surgery',
    phone: '08139045612',
    avatarUrl: '',
    role: 'student',
    joinedDate: '2026-08-01',
    isVerified: true
  };

  const [activeTab, setActiveTab] = useState<
    'home' | 'wallet' | 'cross_campus_map' | 'sts' | 'crowdfunding' | 'verified_hub' | 'campus_alerts' | 'bayelsa_housing' | 'inter_uni_qa' | 'campus_jobs' | 'academic' | 'marketplace' | 'data' | 'referral' | 'scouts' | 'hire_a_scout' | 'testimonials' | 'faqs' | 'news' | 'chat' | 'profile'
  >('home');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const unreadAlertsCount = phoneNotifications.filter(n => !n.isRead).length;

  // Dual Balance Visibility & Copy States
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [copiedStsAccount, setCopiedStsAccount] = useState(false);

  const stsLockedBalance = stsSavingsAccount?.currentBalance ?? 75000;
  const stsGiftBalance = stsSavingsAccount?.giftAccountBalance ?? stsSavingsAccount?.giftBalance ?? 15000;
  const stsTotalBalance = stsLockedBalance + stsGiftBalance;
  const stsAccountNo = stsSavingsAccount?.stsAccountNumber || 'STS-9034-4429';

  const handleCopyStsAccount = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(stsAccountNo);
    setCopiedStsAccount(true);
    setTimeout(() => setCopiedStsAccount(false), 2000);
  };

  // Direct Quick Navigation to STS Forms (Save form or Send Gift form)
  const [stsInitialAction, setStsInitialAction] = useState<'save' | 'gift' | 'claim' | null>(null);

  const handleOpenSaveInSTS = () => {
    setStsInitialAction('save');
    setActiveTab('sts');
  };

  const handleOpenSendGift = () => {
    setStsInitialAction('gift');
    setActiveTab('sts');
  };

  const handleOpenSignOutClaim = () => {
    setStsInitialAction('claim');
    setActiveTab('sts');
  };

  // "Service Coming Soon" Alert State for Data & Crowdfunding
  const [comingSoonNotice, setComingSoonNotice] = useState<{
    isOpen: boolean;
    serviceTitle: string;
    serviceDesc: string;
  } | null>(null);

  const handleComingSoonClick = (serviceType: 'data' | 'crowdfunding') => {
    setActiveTab(serviceType);
    setComingSoonNotice({
      isOpen: true,
      serviceTitle: serviceType === 'data' ? 'Cheap Student Data Hub' : 'Student Crowdfunding & Aid',
      serviceDesc: serviceType === 'data'
        ? 'The cheap data service is currently under final telco API integration. Service coming soon!'
        : 'The student crowdfunding and emergency aid service is currently in final escrow onboarding. Service coming soon!'
    });
  };

  const [newsFilter, setNewsFilter] = useState<'all' | 'scholarship' | 'strike' | 'school' | 'service'>('all');
  const [newsSearch, setNewsSearch] = useState('');
  
  const [copiedBankAcc, setCopiedBankAcc] = useState(false);
  const [bankDepositProofSent, setBankDepositProofSent] = useState(false);

  const handleCopyBankDetails = () => {
    const text = `Bank: ${UNINEST_OFFICIAL_BANK.bankName}\nAccount: ${UNINEST_OFFICIAL_BANK.accountNumber}\nName: ${UNINEST_OFFICIAL_BANK.accountName}`;
    navigator.clipboard.writeText(text);
    setCopiedBankAcc(true);
    setTimeout(() => setCopiedBankAcc(false), 2500);
  };

  const handleOpenWhatsAppDepositProof = (amount = 5000, purpose = 'UniNest Student Payment') => {
    const url = generatePaymentConfirmationWhatsAppUrl({
      studentName: safeUser.name,
      studentEmail: safeUser.email,
      studentPhone: safeUser.phone,
      university: safeUser.university,
      amount,
      purpose,
    });
    window.open(url, '_blank');
    setBankDepositProofSent(true);
    setTimeout(() => setBankDepositProofSent(false), 8000);
  };
  
  // Live Support Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'agent',
      text: `Hello ${safeUser.name || 'Student'}! Welcome to UniNest Customer Care. We provide STS Save Till Sign-Out & Gifting (Bayelsa & ABSU), Campus Jobs, Roommate Matching, Academic Assist, Escrow Marketplace, Cheap Data, and 5% Scout Commissions. How can we help you today?`,
      time: 'Just now'
    }
  ]);
  const [chatInput, setChatInput] = useState('');

  const filteredNews = news.filter(item => {
    const matchType = newsFilter === 'all' || item.type === newsFilter;
    const matchSearch = item.title.toLowerCase().includes(newsSearch.toLowerCase()) || 
                        item.description.toLowerCase().includes(newsSearch.toLowerCase());
    return matchType && matchSearch;
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    const userQuestion = chatInput.trim().toLowerCase();
    setChatInput('');

    setTimeout(() => {
      let reply = "Thank you for contacting UniNest. A student support officer will reach out via WhatsApp or email.";
      
      if (userQuestion.includes('sts') || userQuestion.includes('save') || userQuestion.includes('gift') || userQuestion.includes('sign out')) {
        reply = "Regarding STS (Save Till Sign-out): Opening an STS account is ₦500 for first timers! Available for all Bayelsa State universities and Abia State University (ABSU). You can save systematically towards project clearance, convocation, and receive 0% fee peer gifts!";
      } else if (userQuestion.includes('roommate') || userQuestion.includes('bayelsa') || userQuestion.includes('absu') || userQuestion.includes('abia') || userQuestion.includes('rivers') || userQuestion.includes('delta') || userQuestion.includes('bmu') || userQuestion.includes('medical') || userQuestion.includes('ndu') || userQuestion.includes('otuoke') || userQuestion.includes('byspoly') || userQuestion.includes('uniport') || userQuestion.includes('rsu') || userQuestion.includes('delsu') || userQuestion.includes('lodge') || userQuestion.includes('yenagoa')) {
        reply = "Our Roommate Matching service connects verified students across Bayelsa, Abia (ABSU), Rivers, and Delta States based on sleep, study, and lifestyle habits with direct WhatsApp chat! Verified off-campus lodge listings are available for Bayelsa and ABSU institutions.";
      } else if (userQuestion.includes('project') || userQuestion.includes('assignment') || userQuestion.includes('academic') || userQuestion.includes('turnitin')) {
        reply = "Our Academic Assist desk provides verified help on assignments, final year project chapters (1-5), SPSS data analysis, and Turnitin plagiarism reduction.";
      } else if (userQuestion.includes('escrow') || userQuestion.includes('market') || userQuestion.includes('buy') || userQuestion.includes('sell')) {
        reply = "UniNest Marketplace & Escrow protects campus buyers and sellers. We hold the buyer's funds safely until the item is tested on campus.";
      } else if (userQuestion.includes('data') || userQuestion.includes('mtn') || userQuestion.includes('airtel') || userQuestion.includes('glo')) {
        reply = "You can purchase cheap student data bundles (MTN 1GB @ ₦280, Airtel, Glo, 9mobile) with instant 24/7 VTU delivery in the Cheap Data tab.";
      }

      setMessages(prev => [...prev, {
        id: `reply-${Date.now()}`,
        sender: 'agent',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 600);
  };

  // Home Page Services List (Styled as Box Cards matching mobile layout)
  const HOME_PAGE_SERVICES = [
    {
      id: 'campus_jobs',
      title: 'Campus Jobs',
      subtitle: 'Part-time gigs near you',
      badge: '124 open',
      icon: Briefcase,
      tab: 'campus_jobs',
    },
    {
      id: 'roommate_accom',
      title: 'Roommate & Accom.',
      subtitle: 'Verified listings',
      badge: '89 listings',
      icon: Home,
      tab: 'bayelsa_housing',
    },
    {
      id: 'marketplace',
      title: 'Secure Marketplace',
      subtitle: 'Buy & sell safely',
      badge: '2.4k items',
      icon: ShoppingBag,
      tab: 'marketplace',
    },
    {
      id: 'ask_question',
      title: 'Ask a Question',
      subtitle: 'Community Q&A',
      badge: '1.2k answers',
      icon: HelpCircle,
      tab: 'inter_uni_qa',
    },
    {
      id: 'find_university',
      title: 'Find Your University',
      subtitle: 'Campus guide',
      badge: '162 schools',
      icon: GraduationCap,
      tab: 'cross_campus_map',
    },
    {
      id: 'hire_scout',
      title: 'Hire a Campus Scout',
      subtitle: 'Physical lodge inspection & errands',
      badge: '5% Comm.',
      icon: Compass,
      tab: 'hire_a_scout',
    },
    {
      id: 'campus_news',
      title: 'Campus News & Alerts',
      subtitle: 'Strikes, memos & timetables',
      badge: 'Live Memos',
      icon: Bell,
      tab: 'news',
    },
    {
      id: 'support_care',
      title: 'Student Support Desk',
      subtitle: '24/7 care & WhatsApp assist',
      badge: 'Online',
      icon: Headphones,
      tab: 'chat',
    },
    {
      id: 'campus_crowdfunding',
      title: 'Medical & Welfare Aid',
      subtitle: 'Peer support & crowdfunding',
      badge: 'Emergency',
      icon: Users,
      tab: 'crowdfunding',
    }
  ];

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-white dark:bg-[#0A1931] text-[#0A1931] dark:text-white font-sans flex flex-col antialiased">
      {/* Top Header: strictly #0A1931, #FF6A00, #FFFFFF */}
      <header className="h-16 w-full max-w-full bg-[#0A1931] border-b border-white/10 px-2 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-md gap-1 sm:gap-3 min-w-0">
        {/* 1. Brand Logo */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 min-w-0">
          <UniNestLogo size="sm" inverted className="shrink-0" />
          <div className="h-4 w-px bg-white/20 hidden lg:block" />
          <div className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-white/90">
            <span className="w-2 h-2 rounded-full bg-[#FF6A00] animate-pulse" />
            <span>Student Hub</span>
          </div>
        </div>

        {/* 2. Arranged Controls: Dark Toggle, STS & Gift Wallet, Logout */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Dark Mode Toggle */}
          <DarkModeToggle showLabel={false} variant="header" className="p-1 sm:p-2" />

          {/* Student STS & Gift Dual Balance Wallet Pill */}
          <button
            onClick={() => setActiveTab('wallet')}
            id="btn-header-student-wallet"
            className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white text-[10px] sm:text-xs font-bold transition-all duration-200 cursor-pointer shadow-inner active:scale-95 shrink-0 max-w-[140px] sm:max-w-none"
            title="Open Student Digital Wallet & Ledger"
          >
            {/* STS Locked Balance */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              <Wallet className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#FF6A00] shrink-0" />
              <span className="text-[9px] text-white/70 font-medium hidden md:inline">STS:</span>
              <span className="font-bold text-white tracking-tight text-[11px] sm:text-xs">₦{isBalanceHidden ? '••••' : stsLockedBalance.toLocaleString()}</span>
            </div>

            {/* Divider (shown on sm+) */}
            <div className="hidden sm:block h-3 w-px bg-white/25 mx-0.5 shrink-0" />

            {/* Gift Spendable Balance (shown on sm+) */}
            <div className="hidden sm:flex items-center gap-1">
              <Gift className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-[10px] text-emerald-200/70 font-medium hidden md:inline">Gift:</span>
              <span className="font-bold text-emerald-300 tracking-tight">₦{isBalanceHidden ? '••••' : stsGiftBalance.toLocaleString()}</span>
            </div>
          </button>

          {/* Single, Clear Header Logout Action */}
          <button
            type="button"
            onClick={onLogout}
            id="btn-student-logout"
            className="flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs transition cursor-pointer shadow-sm shrink-0 active:scale-95 border border-red-500/80"
            title="Sign Out / Log Out"
            aria-label="Log Out"
          >
            <LogOut className="w-4 h-4 text-white shrink-0 stroke-[2.5]" />
            <span className="text-xs font-bold text-white leading-none">Logout</span>
          </button>
        </div>
      </header>

      {/* Navigation Bar for All Services */}
      <div className="w-full max-w-full min-w-0 bg-white border-b border-slate-200 px-3 sm:px-8 flex items-center gap-1.5 overflow-x-auto py-2">
        <button
          onClick={() => setActiveTab('home')}
          id="nav-tab-home-page"
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'home'
              ? 'bg-[#0f172a] text-white shadow-xs'
              : 'text-gray-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Home className="w-3.5 h-3.5 text-orange-400" />
          <span>Home page</span>
        </button>

        <button
          onClick={() => setActiveTab('wallet')}
          id="nav-tab-student-wallet"
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'wallet'
              ? 'bg-[#0f172a] text-white shadow-xs'
              : 'text-gray-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Wallet className="w-3.5 h-3.5 text-orange-500" />
          <span>Student Wallet &amp; History</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </button>

        <button
          onClick={() => setActiveTab('cross_campus_map')}
          id="nav-tab-cross-campus-map"
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'cross_campus_map'
              ? 'bg-[#0f172a] text-white shadow-xs'
              : 'text-gray-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-blue-500" />
          <span>Cross-Campus Map</span>
          <span className="px-1.5 py-0.2 rounded-md bg-blue-50 text-blue-700 text-[10px] font-black border border-blue-200">
            Live
          </span>
        </button>

        <button
          onClick={() => setActiveTab('sts')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'sts'
              ? 'bg-[#0f172a] text-white shadow-xs'
              : 'text-gray-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <PiggyBank className="w-3.5 h-3.5 text-orange-500" />
          <span>STS: Save &amp; Student Gifting</span>
        </button>

        <button
          onClick={() => handleComingSoonClick('crowdfunding')}
          id="tab-student-crowdfunding"
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'crowdfunding'
              ? 'bg-[#0f172a] text-white shadow-xs'
              : 'text-gray-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <HeartHandshake className="w-3.5 h-3.5 text-rose-500" />
          <span>Crowdfunding &amp; Aid</span>
          <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 text-[10px] font-black border border-amber-200">
            Soon
          </span>
        </button>

        <button
          onClick={() => setActiveTab('marketplace')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'marketplace' || activeTab === 'verified_hub'
              ? 'bg-[#0A1931] text-white shadow-xs'
              : 'text-[#0A1931]/70 hover:text-[#0A1931] hover:bg-[#0A1931]/5'
          }`}
        >
          <Store className="w-3.5 h-3.5 text-[#FF6A00]" />
          <span>Marketplace &amp; Escrow</span>
        </button>

        <button
          onClick={() => setActiveTab('hire_a_scout')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'hire_a_scout'
              ? 'bg-[#0A1931] text-white shadow-xs'
              : 'text-[#0A1931]/70 hover:text-[#0A1931] hover:bg-[#0A1931]/5'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-[#FF6A00]" />
          <span>Hire a Scout</span>
          <span className="px-1.5 py-0.2 rounded-md bg-[#FF6A00] text-white text-[10px] font-black">
            Soon
          </span>
        </button>

        <button
          onClick={() => setActiveTab('campus_alerts')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer relative ${
            activeTab === 'campus_alerts'
              ? 'bg-[#0f172a] text-white shadow-xs'
              : 'text-gray-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BellRing className="w-3.5 h-3.5 text-purple-500" />
          <span>Campus Phone Alerts</span>
          {unreadAlertsCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shrink-0">
              {unreadAlertsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('bayelsa_housing')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'bayelsa_housing'
              ? 'bg-[#0f172a] text-white shadow-xs'
              : 'text-gray-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-blue-500" />
          <span>Roommates &amp; Housing</span>
        </button>

        <button
          onClick={() => setActiveTab('inter_uni_qa')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'inter_uni_qa'
              ? 'bg-[#0f172a] text-white shadow-xs'
              : 'text-gray-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
          <span>Cross-Uni Q&amp;A Hub</span>
          <span className="px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-black">
            {studentQuestions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('campus_jobs')}
          id="nav-tab-campus-jobs"
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'campus_jobs'
              ? 'bg-[#0f172a] text-white shadow-xs'
              : 'text-gray-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5 text-blue-500" />
          <span>Campus Jobs &amp; Workers</span>
          <span className="px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black">
            Jobs
          </span>
        </button>

        <button
          onClick={() => setActiveTab('academic')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'academic'
              ? 'bg-[#0f172a] text-white shadow-xs'
              : 'text-gray-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
          <span>Academic Assist</span>
        </button>

        <button
          onClick={() => handleComingSoonClick('data')}
          id="nav-tab-cheap-data"
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'data'
              ? 'bg-[#0f172a] text-white shadow-xs'
              : 'text-gray-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Wifi className="w-3.5 h-3.5 text-amber-500" />
          <span>Cheap Data Hub</span>
          <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 text-[10px] font-black border border-amber-200">
            Soon
          </span>
        </button>

        {/* Referral Dashboard Tab */}
        <button
          onClick={() => setActiveTab('referral')}
          id="tab-referral-dashboard"
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'referral' || activeTab === 'scouts'
              ? 'bg-[#0f172a] text-white shadow-xs'
              : 'text-gray-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span>Referral Dashboard</span>
          <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
            5% Direct
          </span>
        </button>

        <button
          onClick={() => setActiveTab('faqs')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'faqs'
              ? 'bg-[#0f172a] text-white shadow-xs'
              : 'text-gray-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-teal-500" />
          <span>FAQ</span>
        </button>

        <button
          onClick={() => setActiveTab('news')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'news'
              ? 'bg-[#0f172a] text-white shadow-xs'
              : 'text-gray-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>News &amp; Scholarships</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'chat'
              ? 'bg-[#0f172a] text-white shadow-xs'
              : 'text-gray-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Support Desk</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ml-auto ${
            activeTab === 'profile'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-orange-700 bg-orange-50 hover:bg-orange-100'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>My Profile</span>
        </button>
      </div>

      {/* Animated Marquee: Advert & Critical Safety Disclosure running continuously */}
      <CampusTickerMarquee onOpenScoutDashboard={() => setActiveTab('scouts')} />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-6 space-y-6 pb-24 sm:pb-8 min-w-0 overflow-x-hidden">
        
        {/* ================= TAB: HOME / OVERVIEW (Student Financial & Services Command Center) ================= */}
        {activeTab === 'home' && (
          <div className="space-y-6 min-w-0">
            {/* 1. WELCOME & PROFILE HEADER */}
            <div 
              id="tour-welcome-banner" 
              className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 min-w-0"
            >
              <div className="flex items-center gap-3.5 sm:gap-5 min-w-0 w-full sm:w-auto">
                {/* Profile Picture with Verified Online Ring */}
                <div 
                  className="relative cursor-pointer group shrink-0" 
                  onClick={() => setIsProfileModalOpen(true)} 
                  title="Click to view/edit your profile"
                >
                  <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl overflow-hidden ring-4 ring-orange-500/80 shadow-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition group-hover:scale-105">
                    <img 
                      src={safeUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(safeUser.name || safeUser.email)}`} 
                      alt={safeUser.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-white shadow-md ring-2 ring-white dark:ring-slate-900" title="Active & Verified Nigerian Student">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Welcome Greeting & Student Academic Details */}
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight break-words">
                      Welcome, {safeUser.name || 'Student'}! 👋
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-extrabold border border-emerald-300 dark:border-emerald-800 flex items-center gap-1 shrink-0">
                      <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      Verified Student
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-orange-600 dark:text-orange-400 font-bold">{safeUser.university || 'Nigerian University'}</span>
                    <span className="text-slate-400 hidden sm:inline">•</span>
                    <span className="text-slate-500 dark:text-slate-400">{safeUser.department || 'General Studies'}</span>
                  </p>

                  <div className="flex items-center gap-2 pt-0.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono flex-wrap">
                    <span>STS ID:</span>
                    <button
                      onClick={handleCopyStsAccount}
                      className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold flex items-center gap-1 transition cursor-pointer"
                      title="Click to copy your unique STS Account number"
                    >
                      <span>{stsAccountNo}</span>
                      {copiedStsAccount ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-slate-400" />}
                    </button>
                    {copiedStsAccount && <span className="text-emerald-500 font-bold text-[10px]">Copied!</span>}
                  </div>
                </div>
              </div>

              {/* Quick Header Actions */}
              <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 flex-wrap">
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <User className="w-3.5 h-3.5 text-orange-500" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => setActiveTab('wallet')}
                  className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-orange-500/20"
                >
                  <Wallet className="w-3.5 h-3.5 text-orange-500" />
                  <span>Wallet Ledger</span>
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  id="btn-student-welcome-logout"
                  className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-red-200 dark:border-red-900/50 shadow-xs"
                  title="Sign out of student account"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                  <span>Logout</span>
                </button>
              </div>
            </div>

            {/* 2. DUAL BALANCE WALLET CARD (STS WALLET BALANCE & GIFT BALANCE HIGH VISIBILITY) */}
            <div className="p-4 sm:p-7 rounded-3xl bg-gradient-to-br from-[#0A1931] via-[#10294c] to-[#0A1931] text-white shadow-xl border border-white/15 relative overflow-hidden space-y-6 min-w-0">
              {/* Ambient glowing fintech gradients */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Card Top Row: Account Brand & Visibility Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between relative z-10 border-b border-white/10 pb-3.5 gap-3 min-w-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center shadow-xs shrink-0">
                    <Wallet className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-extrabold tracking-tight text-white block truncate">
                      UniNest Digital Student Account
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 truncate">
                      <ShieldCheck className="w-3 h-3 inline text-emerald-400 shrink-0" />
                      Escrow Protected • NDIC-Insured Partner Custody
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <button
                    onClick={() => setIsBalanceHidden(!isBalanceHidden)}
                    className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-white/15"
                    title={isBalanceHidden ? "Show Balance" : "Hide Balance"}
                  >
                    {isBalanceHidden ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
                    <span className="hidden sm:inline">{isBalanceHidden ? "Show Balance" : "Hide Balance"}</span>
                  </button>

                  <button
                    onClick={handleCopyStsAccount}
                    className="px-2.5 py-1.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 text-xs font-mono font-bold transition flex items-center gap-1 cursor-pointer border border-orange-500/30"
                    title="Copy STS Account Number"
                  >
                    <span>{stsAccountNo}</span>
                    {copiedStsAccount ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-orange-400" />}
                  </button>
                </div>
              </div>

              {/* DUAL HIGH-VISIBILITY BALANCES: STS WALLET BALANCE + GIFT BALANCE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 relative z-10 min-w-0">
                {/* 1. STS WALLET BALANCE (LOCKED FOR GRADUATION) */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-orange-500/50 transition space-y-2.5 group min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400 shrink-0">
                      <Lock className="w-4 h-4 text-orange-400" />
                      <span className="uppercase tracking-wider">STS Wallet Balance</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 text-[9px] sm:text-[10px] font-black border border-orange-500/30 shrink-0">
                      LOCKED TILL SIGN-OUT
                    </span>
                  </div>

                  <div className="py-1 min-w-0 overflow-hidden">
                    <div className="text-2xl sm:text-4xl font-black font-mono tracking-tight text-white flex items-baseline gap-1 truncate">
                      <span className="text-orange-400 font-sans text-xl sm:text-3xl">₦</span>
                      <span className="truncate">{isBalanceHidden ? '••••••••' : stsLockedBalance.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-300 pt-2 border-t border-white/10">
                    <span className="text-slate-400">Goal: <strong className="text-white">{stsSavingsAccount?.targetGoalName || 'Final Year Project & Clearance'}</strong></span>
                    <button
                      type="button"
                      id="btn-home-save-more"
                      onClick={handleOpenSaveInSTS}
                      className="text-orange-400 hover:text-orange-300 font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Save More</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* 2. GIFT BALANCE (SPENDABLE & TRANSFERABLE) */}
                <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-emerald-500/50 transition space-y-2.5 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                      <Gift className="w-4 h-4 text-emerald-400" />
                      <span className="uppercase tracking-wider">Student Gift Balance</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30">
                      SPENDABLE • 0% FEE
                    </span>
                  </div>

                  <div className="py-1">
                    <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-emerald-300 flex items-baseline gap-1">
                      <span className="text-emerald-400 font-sans text-2xl sm:text-3xl">₦</span>
                      <span>{isBalanceHidden ? '••••••••' : stsGiftBalance.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-300 pt-2 border-t border-white/10">
                    <span className="text-slate-400">Gifts from Course Mates &amp; Sponsors</span>
                    <button
                      type="button"
                      id="btn-home-send-gift-card"
                      onClick={handleOpenSendGift}
                      className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Send Gift</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Total Net Balance & Quick Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span className="text-slate-400">Total Net Funds:</span>
                  <span className="font-mono font-black text-white text-base">
                    ₦{isBalanceHidden ? '••••••••' : stsTotalBalance.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400">(STS Locked + Spendable Gifts)</span>
                </div>

                {/* 4 Quick Action Buttons */}
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    id="btn-home-save-in-sts"
                    onClick={handleOpenSaveInSTS}
                    className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:shadow-lg"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Save in STS</span>
                  </button>

                  <button
                    type="button"
                    id="btn-home-send-gift"
                    onClick={handleOpenSendGift}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:shadow-lg"
                  >
                    <Gift className="w-4 h-4" />
                    <span>Send Gift</span>
                  </button>

                  <button
                    type="button"
                    id="btn-home-signout-claim"
                    onClick={handleOpenSignOutClaim}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-orange-400" />
                    <span>Sign-Out Claim</span>
                  </button>

                  <button
                    type="button"
                    id="btn-home-wallet-ledger"
                    onClick={() => setActiveTab('wallet')}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Wallet className="w-3.5 h-3.5 text-amber-400" />
                    <span>Wallet Ledger</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3. STUDENT SERVICES DIRECTORY (BOX CARDS) */}
            <div id="tour-services-grid" className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>UniNest Student Services</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Tap any service below for immediate access to university utilities, savings &amp; student tools
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">All Services Operational</span>
                </div>
              </div>

              {/* Grid of Box-styled Service Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 min-w-0">
                {HOME_PAGE_SERVICES.map((srv) => {
                  const Icon = srv.icon;
                  return (
                    <button
                      key={srv.id}
                      id={`service-box-${srv.id}`}
                      type="button"
                      onClick={() => setActiveTab(srv.tab as any)}
                      className="p-3 sm:p-5 rounded-[20px] sm:rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-[#FF6A00]/70 dark:hover:border-[#FF6A00]/70 transition-all duration-200 text-left flex flex-col justify-between space-y-3 sm:space-y-4 group cursor-pointer min-w-0 w-full overflow-hidden"
                    >
                      {/* Top Row: Orange Icon squircle on left + Pill badge on right */}
                      <div className="flex items-center justify-between w-full gap-1 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#FF6A00] text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[2.2]" />
                        </div>
                        <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[10px] sm:text-[11px] truncate max-w-[80px] sm:max-w-none shrink">
                          {srv.badge}
                        </span>
                      </div>

                      {/* Bottom Info: Bold Title & Subtitle */}
                      <div className="min-w-0 w-full">
                        <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-base leading-snug group-hover:text-[#FF6A00] transition-colors truncate">
                          {srv.title}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-tight mt-1 line-clamp-2">
                          {srv.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. OFFICIAL PAYMENT BANK ACCOUNT & AUTOMATED WHATSAPP CONFIRMATION */}
            <div 
              id="tour-bank-account" 
              className="p-5 sm:p-6 rounded-3xl bg-slate-900 dark:bg-slate-950 text-white shadow-xl border-2 border-orange-500/80 space-y-4 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold">
                    <Building className="w-3.5 h-3.5" />
                    <span>Official Designated Bank Account</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black">
                      ACTIVE &amp; VERIFIED
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    Channel All Payments &amp; Deposits to Official UniNest Account
                  </h3>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    For wallet deposits, STS graduation savings, escrow deposits, academic project kits, and services: transfer directly to the official bank account below. Automated WhatsApp confirmation verifies and credits your account instantly.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyBankDetails}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-orange-400 border border-orange-500/40 text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer self-start lg:self-center"
                >
                  {copiedBankAcc ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedBankAcc ? 'Account Details Copied!' : 'Copy Bank Details'}</span>
                </button>
              </div>

              {/* 3 High-Visibility Bank Data Blocks */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10">
                <div className="p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    Bank Name
                  </span>
                  <span className="text-base font-black text-white block">
                    {UNINEST_OFFICIAL_BANK.bankName}
                  </span>
                  <span className="text-[11px] text-orange-400 font-semibold block">
                    Commercial Bank ({UNINEST_OFFICIAL_BANK.bankShort})
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/90 border-2 border-orange-500 space-y-1 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-orange-400">
                      Account Number
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-300 text-[10px] font-black">
                      NUBAN
                    </span>
                  </div>
                  <span className="text-xl sm:text-2xl font-mono font-black tracking-widest text-white block">
                    {UNINEST_OFFICIAL_BANK.accountNumber}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    Account Name
                  </span>
                  <span className="text-base font-black text-white block uppercase">
                    {UNINEST_OFFICIAL_BANK.accountName}
                  </span>
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Designated UniNest Merchant
                  </span>
                </div>
              </div>

              {/* Automated WhatsApp Confirmation Action Bar */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 relative z-10">
                <div className="text-xs text-slate-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                  <span>After transferring, click below to automatically generate confirmation details to WhatsApp.</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenWhatsAppDepositProof(5000, 'Student Services & Wallet Payment')}
                  className="px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>Automate WhatsApp Confirmation</span>
                </button>
              </div>

              {bankDepositProofSent && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>WhatsApp opened with pre-filled payment confirmation! Send your transfer receipt in the chat for instant crediting.</span>
                </div>
              )}
            </div>

            {/* 5. OFFICIAL UNINEST AMBASSADOR & MERCHANDISE BANNER */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white shadow-xl relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>UniNest Student Ambassador &amp; Campus Community</span>
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                      Empowering Nigerian Scholars With Pride &amp; Financial Peace
                    </h2>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
                      Over 10,000 students across Nigerian universities and polytechnics trust UniNest to lock graduation funds, find safe verified lodges, secure project assistance, and earn 5% cash scout rewards.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => setActiveTab('scouts')}
                      className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-lg transition flex items-center gap-2 cursor-pointer"
                    >
                      <Award className="w-4 h-4" />
                      <span>Become a Campus Scout</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('referral')}
                      className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Earn 5% Commission</span>
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 flex justify-center lg:justify-end">
                  <div className="relative group">
                    <div className="absolute -inset-1.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl blur-md opacity-40 group-hover:opacity-60 transition duration-300" />
                    <div className="relative rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl bg-slate-800 w-60 sm:w-68 md:w-72 h-60 sm:h-68 md:h-72">
                      <img 
                        src={happyNigerianStudentImg} 
                        alt="UniNest Nigerian Student Ambassador in Brand Clothes" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-[center_20%] transform group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/20 text-white">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                          <p className="text-xs font-bold leading-tight">Official UniNest Brand Clothes</p>
                        </div>
                        <p className="text-[10px] text-amber-300 font-semibold mt-0.5">Campus Ambassador • Official Scout Merchandise</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Get Amazing Gifts from UniNest Section */}
            <div id="section-uninest-gifts" className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#062343] via-[#0a2e58] to-[#062343] text-white shadow-xl border border-white/15 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-bold border border-orange-500/30">
                    <Gift className="w-3.5 h-3.5 text-orange-400" />
                    <span>Special Student Rewards &amp; Merchandise</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    Get Amazing Gifts from UniNest 🎁
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                    UniNest rewards active, ambitious Nigerian students! From official UniNest branded clothes (like the signature Scout T-Shirt &amp; Cap) to exam survival vouchers, graduation cash stashes, and instant peer gifts.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <button
                    type="button"
                    id="btn-home-rewards-send-gift"
                    onClick={handleOpenSendGift}
                    className="px-5 py-3 rounded-2xl bg-[#E75D14] hover:bg-[#D14F0F] text-white font-bold text-xs shadow-lg transition flex items-center gap-2 cursor-pointer"
                  >
                    <Gift className="w-4 h-4" />
                    <span>Send &amp; Receive Student Gifts</span>
                  </button>
                  <a
                    href="https://wa.me/2349039847154?text=Hello%20UniNest%20Desk!%20I%20would%20like%20to%20claim%20my%20UniNest%20Brand%20Clothes%20and%20Student%20Gifts."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer backdrop-blur-md"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Claim Brand Clothes on WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Gift Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10 pt-2">
                <div className="p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-300 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-sm text-white">Official Brand Clothes</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Premium UniNest cotton t-shirts and caps as worn by our campus ambassador. Awarded to top savers and active campus scouts!
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
                    <Gift className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-sm text-white">Exam Survival Kits</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Receive subsidized exam handouts, midnight reading data bundles, and stationery support gifted by alumni and coursemates.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                    <PiggyBank className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-sm text-white">Graduation Cash Stash</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Reach 70% of your Save Till Sign-Out target to unlock eligibility for free graduation gifts, power banks, and UniNest tokens. Cash out on your scheduled withdrawal date!
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-sm text-white">5% Scout &amp; Referral Gifts</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Earn instant 5% direct commission on every student referral for lodges, research projects, and verified services.
                  </p>
                </div>
              </div>
            </div>


          </div>
        )}

        {/* ================= TAB: STUDENT DIGITAL WALLET & LEDGER ================= */}
        {activeTab === 'wallet' && (
          <StudentWalletTab
            user={safeUser}
            account={stsSavingsAccount}
            onDeposit={onDepositSTS}
            onWithdraw={onWithdrawSTS}
            onGiftStudent={onGiftStudent}
            onRequestLoan={onRequestSTSLoan}
            onRepayLoan={onRepaySTSLoan}
          />
        )}

        {/* ================= TAB: CROSS-CAMPUS MAP & GROUNDS ================= */}
        {activeTab === 'cross_campus_map' && (
          <CrossCampusMapTab
            onSelectLodgeForRoommate={(_lodgeName, _campus) => {
              setActiveTab('bayelsa_housing');
            }}
          />
        )}

        {/* ================= TAB 1: STS SAVE TILL SIGN-OUT & GIFTING ================= */}
        {activeTab === 'sts' && (
          <STSSavingsTab
            user={safeUser}
            account={stsSavingsAccount}
            initialAction={stsInitialAction}
            onClearInitialAction={() => setStsInitialAction(null)}
            onDeposit={onDepositSTS}
            onGiftStudent={onGiftStudent}
            onRequestLoan={onRequestSTSLoan}
            onRepayLoan={onRepaySTSLoan}
            onCreateSavingsPlan={() => {}}
            onOpenWalletHistory={() => setActiveTab('wallet')}
          />
        )}

        {/* ================= TAB: CROWDFUNDING & AID ================= */}
        {activeTab === 'crowdfunding' && (
          <CrowdfundingTab
            user={safeUser}
            currentUser={safeUser}
            campaigns={crowdfundingCampaigns}
            onRequestHelp={onRequestCrowdfundingHelp}
            onRequestCampaign={onRequestCrowdfundingHelp}
            onDonateToCampaign={onDonateToCampaign}
            onDonate={(campaignId, amountOrDonation, donorName, donorEmail, message, isAnonymous) => {
              if (onDonateToCampaign) {
                if (typeof amountOrDonation === 'object' && amountOrDonation !== null) {
                  onDonateToCampaign(campaignId, amountOrDonation);
                } else {
                  onDonateToCampaign(campaignId, {
                    amount: Number(amountOrDonation),
                    donorName: donorName || 'Generous Supporter',
                    donorEmail: donorEmail || 'donor@campus.ng',
                    message: message || '',
                    isAnonymous: isAnonymous || false
                  });
                }
              }
            }}
            stsSavingsAccount={stsSavingsAccount}
          />
        )}

        {/* ================= TAB: VERIFIED AGENTS & SELLERS ================= */}
        {activeTab === 'verified_hub' && (
          <VerifiedBusinessesTab
            user={safeUser}
            businesses={verifiedBusinesses}
            onRegisterBusiness={onAddVerifiedBusiness}
            onAddReview={onAddBusinessReview}
          />
        )}

        {/* ================= TAB: CAMPUS PHONE NOTIFICATIONS & NEWS ================= */}
        {activeTab === 'campus_alerts' && (
          <CampusPhoneNotifications
            user={safeUser}
            notifications={phoneNotifications}
            onMarkAsRead={onMarkPhoneNotificationAsRead}
            onSendBroadcast={onSendPhoneNotification}
            subscribers={subscribers}
          />
        )}

        {/* ================= TAB: FAQ ================= */}
        {activeTab === 'faqs' && (
          <FAQSection faqs={faqs} />
        )}

        {/* ================= TAB 2: BAYELSA ROOMMATES & HOUSING ================= */}
        {activeTab === 'bayelsa_housing' && (
          <BayelsaHousingTab
            user={safeUser}
            roommates={roommates}
            accommodations={accommodations}
            onRequestRoommate={onRequestRoommate}
          />
        )}

        {/* ================= TAB: CROSS-UNIVERSITY Q&A HUB ================= */}
        {activeTab === 'inter_uni_qa' && (
          <InterUniversityQAHub
            questions={studentQuestions}
            onAddQuestion={onAddQuestion}
            onAddAnswer={onAddAnswer}
            onUpvoteAnswer={onUpvoteAnswer}
            currentUser={safeUser}
          />
        )}

        {/* ================= TAB: CAMPUS JOBS & WORKERS ================= */}
        {activeTab === 'campus_jobs' && (
          <CampusJobsTab currentUser={safeUser} />
        )}

        {/* ================= TAB 3: ACADEMIC ASSIST ================= */}
        {activeTab === 'academic' && (
          <AcademicAssistTab
            user={safeUser}
            requests={academicRequests}
            onSubmitRequest={onSubmitAcademicRequest}
          />
        )}

        {/* ================= TAB 4: MARKETPLACE & ESCROW ================= */}
        {(activeTab === 'marketplace' || activeTab === 'verified_hub') && (
          <MarketplaceEscrowTab
            user={safeUser}
            items={marketplaceItems}
            escrows={escrowTransactions}
            onPostItem={onPostMarketplaceItem}
            onInitiateEscrow={onInitiateEscrow}
            onReleaseEscrow={onReleaseEscrow}
            onRelistItem={onRelistMarketplaceItem}
          />
        )}

        {/* ================= TAB: HIRE A SCOUT (COMING SOON) ================= */}
        {activeTab === 'hire_a_scout' && (
          <HireAScoutComingSoonTab user={safeUser} />
        )}

        {/* ================= TAB 5: CHEAP DATA ================= */}
        {activeTab === 'data' && (
          <CheapDataTab
            user={safeUser}
            orders={dataOrders}
            onBuyData={onBuyData}
          />
        )}

        {/* ================= TAB: REFERRAL DASHBOARD & 5% COMMISSION ================= */}
        {(activeTab === 'referral' || activeTab === 'scouts') && (
          <ScoutCommissionDashboard
            user={safeUser}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
          />
        )}

        {/* ================= TAB: NEWS & SCHOLARSHIPS ================= */}
        {activeTab === 'news' && (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0f172a] to-[#1e293b] text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Campus Intelligence Feed</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Scholarships &amp; Strike Updates
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm">
                  Verified updates on FG / PTDF / NNPC scholarships, ASUU calendars, and school cut-off news.
                </p>
              </div>

              {!isSubscribedNewsletter && (
                <button
                  onClick={() => onSubscribeNewsletter(user.email)}
                  className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-lg transition flex items-center gap-2 shrink-0"
                >
                  <Bell className="w-4 h-4" />
                  <span>Subscribe to Newsletter</span>
                </button>
              )}
            </div>

            {/* Filter bar */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={newsSearch}
                  onChange={(e) => setNewsSearch(e.target.value)}
                  placeholder="Search scholarship, ASUU strike, PTDF, cut-off..."
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
                {(['all', 'service', 'scholarship', 'strike', 'school'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setNewsFilter(filter)}
                    className={`px-3 py-1.5 rounded-xl capitalize transition ${
                      newsFilter === filter ? 'bg-[#0f172a] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {filter === 'all' ? 'All Alerts' : filter}
                  </button>
                ))}
              </div>
            </div>

            {/* News List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredNews.map((item) => (
                <div key={item.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                        item.type === 'scholarship'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.type === 'strike'
                          ? 'bg-red-100 text-red-800'
                          : item.type === 'service'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.type}
                      </span>
                      <span className="text-[11px] text-gray-400 font-mono">{item.date}</span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-sm leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-gray-500">
                    <span>{item.school || 'All Nigerian Universities'}</span>
                    <span className="font-semibold text-orange-600">{item.author || 'UniNest Desk'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB: CUSTOMER CARE DESK ================= */}
        {activeTab === 'chat' && (
          <StudentSupportDeskTab
            user={safeUser}
            onNavigateToFaq={() => setActiveTab('faqs')}
            faqs={faqs}
          />
        )}

        {/* ================= TAB: PROFILE & SETTINGS VIEW ================= */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <img
                  src={safeUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(safeUser.name || safeUser.email)}`}
                  alt={safeUser.name || 'User'}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-orange-500 shadow-md bg-white shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                      {safeUser.name || 'UniNest Student'}
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      Verified Student
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 flex items-center gap-1.5 flex-wrap">
                    <GraduationCap className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    <span>{safeUser.university || 'Bayelsa Medical University (BMU, Yenagoa)'}</span>
                    <span className="text-slate-500">•</span>
                    <span>{safeUser.department || 'Medicine & Surgery'}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-lg transition flex items-center gap-2 cursor-pointer shrink-0"
              >
                <User className="w-4 h-4" />
                <span>Edit Profile &amp; Security</span>
              </button>
            </div>

            {/* Account Information Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Card 1: Contact & Identity */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <User className="w-4 h-4 text-orange-500" />
                    <span>Personal Info</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(true)}
                    className="text-xs font-bold text-orange-600 hover:underline"
                  >
                    Edit
                  </button>
                </div>

                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between">
                    <span className="text-slate-500">Full Name:</span>
                    <span className="font-bold text-slate-900">{safeUser.name || 'Not set'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between">
                    <span className="text-slate-500">Email:</span>
                    <span className="font-bold text-slate-900 font-mono text-[11px] truncate max-w-[150px]">{safeUser.email}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between">
                    <span className="text-slate-500">WhatsApp / Phone:</span>
                    <span className="font-bold text-slate-900">{safeUser.phone}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between">
                    <span className="text-slate-500">Account Role:</span>
                    <span className="font-bold text-emerald-600 uppercase">{safeUser.role || 'Student'}</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Academic Profile */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-500" />
                    <span>Campus &amp; Studies</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(true)}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Change
                  </button>
                </div>

                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-0.5">
                    <span className="text-slate-500 text-[10px]">Institution:</span>
                    <span className="font-bold text-slate-900 truncate">
                      {safeUser.university || 'Bayelsa Medical University (BMU, Yenagoa)'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-0.5">
                    <span className="text-slate-500 text-[10px]">Department:</span>
                    <span className="font-bold text-slate-900 truncate">
                      {safeUser.department || 'Medicine & Surgery'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between">
                    <span className="text-slate-500">Verification:</span>
                    <span className="font-bold text-emerald-600">ID Confirmed</span>
                  </div>
                </div>
              </div>

              {/* Card 3: STS Savings Status */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <PiggyBank className="w-4 h-4 text-emerald-500" />
                    <span>STS Savings Tier</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('sts')}
                    className="text-xs font-bold text-emerald-600 hover:underline"
                  >
                    View STS
                  </button>
                </div>

                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200 flex justify-between items-center">
                    <span className="text-emerald-900 font-medium">STS Balance:</span>
                    <span className="font-extrabold text-emerald-700 font-mono text-sm">
                      ₦{(stsSavingsAccount?.currentBalance || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between">
                    <span className="text-slate-500">Target Goal:</span>
                    <span className="font-bold text-slate-900 truncate max-w-[130px]">
                      {stsSavingsAccount?.targetGoalName || 'Sign-out Fund'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between">
                    <span className="text-slate-500">Gifting Allowance:</span>
                    <span className="font-bold text-slate-900">
                      ₦{(stsSavingsAccount?.currentBalance || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ================= USER PROFILE & SECURITY MODAL ================= */}
      {isProfileModalOpen && (
        <UserProfileModal
          user={safeUser}
          stsSavingsAccount={stsSavingsAccount}
          onUpdateUser={onUpdateUser}
          onLogout={onLogout}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}

      {/* ================= SERVICE COMING SOON MODAL ================= */}
      {comingSoonNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-center space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
              <Clock className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider border border-amber-200">
                Official Campus Notice
              </span>
              <h3 className="text-xl font-black text-slate-900">
                Service Coming Soon
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed pt-1">
                {comingSoonNotice.serviceDesc}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 text-left space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-slate-900">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Feature in Final Deployment:</span>
              </div>
              <p className="text-slate-600 leading-normal">
                {comingSoonNotice.serviceTitle === 'Cheap Student Data Hub'
                  ? 'MTN, Airtel, Glo, and 9mobile 24/7 automated VTU data delivery from ₦280/GB.'
                  : 'Paystack Escrow student aid and verified crowdfunding with proof document vetting.'}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setComingSoonNotice(null)}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-md cursor-pointer"
              >
                Okay, Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar matching user layout */}
      <nav aria-label="Mobile Navigation Bar" className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0A1931]/95 backdrop-blur-md border-t border-slate-200 dark:border-white/10 px-2 py-1.5 flex items-center justify-around shadow-lg">
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition cursor-pointer ${
            activeTab === 'home'
              ? 'text-[#FF6A00]'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Home</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('campus_jobs')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition cursor-pointer ${
            activeTab === 'campus_jobs'
              ? 'text-[#FF6A00]'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Briefcase className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Jobs</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('marketplace')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition cursor-pointer ${
            activeTab === 'marketplace'
              ? 'text-[#FF6A00]'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Market</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition cursor-pointer ${
            activeTab === 'chat'
              ? 'text-[#FF6A00]'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Chat</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('news')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition cursor-pointer ${
            activeTab === 'news'
              ? 'text-[#FF6A00]'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Bell className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">News</span>
        </button>
      </nav>
    </div>
  );
};
