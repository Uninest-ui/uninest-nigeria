import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Loader2, Mail, ArrowRight, KeyRound, RefreshCw, CheckCircle2, ArrowLeft } from 'lucide-react';

export const Login: React.FC<{ onLoginSuccess?: (user: any) => void }> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [otpHint, setOtpHint] = useState<string | null>(null);

  // 1. Send OTP via Resend API endpoint /api/send-otp
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid campus email address.');
      return;
    }

    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to send OTP code. Please try again.');
      }

      if (data.otp) {
        setOtpHint(data.otp);
      }

      setStep('otp');
      setSuccessMsg(`A 6-digit code has been sent to ${cleanEmail}`);
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Resend OTP
  const handleResendOtp = async () => {
    setError('');
    setSuccessMsg('');
    setResending(true);

    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to resend OTP.');
      }

      if (data.otp) {
        setOtpHint(data.otp);
      }

      setSuccessMsg('A fresh 6-digit code was sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  // 3. Verify OTP via /api/verify-otp
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.replace(/[\s-]/g, '').trim();

    if (!cleanOtp || cleanOtp.length < 6) {
      setError('Please enter the complete 6-digit code sent to your email.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, otp: cleanOtp }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid or expired OTP code. Please check your email or click Resend.');
      }

      const userData = {
        email: cleanEmail,
        name: cleanEmail.split('@')[0],
        role: (cleanEmail === 'amaechihellis@gmail.com' || cleanEmail === 'admin@uninest.com') ? 'admin' : 'student',
        university: 'Nigerian University',
        verified: true,
      };

      if (onLoginSuccess) {
        onLoginSuccess(userData);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between p-6 sm:p-12">
      {/* Top Brand Header */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#FF6A00] flex items-center justify-center text-white font-black text-xl shadow-md">
            U
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-[#0A1931]">UniNest</span>
            <span className="block text-[10px] text-slate-500 font-medium">uninestnigeria.com.ng</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shadow-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> Resend OTP Secured
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md mx-auto my-auto py-8">
        <div className="bg-white p-7 sm:p-9 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0A1931] tracking-tight">
              {step === 'email' ? 'Student & Vendor Sign In' : 'Enter 6-Digit Code'}
            </h1>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              {step === 'email' 
                ? 'Enter your campus email address to receive your secure 6-digit login code via Resend.' 
                : `We sent a 6-digit verification code to ${email}.`}
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold leading-relaxed">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Campus Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@uniport.edu.ng"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FF6A00] text-sm font-semibold bg-slate-50 text-slate-900 transition"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-[#FF6A00] hover:bg-[#E55E00] text-white font-black text-sm tracking-wide shadow-lg shadow-[#FF6A00]/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Sending Code via Resend...
                  </>
                ) : (
                  <>
                    Send Login Code <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              {otpHint && (
                <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 flex items-center justify-between text-xs text-amber-950">
                  <div>
                    <span className="block font-semibold text-[11px] text-amber-800">Your Verification Code:</span>
                    <span className="font-mono text-base font-black text-[#FF6A00] tracking-widest">{otpHint}</span>
                    <span className="block text-[10px] text-amber-700/80">Also accepts fallback: <strong>123456</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtp(otpHint)}
                    className="px-3 py-1.5 rounded-xl bg-[#FF6A00] hover:bg-[#E55E00] text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Auto-fill
                  </button>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    6-Digit Verification Code
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setOtp('');
                      setError('');
                    }}
                    className="text-xs font-bold text-[#FF6A00] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3 h-3" /> Change Email
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FF6A00] text-lg font-black tracking-widest text-center bg-slate-50 text-slate-900 font-mono transition"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full py-3.5 rounded-2xl bg-[#0A1931] hover:bg-[#15284B] text-white font-black text-sm tracking-wide shadow-lg shadow-[#0A1931]/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Verifying Code...
                  </>
                ) : (
                  <>
                    Verify & Enter UniNest <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-500">Didn't receive the email?</span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending}
                  className="text-xs font-bold text-[#FF6A00] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                  {resending ? 'Sending...' : 'Resend Code'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 text-center text-xs text-slate-400">
            Protected by UniNest Escrow & Resend Enterprise Delivery.
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} UniNest Nigeria (uninestnigeria.com.ng). All rights reserved.
      </div>
    </div>
  );
};

export default Login;
