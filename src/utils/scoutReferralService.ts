import { CampusScoutProfile, ScoutCommissionTransaction, ScoutPayoutRequest, ScoutServiceType, UniNestUser } from '../types';

const SCOUT_STORAGE_KEY = 'uninest_scouts_data_v1';
const TRANSACTIONS_STORAGE_KEY = 'uninest_scout_transactions_v1';
const PAYOUTS_STORAGE_KEY = 'uninest_scout_payouts_v1';
const ACTIVE_REF_KEY = 'uninest_active_scout_code';

export const INITIAL_SCOUTS: CampusScoutProfile[] = [
  {
    id: 'scout-001',
    scoutCode: 'SCOUT-NDU-TARIERE',
    name: 'Tariere Ebimobowei',
    email: 'tariere@uninest.ng',
    phone: '08139045612',
    university: 'Niger Delta University (NDU, Amassoma)',
    department: 'Electrical Engineering',
    level: '300L',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    commissionRate: 0.05,
    totalEarnings: 84750,
    availableBalance: 42500,
    pendingBalance: 12250,
    totalWithdrawn: 30000,
    totalReferralsCount: 18,
    paidTransactionsCount: 14,
    bankName: 'GTBank (Guaranty Trust)',
    accountNumber: '0129845512',
    accountName: 'Tariere Ebimobowei',
    status: 'active',
    joinedDate: '2026-07-15',
    bio: 'Official NDU Campus Scout covering Amassoma lodges, campus escrow, and engineering research assistance.'
  },
  {
    id: 'scout-002',
    scoutCode: 'SCOUT-BMU-PREYE',
    name: 'Preye Alagoa',
    email: 'preye.bmu@uninest.ng',
    phone: '08034567890',
    university: 'Bayelsa Medical University (BMU, Yenagoa)',
    department: 'Medicine & Surgery',
    level: '400L',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    commissionRate: 0.05,
    totalEarnings: 52400,
    availableBalance: 27400,
    pendingBalance: 5000,
    totalWithdrawn: 20000,
    totalReferralsCount: 11,
    paidTransactionsCount: 9,
    bankName: 'Access Bank',
    accountNumber: '0711928471',
    accountName: 'Preye Alagoa',
    status: 'active',
    joinedDate: '2026-07-28',
    bio: 'BMU Yenagoa campus guide & medical study materials scout.'
  },
  {
    id: 'scout-003',
    scoutCode: 'SCOUT-FUO-AYOMIDE',
    name: 'Ayomide Balogun',
    email: 'ayomide.balogun@uninest.ng',
    phone: '08129988221',
    university: 'Federal University Otuoke (FUOTUOKE)',
    department: 'Computer Science',
    level: '200L',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
    commissionRate: 0.05,
    totalEarnings: 31500,
    availableBalance: 16500,
    pendingBalance: 5000,
    totalWithdrawn: 10000,
    totalReferralsCount: 8,
    paidTransactionsCount: 6,
    bankName: 'Kuda Bank',
    accountNumber: '2001928491',
    accountName: 'Ayomide Balogun',
    status: 'active',
    joinedDate: '2026-08-01',
    bio: 'FUO tech lead, cheap data bundles scout & off-campus room finder.'
  }
];

export const INITIAL_TRANSACTIONS: ScoutCommissionTransaction[] = [
  {
    id: 'comm-tx-001',
    scoutCode: 'SCOUT-NDU-TARIERE',
    scoutEmail: 'tariere@uninest.ng',
    scoutName: 'Tariere Ebimobowei',
    clientName: 'Victor Okon',
    clientEmail: 'victor.okon@ndu.edu.ng',
    clientUniversity: 'Niger Delta University (NDU)',
    serviceType: 'Marketplace Escrow',
    serviceDescription: 'Escrow payment for HP EliteBook Core i7 Laptop (Ref: ESC-8819)',
    grossAmount: 180000,
    commissionRate: 0.05,
    commissionAmount: 9000,
    status: 'cleared',
    date: '2026-08-28 14:22',
    paymentReference: 'PAY-NDU-COMM-9941',
    channel: 'dedicated_link'
  },
  {
    id: 'comm-tx-002',
    scoutCode: 'SCOUT-NDU-TARIERE',
    scoutEmail: 'tariere@uninest.ng',
    scoutName: 'Tariere Ebimobowei',
    clientName: 'Blessing Jumbo',
    clientEmail: 'blessing.jumbo@ndu.edu.ng',
    clientUniversity: 'Niger Delta University (NDU)',
    serviceType: 'Academic Assist',
    serviceDescription: 'Final Year Project Data Analysis & SPSS Regression Guidance',
    grossAmount: 35000,
    commissionRate: 0.05,
    commissionAmount: 1750,
    status: 'cleared',
    date: '2026-08-30 10:15',
    paymentReference: 'PAY-NDU-COMM-9942',
    channel: 'dedicated_link'
  },
  {
    id: 'comm-tx-003',
    scoutCode: 'SCOUT-NDU-TARIERE',
    scoutEmail: 'tariere@uninest.ng',
    scoutName: 'Tariere Ebimobowei',
    clientName: 'Emeka Nwosu',
    clientEmail: 'emeka.nwosu@ndu.edu.ng',
    clientUniversity: 'Niger Delta University (NDU)',
    serviceType: 'Lodge & Hostel Verification',
    serviceDescription: 'Verified Lodge Inspection & Room Reservation in Glory Land Lodge, Amassoma',
    grossAmount: 120000,
    commissionRate: 0.05,
    commissionAmount: 6000,
    status: 'cleared',
    date: '2026-09-01 16:40',
    paymentReference: 'PAY-NDU-COMM-9943',
    channel: 'referral_code_input'
  },
  {
    id: 'comm-tx-004',
    scoutCode: 'SCOUT-NDU-TARIERE',
    scoutEmail: 'tariere@uninest.ng',
    scoutName: 'Tariere Ebimobowei',
    clientName: 'Chinelo Eze',
    clientEmail: 'chinelo.eze@ndu.edu.ng',
    clientUniversity: 'Niger Delta University (NDU)',
    serviceType: 'STS Gifting',
    serviceDescription: 'STS Sign-out Cash Gift sent to graduating class of 2026',
    grossAmount: 15000,
    commissionRate: 0.05,
    commissionAmount: 750,
    status: 'cleared',
    date: '2026-09-02 09:12',
    paymentReference: 'PAY-NDU-COMM-9944',
    channel: 'dedicated_link'
  },
  {
    id: 'comm-tx-005',
    scoutCode: 'SCOUT-NDU-TARIERE',
    scoutEmail: 'tariere@uninest.ng',
    scoutName: 'Tariere Ebimobowei',
    clientName: 'David Timi',
    clientEmail: 'david.timi@ndu.edu.ng',
    clientUniversity: 'Niger Delta University (NDU)',
    serviceType: 'Marketplace Escrow',
    serviceDescription: 'Escrow payment for Scientific Engineering Calculator & Drafting Board',
    grossAmount: 25000,
    commissionRate: 0.05,
    commissionAmount: 1250,
    status: 'escrow_pending',
    date: '2026-09-03 18:30',
    paymentReference: 'PAY-NDU-COMM-9945',
    channel: 'dedicated_link'
  },
  {
    id: 'comm-tx-006',
    scoutCode: 'SCOUT-BMU-PREYE',
    scoutEmail: 'preye.bmu@uninest.ng',
    scoutName: 'Preye Alagoa',
    clientName: 'Kemi Adeleke',
    clientEmail: 'kemi.adeleke@bmu.edu.ng',
    clientUniversity: 'Bayelsa Medical University (BMU)',
    serviceType: 'Academic Assist',
    serviceDescription: 'Anatomy Lab Dissection Study Guide & Medical Flashcards Bundle',
    grossAmount: 20000,
    commissionRate: 0.05,
    commissionAmount: 1000,
    status: 'cleared',
    date: '2026-08-25 11:20',
    paymentReference: 'PAY-BMU-COMM-3321',
    channel: 'dedicated_link'
  }
];

export const INITIAL_PAYOUTS: ScoutPayoutRequest[] = [
  {
    id: 'payout-001',
    scoutCode: 'SCOUT-NDU-TARIERE',
    scoutEmail: 'tariere@uninest.ng',
    scoutName: 'Tariere Ebimobowei',
    amount: 30000,
    bankName: 'GTBank (Guaranty Trust)',
    accountNumber: '0129845512',
    accountName: 'Tariere Ebimobowei',
    status: 'completed',
    requestedAt: '2026-08-20 12:00',
    paidAt: '2026-08-20 12:15',
    transferReference: 'NIP-PAYSTK-NDU-2026-08209',
    notes: 'Direct NIP bank transfer verified and settled.'
  },
  {
    id: 'payout-002',
    scoutCode: 'SCOUT-BMU-PREYE',
    scoutEmail: 'preye.bmu@uninest.ng',
    scoutName: 'Preye Alagoa',
    amount: 20000,
    bankName: 'Access Bank',
    accountNumber: '0711928471',
    accountName: 'Preye Alagoa',
    status: 'completed',
    requestedAt: '2026-08-22 15:30',
    paidAt: '2026-08-22 16:00',
    transferReference: 'NIP-PAYSTK-BMU-2026-08221',
    notes: 'Cleared commission payout disbursed to Access Bank.'
  }
];

// Helper Functions
export const scoutReferralService = {
  // 1. Storage Access
  getScouts(): CampusScoutProfile[] {
    try {
      const stored = localStorage.getItem(SCOUT_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return INITIAL_SCOUTS;
  },

  saveScouts(scouts: CampusScoutProfile[]) {
    try {
      localStorage.setItem(SCOUT_STORAGE_KEY, JSON.stringify(scouts));
    } catch {
      // ignore
    }
  },

  getTransactions(): ScoutCommissionTransaction[] {
    try {
      const stored = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return INITIAL_TRANSACTIONS;
  },

  saveTransactions(txs: ScoutCommissionTransaction[]) {
    try {
      localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(txs));
    } catch {
      // ignore
    }
  },

  getPayoutRequests(): ScoutPayoutRequest[] {
    try {
      const stored = localStorage.getItem(PAYOUTS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return INITIAL_PAYOUTS;
  },

  savePayoutRequests(payouts: ScoutPayoutRequest[]) {
    try {
      localStorage.setItem(PAYOUTS_STORAGE_KEY, JSON.stringify(payouts));
    } catch {
      // ignore
    }
  },

  // 2. URL & Active Referral Tracking
  initUrlReferralCode(): string | null {
    try {
      if (typeof window === 'undefined') return null;
      const urlParams = new URLSearchParams(window.location.search);
      const refParam = urlParams.get('ref') || urlParams.get('scout') || urlParams.get('referral');
      if (refParam && refParam.trim()) {
        const cleanCode = refParam.trim().toUpperCase();
        this.setActiveReferralCode(cleanCode);
        return cleanCode;
      }
    } catch {
      // ignore
    }
    return this.getActiveReferralCode();
  },

  getActiveReferralCode(): string | null {
    try {
      return localStorage.getItem(ACTIVE_REF_KEY);
    } catch {
      return null;
    }
  },

  setActiveReferralCode(code: string) {
    try {
      const clean = code.trim().toUpperCase();
      localStorage.setItem(ACTIVE_REF_KEY, clean);
      window.dispatchEvent(new CustomEvent('uninest_scout_active_changed', { detail: { code: clean } }));
    } catch {
      // ignore
    }
  },

  clearActiveReferralCode() {
    try {
      localStorage.removeItem(ACTIVE_REF_KEY);
      window.dispatchEvent(new CustomEvent('uninest_scout_active_changed', { detail: { code: null } }));
    } catch {
      // ignore
    }
  },

  // 3. Scout Lookup
  findScoutByCode(code: string): CampusScoutProfile | undefined {
    if (!code) return undefined;
    const clean = code.trim().toUpperCase();
    const scouts = this.getScouts();
    return scouts.find(s => s.scoutCode.toUpperCase() === clean);
  },

  // 4. Ensure current user has a Scout Profile
  getOrCreateScoutForUser(user?: UniNestUser): CampusScoutProfile {
    const scouts = this.getScouts();
    const userEmail = user?.email || 'student@uninest.ng';
    const existing = scouts.find(s => s.email.toLowerCase() === userEmail.toLowerCase());
    if (existing) {
      return existing;
    }

    // Generate a unique, memorable scout code
    const uniAbbr = (user?.university || 'CAMPUS')
      .replace(/[^A-Za-z0-9]/g, ' ')
      .split(' ')
      .filter(w => w.length > 2)
      .map(w => w[0].toUpperCase())
      .slice(0, 3)
      .join('') || 'UNI';

    const cleanName = (user?.name || userEmail.split('@')[0] || 'SCOUT')
      .replace(/[^A-Za-z0-9]/g, '')
      .toUpperCase()
      .slice(0, 7);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const generatedCode = `SCOUT-${uniAbbr}-${cleanName || randomSuffix}`;

    const newScout: CampusScoutProfile = {
      id: `scout-user-${Date.now()}`,
      scoutCode: generatedCode,
      name: user?.name || 'UniNest Campus Scout',
      email: userEmail,
      phone: user?.phone || '08100000000',
      university: user?.university || 'Niger Delta University (NDU)',
      department: user?.department || 'Student Community',
      level: '300L',
      avatarUrl: user?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || userEmail)}`,
      commissionRate: 0.05,
      totalEarnings: 0,
      availableBalance: 0,
      pendingBalance: 0,
      totalWithdrawn: 0,
      totalReferralsCount: 0,
      paidTransactionsCount: 0,
      bankName: 'GTBank (Guaranty Trust)',
      accountNumber: '0123456789',
      accountName: user?.name || 'Campus Scout',
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
      bio: 'Verified student scout helping campus peers find lodges, verified sellers, and academic assistance with 5% referral commission.'
    };

    scouts.push(newScout);
    this.saveScouts(scouts);
    return newScout;
  },

  // 5. Update Scout Code or Bank details
  updateScoutProfile(scoutId: string, updates: Partial<CampusScoutProfile>): CampusScoutProfile | null {
    const scouts = this.getScouts();
    const idx = scouts.findIndex(s => s.id === scoutId);
    if (idx === -1) return null;

    scouts[idx] = { ...scouts[idx], ...updates };
    this.saveScouts(scouts);
    window.dispatchEvent(new CustomEvent('uninest_scout_updated', { detail: scouts[idx] }));
    return scouts[idx];
  },

  // 6. Record a 5% Commission Payment
  recordCommissionPayment({
    scoutCode,
    clientName,
    clientEmail,
    clientUniversity,
    serviceType,
    serviceDescription,
    grossAmount,
    channel = 'dedicated_link',
    isEscrow = false
  }: {
    scoutCode?: string;
    clientName: string;
    clientEmail: string;
    clientUniversity?: string;
    serviceType: ScoutServiceType;
    serviceDescription: string;
    grossAmount: number;
    channel?: 'dedicated_link' | 'referral_code_input' | 'direct_checkout';
    isEscrow?: boolean;
  }): ScoutCommissionTransaction | null {
    // If no code passed, try reading active code from storage
    const targetCode = (scoutCode || this.getActiveReferralCode() || '').trim().toUpperCase();
    if (!targetCode) return null;

    const scout = this.findScoutByCode(targetCode);
    if (!scout) {
      console.warn(`Scout with code ${targetCode} not found.`);
      return null;
    }

    const commissionRate = scout.commissionRate || 0.05;
    const commissionAmount = Math.round(grossAmount * commissionRate);

    const newTx: ScoutCommissionTransaction = {
      id: `comm-tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      scoutCode: scout.scoutCode,
      scoutEmail: scout.email,
      scoutName: scout.name,
      clientName: clientName || 'Campus Student',
      clientEmail: clientEmail || 'client@campus.ng',
      clientUniversity: clientUniversity || scout.university,
      serviceType: serviceType,
      serviceDescription: serviceDescription,
      grossAmount: grossAmount,
      commissionRate: commissionRate,
      commissionAmount: commissionAmount,
      status: isEscrow ? 'escrow_pending' : 'cleared',
      date: new Date().toLocaleString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      paymentReference: `PAY-COMM-${Date.now().toString().slice(-6)}`,
      channel: channel
    };

    // Save transaction
    const txs = this.getTransactions();
    txs.unshift(newTx);
    this.saveTransactions(txs);

    // Update scout financial balances
    const scouts = this.getScouts();
    const sIdx = scouts.findIndex(s => s.id === scout.id);
    if (sIdx !== -1) {
      scouts[sIdx].totalEarnings += commissionAmount;
      if (isEscrow) {
        scouts[sIdx].pendingBalance += commissionAmount;
      } else {
        scouts[sIdx].availableBalance += commissionAmount;
      }
      scouts[sIdx].paidTransactionsCount += 1;
      scouts[sIdx].totalReferralsCount += 1;
      this.saveScouts(scouts);
    }

    // Dispatch notification
    window.dispatchEvent(new CustomEvent('uninest_scout_commission_credited', { detail: newTx }));

    return newTx;
  },

  // 7. Request Payout / Bank Withdrawal
  requestPayout({
    scoutId,
    amount,
    bankName,
    accountNumber,
    accountName
  }: {
    scoutId: string;
    amount: number;
    bankName: string;
    accountNumber: string;
    accountName: string;
  }): { success: boolean; message: string; payout?: ScoutPayoutRequest } {
    const scouts = this.getScouts();
    const sIdx = scouts.findIndex(s => s.id === scoutId);
    if (sIdx === -1) {
      return { success: false, message: 'Scout profile not found.' };
    }

    const scout = scouts[sIdx];
    if (amount <= 0) {
      return { success: false, message: 'Invalid payout amount.' };
    }

    if (amount > scout.availableBalance) {
      return { 
        success: false, 
        message: `Insufficient cleared balance. You have ₦${scout.availableBalance.toLocaleString()} available for payout.` 
      };
    }

    // Deduct available, add to withdrawn
    scouts[sIdx].availableBalance -= amount;
    scouts[sIdx].totalWithdrawn += amount;
    this.saveScouts(scouts);

    const newPayout: ScoutPayoutRequest = {
      id: `payout-${Date.now()}`,
      scoutCode: scout.scoutCode,
      scoutEmail: scout.email,
      scoutName: scout.name,
      amount: amount,
      bankName: bankName,
      accountNumber: accountNumber,
      accountName: accountName,
      status: 'completed', // instant simulated Paystack NIP transfer
      requestedAt: new Date().toLocaleString(),
      paidAt: new Date().toLocaleString(),
      transferReference: `NIP-PAYSTK-${Date.now().toString().slice(-8)}`,
      notes: `Instant NIP transfer of ₦${amount.toLocaleString()} disbursed to ${bankName} (${accountNumber})`
    };

    const payouts = this.getPayoutRequests();
    payouts.unshift(newPayout);
    this.savePayoutRequests(payouts);

    // Update transactions to reflect paid out
    window.dispatchEvent(new CustomEvent('uninest_scout_payout_completed', { detail: newPayout }));

    return { 
      success: true, 
      message: `₦${amount.toLocaleString()} has been sent to ${bankName} (${accountNumber}) via UniNest Instant NIP Transfer!`, 
      payout: newPayout 
    };
  }
};
