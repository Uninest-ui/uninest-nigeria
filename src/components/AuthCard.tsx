import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Lock, 
  Check, 
  AlertCircle, 
  Send, 
  Clock, 
  RefreshCw, 
  X, 
  Eye, 
  EyeOff, 
  Home, 
  BookOpen, 
  Sparkles,
  Camera,
  Upload,
  GraduationCap,
  MapPin,
  CheckCircle2,
  Bell,
  User,
  Trash2,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Video,
  VideoOff,
  Play,
  Pause,
  Volume2,
  VolumeX,
  LogIn,
  Copy,
  ArrowRight
} from 'lucide-react';
import { UniNestUser, STSAccount, NewsItem } from '../types';
import { UniNestLogo } from './UniNestLogo';
import { sendOtpEmail } from '../services/emailService';
import { NIGERIAN_UNIVERSITIES, NIGERIAN_CAMPUS_PHOTOS, NIGERIAN_CAMPUS_VIDEOS, DEFAULT_ADMIN } from '../data/uninestData';
import { 
  supabase, 
  insertSignupProfileToSupabase, 
  fetchProfilesFromSupabase, 
  signUpWithSupabase, 
  signInWithSupabase, 
  signInWithGoogleSupabase, 
  sendSupabasePasswordReset,
  updateProfileInSupabase 
} from '../lib/supabaseService';

interface AuthCardProps {
  onLoginSuccess: (user: UniNestUser) => void;
  onContinueAsGuest: () => void;
  users: UniNestUser[];
  onRegisterUser: (user: UniNestUser) => void;
  onUpdateUserPassword: (emailOrPhone: string, newPass: string) => void;
  stsAccounts: STSAccount[];
  onCreateSTS: (sts: STSAccount) => void;
  onSubscribeNewsletter: (email: string) => void;
  newsletterSubscribers: string[];
}

export const AuthCard: React.FC<AuthCardProps> = ({
  onLoginSuccess,
  onContinueAsGuest,
  users,
  onRegisterUser,
  onUpdateUserPassword,
  stsAccounts,
  onCreateSTS,
  onSubscribeNewsletter,
  newsletterSubscribers,
}) => {
  // Tabs: 'login' | 'signup'
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  // Input states for Login
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotNewPass, setShowForgotNewPass] = useState(false);
  const [showForgotConfirmPass, setShowForgotConfirmPass] = useState(false);

  // Input states for Sign Up
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupUniversity, setSignupUniversity] = useState(NIGERIAN_UNIVERSITIES[0] || 'Bayelsa Medical University (BMU, Yenagoa)');
  const [isCustomUniversity, setIsCustomUniversity] = useState(false);
  const [customUniversity, setCustomUniversity] = useState('');
  const [signupDepartment, setSignupDepartment] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);
  const [signupPhotoUrl, setSignupPhotoUrl] = useState<string | null>(null);
  const [isPhotoDragging, setIsPhotoDragging] = useState(false);
  const signupPhotoInputRef = useRef<HTMLInputElement>(null);

  // Verified Vendor Signup States
  const [isVendorSignup, setIsVendorSignup] = useState(false);
  const [vendorBusinessName, setVendorBusinessName] = useState('');
  const [vendorWhatsappConfirmed, setVendorWhatsappConfirmed] = useState(false);

  // Status & error messages
  const [loginError, setLoginError] = useState<string | null>(null);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Newsletter section state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState<string | null>(null);
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  // ============= OTP Modal State (for Sign Up) =============
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(300); // 5 minutes
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [pendingSignupUser, setPendingSignupUser] = useState<UniNestUser | null>(null);
  const [toastNotification, setToastNotification] = useState<{ title: string; message: string } | null>(null);

  // ============= Refer and Earn Forever Modal State (Triggered upon Signup) =============
  const [showReferAndEarnModal, setShowReferAndEarnModal] = useState(false);
  const [referralSignupUser, setReferralSignupUser] = useState<UniNestUser | null>(null);
  const [copiedReferralLink, setCopiedReferralLink] = useState(false);
  const [copiedReferralCode, setCopiedReferralCode] = useState(false);

  // ============= Forgot Password Modal State =============
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotGenOtp, setForgotGenOtp] = useState('');
  const [forgotTimer, setForgotTimer] = useState(300);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotFeedback, setForgotFeedback] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  // ============= STS Modal State =============
  const [showSTSModal, setShowSTSModal] = useState(false);
  const [stsFullName, setStsFullName] = useState('');
  const [stsSchool, setStsSchool] = useState(NIGERIAN_UNIVERSITIES[0]);
  const [stsDept, setStsDept] = useState('Computer Science');
  const [stsDuration, setStsDuration] = useState('1 Month Exam Stay');
  const [stsRoomType, setStsRoomType] = useState('Self-Contain Apartment');
  const [stsBudget, setStsBudget] = useState('₦120,000 / stay');
  const [stsLocation, setStsLocation] = useState('Akoka, near Campus Gate');
  const [stsPhone, setStsPhone] = useState('');
  const [stsSuccessMsg, setStsSuccessMsg] = useState<string | null>(null);

  // ============= Upload Pictures Modal (Fixed Loop Bug) =============
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [uploadUser, setUploadUser] = useState<UniNestUser | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-rotating Nigerian Universities Background: Video & Photos
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isMediaPaused, setIsMediaPaused] = useState(false);
  const [isVideoMode, setIsVideoMode] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-cycle through Nigerian University campus videos
  useEffect(() => {
    if (isMediaPaused) return;
    const interval = setInterval(() => {
      if (isVideoMode) {
        setCurrentVideoIndex((prev) => (prev + 1) % NIGERIAN_CAMPUS_VIDEOS.length);
      } else {
        setCurrentPhotoIndex((prev) => (prev + 1) % NIGERIAN_CAMPUS_PHOTOS.length);
      }
    }, 12000); // 12 seconds per Nigerian university video
    return () => clearInterval(interval);
  }, [isMediaPaused, isVideoMode]);


  // Load remembered credentials on mount (strictly exclude any admin credentials)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('uninest_remembered');
      if (saved) {
        if (saved.toLowerCase() === 'admin@uninest.com' || saved.toLowerCase() === 'amaechihellis@gmail.com' || saved.toLowerCase() === 'admin') {
          localStorage.removeItem('uninest_remembered');
        } else {
          setIdentifier(saved);
          setRememberMe(true);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // OTP Countdown Timers
  useEffect(() => {
    let interval: any;
    if (showOtpModal && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [showOtpModal, otpTimer]);

  useEffect(() => {
    let interval: any;
    if (showForgotModal && forgotStep === 2 && forgotTimer > 0) {
      interval = setInterval(() => setForgotTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [showForgotModal, forgotStep, forgotTimer]);

  // Format seconds into MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // Helper to trigger active user post-login checks (STRICT FIX FOR UPLOAD LOOP BUG)
  const proceedPostLogin = (user: UniNestUser) => {
    // Save current user
    localStorage.setItem('uninest_current_user', JSON.stringify({ email: user.email, phone: user.phone }));

    // Admin goes directly to admin dashboard
    if (user.email === 'admin@uninest.com' || user.email === 'amaechihellis@gmail.com' || user.role === 'admin') {
      onLoginSuccess(user);
      return;
    }

    // Check STS accounts and upload flag
    const hasSTS = stsAccounts.some(acc => acc.userEmail.toLowerCase() === user.email.toLowerCase());
    const hasPicturesFlag = localStorage.getItem('uninest_pictures_uploaded_' + user.email) === 'true';

    if (hasSTS && hasPicturesFlag) {
      // Skip upload, go straight to dashboard
      onLoginSuccess(user);
    } else if (hasSTS && !hasPicturesFlag) {
      // Show upload once
      setUploadUser(user);
      setShowUploadModal(true);
    } else {
      // If no STS, go to dashboard
      onLoginSuccess(user);
    }
  };

  // ================= LOGIN SUBMISSION =================
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    const inputVal = identifier.trim().toLowerCase();
    const passVal = password.trim();

    if (!inputVal || !passVal) {
      setLoginError('Please enter email and password');
      setLoginLoading(false);
      return;
    }

    // Look up active admin user in state (or fallback DEFAULT_ADMIN)
    const activeAdmin = users.find(u => u.role === 'admin') || DEFAULT_ADMIN;
    const adminCleanPhone = (activeAdmin.phone || '08000000000').replace(/[^0-9]/g, '');

    // Check if entered identifier matches admin:
    // 1. Username 'admin'
    // 2. Active admin's current email (including when changed by admin)
    // 3. Fallback default 'admin@uninest.com'
    // 4. Admin's registered phone number
    const isAdminIdentifier = 
      inputVal === 'admin' ||
      inputVal === (activeAdmin.email || '').toLowerCase() ||
      inputVal === 'admin@uninest.com' ||
      inputVal === 'amaechihellis@gmail.com' ||
      inputVal === adminCleanPhone ||
      inputVal === '08000000000';

    const isValidAdminPass = 
      passVal === 'Admin@123' ||
      passVal.toLowerCase() === 'admin@123' ||
      passVal === activeAdmin.password ||
      (Boolean(activeAdmin.password) && passVal.toLowerCase() === activeAdmin.password.toLowerCase()) ||
      passVal.toLowerCase() === 'admin';

    if (isAdminIdentifier) {
      if (isValidAdminPass) {
        localStorage.removeItem('uninest_remembered');

        const resolvedAdmin: UniNestUser = {
          ...DEFAULT_ADMIN,
          ...activeAdmin,
          role: 'admin',
          email: activeAdmin.email || 'amaechihellis@gmail.com',
          password: 'Admin@123'
        };

        // Self-heal localStorage users if admin password was modified or desynced
        try {
          const stored = localStorage.getItem('uninest_users');
          if (stored) {
            const parsed: UniNestUser[] = JSON.parse(stored);
            const updated = parsed.map(u => 
              u.role === 'admin' || (u.email && (u.email.toLowerCase() === 'admin@uninest.com' || u.email.toLowerCase() === 'amaechihellis@gmail.com'))
                ? { ...u, password: 'Admin@123', role: 'admin' as const }
                : u
            );
            localStorage.setItem('uninest_users', JSON.stringify(updated));
          }
        } catch (e) {
          console.warn('Admin storage repair notice:', e);
        }

        setLoginLoading(false);
        proceedPostLogin(resolvedAdmin);
        return;
      } else {
        setLoginError('Incorrect password. Default admin password is: Admin@123');
        setLoginLoading(false);
        return;
      }
    }

    // Check registered users list (students, vendors, custom accounts)
    const foundUser = users.find(u => 
      (u.email && u.email.toLowerCase() === inputVal) || 
      (inputVal === 'admin' && u.role === 'admin') ||
      (u.phone && u.phone.replace(/[^0-9]/g, '') === inputVal.replace(/[^0-9]/g, ''))
    );

    if (!foundUser) {
      setLoginError('No account found with this email/phone. Please Sign Up first');
      setLoginLoading(false);
      return;
    }

    if (foundUser.role === 'admin') {
      if (isValidAdminPass) {
        setLoginLoading(false);
        proceedPostLogin({ ...DEFAULT_ADMIN, ...foundUser, role: 'admin', password: 'Admin@123' });
        return;
      }
    }

    if (foundUser.password !== passVal && foundUser.password.toLowerCase() !== passVal.toLowerCase()) {
      setLoginError('Incorrect password. Use Forgot Password? to reset');
      setLoginLoading(false);
      return;
    }

    // Remember Me handling
    if (rememberMe) {
      localStorage.setItem('uninest_remembered', foundUser.email);
    } else {
      localStorage.removeItem('uninest_remembered');
    }

    setLoginLoading(false);
    proceedPostLogin(foundUser);
  };

  // Photo upload handling
  const handlePhotoFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setSignupError('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSignupError('Image size is too large (max 5MB).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSignupPhotoUrl(event.target.result as string);
        if (signupError) setSignupError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handlePhotoFile(e.target.files[0]);
    }
  };

  // ================= SIGN UP SUBMISSION (Initiates OTP) =================
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);
    setSignupLoading(true);

    const nameVal = signupName.trim();
    const emailVal = signupEmail.trim().toLowerCase();
    const phoneVal = signupPhone.trim();
    const passVal = signupPassword.trim();
    const confirmPassVal = signupConfirmPassword.trim();

    if (!nameVal) {
      setSignupError('Please enter your full name.');
      setSignupLoading(false);
      return;
    }

    if (!emailVal || !emailVal.includes('@')) {
      setSignupError('Please enter a valid email address.');
      setSignupLoading(false);
      return;
    }

    if (!phoneVal) {
      setSignupError('Please enter your phone number.');
      setSignupLoading(false);
      return;
    }

    if (passVal.length < 6) {
      setSignupError('Password must be at least 6 characters.');
      setSignupLoading(false);
      return;
    }

    if (passVal !== confirmPassVal) {
      setSignupError('Passwords do not match. Please ensure Password and Confirm Password are the same.');
      setSignupLoading(false);
      return;
    }

    // Check if user already exists
    const exists = users.some(u => 
      u.email.toLowerCase() === emailVal || 
      (u.phone && u.phone.replace(/[^0-9]/g, '') === phoneVal.replace(/[^0-9]/g, ''))
    );

    if (exists) {
      setSignupError('An account with this email or phone number already exists. Please login.');
      setSignupLoading(false);
      return;
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpTimer(300); // 5 min
    setOtpCode('');
    setOtpError(null);

    const resolvedUniversity = (isCustomUniversity || signupUniversity === '__OTHER__')
      ? customUniversity.trim()
      : signupUniversity;

    if ((isCustomUniversity || signupUniversity === '__OTHER__') && !resolvedUniversity) {
      setSignupError('Please type the name of your university or higher institution.');
      setSignupLoading(false);
      return;
    }

    const fallbackAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(nameVal)}`;

    const newUser: UniNestUser = {
      email: emailVal,
      phone: phoneVal,
      password: passVal,
      role: isVendorSignup ? 'vendor' : 'student',
      verified: false,
      createdAt: new Date().toISOString().split('T')[0],
      name: nameVal,
      university: resolvedUniversity || 'Bayelsa Medical University (BMU, Yenagoa)',
      department: signupDepartment.trim() || 'General Studies',
      avatarUrl: signupPhotoUrl || fallbackAvatar,
      pictures: signupPhotoUrl ? [signupPhotoUrl] : [],
      isVerifiedVendor: isVendorSignup && vendorWhatsappConfirmed,
      vendorConfirmedViaWhatsapp: vendorWhatsappConfirmed,
      businessName: isVendorSignup ? (vendorBusinessName.trim() || nameVal) : undefined
    };

    setPendingSignupUser(newUser);

    // Send via EmailJS to user's email address
    await sendOtpEmail(emailVal, code, 'signup');
    setToastNotification({
      title: 'Verification OTP Sent',
      message: `A 6-digit verification PIN has been sent to your email (${emailVal}). Please check your inbox or spam folder.`
    });

    setSignupLoading(false);
    setShowOtpModal(true);
  };

  // ================= VERIFY OTP =================
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    setOtpLoading(true);

    if (otpTimer <= 0) {
      setOtpError('OTP has expired. Please click Resend Code.');
      setOtpLoading(false);
      return;
    }

    if (otpCode.trim() !== generatedOtp.trim()) {
      setOtpError('Invalid OTP code. Please enter the 6-digit code sent to you.');
      setOtpLoading(false);
      return;
    }

    // Success! Create account and trigger "Refer and Earn Forever" popup!
    if (pendingSignupUser) {
      const verifiedUser: UniNestUser = {
        ...pendingSignupUser,
        verified: true,
        walletBalance: 0,
        giftBalance: 0
      };

      onRegisterUser(verifiedUser);

      // On signup, insert into profiles table with welcome 500 bonus
      signUpWithSupabase(
        verifiedUser.email,
        verifiedUser.password || 'UniNest@123',
        { name: verifiedUser.name, phone: verifiedUser.phone }
      ).then(res => {
        insertSignupProfileToSupabase(verifiedUser, res.user?.id).catch(err => {
          console.error('Supabase profile insert error:', err);
        });
      }).catch(() => {
        insertSignupProfileToSupabase(verifiedUser).catch(err => {
          console.error('Supabase profile insert fallback error:', err);
        });
      });

      setShowOtpModal(false);
      setOtpLoading(false);

      // "when sombody sign up pop this out refer and earn forever."
      setReferralSignupUser(verifiedUser);
      setShowReferAndEarnModal(true);
    }
  };

  // Google Authentication via Supabase OAuth
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setLoginError(null);
    setSignupError(null);
    try {
      const { data, error } = await signInWithGoogleSupabase();
      if (error) {
        throw error;
      }
      setToastNotification({
        title: 'Connecting to Google',
        message: 'Redirecting to Google Authentication with Supabase...'
      });
    } catch (err: any) {
      setLoginError(err?.message || 'Google Sign-In was unable to complete. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Resend Sign-Up OTP
  const handleResendSignupOtp = async () => {
    if (!pendingSignupUser) return;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpTimer(300);
    setOtpError(null);
    await sendOtpEmail(pendingSignupUser.email || pendingSignupUser.phone, code, 'signup');
    setToastNotification({
      title: 'New OTP Sent to Email',
      message: `A fresh 6-digit verification PIN has been sent to your email (${pendingSignupUser.email}).`
    });
  };

  // ================= FORGOT PASSWORD STEPS =================
  const handleForgotStep1SendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotFeedback('Sending verification PIN to your email...');
    setForgotLoading(true);

    const val = forgotIdentifier.trim().toLowerCase();
    if (!val) {
      setForgotError('Please enter your registered email or phone number.');
      setForgotLoading(false);
      setForgotFeedback(null);
      return;
    }

    // Check user exists (support email, phone, or 'admin')
    const activeAdmin = users.find(u => u.role === 'admin' || u.email.toLowerCase() === 'admin@uninest.com' || u.email.toLowerCase() === 'amaechihellis@gmail.com') || DEFAULT_ADMIN;
    let user = users.find(u => 
      u.email.toLowerCase() === val || 
      u.phone.replace(/[^0-9]/g, '') === val.replace(/[^0-9]/g, '') ||
      ((val === 'admin' || val === 'admin@uninest.com' || val === 'amaechihellis@gmail.com') && (u.role === 'admin' || u.email.toLowerCase() === 'admin@uninest.com' || u.email.toLowerCase() === 'amaechihellis@gmail.com'))
    ) || ((val === 'admin' || val === 'admin@uninest.com' || val === 'amaechihellis@gmail.com') ? activeAdmin : null);

    if (!user && val.includes('@')) {
      try {
        const sbUsers = await fetchProfilesFromSupabase();
        user = sbUsers.find(u => u.email.toLowerCase() === val) || null;
      } catch (err) {
        console.warn('Supabase fetch notice:', err);
      }
    }

    const targetEmail = user ? user.email : (val.includes('@') && val.includes('.') ? val : null);

    if (!targetEmail) {
      setForgotError('No account found with this phone number. Please enter your email address to receive the reset PIN.');
      setForgotLoading(false);
      setForgotFeedback(null);
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setForgotGenOtp(code);
    setForgotTimer(300);
    localStorage.setItem(`uninest_otp_${targetEmail}`, JSON.stringify({ otp: code, expiry: Date.now() + 300000 }));

    // Send via EmailJS & Supabase Auth reset
    await sendOtpEmail(targetEmail, code, 'forgot_password');
    sendSupabasePasswordReset(targetEmail).catch(() => {});

    setToastNotification({
      title: 'Password Reset PIN Sent',
      message: `A 6-digit password reset PIN has been sent to your email (${targetEmail}). Please check your inbox and spam folder.`
    });

    setForgotLoading(false);
    setForgotFeedback(null);
    setForgotStep(2);
  };

  const handleResendForgotOtp = async () => {
    const val = forgotIdentifier.trim().toLowerCase();
    const user = users.find(u => 
      u.email.toLowerCase() === val || 
      u.phone.replace(/[^0-9]/g, '') === val.replace(/[^0-9]/g, '')
    );
    const targetEmail = user ? user.email : (val.includes('@') ? val : null);
    if (!targetEmail) return;

    setForgotLoading(true);
    setForgotFeedback('Resending 6-digit PIN to email...');
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setForgotGenOtp(code);
    setForgotTimer(300);
    setForgotError(null);
    localStorage.setItem(`uninest_otp_${targetEmail}`, JSON.stringify({ otp: code, expiry: Date.now() + 300000 }));

    await sendOtpEmail(targetEmail, code, 'forgot_password');
    sendSupabasePasswordReset(targetEmail).catch(() => {});

    setForgotLoading(false);
    setForgotFeedback(null);
    setToastNotification({
      title: 'New Reset PIN Dispatched',
      message: `A fresh 6-digit PIN has been sent to ${targetEmail}. Please check your inbox and spam folder.`
    });
  };

  const handleForgotStep2VerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (forgotTimer <= 0) {
      setForgotError('OTP PIN has expired. Please tap Resend to get a new code.');
      return;
    }

    if (forgotOtp.trim() !== forgotGenOtp.trim()) {
      setForgotError('Incorrect 6-digit PIN code. Please check your email and re-enter.');
      return;
    }

    setForgotStep(3);
  };

  const handleForgotStep3ResetPass = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (newPassword.length < 6) {
      setForgotError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match. Please verify.');
      return;
    }

    const val = forgotIdentifier.trim().toLowerCase();
    const user = users.find(u => 
      u.email.toLowerCase() === val || 
      u.phone.replace(/[^0-9]/g, '') === val.replace(/[^0-9]/g, '')
    );
    const targetEmail = user ? user.email : (val.includes('@') ? val : null);

    if (user) {
      onUpdateUserPassword(user.email, newPassword);
    } else if (targetEmail) {
      const newUser: UniNestUser = {
        id: `student-${Date.now()}`,
        email: targetEmail,
        phone: targetEmail.split('@')[0],
        password: newPassword,
        name: targetEmail.split('@')[0],
        role: 'student',
        verified: true,
        createdAt: new Date().toISOString(),
        university: 'Nigerian University'
      };
      onRegisterUser(newUser);
      insertSignupProfileToSupabase(newUser).catch(() => {});
    }

    setShowForgotModal(false);
    setForgotStep(1);
    setForgotIdentifier('');
    setNewPassword('');
    setConfirmPassword('');
    setToastNotification({
      title: 'Password Reset Complete!',
      message: 'Your password was updated. Please log in with your new credentials.'
    });
    setActiveTab('login');
  };

  // ================= STS ACCOUNT CREATION (1/1 LIMIT ENFORCED) =================
  const handleOpenSTSModal = () => {
    setShowSTSModal(true);
    setStsSuccessMsg(null);
  };

  const handleCreateSTSSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stsFullName.trim() || !stsPhone.trim()) return;

    // Generate STS
    const newSTS: STSAccount = {
      id: `sts-${Date.now()}`,
      userEmail: identifier.includes('@') ? identifier.trim() : 'student@campus.edu',
      name: stsFullName.trim(),
      phone: stsPhone.trim(),
      school: stsSchool,
      department: stsDept,
      duration: stsDuration,
      roomType: stsRoomType,
      budget: stsBudget,
      location: stsLocation,
      status: 'active',
      lodgeName: `${stsSchool.split(' ')[0]} Golden Campus Lodge #2`,
      createdAt: new Date().toISOString().split('T')[0],
      pictures: [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500&auto=format&fit=crop&q=80'
      ]
    };

    onCreateSTS(newSTS);
    setStsSuccessMsg('Your 1/1 STS Account has been successfully established!');
    localStorage.setItem('uninest_pictures_uploaded_' + newSTS.userEmail, 'true');
  };

  // ================= PICTURE UPLOAD MODAL (FIX LOOP BUG) =================
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const urls: string[] = [];
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          urls.push(evt.target.result as string);
          if (urls.length === files.length) {
            setSelectedImages(prev => [...prev, ...urls]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFinishUpload = (skip = false) => {
    if (uploadUser) {
      // Set flag to prevent any future upload looping!
      localStorage.setItem('uninest_pictures_uploaded_' + uploadUser.email, 'true');
      setShowUploadModal(false);
      onLoginSuccess(uploadUser);
    }
  };

  // ================= NEWSLETTER SUBSCRIPTION =================
  const handleSubscribeNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    const emailTrim = newsletterEmail.trim().toLowerCase();
    if (!emailTrim || !emailTrim.includes('@')) return;

    setNewsletterLoading(true);
    onSubscribeNewsletter(emailTrim);
    setNewsletterLoading(false);
    setNewsletterSuccess("Subscribed! You'll receive scholarship, strike & school news");
    setNewsletterEmail('');
    setTimeout(() => setNewsletterSuccess(null), 6000);
  };

  // Check if current user in input already has STS
  const userHasSTS = stsAccounts.some(acc => 
    acc.userEmail.toLowerCase() === identifier.trim().toLowerCase() || 
    acc.userEmail === 'student@campus.edu'
  );

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-between p-3 sm:p-6 font-sans relative antialiased selection:bg-orange-500 selection:text-white overflow-x-hidden">
      
      {/* ================= NIGERIAN UNIVERSITIES VIDEO BACKGROUND (STRICTLY NIGERIAN CAMPUSES) ================= */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {(() => {
          const defaultPoster = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&auto=format&fit=crop&q=80';
          const currentVideo = NIGERIAN_CAMPUS_VIDEOS[currentVideoIndex] || NIGERIAN_CAMPUS_VIDEOS[0] || {
            id: 'default-campus',
            university: 'Niger Delta University',
            videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-large-university-campus-with-lush-greenery-42878-large.mp4',
            posterUrl: defaultPoster
          };
          const videoPoster = currentVideo.posterUrl || defaultPoster;
          const photoUrl = NIGERIAN_CAMPUS_PHOTOS[currentPhotoIndex]?.imageUrl || videoPoster;
          return (
            <div className="absolute inset-0 w-full h-full">
              {isVideoMode && currentVideo.videoUrl ? (
                <video
                  ref={videoRef}
                  key={currentVideo.id}
                  autoPlay
                  loop
                  muted={isVideoMuted}
                  playsInline
                  poster={videoPoster}
                  className="w-full h-full object-cover transform duration-1000 scale-105 filter brightness-95"
                >
                  <source src={currentVideo.videoUrl} type="video/mp4" />
                  {/* Fallback image if video cannot be played */}
                  <img
                    src={videoPoster}
                    alt={`${currentVideo.university || 'Campus'} Campus`}
                    className="w-full h-full object-cover"
                  />
                </video>
              ) : (
                <img
                  src={photoUrl}
                  alt="Nigerian Campus"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          );
        })()}

        {/* Ambient Dark Gradient & Vignette Overlay for High Legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-900/65 to-slate-950/90 backdrop-blur-[1px] z-2" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-slate-950/40 to-slate-950/90 z-2" />
      </div>



      {/* On-Screen Toast / Verification alert for SMS/Email testing */}
      {toastNotification && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white border-2 border-orange-500/80 rounded-2xl p-4 shadow-2xl max-w-sm w-full animate-in fade-in duration-300">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">{toastNotification.title}</h4>
                <p className="text-[11px] text-slate-300 mt-0.5">{toastNotification.message}</p>
              </div>
            </div>
            <button 
              onClick={() => setToastNotification(null)}
              className="text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ================= 2. MAIN CENTERED CARD (EXACT UI SPEC) ================= */}
      <div className="my-auto w-full flex flex-col items-center relative z-10 py-4">
        <div 
          className={`w-full ${activeTab === 'signup' ? 'max-w-[450px]' : 'max-w-[400px]'} bg-white rounded-[36px] p-[24px] sm:p-[28px] shadow-2xl border border-slate-100 flex flex-col transition-all duration-300`}
          style={{
            boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.12), 0 8px 16px -6px rgba(15, 23, 42, 0.06)'
          }}
        >
          {/* LOGO & BRANDING */}
          <div className="flex flex-col items-center text-center mb-6">
            <UniNestLogo size="lg" />
            <p className="text-[14px] text-gray-500 font-medium mt-1">
              making Nigeria student comfortable
            </p>
          </div>

          {/* LOGIN / SIGN UP PILL TABS - High contrast visible text (NOT white) */}
          <div className="w-full bg-[#f1f5f9] p-1.5 rounded-[24px] grid grid-cols-2 gap-1.5 mb-5 border border-slate-200">
            <button
              type="button"
              id="tab-login"
              onClick={() => {
                setActiveTab('login');
                setLoginError(null);
                setSignupError(null);
              }}
              className={`py-2.5 text-[15px] font-black rounded-[20px] transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-500/40'
                  : 'text-slate-800 hover:text-slate-950 hover:bg-slate-200/60'
              }`}
            >
              <LogIn className="w-4 h-4 text-slate-950" />
              <span className="text-slate-950 font-black">Login</span>
            </button>

            <button
              type="button"
              id="tab-signup"
              onClick={() => {
                setActiveTab('signup');
                setLoginError(null);
                setSignupError(null);
              }}
              className={`py-2.5 text-[15px] font-black rounded-[20px] transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'signup'
                  ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-500/40'
                  : 'text-slate-800 hover:text-slate-950 hover:bg-slate-200/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span className="text-slate-950 font-black">Sign Up</span>
            </button>
          </div>

          {/* ================= TAB 1: LOGIN FORM ================= */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Login Error banner (VISIBLE IMMEDIATELY WITH #login-error) */}
              {loginError && (
                <div 
                  id="login-error"
                  className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-[13px] font-semibold flex items-center gap-2 animate-in fade-in duration-200"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* INPUT 1: Phone, Email or Username */}
              <div className="space-y-1">
                <input
                  type="text"
                  id="login-identifier"
                  required
                  placeholder="Email, Username, or Phone"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (loginError) setLoginError(null);
                  }}
                  className="w-full h-[48px] px-[14px] rounded-[16px] bg-[#f8fafc] border border-[#D1D5DB] text-[14px] text-slate-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:border-transparent transition"
                />
              </div>

              {/* INPUT 2: Password (min 6) */}
              <div className="space-y-1 relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  required
                  placeholder="Password (min 6)"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (loginError) setLoginError(null);
                  }}
                  className="w-full h-[48px] px-[14px] pr-11 rounded-[16px] bg-[#f8fafc] border border-[#D1D5DB] text-[14px] text-slate-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:border-transparent transition"
                />
                <button
                  type="button"
                  id="btn-toggle-login-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-slate-700 transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* REMEMBER ME + ONE RED/ORANGE FORGOT PASSWORD LINK */}
              <div className="flex items-center justify-between text-[13px] pt-1 select-none">
                <label className="flex items-center gap-2 cursor-pointer text-gray-600 font-medium">
                  <input
                    type="checkbox"
                    id="remember-me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#0f172a] focus:ring-[#0f172a]"
                  />
                  <span>Remember Me</span>
                </label>

                {/* EXACTLY ONE RED/ORANGE FORGOT PASSWORD LINK */}
                <button
                  type="button"
                  id="forgot-password-link"
                  onClick={() => {
                    setShowForgotModal(true);
                    setForgotStep(1);
                    setForgotIdentifier(identifier);
                    setForgotError(null);
                    setForgotFeedback('Reset your password via 6-digit OTP');
                  }}
                  className="text-[#f97316] hover:text-[#ea580c] font-semibold underline decoration-[#f97316]/50 transition"
                >
                  Forgot Password?
                </button>
              </div>

              {/* PRIMARY LOGIN BUTTON - High contrast visible text (NOT white) */}
              <button
                type="submit"
                id="login-button"
                disabled={loginLoading}
                className="w-full h-[50px] rounded-[16px] bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 active:scale-[0.99] text-slate-950 font-black text-[16px] shadow-lg border border-amber-500/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-5 h-5 text-slate-950" />
                <span className="text-slate-950 font-black tracking-wide">
                  {loginLoading ? 'Logging In...' : 'Log In to UniNest'}
                </span>
              </button>



              {/* OR DIVIDER */}
              <div className="relative my-2.5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2.5 text-slate-500 font-bold">Or continue with</span>
                </div>
              </div>

              {/* GOOGLE SIGN IN BUTTON (Firebase Authentication) */}
              <button
                type="button"
                id="google-signin-btn"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full h-[48px] rounded-[16px] bg-white border-2 border-slate-300 hover:bg-slate-50 hover:border-slate-400 active:scale-[0.99] text-slate-950 font-extrabold text-[15px] shadow-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="text-slate-950 font-black">{googleLoading ? 'Connecting Google...' : 'Sign In with Google'}</span>
              </button>
            </form>
          )}

          {/* ================= TAB 2: SIGN UP FORM ================= */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              {/* Signup Error banner */}
              {signupError && (
                <div 
                  id="signup-error"
                  className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-[13px] font-semibold flex items-center gap-2 animate-in fade-in duration-200"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{signupError}</span>
                </div>
              )}

              {/* 1. PHOTO / PASSPORT UPLOAD AREA */}
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 border border-dashed border-slate-300 hover:border-slate-400 transition-colors">
                <input 
                  type="file" 
                  ref={signupPhotoInputRef}
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  id="signup-photo-file-input"
                />

                <div className="flex items-center gap-3 w-full">
                  {/* Photo Avatar Preview */}
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-orange-500 shadow-sm bg-white flex items-center justify-center">
                      {signupPhotoUrl ? (
                        <img 
                          src={signupPhotoUrl} 
                          alt="Student Profile Preview" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-slate-400" />
                      )}
                    </div>
                    
                    <button
                      type="button"
                      id="btn-upload-photo"
                      onClick={() => signupPhotoInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-orange-600 transition shadow-sm"
                      title="Upload Student Photo"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Upload Controls & Description */}
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">Student Passport / Photo</span>
                      {signupPhotoUrl && (
                        <button
                          type="button"
                          onClick={() => setSignupPhotoUrl(null)}
                          className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {signupPhotoUrl ? 'Photo attached ✓' : 'Upload clear face photo / passport'}
                    </p>
                    <button
                      type="button"
                      onClick={() => signupPhotoInputRef.current?.click()}
                      className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] font-semibold hover:bg-slate-100 transition shadow-xs"
                    >
                      <Upload className="w-3 h-3 text-orange-500" />
                      <span>{signupPhotoUrl ? 'Change Photo' : 'Choose Image File'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. FULL NAME */}
              <div className="space-y-1">
                <input
                  type="text"
                  id="signup-name"
                  required
                  placeholder="Full Name (e.g. Tariere Douglas)"
                  value={signupName}
                  onChange={(e) => {
                    setSignupName(e.target.value);
                    if (signupError) setSignupError(null);
                  }}
                  className="w-full h-[46px] px-[14px] rounded-[16px] bg-[#f8fafc] border border-[#D1D5DB] text-[14px] text-slate-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:border-transparent transition"
                />
              </div>

              {/* 3. EMAIL ADDRESS */}
              <div className="space-y-1">
                <input
                  type="email"
                  id="signup-email"
                  required
                  placeholder="Email Address (e.g. tariere@example.com)"
                  value={signupEmail}
                  onChange={(e) => {
                    setSignupEmail(e.target.value);
                    if (signupError) setSignupError(null);
                  }}
                  className="w-full h-[46px] px-[14px] rounded-[16px] bg-[#f8fafc] border border-[#D1D5DB] text-[14px] text-slate-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:border-transparent transition"
                />
              </div>

              {/* 4. PHONE NUMBER */}
              <div className="space-y-1">
                <input
                  type="tel"
                  id="signup-phone"
                  required
                  placeholder="Phone Number (e.g. 08139045612)"
                  value={signupPhone}
                  onChange={(e) => {
                    setSignupPhone(e.target.value);
                    if (signupError) setSignupError(null);
                  }}
                  className="w-full h-[46px] px-[14px] rounded-[16px] bg-[#f8fafc] border border-[#D1D5DB] text-[14px] text-slate-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:border-transparent transition"
                />
              </div>

              {/* 5. INSTITUTION / UNIVERSITY DROPDOWN & CUSTOM TYPING */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-700 ml-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>University / Institution:</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const nextState = !isCustomUniversity;
                      setIsCustomUniversity(nextState);
                      if (nextState) {
                        setSignupUniversity('__OTHER__');
                      } else {
                        setSignupUniversity(NIGERIAN_UNIVERSITIES[0] || 'Bayelsa Medical University (BMU, Yenagoa)');
                      }
                    }}
                    className="text-[11px] font-bold text-amber-600 hover:text-amber-700 hover:underline cursor-pointer"
                  >
                    {isCustomUniversity || signupUniversity === '__OTHER__' ? '← Choose from list' : "Can't find yours? Type here"}
                  </button>
                </div>

                {!isCustomUniversity && signupUniversity !== '__OTHER__' ? (
                  <select
                    id="signup-university"
                    value={signupUniversity}
                    onChange={(e) => {
                      if (e.target.value === '__OTHER__') {
                        setIsCustomUniversity(true);
                        setSignupUniversity('__OTHER__');
                      } else {
                        setSignupUniversity(e.target.value);
                      }
                    }}
                    className="w-full h-[46px] px-[12px] rounded-[16px] bg-[#f8fafc] border border-[#D1D5DB] text-[13px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:border-transparent transition"
                  >
                    {NIGERIAN_UNIVERSITIES.map((uni, idx) => (
                      <option key={`signup-uni-${idx}`} value={uni}>
                        {uni}
                      </option>
                    ))}
                    <option value="__OTHER__">✍️ Not listed? Type your university / institution...</option>
                  </select>
                ) : (
                  <div className="space-y-1">
                    <input
                      type="text"
                      id="signup-custom-university"
                      required
                      placeholder="Type your university / institution name (e.g. Abia State University)"
                      value={customUniversity}
                      onChange={(e) => {
                        setCustomUniversity(e.target.value);
                        if (signupError) setSignupError(null);
                      }}
                      className="w-full h-[46px] px-[14px] rounded-[16px] bg-[#f8fafc] border-2 border-amber-500/60 text-[14px] text-slate-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition font-medium"
                    />
                    <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
                      <span>Enter your campus full name or acronym</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomUniversity(false);
                          setSignupUniversity(NIGERIAN_UNIVERSITIES[0] || 'Bayelsa Medical University (BMU, Yenagoa)');
                        }}
                        className="font-bold text-sky-600 hover:text-sky-800 cursor-pointer"
                      >
                        Select from dropdown
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 6. DEPARTMENT / COURSE */}
              <div className="space-y-1">
                <input
                  type="text"
                  id="signup-department"
                  placeholder="Department / Course (e.g. Medicine & Surgery)"
                  value={signupDepartment}
                  onChange={(e) => setSignupDepartment(e.target.value)}
                  className="w-full h-[46px] px-[14px] rounded-[16px] bg-[#f8fafc] border border-[#D1D5DB] text-[14px] text-slate-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:border-transparent transition"
                />
              </div>

              {/* 7. PASSWORD (min 6) */}
              <div className="space-y-1 relative">
                <input
                  type={showSignupPassword ? 'text' : 'password'}
                  id="signup-password"
                  required
                  placeholder="Password (min 6 characters)"
                  value={signupPassword}
                  onChange={(e) => {
                    setSignupPassword(e.target.value);
                    if (signupError) setSignupError(null);
                  }}
                  className="w-full h-[46px] px-[14px] pr-11 rounded-[16px] bg-[#f8fafc] border border-[#D1D5DB] text-[14px] text-slate-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:border-transparent transition"
                />
                <button
                  type="button"
                  id="btn-toggle-signup-password"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  aria-label={showSignupPassword ? "Hide password" : "Show password"}
                  title={showSignupPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-slate-700 transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showSignupPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* 8. CONFIRM PASSWORD */}
              <div className="space-y-1 relative">
                <input
                  type={showSignupConfirmPassword ? 'text' : 'password'}
                  id="signup-confirm-password"
                  required
                  placeholder="Confirm Password"
                  value={signupConfirmPassword}
                  onChange={(e) => {
                    setSignupConfirmPassword(e.target.value);
                    if (signupError) setSignupError(null);
                  }}
                  className={`w-full h-[46px] px-[14px] pr-11 rounded-[16px] bg-[#f8fafc] border text-[14px] text-slate-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:border-transparent transition ${
                    signupConfirmPassword && signupPassword === signupConfirmPassword 
                      ? 'border-emerald-400 bg-emerald-50/30' 
                      : signupConfirmPassword && signupPassword !== signupConfirmPassword
                      ? 'border-rose-300 bg-rose-50/30'
                      : 'border-[#D1D5DB]'
                  }`}
                />
                <button
                  type="button"
                  id="btn-toggle-signup-confirm-password"
                  onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                  aria-label={showSignupConfirmPassword ? "Hide password" : "Show password"}
                  title={showSignupConfirmPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-slate-700 transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showSignupConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Realtime Password Match Helper */}
              {signupConfirmPassword && (
                <div className="flex items-center gap-1.5 px-1 text-xs">
                  {signupPassword === signupConfirmPassword ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Passwords match
                    </span>
                  ) : (
                    <span className="text-rose-500 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> Passwords do not match
                    </span>
                  )}
                </div>
              )}

              {/* VERIFIED VENDOR SIGNUP OPTION */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2.5">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="chk-vendor-signup"
                    checked={isVendorSignup}
                    onChange={(e) => setIsVendorSignup(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                      <span>Register as a Verified Campus Vendor / Merchant</span>
                    </span>
                    <p className="text-[11px] text-slate-600 leading-snug mt-0.5">
                      Get the official <strong>Verified Vendor Ticker</strong> &amp; badge displayed on campus marquee.
                    </p>
                  </div>
                </label>

                {isVendorSignup && (
                  <div className="space-y-2 pt-1.5 border-t border-amber-200 animate-in fade-in">
                    <input
                      type="text"
                      placeholder="Business / Trade Name (e.g. Preye Campus Electronics)"
                      value={vendorBusinessName}
                      onChange={(e) => setVendorBusinessName(e.target.value)}
                      className="w-full h-[40px] px-3 rounded-xl bg-white border border-amber-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />

                    <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200 text-[11px] text-amber-900 space-y-1.5">
                      <p className="font-semibold text-slate-800">
                        🏷️ <strong>Verified Vendor Ticker Requirement:</strong> Confirmed when you verify via WhatsApp number (+234 903 984 7154).
                      </p>
                      <button
                        type="button"
                        id="btn-confirm-vendor-whatsapp"
                        onClick={() => {
                          const biz = vendorBusinessName.trim() || signupName || 'Campus Vendor';
                          const msg = `Hello UniNest! I am signing up as a verified vendor for "${biz}" (Phone: ${signupPhone || '08000000000'}). Please confirm my Verified Vendor Ticker & Badge.`;
                          window.open(`https://wa.me/2349039847154?text=${encodeURIComponent(msg)}`, '_blank');
                          setVendorWhatsappConfirmed(true);
                        }}
                        className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${
                          vendorWhatsappConfirmed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{vendorWhatsappConfirmed ? '✓ WhatsApp Confirmed (Verified Vendor Ticker Active)' : 'Confirm via WhatsApp (+234 903 984 7154)'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* OTP Notice */}
              <p className="text-[12px] text-gray-500 text-center pt-1">
                A 6-digit OTP verification code will be sent to confirm your student profile.
              </p>

              {/* PRIMARY SIGN UP BUTTON - High contrast visible text (NOT white) */}
              <button
                type="submit"
                id="signup-button"
                disabled={signupLoading}
                className="w-full h-[50px] rounded-[16px] bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 active:scale-[0.99] text-slate-950 font-black text-[16px] shadow-lg border border-amber-500/50 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Sparkles className="w-5 h-5 text-slate-950" />
                <span className="text-slate-950 font-black tracking-wide">
                  {signupLoading ? 'Sending Verification OTP...' : 'Sign Up & Create Account'}
                </span>
              </button>

              {/* OR DIVIDER */}
              <div className="relative my-2.5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2.5 text-slate-500 font-bold">Or quick sign up</span>
                </div>
              </div>

              {/* GOOGLE QUICK SIGN UP BUTTON */}
              <button
                type="button"
                id="google-signup-btn"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full h-[48px] rounded-[16px] bg-white border-2 border-slate-300 hover:bg-slate-50 hover:border-slate-400 active:scale-[0.99] text-slate-950 font-extrabold text-[15px] shadow-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="text-slate-950 font-black">{googleLoading ? 'Connecting Google...' : 'Sign In with Google'}</span>
              </button>
            </form>
          )}

          {/* CONTINUE AS GUEST LINK */}
          <div className="mt-4 text-center">
            <button
              type="button"
              id="continue-guest-btn"
              onClick={onContinueAsGuest}
              className="text-[14px] text-gray-500 hover:text-gray-800 font-medium transition cursor-pointer"
            >
              Continue as Guest
            </button>
          </div>

          {/* ================= 3. NEWSLETTER SECTION ================= */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="text-center mb-3">
              <h4 className="text-[14px] font-bold text-slate-900 flex items-center justify-center gap-1.5">
                <span>📚</span> Get Scholarship, Strike &amp; School News
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Daily alerts for Nigerian university &amp; polytechnic updates.
              </p>
            </div>

            {newsletterSuccess && (
              <div className="mb-2 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[12px] font-semibold text-center">
                {newsletterSuccess}
              </div>
            )}

            <form onSubmit={handleSubscribeNewsletter} className="flex gap-2">
              <input
                type="email"
                id="newsletter-email-input"
                required
                placeholder="Enter email for alerts"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 h-[40px] px-3 rounded-xl bg-[#f8fafc] border border-gray-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0f172a]"
              />
              <button
                type="submit"
                id="newsletter-subscribe-btn"
                disabled={newsletterLoading}
                className="h-[40px] px-3.5 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold transition shrink-0"
              >
                {newsletterLoading ? 'Saving...' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>

        {/* ================= 4. CAMPUS PHOTO SPOTLIGHT DOCK ================= */}
        <div className="mt-4 flex flex-col items-center gap-2 max-w-lg w-full">
          {(() => {
            const dockCampus = NIGERIAN_CAMPUS_PHOTOS[currentPhotoIndex] || NIGERIAN_CAMPUS_PHOTOS[0] || {
              university: 'Nigerian University',
              location: 'Campus',
              caption: 'Campus Gate & Community'
            };
            return (
              <div className="bg-slate-950/85 border border-slate-700/70 backdrop-blur-md rounded-2xl px-4 py-2.5 shadow-2xl flex items-center justify-between gap-3 text-xs text-white w-full">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/40">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="font-bold text-[12px] text-white truncate">
                      {dockCampus?.university || 'Nigerian University'}
                    </p>
                    <p className="text-[10px] text-slate-300 truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-orange-400 shrink-0" />
                      {dockCampus?.caption || 'Campus Life'} ({dockCampus?.location || 'Nigeria'})
                    </p>
                  </div>
                </div>

                {/* Indicator Dots */}
                <div className="flex items-center gap-1 shrink-0">
                  {NIGERIAN_CAMPUS_PHOTOS.map((_, dotIdx) => (
                    <button
                      key={`campus-dot-${dotIdx}`}
                      type="button"
                      onClick={() => setCurrentPhotoIndex(dotIdx)}
                      aria-label={`Jump to photo ${dotIdx + 1}`}
                      className={`transition-all duration-300 rounded-full ${
                        dotIdx === currentPhotoIndex 
                          ? 'w-4 h-1.5 bg-amber-400' 
                          : 'w-1.5 h-1.5 bg-slate-600 hover:bg-slate-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* ================= OTP VERIFICATION MODAL ================= */}
      {showOtpModal && (
        <div 
          id="otp-modal"
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-[32px] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Verify Your Identity</h3>
              <p className="text-xs text-gray-500">
                Enter the 6-digit OTP sent to <strong className="text-slate-900 font-mono">{pendingSignupUser?.email}</strong>
              </p>
            </div>

            {/* Email Dispatch Notice */}
            <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-950">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="font-bold text-slate-900 text-xs">Verification PIN Sent to Email</p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  A 6-digit verification code has been dispatched to <strong className="text-slate-900">{pendingSignupUser?.email}</strong>. Please check your inbox and spam folder.
                </p>
              </div>
            </div>

            {otpError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold text-center">
                {otpError}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="• • • • • •"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full h-14 text-center tracking-[12px] font-mono text-2xl font-extrabold rounded-2xl bg-slate-50 border-2 border-slate-300 text-slate-900 focus:border-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#0f172a]/20"
                />
              </div>

              {/* Countdown timer & Resend button */}
              <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                <span>Code expires in: <strong className="text-orange-600 font-mono">{formatTime(otpTimer)}</strong></span>
                <button
                  type="button"
                  id="btn-resend-otp"
                  onClick={handleResendSignupOtp}
                  className="text-[#0f172a] font-bold hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Resend Code
                </button>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="w-1/3 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-confirm-otp"
                  disabled={otpLoading}
                  className="w-2/3 h-11 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{otpLoading ? 'Verifying...' : 'Verify & Activate'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= 6. FORGOT PASSWORD MODAL (3 STEPS) ================= */}
      {showForgotModal && (
        <div 
          id="forgot-modal"
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          style={{ display: 'flex' }}
        >
          <div className="bg-white rounded-[32px] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Reset UniNest Password</h3>
                <p className="text-xs text-gray-500">
                  {forgotStep === 1 && 'Step 1: Enter your registered Phone or Email'}
                  {forgotStep === 2 && 'Step 2: Enter 6-digit OTP sent to your account'}
                  {forgotStep === 3 && 'Step 3: Create your new secure password'}
                </p>
              </div>
              <button 
                onClick={() => setShowForgotModal(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotFeedback && (
              <div id="forgot-feedback" className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 text-xs font-medium">
                {forgotFeedback}
              </div>
            )}

            {forgotError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
                {forgotError}
              </div>
            )}

            {/* STEP 1: Input Email/Phone */}
            {forgotStep === 1 && (
              <form onSubmit={handleForgotStep1SendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Phone or Email Address
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. student@campus.edu"
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f172a]"
                  />
                </div>
                <button
                  type="submit"
                  id="btn-send-forgot-otp"
                  disabled={forgotLoading}
                  className="w-full h-11 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{forgotLoading ? 'Sending OTP...' : 'Send Reset OTP'}</span>
                </button>
              </form>
            )}

            {/* STEP 2: Input OTP */}
            {forgotStep === 2 && (
              <form onSubmit={handleForgotStep2VerifyOtp} className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-slate-800 font-semibold">
                    <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>6-Digit PIN Dispatched</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    A 6-digit password reset PIN was sent to <strong className="text-slate-900">{forgotIdentifier.trim()}</strong>. Enter it below to proceed.
                  </p>
                  <p className="text-[10px] text-slate-500 italic">
                    Note: If you don't see it in your Inbox, please check your Spam or Junk folder.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Enter 6-Digit OTP Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="123456"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full h-12 text-center font-mono font-bold text-xl tracking-widest rounded-xl bg-slate-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0f172a]"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Expires in: <strong className="font-mono text-orange-600">{formatTime(forgotTimer)}</strong></span>
                  <button
                    type="button"
                    onClick={handleResendForgotOtp}
                    disabled={forgotLoading}
                    className="font-semibold text-orange-600 hover:text-orange-700 underline disabled:opacity-50"
                  >
                    {forgotLoading ? 'Sending...' : 'Resend PIN'}
                  </button>
                </div>
                <button
                  type="submit"
                  id="btn-verify-forgot-otp"
                  className="w-full h-11 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs shadow transition"
                >
                  Verify Code
                </button>
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep(1);
                      setForgotError(null);
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 underline"
                  >
                    Change email address
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: New Password */}
            {forgotStep === 3 && (
              <form onSubmit={handleForgotStep3ResetPass} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">New Password (min 6)</label>
                  <div className="relative">
                    <input
                      type={showForgotNewPass ? 'text' : 'password'}
                      required
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full h-11 px-3 pr-10 rounded-xl bg-slate-50 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f172a]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotNewPass(!showForgotNewPass)}
                      aria-label={showForgotNewPass ? "Hide password" : "Show password"}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-slate-700 transition-colors focus:outline-none"
                      tabIndex={-1}
                    >
                      {showForgotNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showForgotConfirmPass ? 'text' : 'password'}
                      required
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-11 px-3 pr-10 rounded-xl bg-slate-50 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f172a]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotConfirmPass(!showForgotConfirmPass)}
                      aria-label={showForgotConfirmPass ? "Hide password" : "Show password"}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-slate-700 transition-colors focus:outline-none"
                      tabIndex={-1}
                    >
                      {showForgotConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  id="btn-reset-password-final"
                  className="w-full h-11 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs shadow transition"
                >
                  Reset Password &amp; Login
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ================= 7. MY 1 STS MODAL ================= */}
      {showSTSModal && (
        <div 
          id="sts-modal"
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold text-[11px]">
                    STS Program
                  </span>
                  <span className="text-[11px] font-mono text-gray-500 font-bold">
                    LIMIT: 1 PER STUDENT
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  My 1 STS Account (Student Temporary Stay)
                </h3>
              </div>
              <button onClick={() => setShowSTSModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {stsSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                {stsSuccessMsg}
              </div>
            )}

            {userHasSTS ? (
              /* Already has 1 STS - Limit reached */
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Active STS Reservation</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold">
                      ● Active (1/1 Enforced)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-500">University:</span>
                      <p className="font-semibold text-slate-800">UNILAG (Akoka)</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Stay Type:</span>
                      <p className="font-semibold text-slate-800">3 Months SIWES / IT</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Lodge:</span>
                      <p className="font-semibold text-slate-800">Royal Palm Haven (#4)</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Verification ID:</span>
                      <p className="font-mono font-bold text-orange-600">STS-NG-8841</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span><strong>Limit reached:</strong> You already have 1/1 active STS Account registered on UniNest.</span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSTSModal(false)}
                  className="w-full h-11 rounded-xl bg-[#0f172a] text-white font-bold text-xs"
                >
                  Close STS Viewer
                </button>
              </div>
            ) : (
              /* Create new 1/1 STS Account */
              <form onSubmit={handleCreateSTSSubmit} className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-950 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[11px] text-amber-900">
                    <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[9px] uppercase">Notice</span>
                    <span>₦500 STS Account Opening Fee for First Timers</span>
                  </div>
                  <p className="text-[10.5px] text-amber-800 leading-snug">
                    STS is now active for all <strong>Bayelsa State Universities</strong> and <strong>Abia State University (ABSU)</strong> students. A one-time ₦500 activation fee registers your official sign-out savings vault and generates your dedicated STS gift wallet.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Student Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Babatunde Fashola"
                    value={stsFullName}
                    onChange={(e) => setStsFullName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-gray-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Nigerian University</label>
                    <select
                      value={stsSchool}
                      onChange={(e) => setStsSchool(e.target.value)}
                      className="w-full h-10 px-2 rounded-xl bg-slate-50 border border-gray-300 text-xs"
                    >
                      {NIGERIAN_UNIVERSITIES.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Department</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pharmacy / Law"
                      value={stsDept}
                      onChange={(e) => setStsDept(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-gray-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Stay Duration</label>
                    <select
                      value={stsDuration}
                      onChange={(e) => setStsDuration(e.target.value)}
                      className="w-full h-10 px-2 rounded-xl bg-slate-50 border border-gray-300"
                    >
                      <option value="1 Month Exam Stay">1 Month (Exam Stay)</option>
                      <option value="3 Months SIWES/IT">3 Months (SIWES / IT)</option>
                      <option value="1 Semester Extension">1 Semester Extension</option>
                      <option value="1 Year Academic Stay">1 Full Academic Session</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Room Preference</label>
                    <select
                      value={stsRoomType}
                      onChange={(e) => setStsRoomType(e.target.value)}
                      className="w-full h-10 px-2 rounded-xl bg-slate-50 border border-gray-300"
                    >
                      <option value="Self-Contain Apartment">Self-Contain Flat</option>
                      <option value="Single Room">Single Room</option>
                      <option value="Shared 2-in-1 Flat">Shared 2-in-1 Flat</option>
                      <option value="Hostel Bedspace">Hostel Bedspace</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Contact Phone (WhatsApp)</label>
                  <input
                    type="tel"
                    required
                    placeholder="080 1234 5678"
                    value={stsPhone}
                    onChange={(e) => setStsPhone(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-gray-300"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSTSModal(false)}
                    className="w-1/3 h-11 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 h-11 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold"
                  >
                    Create My 1 STS Account
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ================= 8. UPLOAD PICTURES MODAL (FIX LOOP BUG) ================= */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-1">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Upload Room / Student ID Photos</h3>
              <p className="text-xs text-gray-500">
                Applicable to all devices (gallery or camera). You can also skip for now.
              </p>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="p-6 rounded-2xl border-2 border-dashed border-gray-300 hover:border-orange-500 cursor-pointer text-center bg-slate-50 transition"
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <span className="text-xs font-bold text-slate-800 block">Click to select photos from gallery</span>
              <span className="text-[11px] text-gray-500">Supports JPG, PNG (Under 5MB)</span>
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </div>

            {selectedImages.filter(Boolean).length > 0 && (
              <div className="flex gap-2 overflow-x-auto py-2">
                {selectedImages.filter(Boolean).map((src, idx) => (
                  <img key={idx} src={src || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} alt="Uploaded" className="w-16 h-16 rounded-xl object-cover border" />
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                id="btn-skip-upload"
                onClick={() => handleFinishUpload(true)}
                className="w-1/2 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
              >
                Skip for now
              </button>
              <button
                type="button"
                id="btn-save-upload"
                onClick={() => handleFinishUpload(false)}
                className="w-1/2 h-11 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs shadow"
              >
                Save &amp; Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= REFER AND EARN FOREVER MODAL ================= */}
      {showReferAndEarnModal && (
        <div
          id="refer-and-earn-forever-modal"
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto"
        >
          <div className="bg-white rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 my-6 text-slate-900 animate-in zoom-in-95 duration-200">
            {/* Header Badge & Title */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Lifetime Campus Affiliate Program</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                Refer and Earn Forever! 🚀
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                Welcome to UniNest! As a verified student, you can earn passive income every single semester. Whenever your friends rent a hostel, trade items, or save, you get paid!
              </p>
            </div>

            {/* 3 Value Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-center space-y-1">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center mx-auto">
                  ₦500
                </div>
                <div className="text-xs font-extrabold text-slate-900">Instant Cash</div>
                <div className="text-[10px] text-slate-600 leading-tight">Per student friend who activates STS savings</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-center space-y-1">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white font-black text-xs flex items-center justify-center mx-auto">
                  2%
                </div>
                <div className="text-xs font-extrabold text-slate-900">Perpetual Cut</div>
                <div className="text-[10px] text-slate-600 leading-tight">Lifetime commissions on all hostel &amp; market deals</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200/80 text-center space-y-1">
                <div className="w-8 h-8 rounded-xl bg-blue-500 text-white font-black text-xs flex items-center justify-center mx-auto">
                  🎁
                </div>
                <div className="text-xs font-extrabold text-slate-900">Free Gifts</div>
                <div className="text-[10px] text-slate-600 leading-tight">Special UniNest merch &amp; graduation tokens</div>
              </div>
            </div>

            {/* Referral Code & Link Box */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Your Unique Referral Code</span>
                <div className="flex items-center justify-between bg-slate-800 p-2.5 rounded-xl border border-slate-700 mt-1">
                  <span className="font-mono font-black text-base text-white tracking-widest">
                    {`UNINEST-${(referralSignupUser?.name || 'STUDENT').replace(/[^a-zA-Z]/g, '').slice(0, 5).toUpperCase()}-${(referralSignupUser?.id || '88').slice(-3).toUpperCase()}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const code = `UNINEST-${(referralSignupUser?.name || 'STUDENT').replace(/[^a-zA-Z]/g, '').slice(0, 5).toUpperCase()}-${(referralSignupUser?.id || '88').slice(-3).toUpperCase()}`;
                      navigator.clipboard.writeText(code);
                      setCopiedReferralCode(true);
                      setTimeout(() => setCopiedReferralCode(false), 2500);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1 transition"
                  >
                    {copiedReferralCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedReferralCode ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Your Fast Signup Link</span>
                <div className="flex items-center justify-between bg-slate-800 p-2.5 rounded-xl border border-slate-700 mt-1">
                  <span className="font-mono text-xs text-slate-300 truncate mr-2">
                    {`https://uninest.ng/signup?ref=UNINEST-${(referralSignupUser?.name || 'STUDENT').replace(/[^a-zA-Z]/g, '').slice(0, 5).toUpperCase()}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const link = `https://uninest.ng/signup?ref=UNINEST-${(referralSignupUser?.name || 'STUDENT').replace(/[^a-zA-Z]/g, '').slice(0, 5).toUpperCase()}`;
                      navigator.clipboard.writeText(link);
                      setCopiedReferralLink(true);
                      setTimeout(() => setCopiedReferralLink(false), 2500);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1 transition shrink-0"
                  >
                    {copiedReferralLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedReferralLink ? 'Copied' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Share and Continue Buttons */}
            <div className="space-y-2.5">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Hey! Join me on UniNest to rent campus hostels, trade student items with escrow, and save for sign-out clearance with free gifts. Use my referral code UNINEST-${(referralSignupUser?.name || 'STUDENT').replace(/[^a-zA-Z]/g, '').slice(0, 5).toUpperCase()}: https://uninest.ng/signup`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Phone className="w-4 h-4" />
                <span>Share Referral Invite on WhatsApp</span>
              </a>

              <button
                type="button"
                id="btn-claim-referral-proceed"
                onClick={() => {
                  setShowReferAndEarnModal(false);
                  if (referralSignupUser) {
                    proceedPostLogin(referralSignupUser);
                  }
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <span>Claim Referral Code &amp; Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
