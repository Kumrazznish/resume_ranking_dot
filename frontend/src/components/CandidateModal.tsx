import { useState } from 'react';
import { 
  X, Mail, Phone, Building2, Award, Target, Sparkles, CheckCircle2, 
  AlertTriangle, HelpCircle, Send, Copy, Check, FileText, UserCheck, 
  Shield, GraduationCap, Briefcase, Calendar, MapPin, DollarSign, 
  TrendingUp, BarChart2, Star, CheckSquare, MessageSquare, ChevronRight,
  ExternalLink, Layers, Search
} from 'lucide-react';
import { Candidate } from '../types';

interface CandidateModalProps {
  candidate: Candidate;
  isOpen: boolean;
  onClose: () => void;
  onSendEmail?: (candidate: Candidate) => void;
}

export function CandidateModal({ candidate, isOpen, onClose, onSendEmail }: CandidateModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'experience' | 'interview' | 'email'>('overview');
  const [emailTemplate, setEmailTemplate] = useState<'standard' | 'fasttrack' | 'executive'>('standard');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedQuestionIndex, setCopiedQuestionIndex] = useState<number | null>(null);
  const [skillSearch, setSkillSearch] = useState('');

  if (!isOpen) return null;

  const hireProb = Math.round((candidate.hire_probability || (candidate.match_score / 100)) * 100);

  const getTierBadge = (score: number) => {
    if (score >= 90) return { 
      label: 'TOP TIER MATCH (Top 5%)', 
      color: 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
      gradient: 'from-emerald-600 to-teal-600'
    };
    if (score >= 75) return { 
      label: 'STRONG CANDIDATE', 
      color: 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700',
      gradient: 'from-indigo-600 to-blue-600'
    };
    if (score >= 50) return { 
      label: 'MODERATE ALIGNMENT', 
      color: 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700',
      gradient: 'from-amber-600 to-orange-600'
    };
    return { 
      label: 'LOW FIT', 
      color: 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700',
      gradient: 'from-rose-600 to-red-600'
    };
  };

  const tier = getTierBadge(candidate.match_score);

  const emailTemplates = {
    standard: `Subject: Invitation to Interview: Software Engineering Role

Hi ${candidate.candidate_name.split(' ')[0]},

Thank you for your application! Our engineering and talent teams reviewed your profile and were very impressed by your ${candidate.experience_years} years of background, particularly your expertise in ${candidate.matched_skills.slice(0, 3).join(', ')}.

Based on our AI technical evaluation, your experience aligns strongly (${candidate.match_score}% fit) with what we are building. We would love to schedule a 30-minute introductory video call to discuss your projects and share more details about the role.

Please let us know your availability over the next few days.

Best regards,
Talent Acquisition Team`,

    fasttrack: `Subject: Fast-Track Technical Interview Invitation: Senior Role

Hi ${candidate.candidate_name.split(' ')[0]},

I hope this email finds you well. Our technical screening assessment ranked your profile in the top tier of applicants with a remarkable ${candidate.match_score}% match score.

Given your deep experience in ${candidate.skills.slice(0, 4).join(', ')}, we would like to fast-track your application directly to a technical conversation with our Engineering Lead.

Are you available for a 45-minute technical discussion this week? Please let us know what time slots suit you best.

Warm regards,
Hiring Team Lead`,

    executive: `Subject: Executive Discussion: Engineering Opportunities

Dear ${candidate.candidate_name},

Our talent leadership team recently reviewed your background and notable career milestones. With your ${candidate.experience_years} years of domain experience and proven background, we believe you would bring immense value to our initiatives.

We would be thrilled to arrange a confidential conversation with our leadership to explore how your skills align with our current and upcoming product roadmaps.

Please let us know a convenient time for an introductory call.

Sincerely,
Head of Talent & People`
  };

  const currentEmailContent = emailTemplates[emailTemplate];

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(currentEmailContent);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyQuestion = (question: string, index: number) => {
    navigator.clipboard.writeText(question);
    setCopiedQuestionIndex(index);
    setTimeout(() => setCopiedQuestionIndex(null), 2000);
  };

  const filteredAllSkills = candidate.skills.filter(s => 
    s.toLowerCase().includes(skillSearch.toLowerCase())
  );

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-4 sm:my-8 animate-scale-in flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-r from-slate-50 via-indigo-50/20 to-slate-50 dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 flex items-start justify-between gap-4">
          <div className="flex items-start space-x-4 min-w-0">
            {/* Match Score Badge */}
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${tier.gradient} text-white flex flex-col items-center justify-center font-black shadow-lg flex-shrink-0`}>
              <span className="text-xl sm:text-2xl leading-none">{candidate.match_score}%</span>
              <span className="text-[9px] font-extrabold uppercase tracking-wider opacity-90">MATCH</span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                  {candidate.candidate_name}
                </h2>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${tier.color} shadow-sm`}>
                  {tier.label}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                  {candidate.experience_level || 'Senior Professional'}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  {candidate.experience_years} Years Experience
                </span>
                {candidate.contact_info?.email && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[200px]">{candidate.contact_info.email}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors flex-shrink-0"
            title="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-4 sm:px-6 bg-white dark:bg-slate-900/90 overflow-x-auto scrollbar-none">
          {[
            { id: 'overview', label: 'Candidate Deep Dive', icon: Target },
            { id: 'experience', label: 'Work Experience & Companies', icon: Building2 },
            { id: 'skills', label: 'Skill Matrix & Gaps', icon: Award },
            { id: 'interview', label: 'AI Interview Questions', icon: HelpCircle },
            { id: 'email', label: 'Compose Outreach Email', icon: Mail },
          ].map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-3.5 px-3.5 sm:px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  isCurrent
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/20'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-sm flex-1">
          
          {/* TAB 1: OVERVIEW / DEEP DIVE */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              {/* Scoring KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/70 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Overall Match Index
                    </span>
                    <Target className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
                    {candidate.match_score}%
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Weighted semantic score</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/70 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Hire Probability
                    </span>
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                    {hireProb}%
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Predictive success probability</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/70 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Skill Alignment
                    </span>
                    <Award className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    {candidate.matched_skills.length} <span className="text-base font-normal text-slate-400">/ {candidate.skills.length}</span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Core competencies satisfied</span>
                </div>
              </div>

              {/* AI Evaluator Narrative */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/90 to-purple-50/50 dark:from-indigo-950/40 dark:to-purple-950/20 border border-indigo-200/80 dark:border-indigo-800/60 shadow-sm space-y-2.5">
                <div className="flex items-center space-x-2 text-indigo-800 dark:text-indigo-300 font-extrabold text-xs">
                  <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Gemini 2.0 Flash Candidate Synopsis</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                  {candidate.summary}
                </p>
                {candidate.recommendation && (
                  <div className="pt-2 border-t border-indigo-200/60 dark:border-indigo-900/60 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                      Recommendation: {candidate.recommendation}
                    </p>
                  </div>
                )}
              </div>

              {/* Strengths & Weaknesses Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 shadow-sm space-y-2.5">
                  <div className="flex items-center space-x-2 text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Verified Core Strengths</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    {candidate.strengths && candidate.strengths.length > 0 ? (
                      candidate.strengths.map((str, idx) => (
                        <li key={idx} className="flex items-start space-x-2 bg-white/70 dark:bg-slate-900/60 p-2 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40">
                          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">✓</span>
                          <span className="font-medium">{str}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-400 italic">Strong technical trajectory and solid background.</li>
                    )}
                  </ul>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 shadow-sm space-y-2.5">
                  <div className="flex items-center space-x-2 text-xs font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span>Gaps & Areas to Probe</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    {candidate.weaknesses && candidate.weaknesses.length > 0 ? (
                      candidate.weaknesses.map((wk, idx) => (
                        <li key={idx} className="flex items-start space-x-2 bg-white/70 dark:bg-slate-900/60 p-2 rounded-xl border border-amber-200/60 dark:border-amber-900/40">
                          <span className="text-amber-600 dark:text-amber-400 font-extrabold">!</span>
                          <span className="font-medium">{wk}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-400 italic">No critical blockers identified for this role.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EXPERIENCE & NOTABLE COMPANIES */}
          {activeTab === 'experience' && (
            <div className="space-y-6 animate-fade-in">
              {/* Seniority & Credentials Header */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850/70 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Seniority & Compensation Benchmark</span>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    {candidate.experience_years} Years Total Experience
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    <span className="text-slate-400 dark:text-slate-500 block mb-1 font-semibold text-[10px] uppercase">Career Level</span>
                    <span className="font-black text-slate-900 dark:text-white text-sm">{candidate.experience_level || 'Senior Level'}</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    <span className="text-slate-400 dark:text-slate-500 block mb-1 font-semibold text-[10px] uppercase">Education / Degree</span>
                    <span className="font-bold text-slate-900 dark:text-slate-200 text-xs truncate block">{candidate.education || 'B.S. in Computer Science'}</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    <span className="text-slate-400 dark:text-slate-500 block mb-1 font-semibold text-[10px] uppercase">Salary Range Target</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-xs">{candidate.salary_range || 'Competitive Benchmark'}</span>
                  </div>
                </div>
              </div>

              {/* Work Experience Timeline & Notable Companies with Building Logos */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850/70 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 dark:text-white">
                  <Building2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Notable Companies & Corporate Experience</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {candidate.notable_companies && candidate.notable_companies.length > 0 ? (
                    candidate.notable_companies.map((company, idx) => (
                      <div 
                        key={idx}
                        className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start space-x-3 group hover:border-indigo-400 dark:hover:border-indigo-600 transition-all"
                      >
                        {/* Company Building Logo Badge */}
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-50 to-indigo-100 dark:from-indigo-950/60 dark:to-slate-800 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400">
                          <Building2 className="h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                              {company}
                            </h4>
                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded">
                              Verified
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Professional Track Record • Role Contributor
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center space-x-3 col-span-2">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">Software Industry Experience</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{candidate.experience_years} years in commercial software development environments</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Certifications (if available) */}
              {candidate.certifications && candidate.certifications.length > 0 && (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850/70 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 dark:text-white">
                    <Award className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Verified Certifications & Accreditations</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {candidate.certifications.map((cert, cIdx) => (
                      <span key={cIdx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SKILLS MATRIX & GAPS */}
          {activeTab === 'skills' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                {/* Matched Skills */}
                <div className="p-5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center space-x-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>Directly Matched Skills ({candidate.matched_skills.length})</span>
                    </span>
                    <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md">
                      100% Verified
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {candidate.matched_skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30"
                      >
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="p-5 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center space-x-1.5">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <span>Missing Job Requirements ({candidate.missing_skills.length})</span>
                    </span>
                    <span className="text-[10px] font-black text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-md">
                      Probe in Interview
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {candidate.missing_skills.length > 0 ? (
                      candidate.missing_skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30"
                        >
                          ! {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No missing critical skills detected. Complete coverage!</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Complete Extracted Skill Portfolio */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850/70 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Complete Extracted Skill Portfolio ({candidate.skills.length} skills total)
                  </span>
                  <div className="relative w-full sm:w-48">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Filter skills..."
                      value={skillSearch}
                      onChange={(e) => setSkillSearch(e.target.value)}
                      className="w-full pl-8 pr-2 py-1 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1 max-h-48 overflow-y-auto">
                  {filteredAllSkills.map((skill) => {
                    const isMatched = candidate.matched_skills.includes(skill);
                    return (
                      <span
                        key={skill}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                          isMatched
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {skill}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AI INTERVIEW QUESTIONS */}
          {activeTab === 'interview' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 dark:text-white">
                  <HelpCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span>AI-Generated Role & Competency Interview Questions</span>
                </div>
                <span className="text-[11px] text-slate-400">Tailored to resume & gaps</span>
              </div>

              <div className="space-y-3">
                {candidate.interview_questions && candidate.interview_questions.length > 0 ? (
                  candidate.interview_questions.map((question, idx) => (
                    <div 
                      key={idx} 
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/70 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2 group hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs font-black flex items-center justify-center shadow-sm">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            Question {idx + 1}
                          </span>
                          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                            {idx === 0 ? 'Architecture & Design' : idx === 1 ? 'Technical Depth' : 'Behavioral & Execution'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopyQuestion(question, idx)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors shadow-sm"
                        >
                          {copiedQuestionIndex === idx ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                              <span className="text-emerald-600 dark:text-emerald-400 text-[11px]">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5 text-slate-400" />
                              <span className="text-[11px]">Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      
                      <p className="text-xs text-slate-700 dark:text-slate-200 pl-8 leading-relaxed font-medium">
                        "{question}"
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400">
                    Generating role-specific technical questions...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: EMAIL INVITATION */}
          {activeTab === 'email' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    AI Interview Invitation Email
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Select a tone and copy to send via your recruitment portal
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-[11px] font-semibold border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setEmailTemplate('standard')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        emailTemplate === 'standard' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold' : 'text-slate-500'
                      }`}
                    >
                      Standard
                    </button>
                    <button
                      type="button"
                      onClick={() => setEmailTemplate('fasttrack')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        emailTemplate === 'fasttrack' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold' : 'text-slate-500'
                      }`}
                    >
                      Fast-Track
                    </button>
                    <button
                      type="button"
                      onClick={() => setEmailTemplate('executive')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        emailTemplate === 'executive' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold' : 'text-slate-500'
                      }`}
                    >
                      Executive
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    {copiedEmail ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedEmail ? 'Copied' : 'Copy Email'}</span>
                  </button>
                </div>
              </div>

              <textarea
                value={currentEmailContent}
                readOnly
                rows={11}
                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed focus:outline-none shadow-inner"
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>AI Ranked Candidate Profile</span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              Close Profile
            </button>
            <button
              type="button"
              onClick={() => {
                if (onSendEmail) {
                  onSendEmail(candidate);
                } else {
                  setActiveTab('email');
                }
              }}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Interview Invitation</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}