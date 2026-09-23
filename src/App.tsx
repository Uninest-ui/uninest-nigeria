import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import { 
  UniNestUser, 
  STSAccount, 
  STSSavingsAccount, 
  NewsItem, 
  AdminLog,
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
  CrowdfundingCampaign,
  CrowdfundingDonation
} from './types';
import { 
  INITIAL_USERS, 
  INITIAL_STS_ACCOUNTS, 
  INITIAL_STS_SAVINGS_ACCOUNTS,
  INITIAL_BAYELSA_ROOMMATES,
  INITIAL_ACCOMMODATIONS,
  INITIAL_ACADEMIC_REQUESTS,
  INITIAL_MARKETPLACE_ITEMS,
  INITIAL_ESCROWS,
  INITIAL_DATA_ORDERS,
  INITIAL_NEWS, 
  INITIAL_SUBSCRIBERS,
  DEFAULT_ADMIN,
  INITIAL_VERIFIED_BUSINESSES,
  INITIAL_TESTIMONIALS,
  INITIAL_PHONE_NOTIFICATIONS,
  INITIAL_FAQS,
  INITIAL_STUDENT_QUESTIONS,
  INITIAL_CROWDFUNDING_CAMPAIGNS
} from './data/uninestData';
import { AuthCard } from './components/AuthCard';
import { StudentDashboard } from './components/StudentDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { GuestDashboard } from './components/GuestDashboard';
import { sendStudentGiftEmail, sendCampusNewsNotificationEmail } from './services/emailService';
import { supabase, insertSignupProfileToSupabase, fetchProfilesFromSupabase, updateProfileInSupabase } from './lib/supabaseService';
import { approvalService } from './utils/approvalService';

export const App: React.FC = () => {
  // App view modes: 'auth' | 'student' | 'admin' | 'guest'
  const [currentView, setCurrentView] = useState<'auth' | 'student' | 'admin' | 'guest'>('auth');
  const [currentUser, setCurrentUser] = useState<UniNestUser | null>(null);

  // Persistent States with localStorage fallback
  const [users, setUsers] = useState<UniNestUser[]>(() => {
    try {
      const saved = localStorage.getItem('uninest_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const DEMO_EMAILS = new Set([
            'student@campus.edu',
            'vendor@campus.edu',
            'gadgets.bayelsa@gmail.com',
            'hostel.kitchen@yahoo.com',
            'chinedu.student@gmail.com',
            'amara.n@unilag.edu.ng',
            'tariere.ebimobowei@ndu.edu.ng',
            'kemegha.ayiba@fuotuoke.edu.ng',
            'ebi.preye@bmu.edu.ng',
            'chukwuma.eze@fuotuoke.edu.ng',
            'tariere@uninest.ng',
            'preye.bmu@uninest.ng',
            'ayomide.balogun@uninest.ng',
            'victor.okon@ndu.edu.ng',
            'blessing.jumbo@ndu.edu.ng',
            'samuel.tammy@ndu.edu.ng',
            'chinelo.eze@ndu.edu.ng',
            'david.timi@ndu.edu.ng',
            'kemi.adeleke@bmu.edu.ng'
          ]);

          // Strip out all demo users
          const realUsers = parsed.filter((u: any) => {
            const email = (u.email || '').toLowerCase().trim();
            if (DEMO_EMAILS.has(email)) return false;
            if (u.id && (u.id.startsWith('demo-') || u.id.startsWith('mock-'))) return false;
            return true;
          });

          // Ensure admin user is always present
          const hasAdmin = realUsers.some((u: any) => 
            u.role === 'admin' || 
            (u.email && (u.email.toLowerCase() === 'admin@uninest.com' || u.email.toLowerCase() === 'amaechihellis@gmail.com'))
          );
          const combined = hasAdmin ? realUsers : [DEFAULT_ADMIN, ...realUsers];
          
          // Ensure admin user is healthy and all users have spendable wallet & gifting balances reset to ₦0 (welcome ₦500 is in their locked STS vault)
          const normalized = combined.map(u => {
            if (u.role === 'admin' || (u.email && (u.email.toLowerCase() === 'admin@uninest.com' || u.email.toLowerCase() === 'amaechihellis@gmail.com'))) {
              return { ...DEFAULT_ADMIN, ...u, role: 'admin' as const, password: u.password || 'Admin@123' };
            }
            const rawGift = (u as any).giftBalance;
            const cleanGift = (rawGift === 100000 || rawGift === 15000 || rawGift === 500 || rawGift === undefined) ? 0 : rawGift;
            const rawWallet = (u as any).walletBalance;
            const cleanWallet = (rawWallet === 33000 || rawWallet === 500 || rawWallet === undefined) ? 0 : rawWallet;
            return {
              ...u,
              giftBalance: cleanGift,
              walletBalance: cleanWallet
            };
          });

          localStorage.setItem('uninest_users', JSON.stringify(normalized));
          return normalized;
        }
      }
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem('uninest_users', JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  });

  const [stsAccounts, setStsAccounts] = useState<STSAccount[]>(() => {
    try {
      const saved = localStorage.getItem('sts_accounts');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem('sts_accounts', JSON.stringify(INITIAL_STS_ACCOUNTS));
    return INITIAL_STS_ACCOUNTS;
  });

  // 1. STS Save Till Sign-Out Accounts
  const [stsSavingsAccounts, setStsSavingsAccounts] = useState<STSSavingsAccount[]>(() => {
    try {
      const saved = localStorage.getItem('sts_savings_accounts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const sanitized = parsed.map((acc: any) => {
            const curBal = typeof acc.currentBalance === 'number' && acc.currentBalance !== 33000 ? acc.currentBalance : 500;
            const rawGift = acc.giftAccountBalance ?? acc.giftBalance ?? 0;
            const cleanGift = (rawGift === 100000 || rawGift === 15000 || rawGift === 500) ? 0 : rawGift;
            return {
              ...acc,
              currentBalance: curBal, // Welcome 500 is in STS lock vault
              giftAccountBalance: cleanGift, // 0 for initial gifting account
              giftBalance: cleanGift,
              walletBalance: curBal + cleanGift
            };
          });
          localStorage.setItem('sts_savings_accounts', JSON.stringify(sanitized));
          return sanitized;
        }
      }
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem('sts_savings_accounts', JSON.stringify(INITIAL_STS_SAVINGS_ACCOUNTS));
    return INITIAL_STS_SAVINGS_ACCOUNTS;
  });

  // 2. Bayelsa Roommate Profiles (Demo profiles removed; only student-posted requests)
  const [roommates, setRoommates] = useState<BayelsaRoommateProfile[]>(() => {
    try {
      const saved = localStorage.getItem('uninest_bayelsa_roommates');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((r: any) => !r.id?.startsWith('bm-') && !r.id?.startsWith('demo-') && !r.id?.startsWith('roommate-'));
          localStorage.setItem('uninest_bayelsa_roommates', JSON.stringify(filtered));
          return filtered;
        }
      }
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem('uninest_bayelsa_roommates', JSON.stringify([]));
    return [];
  });

  // Accommodations Listing (Community & Student posted only - generated lodges removed)
  const [accommodations, setAccommodations] = useState<AccommodationListing[]>(() => {
    try {
      const saved = localStorage.getItem('uninest_accommodations');
      if (saved) {
        const parsed = JSON.parse(saved);
        const filtered = Array.isArray(parsed) ? parsed.filter((a: any) => a && a.id && !a.id.startsWith('acc-') && !a.id.startsWith('lodge-') && !a.id.startsWith('demo-')) : [];
        localStorage.setItem('uninest_accommodations', JSON.stringify(filtered));
        return filtered;
      }
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem('uninest_accommodations', JSON.stringify([]));
    return [];
  });

  // 3. Academic Assist Requests
  const [academicRequests, setAcademicRequests] = useState<AcademicAssistRequest[]>(() => {
    try {
      const saved = localStorage.getItem('uninest_academic_requests');
      if (saved) {
        const parsed = JSON.parse(saved);
        const filtered = Array.isArray(parsed) ? parsed.filter((ar: any) => ar && ar.id && !ar.id.startsWith('acad-0') && !ar.id.startsWith('demo-')) : [];
        localStorage.setItem('uninest_academic_requests', JSON.stringify(filtered));
        return filtered;
      }
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem('uninest_academic_requests', JSON.stringify([]));
    return [];
  });

  // 4. Marketplace Items & Escrows (Community & Student posted only - generated goods removed)
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>(() => {
    try {
      const saved = localStorage.getItem('uninest_marketplace_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        const filtered = Array.isArray(parsed) ? parsed.filter((m: any) => m && m.id && !m.id.startsWith('mkt-') && !m.id.startsWith('demo-') && !m.id.startsWith('item-0')) : [];
        localStorage.setItem('uninest_marketplace_items', JSON.stringify(filtered));
        return filtered;
      }
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem('uninest_marketplace_items', JSON.stringify([]));
    return [];
  });

  const [escrows, setEscrows] = useState<EscrowTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('uninest_escrows');
      if (saved) {
        const parsed = JSON.parse(saved);
        const filtered = Array.isArray(parsed) ? parsed.filter((e: any) => e && e.id && !e.id.startsWith('esc-') && !e.id.startsWith('demo-') && !e.id.startsWith('ESC-0')) : [];
        localStorage.setItem('uninest_escrows', JSON.stringify(filtered));
        return filtered;
      }
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem('uninest_escrows', JSON.stringify([]));
    return [];
  });

  // 5. Cheap Data Orders
  const [dataOrders, setDataOrders] = useState<DataOrder[]>(() => {
    try {
      const saved = localStorage.getItem('uninest_data_orders');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem('uninest_data_orders', JSON.stringify(INITIAL_DATA_ORDERS));
    return INITIAL_DATA_ORDERS;
  });

  const [news, setNews] = useState<NewsItem[]>(() => {
    try {
      const saved = localStorage.getItem('uninest_news');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem('uninest_news', JSON.stringify(INITIAL_NEWS));
    return INITIAL_NEWS;
  });

  const [subscribers, setSubscribers] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('uninest_newsletter_subscribers');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem('uninest_newsletter_subscribers', JSON.stringify(INITIAL_SUBSCRIBERS));
    return INITIAL_SUBSCRIBERS;
  });

  const [adminLogs, setAdminLogs] = useState<AdminLog[]>(() => {
    try {
      const saved = localStorage.getItem('uninest_admin_logs');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    const initLogs: AdminLog[] = [
      {
        id: 'log-1',
        action: 'System Initialized',
        email: 'system',
        date: new Date().toLocaleDateString(),
        details: 'UniNest 5 Core Services Online: STS Savings & Loans, Roommates & Housing, Academic Assist, Escrow & Cheap Data'
      }
    ];
    localStorage.setItem('uninest_admin_logs', JSON.stringify(initLogs));
    return initLogs;
  });

  // Verified Scouts & Marketplace (2 Official Profiles Only: Scout & Marketplace)
  const [verifiedBusinesses, setVerifiedBusinesses] = useState<VerifiedBusiness[]>(() => {
    try {
      const saved = localStorage.getItem('uninest_verified_profiles_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 2 && parsed.some((b: any) => b.id === 'biz-head-scouts')) {
          return parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem('uninest_verified_profiles_v4', JSON.stringify(INITIAL_VERIFIED_BUSINESSES));
    return INITIAL_VERIFIED_BUSINESSES;
  });

  // Student Testimonials
  const [testimonials, setTestimonials] = useState<StudentTestimonial[]>(() => {
    try {
      const saved = localStorage.getItem('uninest_testimonials');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem('uninest_testimonials', JSON.stringify(INITIAL_TESTIMONIALS));
    return INITIAL_TESTIMONIALS;
  });

  // Campus Phone Alerts (Gifting is strictly exempt; sent to email)
  const [phoneNotifications, setPhoneNotifications] = useState<PhoneNotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('uninest_phone_notifications');
      if (saved) {
        const parsed: PhoneNotificationItem[] = JSON.parse(saved);
        return parsed.filter(n => n.category !== 'Student Gifting' && !n.title.toLowerCase().includes('student gift'));
      }
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem('uninest_phone_notifications', JSON.stringify(INITIAL_PHONE_NOTIFICATIONS));
    return INITIAL_PHONE_NOTIFICATIONS;
  });

  // FAQs
  const [faqs] = useState<FAQItem[]>(() => {
    try {
      const saved = localStorage.getItem('uninest_faqs');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem('uninest_faqs', JSON.stringify(INITIAL_FAQS));
    return INITIAL_FAQS;
  });

  // Cross-Campus Student Questions (Demo accounts & questions removed)
  const [studentQuestions, setStudentQuestions] = useState<StudentQuestion[]>(() => {
    try {
      const saved = localStorage.getItem('uninest_student_questions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const demoIds = ['q-001', 'q-002', 'q-003'];
          const demoEmails = [
            'ebi.tonye@fuotuoke.edu.ng',
            'precious.alagoa@ndu.edu.ng',
            'oghene.k@delsu.edu.ng',
            'student@campus.edu',
            'tariere.preye@bmu.edu.ng'
          ];
          const filtered = parsed.filter(
            (q: any) =>
              !demoIds.includes(q.id) &&
              !demoEmails.includes(q.authorEmail?.toLowerCase())
          );
          localStorage.setItem('uninest_student_questions', JSON.stringify(filtered));
          return filtered;
        }
      }
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem('uninest_student_questions', JSON.stringify([]));
    return [];
  });

  // Crowdfunding Campaigns & Paystack Escrow
  const [crowdfundingCampaigns, setCrowdfundingCampaigns] = useState<CrowdfundingCampaign[]>(() => {
    try {
      const saved = localStorage.getItem('uninest_crowdfunding_campaigns');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem('uninest_crowdfunding_campaigns', JSON.stringify(INITIAL_CROWDFUNDING_CAMPAIGNS));
    return INITIAL_CROWDFUNDING_CAMPAIGNS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('uninest_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('sts_accounts', JSON.stringify(stsAccounts));
  }, [stsAccounts]);

  useEffect(() => {
    localStorage.setItem('sts_savings_accounts', JSON.stringify(stsSavingsAccounts));
  }, [stsSavingsAccounts]);

  // Synchronize STS savings state across modules on finance updates
  useEffect(() => {
    const handleFinanceUpdate = () => {
      try {
        const raw = localStorage.getItem('sts_savings_accounts');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setStsSavingsAccounts(parsed);
          }
        }
      } catch (e) {
        console.error('Failed to reload STS savings on finance update:', e);
      }
    };
    window.addEventListener('uninest_finance_update', handleFinanceUpdate);
    window.addEventListener('sts_savings_updated', handleFinanceUpdate);
    return () => {
      window.removeEventListener('uninest_finance_update', handleFinanceUpdate);
      window.removeEventListener('sts_savings_updated', handleFinanceUpdate);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('uninest_bayelsa_roommates', JSON.stringify(roommates));
  }, [roommates]);

  useEffect(() => {
    localStorage.setItem('uninest_academic_requests', JSON.stringify(academicRequests));
  }, [academicRequests]);

  useEffect(() => {
    localStorage.setItem('uninest_marketplace_items', JSON.stringify(marketplaceItems));
  }, [marketplaceItems]);

  useEffect(() => {
    localStorage.setItem('uninest_verified_profiles_v3', JSON.stringify(verifiedBusinesses));
  }, [verifiedBusinesses]);

  useEffect(() => {
    localStorage.setItem('uninest_testimonials', JSON.stringify(testimonials));
  }, [testimonials]);

  useEffect(() => {
    localStorage.setItem('uninest_phone_notifications', JSON.stringify(phoneNotifications));
  }, [phoneNotifications]);

  useEffect(() => {
    localStorage.setItem('uninest_escrows', JSON.stringify(escrows));
  }, [escrows]);

  useEffect(() => {
    localStorage.setItem('uninest_data_orders', JSON.stringify(dataOrders));
  }, [dataOrders]);

  useEffect(() => {
    localStorage.setItem('uninest_news', JSON.stringify(news));
  }, [news]);

  useEffect(() => {
    localStorage.setItem('uninest_newsletter_subscribers', JSON.stringify(subscribers));
  }, [subscribers]);

  useEffect(() => {
    localStorage.setItem('uninest_admin_logs', JSON.stringify(adminLogs));
  }, [adminLogs]);

  useEffect(() => {
    localStorage.setItem('uninest_student_questions', JSON.stringify(studentQuestions));
  }, [studentQuestions]);

  useEffect(() => {
    localStorage.setItem('uninest_crowdfunding_campaigns', JSON.stringify(crowdfundingCampaigns));
  }, [crowdfundingCampaigns]);

  // Check saved session on mount
  const sanitizeUserBalance = (u: UniNestUser): UniNestUser => {
    if (u.role === 'admin' || (u.email && (u.email.toLowerCase() === 'admin@uninest.com' || u.email.toLowerCase() === 'amaechihellis@gmail.com'))) {
      return u;
    }
    const rawGift = u.giftBalance;
    const cleanGift = (rawGift === 100000 || rawGift === 15000 || rawGift === 500 || rawGift === undefined) ? 0 : rawGift;
    const rawWallet = u.walletBalance;
    const cleanWallet = (rawWallet === 33000 || rawWallet === 500 || rawWallet === undefined) ? 0 : rawWallet;
    return {
      ...u,
      giftBalance: cleanGift,
      walletBalance: cleanWallet
    };
  };

  useEffect(() => {
    try {
      const savedSession = localStorage.getItem('uninest_current_user');
      if (savedSession) {
        const { email } = JSON.parse(savedSession);
        if (email) {
          const emailLower = email.toLowerCase();
          const adminAccount = users.find(u => u.role === 'admin');
          if (emailLower === 'admin@uninest.com' || emailLower === 'amaechihellis@gmail.com' || (adminAccount && emailLower === adminAccount.email.toLowerCase())) {
            const adminFound = adminAccount || DEFAULT_ADMIN;
            setCurrentUser(adminFound);
            setCurrentView('admin');
          } else {
            const found = users.find(u => u.email.toLowerCase() === emailLower);
            if (found) {
              const cleanFound = sanitizeUserBalance(found);
              setCurrentUser(cleanFound);
              setCurrentView(cleanFound.role === 'admin' ? 'admin' : 'student');
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Synchronize profiles table from Supabase on boot
  useEffect(() => {
    fetchProfilesFromSupabase().then(supabaseUsers => {
      if (supabaseUsers && supabaseUsers.length > 0) {
        const DEMO_EMAILS = new Set([
          'student@campus.edu',
          'vendor@campus.edu',
          'gadgets.bayelsa@gmail.com',
          'hostel.kitchen@yahoo.com',
          'chinedu.student@gmail.com',
          'amara.n@unilag.edu.ng',
          'tariere.ebimobowei@ndu.edu.ng',
          'kemegha.ayiba@fuotuoke.edu.ng',
          'ebi.preye@bmu.edu.ng',
          'chukwuma.eze@fuotuoke.edu.ng',
          'tariere@uninest.ng',
          'preye.bmu@uninest.ng',
          'ayomide.balogun@uninest.ng',
          'victor.okon@ndu.edu.ng',
          'blessing.jumbo@ndu.edu.ng',
          'samuel.tammy@ndu.edu.ng',
          'chinelo.eze@ndu.edu.ng',
          'david.timi@ndu.edu.ng',
          'kemi.adeleke@bmu.edu.ng'
        ]);

        setUsers(prev => {
          const map = new Map<string, UniNestUser>();
          prev.forEach(u => map.set(u.email.toLowerCase(), u));
          supabaseUsers.forEach(su => {
            if (DEMO_EMAILS.has(su.email.toLowerCase())) return;
            const cleaned = sanitizeUserBalance(su);
            const existing = map.get(cleaned.email.toLowerCase());
            if (existing) {
              map.set(cleaned.email.toLowerCase(), { ...existing, ...cleaned });
            } else {
              map.set(cleaned.email.toLowerCase(), cleaned);
            }
          });
          return Array.from(map.values());
        });
      }
    }).catch(err => {
      console.log('ℹ️ Supabase sync notice:', err);
    });
  }, []);

  // Logger helper
  const addAdminLog = (action: string, details?: string) => {
    const newLog: AdminLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      action,
      email: currentUser?.email || 'admin@uninest.com',
      date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
      details
    };
    setAdminLogs(prev => [newLog, ...prev]);
  };

  // User Actions
  const handleRegisterUser = (newUser: UniNestUser) => {
    // New students receive ₦0 in spendable wallet and ₦0 in gift account.
    // The welcome bonus of ₦500 is locked strictly in their STS Vault.
    const userWithBalances: UniNestUser = {
      ...newUser,
      walletBalance: typeof (newUser as any).walletBalance === 'number' && (newUser as any).walletBalance !== 33000 ? (newUser as any).walletBalance : 0,
      giftBalance: typeof (newUser as any).giftBalance === 'number' && (newUser as any).giftBalance !== 100000 && (newUser as any).giftBalance !== 15000 ? (newUser as any).giftBalance : 0
    };
    setUsers(prev => [...prev, userWithBalances]);

    // On signup, insert into profiles table with 0 spendable balance
    insertSignupProfileToSupabase(userWithBalances).catch(err => {
      console.error('Failed to save new user to Supabase profiles:', err);
    });

    // Create STS savings account for new user: ₦500 welcome bonus is in their STS Lock Vault (not in gifting spendable account)
    const newStsSavings: STSSavingsAccount = {
      id: `sts-sav-${Date.now()}`,
      userEmail: userWithBalances.email,
      studentName: userWithBalances.name || 'Student',
      university: userWithBalances.university || 'Nigerian University',
      department: userWithBalances.department || 'General Studies',
      currentLevel: '100L',
      expectedSignOutYear: '2028',
      targetAmount: 300000,
      currentBalance: 500, // Welcome bonus of 500 is in their STS Lock vault
      giftAccountBalance: 0, // Distinct gifting account (starts at 0)
      giftBalance: 0,
      walletBalance: 500, // Total net (500 locked vault + 0 spendable gift)
      monthlyContribution: 10000,
      savingsFrequency: 'monthly',
      startDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      status: 'active',
      isActivated: false, // New user must pay 500 first to open form and start using STS vault (confirmed by admin)
      activationFeePaid: false,
      activeLoan: null,
      transactions: [
        {
          id: `tx-${Date.now()}`,
          type: 'deposit',
          amount: 500,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          description: 'Welcome Sign-up Bonus (₦500 Locked in STS Vault)',
          balanceAfter: 500
        }
      ]
    };
    setStsSavingsAccounts(prev => [...prev, newStsSavings]);
    addAdminLog('New Student Sign Up & STS Account Bootstrapped (₦500 in STS Vault)', userWithBalances.email);
  };

  const handleUpdatePassword = (emailOrPhone: string, newPass: string) => {
    const target = emailOrPhone.trim().toLowerCase();
    setUsers(prev => prev.map(u => {
      if (
        u.email.toLowerCase() === target || 
        u.phone.replace(/[^0-9]/g, '') === target.replace(/[^0-9]/g, '') ||
        (target === 'admin' && u.role === 'admin')
      ) {
        return { ...u, password: newPass };
      }
      return u;
    }));
    if (currentUser && (
      currentUser.email.toLowerCase() === target || 
      currentUser.phone.replace(/[^0-9]/g, '') === target.replace(/[^0-9]/g, '') ||
      (target === 'admin' && currentUser.role === 'admin')
    )) {
      setCurrentUser(prev => prev ? { ...prev, password: newPass } : null);
    }
    addAdminLog('Password Reset via OTP', emailOrPhone);
  };

  const handleCreateSTS = (newSTS: STSAccount) => {
    setStsAccounts(prev => {
      const filtered = prev.filter(a => a.userEmail.toLowerCase() !== newSTS.userEmail.toLowerCase());
      return [...filtered, newSTS];
    });
    addAdminLog('Created 1/1 STS Stay Allocation', `${newSTS.name} (${newSTS.school})`);
  };

  const handleSubscribeNewsletter = (email: string) => {
    if (!subscribers.includes(email)) {
      setSubscribers(prev => [...prev, email]);
      addAdminLog('Newsletter Subscription', email);
    }
  };

  const handleLoginSuccess = (user: UniNestUser) => {
    const cleanUser = sanitizeUserBalance(user);
    setCurrentUser(cleanUser);
    if (cleanUser.role === 'admin' || cleanUser.email === 'admin@uninest.com' || cleanUser.email === 'amaechihellis@gmail.com') {
      setCurrentView('admin');
      addAdminLog('Admin Logged In', cleanUser.email);
    } else {
      setCurrentView('student');
      addAdminLog('Student Logged In', cleanUser.email);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('uninest_current_user');
    setCurrentUser(null);
    setCurrentView('auth');
  };

  // 1. STS Savings & Loan Operations
  const handleDepositSTS = (amount: number, desc: string) => {
    if (!currentUser) return;

    // Admin must confirm every deposit: submit request to approval queue
    const approvalReq = approvalService.submitDepositRequest({
      userEmail: currentUser.email,
      userName: currentUser.name || 'Student',
      userPhone: currentUser.phone || '08000000000',
      university: currentUser.university || 'Campus',
      amount: amount,
      method: 'Student Deposit / Bank Transfer',
      reason: desc || 'STS Periodic Savings Deposit',
      paymentCategory: 'sts_deposit'
    });

    setStsSavingsAccounts(prev => {
      let found = prev.find(a => a.userEmail.toLowerCase() === currentUser.email.toLowerCase());
      if (!found) {
        found = {
          id: `sts-sav-${Date.now()}`,
          userEmail: currentUser.email,
          studentName: currentUser.name || 'Student',
          university: currentUser.university || 'University',
          department: currentUser.department || 'Studies',
          currentLevel: '200L',
          expectedSignOutYear: '2028',
          targetAmount: 250000,
          currentBalance: 0,
          monthlyContribution: 10000,
          savingsFrequency: 'monthly',
          startDate: 'Sep 2026',
          status: 'active',
          activeLoan: null,
          transactions: []
        };
        prev = [...prev, found];
      }

      return prev.map(acc => {
        if (acc.userEmail.toLowerCase() === currentUser.email.toLowerCase()) {
          const curGift = acc.giftAccountBalance ?? acc.giftBalance ?? 0;
          const currentBal = acc.currentBalance || 0;
          const currentWalletTotal = currentBal + curGift;
          return {
            ...acc,
            // Note: currentBalance is intentionally NOT incremented yet because Admin must confirm every deposit
            transactions: [
              {
                id: approvalReq.id,
                type: 'deposit',
                amount: amount,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                description: `${desc || 'STS Periodic Savings Deposit'} [Pending Admin Confirmation - Ref: ${approvalReq.reference}]`,
                balanceAfter: currentWalletTotal
              },
              ...acc.transactions
            ]
          };
        }
        return acc;
      });
    });
    addAdminLog('STS Deposit Submitted (Pending Admin Confirmation)', `${currentUser.email} (₦${amount.toLocaleString()} - Ref: ${approvalReq.reference})`);
  };

  const handleRequestSTSLoan = (amount: number, purpose: string, duration: number) => {
    if (!currentUser) return;
    setStsSavingsAccounts(prev => prev.map(acc => {
      if (acc.userEmail.toLowerCase() === currentUser.email.toLowerCase()) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + duration);
        const curGift = acc.giftAccountBalance ?? acc.giftBalance ?? 0;
        const currentWalletTotal = acc.walletBalance ?? (acc.currentBalance + curGift);

        return {
          ...acc,
          activeLoan: {
            id: `loan-${Date.now()}`,
            amountRequested: amount,
            purpose: purpose,
            status: 'Approved & Disbursed',
            requestDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            dueDate: dueDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            repaidAmount: 0,
            collateralSavingsLocked: amount,
            recoupCondition: `Automatic deduction of ₦${amount.toLocaleString()} from STS savings balance if unpaid by ${dueDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}.`
          },
          transactions: [
            {
              id: `tx-loan-${Date.now()}`,
              type: 'loan_disbursed',
              amount: amount,
              date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
              description: `STS Instant Student Loan Disbursed (${purpose})`,
              balanceAfter: currentWalletTotal
            },
            ...acc.transactions
          ]
        };
      }
      return acc;
    }));
    addAdminLog('STS Student Loan Approved', `${currentUser.email} (₦${amount.toLocaleString()})`);
  };

  const handleRepaySTSLoan = (amount: number) => {
    if (!currentUser) return;
    setStsSavingsAccounts(prev => prev.map(acc => {
      if (acc.userEmail.toLowerCase() === currentUser.email.toLowerCase() && acc.activeLoan) {
        const newRepaid = acc.activeLoan.repaidAmount + amount;
        const isFullyPaid = newRepaid >= acc.activeLoan.amountRequested;
        const curGift = acc.giftAccountBalance ?? acc.giftBalance ?? 0;
        const oldWalletTotal = acc.walletBalance ?? (acc.currentBalance + curGift);
        const newWalletTotal = Math.max(0, oldWalletTotal - amount);

        return {
          ...acc,
          walletBalance: newWalletTotal,
          activeLoan: isFullyPaid ? null : {
            ...acc.activeLoan,
            repaidAmount: newRepaid,
            status: 'Partially Repaid'
          },
          transactions: [
            {
              id: `tx-repay-${Date.now()}`,
              type: 'loan_repaid',
              amount: amount,
              date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
              description: isFullyPaid ? 'STS Loan Fully Settled' : `STS Loan Partial Repayment (₦${amount.toLocaleString()})`,
              balanceAfter: newWalletTotal
            },
            ...acc.transactions
          ]
        };
      }
      return acc;
    }));
    addAdminLog('STS Loan Repayment Received', `${currentUser.email} (₦${amount.toLocaleString()})`);
  };

  // Student Gifting Functionality
  // Policy: You cannot gift from your STS savings account or locked savings wallet!
  // Gifting is strictly from your STS Gift Number using your Gift Account balance, OR via Bank Deposit Escrow.
  // Wallet carries total amount and is deducted when money leaves your account.
  const handleGiftStudent = (giftData: Omit<StudentGift, 'id' | 'date'>) => {
    if (!currentUser) return;
    const isEscrow = giftData.fundingMethod === 'bank_escrow';
    const newGift: StudentGift = {
      ...giftData,
      id: `gift-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      fundingMethod: giftData.fundingMethod || 'balance',
      escrowStatus: isEscrow ? 'cleared' : undefined
    };

    setStsSavingsAccounts(prev => prev.map(acc => {
      // SENDER ACCOUNT
      if (acc.userEmail.toLowerCase() === currentUser.email.toLowerCase()) {
        let newGiftBal = acc.giftAccountBalance ?? acc.giftBalance ?? 0;
        // STS savings is strictly untouched: You can't gift from your STS account!
        const currentStsBal = acc.currentBalance;

        if (!isEscrow) {
          // Deduct ONLY from Gift Account!
          newGiftBal = Math.max(0, newGiftBal - giftData.amount);
        }

        // Wallet carries total amount; wallet is deducted when money leaves your account:
        const currentWalletTotal = acc.walletBalance ?? (currentStsBal + (acc.giftAccountBalance ?? acc.giftBalance ?? 0));
        const updatedWalletTotal = isEscrow ? currentWalletTotal : Math.max(0, currentWalletTotal - giftData.amount);

        return {
          ...acc,
          currentBalance: currentStsBal, // untouched
          giftAccountBalance: newGiftBal,
          giftBalance: newGiftBal,
          walletBalance: updatedWalletTotal,
          isPinCustomized: true,
          stsPinCreated: true,
          giftsSent: [...(acc.giftsSent || []), newGift],
          transactions: [
            {
              id: `tx-gift-sent-${Date.now()}`,
              type: 'gift_sent',
              amount: giftData.amount,
              date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
              description: isEscrow
                ? `Bank Deposit Escrow Gift sent to ${giftData.recipientName} (${giftData.occasion}) - Ref: ${giftData.escrowReference || 'ESCROW'}`
                : `STS Gift sent from Gift ID (${giftData.senderStsNumber || 'STS'}) to ${giftData.recipientName} [4-Digit PIN Verified]`,
              balanceAfter: updatedWalletTotal,
              recipientOrSender: giftData.recipientName
            },
            ...acc.transactions
          ]
        };
      }
      // RECIPIENT ACCOUNT
      if (acc.userEmail.toLowerCase() === giftData.recipientEmail.toLowerCase()) {
        const curGift = acc.giftAccountBalance ?? acc.giftBalance ?? 0;
        const newGiftBal = curGift + giftData.amount;
        const currentRecipientWallet = acc.walletBalance ?? (acc.currentBalance + curGift);
        const updatedRecipientWallet = currentRecipientWallet + giftData.amount;

        return {
          ...acc,
          giftAccountBalance: newGiftBal,
          giftBalance: newGiftBal,
          walletBalance: updatedRecipientWallet,
          giftsReceived: [...(acc.giftsReceived || []), newGift],
          transactions: [
            {
              id: `tx-gift-rec-${Date.now()}`,
              type: 'gift_received',
              amount: giftData.amount,
              date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
              description: isEscrow
                ? `Escrow Gift received into Gift Account from ${giftData.senderName} (${giftData.occasion}) - Ref: ${giftData.escrowReference || 'ESCROW'}`
                : `Gift received into Gift Account from ${giftData.senderName} (${giftData.occasion}) via STS Gift Number`,
              balanceAfter: updatedRecipientWallet,
              recipientOrSender: giftData.senderName
            },
            ...acc.transactions
          ]
        };
      }
      return acc;
    }));

    // Private email dispatch
    sendStudentGiftEmail(newGift);

    addAdminLog(
      isEscrow ? 'Bank Escrow Student Gift Processed' : 'Student Gift Dispatched (PIN Verified)',
      isEscrow
        ? `${currentUser.email} gifted ₦${giftData.amount.toLocaleString()} to ${giftData.recipientName} via Bank Deposit Escrow (${giftData.escrowReference || 'Escrow'}).`
        : `${currentUser.email} transferred ₦${giftData.amount.toLocaleString()} from STS Gift Number to ${giftData.recipientName}. [4-digit PIN confirmed]`
    );
  };

  // Student Wallet Withdrawal to Bank (Deducts Gift Account & Total Wallet)
  const handleWithdrawSTS = (amount: number, bankName: string, accNumber: string, accName: string, reason: string) => {
    if (!currentUser) return;
    setStsSavingsAccounts(prev => prev.map(acc => {
      if (acc.userEmail.toLowerCase() === currentUser.email.toLowerCase()) {
        const curGift = acc.giftAccountBalance ?? acc.giftBalance ?? 0;
        const newGiftBal = Math.max(0, curGift - amount);
        const currentWalletTotal = acc.walletBalance ?? (acc.currentBalance + curGift);
        const updatedWalletTotal = Math.max(0, currentWalletTotal - amount);

        return {
          ...acc,
          giftAccountBalance: newGiftBal,
          giftBalance: newGiftBal,
          walletBalance: updatedWalletTotal,
          transactions: [
            {
              id: `tx-withdraw-${Date.now()}`,
              type: 'signout_payout',
              amount: amount,
              date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
              description: `Bank Withdrawal to ${bankName} (${accNumber}) - ${reason}`,
              balanceAfter: updatedWalletTotal,
              recipientOrSender: accName
            },
            ...acc.transactions
          ]
        };
      }
      return acc;
    }));
    addAdminLog('Student Wallet Withdrawal Disbursed', `${currentUser.email} (-₦${amount.toLocaleString()} to ${bankName} ${accNumber})`);
  };

  // Verified Agents & Sellers
  const handleAddVerifiedBusiness = (bizData: Omit<VerifiedBusiness, 'id' | 'isVerified' | 'rating' | 'reviewsCount' | 'reviews' | 'createdAt'>) => {
    const newBiz: VerifiedBusiness = {
      ...bizData,
      id: `biz-${Date.now()}`,
      isVerified: true,
      rating: 5.0,
      reviewsCount: 1,
      reviews: [
        {
          id: `rev-initial-${Date.now()}`,
          studentName: bizData.ownerName,
          studentSchool: bizData.campus,
          rating: 5,
          comment: 'Verified and official business profile launched on UniNest.',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
        }
      ],
      createdAt: new Date().toISOString().split('T')[0]
    };
    setVerifiedBusinesses(prev => [newBiz, ...prev]);
    addAdminLog('Verified Business Registered', `${bizData.businessName} (${bizData.accountType}) by ${bizData.ownerName}`);
  };

  const handleAddBusinessReview = (businessId: string, reviewData: Omit<BusinessReview, 'id' | 'date'>) => {
    const newReview: BusinessReview = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };

    setVerifiedBusinesses(prev => prev.map(biz => {
      if (biz.id === businessId) {
        const updatedReviews = [newReview, ...biz.reviews];
        const totalStars = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
        const newRating = Number((totalStars / updatedReviews.length).toFixed(1));
        return {
          ...biz,
          reviews: updatedReviews,
          reviewsCount: updatedReviews.length,
          rating: newRating
        };
      }
      return biz;
    }));
    addAdminLog('5-Star Business Review Added', `Business ${businessId} received a ${reviewData.rating}-star review from ${reviewData.studentName}`);
  };

  // Testimonials
  const handleAddTestimonial = (testimonialData: Omit<StudentTestimonial, 'id' | 'date' | 'verifiedStudent'>) => {
    const newTestimonial: StudentTestimonial = {
      ...testimonialData,
      id: `test-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      verifiedStudent: true
    };
    setTestimonials(prev => [newTestimonial, ...prev]);
    addAdminLog('New Student Testimonial', `${testimonialData.studentName} reviewed ${testimonialData.serviceTag}`);
  };

  // Campus Phone Alerts (Gifting is exempt and handled via private email)
  const handleSendPhoneNotification = (notifData: Omit<PhoneNotificationItem, 'id' | 'timeAgo' | 'date' | 'isRead'>) => {
    // STRICT EXEMPTION: Student gifting cannot be broadcast as a public campus push notification
    if (notifData.category === 'Student Gifting') {
      console.warn('Student Gifting is exempt from campus push notifications.');
      return;
    }

    const shouldSendEmail = notifData.sentToEmail ?? true;
    const recipientCount = subscribers.length;

    const newNotif: PhoneNotificationItem = {
      ...notifData,
      id: `notif-${Date.now()}`,
      timeAgo: 'Just now',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      isRead: false,
      sentToEmail: shouldSendEmail,
      emailRecipientCount: shouldSendEmail ? recipientCount : undefined
    };

    setPhoneNotifications(prev => [newNotif, ...prev]);
    addAdminLog(
      'Campus Push Alert Broadcast',
      `${notifData.title} (${notifData.campusTag}) ${shouldSendEmail ? `— Dispatched to ${recipientCount} student emails` : ''}`
    );

    // Send to student emails
    if (shouldSendEmail && subscribers.length > 0) {
      sendCampusNewsNotificationEmail(subscribers, {
        title: notifData.title,
        message: notifData.message,
        campusTag: notifData.campusTag,
        category: notifData.category
      }).catch(err => console.error('Campus news email broadcast error:', err));
    }
  };

  const handleMarkPhoneNotificationAsRead = (id: string) => {
    setPhoneNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  // 2. Roommate Match Creation
  const handleRequestRoommate = (profile: Omit<BayelsaRoommateProfile, 'id'>) => {
    const newProfile: BayelsaRoommateProfile = {
      ...profile,
      id: `roommate-${Date.now()}`
    };
    setRoommates(prev => [newProfile, ...prev]);
    addAdminLog('New Bayelsa Roommate Match Request', `${profile.name} (${profile.institution})`);
  };

  // 3. Academic Request Submission
  const handleSubmitAcademicRequest = (req: Omit<AcademicAssistRequest, 'id' | 'createdAt'>) => {
    const newReq: AcademicAssistRequest = {
      ...req,
      id: `acad-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };
    setAcademicRequests(prev => [newReq, ...prev]);
    addAdminLog('New Academic Assist Task', `${req.serviceType}: ${req.topicOrCourse}`);
  };

  // 4. Marketplace & Escrow
  const handlePostMarketplaceItem = (item: Omit<MarketplaceItem, 'id' | 'postedAt'>) => {
    const now = new Date();
    const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 1 month (30 days) lifespan
    const newItem: MarketplaceItem = {
      ...item,
      id: `item-${Date.now()}`,
      status: 'available',
      postedAt: now.toISOString().split('T')[0],
      expiresAt: expires.toISOString().split('T')[0]
    };
    setMarketplaceItems(prev => [newItem, ...prev]);
    addAdminLog('Marketplace Listing Created', `${item.title} (₦${(item.price || 0).toLocaleString()}) - 30-day listing`);
  };

  const handleRelistMarketplaceItem = (itemId: string) => {
    const now = new Date();
    const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    setMarketplaceItems(prev => prev.map(it => {
      if (it.id === itemId) {
        return {
          ...it,
          status: 'available',
          postedAt: now.toISOString().split('T')[0],
          expiresAt: expires.toISOString().split('T')[0]
        };
      }
      return it;
    }));
    addAdminLog('Marketplace Listing Renewed', `Item #${itemId} relisted for 30 more days`);
  };

  const handleInitiateEscrow = (item: MarketplaceItem, guestDetails?: { name: string; phone: string; email?: string; address?: string }) => {
    const buyerEmail = guestDetails?.email || (currentUser ? currentUser.email : 'guest.buyer@uninest.ng');
    const buyerPhone = guestDetails?.phone || (currentUser ? currentUser.phone : '08000000000');
    const escrowFee = Math.round(item.price * 0.05); // Exactly 5% Escrow Charge
    const totalAmount = item.price + escrowFee;
    const newEscrow: EscrowTransaction = {
      id: `ESC-${Date.now().toString().slice(-5)}`,
      itemId: item.id,
      itemTitle: item.title,
      amount: item.price,
      escrowFee: escrowFee,
      totalAmount: totalAmount,
      buyerEmail,
      buyerPhone,
      sellerEmail: item.sellerEmail,
      sellerPhone: item.sellerPhone,
      campus: item.campus,
      status: 'Escrow Vault Funded (Awaiting Inspection)',
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };
    setEscrows(prev => [newEscrow, ...prev]);

    // Update marketplace item status
    setMarketplaceItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'in_escrow' } : i));

    // "Market place student pay to uninest escrow and shows the balance on vendor gift wallet"
    setStsSavingsAccounts(prev => {
      const sellerFound = prev.some(acc => acc.userEmail.toLowerCase() === item.sellerEmail.toLowerCase());
      if (sellerFound) {
        return prev.map(acc => {
          if (acc.userEmail.toLowerCase() === item.sellerEmail.toLowerCase()) {
            const updatedGiftBal = (acc.giftBalance || 0) + item.price;
            const updatedCurBal = acc.currentBalance + item.price;
            return {
              ...acc,
              giftBalance: updatedGiftBal,
              currentBalance: updatedCurBal,
              transactions: [
                {
                  id: `tx-escrow-credit-${Date.now()}`,
                  type: 'escrow_vendor_payout',
                  amount: item.price,
                  date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                  description: `UniNest Escrow Deposit for "${item.title}" - Reflecting in Vendor Gift Wallet`,
                  balanceAfter: updatedCurBal,
                  recipientOrSender: `UniNest Escrow (${currentUser.name || currentUser.email})`
                },
                ...acc.transactions
              ]
            };
          }
          return acc;
        });
      } else {
        const newVendorAccount: STSSavingsAccount = {
          id: `sts-vendor-${Date.now()}`,
          userEmail: item.sellerEmail,
          studentName: item.sellerName || 'Campus Vendor',
          university: item.campus || 'Nigerian Campus',
          department: 'Vendor / Merchant',
          targetAmount: 500000,
          currentBalance: item.price,
          giftBalance: item.price,
          withdrawalDate: '2026-11-30',
          startDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          status: 'active',
          transactions: [
            {
              id: `tx-escrow-init-${Date.now()}`,
              type: 'escrow_vendor_payout',
              amount: item.price,
              date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
              description: `UniNest Escrow Deposit for "${item.title}" deposited to Vendor Gift Wallet`,
              balanceAfter: item.price,
              recipientOrSender: `UniNest Escrow (${currentUser.name || currentUser.email})`
            }
          ]
        };
        return [newVendorAccount, ...prev];
      }
    });

    addAdminLog('Escrow Transaction Created', `Deal #${newEscrow.id} for ${item.title} (₦${(item.price || 0).toLocaleString()} + 5% Escrow Fee ₦${(escrowFee || 0).toLocaleString()}) - Vendor Gift Wallet credited.`);
  };

  const handleReleaseEscrow = (escrowId: string) => {
    setEscrows(prev => prev.map(e => {
      if (e.id === escrowId) {
        return { ...e, status: 'Payment Released to Seller' };
      }
      return e;
    }));
    addAdminLog('Escrow Funds Released', `Deal #${escrowId} completed successfully. Vendor can withdraw.`);
  };

  const handleRefundEscrow = (escrowId: string) => {
    const targetEscrow = escrows.find(e => e.id === escrowId);
    setEscrows(prev => prev.map(e => {
      if (e.id === escrowId) {
        return { ...e, status: 'Disputed / Refunded' };
      }
      return e;
    }));
    if (targetEscrow) {
      setStsSavingsAccounts(prev => prev.map(acc => {
        if (acc.userEmail.toLowerCase() === targetEscrow.sellerEmail.toLowerCase()) {
          const newGift = Math.max(0, (acc.giftBalance || 0) - targetEscrow.amount);
          const newCur = Math.max(0, acc.currentBalance - targetEscrow.amount);
          return {
            ...acc,
            giftBalance: newGift,
            currentBalance: newCur,
            transactions: [
              {
                id: `tx-escrow-refund-${Date.now()}`,
                type: 'escrow_vendor_payout',
                amount: targetEscrow.amount,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                description: `UniNest Escrow Refund: Deal #${escrowId} refunded to buyer`,
                balanceAfter: newCur,
                recipientOrSender: `UniNest Escrow Dispute Resolution`
              },
              ...acc.transactions
            ]
          };
        }
        return acc;
      }));
    }
    addAdminLog('Escrow Refunded', `Deal #${escrowId} refunded to buyer by Admin.`);
  };

  const handleDeleteMarketplaceItem = (itemId: string) => {
    setMarketplaceItems(prev => prev.filter(i => i.id !== itemId));
    addAdminLog('Marketplace Listing Deleted', `Item #${itemId} removed by Admin.`);
  };

  const handleToggleAccommodationAvailability = (id: string) => {
    setAccommodations(prev => prev.map(acc => {
      if (acc.id === id) {
        const nextAvail = acc.isAvailable === false ? true : false;
        return { ...acc, isAvailable: nextAvail };
      }
      return acc;
    }));
    addAdminLog('Accommodation Status Updated', `Lodge #${id} availability toggled by Admin.`);
  };

  const handleDeleteAccommodation = (id: string) => {
    setAccommodations(prev => prev.filter(a => a.id !== id));
    addAdminLog('Accommodation Deleted', `Lodge #${id} removed by Admin.`);
  };

  const handleToggleUserVendorTicker = (email: string) => {
    setUsers(prev => prev.map(u => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        const nextVerified = !u.isVerifiedVendor;
        return {
          ...u,
          isVerifiedVendor: nextVerified,
          vendorConfirmedViaWhatsapp: nextVerified,
          role: nextVerified ? 'vendor' : (u.role === 'vendor' ? 'student' : u.role)
        };
      }
      return u;
    }));
    addAdminLog('Vendor Ticker Status Changed', `Toggled vendor status for ${email}`);
  };

  const handleUpdateSTSSavingsAccount = (updatedAcc: STSSavingsAccount) => {
    setStsSavingsAccounts(prev => {
      const exists = prev.some(a => a.id === updatedAcc.id || a.userEmail.toLowerCase() === updatedAcc.userEmail.toLowerCase());
      if (exists) {
        return prev.map(a => (a.id === updatedAcc.id || a.userEmail.toLowerCase() === updatedAcc.userEmail.toLowerCase()) ? updatedAcc : a);
      }
      return [updatedAcc, ...prev];
    });
    addAdminLog(
      'Student STS Savings Adjusted',
      `Updated balance for ${updatedAcc.studentName || updatedAcc.userEmail} (Current: ₦${(updatedAcc.currentBalance || 0).toLocaleString()})`
    );
  };

  // 5. Cheap Data Top-Up
  const handleBuyData = (network: DataPlan['network'], plan: DataPlan, phone: string) => {
    if (!currentUser) return;
    const newOrder: DataOrder = {
      id: `data-${Date.now()}`,
      userEmail: currentUser.email,
      network: network,
      dataPlan: `${plan.size} (₦${plan.price.toLocaleString()})`,
      phone: phone,
      amount: plan.price,
      status: 'Delivered Instantly',
      transactionDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };
    setDataOrders(prev => [newOrder, ...prev]);
    addAdminLog('Cheap Data Purchase', `${network} ${plan.size} to ${phone}`);
  };

  const handleAddNews = (item: NewsItem) => {
    setNews(prev => [item, ...prev]);

    // Send campus news push notification (exempting student gifting)
    const categoryName: PhoneNotificationItem['category'] = 
      item.type === 'scholarship' ? 'Scholarship Alert' :
      item.type === 'strike' ? 'Campus Safety' : 'Academic Calendar';

    const newsNotif: PhoneNotificationItem = {
      id: `notif-news-${Date.now()}`,
      title: item.title,
      message: item.description,
      campusTag: item.school || 'All Campuses',
      category: categoryName,
      priority: item.type === 'strike' ? 'high' : 'normal',
      timeAgo: 'Just now',
      date: item.date,
      isRead: false,
      sentToEmail: true,
      emailRecipientCount: subscribers.length
    };
    setPhoneNotifications(prev => [newsNotif, ...prev]);

    // Dispatch campus news notification directly to student emails
    if (subscribers.length > 0) {
      sendCampusNewsNotificationEmail(subscribers, {
        title: item.title,
        message: item.description,
        campusTag: item.school || 'All Campuses',
        category: item.type.toUpperCase()
      }).catch(err => console.error('Campus news email broadcast error:', err));
    }

    addAdminLog('Campus News Published & Emailed', `${item.title} (${item.school || 'All Campuses'}) — Sent to ${subscribers.length} student emails`);
  };

  // Cross-Campus Student Q&A Handlers
  const handleAddQuestion = (q: Omit<StudentQuestion, 'id' | 'answersCount' | 'createdAt' | 'status' | 'answers'>) => {
    const newQuestion: StudentQuestion = {
      ...q,
      id: `q-${Date.now()}`,
      createdAt: 'Just now',
      status: 'Open',
      answers: []
    };
    setStudentQuestions(prev => [newQuestion, ...prev]);
    addAdminLog('Campus Question Posted', `${q.title} (${q.authorUniversity})`);
  };

  const handleAddAnswer = (questionId: string, answer: Omit<QuestionAnswer, 'id' | 'createdAt' | 'upvotes'>) => {
    const newAnswer: QuestionAnswer = {
      ...answer,
      id: `ans-${Date.now()}`,
      createdAt: 'Just now',
      upvotes: 0
    };
    setStudentQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          answersCount: q.answersCount + 1,
          answers: [...q.answers, newAnswer]
        };
      }
      return q;
    }));
    addAdminLog('Question Answered', `Answer by ${answer.authorName} (${answer.authorUniversity})`);
  };

  const handleUpvoteAnswer = (questionId: string, answerId: string) => {
    setStudentQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          answers: q.answers.map(ans => ans.id === answerId ? { ...ans, upvotes: ans.upvotes + 1 } : ans)
        };
      }
      return q;
    }));
  };

  const handleDeleteNews = (id: string) => {
    setNews(prev => prev.filter(n => n.id !== id));
  };

  const handleToggleUserStatus = (email: string) => {
    setUsers(prev => prev.map(u => {
      if (u.email === email) {
        return { ...u, verified: !u.verified };
      }
      return u;
    }));
  };

  const handleUpdateUser = (updatedUser: UniNestUser, originalEmail?: string) => {
    const oldEmailLower = (originalEmail || updatedUser.email).trim().toLowerCase();
    const newEmailLower = updatedUser.email.trim().toLowerCase();
    const emailChanged = oldEmailLower !== newEmailLower;

    setUsers(prev => {
      // 1. Look for user by old email, or new email, or admin role
      let targetIndex = prev.findIndex(u => u.email.toLowerCase() === oldEmailLower);
      if (targetIndex === -1 && emailChanged) {
        targetIndex = prev.findIndex(u => u.email.toLowerCase() === newEmailLower);
      }
      if (targetIndex === -1 && (updatedUser.role === 'admin' || oldEmailLower === 'admin@uninest.com' || oldEmailLower === 'amaechihellis@gmail.com')) {
        targetIndex = prev.findIndex(u => u.role === 'admin' || u.email.toLowerCase() === 'admin@uninest.com' || u.email.toLowerCase() === 'amaechihellis@gmail.com');
      }

      if (targetIndex >= 0) {
        const nextUsers = [...prev];
        nextUsers[targetIndex] = updatedUser;
        // Eliminate any other duplicate matching the old or new email
        return nextUsers.filter((u, idx) => idx === targetIndex || (u.email.toLowerCase() !== newEmailLower && u.email.toLowerCase() !== oldEmailLower));
      } else {
        return [updatedUser, ...prev.filter(u => u.email.toLowerCase() !== oldEmailLower && u.email.toLowerCase() !== newEmailLower)];
      }
    });

    // Update currentUser state and session storage if the current user was updated
    if (
      currentUser && 
      (currentUser.email.toLowerCase() === oldEmailLower || 
       currentUser.email.toLowerCase() === newEmailLower ||
       (currentUser.role === 'admin' && updatedUser.role === 'admin'))
    ) {
      setCurrentUser(updatedUser);
      localStorage.setItem('uninest_current_user', JSON.stringify({ email: updatedUser.email, phone: updatedUser.phone }));
    }

    // Update remembered email if stored
    const remembered = localStorage.getItem('uninest_remembered');
    if (remembered && (remembered.toLowerCase() === oldEmailLower || (currentUser?.role === 'admin' && (remembered.toLowerCase() === 'admin@uninest.com' || remembered.toLowerCase() === 'amaechihellis@gmail.com')))) {
      localStorage.setItem('uninest_remembered', updatedUser.email);
    }

    // If email changed, perform cascading updates across all dependent stores
    if (emailChanged) {
      setStsSavingsAccounts(prev => prev.map(acc => {
        if (acc.userEmail.toLowerCase() === oldEmailLower) {
          return { ...acc, userEmail: updatedUser.email };
        }
        return acc;
      }));

      setStsAccounts(prev => prev.map(acc => {
        if (acc.userEmail.toLowerCase() === oldEmailLower) {
          return { ...acc, userEmail: updatedUser.email };
        }
        return acc;
      }));

      setCrowdfundingCampaigns(prev => prev.map(c => {
        if (c.creatorEmail.toLowerCase() === oldEmailLower) {
          return { ...c, creatorEmail: updatedUser.email };
        }
        return c;
      }));

      setRoommates(prev => prev.map(r => {
        if (r.contactEmail && r.contactEmail.toLowerCase() === oldEmailLower) {
          return { ...r, contactEmail: updatedUser.email };
        }
        return r;
      }));

      setMarketplaceItems(prev => prev.map(item => {
        if (item.sellerEmail && item.sellerEmail.toLowerCase() === oldEmailLower) {
          return { ...item, sellerEmail: updatedUser.email };
        }
        return item;
      }));

      setDataOrders(prev => prev.map(order => {
        if (order.userEmail && order.userEmail.toLowerCase() === oldEmailLower) {
          return { ...order, userEmail: updatedUser.email };
        }
        return order;
      }));

      setSubscribers(prev => prev.map(s => s.toLowerCase() === oldEmailLower ? updatedUser.email : s));

      const oldPicFlag = localStorage.getItem('uninest_pictures_uploaded_' + oldEmailLower);
      if (oldPicFlag) {
        localStorage.setItem('uninest_pictures_uploaded_' + newEmailLower, oldPicFlag);
        localStorage.removeItem('uninest_pictures_uploaded_' + oldEmailLower);
      }
    }

    // Persist updated user profile to Supabase
    updateProfileInSupabase(updatedUser).catch(err => {
      console.error('Failed to update user in Supabase:', err);
    });

    addAdminLog(
      emailChanged ? 'Login Email Updated' : 'Profile Updated',
      emailChanged 
        ? `Login email changed from ${oldEmailLower} to ${updatedUser.email} for ${updatedUser.name || updatedUser.role}`
        : `Updated profile for ${updatedUser.name || updatedUser.email} (${updatedUser.role || 'student'})`
    );
  };

  const handleAdminResetPassword = (userEmail: string, newPass: string) => {
    const targetEmailLower = userEmail.trim().toLowerCase();
    setUsers(prev => {
      const exists = prev.some(u => u.email.toLowerCase() === targetEmailLower);
      if (exists) {
        return prev.map(u => {
          if (u.email.toLowerCase() === targetEmailLower) {
            return { ...u, password: newPass };
          }
          return u;
        });
      } else {
        const targetAdmin = prev.find(u => u.role === 'admin');
        if (targetAdmin && (targetEmailLower === 'admin@uninest.com' || targetEmailLower === 'amaechihellis@gmail.com' || targetEmailLower === 'admin')) {
          return prev.map(u => u.role === 'admin' ? { ...u, password: newPass } : u);
        }
        if (targetEmailLower === 'admin@uninest.com' || targetEmailLower === 'amaechihellis@gmail.com') {
          const newAdmin: UniNestUser = { ...DEFAULT_ADMIN, password: newPass };
          return [newAdmin, ...prev];
        }
      }
      return prev;
    });
    if (currentUser && (currentUser.email.toLowerCase() === targetEmailLower || (currentUser.role === 'admin' && (targetEmailLower === 'admin@uninest.com' || targetEmailLower === 'amaechihellis@gmail.com' || targetEmailLower === 'admin')))) {
      setCurrentUser(prev => prev ? { ...prev, password: newPass } : null);
    }
    addAdminLog('Admin Password Reset', `Administrator reset security password for user: ${userEmail}`);
  };

  // ================= CROWDFUNDING & PAYSTACK ESCROW HANDLERS =================
  const handleRequestCrowdfundingHelp = (
    data: Omit<CrowdfundingCampaign, 'id' | 'createdAt' | 'currentRaised' | 'donorsCount' | 'status' | 'donations'>
  ) => {
    const newCampaign: CrowdfundingCampaign = {
      ...data,
      id: `cf-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      currentRaised: 0,
      donorsCount: 0,
      status: 'pending',
      donations: []
    };

    setCrowdfundingCampaigns(prev => [newCampaign, ...prev]);
    addAdminLog('Crowdfunding Aid Requested', `Submitted by ${data.studentName} for ₦${(data.targetAmount || 0).toLocaleString()} [Pending Admin Review]`);

    // Dispatch phone notification
    const alertItem: PhoneNotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'New Student Aid Request Submitted',
      message: `${data.studentName} (${data.institution}) submitted an aid request for "${data.title}" under ${data.category}. Awaiting admin review.`,
      campusTag: data.institution || 'General',
      category: 'Exam Clearance',
      priority: 'high',
      date: new Date().toLocaleDateString(),
      timeAgo: 'Just now',
      isRead: false
    };
    setPhoneNotifications(prev => [alertItem, ...prev]);
  };

  const handleApproveCrowdfundingCampaign = (campaignId: string) => {
    setCrowdfundingCampaigns(prev => prev.map(c => {
      if (c.id === campaignId) {
        return {
          ...c,
          status: 'approved',
          reviewedAt: new Date().toLocaleDateString(),
          reviewedBy: currentUser?.email || 'admin@uninest.com'
        };
      }
      return c;
    }));

    const camp = crowdfundingCampaigns.find(c => c.id === campaignId);
    addAdminLog('Approved Crowdfunding Campaign', `Moved to Live Campaigns: "${camp?.title || campaignId}"`);

    if (camp) {
      const alertItem: PhoneNotificationItem = {
        id: `notif-${Date.now()}`,
        title: 'Crowdfunding Campaign Approved & Live!',
        message: `Aid campaign for ${camp.studentName} (${camp.institution}) has been approved and is now live on UniNest. Target: ₦${(camp.targetAmount || 0).toLocaleString()}.`,
        campusTag: camp.institution || 'General',
        category: 'Scholarship Alert',
        priority: 'high',
        date: new Date().toLocaleDateString(),
        timeAgo: 'Just now',
        isRead: false
      };
      setPhoneNotifications(prev => [alertItem, ...prev]);
    }
  };

  const handleRejectCrowdfundingCampaign = (campaignId: string, reason: string) => {
    setCrowdfundingCampaigns(prev => prev.map(c => {
      if (c.id === campaignId) {
        return {
          ...c,
          status: 'rejected',
          rejectionReason: reason,
          reviewedAt: new Date().toLocaleDateString(),
          reviewedBy: currentUser?.email || 'admin@uninest.com'
        };
      }
      return c;
    }));
    addAdminLog('Rejected Crowdfunding Campaign', `ID: ${campaignId} - Reason: ${reason}`);
  };

  const handleDonateToCampaign = (
    campaignId: string, 
    donation: { amount: number; donorName: string; donorEmail: string; message?: string; isAnonymous?: boolean }
  ) => {
    setCrowdfundingCampaigns(prev => prev.map(c => {
      if (c.id === campaignId) {
        const newDonation: CrowdfundingDonation = {
          id: `don-${Date.now()}`,
          campaignId: c.id,
          amount: donation.amount,
          donorName: donation.donorName,
          donorEmail: donation.donorEmail,
          message: donation.message,
          isAnonymous: donation.isAnonymous,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          paystackRef: `PSTK-ESCROW-${Date.now().toString().slice(-8)}`,
          escrowStatus: 'held_in_escrow'
        };

        const updatedRaised = (c.currentRaised || 0) + donation.amount;
        const updatedDonorsCount = (c.donorsCount || 0) + 1;

        return {
          ...c,
          currentRaised: updatedRaised,
          donorsCount: updatedDonorsCount,
          donations: [newDonation, ...(c.donations || [])]
        };
      }
      return c;
    }));

    const camp = crowdfundingCampaigns.find(c => c.id === campaignId);
    addAdminLog('Paystack Escrow Donation Received', `₦${(donation.amount || 0).toLocaleString()} received for "${camp?.title || campaignId}" from ${donation.isAnonymous ? 'Anonymous Donor' : donation.donorName}`);
  };

  const handleMarkCampaignAsPaid = (
    campaignId: string, 
    payoutData: { amount: number; proofUrl: string; proofName: string; reference: string; note?: string }
  ) => {
    setCrowdfundingCampaigns(prev => prev.map(c => {
      if (c.id === campaignId) {
        return {
          ...c,
          status: 'paid_out',
          isPaidOut: true,
          paidOutAmount: payoutData.amount,
          paidOutAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          payoutProofUrl: payoutData.proofUrl,
          payoutProofName: payoutData.proofName,
          payoutReference: payoutData.reference,
          payoutDestinationNote: payoutData.note,
          donations: (c.donations || []).map(d => ({ ...d, escrowStatus: 'disbursed_to_beneficiary' }))
        };
      }
      return c;
    }));

    const camp = crowdfundingCampaigns.find(c => c.id === campaignId);
    addAdminLog('Crowdfunding Escrow Disbursed & Marked Paid', `₦${(payoutData.amount || 0).toLocaleString()} disbursed to ${camp?.studentName} (${camp?.bankName}). Proof attached: ${payoutData.proofName}`);

    if (camp) {
      const alertItem: PhoneNotificationItem = {
        id: `notif-${Date.now()}`,
        title: 'Escrow Disbursed & Payment Proof Uploaded',
        message: `UniNest Escrow has successfully disbursed ₦${(payoutData.amount || 0).toLocaleString()} for "${camp.title}" (${camp.studentName}). Institutional receipt uploaded for audit.`,
        campusTag: camp.institution || 'General',
        category: 'Scholarship Alert',
        priority: 'normal',
        date: new Date().toLocaleDateString(),
        timeAgo: 'Just now',
        isRead: false,
        sentToEmail: true,
        emailRecipientCount: subscribers.length
      };
      setPhoneNotifications(prev => [alertItem, ...prev]);

      if (subscribers.length > 0) {
        sendCampusNewsNotificationEmail(subscribers, {
          title: alertItem.title,
          message: alertItem.message,
          campusTag: alertItem.campusTag,
          category: alertItem.category
        }).catch(err => console.error(err));
      }
    }
  };

  // Find active STS for current student
  const activeStudentSTS = stsAccounts.find(
    acc => currentUser && acc.userEmail.toLowerCase() === currentUser.email.toLowerCase()
  );

  const activeSTSSavings = stsSavingsAccounts.find(
    acc => currentUser && acc.userEmail.toLowerCase() === currentUser.email.toLowerCase()
  ) || stsSavingsAccounts[0];

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/admin/login" element={<AdminLogin onAdminLoginSuccess={(adminUser) => { setCurrentUser(adminUser); setCurrentView('admin'); }} />} />
        <Route path="*" element={
          <div className="w-full max-w-full min-h-screen overflow-x-hidden bg-white">
            {/* 1. AUTH SCREEN (Default or fallback if session is not active) */}
            {(currentView === 'auth' || (!currentUser && currentView !== 'guest')) && (
              <AuthCard
                onLoginSuccess={handleLoginSuccess}
                onContinueAsGuest={() => setCurrentView('guest')}
                users={users}
                onRegisterUser={handleRegisterUser}
                onUpdateUserPassword={handleUpdatePassword}
                stsAccounts={stsAccounts}
                onCreateSTS={handleCreateSTS}
                onSubscribeNewsletter={handleSubscribeNewsletter}
                newsletterSubscribers={subscribers}
              />
            )}

            {/* 2. STUDENT DASHBOARD (All 5 Services Integrated) */}
            {currentView === 'student' && currentUser && (
              <StudentDashboard
                user={currentUser}
                onUpdateUser={handleUpdateUser}
                stsAccount={activeStudentSTS}
                stsSavingsAccount={activeSTSSavings}
                roommates={roommates}
                accommodations={accommodations}
                academicRequests={academicRequests}
                marketplaceItems={marketplaceItems}
                escrowTransactions={escrows}
                dataOrders={dataOrders}
                news={news}
                verifiedBusinesses={verifiedBusinesses}
                testimonials={testimonials}
                phoneNotifications={phoneNotifications}
                faqs={faqs}
                onLogout={handleLogout}
                onDepositSTS={handleDepositSTS}
                onWithdrawSTS={handleWithdrawSTS}
                onGiftStudent={handleGiftStudent}
                onRequestSTSLoan={handleRequestSTSLoan}
                onRepaySTSLoan={handleRepaySTSLoan}
                onRequestRoommate={handleRequestRoommate}
                onSubmitAcademicRequest={handleSubmitAcademicRequest}
                onPostMarketplaceItem={handlePostMarketplaceItem}
                onRelistMarketplaceItem={handleRelistMarketplaceItem}
                onInitiateEscrow={handleInitiateEscrow}
                onReleaseEscrow={handleReleaseEscrow}
                onBuyData={handleBuyData}
                onAddVerifiedBusiness={handleAddVerifiedBusiness}
                onAddBusinessReview={handleAddBusinessReview}
                onAddTestimonial={handleAddTestimonial}
                onSendPhoneNotification={handleSendPhoneNotification}
                onMarkPhoneNotificationAsRead={handleMarkPhoneNotificationAsRead}
                subscribers={subscribers}
                isSubscribedNewsletter={subscribers.includes(currentUser.email)}
                onSubscribeNewsletter={handleSubscribeNewsletter}
                studentQuestions={studentQuestions}
                onAddQuestion={handleAddQuestion}
                onAddAnswer={handleAddAnswer}
                onUpvoteAnswer={handleUpvoteAnswer}
                crowdfundingCampaigns={crowdfundingCampaigns}
                onRequestCrowdfundingHelp={handleRequestCrowdfundingHelp}
                onDonateToCampaign={handleDonateToCampaign}
              />
            )}

            {/* 3. ADMIN DASHBOARD */}
            {currentView === 'admin' && currentUser && (
              <AdminDashboard
                adminUser={currentUser}
                users={users}
                stsAccounts={stsAccounts}
                news={news}
                subscribers={subscribers}
                adminLogs={adminLogs}
                crowdfundingCampaigns={crowdfundingCampaigns}
                onApproveCampaign={handleApproveCrowdfundingCampaign}
                onRejectCampaign={handleRejectCrowdfundingCampaign}
                onMarkCampaignAsPaid={handleMarkCampaignAsPaid}
                onLogout={handleLogout}
                onAddNews={handleAddNews}
                onDeleteNews={handleDeleteNews}
                onToggleUserStatus={handleToggleUserStatus}
                onAddLog={addAdminLog}
                onUpdateUser={handleUpdateUser}
                onResetPassword={handleAdminResetPassword}
                escrows={escrows}
                onReleaseEscrow={handleReleaseEscrow}
                onRefundEscrow={handleRefundEscrow}
                marketplaceItems={marketplaceItems}
                onDeleteMarketplaceItem={handleDeleteMarketplaceItem}
                accommodations={accommodations}
                onToggleAccommodationAvailability={handleToggleAccommodationAvailability}
                onDeleteAccommodation={handleDeleteAccommodation}
                stsSavingsAccounts={stsSavingsAccounts}
                onToggleUserVendorTicker={handleToggleUserVendorTicker}
                onUpdateSTSSavingsAccount={handleUpdateSTSSavingsAccount}
              />
            )}

            {/* 4. GUEST DASHBOARD */}
            {currentView === 'guest' && (
              <GuestDashboard
                news={news}
                marketplaceItems={marketplaceItems}
                onInitiateEscrow={handleInitiateEscrow}
                onBackToAuth={() => setCurrentView('auth')}
                onSubscribeNewsletter={handleSubscribeNewsletter}
                isSubscribedNewsletter={false}
              />
            )}
          </div>
        } />
      </Routes>
    </Router>
  );
};

export default App;
