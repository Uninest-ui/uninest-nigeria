import React, { useState } from 'react';
import { 
  Users, 
  Home, 
  Mail, 
  BookOpen, 
  LogOut, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Edit3, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Sparkles,
  BarChart3,
  FileText,
  Phone,
  RefreshCw,
  Clock,
  HeartHandshake,
  Download,
  UploadCloud,
  Lock,
  Check,
  X,
  ExternalLink,
  FileSpreadsheet,
  CreditCard,
  PiggyBank,
  Receipt,
  Eye,
  ShieldCheck,
  Award,
  MessageSquare,
  Key,
  Camera,
  Bell
} from 'lucide-react';
import { UniNestUser, STSAccount, NewsItem, AdminLog, CrowdfundingCampaign, DepositWithdrawalApproval, LiveSupportConversation, LiveSupportMessage } from '../types';
import { UniNestLogo } from './UniNestLogo';
import { sendNewsletterBroadcast, sendNewUserSignupAdminAlert } from '../services/emailService';
import { NIGERIAN_UNIVERSITIES } from '../data/uninestData';
import { AdminCrowdfundingModule } from './AdminCrowdfundingModule';
import { AdminApprovalsModule } from './AdminApprovalsModule';
import { AdminLiveSupportModule } from './AdminLiveSupportModule';
import { HeadOfMarketplaceModule } from './HeadOfMarketplaceModule';
import { AdminPaymentSettingsModule } from './AdminPaymentSettingsModule';
import { AdminUserManagementModal } from './AdminUserManagementModal';
import { AdminCreditSavingsModal } from './AdminCreditSavingsModal';
import { scoutReferralService } from '../utils/scoutReferralService';
import { approvalService } from '../utils/approvalService';
import { supportChatService } from '../utils/supportChatService';
import { DarkModeToggle } from './DarkModeToggle';

interface AdminDashboardProps {
  adminUser: UniNestUser;
  users: UniNestUser[];
  stsAccounts: STSAccount[];
  news: NewsItem[];
  subscribers: string[];
  adminLogs: AdminLog[];
  crowdfundingCampaigns: CrowdfundingCampaign[];
  onLogout: () => void;
  onAddNews: (item: NewsItem) => void;
  onDeleteNews: (id: string) => void;
  onToggleUserStatus: (email: string) => void;
  onAddLog: (action: string, details?: string) => void;
  onApproveCampaign: (campaignId: string) => void;
  onRejectCampaign: (campaignId: string, reason: string) => void;
  onMarkCampaignAsPaid: (campaignId: string, payoutData: { amount: number, proofUrl: string, proofName: string, reference: string, note?: string }) => void;
  onUpdateUser?: (user: UniNestUser, originalEmail?: string) => void;
  onResetPassword?: (email: string, newPass: string) => void;
  escrows?: any[];
  onReleaseEscrow?: (id: string) => void;
  onRefundEscrow?: (id: string) => void;
  marketplaceItems?: any[];
  onDeleteMarketplaceItem?: (id: string) => void;
  accommodations?: any[];
  onToggleAccommodationAvailability?: (id: string) => void;
  onDeleteAccommodation?: (id: string) => void;
  stsSavingsAccounts?: any[];
  onToggleUserVendorTicker?: (email: string) => void;
  onUpdateSTSSavingsAccount?: (account: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminUser,
  users,
  stsAccounts,
  news,
  subscribers,
  adminLogs,
  crowdfundingCampaigns,
  onLogout,
  onAddNews,
  onDeleteNews,
  onToggleUserStatus,
  onAddLog,
  onApproveCampaign,
  onRejectCampaign,
  onMarkCampaignAsPaid,
  onUpdateUser,
  onResetPassword,
  stsSavingsAccounts = [],
  onUpdateSTSSavingsAccount,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'approvals' | 'live_support' | 'crowdfunding' | 'payment_settings' | 'users' | 'sts' | 'news' | 'newsletter' | 'head_of_marketplace' | 'scouts' | 'logs'>('overview');
  
  // Manual Savings Credit Modal State
  const [isCreditSavingsModalOpen, setIsCreditSavingsModalOpen] = useState(false);
  const [creditSavingsPreSelectedEmail, setCreditSavingsPreSelectedEmail] = useState<string | undefined>(undefined);
  const [stsViewMode, setStsViewMode] = useState<'savings' | 'temporary_stay'>('savings');
  const [stsSavingsSearch, setStsSavingsSearch] = useState('');

  const handleOpenCreditSavingsModal = (email?: string) => {
    setCreditSavingsPreSelectedEmail(email);
    setIsCreditSavingsModalOpen(true);
  };

  // User Management State (Edit Profile & Security Password Reset)
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UniNestUser | null>(null);
  const [userModalMode, setUserModalMode] = useState<'profile' | 'password'>('profile');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'student' | 'vendor' | 'admin'>('all');
  
  // Scouts Referral Data State
  const [scoutsList, setScoutsList] = useState(() => scoutReferralService.getScouts());
  const [scoutTxList, setScoutTxList] = useState(() => scoutReferralService.getTransactions());
  const [scoutPayouts, setScoutPayouts] = useState(() => scoutReferralService.getPayoutRequests());
  const [scoutSearchQuery, setScoutSearchQuery] = useState('');

  const refreshScoutData = () => {
    setScoutsList(scoutReferralService.getScouts());
    setScoutTxList(scoutReferralService.getTransactions());
    setScoutPayouts(scoutReferralService.getPayoutRequests());
  };
  const [newsTitle, setNewsTitle] = useState('');
  const [newsType, setNewsType] = useState<'scholarship' | 'strike' | 'school'>('scholarship');
  const [newsDesc, setNewsDesc] = useState('');
  const [newsSchool, setNewsSchool] = useState('All Nigerian Universities');
  const [newsSuccess, setNewsSuccess] = useState<string | null>(null);

  // Newsletter Broadcast State
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastCategory, setBroadcastCategory] = useState('Scholarship Alert');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<string | null>(null);

  // User search
  const [userSearch, setUserSearch] = useState('');

  const pendingCampaignCount = (crowdfundingCampaigns || []).filter(c => c.status === 'pending').length;
  const pendingApprovalsCount = approvalService.getPending().length;
  const liveChatUnreadCount = supportChatService.getConversations().reduce((acc, c) => acc + c.unreadAdminCount, 0);

  // Handle Add News
  const handleCreateNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle.trim() || !newsDesc.trim()) return;

    const newItem: NewsItem = {
      id: `news-${Date.now()}`,
      title: newsTitle.trim(),
      type: newsType,
      description: newsDesc.trim(),
      school: newsSchool,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      author: 'UniNest Administration'
    };

    onAddNews(newItem);
    onAddLog('Created News Bulletin', `Title: "${newsTitle.slice(0, 30)}..." [${newsType}]`);
    setNewsSuccess('News bulletin published successfully to student feed!');
    setNewsTitle('');
    setNewsDesc('');
    setTimeout(() => setNewsSuccess(null), 4000);
  };

  // Handle Newsletter Broadcast
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastSubject.trim() || !broadcastMessage.trim()) return;

    setBroadcastLoading(true);
    const res = await sendNewsletterBroadcast(
      subscribers,
      broadcastSubject,
      broadcastMessage,
      broadcastCategory
    );

    onAddLog('Dispatched Newsletter Broadcast', `Subject: ${broadcastSubject} to ${res.sentCount} subscribers`);
    setBroadcastLoading(false);
    setBroadcastResult(`Broadcast dispatched to ${res.sentCount} student subscribers!`);
    setBroadcastSubject('');
    setBroadcastMessage('');
    setTimeout(() => setBroadcastResult(null), 6000);
  };

  // Test New User Signup Email Alert to Admin
  const [testSignupEmailLoading, setTestSignupEmailLoading] = useState(false);
  const [testSignupEmailResult, setTestSignupEmailResult] = useState<string | null>(null);

  const handleSendTestSignupAlert = async () => {
    setTestSignupEmailLoading(true);
    setTestSignupEmailResult(null);
    const targetEmail = adminUser?.email || 'amaechihellis@gmail.com';
    const sampleUser = {
      name: 'Sample Nigerian Student (Test)',
      email: 'student.sample@ndu.edu.ng',
      phone: '08123456789',
      university: 'Niger Delta University (NDU)',
      department: 'Computer Science (200L)',
      role: 'student',
      createdAt: new Date().toLocaleString()
    };

    try {
      const res = await sendNewUserSignupAdminAlert(sampleUser, [targetEmail, 'admin@uninest.com']);
      setTestSignupEmailResult(`✅ Test Email Alert successfully dispatched to ${targetEmail} and admin mailbox!`);
      onAddLog('Tested Signup Email Alert', `Dispatched test registration alert to ${targetEmail}`);
    } catch (err: any) {
      setTestSignupEmailResult(`⚠️ Alert test triggered: ${err?.message || 'Check EmailJS console'}`);
    } finally {
      setTestSignupEmailLoading(false);
      setTimeout(() => setTestSignupEmailResult(null), 8000);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.email.toLowerCase().includes(userSearch.toLowerCase()) || 
      (u.phone && u.phone.includes(userSearch)) ||
      (u.name && u.name.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.university && u.university.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.businessName && u.businessName.toLowerCase().includes(userSearch.toLowerCase()));
    
    const matchesRole = userRoleFilter === 'all' || (u.role || 'student') === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const handleOpenEditUser = (targetUser: UniNestUser) => {
    setSelectedUserForEdit(targetUser);
    setUserModalMode('profile');
    setIsUserModalOpen(true);
  };

  const handleOpenResetPassword = (targetUser: UniNestUser) => {
    setSelectedUserForEdit(targetUser);
    setUserModalMode('password');
    setIsUserModalOpen(true);
  };

  return (
    <div id="admin-dashboard" className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col antialiased">
      {/* Top Institutional Header */}
      <header className="h-16 bg-slate-950 border-b border-slate-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3 shrink-0">
          <UniNestLogo size="md" inverted className="shrink-0" />
          <div className="h-4 w-px bg-slate-700 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-[11px] uppercase tracking-wider">
              ADMIN CONTROL PANEL
            </span>
            <span className="text-xs text-slate-400 hidden md:inline">
              Super Admin: <strong className="text-slate-200">{adminUser?.email || 'admin@uninest.com'}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Admin Profile & Photo Button */}
          <button
            type="button"
            onClick={() => handleOpenEditUser(adminUser)}
            id="btn-admin-header-profile"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/60 transition cursor-pointer group shadow-sm"
            title="Edit Admin Profile & Change Photo"
          >
            <div className="relative shrink-0">
              <img
                src={adminUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                alt="Admin Photo"
                className="w-7 h-7 rounded-lg object-cover border border-amber-400 group-hover:scale-105 transition"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-slate-950"></span>
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-[11px] font-bold text-white flex items-center gap-1 leading-tight">
                <span className="truncate max-w-[110px]">{adminUser?.name || 'Administrator'}</span>
                <Camera className="w-2.5 h-2.5 text-amber-400 group-hover:scale-125 transition shrink-0" />
              </div>
              <span className="text-[9px] text-amber-400 font-mono">Upload Photo</span>
            </div>
          </button>

          <DarkModeToggle showLabel={false} />
          <button
            onClick={onLogout}
            id="btn-admin-logout"
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition flex items-center gap-1.5 shrink-0"
            title="Sign out of Administrator console"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Sign Out Admin</span>
            <span className="sm:hidden">Logout</span>
          </button>
        </div>
      </header>

      {/* Admin Nav Tabs */}
      <div className="bg-slate-950/80 border-b border-slate-800 px-4 sm:px-8 flex items-center gap-2 overflow-x-auto py-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === 'overview'
              ? 'bg-amber-500 text-slate-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>System Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('approvals')}
          id="tab-admin-approvals"
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === 'approvals'
              ? 'bg-amber-500 text-slate-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
          <span>Approvals (Deposit &amp; Payout)</span>
          {pendingApprovalsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black animate-pulse">
              {pendingApprovalsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('payment_settings')}
          id="tab-admin-payment-settings"
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'payment_settings'
              ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
          <span>Official Bank &amp; Paystack</span>
        </button>

        <button
          onClick={() => setActiveTab('live_support')}
          id="tab-admin-live-support"
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === 'live_support'
              ? 'bg-amber-500 text-slate-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
          <span>Live Support Desk</span>
          {liveChatUnreadCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black animate-bounce">
              {liveChatUnreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('crowdfunding')}
          id="tab-admin-crowdfunding"
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === 'crowdfunding'
              ? 'bg-amber-500 text-slate-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <HeartHandshake className="w-3.5 h-3.5 text-orange-400" />
          <span>Crowdfunding &amp; Escrow</span>
          {pendingCampaignCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
              {pendingCampaignCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'bg-amber-500 text-slate-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>User Accounts ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sts')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === 'sts'
              ? 'bg-amber-500 text-slate-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>STS Registry ({stsAccounts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('news')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === 'news'
              ? 'bg-amber-500 text-slate-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Campus News Desk ({news.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('newsletter')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === 'newsletter'
              ? 'bg-amber-500 text-slate-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Newsletter Subscribers ({subscribers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('head_of_marketplace')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'head_of_marketplace'
              ? 'bg-[#FF6A00] text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#FF6A00]" />
          <span>Head of Marketplace (Vendor Ticks &amp; STS)</span>
        </button>

        <button
          onClick={() => {
            refreshScoutData();
            setActiveTab('scouts');
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === 'scouts'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>Campus Scouts (5% Hub)</span>
          <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px]">
            {scoutsList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === 'logs'
              ? 'bg-amber-500 text-slate-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Audit Logs</span>
        </button>
      </div>

      {/* Main Admin View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* ================= TAB 1: SYSTEM OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Admin Profile & Picture Quick Access Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="relative group shrink-0">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-md bg-slate-800">
                    <img
                      src={adminUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt="Admin Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenEditUser(adminUser)}
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow transition cursor-pointer"
                    title="Change Profile Photo"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-white">
                      {adminUser?.name || 'UniNest System Administrator'}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase">
                      Active Super Admin
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {adminUser?.email || 'admin@uninest.com'} • {adminUser?.phone || '08000000000'} • HQ Security Level 1
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleOpenEditUser(adminUser)}
                  className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Upload / Change Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenResetPassword(adminUser)}
                  className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin Password</span>
                </button>
              </div>
            </div>

            {/* Top Stat Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                  <span>REGISTERED STUDENTS</span>
                  <Users className="w-4 h-4 text-orange-400" />
                </div>
                <div className="text-3xl font-extrabold text-white font-mono">{users.length}</div>
                <p className="text-[11px] text-emerald-400">● OTP 2FA Verified Database</p>
              </div>

              <div 
                onClick={() => setActiveTab('crowdfunding')}
                className="p-5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 space-y-2 cursor-pointer transition"
              >
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                  <span>CROWDFUND ESCROW</span>
                  <HeartHandshake className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-3xl font-extrabold text-white font-mono">
                  ₦{(crowdfundingCampaigns || []).reduce((sum, c) => sum + (c.currentRaised || 0), 0).toLocaleString()}
                </div>
                <p className="text-[11px] text-amber-400">
                  {pendingCampaignCount > 0 ? `● ${pendingCampaignCount} Pending Approval` : 'All audited & live'}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                  <span>1/1 STS ACCOUNTS</span>
                  <Home className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-3xl font-extrabold text-white font-mono">{stsAccounts.length}</div>
                <p className="text-[11px] text-slate-400">Strict 1 Stay Limit Per Student</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                  <span>NEWSLETTER SUBSCRIBERS</span>
                  <Mail className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-3xl font-extrabold text-white font-mono">{subscribers.length}</div>
                <p className="text-[11px] text-slate-400">Scholarship &amp; Strike Alert List</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                  <span>PUBLISHED NEWS</span>
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-extrabold text-white font-mono">{news.length}</div>
                <p className="text-[11px] text-slate-400">Curated Nigerian Campus Bulletins</p>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quick Publish News */}
              <div className="p-6 rounded-3xl bg-slate-800/60 border border-slate-700 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Quick Dispatch: Campus News Bulletin</span>
                </h3>
                
                {newsSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                    {newsSuccess}
                  </div>
                )}

                <form onSubmit={handleCreateNews} className="space-y-3 text-xs">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Bulletin Headline (e.g. FG 2026 Scholarship Scheme)"
                      value={newsTitle}
                      onChange={(e) => setNewsTitle(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder:text-slate-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={newsType}
                      onChange={(e: any) => setNewsType(e.target.value)}
                      className="w-full h-10 px-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200"
                    >
                      <option value="scholarship">Scholarship Opportunity</option>
                      <option value="strike">ASUU/NASU Strike Update</option>
                      <option value="school">University Cut-Off / News</option>
                    </select>
                    <input
                      type="text"
                      placeholder="University / Scope"
                      value={newsSchool}
                      onChange={(e) => setNewsSchool(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100"
                    />
                  </div>
                  <div>
                    <textarea
                      required
                      rows={2}
                      placeholder="Full details of the announcement..."
                      value={newsDesc}
                      onChange={(e) => setNewsDesc(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder:text-slate-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full h-10 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Publish to All Students</span>
                  </button>
                </form>
              </div>

              {/* Quick Broadcast Email */}
              <div className="p-6 rounded-3xl bg-slate-800/60 border border-slate-700 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span>EmailJS Newsletter Broadcaster</span>
                </h3>

                {broadcastResult && (
                  <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
                    {broadcastResult}
                  </div>
                )}

                <form onSubmit={handleSendBroadcast} className="space-y-3 text-xs">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Newsletter Subject (e.g. Urgent ASUU Update)"
                      value={broadcastSubject}
                      onChange={(e) => setBroadcastSubject(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <textarea
                      required
                      rows={3}
                      placeholder="Broadcast message body to subscribers..."
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder:text-slate-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={broadcastLoading}
                    className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    <span>{broadcastLoading ? 'Broadcasting via EmailJS...' : `Broadcast to ${subscribers.length} Subscribers`}</span>
                  </button>
                </form>
              </div>

              {/* Real-Time Admin Email Alerts for New User Sign-Ups */}
              <div className="p-6 rounded-3xl bg-slate-800/60 border border-amber-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <span>New User Sign-Up Email Alerts</span>
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    ACTIVE
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  The system automatically delivers instant email alerts to the Admin whenever any new student or user completes registration on UniNest.
                </p>

                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-700/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Notification Mailboxes:</span>
                    <span className="text-amber-400 font-mono font-bold">2 Addresses Configured</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-200 space-y-0.5">
                    <div>1. <strong>{adminUser?.email || 'amaechihellis@gmail.com'}</strong> (Primary Admin)</div>
                    <div>2. <strong>admin@uninest.com</strong> (Institutional HQ)</div>
                  </div>
                </div>

                {testSignupEmailResult && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                    {testSignupEmailResult}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSendTestSignupAlert}
                  disabled={testSignupEmailLoading}
                  className="w-full h-10 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Send className="w-3.5 h-3.5 text-slate-950" />
                  <span>{testSignupEmailLoading ? 'Sending Test Alert via EmailJS...' : 'Send Test Sign-Up Alert to Admin Email'}</span>
                </button>
              </div>
            </div>

            {/* Quick Banner: Official Bank & Paystack Mode */}
            <div className="p-5 rounded-3xl bg-linear-to-r from-emerald-950/50 to-slate-900 border border-emerald-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Official Bank Account &amp; Paystack Switcher</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-black">
                      ACTIVE
                    </span>
                  </h4>
                  <p className="text-xs text-slate-300">
                    Switch student payment channels between Direct Bank Transfer, Automated Paystack Checkout, or Hybrid Mode.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('payment_settings')}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-md"
              >
                <span>Manage Bank &amp; Paystack</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB: DEPOSIT & WITHDRAWAL APPROVALS ================= */}
        {activeTab === 'approvals' && (
          <AdminApprovalsModule
            adminEmail={adminUser?.email || 'admin@uninest.com'}
            onAddLog={onAddLog}
            onOpenManualCreditModal={handleOpenCreditSavingsModal}
          />
        )}

        {/* ================= TAB: OFFICIAL BANK & PAYSTACK SETTINGS ================= */}
        {activeTab === 'payment_settings' && (
          <AdminPaymentSettingsModule
            adminEmail={adminUser?.email || 'admin@uninest.com'}
            onAddLog={onAddLog}
          />
        )}

        {/* ================= TAB: LIVE CUSTOMER SUPPORT CHAT ================= */}
        {activeTab === 'live_support' && (
          <AdminLiveSupportModule
            adminEmail={adminUser?.email || 'admin@uninest.com'}
            adminName={adminUser?.name || 'UniNest Support Lead'}
            onAddLog={onAddLog}
          />
        )}

        {/* ================= TAB 1.5: CROWDFUNDING & PAYSTACK ESCROW ================= */}
        {activeTab === 'crowdfunding' && (
          <AdminCrowdfundingModule
            campaigns={crowdfundingCampaigns || []}
            onApproveCampaign={onApproveCampaign}
            onRejectCampaign={onRejectCampaign}
            onMarkCampaignAsPaid={onMarkCampaignAsPaid}
            onAddLog={onAddLog}
          />
        )}

        {/* ================= TAB 2: USER ACCOUNTS & CREDENTIALS ================= */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  <span>Student &amp; User Accounts Directory</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Manage user profiles, edit registration details, or execute security password changes.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                {/* Credit Savings Button */}
                <button
                  type="button"
                  onClick={() => handleOpenCreditSavingsModal()}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-950 shrink-0"
                >
                  <PiggyBank className="w-3.5 h-3.5" />
                  <span>+ Credit Savings</span>
                </button>

                {/* Role Filter */}
                <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                  {(['all', 'student', 'vendor', 'admin'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setUserRoleFilter(r)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition cursor-pointer ${
                        userRoleFilter === r
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by name, email, phone..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-500"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">User Profile</th>
                    <th className="p-3">Email &amp; Campus</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">2FA Status</th>
                    <th className="p-3">Joined Date</th>
                    <th className="p-3 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        No accounts found matching your search query.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u, i) => (
                      <tr key={i} className="hover:bg-slate-900/50 transition">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <img 
                              src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80'} 
                              alt="avatar" 
                              className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0" 
                            />
                            <div>
                              <span className="font-bold text-white block text-xs">{u.name || 'UniNest User'}</span>
                              {u.department && (
                                <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">{u.department}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-mono text-slate-200 text-xs">{u.email}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[160px]">{u.university || 'General Campus'}</div>
                        </td>
                        <td className="p-3 font-mono text-slate-300">{u.phone || '—'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.role === 'admin' 
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                              : u.role === 'vendor'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {u.role || 'student'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.verified !== false
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {u.verified !== false ? 'Verified ✓' : 'Pending'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 font-mono text-[11px]">{u.createdAt}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenCreditSavingsModal(u.email)}
                              title="Increase student savings balance after manual payment"
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <PiggyBank className="w-3 h-3" />
                              <span>Credit Savings</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditUser(u)}
                              title="Edit user profile and university information"
                              className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit Details</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenResetPassword(u)}
                              title="Reset user password for security"
                              className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <Key className="w-3 h-3" />
                              <span>Change Password</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 3: STS REGISTRY & SAVINGS MANAGEMENT ================= */}
        {activeTab === 'sts' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <PiggyBank className="w-5 h-5 text-emerald-400" />
                  <span>Save Till Sign-Out (STS) &amp; Student Allocations</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Manage graduation savings balances, verify manual bank deposits, track 70% gift item eligibility, and monitor temporary stays.
                </p>
              </div>

              {/* Top Action Button */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleOpenCreditSavingsModal()}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer"
                >
                  <PiggyBank className="w-4 h-4" />
                  <span>+ Credit User Savings (Paid Manually)</span>
                </button>
              </div>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <button
                type="button"
                onClick={() => setStsViewMode('savings')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  stsViewMode === 'savings'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-white bg-slate-800/50'
                }`}
              >
                <PiggyBank className="w-4 h-4" />
                <span>STS Locked Savings Accounts</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-900 text-[10px] font-mono font-bold">
                  {stsSavingsAccounts.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStsViewMode('temporary_stay')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  stsViewMode === 'temporary_stay'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-white bg-slate-800/50'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Temporary Stay Allocations</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-900 text-[10px] font-mono font-bold">
                  {stsAccounts.length}
                </span>
              </button>
            </div>

            {stsViewMode === 'savings' ? (
              <div className="space-y-4">
                {/* Stats Bar */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Total Locked Savings</span>
                    <p className="text-xl font-black text-emerald-400 font-mono">
                      ₦{stsSavingsAccounts.reduce((sum, a) => sum + (a.currentBalance || 0), 0).toLocaleString()}
                    </p>
                    <span className="text-[10px] text-slate-500">Across student vaults</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Active Student Savers</span>
                    <p className="text-xl font-black text-white font-mono">{stsSavingsAccounts.length}</p>
                    <span className="text-[10px] text-slate-500">Registered STS accounts</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">70% Gift Qualified</span>
                    <p className="text-xl font-black text-amber-400 font-mono">
                      {stsSavingsAccounts.filter(a => (a.currentBalance || 0) >= ((a.targetAmount || 250000) * 0.7)).length}
                    </p>
                    <span className="text-[10px] text-emerald-400">Unlocked gift item rewards</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Average Target Goal</span>
                    <p className="text-xl font-black text-blue-400 font-mono">₦250,000</p>
                    <span className="text-[10px] text-slate-500">Final year sign-out target</span>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search saving students by name, email, or institution..."
                    value={stsSavingsSearch}
                    onChange={(e) => setStsSavingsSearch(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Savings Accounts Table */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[10px]">
                      <tr>
                        <th className="p-3">Student Saver</th>
                        <th className="p-3">STS Account #</th>
                        <th className="p-3">Target Goal</th>
                        <th className="p-3">Current Savings</th>
                        <th className="p-3">Progress / 70% Gift Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {stsSavingsAccounts
                        .filter(a => {
                          if (!stsSavingsSearch.trim()) return true;
                          const q = stsSavingsSearch.toLowerCase();
                          return (
                            (a.studentName || '').toLowerCase().includes(q) ||
                            (a.userEmail || '').toLowerCase().includes(q) ||
                            (a.university || '').toLowerCase().includes(q) ||
                            (a.stsAccountNumber || '').toLowerCase().includes(q)
                          );
                        })
                        .map((acc) => {
                          const target = acc.targetAmount || 250000;
                          const current = acc.currentBalance || 0;
                          const pct = Math.min(100, Math.round((current / target) * 100));
                          const is70Qualified = pct >= 70;

                          return (
                            <tr key={acc.id} className="hover:bg-slate-900/50 transition">
                              <td className="p-3">
                                <div>
                                  <span className="font-bold text-white text-xs block">{acc.studentName}</span>
                                  <span className="font-mono text-[11px] text-emerald-400 block">{acc.userEmail}</span>
                                  <span className="text-[10px] text-slate-400 block truncate max-w-xs">{acc.university}</span>
                                </div>
                              </td>

                              <td className="p-3">
                                <span className="font-mono text-xs font-bold text-slate-300 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                                  {acc.stsAccountNumber || `STS-${acc.id.slice(-6)}`}
                                </span>
                              </td>

                              <td className="p-3">
                                <span className="font-bold text-white text-xs block">{acc.targetGoalName}</span>
                                <span className="text-[10px] text-slate-500 font-mono">Target: ₦{target.toLocaleString()}</span>
                              </td>

                              <td className="p-3">
                                <strong className="text-emerald-400 font-mono text-sm block">
                                  ₦{current.toLocaleString()}
                                </strong>
                                {(acc.giftAccountBalance ?? acc.giftBalance ?? 0) > 0 && (
                                  <span className="text-[10px] text-amber-400/90 font-mono block">
                                    +₦{(acc.giftAccountBalance ?? acc.giftBalance ?? 0).toLocaleString()} Gift Bal
                                  </span>
                                )}
                              </td>

                              <td className="p-3">
                                <div className="space-y-1.5 min-w-[150px]">
                                  <div className="flex items-center justify-between text-[10px]">
                                    <span className="font-mono text-slate-400">{pct}%</span>
                                    {is70Qualified ? (
                                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 flex items-center gap-1">
                                        <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                                        <span>70% Gifts Unlocked!</span>
                                      </span>
                                    ) : (
                                      <span className="text-slate-500 text-[10px]">
                                        ₦{Math.max(0, Math.round(target * 0.7 - current)).toLocaleString()} to Gifts
                                      </span>
                                    )}
                                  </div>
                                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden relative">
                                    <div
                                      className={`h-full transition-all duration-500 ${
                                        is70Qualified ? 'bg-gradient-to-r from-emerald-500 to-amber-400' : 'bg-emerald-500'
                                      }`}
                                      style={{ width: `${pct}%` }}
                                    />
                                    {/* 70% marker line */}
                                    <div
                                      className="absolute top-0 bottom-0 w-0.5 bg-amber-400/80"
                                      style={{ left: '70%' }}
                                      title="70% Gift Reward Threshold"
                                    />
                                  </div>
                                </div>
                              </td>

                              <td className="p-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleOpenCreditSavingsModal(acc.userEmail)}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer ml-auto shadow-sm shadow-emerald-950"
                                >
                                  <PiggyBank className="w-3.5 h-3.5" />
                                  <span>Credit Balance</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* TEMPORARY STAY ALLOCATIONS VIEW */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stsAccounts.map((sts) => (
                  <div key={sts.id} className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                          1/1 STS ALLOCATION
                        </span>
                        <h4 className="text-base font-bold text-white">{sts.name}</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
                        Active
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl">
                      <div>
                        <span className="text-slate-500 block">University:</span>
                        <strong className="text-white">{sts.school}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Department:</span>
                        <strong className="text-white">{sts.department}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Duration:</span>
                        <strong className="text-amber-400">{sts.duration}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Assigned Lodge:</span>
                        <strong className="text-white">{sts.lodgeName || 'Royal Palm Haven'}</strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                      <span>Contact: {sts.phone}</span>
                      <span className="font-mono text-[11px]">ID: {sts.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 4: CAMPUS NEWS DESK ================= */}
        {activeTab === 'news' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Campus News Desk</h2>
                <p className="text-xs text-slate-400">Add, edit and manage scholarship bulletins and strike alerts.</p>
              </div>
            </div>

            {/* Add News Form */}
            <div className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700 space-y-3">
              <h4 className="text-sm font-bold text-white">Create New Campus Bulletin</h4>
              <form onSubmit={handleCreateNews} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      required
                      placeholder="Headline / Title"
                      value={newsTitle}
                      onChange={(e) => setNewsTitle(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <select
                      value={newsType}
                      onChange={(e: any) => setNewsType(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    >
                      <option value="scholarship">Scholarship</option>
                      <option value="strike">Strike Alert (ASUU/NASU)</option>
                      <option value="school">School News / Cut-Off</option>
                    </select>
                  </div>
                </div>
                <div>
                  <textarea
                    required
                    rows={2}
                    placeholder="Announcement description and details..."
                    value={newsDesc}
                    onChange={(e) => setNewsDesc(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold transition"
                >
                  Publish Bulletin
                </button>
              </form>
            </div>

            {/* News List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {news.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-2 relative">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item.type === 'scholarship' ? 'bg-emerald-500/20 text-emerald-400' :
                      item.type === 'strike' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {item.type}
                    </span>
                    <button
                      onClick={() => {
                        onDeleteNews(item.id);
                        onAddLog('Deleted News Item', item.title);
                      }}
                      className="text-rose-400 hover:text-rose-300 p-1"
                      title="Delete News"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h4 className="text-sm font-bold text-white">{item.title}</h4>
                  <p className="text-xs text-slate-300 line-clamp-3">{item.description}</p>
                  <div className="text-[10px] text-slate-500 font-mono pt-1">{item.date} • {item.school}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 5: NEWSLETTER SUBSCRIBERS ================= */}
        {activeTab === 'newsletter' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-white">Newsletter Audience ({subscribers.length})</h2>
              <p className="text-xs text-slate-400">Students receiving verified Nigerian university alerts.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {subscribers.map((email, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono flex items-center justify-between">
                    <span className="text-slate-200 truncate">{email}</span>
                    <span className="text-emerald-400 text-[10px] font-bold">Active</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: CAMPUS SCOUTS & 5% COMMISSIONS ================= */}
        {activeTab === 'scouts' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span>Campus Scouts &amp; 5% Referral Commission Hub</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Monitor active student scouts, track 5% commission payouts, and audit referral links.
                </p>
              </div>
              <button
                type="button"
                onClick={refreshScoutData}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Data</span>
              </button>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Registered Scouts</span>
                <p className="text-2xl font-black text-white">{scoutsList.length}</p>
                <span className="text-[11px] text-amber-400">Across Nigerian Campuses</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Gross Client Volume</span>
                <p className="text-2xl font-black text-emerald-400">
                  ₦{scoutsList.reduce((acc, s) => acc + (s.totalEarnings ? Math.round(s.totalEarnings / (s.commissionRate || 0.05)) : 0), 0).toLocaleString()}
                </p>
                <span className="text-[11px] text-slate-400">Paid via Scout Links</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total 5% Commission</span>
                <p className="text-2xl font-black text-amber-300">
                  ₦{scoutsList.reduce((acc, s) => acc + (s.totalEarnings || 0), 0).toLocaleString()}
                </p>
                <span className="text-[11px] text-slate-400">Calculated at 5% rate</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Disbursed to Bank</span>
                <p className="text-2xl font-black text-blue-400">
                  ₦{scoutsList.reduce((acc, s) => acc + (s.totalWithdrawn || 0), 0).toLocaleString()}
                </p>
                <span className="text-[11px] text-slate-400">Via Instant NIP Transfer</span>
              </div>
            </div>

            {/* Registered Scouts Table */}
            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>Campus Scouts Directory</span>
                </h3>
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={scoutSearchQuery}
                    onChange={(e) => setScoutSearchQuery(e.target.value)}
                    placeholder="Search by name, code, school..."
                    className="w-full h-8 pl-8 pr-3 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-700">
                    <tr>
                      <th className="p-3">Scout</th>
                      <th className="p-3">Dedicated Code</th>
                      <th className="p-3">Institution</th>
                      <th className="p-3 text-right">Volume</th>
                      <th className="p-3 text-right">5% Earned</th>
                      <th className="p-3 text-right">Balance</th>
                      <th className="p-3">Bank Details</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {scoutsList
                      .filter(s => 
                        !scoutSearchQuery ||
                        s.name.toLowerCase().includes(scoutSearchQuery.toLowerCase()) ||
                        s.scoutCode.toLowerCase().includes(scoutSearchQuery.toLowerCase()) ||
                        s.university.toLowerCase().includes(scoutSearchQuery.toLowerCase())
                      )
                      .map((scout) => (
                        <tr key={scout.id} className="hover:bg-slate-800/40">
                          <td className="p-3">
                            <div className="font-bold text-white">{scout.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{scout.email}</div>
                          </td>
                          <td className="p-3 font-mono font-bold text-amber-400">
                            {scout.scoutCode}
                          </td>
                          <td className="p-3 max-w-[150px] truncate text-slate-300">
                            {scout.university}
                          </td>
                          <td className="p-3 text-right font-mono text-emerald-400 font-semibold">
                            ₦{(scout.totalEarnings ? Math.round(scout.totalEarnings / (scout.commissionRate || 0.05)) : 0).toLocaleString()}
                          </td>
                          <td className="p-3 text-right font-mono text-amber-300 font-bold">
                            ₦{(scout.totalEarnings || 0).toLocaleString()}
                          </td>
                          <td className="p-3 text-right font-mono text-white font-bold">
                            ₦{(scout.availableBalance || 0).toLocaleString()}
                          </td>
                          <td className="p-3 text-[11px]">
                            {scout.bankName ? (
                              <div>
                                <div className="text-white font-semibold">{scout.bankName}</div>
                                <div className="font-mono text-slate-400">{scout.accountNumber}</div>
                              </div>
                            ) : (
                              <span className="text-slate-500 italic">Not added</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Active
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Commission Transactions */}
            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-4">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span>Recent 5% Referral Transactions Audit</span>
              </h3>

              <div className="space-y-2">
                {scoutTxList.slice(0, 10).map((tx) => (
                  <div key={tx.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                          {tx.scoutCode}
                        </span>
                        <span className="font-bold text-white">{tx.serviceType}</span>
                        <span className="text-slate-400">• Paid by {tx.clientName} ({tx.clientUniversity})</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{tx.serviceDescription}</p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 sm:text-right">
                      <div>
                        <div className="text-[11px] text-slate-400">Payment: ₦{(tx.grossAmount || 0).toLocaleString()}</div>
                        <div className="font-mono font-extrabold text-amber-400 text-sm">
                          +₦{(tx.commissionAmount || 0).toLocaleString()} (5%)
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{tx.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payouts Disbursed Log */}
            {scoutPayouts.length > 0 && (
              <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-4">
                <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  <span>Scout Payout Disbursals</span>
                </h3>

                <div className="space-y-2">
                  {scoutPayouts.map((po) => (
                    <div key={po.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-white">{po.scoutName}</span>
                        <span className="text-slate-400 ml-2">({po.bankName} - {po.accountNumber})</span>
                        <div className="text-[10px] font-mono text-slate-500">{po.transferReference}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-black text-emerald-400 text-sm">
                          ₦{(po.amount || 0).toLocaleString()}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                          Disbursed
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB: HEAD OF MARKETPLACE (VENDOR TICKS & STS) ================= */}
        {activeTab === 'head_of_marketplace' && (
          <HeadOfMarketplaceModule />
        )}

        {/* ================= TAB 6: AUDIT LOGS ================= */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-white">Admin Security &amp; Activity Audit</h2>
              <p className="text-xs text-slate-400">Stored in `uninest_admin_logs`.</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2">
              {adminLogs.map((log) => (
                <div key={log.id} className="p-2.5 rounded-xl bg-slate-900 text-xs flex items-center justify-between border border-slate-800/50">
                  <div>
                    <strong className="text-amber-400">{log.action}</strong>
                    {log.details && <span className="text-slate-300 ml-2">— {log.details}</span>}
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{log.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Admin User Management Modal (Profile Edit & Security Password Reset) */}
      {isUserModalOpen && selectedUserForEdit && (
        <AdminUserManagementModal
          user={selectedUserForEdit}
          isOpen={isUserModalOpen}
          initialMode={userModalMode}
          onClose={() => {
            setIsUserModalOpen(false);
            setSelectedUserForEdit(null);
          }}
          onUpdateUser={(updatedUser, originalEmail) => {
            if (onUpdateUser) {
              onUpdateUser(updatedUser, originalEmail);
            }
            setSelectedUserForEdit(updatedUser);
          }}
          onResetPassword={(email, newPass) => {
            if (onResetPassword) {
              onResetPassword(email, newPass);
            }
          }}
          onAddLog={onAddLog}
        />
      )}

      {/* Admin Manual Savings Credit Modal */}
      <AdminCreditSavingsModal
        isOpen={isCreditSavingsModalOpen}
        onClose={() => {
          setIsCreditSavingsModalOpen(false);
          setCreditSavingsPreSelectedEmail(undefined);
        }}
        users={users}
        stsSavingsAccounts={stsSavingsAccounts}
        preSelectedUserEmail={creditSavingsPreSelectedEmail}
        adminEmail={adminUser?.email || 'admin@uninest.com'}
        onAddLog={onAddLog}
        onSuccessCredit={(result) => {
          if (onUpdateSTSSavingsAccount && result.account) {
            onUpdateSTSSavingsAccount(result.account);
          }
        }}
      />
    </div>
  );
};
