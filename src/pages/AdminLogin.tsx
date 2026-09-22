import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Loader2, Lock, Mail, ArrowRight } from 'lucide-react';

export const AdminLogin: React.FC<{ onAdminLoginSuccess?: (adminUser: any) => void }> = ({ onAdminLoginSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanEmail !== 'amaechihellis@gmail.com') {
      setError('Access denied. This portal is strictly restricted to Head Administrator amaechihellis@gmail.com.');
      return;
    }

    if (!password) {
      setError('Please enter your secure administrator password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Simulate secure admin verification on uninestnigeria.com.ng
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const adminUser = {
        email: 'amaechihellis@gmail.com',
        name: 'Hellis Amaechi',
        role: 'admin',
        is_admin: true
      };

      if (onAdminLoginSuccess) {
        onAdminLoginSuccess(adminUser);
      }
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Administrator authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between p-6 sm:p-12 selection:bg-orange-500 selection:text-white">
      {/* Top Header */}
      <div className="max-w-md mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-[#FF6A00] flex items-center justify-center text-black font-black text-xl shadow-lg shadow-orange-500/20">
            U
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white">UniNest Admin HQ</span>
            <span className="block text-[10px] text-amber-400 font-mono">uninestnigeria.com.ng</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
          <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse" /> Level 1 Security
        </div>
      </div>

      {/* Admin Form Card */}
      <div className="w-full max-w-md mx-auto my-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Super Administrator</h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">Restricted Access • amaechihellis@gmail.com</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs font-semibold leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleAdminAuth} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="amaechihellis@gmail.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-mono text-white bg-slate-900 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Secure Password / Passkey
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-mono text-white bg-slate-900 transition"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-[#FF6A00] hover:from-orange-500 hover:to-orange-600 text-white font-black text-xs tracking-wider uppercase shadow-lg shadow-orange-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Verifying Admin Clearance...
              </>
            ) : (
              <>
                Authorize Admin Access <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-[11px] font-mono text-slate-500">
          All administrative logins and actions are cryptographically logged to institutional audit trails.
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] font-mono text-slate-600">
        UniNest Nigeria Admin Console &bull; uninestnigeria.com.ng
      </div>
    </div>
  );
};
export default AdminLogin;
