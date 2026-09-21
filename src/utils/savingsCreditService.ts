import { STSSavingsAccount, UniNestUser } from '../types';
import { INITIAL_STS_SAVINGS } from '../data/uninestData';

export interface ManualSavingsCreditInput {
  userEmail: string;
  userName?: string;
  university?: string;
  department?: string;
  amount: number;
  paymentMethod: string;
  reference: string;
  depositorName?: string;
  note?: string;
  adminEmail?: string;
  creditType?: 'locked_savings' | 'gift_account';
}

export interface ManualSavingsCreditResult {
  success: boolean;
  account: STSSavingsAccount;
  previousBalance: number;
  newBalance: number;
  amountCredited: number;
  transactionId: string;
  receiptNumber: string;
  date: string;
  creditType: 'locked_savings' | 'gift_account';
}

const STORAGE_KEY = 'sts_savings_accounts';

export const savingsCreditService = {
  /**
   * Retrieves all STS savings accounts from localStorage or initial fallback
   */
  getAllAccounts: (): STSSavingsAccount[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error loading STS savings accounts:', e);
    }
    return INITIAL_STS_SAVINGS;
  },

  /**
   * Retrieves savings account for a specific user email
   */
  getAccountByEmail: (email: string): STSSavingsAccount | null => {
    if (!email) return null;
    const list = savingsCreditService.getAllAccounts();
    return list.find(a => a.userEmail.toLowerCase() === email.toLowerCase()) || null;
  },

  /**
   * Admin executes manual increase of user's savings balance after paying manually
   */
  creditUserSavingsManually: (input: ManualSavingsCreditInput): ManualSavingsCreditResult => {
    const list = savingsCreditService.getAllAccounts();
    const cleanEmail = input.userEmail.trim().toLowerCase();
    const creditAmount = Math.max(0, Number(input.amount) || 0);
    const creditType = input.creditType || 'locked_savings';
    const txId = `tx-admin-manual-${Date.now()}`;
    const receiptNum = input.reference || `REC-MNL-${Date.now().toString().slice(-6)}`;
    const formattedDate = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });

    let targetAccount = list.find(a => a.userEmail.toLowerCase() === cleanEmail);
    let previousBalance = 0;
    let newBalance = 0;

    if (!targetAccount) {
      // Initialize fresh STS savings account for this student if not already present
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      targetAccount = {
        id: `sts-sav-${Date.now()}`,
        userEmail: cleanEmail,
        stsAccountNumber: `STS-${randomSuffix}-7701`,
        studentName: input.userName || cleanEmail.split('@')[0],
        university: input.university || 'Niger Delta University (NDU)',
        department: input.department || 'Undergraduate Studies',
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
      list.push(targetAccount);
    }

    if (creditType === 'gift_account') {
      previousBalance = targetAccount.giftAccountBalance ?? targetAccount.giftBalance ?? 0;
      newBalance = previousBalance + creditAmount;
      targetAccount.giftAccountBalance = newBalance;
      targetAccount.giftBalance = newBalance;
    } else {
      previousBalance = targetAccount.currentBalance || 0;
      newBalance = previousBalance + creditAmount;
      targetAccount.currentBalance = newBalance;
    }

    // Recalculate Master Wallet balance (core locked STS savings + spendable gift account)
    const currentLocked = targetAccount.currentBalance || 0;
    const currentGift = targetAccount.giftAccountBalance ?? targetAccount.giftBalance ?? 0;
    const updatedWalletTotal = currentLocked + currentGift;
    targetAccount.walletBalance = updatedWalletTotal;

    // Append official ledger deposit transaction
    const depositDescription = `Manual Payment Verified by Admin [${input.paymentMethod}] - Ref: ${receiptNum}${
      input.depositorName ? ` (Paid by: ${input.depositorName})` : ''
    }${input.note ? ` | Note: ${input.note}` : ''}`;

    if (!Array.isArray(targetAccount.transactions)) {
      targetAccount.transactions = [];
    }

    targetAccount.transactions.unshift({
      id: txId,
      type: 'deposit',
      amount: creditAmount,
      date: formattedDate,
      description: depositDescription,
      balanceAfter: updatedWalletTotal
    });

    // Save updated accounts back to storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

    // Also auto-approve any pending deposit request in approvalService if matching
    try {
      const keysToSync = ['uninest_finance_approvals', 'uninest_approvals'];
      for (const k of keysToSync) {
        const rawApprovals = localStorage.getItem(k);
        if (rawApprovals) {
          const approvals = JSON.parse(rawApprovals);
          if (Array.isArray(approvals)) {
            let modified = false;
            const updatedApprovals = approvals.map((app: any) => {
              if (
                app.status === 'pending' &&
                app.type === 'deposit' &&
                app.userEmail?.toLowerCase() === cleanEmail &&
                (app.reference === input.reference || Math.abs(Number(app.amount) - creditAmount) < 1)
              ) {
                modified = true;
                return {
                  ...app,
                  status: 'approved',
                  reviewedBy: input.adminEmail || 'admin@uninest.com',
                  reviewedAt: formattedDate,
                  reviewNote: `Credited manually by admin (Ref: ${receiptNum})`
                };
              }
              return app;
            });
            if (modified) {
              localStorage.setItem(k, JSON.stringify(updatedApprovals));
            }
          }
        }
      }
    } catch (e) {
      console.warn('Could not auto-match pending approval item:', e);
    }

    // Trigger universal UI refresh events
    window.dispatchEvent(new CustomEvent('uninest_finance_update'));
    window.dispatchEvent(
      new CustomEvent('sts_savings_updated', {
        detail: {
          userEmail: cleanEmail,
          account: targetAccount,
          amountCredited: creditAmount,
          newBalance
        }
      })
    );

    return {
      success: true,
      account: targetAccount,
      previousBalance,
      newBalance,
      amountCredited: creditAmount,
      transactionId: txId,
      receiptNumber: receiptNum,
      date: formattedDate,
      creditType
    };
  }
};
