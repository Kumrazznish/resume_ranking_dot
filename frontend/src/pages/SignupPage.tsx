import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Target, Sparkles, Building2, User, Mail, Lock, ShieldCheck, ArrowRight, CheckCircle2, UserCheck, Briefcase } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';

export function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState<UserRole>('hr');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    const res = await register(name, email, password, role, company || 'Talent Acquisition Org');
    setIsLoading(false);

    if (res.success) {
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/upload');
      }
    } else {
      setError(res.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full grid md:grid-cols-12 gap-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-gray-200/80 dark:border-white/10 shadow-2xl overflow-hidden">
        
        {/* Left USP Banner */}
        <div className="md:col-span-5 bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-700 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                <Target className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight">ResumeRanker Pro</span>
            </div>

            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border border-white/20">
              <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
              <span>Free Recruiter Workspace</span>
            </div>

            <h2 className="text-2xl font-bold leading-tight mb-4">
              Join 500+ Modern HR Teams Automating Candidate Screening
            </h2>
            <p className="text-sm text-purple-100/90 leading-relaxed mb-6">
              Stop manually reading 100-page resume batches. Let TalentAI rank candidates objectively against your exact job description in seconds.
            </p>

            <div className="space-y-3.5 text-sm">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 text-pink-300 shrink-0 mt-0.5" />
                <span><b>Instant Multi-File Ingestion:</b> Supports PDF, Word (.docx), and plain text</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 text-pink-300 shrink-0 mt-0.5" />
                <span><b>Skill Gap Detection:</b> See matched vs missing qualifications at a glance</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 text-pink-300 shrink-0 mt-0.5" />
                <span><b>MongoDB Historical Archives:</b> Every hiring decision backed by structured audit records</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 text-pink-300 shrink-0 mt-0.5" />
                <span><b>Direct Email Templates:</b> Candidate interview scheduling and custom question generation</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/20 flex items-center justify-between text-xs text-purple-200">
            <span>No credit card required</span>
            <span className="flex items-center space-x-1"><ShieldCheck className="h-4 w-4" /><span>ISO & SOC-2 Ready</span></span>
          </div>
        </div>

        {/* Right Form */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Create your workspace</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Select your role and start evaluating applicant resumes in minutes.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('hr')}
                  className={`p-3 rounded-xl border text-left flex items-start space-x-3 transition-all ${
                    role === 'hr'
                      ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/30'
                      : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-bold">HR Recruiter</div>
                    <div className="text-[11px] opacity-75">Screen resumes & email candidates</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`p-3 rounded-xl border text-left flex items-start space-x-3 transition-all ${
                    role === 'admin'
                      ? 'border-purple-600 bg-purple-50/80 dark:bg-purple-900/30 text-purple-900 dark:text-purple-200 ring-2 ring-purple-500/30'
                      : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <UserCheck className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-bold">HR Director / Admin</div>
                    <div className="text-[11px] opacity-75">Manage HRs & review analytics</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Company / Organization
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Talent Partners"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  />
                </div>
              </div>
            </div>

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
                  placeholder="jane@company.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Create Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
            >
              <span>{isLoading ? 'Creating Workspace...' : 'Get Started Free'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
              Sign in here
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
export default SignupPage;
