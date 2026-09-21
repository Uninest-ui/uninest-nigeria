import React, { useState, useMemo, useEffect } from 'react';
import { 
  PiggyBank, 
  TrendingUp, 
  Gift, 
  CheckCircle2, 
  Calendar, 
  ArrowUpRight, 
  PlusCircle, 
  ShieldCheck, 
  Sparkles, 
  GraduationCap, 
  Copy, 
  Check, 
  Share2, 
  Heart, 
  Send,
  AlertCircle,
  Clock,
  UserCheck,
  Building,
  Building2,
  Wallet,
  DollarSign,
  Mail,
  ArrowRight,
  X,
  ArrowLeft,
  Phone,
  Lock,
  ShoppingBag,
  Award,
  Shield,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';
import { STSSavingsAccount, UniNestUser, StudentGift, UniNestRewardToken } from '../types';
import { SavingsGoalChart } from './SavingsGoalChart';
import { getStudentSTSWalletNumber, findStudentBySTSWallet, KNOWN_STS_STUDENTS } from '../utils/walletUtils';
import { OfficialBankPaymentCard } from './OfficialBankPaymentCard';
import { getOfficialPaymentConfig } from '../utils/paymentConfig';

interface STSSavingsTabProps {
  user: UniNestUser;
  account?: STSSavingsAccount;
  initialAction?: 'save' | 'gift' | 'claim' | null;
  onClearInitialAction?: () => void;
  onDeposit: (amount: number, description: string) => void;
  onGiftStudent?: (gift: Omit<StudentGift, 'id' | 'date'>) => void;
  onRequestLoan?: (amount: number, purpose: string, durationMonths: number) => void;
  onRepayLoan?: (amount: number) => void;
  onCreateSavingsPlan?: (targetYear: string, goalName: string, targetAmount: number, frequency: 'daily' | 'weekly' | 'monthly' | 'flexible') => void;
  onOpenWalletHistory?: () => void;
}

export const STSSavingsTab: React.FC<STSSavingsTabProps> = ({
  user,
  account,
  initialAction,
  onClearInitialAction,
  onDeposit,
  onGiftStudent,
  onCreateSavingsPlan,
  onOpenWalletHistory,
}) => {
  const safeUser = user || {
    name: 'Student',
    email: 'student@campus.ng',
    university: 'Nigerian University',
    avatarUrl: ''
  };

  // 500 NGN charge for new user using STS
  const [isStsActivated, setIsStsActivated] = useState<boolean>(() => {
    if (account?.isActivated || account?.activationFeePaid) return true;
    const stored = localStorage.getItem(`uninest_sts_activated_${safeUser.email}`);
    return stored === 'true';
  });
  const [activationSuccess, setActivationSuccess] = useState<string | null>(null);

  // Gifting Modal State
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientSchool, setRecipientSchool] = useState('Niger Delta University (NDU)');
  const [giftAmount, setGiftAmount] = useState('5000');
  const [giftOccasion, setGiftOccasion] = useState('Exam Handouts & Photocopy 📚');
  const [giftMessage, setGiftMessage] = useState('Best of luck with your semester tests! Enjoy lunch on me.');
  const [giftSuccess, setGiftSuccess] = useState<string | null>(null);
  const [giftError, setGiftError] = useState<string | null>(null);
  const [recipientWalletNumber, setRecipientWalletNumber] = useState('');

  // Current Student STS Account Number (used to receive gifts to gift account)
  const mySTSWalletNumber = account?.stsAccountNumber || getStudentSTSWalletNumber(safeUser.email, safeUser.phone);
  const [copiedMyWallet, setCopiedMyWallet] = useState(false);

  // 4-Digit Security PIN for STS Gift Transfers
  const [hasCustomPin, setHasCustomPin] = useState<boolean>(() => {
    if (account?.isPinCustomized || account?.stsPinCreated) return true;
    const localCreated = localStorage.getItem(`uninest_sts_pin_created_${safeUser.email}`);
    if (localCreated === 'true') return true;
    if (account?.stsPin && account.stsPin !== '1234') return true;
    const localPin = localStorage.getItem(`uninest_sts_pin_${safeUser.email}`);
    if (localPin && localPin !== '1234') return true;
    return false;
  });

  const [savedPin, setSavedPin] = useState<string>(() => {
    return localStorage.getItem(`uninest_sts_pin_${safeUser.email}`) || account?.stsPin || '1234';
  });
  const [showPinModal, setShowPinModal] = useState(false);
  // Modal modes: 'create' for first-time custom PIN setup, 'verify' for transfer authorization, 'change' for updating PIN
  const [pinModalMode, setPinModalMode] = useState<'create' | 'verify' | 'change'>('verify');
  const [enteredPin, setEnteredPin] = useState<string[]>(['', '', '', '']);
  
  // First-time customized PIN creation states
  const [createPin, setCreatePin] = useState<string[]>(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState<string[]>(['', '', '', '']);
  const [activePinField, setActivePinField] = useState<'create' | 'confirm'>('create');
  const [showCreatePinDigits, setShowCreatePinDigits] = useState(false);

  // Change PIN states for returning users
  const [currentPinCheck, setCurrentPinCheck] = useState('');
  const [changeNewPin, setChangeNewPin] = useState('');
  const [changeConfirmPin, setChangeConfirmPin] = useState('');

  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSuccess, setPinSuccess] = useState(false);
  const [showPinDigits, setShowPinDigits] = useState(false);
  const [pinChangeMsg, setPinChangeMsg] = useState<string | null>(null);

  // Official Payment & Escrow Configuration
  const paymentConfig = getOfficialPaymentConfig();
  const [giftFundingMethod, setGiftFundingMethod] = useState<'balance' | 'bank_escrow'>('balance');
  const [giftPayerName, setGiftPayerName] = useState(safeUser.name || '');
  const [giftPayerBank, setGiftPayerBank] = useState('United Bank for Africa (UBA)');
  const [giftEscrowRef, setGiftEscrowRef] = useState(() => `ESCROW-GIFT-${Math.floor(100000 + Math.random() * 900000)}`);
  const [copiedEscrowAccount, setCopiedEscrowAccount] = useState(false);
  const [copiedEscrowRef, setCopiedEscrowRef] = useState(false);

  // 70% Target Rewards & Tokens from UniNest
  const [claimedTokens, setClaimedTokens] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(`uninest_claimed_tokens_${safeUser.email}`);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const [tokenClaimSuccess, setTokenClaimSuccess] = useState<string | null>(null);

  const handleCopyMyWallet = () => {
    navigator.clipboard.writeText(mySTSWalletNumber);
    setCopiedMyWallet(true);
    setTimeout(() => setCopiedMyWallet(false), 2500);
  };

  const handleSelectPeerWallet = (walletNum: string) => {
    setRecipientWalletNumber(walletNum);
    const peer = findStudentBySTSWallet(walletNum);
    if (peer) {
      setRecipientEmail(peer.email);
      setRecipientName(peer.name);
      setRecipientSchool(peer.university);
    }
  };

  const handleWalletInputChange = (val: string) => {
    setRecipientWalletNumber(val);
    const peer = findStudentBySTSWallet(val);
    if (peer) {
      setRecipientEmail(peer.email);
      setRecipientName(peer.name);
      setRecipientSchool(peer.university);
    }
  };

  // Sign-Out Clearance Payout State (Clear Face Photo Verification)
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [signOutBank, setSignOutBank] = useState('GTBank');
  const [signOutAcctNumber, setSignOutAcctNumber] = useState('0123456789');
  const [signOutAcctName, setSignOutAcctName] = useState(safeUser.name || 'Student Account');
  const [signOutAmount, setSignOutAmount] = useState(account ? String(account.currentBalance) : '50000');
  const [signOutFacePhoto, setSignOutFacePhoto] = useState<string>(
    safeUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'
  );
  const [signOutFaceConfirmed, setSignOutFaceConfirmed] = useState(false);
  const [signOutSuccess, setSignOutSuccess] = useState<string | null>(null);

  // Gift Link copied
  const [copiedLink, setCopiedLink] = useState(false);
  const [showStsDepositCard, setShowStsDepositCard] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const [stsDepositAmount, setStsDepositAmount] = useState('5000');
  const [stsDepositPurpose, setStsDepositPurpose] = useState('Final Year Project Binding & Printing');

  // Trigger modal immediately when user arrives via quick action (Home Page Save in STS or Send Gift)
  useEffect(() => {
    if (initialAction === 'save') {
      setShowSaveModal(true);
      setShowStsDepositCard(true);
      onClearInitialAction?.();
    } else if (initialAction === 'gift') {
      setShowGiftModal(true);
      onClearInitialAction?.();
    } else if (initialAction === 'claim') {
      setShowSignOutModal(true);
      onClearInitialAction?.();
    }
  }, [initialAction, onClearInitialAction]);

  // Gifting Account & Incoming Payments (Buyer payments, student gifts, sponsor support - all pending until admin confirmed)
  const [incomingPayments, setIncomingPayments] = useState([
    {
      id: 'inc-01',
      sourceType: 'buyer_payment',
      title: 'Payment from Buyer: FX-991EX Scientific Calculator',
      senderName: 'David Kalu (Buyer)',
      senderDetails: 'Marketplace Cart Order #ORD-8821',
      amount: 8500,
      date: 'Today, 2:15 PM',
      status: 'pending' as 'pending' | 'confirmed'
    },
    {
      id: 'inc-02',
      sourceType: 'student_gift',
      title: 'Student Gift: Semester Handouts Support',
      senderName: 'Emeka Okoro',
      senderDetails: 'STS-8023-4412 (NDU)',
      amount: 3000,
      date: 'Yesterday, 6:40 PM',
      status: 'pending' as 'pending' | 'confirmed'
    },
    {
      id: 'inc-03',
      sourceType: 'buyer_payment',
      title: 'Payment from Buyer: Rechargeable Standing Fan',
      senderName: 'Tariere Ebimobowei (Buyer)',
      senderDetails: 'Marketplace Cart Order #ORD-8794',
      amount: 16000,
      date: 'Sep 08, 2026',
      status: 'confirmed' as 'pending' | 'confirmed'
    },
    {
      id: 'inc-04',
      sourceType: 'student_gift',
      title: 'Student Gift: Sign-Out Love & Congratulations',
      senderName: 'Blessing Ebi',
      senderDetails: 'STS-9034-4429 (FUOTUOKE)',
      amount: 5000,
      date: 'Sep 06, 2026',
      status: 'confirmed' as 'pending' | 'confirmed'
    }
  ]);
  const [adminConfirmNotice, setAdminConfirmNotice] = useState<string | null>(null);

  const [availableGiftBalance, setAvailableGiftBalance] = useState(() => {
    return account?.giftAccountBalance ?? account?.giftBalance ?? 15000;
  });

  const pendingIncomingAmount = useMemo(() => {
    return incomingPayments
      .filter((p) => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [incomingPayments]);

  const handleAdminConfirmPayment = (id: string) => {
    const item = incomingPayments.find((p) => p.id === id);
    if (!item) return;

    setIncomingPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'confirmed' } : p))
    );
    setAvailableGiftBalance((prev) => prev + item.amount);
    setAdminConfirmNotice(
      `✅ Admin Confirmed Payment! ₦${(item.amount || 0).toLocaleString()} has been approved and moved to your Available Gift Account balance.`
    );
    setTimeout(() => setAdminConfirmNotice(null), 6000);
  };

  const currentBalance = account?.currentBalance || 0;
  const giftAccountBalance = availableGiftBalance;
  // Master wallet balance carrying total amount (locked STS savings + spendable gift balance)
  const totalWalletAmount = account?.walletBalance ?? (currentBalance + giftAccountBalance);
  const targetTotal = account?.targetAmount || 150000;
  const progressPercent = Math.min(100, Math.round((currentBalance / (targetTotal || 1)) * 100));
  const is70PercentUnlocked = progressPercent >= 70;
  const target70PercentAmount = Math.round(targetTotal * 0.7);
  const remainingTo70 = Math.max(0, target70PercentAmount - currentBalance);

  // UniNest Official Gifts & Tokens (Opens after reaching 70% savings target)
  const UNINEST_REWARD_TOKENS: UniNestRewardToken[] = [
    {
      id: 'tok-convocation-cash',
      title: 'UniNest Convocation Cash Grant',
      category: 'graduation_bonus',
      valueNgn: 10000,
      description: 'Official ₦10,000 cash grant deposited directly into your Student Gift Account to support graduation attire, project binding, or sign-out expenses.',
      unlockedAtPercent: 70,
      isClaimed: !!claimedTokens['tok-convocation-cash'],
      tokenCode: 'UNINEST-70-CASH-10K'
    },
    {
      id: 'tok-academic-data',
      title: 'Academic 10GB High-Speed Data Token',
      category: 'airtime_data',
      valueNgn: 3000,
      description: 'High-speed 10GB 30-day internet grant valid on MTN, Airtel, Glo, or 9mobile for final-year defense research and project uploads.',
      unlockedAtPercent: 70,
      isClaimed: !!claimedTokens['tok-academic-data'],
      tokenCode: 'UNINEST-70-DATA-10GB'
    },
    {
      id: 'tok-exam-grant',
      title: 'VIP Marketplace Zero-Escrow Pass',
      category: 'exam_grant',
      valueNgn: 3000,
      description: '100% waiver on buyer and seller escrow inspection fees for trading gadgets, books, and hostel appliances on UniNest.',
      unlockedAtPercent: 70,
      isClaimed: !!claimedTokens['tok-exam-grant'],
      tokenCode: 'UNINEST-70-VIP-ESCROW'
    }
  ];

  const handleClaimToken = (token: UniNestRewardToken) => {
    if (!is70PercentUnlocked) {
      alert(`Eligibility for gifts and tokens from UniNest opens once 70% of your savings target is reached. You are currently at ${progressPercent}%.`);
      return;
    }
    if (claimedTokens[token.id]) {
      alert(`The ${token.title} has already been claimed.`);
      return;
    }
    const updated = { ...claimedTokens, [token.id]: true };
    setClaimedTokens(updated);
    localStorage.setItem(`uninest_claimed_tokens_${safeUser.email}`, JSON.stringify(updated));
    if (token.valueNgn > 0 && token.category === 'graduation_bonus') {
      setAvailableGiftBalance(prev => prev + token.valueNgn);
    }
    setTokenClaimSuccess(`🎉 ${token.title} Claimed! Token Code: ${token.tokenCode}. ${token.category === 'graduation_bonus' ? `₦${(token.valueNgn || 0).toLocaleString()} has been credited straight into your Gift Account!` : 'Check your university email for the redemption voucher.'}`);
    setTimeout(() => setTokenClaimSuccess(null), 9000);
  };

  const giftsSent = account?.giftsSent || [
    {
      id: 'gift-01',
      senderEmail: safeUser.email,
      senderName: safeUser.name || 'Tariere Ebimobowei',
      recipientEmail: 'ebi.tonye@fuotuoke.edu.ng',
      recipientName: 'Ebiere Tonye',
      recipientSchool: 'FUOTUOKE',
      amount: 5000,
      occasion: 'Exam Handouts & Photocopy 📚',
      message: 'Best of luck in your semester exams! Grab the handouts on me.',
      date: 'Aug 26, 2026'
    }
  ];

  const giftsReceived = account?.giftsReceived || [
    {
      id: 'gift-02',
      senderEmail: 'alumni.preye@alumni.ndu.edu.ng',
      senderName: 'Engr. Preye (NDU Alumni)',
      recipientEmail: safeUser.email,
      recipientName: safeUser.name || 'Tariere Ebimobowei',
      amount: 10000,
      occasion: 'Engineering Lab Project Support 💡',
      message: 'Keep making the Faculty proud. Stay focused!',
      date: 'Aug 28, 2026'
    }
  ];

  const totalGiftsSent = giftsSent.reduce((acc, g) => acc + g.amount, 0);
  const totalGiftsReceived = giftsReceived.reduce((acc, g) => acc + g.amount, 0);

  const handleActivateSTS = () => {
    setIsStsActivated(true);
    localStorage.setItem(`uninest_sts_activated_${safeUser.email}`, 'true');
    setActivationSuccess('🎉 STS Save Till Sign-Out Vault successfully activated! One-time ₦500 enrollment charge confirmed. Your graduation ledger and sign-out clearance certificate are now active.');
    setTimeout(() => setActivationSuccess(null), 8000);
  };

  const handleGiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(giftAmount);
    setGiftError(null);

    if (amt <= 0) {
      setGiftError('Please enter a valid gift amount.');
      return;
    }

    if (!recipientName.trim() || !recipientEmail.trim()) {
      setGiftError('Please provide the recipient student\'s name and email or phone number.');
      return;
    }

    if (giftFundingMethod === 'balance') {
      // STRICT POLICY: You can't gift from your STS account or wallet.
      // Transfers between STS Gift Numbers can only be funded by your spendable Gift Account!
      if (amt > giftAccountBalance) {
        setGiftError(
          `You cannot gift from your STS account or wallet! Your STS savings (₦${currentBalance.toLocaleString()}) is locked until your sign-out date. You only have ₦${giftAccountBalance.toLocaleString()} available in your Gift Account. Please reduce the gift amount or switch to 'Bank Deposit Escrow'.`
        );
        return;
      }

      if (!recipientWalletNumber.trim()) {
        setGiftError('Please enter or select the Recipient STS Gift Number to initiate transfer.');
        return;
      }

      // User instruction: 4 digit pin should be initiated during STS gift number to another gift number
      setPinError(null);
      setPinSuccess(false);

      if (!hasCustomPin) {
        // FIRST-TIME USER transferring with gifting account:
        // Prompt them to create their customized 4-digit PIN!
        setPinModalMode('create');
        setCreatePin(['', '', '', '']);
        setConfirmPin(['', '', '', '']);
        setActivePinField('create');
        setShowPinModal(true);
        return;
      } else {
        // RETURNING USER: verify existing customized PIN
        setPinModalMode('verify');
        setEnteredPin(['', '', '', '']);
        setShowPinModal(true);
        return;
      }
    } else {
      if (!giftPayerName.trim()) {
        setGiftError('Please provide the Depositor / Payer Name for bank verification.');
        return;
      }

      // Bank escrow transfer
      executeGiftTransfer(amt, 'bank_escrow');
    }
  };

  const executeGiftTransfer = (amt: number, method: 'balance' | 'bank_escrow', isFirstTimePin: boolean = false) => {
    if (onGiftStudent) {
      onGiftStudent({
        senderEmail: safeUser.email,
        senderName: safeUser.name || 'Student',
        senderSchool: safeUser.university || 'Nigerian University',
        recipientEmail: recipientEmail.trim(),
        recipientName: recipientName.trim(),
        recipientSchool: recipientSchool,
        amount: amt,
        occasion: giftOccasion,
        message: giftMessage.trim(),
        fundingMethod: method,
        senderStsNumber: mySTSWalletNumber,
        recipientStsNumber: recipientWalletNumber.trim() || undefined,
        stsPinVerified: method === 'balance',
        escrowReference: method === 'bank_escrow' ? giftEscrowRef : undefined,
        senderBankName: method === 'bank_escrow' ? giftPayerBank : undefined,
        payerAccountName: method === 'bank_escrow' ? giftPayerName : undefined
      });
    }

    if (method === 'balance') {
      // Local state update for gift balance
      setAvailableGiftBalance((prev) => Math.max(0, prev - amt));
      const prefix = isFirstTimePin
        ? '🛡️ Customized 4-Digit PIN Created & Verified!'
        : '🎁 4-Digit PIN Verified!';
      setGiftSuccess(
        `${prefix} Transferred ₦${amt.toLocaleString()} from STS Gift Number (${mySTSWalletNumber}) to ${recipientName.trim()} (${recipientWalletNumber.trim()}). Wallet balance has been deducted.`
      );
    } else {
      setGiftSuccess(
        `🛡️ Bank Deposit Escrow Gift of ₦${amt.toLocaleString()} successfully processed for ${recipientName.trim()}! Escrow Reference: ${giftEscrowRef}. Funds are secured in official escrow.`
      );
    }

    setShowPinModal(false);
    setShowGiftModal(false);
    setRecipientName('');
    setRecipientEmail('');
    setRecipientWalletNumber('');
    setGiftEscrowRef(`ESCROW-GIFT-${Math.floor(100000 + Math.random() * 900000)}`);
    setTimeout(() => setGiftSuccess(null), 8000);
  };

  // 4-Digit PIN Handlers for Returning User Verification
  const handlePinDigitChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, '');
    if (!cleaned && val !== '') return;
    const digit = cleaned.slice(-1);

    const newPin = [...enteredPin];
    newPin[index] = digit;
    setEnteredPin(newPin);
    setPinError(null);

    // Auto focus next box
    if (digit && index < 3) {
      const nextInput = document.getElementById(`sts-pin-box-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    // Auto verify on 4th digit
    if (digit && index === 3) {
      const fullPin = newPin.join('');
      if (fullPin.length === 4) {
        verifyPinAndProceed(fullPin);
      }
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !enteredPin[index] && index > 0) {
      const prevInput = document.getElementById(`sts-pin-box-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleKeypadPress = (digit: string) => {
    setPinError(null);
    const emptyIndex = enteredPin.findIndex((d) => d === '');
    if (emptyIndex !== -1) {
      const newPin = [...enteredPin];
      newPin[emptyIndex] = digit;
      setEnteredPin(newPin);

      if (emptyIndex === 3) {
        const fullPin = newPin.join('');
        verifyPinAndProceed(fullPin);
      }
    }
  };

  const handleKeypadBackspace = () => {
    setPinError(null);
    const lastFilledIdx = [...enteredPin].reverse().findIndex((d) => d !== '');
    if (lastFilledIdx !== -1) {
      const actualIdx = 3 - lastFilledIdx;
      const newPin = [...enteredPin];
      newPin[actualIdx] = '';
      setEnteredPin(newPin);
    }
  };

  const handleKeypadClear = () => {
    setEnteredPin(['', '', '', '']);
    setPinError(null);
  };

  const verifyPinAndProceed = (pinToTest: string) => {
    if (pinToTest === savedPin) {
      setPinSuccess(true);
      setTimeout(() => {
        const amt = Number(giftAmount);
        executeGiftTransfer(amt, 'balance', false);
      }, 500);
    } else {
      setPinError('Incorrect 4-digit PIN. Please check and try again.');
      setEnteredPin(['', '', '', '']);
      const firstInput = document.getElementById('sts-pin-box-0');
      if (firstInput) firstInput.focus();
    }
  };

  // First-Time Customized PIN Creation Handlers
  const handleCreatePinDigitChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, '');
    if (!cleaned && val !== '') return;
    const digit = cleaned.slice(-1);

    const updated = [...createPin];
    updated[index] = digit;
    setCreatePin(updated);
    setPinError(null);

    if (digit && index < 3) {
      const nextInput = document.getElementById(`sts-create-pin-${index + 1}`);
      if (nextInput) nextInput.focus();
    } else if (digit && index === 3) {
      setActivePinField('confirm');
      const firstConfirm = document.getElementById('sts-confirm-pin-0');
      if (firstConfirm) firstConfirm.focus();
    }
  };

  const handleCreatePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !createPin[index] && index > 0) {
      const prevInput = document.getElementById(`sts-create-pin-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleConfirmPinDigitChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, '');
    if (!cleaned && val !== '') return;
    const digit = cleaned.slice(-1);

    const updated = [...confirmPin];
    updated[index] = digit;
    setConfirmPin(updated);
    setPinError(null);

    if (digit && index < 3) {
      const nextInput = document.getElementById(`sts-confirm-pin-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleConfirmPinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !confirmPin[index]) {
      if (index > 0) {
        const prevInput = document.getElementById(`sts-confirm-pin-${index - 1}`);
        if (prevInput) prevInput.focus();
      } else {
        setActivePinField('create');
        const lastCreate = document.getElementById('sts-create-pin-3');
        if (lastCreate) lastCreate.focus();
      }
    }
  };

  const handleCreateKeypadPress = (digit: string) => {
    setPinError(null);
    if (activePinField === 'create') {
      const emptyIdx = createPin.findIndex((d) => d === '');
      if (emptyIdx !== -1) {
        const updated = [...createPin];
        updated[emptyIdx] = digit;
        setCreatePin(updated);
        if (emptyIdx === 3) {
          setActivePinField('confirm');
        }
      }
    } else {
      const emptyIdx = confirmPin.findIndex((d) => d === '');
      if (emptyIdx !== -1) {
        const updated = [...confirmPin];
        updated[emptyIdx] = digit;
        setConfirmPin(updated);
      }
    }
  };

  const handleCreateKeypadBackspace = () => {
    setPinError(null);
    if (activePinField === 'confirm') {
      const lastFilledIdx = [...confirmPin].reverse().findIndex((d) => d !== '');
      if (lastFilledIdx !== -1) {
        const actualIdx = 3 - lastFilledIdx;
        const updated = [...confirmPin];
        updated[actualIdx] = '';
        setConfirmPin(updated);
      } else {
        setActivePinField('create');
        const updated = [...createPin];
        updated[3] = '';
        setCreatePin(updated);
      }
    } else {
      const lastFilledIdx = [...createPin].reverse().findIndex((d) => d !== '');
      if (lastFilledIdx !== -1) {
        const actualIdx = 3 - lastFilledIdx;
        const updated = [...createPin];
        updated[actualIdx] = '';
        setCreatePin(updated);
      }
    }
  };

  const handleCreateKeypadClear = () => {
    setCreatePin(['', '', '', '']);
    setConfirmPin(['', '', '', '']);
    setActivePinField('create');
    setPinError(null);
  };

  const handleSaveCustomizedPinAndAuthorize = () => {
    const pinStr = createPin.join('');
    const confirmStr = confirmPin.join('');

    if (pinStr.length !== 4 || !/^\d{4}$/.test(pinStr)) {
      setPinError('Please enter all 4 digits for your new PIN.');
      return;
    }
    if (confirmStr.length !== 4) {
      setPinError('Please enter all 4 digits in the confirmation field.');
      return;
    }
    if (pinStr !== confirmStr) {
      setPinError('PINs do not match. Please ensure both fields match.');
      return;
    }

    // Save customized PIN
    setSavedPin(pinStr);
    setHasCustomPin(true);
    localStorage.setItem(`uninest_sts_pin_${safeUser.email}`, pinStr);
    localStorage.setItem(`uninest_sts_pin_created_${safeUser.email}`, 'true');
    setPinSuccess(true);
    setPinError(null);

    const amt = Number(giftAmount);
    if (amt > 0 && recipientWalletNumber.trim()) {
      setTimeout(() => {
        executeGiftTransfer(amt, 'balance', true);
      }, 700);
    } else {
      setTimeout(() => {
        setShowPinModal(false);
        setPinSuccess(false);
        setGiftSuccess('✅ Customized 4-Digit Security PIN successfully created! Your gifting account is now protected.');
        setTimeout(() => setGiftSuccess(null), 6000);
      }, 700);
    }
  };

  const handleUpdateExistingPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPinCheck !== savedPin) {
      setPinError('Current PIN is incorrect. Please try again.');
      return;
    }
    if (changeNewPin.length !== 4 || !/^\d{4}$/.test(changeNewPin)) {
      setPinError('New PIN must be exactly 4 numeric digits.');
      return;
    }
    if (changeNewPin !== changeConfirmPin) {
      setPinError('New PIN and confirmation PIN do not match.');
      return;
    }

    setSavedPin(changeNewPin);
    setHasCustomPin(true);
    localStorage.setItem(`uninest_sts_pin_${safeUser.email}`, changeNewPin);
    localStorage.setItem(`uninest_sts_pin_created_${safeUser.email}`, 'true');
    setPinSuccess(true);
    setPinError(null);
    setPinChangeMsg('✅ Customized 4-Digit Security PIN successfully updated!');
    setTimeout(() => {
      setPinModalMode('verify');
      setPinSuccess(false);
      setCurrentPinCheck('');
      setChangeNewPin('');
      setChangeConfirmPin('');
      setEnteredPin(['', '', '', '']);
    }, 1200);
  };

  const handleSignOutPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setSignOutFacePhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignOutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(signOutAmount);
    if (amt <= 0) {
      alert('Please enter a valid payout amount.');
      return;
    }
    if (!signOutFaceConfirmed) {
      alert('Please confirm that your face is clearly seen in the photo for graduation clearance verification.');
      return;
    }

    setSignOutSuccess(`🎉 Congratulations on Signing Out! Your STS clearance payout of ₦${amt.toLocaleString()} has been verified with clear facial identity and transferred to ${signOutBank} (${signOutAcctNumber}).`);
    
    // Also notify official STS clearance desk on WhatsApp
    const clearanceMsg = `🎓 *UNINEST GRADUATION SIGN-OUT CLEARANCE PAYOUT*\n` +
      `• Student Name: ${safeUser.name || 'Student'}\n` +
      `• University: ${safeUser.university || 'Campus'}\n` +
      `• Email: ${safeUser.email}\n` +
      `• Clearance Payout Amount: ₦${amt.toLocaleString()}\n` +
      `• Bank Details: ${signOutBank} | Acct: ${signOutAcctNumber} (${signOutAcctName})\n` +
      `• Facial Clearance: Verified On File\n` +
      `• Date: ${new Date().toLocaleDateString()}`;
    window.open(`https://wa.me/2349039847154?text=${encodeURIComponent(clearanceMsg)}`, '_blank');

    setShowSignOutModal(false);
    setTimeout(() => setSignOutSuccess(null), 8000);
  };

  const copyGiftLink = () => {
    const link = `https://uninest.ng/gift/${encodeURIComponent(user.email)}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notifications */}
      {giftSuccess && (
        <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-sm flex items-center gap-3 animate-in fade-in shadow-xs">
          <Gift className="w-5 h-5 text-purple-600 shrink-0" />
          <span className="font-semibold">{giftSuccess}</span>
        </div>
      )}

      {signOutSuccess && (
        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-sm flex items-center gap-3 shadow-xs">
          <GraduationCap className="w-6 h-6 text-indigo-600 shrink-0" />
          <span className="font-medium">{signOutSuccess}</span>
        </div>
      )}

      {/* Main Header / Intro */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0A1931] text-white shadow-xl relative overflow-hidden border-2 border-[#0A1931]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white border border-[#FF6A00]/50 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#FF6A00]" />
                <span>Save Till Sign-Out (STS) &amp; Student Gifting</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#FF6A00] text-white text-[11px] font-black uppercase tracking-wider shadow-sm">
                Bayelsa State Universities &amp; Abia State University (ABSU)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              STS Savings Vault &amp; Gift Account
            </h1>
            <p className="text-white/85 text-xs sm:text-sm leading-relaxed">
              Save steadily towards your convocation and sign-out milestone. Your unique STS Account Number enables sponsors, family, and peers to send gifts and tokens directly into your spendable Gift Account.
            </p>

            {/* STS Account Number Pill with Gift Notice */}
            <div className="pt-1 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-[#FF6A00] text-xs text-white">
                <Gift className="w-4 h-4 text-[#FF6A00] shrink-0" />
                <span>Your STS Account Number:</span>
                <strong className="font-mono text-[#FF6A00] font-black tracking-wider text-sm">{mySTSWalletNumber}</strong>
              </span>
              <button
                type="button"
                onClick={handleCopyMyWallet}
                className="px-3 py-2 rounded-xl bg-[#FF6A00] hover:bg-[#E55E00] text-white text-xs font-black transition cursor-pointer"
              >
                {copiedMyWallet ? 'Copied!' : 'Copy STS Number'}
              </button>
            </div>
            <p className="text-[11px] text-white/70">
              Share your STS Account Number with peers or sponsors to receive gifts directly into your Gift Account.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!isStsActivated && (
              <button
                onClick={handleActivateSTS}
                className="px-5 py-3 rounded-2xl bg-[#FF6A00] hover:bg-[#E55E00] text-white font-black text-xs shadow-lg transition flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>Activate STS Vault (₦500)</span>
              </button>
            )}
            <button
              onClick={() => setShowGiftModal(true)}
              className="px-5 py-3 rounded-2xl bg-[#FF6A00] hover:bg-[#E55E00] text-white font-black text-xs shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <Gift className="w-4 h-4 text-white" />
              <span>Gift a Student</span>
            </button>
            <button
              onClick={() => setShowSignOutModal(true)}
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition flex items-center gap-2 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-[#FF6A00]" />
              <span>Sign-Out Clearance</span>
            </button>
          </div>
        </div>

        {/* Quick Milestone & Rewards Banner */}
        <div className="mt-4 p-3 rounded-2xl bg-white/10 border border-white/20 text-xs text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-[#FF6A00] text-white font-bold text-xs">🎁</span>
            <span>
              <strong>UniNest Rewards Milestone:</strong> Reach 70% of your savings target to unlock free graduation gifts, ₦10,000 cash grant, and UniNest bonus tokens!
            </span>
          </div>
          <button
            onClick={() => setShowSaveModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#FF6A00] hover:bg-[#E55E00] text-white text-[11px] font-bold transition shrink-0 cursor-pointer self-start sm:self-auto"
          >
            Deposit to Savings
          </button>
        </div>

        {activationSuccess && (
          <div className="mt-3 p-3 rounded-2xl bg-white/10 border border-[#FF6A00] text-xs text-white flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#FF6A00] shrink-0" />
            <span>{activationSuccess}</span>
          </div>
        )}

        {/* Share "Gift Me" Link Strip */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-white/80">
            <Heart className="w-4 h-4 text-[#FF6A00] fill-[#FF6A00]" />
            <span>Need course mates, alumni, or family to support your handouts or pocket feeding?</span>
          </div>
          <button
            onClick={copyGiftLink}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-[#FF6A00]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Personal Gift Link Copied!' : 'Copy My "Gift Me" Link'}</span>
          </button>
        </div>
      </div>

      {/* 4 Key Metric Cards: Wallet carries total amount, STS Locked Savings, Gift Account, Sign-Out Target */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Wallet Amount */}
        <div className="p-5 rounded-3xl bg-white border-2 border-[#0A1931] shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#0A1931]">Total Wallet Amount</span>
            <span className="p-2 rounded-xl bg-[#0A1931] text-white">
              <Wallet className="w-4 h-4 text-[#FF6A00]" />
            </span>
          </div>
          <div className="text-2xl font-black text-[#0A1931]">
            ₦{totalWalletAmount.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#0A1931]/70 font-semibold flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span>Wallet carries total amount • Auto-deducted</span>
          </div>
        </div>

        {/* Metric 2: STS Locked Savings Account */}
        <div className="p-5 rounded-3xl bg-white border-2 border-slate-200 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800">Locked STS Savings</span>
            <span className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Lock className="w-4 h-4 text-amber-500" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-800">
            ₦{currentBalance.toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
            <span>🔒 Locked till sign-out • Cannot gift from STS</span>
          </div>
        </div>

        {/* Metric 3: Student Gift Account */}
        <div className="p-5 rounded-3xl bg-white border-2 border-[#FF6A00] shadow-xs space-y-2.5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#FF6A00]">Student Gift Account</span>
            <span className="p-2 rounded-xl bg-[#FF6A00] text-white">
              <Gift className="w-4 h-4 text-white" />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black text-[#FF6A00]">
              ₦{giftAccountBalance.toLocaleString()}
            </div>
            <button
              type="button"
              onClick={() => {
                setPinError(null);
                setPinSuccess(false);
                if (!hasCustomPin) {
                  setPinModalMode('create');
                  setCreatePin(['', '', '', '']);
                  setConfirmPin(['', '', '', '']);
                  setActivePinField('create');
                } else {
                  setPinModalMode('change');
                  setCurrentPinCheck('');
                  setChangeNewPin('');
                  setChangeConfirmPin('');
                }
                setShowPinModal(true);
              }}
              className={`text-[10px] font-black px-2.5 py-1 rounded-xl border transition cursor-pointer flex items-center gap-1 ${
                !hasCustomPin
                  ? 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
              title={!hasCustomPin ? 'Create your customized 4-digit security PIN' : 'Change your 4-digit security PIN'}
            >
              <Key className="w-3 h-3 text-[#FF6A00]" />
              <span>{!hasCustomPin ? 'Set 4-Digit PIN' : 'Change PIN'}</span>
            </button>
          </div>
          <div className="text-[11px] text-[#0A1931]/80 font-medium flex items-center justify-between pt-0.5 border-t border-slate-100">
            <span>Spendable balance • Peer Gifting</span>
            <span className={`text-[10px] font-bold ${hasCustomPin ? 'text-emerald-700' : 'text-amber-700'}`}>
              {hasCustomPin ? '🔒 PIN Secured' : '🛡️ First-Time Setup'}
            </span>
          </div>
        </div>

        {/* Metric 4: Sign-Out Target */}
        <div className="p-5 rounded-3xl bg-white border-2 border-[#0A1931]/15 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#0A1931]">Sign-Out Target</span>
            <span className="p-2 rounded-xl bg-[#0A1931]/5 text-[#0A1931]">
              <GraduationCap className="w-4 h-4 text-[#FF6A00]" />
            </span>
          </div>
          <div className="text-2xl font-black text-[#0A1931]">
            ₦{targetTotal.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#0A1931]/60">
            Class of {account?.targetYear || '2027'} Sign-Out Target ({progressPercent}%)
          </div>
        </div>
      </div>

      {/* Progress Bar Towards Sign-Out */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {account?.targetGoalName || 'Final Year Project + Clearance + Convocation Suit'}
            </h3>
            <p className="text-xs text-gray-500">
              {progressPercent}% of target reached ({account?.targetYear || '2027'} Sign-Out)
            </p>
          </div>
          <span className="text-xs font-black text-orange-600 px-3 py-1 bg-orange-50 rounded-full border border-orange-200">
            ₦{currentBalance.toLocaleString()} / ₦{targetTotal.toLocaleString()}
          </span>
        </div>

        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-orange-500 to-purple-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Official Bank Deposit / Top-up Section for STS Vault */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                <Building className="w-4 h-4" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                Deposit to Graduation Lock Vault via Official Bank
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Direct transfer to official UniNest account with instant automated WhatsApp confirmation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
            <button
              type="button"
              onClick={() => setShowSaveModal(true)}
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Fill Deposit Form (₦)</span>
            </button>
            <button
              type="button"
              onClick={() => setShowStsDepositCard(!showStsDepositCard)}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{showStsDepositCard ? 'Hide Details' : 'View Account Details'}</span>
            </button>
          </div>
        </div>

        {showStsDepositCard && (
          <div className="space-y-4 animate-in fade-in duration-200 pt-1">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  <strong>Savings Rules:</strong> Minimum savings is <strong>₦200</strong>. Funds are locked till your scheduled withdrawal date (<strong>{account?.withdrawalDate || 'Nov 30, 2026'}</strong>).
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 font-extrabold text-[10px] shrink-0">
                Min: ₦200
              </span>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700">Select Deposit Amount (₦):</label>
              <div className="flex items-center gap-2 flex-wrap">
                {['200', '500', '1000', '2000', '5000', '10000'].map((amt) => (
                  <button
                    type="button"
                    key={amt}
                    onClick={() => setStsDepositAmount(amt)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      stsDepositAmount === amt
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    ₦{Number(amt).toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Strict Sign-Out Expenses Purpose Dropdown */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Deposit Purpose (Strictly for Sign Out Expenses Purposes) *
              </label>
              <select
                value={stsDepositPurpose}
                onChange={(e) => setStsDepositPurpose(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-[#0A1931] focus:ring-2 focus:ring-[#FF6A00] focus:outline-none bg-white"
              >
                <option value="Final Year Project Binding & Printing">Final Year Project Binding &amp; Printing</option>
                <option value="Departmental & Faculty Sign-Out Clearance">Departmental &amp; Faculty Sign-Out Clearance</option>
                <option value="Convocation Gown & Academic Hood Rental">Convocation Gown &amp; Academic Hood Rental</option>
                <option value="Sign-Out Week Celebration & Class Dinner">Sign-Out Week Celebration &amp; Class Dinner</option>
                <option value="NYSC Relocation & Survival Stash">NYSC Relocation &amp; Survival Stash</option>
                <option value="Professional Certification & Induction Dues">Professional Certification &amp; Induction Dues</option>
              </select>
              <p className="text-[11px] text-[#FF6A00] font-bold">
                Notice: Deposit description is strictly for sign out expenses purposes.
              </p>
            </div>

            <OfficialBankPaymentCard
              amount={Number(stsDepositAmount || 5000)}
              purpose={`Sign-Out Expense: ${stsDepositPurpose} - ${safeUser.university || 'Campus'}`}
              studentName={safeUser.name}
              studentEmail={safeUser.email}
              studentPhone={safeUser.phone}
              university={safeUser.university}
              paymentCategory="sts_deposit"
              onCancel={() => setShowStsDepositCard(false)}
              cancelButtonLabel="Close Payment Card / Return to Vault"
              onPaymentSubmitted={() => {
                onDeposit(Number(stsDepositAmount || 5000), `Sign-Out Expense: ${stsDepositPurpose}`);
              }}
            />
          </div>
        )}
      </div>

      {/* 500 NGN New User STS Activation Card */}
      {!isStsActivated && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 border-2 border-amber-400 shadow-md space-y-4 animate-in fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black">
                <Sparkles className="w-3.5 h-3.5" />
                <span>New STS User Enrollment Fee (₦500)</span>
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Activate Your Graduation Lock Vault Ledger
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                UniNest charges a nominal one-time <strong>₦500 activation fee</strong> for all students using the Save Till Sign-Out (STS) service. This establishes your official verified graduation ledger, reserves your convocation sign-out clearance certificate, and generates your personal STS Wallet Number for peer gifts.
              </p>
            </div>
            <button
              onClick={handleActivateSTS}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Activate STS Vault (₦500)</span>
            </button>
          </div>
        </div>
      )}

      {/* UniNest Gifts & Tokens Rewards Hub: Opens after 70% savings target is reached */}
      <div id="uninest-rewards-hub" className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-[#0A1931] shadow-md space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#0A1931] text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-[#FF6A00]" />
                <span>UniNest Rewards &amp; Tokens Hub</span>
              </span>
              {is70PercentUnlocked ? (
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>70% Target Reached — Eligibility Open!</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-black flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Opens at 70% Target (Currently {progressPercent}%)</span>
                </span>
              )}
            </div>
            <h3 className="text-xl font-black text-[#0A1931]">
              Gifts &amp; Reward Tokens from UniNest
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
              Eligibility for official gifts, cash tokens, and graduation perks from UniNest opens once you reach <strong>70% of your STS savings target</strong> (₦{target70PercentAmount.toLocaleString()} of ₦{targetTotal.toLocaleString()}).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0A1931]/5 border border-[#0A1931]/10 flex flex-col items-center justify-center text-center min-w-[170px] shrink-0">
            <span className="text-[11px] font-bold text-slate-500">Savings Target Progress</span>
            <div className="text-2xl font-black text-[#0A1931]">
              {progressPercent}%
            </div>
            <span className="text-[10px] font-semibold text-slate-500">
              {is70PercentUnlocked ? 'Threshold Unlocked 🎉' : `₦${remainingTo70.toLocaleString()} to reach 70%`}
            </span>
          </div>
        </div>

        {/* Progress Bar towards 70% threshold */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <span>Progress to 70% Eligibility Threshold:</span>
              <strong className={is70PercentUnlocked ? 'text-emerald-600' : 'text-[#FF6A00]'}>
                {progressPercent >= 70 ? '100% of Requirement Met' : `${Math.min(100, Math.round((progressPercent / 70) * 100))}% toward milestone`}
              </strong>
            </span>
            <span className="text-slate-500">
              ₦{currentBalance.toLocaleString()} / ₦{target70PercentAmount.toLocaleString()} (70% Target)
            </span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200 relative">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                is70PercentUnlocked 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                  : 'bg-gradient-to-r from-amber-500 to-[#FF6A00]'
              }`}
              style={{ width: `${Math.min(100, (currentBalance / (target70PercentAmount || 1)) * 100)}%` }}
            />
          </div>
        </div>

        {tokenClaimSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{tokenClaimSuccess}</span>
          </div>
        )}

        {/* Reward Tokens Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {UNINEST_REWARD_TOKENS.map((token) => {
            const isClaimed = token.isClaimed;
            return (
              <div 
                key={token.id}
                className={`p-4 rounded-2xl border transition relative overflow-hidden flex flex-col justify-between space-y-3 ${
                  is70PercentUnlocked
                    ? isClaimed 
                      ? 'bg-slate-50 border-slate-200 opacity-90'
                      : 'bg-white border-[#0A1931]/20 hover:border-[#FF6A00] shadow-xs'
                    : 'bg-slate-50/70 border-slate-200 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-[#FF6A00]/10 text-[#FF6A00]">
                        <Award className="w-4 h-4" />
                      </span>
                      <h4 className="text-sm font-black text-[#0A1931]">{token.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {token.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-[#FF6A00] block">
                      ₦{(token.valueNgn || 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Value
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                  <span className="text-[10px] font-mono text-slate-500 font-bold">
                    Code: {token.tokenCode}
                  </span>
                  {isClaimed ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Claimed</span>
                    </span>
                  ) : is70PercentUnlocked ? (
                    <button
                      type="button"
                      onClick={() => handleClaimToken(token)}
                      className="px-3 py-1.5 rounded-xl bg-[#FF6A00] hover:bg-[#E55E00] text-white text-xs font-black shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>Claim to Gift Account</span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-200/60 px-2.5 py-1 rounded-lg">
                      <Lock className="w-3 h-3" />
                      <span>Unlocks at 70%</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Savings Goal Progression Chart */}
      <SavingsGoalChart
        currentBalance={currentBalance}
        targetGoalAmount={targetTotal}
        graduationYear={account?.targetYear || '2027'}
        monthlyDeposit={10000}
      />

      {/* Student Gifting History & Quick Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gifts Sent Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-pink-50 text-pink-600">
                <Gift className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-slate-900">Gifts You Sent</h3>
            </div>
            <button
              onClick={() => setShowGiftModal(true)}
              className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1 cursor-pointer"
            >
              <span>+ Gift Student</span>
            </button>
          </div>

          <div className="space-y-3">
            {giftsSent.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No student gifts sent yet. Surprise a course mate today!</p>
            ) : (
              giftsSent.map((g) => (
                <div key={g.id} className="p-3.5 rounded-2xl bg-pink-50/40 border border-pink-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      To: {g.recipientName} {g.recipientSchool && `(${g.recipientSchool})`}
                    </span>
                    <span className="text-xs font-extrabold text-pink-600">
                      -₦{(g.amount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-pink-800">
                    {g.occasion}
                  </div>
                  {g.message && (
                    <p className="text-[11px] text-gray-600 italic">"{g.message}"</p>
                  )}
                  <span className="text-[10px] text-gray-400 block pt-1">{g.date}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Gifts Received Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Heart className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-slate-900">Gifts You Received</h3>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Total: ₦{totalGiftsReceived.toLocaleString()}
            </span>
          </div>

          <div className="space-y-3">
            {giftsReceived.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No gifts received yet. Share your gift link with alumni and friends!</p>
            ) : (
              giftsReceived.map((g) => (
                <div key={g.id} className="p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      From: {g.senderName}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-600">
                      +₦{(g.amount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-800">
                    {g.occasion}
                  </div>
                  {g.message && (
                    <p className="text-[11px] text-gray-600 italic">"{g.message}"</p>
                  )}
                  <span className="text-[10px] text-gray-400 block pt-1">{g.date}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Gifting Account Dashboard to Receive Payment from Buyer, Students Gifting, etc. (All Pending Until Admin Confirmed) */}
      <div className="p-6 rounded-3xl bg-white border-2 border-[#FF6A00] shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#0A1931]/10 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6A00]/10 text-[#FF6A00] text-xs font-black">
              <Gift className="w-3.5 h-3.5 text-[#FF6A00]" />
              <span>Gifting Account Ledger &amp; Incoming Receipts</span>
            </div>
            <h3 className="text-xl font-black text-[#0A1931]">
              Gifting Account &amp; Buyer Payments Dashboard
            </h3>
            <p className="text-xs text-[#0A1931]/75 max-w-2xl leading-relaxed">
              Your Gift Account receives payment when buyers purchase your marketplace items, when peers gift you funds, and when sponsors support your studies.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-[#0A1931]/5 text-xs text-[#0A1931] font-bold border border-[#0A1931]/15">
              STS No: <strong className="font-mono text-[#FF6A00]">{mySTSWalletNumber}</strong>
            </span>
          </div>
        </div>

        {/* Policy Notice: All shows pending until admin confirmed payment */}
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 text-xs flex items-start gap-3 shadow-xs">
          <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <strong className="block font-black text-amber-900 text-sm">
              Gifting Account Verification Rule:
            </strong>
            <p className="leading-relaxed">
              Gifting account dashboard to receive payment from buyer, students gifting etc all shows <strong>PENDING</strong> until admin confirmed payment. Once confirmed, funds are automatically credited to your active Gift Account.
            </p>
          </div>
        </div>

        {adminConfirmNotice && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{adminConfirmNotice}</span>
          </div>
        )}

        {/* 3 Metric Cards for Gifting Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-[#FF6A00]/5 border border-[#FF6A00]/30 space-y-1">
            <span className="text-[11px] font-bold text-[#FF6A00] block uppercase tracking-wider">Available Confirmed Balance</span>
            <div className="text-2xl font-black text-[#0A1931]">₦{availableGiftBalance.toLocaleString()}</div>
            <span className="text-[10px] text-emerald-700 font-bold block">✓ Cleared for instant spending &amp; transfers</span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
            <span className="text-[11px] font-bold text-amber-800 block uppercase tracking-wider">Pending Incoming Payments</span>
            <div className="text-2xl font-black text-amber-900">₦{pendingIncomingAmount.toLocaleString()}</div>
            <span className="text-[10px] text-amber-700 font-medium block">⏳ Awaiting admin payment confirmation</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0A1931]/5 border border-[#0A1931]/15 space-y-1">
            <span className="text-[11px] font-bold text-[#0A1931]/70 block uppercase tracking-wider">Total Received to Date</span>
            <div className="text-2xl font-black text-[#0A1931]">₦{(availableGiftBalance + pendingIncomingAmount).toLocaleString()}</div>
            <span className="text-[10px] text-[#0A1931]/60 font-medium block">Buyer payments &amp; peer gifts combined</span>
          </div>
        </div>

        {/* Incoming Payments & Gifting Stream */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-black text-[#0A1931] uppercase tracking-wider">
            Incoming Payments &amp; Gifting Ledger
          </h4>

          <div className="space-y-2">
            {incomingPayments.map((p) => {
              const isPending = p.status === 'pending';
              const isBuyerPayment = p.sourceType === 'buyer_payment';

              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isPending
                      ? 'bg-amber-50/60 border-amber-200'
                      : 'bg-emerald-50/40 border-emerald-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                        isBuyerPayment ? 'bg-orange-100 text-[#FF6A00]' : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {isBuyerPayment ? <ShoppingBag className="w-4 h-4" /> : <Gift className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-xs font-black text-[#0A1931]">{p.title}</div>
                      <div className="text-[11px] text-[#0A1931]/75 flex items-center gap-2 mt-0.5">
                        <span>From: <strong>{p.senderName}</strong></span>
                        <span className="text-[#0A1931]/40">•</span>
                        <span>{p.senderDetails}</span>
                        <span className="text-[#0A1931]/40">•</span>
                        <span>{p.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <div className="text-sm font-black text-[#0A1931]">
                        +₦{(p.amount || 0).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-[#0A1931]/60">Gifting Account Credit</div>
                    </div>

                    {isPending ? (
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-black flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-700 animate-spin" />
                          <span>Pending Confirmation</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAdminConfirmPayment(p.id)}
                          className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition cursor-pointer flex items-center gap-1 shadow-xs"
                          title="Simulate Admin Payment Confirmation"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Confirm (Admin)</span>
                        </button>
                      </div>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-black flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                        <span>Admin Confirmed ✔</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-slate-900">STS Activity &amp; Transaction History</h3>
            <p className="text-[11px] text-gray-500">Recent deposits, rewards, and student gifting activity.</p>
          </div>
          {onOpenWalletHistory && (
            <button
              onClick={onOpenWalletHistory}
              className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-orange-200"
            >
              <span>Full Wallet Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="space-y-2">
          {account?.transactions?.map((tx) => {
            const isGiftSent = tx.type === 'gift_sent';
            const isGiftReceived = tx.type === 'gift_received';
            const isDeposit = tx.type === 'deposit';

            return (
              <div key={tx.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900">
                    {tx.description}
                  </div>
                  <div className="text-[11px] text-gray-400">
                    {tx.date}
                  </div>
                </div>
                <div className={`text-xs font-extrabold ${
                  isGiftSent ? 'text-rose-600' : isGiftReceived ? 'text-purple-600' : isDeposit ? 'text-emerald-600' : 'text-slate-900'
                }`}>
                  {isGiftSent ? `-₦${(tx.amount || 0).toLocaleString()}` : `+₦${(tx.amount || 0).toLocaleString()}`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save in STS Vault Form Modal (Direct immediate form filling from Home Tap) */}
      {showSaveModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSaveModal(false);
          }}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] my-auto animate-in fade-in zoom-in duration-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Navigation & Return Back Bar (Sticky Header) */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 shrink-0 sticky top-0 z-10">
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                id="btn-save-modal-back"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black transition cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs"
              >
                <ArrowLeft className="w-4 h-4 text-[#FF6A00]" />
                <span>Return to STS</span>
              </button>

              <div className="text-center">
                <span className="text-xs font-black text-orange-600 dark:text-orange-400 block">Save in STS Vault</span>
                <span className="text-[10px] text-slate-400">Lock for Sign-Out &amp; Clearance</span>
              </div>

              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                id="btn-save-modal-close"
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-4 sm:p-5 space-y-4 flex-1">
              {/* Savings Rule Notice */}
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold">Strict Lock-In Rule (Minimum ₦200)</p>
                  <p className="text-[11px] text-amber-800/90 dark:text-amber-400/80 leading-relaxed">
                    Deposits are locked towards your graduation goal (<strong className="text-amber-950 dark:text-amber-200">{account?.targetGoalName || 'Final Year Project & Clearance'}</strong>) till <strong>{account?.withdrawalDate || 'Nov 30, 2026'}</strong>.
                  </p>
                </div>
              </div>

              {/* Step 1: Deposit Amount Form */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 dark:text-slate-200">
                    Select or Enter Amount to Save (₦) *
                  </label>
                  <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400">Min: ₦200</span>
                </div>

                {/* Quick presets */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {['200', '500', '1000', '2000', '5000', '10000'].map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setStsDepositAmount(amt)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        stsDepositAmount === amt
                          ? 'bg-[#FF6A00] text-white border-[#FF6A00] shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-orange-400'
                      }`}
                    >
                      ₦{Number(amt).toLocaleString()}
                    </button>
                  ))}
                </div>

                {/* Custom Input */}
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">₦</span>
                  <input
                    type="number"
                    min="200"
                    step="100"
                    value={stsDepositAmount}
                    onChange={(e) => setStsDepositAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FF6A00] focus:outline-none"
                  />
                </div>
              </div>

              {/* Step 2: Deposit Purpose (Strictly for Sign Out Expenses Purposes) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-800 dark:text-slate-200">
                  Sign-Out Expense Purpose *
                </label>
                <select
                  value={stsDepositPurpose}
                  onChange={(e) => setStsDepositPurpose(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[#FF6A00] focus:outline-none"
                >
                  <option value="Final Year Project Binding & Printing">Final Year Project Binding &amp; Printing</option>
                  <option value="Departmental & Faculty Sign-Out Clearance">Departmental &amp; Faculty Sign-Out Clearance</option>
                  <option value="Convocation Gown & Academic Hood Rental">Convocation Gown &amp; Academic Hood Rental</option>
                  <option value="Sign-Out Week Celebration & Class Dinner">Sign-Out Week Celebration &amp; Class Dinner</option>
                  <option value="NYSC Relocation & Survival Stash">NYSC Relocation &amp; Survival Stash</option>
                  <option value="Professional Certification & Induction Dues">Professional Certification &amp; Induction Dues</option>
                </select>
                <p className="text-[10px] text-[#FF6A00] font-bold">
                  Notice: In accordance with STS rules, deposits are earmarked strictly for approved graduation &amp; clearance purposes.
                </p>
              </div>

              {saveSuccessMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveSuccessMessage}</span>
                </div>
              )}

              {saveErrorMessage && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{saveErrorMessage}</span>
                </div>
              )}

              {/* Step 3: Official Bank Payment Card for STS Deposit */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <OfficialBankPaymentCard
                  amount={Number(stsDepositAmount) || 5000}
                  purpose={`Sign-Out Expense: ${stsDepositPurpose} - ${safeUser.university || 'Campus'}`}
                  studentName={safeUser.name}
                  studentEmail={safeUser.email}
                  studentPhone={safeUser.phone}
                  university={safeUser.university}
                  paymentCategory="sts_deposit"
                  onCancel={() => setShowSaveModal(false)}
                  cancelButtonLabel="Close & Return to STS Vault"
                  onPaymentSubmitted={() => {
                    const num = Number(stsDepositAmount) || 5000;
                    onDeposit(num, `Sign-Out Expense: ${stsDepositPurpose}`);
                    setSaveSuccessMessage(`Deposit proof of ₦${num.toLocaleString()} submitted! Admin will verify and confirm your deposit before funds are credited to your active STS Vault balance.`);
                    setTimeout(() => {
                      setShowSaveModal(false);
                      setSaveSuccessMessage(null);
                    }, 3000);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gift Another Student Modal (Reduced Form Space with Easy Exit/Return Back) */}
      {showGiftModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowGiftModal(false);
          }}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] my-auto animate-in fade-in zoom-in duration-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Navigation & Return Back Bar (Sticky Header) */}
            <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-white shrink-0 sticky top-0 z-10">
              <button
                type="button"
                onClick={() => setShowGiftModal(false)}
                id="btn-gift-modal-back"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition cursor-pointer border border-slate-200 shadow-2xs"
              >
                <ArrowLeft className="w-4 h-4 text-[#FF6A00]" />
                <span>Return to STS</span>
              </button>

              <div className="text-right">
                <span className="text-xs font-black text-pink-600 block">Student Gifting</span>
                <span className="text-[10px] text-gray-400">Zero transfer fees</span>
              </div>

              <button
                type="button"
                onClick={() => setShowGiftModal(false)}
                id="btn-gift-modal-close"
                className="p-1.5 rounded-xl text-gray-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-4 sm:p-5 space-y-3 flex-1">
              {giftError && (
                <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{giftError}</span>
                </div>
              )}

            <form onSubmit={handleGiftSubmit} className="space-y-3">
              {/* Funding Method Selector */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black text-[#0A1931]">
                  Gift Funding Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGiftFundingMethod('balance')}
                    className={`p-2.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      giftFundingMethod === 'balance'
                        ? 'bg-[#0A1931] text-white border-[#0A1931] shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xs font-black">STS Gift Transfer</span>
                      <Gift className={`w-3.5 h-3.5 ${giftFundingMethod === 'balance' ? 'text-[#FF6A00]' : 'text-slate-400'}`} />
                    </div>
                    <span className="text-[10px] opacity-80 font-medium">
                      Gift Acct: ₦{giftAccountBalance.toLocaleString()}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGiftFundingMethod('bank_escrow')}
                    className={`p-2.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      giftFundingMethod === 'bank_escrow'
                        ? 'bg-[#0A1931] text-white border-[#0A1931] shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xs font-black">Bank Deposit Escrow</span>
                      <Building2 className={`w-3.5 h-3.5 ${giftFundingMethod === 'bank_escrow' ? 'text-[#FF6A00]' : 'text-slate-400'}`} />
                    </div>
                    <span className="text-[10px] text-[#FF6A00] font-black">
                      Direct Bank Transfer 🛡️
                    </span>
                  </button>
                </div>
              </div>

              {giftFundingMethod === 'balance' ? (
                <div className="p-3 rounded-2xl bg-[#0A1931]/5 border border-[#0A1931]/15 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-700 font-bold text-[11px]">
                    <Lock className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                    <span>Strict Policy: You cannot gift from your STS account or locked savings wallet!</span>
                  </div>
                  <div className="flex items-center justify-between font-bold text-[#0A1931]">
                    <span>Spendable Gift Account:</span>
                    <span className="text-[#FF6A00] font-black text-sm">₦{giftAccountBalance.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#0A1931]/70 text-[11px]">
                    <span>Locked STS Savings:</span>
                    <span className="font-bold text-slate-600">₦{currentBalance.toLocaleString()} (Locked)</span>
                  </div>
                  <div className="text-[10px] text-[#0A1931]/70 pt-1 border-t border-[#0A1931]/10 flex items-center gap-1">
                    <Key className="w-3 h-3 text-[#FF6A00] shrink-0" />
                    <span>
                      {!hasCustomPin 
                        ? 'First-Time Transfer: You will create your customized 4-digit PIN to secure all future peer gift transfers. Wallet balance will be deducted.' 
                        : 'Your customized 4-digit PIN will be requested to authorize this transfer from your STS Gift Number. Wallet balance will be deducted.'}
                    </span>
                  </div>
                </div>
              ) : (
                /* Bank Deposit Escrow Details Card */
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 space-y-2.5 text-xs text-[#0A1931]">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[#0A1931] flex items-center gap-1.5 text-xs">
                      <Building2 className="w-4 h-4 text-[#FF6A00]" />
                      <span>UniNest Institutional Escrow Vault</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#0A1931] text-white text-[10px] font-black">
                      Official Escrow
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Send funds directly from any bank app. Your gift is protected in escrow and credited to the student&apos;s Gift Account once confirmed.
                  </p>

                  <div className="p-2.5 rounded-xl bg-white border border-amber-200 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Bank Name:</span>
                      <strong className="font-bold text-[#0A1931]">{paymentConfig.bankName}</strong>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Account Number:</span>
                      <div className="flex items-center gap-1.5">
                        <strong className="font-mono text-sm font-black text-[#0A1931] tracking-wider">{paymentConfig.accountNumber}</strong>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(paymentConfig.accountNumber);
                            setCopiedEscrowAccount(true);
                            setTimeout(() => setCopiedEscrowAccount(false), 2000);
                          }}
                          className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer transition"
                        >
                          {copiedEscrowAccount ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Account Name:</span>
                      <strong className="font-bold text-[#0A1931] text-[10px]">{paymentConfig.accountName}</strong>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                      <span className="text-slate-500">Escrow Reference:</span>
                      <div className="flex items-center gap-1.5">
                        <strong className="font-mono text-xs font-black text-[#FF6A00]">{giftEscrowRef}</strong>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(giftEscrowRef);
                            setCopiedEscrowRef(true);
                            setTimeout(() => setCopiedEscrowRef(false), 2000);
                          }}
                          className="px-1.5 py-0.5 rounded bg-orange-100 hover:bg-orange-200 text-[#FF6A00] text-[10px] font-bold cursor-pointer transition"
                        >
                          {copiedEscrowRef ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                        Depositor / Payer Name *
                      </label>
                      <input
                        type="text"
                        value={giftPayerName}
                        onChange={(e) => setGiftPayerName(e.target.value)}
                        placeholder="e.g. Chief Tari Tonye / Sponsor"
                        required={giftFundingMethod === 'bank_escrow'}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-[#FF6A00] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                        Your Bank Name
                      </label>
                      <input
                        type="text"
                        value={giftPayerBank}
                        onChange={(e) => setGiftPayerBank(e.target.value)}
                        placeholder="e.g. GTBank, Zenith, OPay"
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-[#FF6A00] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Recipient STS Account Number & Quick Selector */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-[#0A1931]/5 border-2 border-[#FF6A00]/40">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-[#0A1931] flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5 text-[#FF6A00]" />
                    <span>Recipient STS Account Number</span>
                  </label>
                  <span className="text-[10px] text-[#FF6A00] font-bold">0% Transfer Fee</span>
                </div>
                <p className="text-[10px] text-[#0A1931]/70">
                  Note: STS Account number delivers gifts directly into the student&apos;s <strong>Gift Account</strong>.
                </p>
                <input
                  type="text"
                  value={recipientWalletNumber}
                  onChange={(e) => handleWalletInputChange(e.target.value)}
                  placeholder="e.g. STS-9034-4429"
                  className="w-full px-3 py-1.5 rounded-xl border border-[#0A1931]/20 bg-white font-mono text-xs font-black text-[#0A1931] focus:ring-2 focus:ring-[#FF6A00] focus:outline-none"
                />
                
                {/* Quick Peer Chips */}
                <div className="pt-1">
                  <span className="text-[10px] text-[#0A1931]/60 font-semibold block mb-1">Quick-select campus students:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {KNOWN_STS_STUDENTS.slice(0, 3).map((peer) => (
                      <button
                        key={peer.stsWalletNumber}
                        type="button"
                        onClick={() => handleSelectPeerWallet(peer.stsWalletNumber)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition flex items-center gap-1 cursor-pointer ${
                          recipientWalletNumber === peer.stsWalletNumber
                            ? 'bg-[#FF6A00] text-white border-[#FF6A00] shadow-xs'
                            : 'bg-white text-[#0A1931] border-[#0A1931]/20 hover:border-[#FF6A00]'
                        }`}
                      >
                        <span>{peer.name.split(' ')[0]}</span>
                        <span className="font-mono text-[9px] opacity-80">({peer.stsWalletNumber})</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-[#0A1931] mb-0.5">
                    Recipient Student Name *
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. Ebiere Tonye"
                    required
                    className="w-full px-2.5 py-1.5 rounded-xl border border-[#0A1931]/20 text-xs focus:ring-2 focus:ring-[#FF6A00] focus:outline-none text-[#0A1931]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#0A1931] mb-0.5">
                    Recipient Email or Phone *
                  </label>
                  <input
                    type="text"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="e.g. ebiere@campus.edu"
                    required
                    className="w-full px-2.5 py-1.5 rounded-xl border border-[#0A1931]/20 text-xs focus:ring-2 focus:ring-[#FF6A00] focus:outline-none text-[#0A1931]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-[#0A1931] mb-0.5">
                    Campus / University
                  </label>
                  <select
                    value={recipientSchool}
                    onChange={(e) => setRecipientSchool(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-xl border border-[#0A1931]/20 text-xs focus:ring-2 focus:ring-[#FF6A00] focus:outline-none bg-white text-[#0A1931]"
                  >
                    <option value="Niger Delta University (NDU)">NDU Amassoma</option>
                    <option value="Bayelsa Medical University (BMU)">BMU Yenagoa</option>
                    <option value="Federal University Otuoke (FUOTUOKE)">FUOTUOKE</option>
                    <option value="Abia State University (ABSU)">Abia State University (ABSU, Uturu)</option>
                    <option value="University of Port Harcourt (UNIPORT)">UNIPORT</option>
                    <option value="Delta State University (DELSU)">DELSU Abraka</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#0A1931] mb-0.5">
                    Gift Amount (₦) *
                  </label>
                  <input
                    type="number"
                    value={giftAmount}
                    onChange={(e) => setGiftAmount(e.target.value)}
                    min="500"
                    max={giftFundingMethod === 'balance' ? giftAccountBalance : undefined}
                    step="500"
                    required
                    className="w-full px-2.5 py-1.5 rounded-xl border border-[#0A1931]/20 text-xs font-bold focus:ring-2 focus:ring-[#FF6A00] focus:outline-none text-[#0A1931]"
                  />
                  {giftFundingMethod === 'balance' && (
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Max: ₦{giftAccountBalance.toLocaleString()} (Gift Account Balance)
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0A1931] mb-0.5">
                  Occasion / Purpose
                </label>
                <select
                  value={giftOccasion}
                  onChange={(e) => setGiftOccasion(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-xl border border-[#0A1931]/20 text-xs focus:ring-2 focus:ring-[#FF6A00] focus:outline-none bg-white text-[#0A1931]"
                >
                  <option value="Exam Handouts & Photocopy 📚">Exam Handouts &amp; Photocopy 📚</option>
                  <option value="Campus Lunch & Pocket Feeding 🍲">Campus Lunch &amp; Pocket Feeding 🍲</option>
                  <option value="Sign-Out Gown & Celebration 🎓">Sign-Out Gown &amp; Celebration 🎓</option>
                  <option value="Birthday Blessing 🎂">Birthday Blessing 🎂</option>
                  <option value="Final Year Project & Data Support 💡">Final Year Project &amp; Data Support 💡</option>
                  <option value="Hostel Upkeep & Light Bill 🏠">Hostel Upkeep &amp; Light Bill 🏠</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0A1931] mb-0.5">
                  Personal Note
                </label>
                <textarea
                  rows={2}
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  placeholder="Encourage your fellow student..."
                  className="w-full p-2 rounded-xl border border-[#0A1931]/20 text-xs focus:ring-2 focus:ring-[#FF6A00] focus:outline-none text-[#0A1931]"
                />
              </div>

              <div className="p-2 rounded-xl bg-[#0A1931]/5 border border-[#0A1931]/15 text-[10px] text-[#0A1931]/80 flex items-start gap-1.5">
                <Mail className="w-3 h-3 text-[#FF6A00] shrink-0 mt-0.5" />
                <span>Strictly private delivery directly to recipient&apos;s email. Exempt from campus push news.</span>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#0A1931]/10">
                <button
                  type="button"
                  onClick={() => setShowGiftModal(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0A1931]/5 hover:bg-[#0A1931]/10 text-[#0A1931] text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Go Out / Return</span>
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#FF6A00] hover:bg-[#E55E00] text-white text-xs font-black shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  {giftFundingMethod === 'bank_escrow' ? (
                    <>
                      <Building2 className="w-3.5 h-3.5 text-white" />
                      <span>Process Escrow Gift (₦{Number(giftAmount || 0).toLocaleString()})</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-3.5 h-3.5 text-white" />
                      <span>
                        {!hasCustomPin
                          ? `Create 4-Digit PIN & Transfer (₦${Number(giftAmount || 0).toLocaleString()})`
                          : `Authorize with 4-Digit PIN (₦${Number(giftAmount || 0).toLocaleString()})`}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* 4-Digit Security PIN Modal (First-Time PIN Creation, Transfer Authorization, or PIN Change) */}
      {showPinModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPinModal(false);
          }}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-200 flex flex-col my-auto animate-in fade-in zoom-in duration-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* PIN Modal Header */}
            <div className="p-4 bg-[#0A1931] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#FF6A00] text-white shadow-xs">
                  {pinModalMode === 'create' ? (
                    <Shield className="w-4 h-4 text-white" />
                  ) : pinModalMode === 'change' ? (
                    <Lock className="w-4 h-4 text-white" />
                  ) : (
                    <Key className="w-4 h-4 text-white" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-black">
                    {pinModalMode === 'create'
                      ? 'Create 4-Digit Security PIN'
                      : pinModalMode === 'change'
                      ? 'Change Security PIN'
                      : '4-Digit Security PIN'}
                  </h4>
                  <p className="text-[10px] text-white/70">
                    {pinModalMode === 'create'
                      ? 'First-Time Gifting Account Setup'
                      : pinModalMode === 'change'
                      ? 'Update Gifting Account PIN'
                      : 'STS Gift Transfer Authorization'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPinModal(false)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[82vh] overflow-y-auto">
              {/* Alert / Error Message */}
              {pinError && (
                <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2 animate-shake border border-red-200">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{pinError}</span>
                </div>
              )}

              {pinSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-black flex items-center gap-2 border border-emerald-200 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>
                    {pinModalMode === 'create'
                      ? 'Customized PIN Created! Authorizing transfer...'
                      : '4-Digit PIN Verified! Dispatched to Gift Number...'}
                  </span>
                </div>
              )}

              {/* MODE 1: FIRST-TIME USER PIN CREATION */}
              {pinModalMode === 'create' && (
                <div className="space-y-4">
                  {/* First-time explainer */}
                  <div className="p-3 rounded-2xl bg-orange-50/80 border border-[#FF6A00]/30 space-y-1.5 text-xs text-[#0A1931]">
                    <div className="flex items-center gap-1.5 text-[#FF6A00] font-black text-xs">
                      <ShieldCheck className="w-4 h-4 text-[#FF6A00]" />
                      <span>First-Time Transfer Security</span>
                    </div>
                    <p className="text-[11px] text-slate-700 leading-snug">
                      As a first-time user transferring from your gifting account, please choose a customized 4-digit PIN. This secures your gifting account and protects all future peer transfers.
                    </p>
                  </div>

                  {/* Transfer Summary if gifting */}
                  {Number(giftAmount) > 0 && recipientName && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="flex justify-between items-center text-[11px] text-slate-500">
                        <span>Recipient:</span>
                        <span className="font-bold text-slate-800">{recipientName}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-slate-500">
                        <span>STS Gift No:</span>
                        <span className="font-mono font-bold text-[#FF6A00]">{recipientWalletNumber || mySTSWalletNumber}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-slate-700 pt-1 border-t border-slate-200">
                        <span className="font-black">Transfer Amount:</span>
                        <span className="text-sm font-black text-emerald-600">₦{Number(giftAmount).toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  {/* Step A: Choose 4-Digit PIN */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-[#FF6A00] text-white text-[10px] font-black flex items-center justify-center">1</span>
                        <span>Choose 4-Digit PIN</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowCreatePinDigits(!showCreatePinDigits)}
                        className="text-[11px] text-[#FF6A00] hover:underline flex items-center gap-1 font-bold cursor-pointer"
                      >
                        {showCreatePinDigits ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{showCreatePinDigits ? 'Hide' : 'Show'}</span>
                      </button>
                    </div>

                    <div className="flex justify-center gap-3">
                      {[0, 1, 2, 3].map((idx) => (
                        <input
                          key={`create-${idx}`}
                          id={`sts-create-pin-${idx}`}
                          type={showCreatePinDigits ? 'text' : 'password'}
                          maxLength={1}
                          inputMode="numeric"
                          value={createPin[idx]}
                          onFocus={() => setActivePinField('create')}
                          onChange={(e) => handleCreatePinDigitChange(idx, e.target.value)}
                          onKeyDown={(e) => handleCreatePinKeyDown(idx, e)}
                          className={`w-12 h-13 text-center text-xl font-mono font-black rounded-2xl border-2 transition focus:outline-none ${
                            activePinField === 'create' && (createPin.findIndex((d) => d === '') === idx || (idx === 3 && createPin[3]))
                              ? 'border-[#FF6A00] ring-2 ring-[#FF6A00]/20 bg-orange-50/40 text-[#0A1931]'
                              : createPin[idx]
                              ? 'border-slate-300 bg-orange-50/20 text-[#0A1931]'
                              : 'border-slate-200 bg-slate-50 text-slate-800'
                          }`}
                          autoFocus={idx === 0}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Step B: Confirm 4-Digit PIN */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-[#0A1931] text-white text-[10px] font-black flex items-center justify-center">2</span>
                        <span>Confirm 4-Digit PIN</span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-medium">Re-enter same digits</span>
                    </div>

                    <div className="flex justify-center gap-3">
                      {[0, 1, 2, 3].map((idx) => (
                        <input
                          key={`confirm-${idx}`}
                          id={`sts-confirm-pin-${idx}`}
                          type={showCreatePinDigits ? 'text' : 'password'}
                          maxLength={1}
                          inputMode="numeric"
                          value={confirmPin[idx]}
                          onFocus={() => setActivePinField('confirm')}
                          onChange={(e) => handleConfirmPinDigitChange(idx, e.target.value)}
                          onKeyDown={(e) => handleConfirmPinKeyDown(idx, e)}
                          className={`w-12 h-13 text-center text-xl font-mono font-black rounded-2xl border-2 transition focus:outline-none ${
                            activePinField === 'confirm' && (confirmPin.findIndex((d) => d === '') === idx || (idx === 3 && confirmPin[3]))
                              ? 'border-[#0A1931] ring-2 ring-[#0A1931]/20 bg-slate-50 text-[#0A1931]'
                              : confirmPin[idx]
                              ? 'border-slate-300 bg-slate-50 text-[#0A1931]'
                              : 'border-slate-200 bg-slate-50 text-slate-800'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Match confirmation feedback */}
                    {createPin.join('').length === 4 && confirmPin.join('').length === 4 && (
                      <div className="pt-1">
                        {createPin.join('') === confirmPin.join('') ? (
                          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 text-[11px] font-bold flex items-center justify-center gap-1.5 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>PINs match! Ready to save & authorize.</span>
                          </div>
                        ) : (
                          <div className="p-2 rounded-xl bg-red-50 text-red-700 text-[11px] font-bold flex items-center justify-center gap-1.5 border border-red-200">
                            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                            <span>PINs do not match. Please re-enter.</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Switch Active Field Indicator */}
                  <div className="flex items-center justify-center gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setActivePinField('create')}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold transition cursor-pointer ${
                        activePinField === 'create'
                          ? 'bg-[#FF6A00] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Step 1: Set PIN ({createPin.filter(Boolean).length}/4)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePinField('confirm')}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold transition cursor-pointer ${
                        activePinField === 'confirm'
                          ? 'bg-[#0A1931] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Step 2: Confirm ({confirmPin.filter(Boolean).length}/4)
                    </button>
                  </div>

                  {/* Interactive Numeric Keypad */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                      <button
                        key={digit}
                        type="button"
                        onClick={() => handleCreateKeypadPress(digit)}
                        className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-black text-sm transition cursor-pointer"
                      >
                        {digit}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={handleCreateKeypadClear}
                      className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-500 font-bold text-xs transition cursor-pointer"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCreateKeypadPress('0')}
                      className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-black text-sm transition cursor-pointer"
                    >
                      0
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateKeypadBackspace}
                      className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-500 font-bold text-xs transition cursor-pointer"
                    >
                      ⌫
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPinModal(false)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveCustomizedPinAndAuthorize}
                      disabled={
                        createPin.join('').length !== 4 ||
                        confirmPin.join('').length !== 4 ||
                        createPin.join('') !== confirmPin.join('')
                      }
                      className="flex-1 py-2.5 rounded-xl bg-[#FF6A00] hover:bg-[#E55E00] disabled:opacity-40 text-white text-xs font-black shadow-md transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>
                        {Number(giftAmount) > 0 ? 'Save & Authorize' : 'Save PIN'}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* MODE 2: RETURNING USER PIN VERIFICATION */}
              {pinModalMode === 'verify' && (
                <div className="space-y-4">
                  {/* Transfer Ledger Overview */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center text-slate-500 text-[11px]">
                      <span>Sender STS Gift No:</span>
                      <span className="font-mono font-bold text-slate-800">{mySTSWalletNumber}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500 text-[11px]">
                      <span>Recipient STS Gift No:</span>
                      <span className="font-mono font-bold text-[#FF6A00]">{recipientWalletNumber || 'Peer Gift Number'}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500 text-[11px]">
                      <span>Recipient Name:</span>
                      <span className="font-bold text-slate-800">{recipientName}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                      <span className="font-black text-slate-700">Gift Amount:</span>
                      <span className="text-base font-black text-emerald-600">₦{Number(giftAmount || 0).toLocaleString()}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 pt-1 border-t border-slate-200/60">
                      <Wallet className="w-3 h-3 text-[#FF6A00] shrink-0" />
                      <span>Wallet deduction: Master wallet balance will be reduced upon transfer authorization.</span>
                    </div>
                  </div>

                  {/* 4 Digit Boxes */}
                  <div className="space-y-2 text-center">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-700">Enter Your 4-Digit STS PIN</label>
                      <button
                        type="button"
                        onClick={() => setShowPinDigits(!showPinDigits)}
                        className="text-[11px] text-[#FF6A00] hover:underline flex items-center gap-1 font-bold cursor-pointer"
                      >
                        {showPinDigits ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{showPinDigits ? 'Hide' : 'Show'}</span>
                      </button>
                    </div>

                    <div className="flex justify-center gap-3">
                      {[0, 1, 2, 3].map((idx) => (
                        <input
                          key={idx}
                          id={`sts-pin-box-${idx}`}
                          type={showPinDigits ? 'text' : 'password'}
                          maxLength={1}
                          inputMode="numeric"
                          value={enteredPin[idx]}
                          onChange={(e) => handlePinDigitChange(idx, e.target.value)}
                          onKeyDown={(e) => handlePinKeyDown(idx, e)}
                          className={`w-12 h-14 text-center text-2xl font-mono font-black rounded-2xl border-2 transition focus:outline-none ${
                            enteredPin[idx]
                              ? 'border-[#FF6A00] bg-orange-50/50 text-[#0A1931]'
                              : 'border-slate-300 bg-slate-50 text-slate-800'
                          }`}
                          autoFocus={idx === 0}
                        />
                      ))}
                    </div>

                    <p className="text-[10px] text-slate-400 font-medium">
                      Enter your secret 4-digit security PIN
                    </p>
                  </div>

                  {/* Interactive Keypad */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                      <button
                        key={digit}
                        type="button"
                        onClick={() => handleKeypadPress(digit)}
                        className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-black text-sm transition cursor-pointer"
                      >
                        {digit}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={handleKeypadClear}
                      className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-500 font-bold text-xs transition cursor-pointer"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => handleKeypadPress('0')}
                      className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-black text-sm transition cursor-pointer"
                    >
                      0
                    </button>
                    <button
                      type="button"
                      onClick={handleKeypadBackspace}
                      className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-500 font-bold text-xs transition cursor-pointer"
                    >
                      ⌫
                    </button>
                  </div>

                  {/* Change PIN option link */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Want to update your PIN?</span>
                    <button
                      type="button"
                      onClick={() => {
                        setPinModalMode('change');
                        setPinError(null);
                        setCurrentPinCheck('');
                        setChangeNewPin('');
                        setChangeConfirmPin('');
                      }}
                      className="text-[#FF6A00] font-bold hover:underline cursor-pointer"
                    >
                      Change PIN
                    </button>
                  </div>

                  {/* Modal Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowPinModal(false)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const fullPin = enteredPin.join('');
                        if (fullPin.length === 4) {
                          verifyPinAndProceed(fullPin);
                        } else {
                          setPinError('Please enter all 4 digits of your PIN.');
                        }
                      }}
                      disabled={enteredPin.join('').length !== 4}
                      className="flex-1 py-2.5 rounded-xl bg-[#FF6A00] hover:bg-[#E55E00] disabled:opacity-50 text-white text-xs font-black shadow-md transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verify PIN</span>
                    </button>
                  </div>
                </div>
              )}

              {/* MODE 3: CHANGE EXISTING PIN */}
              {pinModalMode === 'change' && (
                <form onSubmit={handleUpdateExistingPin} className="space-y-3.5">
                  <div className="p-3 rounded-2xl bg-orange-50 border border-orange-200 text-xs text-slate-700 space-y-1">
                    <span className="font-bold text-orange-950 block">Update Your 4-Digit PIN</span>
                    <p className="text-[11px] leading-snug">
                      Enter your current PIN, then choose a new 4-digit numeric code to protect your gifting account.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">Current 4-Digit PIN</label>
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="Enter current PIN"
                      value={currentPinCheck}
                      onChange={(e) => setCurrentPinCheck(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#FF6A00]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">New 4-Digit PIN</label>
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="Enter new 4 digits"
                      value={changeNewPin}
                      onChange={(e) => setChangeNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#FF6A00]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">Confirm New 4-Digit PIN</label>
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="Confirm new 4 digits"
                      value={changeConfirmPin}
                      onChange={(e) => setChangeConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#FF6A00]"
                      required
                    />
                  </div>

                  {pinChangeMsg && (
                    <p className="text-[11px] text-emerald-600 font-bold text-center">{pinChangeMsg}</p>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPinModalMode(hasCustomPin ? 'verify' : 'create');
                        setPinError(null);
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={changeNewPin.length !== 4 || changeConfirmPin.length !== 4}
                      className="flex-1 py-2.5 rounded-xl bg-[#FF6A00] hover:bg-[#E55E00] disabled:opacity-50 text-white text-xs font-black shadow-md transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Update PIN</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sign-Out Clearance Modal */}
      {showSignOutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSignOutModal(false);
          }}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] my-auto animate-in fade-in zoom-in duration-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-white shrink-0 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSignOutModal(false)}
                  id="btn-signout-modal-back"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition cursor-pointer border border-slate-200 shadow-2xs"
                >
                  <ArrowLeft className="w-4 h-4 text-indigo-600" />
                  <span>Back</span>
                </button>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">Sign-Out Clearance Cash Out</h3>
                  <p className="text-[10px] text-gray-500">Withdrawal is strictly for sign out cash out</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSignOutModal(false)}
                id="btn-signout-modal-close"
                className="p-1.5 rounded-xl text-gray-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1">
              <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 space-y-1">
                <strong className="block font-bold text-indigo-900">
                  🎓 Mandatory Policy: Withdrawal is for sign out cash out.
                </strong>
                <p className="leading-relaxed text-[11px] text-indigo-800">
                  STS savings cannot be withdrawn prematurely. All funds are disbursed exclusively for verified graduation sign out cash out with official departmental clearance.
                </p>
              </div>

              <form onSubmit={handleSignOutSubmit} className="space-y-3.5">
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <img src={signOutFacePhoto} alt="Graduation Face" className="w-16 h-16 rounded-2xl object-cover border border-slate-300" />
                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-800 block">Clear Face Graduation Photo</label>
                    <input type="file" accept="image/*" onChange={handleSignOutPhotoUpload} className="text-[11px]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Bank Name</label>
                    <input type="text" value={signOutBank} onChange={(e) => setSignOutBank(e.target.value)} required className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Account Number</label>
                    <input type="text" value={signOutAcctNumber} onChange={(e) => setSignOutAcctNumber(e.target.value)} required className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs" />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-1">
                  <input type="checkbox" checked={signOutFaceConfirmed} onChange={(e) => setSignOutFaceConfirmed(e.target.checked)} className="rounded" />
                  <span>I certify that this graduation photo clearly shows my face for sign out cash out clearance.</span>
                </label>

                <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowSignOutModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Return / Cancel</span>
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition cursor-pointer"
                  >
                    Cash Out Sign-Out Stash
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
