import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, UserCheck, ArrowRight, Eye, EyeOff, AlertCircle, Sparkles, Terminal } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function AdminLoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim() || !password.trim()) {
      setError('Please provide both Administrator Identifier and Password.');
      return;
    }

    setIsLoading(true);
    const res = await adminLogin(identifier.trim(), password);
    setIsLoading(false);

    if (res.success) {
      navigate('/admin');
    } else {
      setError(res.error || 'Access Denied: Invalid Administrator ID or Password.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full grid md:grid-cols-12 gap-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-purple-500/30 dark:border-purple-500/20 shadow-2xl overflow-hidden">
        
        {/* Left Side: Security Badge & System Overview */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full text-xs font-bold text-purple-300 uppercase tracking-widest mb-6">
              <ShieldCheck className="h-4 w-4 text-purple-400" />
              <span>Admin Access Only</span>
            </div>

            <h2 className="text-3xl font-black tracking-tight text-white mb-3">
              Executive HR Console
            </h2>
            <p className="text-sm text-purple-200/80 leading-relaxed mb-6">
              Restricted portal for managing HR recruiters, inspecting live screening metrics, and configuring platform governance.
            </p>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-start space-x-3">
                <Terminal className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Direct Recruiter Control</div>
                  <div className="text-slate-400 text-[11px]">Audit and toggle individual recruiter accounts on or off.</div>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-start space-x-3">
                <Sparkles className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Live Real-Time Activity</div>
                  <div className="text-slate-400 text-[11px]">Real data streams from all candidate scoring operations.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/10 text-[11px] text-purple-300/60 flex items-center justify-between">
            <span>Security Layer: Active</span>
            <span>TLS 1.3 Verified</span>
          </div>
        </div>

        {/* Right Side: Admin Authentication Form */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center bg-white dark:bg-slate-900">
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">Admin Authentication</h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Enter your designated Administrator ID / Email and secure password to continue.
            </p>
          </div>

          {/* Credentials Info Helper Box */}
          <div className="mb-5 p-3.5 bg-purple-50/80 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-800/60 text-xs">
            <div className="flex items-center space-x-2 font-bold text-purple-900 dark:text-purple-300 mb-1">
              <UserCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span>Master Admin Credentials:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-700 dark:text-gray-300">
              <div><span className="text-gray-500">ID / Email:</span> <code className="font-mono font-bold bg-white dark:bg-slate-800 px-1 py-0.5 rounded border border-purple-200 dark:border-purple-800">admin@resumeranker.ai</code> (or <code className="font-mono font-bold">admin</code>)</div>
              <div><span className="text-gray-500">Password:</span> <code className="font-mono font-bold bg-white dark:bg-slate-800 px-1 py-0.5 rounded border border-purple-200 dark:border-purple-800">admin123</code></div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-xs font-medium flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Admin Identifier / Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@resumeranker.ai or admin"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Admin Security Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
            >
              <span>{isLoading ? 'Verifying Admin Authority...' : 'Authorize & Open Admin Console'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Are you a recruiter?</span>
            <Link to="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
              Go to HR Recruiter Login →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminLoginPage;
