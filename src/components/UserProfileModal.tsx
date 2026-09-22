import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  Building2, 
  Camera, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  ShieldCheck, 
  PiggyBank, 
  Save, 
  Sparkles, 
  Calendar, 
  BookOpen, 
  Clock, 
  Lock,
  KeyRound,
  FileCheck,
  Copy,
  Check,
  Gift,
  LogOut
} from 'lucide-react';
import { UniNestUser, STSSavingsAccount } from '../types';
import { NIGERIAN_UNIVERSITIES } from '../data/uninestData';
import { getStudentSTSWalletNumber } from '../utils/walletUtils';

interface UserProfileModalProps {
  user: UniNestUser;
  stsSavingsAccount?: STSSavingsAccount;
  onUpdateUser: (updatedUser: UniNestUser, originalEmail?: string) => void;
  onLogout?: () => void;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  stsSavingsAccount,
  onUpdateUser,
  onLogout,
  onClose
}) => {
  const safeUser = user || {
    name: '',
    email: '',
    phone: '',
    university: 'Bayelsa Medical University (BMU, Yenagoa)',
    department: 'Medicine & Surgery',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  };

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'security' | 'sts_records'>('profile');
  
  // Profile Editable State
  const [name, setName] = useState(safeUser.name || '');
  const [email, setEmail] = useState(safeUser.email || '');
  const [phone, setPhone] = useState(safeUser.phone || '');
  const [university, setUniversity] = useState(safeUser.university || 'Bayelsa Medical University (BMU, Yenagoa)');
  const [department, setDepartment] = useState(safeUser.department || 'Medicine & Surgery');
  const [avatarUrl, setAvatarUrl] = useState<string>(
    safeUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(safeUser.name || safeUser.email || 'Student')}`
  );

  // Sync state if user prop changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setUniversity(user.university || 'Bayelsa Medical University (BMU, Yenagoa)');
      setDepartment(user.department || 'Medicine & Surgery');
      setAvatarUrl(user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || user.email || 'Student')}`);
    }
  }, [user]);
  
  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [securityMessage, setSecurityMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Status
  const [saveSuccess, setSaveSuccess] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // STS Wallet Number
  const stsWalletNumber = getStudentSTSWalletNumber(safeUser.email, safeUser.phone);
  const [copiedSTS, setCopiedSTS] = useState(false);

  const handleCopySTSWallet = () => {
    navigator.clipboard.writeText(stsWalletNumber);
    setCopiedSTS(true);
    setTimeout(() => setCopiedSTS(false), 2500);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert('Photo size is too large (max 5MB).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UniNestUser = {
      ...user,
      name: name.trim() || user.name,
      email: email.trim().toLowerCase() || user.email,
      phone: phone.trim() || user.phone,
      university: university || user.university,
      department: department.trim() || user.department,
      avatarUrl: avatarUrl || user.avatarUrl,
      pictures: avatarUrl ? [avatarUrl] : (user.pictures || [])
    };

    onUpdateUser(updated, user.email);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityMessage(null);

    if (currentPassword !== user.password && user.password) {
      setSecurityMessage({ text: 'Current password does not match.', type: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      setSecurityMessage({ text: 'New password must be at least 6 characters.', type: 'error' });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setSecurityMessage({ text: 'New passwords do not match.', type: 'error' });
      return;
    }

    const updated: UniNestUser = {
      ...user,
      password: newPassword
    };

    onUpdateUser(updated);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setSecurityMessage({ text: 'Password changed successfully!', type: 'success' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Student Badge */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            ✕
          </button>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <img
                src={avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || user.name || 'User')}`}
                alt={name || user.name || 'User'}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-orange-500 shadow-md bg-white"
              />
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-orange-500 text-slate-950 flex items-center justify-center hover:bg-orange-400 transition shadow-sm"
                title="Change Photo"
              >
                <Camera className="w-3.5 h-3.5 text-slate-950" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  {name || user.name || 'UniNest Student'}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Verified Profile
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 flex-wrap">
                <GraduationCap className="w-3.5 h-3.5 text-orange-400" />
                <span>{university}</span>
                <span className="text-slate-500">•</span>
                <span>{department}</span>
              </p>
            </div>
          </div>

          {/* Dedicated STS Wallet ID Bar for Gifts */}
          <div className="mt-4 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-amber-500/30 flex items-center justify-center shrink-0">
                <Gift className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
                  Student STS Gift Wallet Number
                </span>
                <span className="font-mono text-sm font-black text-white tracking-wide">
                  {stsWalletNumber}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopySTSWallet}
              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] flex items-center gap-1.5 transition cursor-pointer shrink-0 shadow-xs"
            >
              {copiedSTS ? <Check className="w-3.5 h-3.5 text-emerald-900" /> : <Copy className="w-3.5 h-3.5 text-slate-900" />}
              <span>{copiedSTS ? 'Copied!' : 'Copy Wallet ID'}</span>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setActiveSubTab('profile')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeSubTab === 'profile'
                  ? 'bg-orange-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('security')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeSubTab === 'security'
                  ? 'bg-orange-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Password &amp; Security</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('sts_records')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeSubTab === 'sts_records'
                  ? 'bg-orange-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <PiggyBank className="w-3.5 h-3.5" />
              <span>STS Membership</span>
            </button>
          </div>
        </div>

        {/* Hidden Photo File Input */}
        <input 
          type="file" 
          ref={photoInputRef}
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden" 
        />

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-left">
          
          {/* ================= TAB 1: EDIT PROFILE ================= */}
          {activeSubTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {saveSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Student profile updated and synchronized successfully!</span>
                </div>
              )}

              {/* Photo Banner Control */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || user.name || 'User')}`} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-slate-300" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Student ID &amp; Avatar Photo</p>
                    <p className="text-[11px] text-slate-500">Visible on Roommate requests and Marketplace</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition shadow-xs flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5 text-orange-500" />
                    <span>Upload New</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Full Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name (e.g. Tariere Douglas)"
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Phone Number (WhatsApp)</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number (e.g. 08139045612)"
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                {/* Email (Login ID) */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>Registered Login Email</span>
                    </span>
                    <span className="text-[10px] text-blue-600 font-semibold">Primary Login ID</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                  />
                </div>

                {/* University / Institution */}
                <div className="space-y-1 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>University / Institution</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (!NIGERIAN_UNIVERSITIES.includes(university)) {
                          setUniversity(NIGERIAN_UNIVERSITIES[0] || 'Bayelsa Medical University (BMU, Yenagoa)');
                        } else {
                          setUniversity('');
                        }
                      }}
                      className="text-[11px] font-bold text-amber-600 hover:text-amber-700 hover:underline cursor-pointer"
                    >
                      {NIGERIAN_UNIVERSITIES.includes(university) ? "Can't find yours? Type here" : "← Select from list"}
                    </button>
                  </div>
                  {NIGERIAN_UNIVERSITIES.includes(university) ? (
                    <select
                      value={university}
                      onChange={(e) => {
                        if (e.target.value === '__OTHER__') {
                          setUniversity('');
                        } else {
                          setUniversity(e.target.value);
                        }
                      }}
                      className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      {NIGERIAN_UNIVERSITIES.map((uni, idx) => (
                        <option key={`profile-uni-${idx}`} value={uni}>
                          {uni}
                        </option>
                      ))}
                      <option value="__OTHER__">✍️ Not listed? Type your university / institution...</option>
                    </select>
                  ) : (
                    <div className="space-y-1">
                      <input
                        type="text"
                        required
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        placeholder="Type your university / institution name (e.g. Abia State University)"
                        className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border-2 border-amber-500/60 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <p className="text-[10px] text-slate-500">
                        Type the official name or acronym of your higher institution.
                      </p>
                    </div>
                  )}
                </div>

                {/* Department */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    <span>Department / Course of Study</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Medicine & Surgery, Computer Science, Law"
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4 text-orange-400" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          )}

          {/* ================= TAB 2: SECURITY & PASSWORD ================= */}
          {activeSubTab === 'security' && (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              {securityMessage && (
                <div className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                  securityMessage.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{securityMessage.text}</span>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  <span>Keep Your Student Account Secure</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Your password protects your STS savings balance, escrow approvals, and roommate contacts. Choose a strong password.
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">New Password (min 6 characters)</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-orange-400" />
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          )}

          {/* ================= TAB 3: STS MEMBERSHIP DETAILS ================= */}
          {activeSubTab === 'sts_records' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-slate-950 font-bold flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-900">STS Gift Wallet Number</p>
                  <p className="text-lg font-extrabold text-slate-950 font-mono flex items-center gap-2">
                    <span>{stsWalletNumber}</span>
                    <button
                      type="button"
                      onClick={handleCopySTSWallet}
                      className="p-1 rounded-lg bg-black/10 hover:bg-black/20 text-slate-900 cursor-pointer"
                      title="Copy Wallet ID"
                    >
                      {copiedSTS ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wider text-slate-900">Saved Balance</p>
                  <p className="text-xl font-extrabold text-slate-950 font-mono">
                    ₦{(stsSavingsAccount?.currentBalance || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-slate-500 text-[11px]">Institution</p>
                  <p className="font-bold text-slate-900 truncate">{university}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-slate-500 text-[11px]">Target Goal</p>
                  <p className="font-bold text-slate-900 truncate">
                    {stsSavingsAccount?.targetGoalName || 'Sign-out & Clearance Fund'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-slate-500 text-[11px]">Target Amount</p>
                  <p className="font-bold text-slate-900">
                    ₦{(stsSavingsAccount?.targetAmount || 250000).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-slate-500 text-[11px]">Gifting Eligibility</p>
                  <p className="font-bold text-emerald-600">
                    Up to ₦{(stsSavingsAccount?.currentBalance || 0).toLocaleString()} (Instant)
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 text-center">
                Need to deposit or send a gift? Open the <strong>STS: Save Till Sign-Out</strong> tab on your dashboard.
              </p>
            </div>
          )}

          {/* Modal Footer with Logout Action */}
          {onLogout && (
            <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Finished your session?
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
              >
                <LogOut className="w-3.5 h-3.5 text-white" />
                <span>Log Out Account</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
