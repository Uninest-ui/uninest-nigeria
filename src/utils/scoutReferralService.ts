import { CampusScoutProfile, ScoutCommissionTransaction, ScoutPayoutRequest, ScoutServiceType, UniNestUser } from '../types';

const SCOUT_STORAGE_KEY = 'uninest_scouts_data_v1';
const TRANSACTIONS_STORAGE_KEY = 'uninest_scout_transactions_v1';
const PAYOUTS_STORAGE_KEY = 'uninest_scout_payouts_v1';
const ACTIVE_REF_KEY = 'uninest_active_scout_code';

export const INITIAL_SCOUTS: CampusScoutProfile[] = [];

export const INITIAL_TRANSACTIONS: ScoutCommissionTransaction[] = [];

export const INITIAL_PAYOUTS: ScoutPayoutRequest[] = [];

// Helper Functions
export const scoutReferralService = {
  // 1. Storage Access
  getScouts(): CampusScoutProfile[] {
    try {
      const stored = localStorage.getItem(SCOUT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const demoEmails = ['tariere@uninest.ng', 'preye.bmu@uninest.ng', 'ayomide.balogun@uninest.ng'];
        return Array.isArray(parsed) ? parsed.filter((s: any) => !demoEmails.includes(s.email?.toLowerCase())) : [];
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
