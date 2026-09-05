import { Link } from 'react-router-dom';
import {
  Upload, BarChart3, Target, Zap, Shield, Clock, Mail,
  Star, Users, CheckCircle, ArrowRight, Sparkles,
  Brain, FileText, Award, ChevronRight
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Data
───────────────────────────────────────────── */
const FEATURES = [
  {
    icon: Brain,
    accent: '#6366f1',
    lightBg: 'bg-indigo-50 dark:bg-indigo-500/10',
    lightIcon: 'text-indigo-600 dark:text-indigo-400',
    title: 'TalentAI Neural Core',
    desc: "Powered by advanced multi-layer AI inference for deep, contextual resume understanding beyond simple keyword matching.",
  },
  {
    icon: Target,
    accent: '#059669',
    lightBg: 'bg-emerald-50 dark:bg-emerald-500/10',
    lightIcon: 'text-emerald-600 dark:text-emerald-400',
    title: 'Precision Matching',
    desc: 'Semantic skill alignment, seniority scoring, and role-fit analysis calibrated to your exact job description.',
  },
  {
    icon: BarChart3,
    accent: '#0284c7',
    lightBg: 'bg-sky-50 dark:bg-sky-500/10',
    lightIcon: 'text-sky-600 dark:text-sky-400',
    title: 'Hiring Analytics',
    desc: 'Candidate distribution charts, score breakdowns, and pipeline insights to drive data-backed decisions.',
  },
  {
    icon: Mail,
    accent: '#db2777',
    lightBg: 'bg-pink-50 dark:bg-pink-500/10',
    lightIcon: 'text-pink-600 dark:text-pink-400',
    title: 'AI Email Drafting',
    desc: 'Auto-generate polished, personalised interview invitations for every shortlisted candidate in one click.',
  },
  {
    icon: Shield,
    accent: '#d97706',
    lightBg: 'bg-amber-50 dark:bg-amber-500/10',
    lightIcon: 'text-amber-600 dark:text-amber-400',
    title: 'Objective Screening',
    desc: 'Criteria-driven scoring removes unconscious bias from early-stage filtering — fair for every applicant.',
  },
  {
    icon: Clock,
    accent: '#7c3aed',
    lightBg: 'bg-violet-50 dark:bg-violet-500/10',
    lightIcon: 'text-violet-600 dark:text-violet-400',
    title: '60% Faster Hiring',
    desc: 'Screen 200 resumes in under 5 minutes. Reclaim days every hiring cycle and reduce cost-per-hire.',
  },
];

const STEPS = [
  {
    num: '01',
    icon: Upload,
    title: 'Upload & Describe',
    desc: 'Paste your job description and drop resume files in PDF, DOC, or TXT. Our parser handles the rest.',
  },
  {
    num: '02',
    icon: Brain,
    title: 'AI Analysis',
    desc: 'TalentAI cross-references each resume against your requirements — scoring skills, experience, and culture fit.',
  },
  {
    num: '03',
    icon: Award,
    title: 'Ranked Shortlist',
    desc: 'Receive a sortable leaderboard with match scores, skill gap analysis, and one-click candidate actions.',
  },
];

const STATS = [
  { value: '10K+', label: 'Resumes processed', icon: FileText },
  { value: '95%', label: 'Scoring accuracy', icon: Target },
  { value: '60%', label: 'Time saved per hire', icon: Clock },
  { value: '500+', label: 'Recruiting teams', icon: Users },
];

const TESTIMONIALS = [
  {
    quote: 'Reduced our time-to-shortlist from 3 days to 20 minutes. We now run entire hiring rounds in a single afternoon.',
    name: 'Priya M.',
    role: 'Head of Talent',
    company: 'TechCorp',
    initials: 'PM',
    color: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300',
  },
  {
    quote: 'The AI scores are remarkably accurate. Four engineering hires made through the platform — all strong performers.',
    name: 'Ravi S.',
    role: 'CTO',
    company: 'StartupHub',
    initials: 'RS',
    color: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  },
  {
    quote: 'Finally, a screening tool that removes early-stage bias. The analytics dashboard gives leadership real confidence.',
    name: 'Anika J.',
    role: 'HR Director',
    company: 'FinScale',
    initials: 'AJ',
    color: 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300',
  },
];

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-x-hidden">

      {/* ── STICKY NAV ──────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center">
              <Target className="h-4.5 w-4.5 text-white h-5 w-5" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-[15px] tracking-tight">ResumeRanker Pro</span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-500 dark:text-gray-400">
            <a href="#features" className="hover:text-gray-900 dark:hover:text-white transition-colors">Features</a>
            <a href="#how" className="hover:text-gray-900 dark:hover:text-white transition-colors">How it works</a>
            <a href="#testimonials" className="hover:text-gray-900 dark:hover:text-white transition-colors">Reviews</a>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="hidden sm:inline-flex text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-1.5"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              id="nav-cta"
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <span>Get started</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="relative pt-20 pb-28 px-6 overflow-hidden">
        {/* Subtle background grid */}
        <div
          className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(to right, #6366f1 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        {/* Soft glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-400/10 dark:bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 rounded-full px-4 py-1.5 text-xs font-semibold mb-8 tracking-wide uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Powered by TalentAI Enterprise Engine</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 leading-[1.08]">
            The smarter way to<br />
            <span className="text-indigo-600 dark:text-indigo-400">screen candidates</span>
          </h1>

          {/* Sub-headline */}
          <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            ResumeRanker Pro uses AI to analyse, score, and rank every applicant against your job requirements — so your hiring team focuses only on the right people.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
            <Link
              to="/signup"
              id="hero-cta-primary"
              className="group inline-flex items-center space-x-2 px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
            >
              <span>Start for free</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/login"
              id="hero-cta-secondary"
              className="inline-flex items-center space-x-2 px-7 py-3.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-base rounded-xl transition-all duration-200 hover:-translate-y-0.5"
            >
              <span>Sign in to your account</span>
            </Link>
          </div>

          {/* Trust bar */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-400 dark:text-gray-500">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <span>Free to start</span>
            </div>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <span>No credit card required</span>
            </div>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <span>Results in under 5 minutes</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────────── */}
      <section className="border-y border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 py-14">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10">
          {STATS.map(({ value, label, icon: Icon }, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-1">{value}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-16">
            <p className="text-xs font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase mb-3">Platform features</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Built for serious hiring teams
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
              Every feature is designed to remove friction from your screening workflow and put better candidates in front of your team, faster.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, lightBg, lightIcon, title, desc }, i) => (
              <div
                key={i}
                className="group p-7 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-lg dark:hover:shadow-indigo-950/40 transition-all duration-300"
              >
                <div className={`w-11 h-11 rounded-xl ${lightBg} flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300`}>
                  <Icon className={`h-5 w-5 ${lightIcon}`} />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────── */}
      <section id="how" className="py-24 px-6 bg-gray-50 dark:bg-gray-900/60 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase mb-3">How it works</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              From upload to shortlist in minutes
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              A straightforward, three-step process that integrates seamlessly into your existing workflow.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map(({ num, icon: Icon, title, desc }, i) => (
              <div key={i} className="relative">
                {/* connector */}
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-[calc(100%-1rem)] w-full h-px border-t-2 border-dashed border-gray-200 dark:border-gray-700 z-0" style={{ width: 'calc(100% - 3rem)' }} />
                )}
                <div className="relative z-10 p-7 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                  <div className="flex items-center space-x-3 mb-5">
                    <span className="text-xs font-bold tracking-widest text-gray-400 dark:text-gray-600 uppercase">{num}</span>
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────── */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase mb-3">Customer reviews</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Trusted by recruitment professionals
            </h2>
            <div className="flex items-center justify-center space-x-1 mt-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
              ))}
              <span className="ml-2 text-sm font-semibold text-gray-600 dark:text-gray-400">4.9 / 5 from 200+ reviews</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ quote, name, role, company, initials, color }, i) => (
              <div
                key={i}
                className="p-7 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col gap-5"
              >
                <div className="flex space-x-0.5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed flex-1">
                  "{quote}"
                </p>
                <div className="flex items-center space-x-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                    {initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{role} · {company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-indigo-600 dark:bg-indigo-950 relative overflow-hidden">
        {/* Subtle pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 dark:from-indigo-950 dark:via-violet-950 dark:to-slate-950" />

        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-5 leading-tight">
            Ready to transform your<br />hiring process?
          </h2>
          <p className="text-indigo-200 dark:text-indigo-300 text-lg mb-10 max-w-xl mx-auto">
            Join 500+ recruiting teams using AI to hire faster, smarter, and more consistently.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/signup"
              id="cta-bottom-signup"
              className="group inline-flex items-center space-x-2 px-8 py-4 bg-white hover:bg-gray-50 text-indigo-700 font-bold text-base rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 hover:-translate-y-0.5"
            >
              <span>Create your free account</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/login"
              id="cta-bottom-signin"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/25 hover:border-white/50 text-white font-semibold text-base rounded-xl transition-all duration-200"
            >
              <span>Sign in instead</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="py-10 px-6 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center">
              <Target className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-sm">ResumeRanker Pro</span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-600">
            © {new Date().getFullYear()} ResumeRanker Pro. All rights reserved.
          </p>
          <Link
            to="/admin-login"
            className="text-xs text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
          >
            Admin Portal
          </Link>
        </div>
      </footer>
    </div>
  );
}
