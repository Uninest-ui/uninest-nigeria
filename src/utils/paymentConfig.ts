import { useState, useEffect } from 'react';

export type PaymentProcessingMode = 'bank_transfer' | 'paystack' | 'both';

export interface OfficialPaymentConfig {
  bankName: string;
  bankShort: string;
  accountNumber: string;
  accountName: string;
  accountType: string;
  escrowAccountNumber: string;
  escrowPolicy: string;
  supportWhatsApp: string;
  paymentMode: PaymentProcessingMode;
  paystackPublicKey: string;
  paystackSecretKey?: string;
  paystackLiveMode: boolean;
  paystackBusinessName?: string;
  paystackAutoApprove: boolean;
  lastUpdated?: string;
  updatedBy?: string;
}

export const DEFAULT_PAYMENT_CONFIG: OfficialPaymentConfig = {
  bankName: 'United Bank for Africa (UBA)',
  bankShort: 'UBA',
  accountNumber: '2150445461',
  accountName: 'Stephen Stanley',
  accountType: 'UniNest Escrow & Student Accounts Vault',
  escrowAccountNumber: '2150445461',
  escrowPolicy: 'Payment is sent to Escrow Account (2150445461 - UBA) and released after buyer confirmation or within 3 working days.',
  supportWhatsApp: '2349039847154', // UniNest Official Finance & Payment Verification WhatsApp Desk
  paymentMode: 'both', // 'bank_transfer' | 'paystack' | 'both'
  paystackPublicKey: 'pk_test_uninest_escrow_official_8892',
  paystackSecretKey: '',
  paystackLiveMode: false,
  paystackBusinessName: 'UniNest Technologies Ltd',
  paystackAutoApprove: false, // Admin must confirm every deposit
  lastUpdated: '2026-09-14',
  updatedBy: 'admin@uninest.com',
};

const STORAGE_KEY = 'uninest_official_payment_config';
const EVENT_NAME = 'uninest_payment_config_updated';

export function getOfficialPaymentConfig(): OfficialPaymentConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_PAYMENT_CONFIG, ...parsed };
    }
  } catch (err) {
    console.warn('Error loading payment config from localStorage:', err);
  }
  return { ...DEFAULT_PAYMENT_CONFIG };
}

export function updateOfficialPaymentConfig(
  updates: Partial<OfficialPaymentConfig>,
  adminEmail: string = 'admin@uninest.com'
): OfficialPaymentConfig {
  const current = getOfficialPaymentConfig();
  const nextConfig: OfficialPaymentConfig = {
    ...current,
    ...updates,
    lastUpdated: new Date().toISOString().split('T')[0],
    updatedBy: adminEmail,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextConfig));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: nextConfig }));
  } catch (err) {
    console.error('Failed to save payment config:', err);
  }

  return nextConfig;
}

export function resetOfficialPaymentConfig(adminEmail: string = 'admin@uninest.com'): OfficialPaymentConfig {
  const resetConfig: OfficialPaymentConfig = {
    ...DEFAULT_PAYMENT_CONFIG,
    lastUpdated: new Date().toISOString().split('T')[0],
    updatedBy: adminEmail,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resetConfig));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: resetConfig }));
  } catch (err) {
    console.error('Failed to reset payment config:', err);
  }
  return resetConfig;
}

// React hook for reactive component re-rendering
export function useOfficialPaymentConfig(): OfficialPaymentConfig {
  const [config, setConfig] = useState<OfficialPaymentConfig>(getOfficialPaymentConfig);

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<OfficialPaymentConfig>;
      if (customEvent.detail) {
        setConfig(customEvent.detail);
      } else {
        setConfig(getOfficialPaymentConfig());
      }
    };

    window.addEventListener(EVENT_NAME, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(EVENT_NAME, handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  return config;
}

// Dynamic Object with getters for seamless backwards compatibility across all components
export const UNINEST_OFFICIAL_BANK = {
  get bankName() {
    return getOfficialPaymentConfig().bankName;
  },
  get bankShort() {
    return getOfficialPaymentConfig().bankShort;
  },
  get accountNumber() {
    return getOfficialPaymentConfig().accountNumber;
  },
  get accountName() {
    return getOfficialPaymentConfig().accountName;
  },
  get accountType() {
    return getOfficialPaymentConfig().accountType;
  },
  get escrowAccountNumber() {
    return getOfficialPaymentConfig().escrowAccountNumber || getOfficialPaymentConfig().accountNumber;
  },
  get escrowPolicy() {
    return getOfficialPaymentConfig().escrowPolicy;
  },
  get supportWhatsApp() {
    return getOfficialPaymentConfig().supportWhatsApp;
  },
  get paymentMode() {
    return getOfficialPaymentConfig().paymentMode;
  },
  get paystackPublicKey() {
    return getOfficialPaymentConfig().paystackPublicKey;
  },
  get paystackLiveMode() {
    return getOfficialPaymentConfig().paystackLiveMode;
  },
  get paystackBusinessName() {
    return getOfficialPaymentConfig().paystackBusinessName;
  }
};

export const ESCROW_ACCOUNT_INFO = {
  get bankName() {
    return getOfficialPaymentConfig().bankName;
  },
  get accountNumber() {
    return getOfficialPaymentConfig().accountNumber;
  },
  get accountName() {
    return `${getOfficialPaymentConfig().accountName} (UniNest Escrow)`;
  },
  workingDaysToAutoRelease: 3,
  get releasePolicy() {
    return getOfficialPaymentConfig().escrowPolicy;
  },
};

export interface PaymentConfirmationDetails {
  studentName?: string;
  studentEmail?: string;
  studentPhone?: string;
  university?: string;
  amount: number;
  purpose: string;
  reference?: string;
}

export function generatePaymentConfirmationWhatsAppUrl(details: PaymentConfirmationDetails): string {
  const currentBank = getOfficialPaymentConfig();
  const ref = details.reference || `UNW-PAY-${Date.now().toString().slice(-6)}`;
  const dateStr = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const text =
    `🎓 *UNINEST OFFICIAL PAYMENT CONFIRMATION*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `• *Student Name*: ${details.studentName || 'UniNest Student'}\n` +
    `• *Campus / University*: ${details.university || 'Campus'}\n` +
    `• *Email*: ${details.studentEmail || 'student@campus.ng'}\n` +
    `• *Phone*: ${details.studentPhone || 'N/A'}\n` +
    `• *Amount Transferred*: ₦${details.amount.toLocaleString()}\n` +
    `• *Payment Purpose*: ${details.purpose}\n` +
    `• *Destination Bank*: ${currentBank.bankShort} (${currentBank.bankName})\n` +
    `• *Account Number*: ${currentBank.accountNumber}\n` +
    `• *Account Name*: ${currentBank.accountName}\n` +
    `• *Reference*: ${ref}\n` +
    `• *Date & Time*: ${dateStr}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `I have transferred ₦${details.amount.toLocaleString()} to ${currentBank.accountName} (${currentBank.bankShort} - ${currentBank.accountNumber}).\n\n` +
    `Attached is my bank transfer receipt / debit alert screenshot for instant manual verification and credit.`;

  return `https://wa.me/${currentBank.supportWhatsApp}?text=${encodeURIComponent(text)}`;
}

