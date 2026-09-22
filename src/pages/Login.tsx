import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Loader2, Lock, Mail, ArrowRight } from 'lucide-react';

export const Login: React.FC<{ onLoginSuccess?: (user: any) => void }> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // Simulate secure connection / authentication check on uninestnigeria.com.ng
      await new Promise((resolve) => setTimeout(resolve, 1200));
      
      const userData = {
        email: email.trim(),
        name: email.split('@')[0],
        role: 'student',
        university: 'Nigerian University'
      };

      if (onLoginSuccess) {
        onLoginSuccess(userData);
      }
      navigate('/student/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between p-6 sm:p-12">
      {/* Top Brand Header */}
      <div className="max-w-md mx-w-full w-full max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-[#FF6A00] flex items-center justify-center text-white font-black text-xl shadow-md">
            U
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-[#0A1931]">UniNest</span>
            <span className="block text-[10px] text-slate-500 font-medium">uninestnigeria.com.ng</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          <ShieldCheck className="w-4 h-4" /> Secure Portal
        </div>
      </div>

      {/* Main Form Container */}
      <div className="w-full max-w-md mx-auto my-auto py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-[#0A1931] tracking-tight">Student & Vendor Portal</h1>
          <p className="text-sm text-slate-600 mt-1">Sign in to your verified campus account on {window.location.origin}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Campus Email or Phone
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. student@uniport.edu.ng"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF6A00] text-sm font-medium bg-slate-50 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF6A00] text-sm font-medium bg-slate-50 transition"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#FF6A00] hover:bg-[#E55E00] text-white font-black text-sm tracking-wide shadow-lg shadow-[#FF6A00]/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Connecting...
              </>
            ) : (
              <>
                Sign In to UniNest <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500">
          Protected by UniNest Escrow & Verified Campus SSL.
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
