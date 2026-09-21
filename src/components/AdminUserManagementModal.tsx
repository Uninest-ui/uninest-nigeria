import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  Building2, 
  ShieldCheck, 
  Key, 
  Lock, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Sparkles, 
  Save, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  UserCheck, 
  ShieldAlert, 
  Store,
  Upload,
  Camera,
  Trash2,
  Link2,
  FolderUp,
  Image as ImageIcon
} from 'lucide-react';
import { UniNestUser, UserRole } from '../types';
import { NIGERIAN_UNIVERSITIES } from '../data/uninestData';

interface AdminUserManagementModalProps {
  user: UniNestUser;
  isOpen: boolean;
  initialMode?: 'profile' | 'password';
  onClose: () => void;
  onUpdateUser: (updatedUser: UniNestUser, originalEmail?: string) => void;
  onResetPassword: (email: string, newPass: string) => void;
  onAddLog: (action: string, details?: string) => void;
}

export const AdminUserManagementModal: React.FC<AdminUserManagementModalProps> = ({
  user,
  isOpen,
  initialMode = 'profile',
  onClose,
  onUpdateUser,
  onResetPassword,
  onAddLog,
}) => {
  if (!isOpen || !user) return null;

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>(initialMode);

  // Profile Form State
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [role, setRole] = useState<UserRole>(user.role || 'student');
  const [university, setUniversity] = useState(user.university || 'Federal University Otuoke (FUO, Bayelsa)');
  const [department, setDepartment] = useState(user.department || '');
  const [verified, setVerified] = useState(user.verified ?? true);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [businessName, setBusinessName] = useState(user.businessName || '');
  const [isVerifiedVendor, setIsVerifiedVendor] = useState(user.isVerifiedVendor ?? false);

  // Sync state if user changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setRole(user.role || 'student');
      setUniversity(user.university || 'Federal University Otuoke (FUO, Bayelsa)');
      setDepartment(user.department || '');
      setVerified(user.verified ?? true);
      setAvatarUrl(user.avatarUrl || '');
      setBusinessName(user.businessName || '');
      setIsVerifiedVendor(user.isVerifiedVendor ?? false);
    }
  }, [user]);

  // Photo Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoUploadTab, setPhotoUploadTab] = useState<'device' | 'url' | 'presets'>('device');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processImageFile = (file: File) => {
    setErrorMessage(null);
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, JPEG, WEBP, or GIF).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage('Image file is too large (maximum 8MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setAvatarUrl(e.target.result as string);
        setUploadedFileName(file.name);
        setSuccessMessage(`Photo "${file.name}" loaded successfully from device.`);
        setTimeout(() => setSuccessMessage(null), 3500);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read image from device. Please try another image.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  // Password Reset State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  // Notification / Feedback State
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Random Strong Password Generator
  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
    let result = '';
    // ensure at least 1 uppercase, 1 lowercase, 1 number, 1 symbol
    result += 'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 24)];
    result += 'abcdefghijkmnopqrstuvwxyz'[Math.floor(Math.random() * 24)];
    result += '23456789'[Math.floor(Math.random() * 8)];
    result += '!@#$%&*'[Math.floor(Math.random() * 7)];
    for (let i = 0; i < 6; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    // Shuffle
    const shuffled = result.split('').sort(() => 0.5 - Math.random()).join('');
    setNewPassword(shuffled);
    setConfirmPassword(shuffled);
    setErrorMessage(null);
  };

  const handleCopyPassword = () => {
    if (!newPassword) return;
    navigator.clipboard.writeText(newPassword);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Full Name is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('A valid email address is required.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Phone number is required.');
      return;
    }

    setIsSaving(true);
    try {
      const updatedUser: UniNestUser = {
        ...user,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        role: role,
        university: university.trim(),
        department: department.trim(),
        verified: verified,
        avatarUrl: avatarUrl.trim() || user.avatarUrl,
        businessName: role === 'vendor' ? businessName.trim() : user.businessName,
        isVerifiedVendor: role === 'vendor' ? isVerifiedVendor : false,
      };

      const emailChanged = user.email.toLowerCase() !== updatedUser.email.toLowerCase();
      onUpdateUser(updatedUser, user.email);
      onAddLog(
        emailChanged ? 'Admin Changed Login Email' : 'Admin Updated User Profile',
        emailChanged
          ? `Admin changed login email for ${updatedUser.name || 'User'} from ${user.email} to ${updatedUser.email}. New email is now active for login.`
          : `Admin modified profile for ${updatedUser.name} (${updatedUser.email}). Role: ${updatedUser.role}, Phone: ${updatedUser.phone}`
      );

      setSuccessMessage(
        emailChanged
          ? `Login email changed to "${updatedUser.email}" successfully! New login ID is active.`
          : `Profile for "${updatedUser.name}" updated successfully!`
      );
      setTimeout(() => {
        setSuccessMessage(null);
        setIsSaving(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update user profile.');
      setIsSaving(false);
    }
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!newPassword) {
      setErrorMessage('Please enter a new password or generate one.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    setIsSaving(true);
    try {
      onResetPassword(user.email, newPassword);
      onAddLog(
        'Security Password Reset',
        `Admin changed password for user: ${user.name || 'User'} (${user.email}) for security compliance.`
      );

      setSuccessMessage(`Password for ${user.email} changed successfully!`);
      setTimeout(() => {
        setSuccessMessage(null);
        setIsSaving(false);
        setNewPassword('');
        setConfirmPassword('');
        onClose();
      }, 1800);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to reset password.');
      setIsSaving(false);
    }
  };

  const handleAvatarPreset = (presetUrl: string) => {
    setAvatarUrl(presetUrl);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      id="admin-user-mgmt-modal"
    >
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0A1931] border border-slate-700 flex items-center justify-center overflow-hidden">
              <img 
                src={avatarUrl || user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base leading-tight">
                  {user.name || 'User Management'}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  role === 'admin' 
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                    : role === 'vendor'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  {role}
                </span>
                {verified && (
                  <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-400">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono">{user.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 pb-2 bg-slate-900 border-b border-slate-800 flex gap-2">
          <button
            type="button"
            onClick={() => { setActiveTab('profile'); setErrorMessage(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Edit Profile Details</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('password'); setErrorMessage(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'password'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Change Password (Security)</span>
          </button>
        </div>

        {/* Status Alerts */}
        <div className="px-6 pt-3">
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-emerald-300 text-xs font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-300 text-xs font-bold animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'profile' ? (
            /* TAB 1: EDIT PROFILE FORM */
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    <span>Full Legal / Student Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tariere Ebimobowei"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-400" />
                    <span>Email Address (Login ID) *</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-400" />
                    <span>Nigerian Phone Number *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08012345678"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Account Role */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>System Role &amp; Permissions *</span>
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-blue-500"
                  >
                    <option value="student">Student Account</option>
                    <option value="vendor">Campus Vendor / Merchant</option>
                    <option value="admin">Platform Administrator</option>
                    <option value="guest">Guest / Viewer</option>
                  </select>
                </div>

                {/* University Institution */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                    <span>Tertiary Institution *</span>
                  </label>
                  <select
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-blue-500"
                  >
                    {NIGERIAN_UNIVERSITIES.map((uni) => (
                      <option key={uni} value={uni}>
                        {uni}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Department / Faculty */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Department / Field of Study</span>
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Computer Science, Medicine"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Verification Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Identity / 2FA Verification Status</span>
                  </label>
                  <div className="flex items-center gap-3 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="verified_status"
                        checked={verified === true}
                        onChange={() => setVerified(true)}
                        className="text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className="text-xs font-bold text-emerald-400">Verified ✓</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="verified_status"
                        checked={verified === false}
                        onChange={() => setVerified(false)}
                        className="text-slate-400 focus:ring-slate-500"
                      />
                      <span className="text-xs font-bold text-slate-400">Unverified / Pending</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Vendor Details (if vendor) */}
              {role === 'vendor' && (
                <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/40 space-y-3">
                  <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                    <Store className="w-4 h-4" />
                    <span>Vendor Merchant Configuration</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-purple-200 mb-1">
                        Business / Store Name
                      </label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Bayelsa Campus Provisions Hub"
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-purple-700/50 text-white text-xs font-bold"
                      />
                    </div>
                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isVerifiedVendor}
                          onChange={(e) => setIsVerifiedVendor(e.target.checked)}
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-xs font-bold text-purple-200">Verified Campus Vendor Badge</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Profile Picture / Avatar Management */}
              <div className="space-y-3 pt-2 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">Profile Picture / Avatar</span>
                  </div>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarUrl('');
                        setUploadedFileName(null);
                      }}
                      className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium transition cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove Photo</span>
                    </button>
                  )}
                </div>

                {/* Avatar Preview & Source Toggle */}
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                  <div 
                    className="relative group cursor-pointer shrink-0"
                    onClick={() => {
                      if (photoUploadTab === 'device') {
                        fileInputRef.current?.click();
                      }
                    }}
                    title="Click to choose photo from device"
                  >
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-amber-500/80 shadow-lg bg-slate-800 flex items-center justify-center">
                      <img
                        src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt="Profile preview"
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    </div>
                    <div className="absolute inset-0 bg-slate-950/50 rounded-2xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                      <Camera className="w-6 h-6 text-amber-400" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 font-bold text-[9px] shadow-sm uppercase">
                      PHOTO
                    </span>
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    {/* Method Selector Pills */}
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setPhotoUploadTab('device')}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          photoUploadTab === 'device'
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <FolderUp className="w-3.5 h-3.5" />
                        <span>Upload from Device</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPhotoUploadTab('url')}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          photoUploadTab === 'url'
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>Image URL</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPhotoUploadTab('presets')}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          photoUploadTab === 'presets'
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Presets</span>
                      </button>
                    </div>

                    {/* METHOD 1: DEVICE FILE UPLOAD (DRAG & DROP + BROWSE) */}
                    {photoUploadTab === 'device' && (
                      <div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className={`p-3.5 rounded-xl border-2 border-dashed transition cursor-pointer text-center flex flex-col items-center justify-center gap-1.5 ${
                            isDragging
                              ? 'border-amber-400 bg-amber-500/10'
                              : 'border-slate-700 hover:border-amber-500/60 bg-slate-900/80'
                          }`}
                        >
                          <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                            <Upload className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-200">
                              Click to choose photo from computer/phone
                            </p>
                            <p className="text-[10px] text-slate-400">
                              or drag and drop here (JPG, PNG, WEBP, GIF up to 8MB)
                            </p>
                          </div>
                          {uploadedFileName && (
                            <span className="mt-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Loaded: {uploadedFileName}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* METHOD 2: DIRECT IMAGE URL */}
                    {photoUploadTab === 'url' && (
                      <div className="space-y-1.5">
                        <input
                          type="url"
                          value={avatarUrl}
                          onChange={(e) => {
                            setAvatarUrl(e.target.value);
                            setUploadedFileName(null);
                          }}
                          placeholder="https://example.com/avatar.jpg"
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500 font-mono"
                        />
                        <p className="text-[10px] text-slate-400">
                          Paste any direct HTTPS image link (Unsplash, Cloudinary, AWS S3, etc.)
                        </p>
                      </div>
                    )}

                    {/* METHOD 3: QUICK CURATED PRESETS */}
                    {photoUploadTab === 'presets' && (
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        {[
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                          'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
                          'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
                          'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
                          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
                        ].map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              handleAvatarPreset(preset);
                              setUploadedFileName(null);
                            }}
                            className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition cursor-pointer ${
                              avatarUrl === preset ? 'border-amber-500 scale-110 shadow-md' : 'border-slate-700 opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={preset} alt="preset" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-600/20"
                >
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{isSaving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* TAB 2: SECURITY PASSWORD RESET */
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Administrative Security Password Reset</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  As UniNest Administrator, you can update or reset any student or vendor's password anytime for security emergencies, compromised accounts, or user assistance.
                </p>
                <div className="text-[11px] font-mono text-slate-400 pt-1">
                  Target Account: <strong className="text-amber-300">{user.email}</strong> ({user.name || 'User'})
                </div>
              </div>

              {/* Generator Button */}
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-300">
                  New Password *
                </label>
                <button
                  type="button"
                  onClick={generateStrongPassword}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Strong Password</span>
                </button>
              </div>

              {/* Password Input with show/hide */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new secure password (min 6 characters)"
                  className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono font-bold focus:outline-none focus:border-amber-500"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                
                <div className="absolute right-2.5 top-2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 rounded text-slate-400 hover:text-white transition cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>

                  {newPassword && (
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      className="p-1 rounded text-slate-400 hover:text-amber-400 transition cursor-pointer"
                      title="Copy password to clipboard"
                    >
                      {copiedPassword ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Confirm New Password *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password to confirm"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Quick Info */}
              {newPassword && (
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">Password preview:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-amber-300">
                      {showPassword ? newPassword : '••••••••••••'}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-[11px] font-bold text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedPassword ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedPassword ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                  <span>{isSaving ? 'Updating Password...' : 'Enforce New Password'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
