import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Target, Sparkles, CheckCircle2, ShieldCheck, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const res = await login(email, password);
    setIsLoading(false);

    if (res.success) {
      navigate('/upload');
    } else {
      setError(res.error || 'Invalid credentials. Please check your email and password.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full grid md:grid-cols-12 gap-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-gray-200/80 dark:border-white/10 shadow-2xl overflow-hidden">
        
        {/* Left USP Banner */}
        <div className="md:col-span-5 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                <Target className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight">ResumeRanker Pro</span>
            </div>

            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border border-white/20">
              <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
              <span>For Talent Acquisition Leaders</span>
            </div>

            <h2 className="text-2xl font-bold leading-tight mb-4">
              Screen Resumes 10x Faster with AI Precision
            </h2>
            <p className="text-sm text-blue-100/90 leading-relaxed mb-6">
              Transform high-volume hiring chaos into an objective, explainable leaderboard powered by TalentAI Neural Engine and enterprise database persistence.
            </p>

            <div className="space-y-3.5 text-sm">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-300 shrink-0 mt-0.5" />
                <span><b>4-Pillar Weighted Match:</b> Skills (40%), Experience (30%), Soft Skills (20%), Education (10%)</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-300 shrink-0 mt-0.5" />
                <span><b>Zero ATS Keyword Gaming:</b> Evaluates semantic depth and actual career trajectory</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-300 shrink-0 mt-0.5" />
                <span><b>Custom Interview Questions:</b> AI auto-generates targeted questions for each candidate gap</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-300 shrink-0 mt-0.5" />
                <span><b>One-Click Outreach:</b> Directly email interview invites and update hiring pipeline</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/20 flex items-center justify-between text-xs text-blue-200">
            <span>Powered by TalentAI Pro & Enterprise ATS</span>
            <span className="flex items-center space-x-1"><ShieldCheck className="h-4 w-4" /><span>Enterprise Ready</span></span>
          </div>
        </div>

        {/* Right Form */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Sign in to your recruiter workspace or administrative dashboard.
            </p>
          </div>

          {/* Dedicated Admin Portal Direct Access */}
          <div className="mb-6 bg-purple-50 dark:bg-purple-950/40 p-4 rounded-2xl border border-purple-200 dark:border-purple-800/60 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-900 dark:text-white">Looking for Administrator Portal?</div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400">Restricted console for managing HRs and metrics.</div>
              </div>
            </div>
            <Link
              to="/admin-login"
              className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
            >
              Admin Login →
            </Link>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Demo password is: password123'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span>Remember this device</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-600 dark:text-gray-400">
            Don't have an account yet?{' '}
            <Link to="/signup" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
              Create a recruiter account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
export default LoginPage;
