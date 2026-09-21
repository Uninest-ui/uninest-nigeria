import { DepositWithdrawalApproval } from '../types';

const APPROVALS_KEY = 'uninest_finance_approvals';

const INITIAL_APPROVALS: DepositWithdrawalApproval[] = [
  {
    id: 'req-dep-01',
    type: 'deposit',
    userEmail: 'student@campus.edu',
    userName: 'Tariere Ebimobowei',
    userPhone: '08123456789',
    university: 'Niger Delta University (NDU)',
    amount: 15000,
    date: 'Today, 11:30 AM',
    status: 'pending',
    method: 'Bank Transfer (Wema UniNest Dedicated Acct)',
    reference: 'DEP-NDU-90234',
    reason: 'Monthly STS Savings Contribution'
  },
  {
    id: 'req-wth-01',
    type: 'withdrawal',
    userEmail: 'student@campus.edu',
    userName: 'Tariere Ebimobowei',
    userPhone: '08123456789',
    university: 'Niger Delta University (NDU)',
    amount: 5000,
    date: 'Today, 12:45 PM',
    status: 'pending',
    bankName: 'GTBank',
    accountNumber: '0123456789',
    accountName: 'Tariere Ebimobowei',
    reference: 'WTH-NDU-88219',
    reason: 'Urgent departmental book photocopy & feeding'
  },
  {
    id: 'req-dep-02',
    type: 'deposit',
    userEmail: 'ebi.preye@bmu.edu.ng',
    userName: 'Ebiere Preye',
    userPhone: '08098765432',
    university: 'Bayelsa Medical University (BMU)',
    amount: 25000,
    date: 'Yesterday, 4:20 PM',
    status: 'approved',
    method: 'Paystack Automated Checkout',
    reference: 'DEP-BMU-33120',
    reason: 'Semester savings lock vault',
    reviewedBy: 'admin@uninest.com',
    reviewedAt: 'Yesterday, 4:35 PM'
  },
  {
    id: 'req-wth-02',
    type: 'withdrawal',
    userEmail: 'chukwuma.eze@fuotuoke.edu.ng',
    userName: 'Chukwuma Eze',
    userPhone: '08144556677',
    university: 'Federal University Otuoke (FUOTUOKE)',
    amount: 10000,
    date: 'Yesterday, 2:10 PM',
    status: 'approved',
    bankName: 'Access Bank',
    accountNumber: '0987654321',
    accountName: 'Chukwuma Eze',
    reference: 'WTH-FUO-11928',
    reason: 'Lodge water pumping bill contribution',
    reviewedBy: 'admin@uninest.com',
    reviewedAt: 'Yesterday, 2:30 PM'
  }
];

const safeDispatchFinanceUpdate = () => {
  try {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('uninest_finance_update'));
    }
  } catch {
    // fallback or ignore in non-browser/restricted environments
  }
};

export const approvalService = {
  getApprovals: (): DepositWithdrawalApproval[] => {
    try {
      const saved = localStorage.getItem(APPROVALS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem(APPROVALS_KEY, JSON.stringify(INITIAL_APPROVALS));
    return INITIAL_APPROVALS;
  },

  submitDepositRequest: (request: Omit<DepositWithdrawalApproval, 'id' | 'type' | 'status' | 'date' | 'reference'>): DepositWithdrawalApproval => {
    const list = approvalService.getApprovals();
    const newReq: DepositWithdrawalApproval = {
      ...request,
      id: `req-dep-${Date.now()}`,
      type: 'deposit',
      status: 'pending',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      reference: `DEP-${Math.floor(100000 + Math.random() * 900000)}`
    };

    const updated = [newReq, ...list];
    localStorage.setItem(APPROVALS_KEY, JSON.stringify(updated));
    safeDispatchFinanceUpdate();
    return newReq;
  },

  submitWithdrawalRequest: (request: Omit<DepositWithdrawalApproval, 'id' | 'type' | 'status' | 'date' | 'reference'>): DepositWithdrawalApproval => {
    const list = approvalService.getApprovals();
    const newReq: DepositWithdrawalApproval = {
      ...request,
      id: `req-wth-${Date.now()}`,
      type: 'withdrawal',
      status: 'pending',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      reference: `WTH-${Math.floor(100000 + Math.random() * 900000)}`
    };

    const updated = [newReq, ...list];
    localStorage.setItem(APPROVALS_KEY, JSON.stringify(updated));
    safeDispatchFinanceUpdate();
    return newReq;
  },

  approveRequest: (requestId: string, adminEmail: string = 'admin@uninest.com', note?: string): DepositWithdrawalApproval | null => {
    const list = approvalService.getApprovals();
    let approvedItem: DepositWithdrawalApproval | null = null;

    const updated = list.map(item => {
      if (item.id === requestId) {
        approvedItem = {
          ...item,
          status: 'approved',
          reviewedBy: adminEmail,
          reviewedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        };
        return approvedItem;
      }
      return item;
    });

    localStorage.setItem(APPROVALS_KEY, JSON.stringify(updated));

    // When an admin approves a manual deposit, automatically credit the student's STS savings account
    if (approvedItem && (approvedItem as DepositWithdrawalApproval).type === 'deposit') {
      try {
        const dep = approvedItem as DepositWithdrawalApproval;
        const SAVINGS_KEY = 'sts_savings_accounts';
        const rawSavings = localStorage.getItem(SAVINGS_KEY);
        let accounts: any[] = rawSavings ? JSON.parse(rawSavings) : [];
        const cleanEmail = (dep.userEmail || '').trim().toLowerCase();
        let target = accounts.find(a => a.userEmail?.toLowerCase() === cleanEmail);

        const creditAmount = Number(dep.amount || 0);
        const formattedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

        if (!target) {
          const randSuffix = Math.floor(1000 + Math.random() * 9000);
          target = {
            id: `sts-sav-${Date.now()}`,
            userEmail: dep.userEmail,
            stsAccountNumber: `STS-${randSuffix}-7701`,
            studentName: dep.userName || 'UniNest Student',
            university: dep.university || 'Niger Delta University (NDU)',
            department: 'Student Studies',
            currentLevel: '200L',
            expectedSignOutYear: '2028',
            startDate: formattedDate,
            targetGoalName: 'Final Year Project + Clearance + Convocation',
            targetAmount: 250000,
            currentBalance: 0,
            giftAccountBalance: 0,
            walletBalance: 0,
            status: 'active',
            isActivated: true,
            activationFeePaid: true,
            transactions: []
          };
          accounts.push(target);
        }

        target.currentBalance = (target.currentBalance || 0) + creditAmount;
        const giftBal = target.giftAccountBalance ?? target.giftBalance ?? 0;
        target.walletBalance = target.currentBalance + giftBal;

        if (!Array.isArray(target.transactions)) {
          target.transactions = [];
        }

        const pendingIndex = target.transactions.findIndex(
          (t: any) => t.id === dep.id || (t.description && t.description.includes(dep.reference))
        );

        const approvedDescription = `Deposit Confirmed & Approved by Admin [${dep.method || 'Bank Transfer'}] - Ref: ${dep.reference}`;

        if (pendingIndex !== -1) {
          target.transactions[pendingIndex] = {
            ...target.transactions[pendingIndex],
            status: 'approved',
            description: approvedDescription,
            balanceAfter: target.walletBalance
          };
        } else {
          target.transactions.unshift({
            id: `tx-appr-${Date.now()}`,
            type: 'deposit',
            amount: creditAmount,
            date: formattedDate,
            description: approvedDescription,
            balanceAfter: target.walletBalance
          });
        }

        localStorage.setItem(SAVINGS_KEY, JSON.stringify(accounts));

        // Also sync to global user profile if exists in localStorage
        try {
          const rawUsers = localStorage.getItem('uninest_users');
          if (rawUsers) {
            const allUsers = JSON.parse(rawUsers);
            if (Array.isArray(allUsers)) {
              const updatedUsers = allUsers.map((u: any) => {
                if (u.email?.toLowerCase() === cleanEmail) {
                  return { ...u, walletBalance: target.walletBalance };
                }
                return u;
              });
              localStorage.setItem('uninest_users', JSON.stringify(updatedUsers));
            }
          }
        } catch (syncErr) {
          console.warn('User profile sync warning:', syncErr);
        }
      } catch (err) {
        console.error('Error crediting savings on approval:', err);
      }
    }

    safeDispatchFinanceUpdate();
    return approvedItem;
  },

  rejectRequest: (requestId: string, reason: string, adminEmail: string = 'admin@uninest.com'): DepositWithdrawalApproval | null => {
    const list = approvalService.getApprovals();
    let rejectedItem: DepositWithdrawalApproval | null = null;

    const updated = list.map(item => {
      if (item.id === requestId) {
        rejectedItem = {
          ...item,
          status: 'rejected',
          rejectionReason: reason || 'Information does not match bank transaction',
          reviewedBy: adminEmail,
          reviewedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        };
        return rejectedItem;
      }
      return item;
    });

    localStorage.setItem(APPROVALS_KEY, JSON.stringify(updated));

    // If a deposit was rejected, update the pending transaction note in the student's STS savings account
    if (rejectedItem && (rejectedItem as DepositWithdrawalApproval).type === 'deposit') {
      try {
        const dep = rejectedItem as DepositWithdrawalApproval;
        const SAVINGS_KEY = 'sts_savings_accounts';
        const rawSavings = localStorage.getItem(SAVINGS_KEY);
        if (rawSavings) {
          const accounts: any[] = JSON.parse(rawSavings);
          const cleanEmail = (dep.userEmail || '').trim().toLowerCase();
          const target = accounts.find(a => a.userEmail?.toLowerCase() === cleanEmail);
          if (target && Array.isArray(target.transactions)) {
            const pendingIndex = target.transactions.findIndex(
              (t: any) => t.id === dep.id || (t.description && t.description.includes(dep.reference))
            );
            if (pendingIndex !== -1) {
              target.transactions[pendingIndex] = {
                ...target.transactions[pendingIndex],
                status: 'rejected',
                description: `Deposit Rejected by Admin [Ref: ${dep.reference}] - Reason: ${reason || 'Unverified'}`
              };
              localStorage.setItem(SAVINGS_KEY, JSON.stringify(accounts));
            }
          }
        }
      } catch (rejErr) {
        console.warn('Error updating rejected transaction status:', rejErr);
      }
    }

    safeDispatchFinanceUpdate();
    return rejectedItem;
  },

  getAll: (): DepositWithdrawalApproval[] => {
    return approvalService.getApprovals();
  },

  getPending: (): DepositWithdrawalApproval[] => {
    return approvalService.getApprovals().filter(a => a.status === 'pending');
  },

  approve: (requestId: string, adminEmail: string = 'admin@uninest.com', note?: string): boolean => {
    return !!approvalService.approveRequest(requestId, adminEmail, note);
  },

  reject: (requestId: string, adminEmail: string = 'admin@uninest.com', reason?: string): boolean => {
    return !!approvalService.rejectRequest(requestId, reason || 'Transaction could not be verified', adminEmail);
  }
};
