import { Eye, Mail, Phone, Send, Building2, GraduationCap, Award, TrendingUp, CheckCircle2, AlertTriangle, Sparkles, ChevronRight, User, Briefcase, Star, Trophy } from 'lucide-react';
import { Candidate } from '../types';

interface CandidateCardProps {
  candidate: Candidate;
  onViewDetails: () => void;
  onSendEmail: () => void;
  index: number;
  isSelectedForCompare?: boolean;
  onToggleCompare?: () => void;
}

export function CandidateCard({ 
  candidate, 
  onViewDetails, 
  onSendEmail, 
  index,
  isSelectedForCompare,
  onToggleCompare 
}: CandidateCardProps) {
  const getTierInfo = (score: number) => {
    if (score >= 90) return { 
      tier: 'TOP TIER MATCH', 
      badgeColor: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      ringColor: 'text-emerald-600 dark:text-emerald-400',
      borderHover: 'hover:border-emerald-400 dark:hover:border-emerald-500/50',
      glowColor: 'shadow-emerald-500/5'
    };
    if (score >= 75) return { 
      tier: 'STRONG CANDIDATE', 
      badgeColor: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      ringColor: 'text-indigo-600 dark:text-indigo-400',
      borderHover: 'hover:border-indigo-400 dark:hover:border-indigo-500/50',
      glowColor: 'shadow-indigo-500/5'
    };
    if (score >= 50) return { 
      tier: 'MODERATE FIT', 
      badgeColor: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      ringColor: 'text-amber-600 dark:text-amber-400',
      borderHover: 'hover:border-amber-400 dark:hover:border-amber-500/50',
      glowColor: 'shadow-amber-500/5'
    };
    return { 
      tier: 'LOW ALIGNMENT', 
      badgeColor: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      ringColor: 'text-rose-600 dark:text-rose-400',
      borderHover: 'hover:border-rose-400 dark:hover:border-rose-500/50',
      glowColor: 'shadow-rose-500/5'
    };
  };

  const { tier, badgeColor, ringColor, borderHover } = getTierInfo(candidate.match_score);
  const hireProb = Math.round((candidate.hire_probability || (candidate.match_score / 100)) * 100);

  const getRankBadge = (rankIdx: number) => {
    if (rankIdx === 0) return { bg: 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-amber-500/30', label: '1st', icon: Trophy };
    if (rankIdx === 1) return { bg: 'bg-gradient-to-br from-slate-300 to-slate-500 text-white shadow-slate-400/30', label: '2nd', icon: Star };
    if (rankIdx === 2) return { bg: 'bg-gradient-to-br from-amber-700 to-orange-800 text-white shadow-orange-700/30', label: '3rd', icon: Star };
    return { bg: 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900', label: `#${rankIdx + 1}`, icon: null };
  };

  const rankBadge = getRankBadge(index);

  return (
    <div
      className={`group relative bg-white dark:bg-slate-900/90 backdrop-blur-sm rounded-2xl border transition-all duration-300 p-5 md:p-6 flex flex-col justify-between shadow-sm hover:shadow-xl ${borderHover} ${
        isSelectedForCompare 
          ? 'border-indigo-500 ring-2 ring-indigo-500/20 dark:border-indigo-400' 
          : 'border-slate-200/90 dark:border-slate-800'
      }`}
    >
      <div>
        {/* Top Header: Rank, Avatar, Name & Overall Score */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start space-x-3 min-w-0">
            {/* Rank badge + Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-600/60 flex items-center justify-center text-slate-800 dark:text-slate-100 font-extrabold text-base shadow-inner">
                {candidate.candidate_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <span 
                className={`absolute -top-2 -left-2 px-1.5 min-w-[22px] h-5 rounded-full ${rankBadge.bg} text-[10px] font-black flex items-center justify-center shadow-md tracking-tight`}
                title={`Rank #${index + 1}`}
              >
                {rankBadge.label}
              </span>
            </div>

            {/* Candidate Name & Info */}
            <div className="min-w-0">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white truncate max-w-[180px] sm:max-w-[220px]">
                  {candidate.candidate_name}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                  {tier}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{candidate.experience_level || 'Experienced'}</span>
                <span>•</span>
                <span>{candidate.experience_years} Yrs Exp</span>
                {candidate.contact_info?.email && (
                  <>
                    <span>•</span>
                    <span className="truncate max-w-[130px] sm:max-w-[160px]" title={candidate.contact_info.email}>
                      {candidate.contact_info.email}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Match Score Radial Display */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="relative w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex flex-col items-center justify-center shadow-sm">
              <span className={`text-lg font-black tracking-tight ${ringColor}`}>
                {candidate.match_score}%
              </span>
              <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                MATCH
              </span>
            </div>
          </div>
        </div>

        {/* Company Experience / Background Badges with Building Icons */}
        {candidate.notable_companies && candidate.notable_companies.length > 0 && (
          <div className="pt-3 pb-1">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span className="font-semibold text-slate-600 dark:text-slate-300">Experience Track:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {candidate.notable_companies.map((company, cIdx) => (
                <span
                  key={cIdx}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/70"
                >
                  <Building2 className="w-3 h-3 text-indigo-500/80 dark:text-indigo-400" />
                  <span>{company}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* AI Synopsis */}
        <div className="py-3">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
            {candidate.summary}
          </p>
        </div>

        {/* Multi-Dimensional Score Metrics */}
        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 mb-3.5 text-center">
          <div>
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">
              Hire Probability
            </span>
            <div className="flex items-center justify-center space-x-1.5">
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{hireProb}%</span>
            </div>
          </div>

          <div className="border-x border-slate-200 dark:border-slate-700/60 px-1">
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">
              Experience
            </span>
            <div className="text-xs font-black text-slate-800 dark:text-slate-200">
              {candidate.experience_years} yrs
            </div>
          </div>

          <div>
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">
              Skills Matched
            </span>
            <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">
              {candidate.matched_skills.length} / {candidate.skills.length}
            </div>
          </div>
        </div>

        {/* Skills Tag Section */}
        <div className="space-y-2 mb-4">
          {/* Matched Skills */}
          {candidate.matched_skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center">
              {candidate.matched_skills.slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60"
                >
                  <CheckCircle2 className="h-2.5 w-2.5 mr-1 text-emerald-500" />
                  {skill}
                </span>
              ))}
              {candidate.matched_skills.length > 4 && (
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 self-center">
                  +{candidate.matched_skills.length - 4} more
                </span>
              )}
            </div>
          )}

          {/* Missing Skills (if any) */}
          {candidate.missing_skills && candidate.missing_skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center">
              {candidate.missing_skills.slice(0, 2).map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60"
                >
                  <AlertTriangle className="h-2.5 w-2.5 mr-1 text-amber-500" />
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* AI Recommendation Quote */}
        {candidate.recommendation && (
          <div className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200 mb-4">
            <div className="flex items-center space-x-1.5 font-bold mb-0.5 text-[11px] text-indigo-700 dark:text-indigo-300">
              <Sparkles className="h-3 w-3" />
              <span>AI Evaluator Note:</span>
            </div>
            <p className="line-clamp-2 leading-relaxed text-[11px] text-slate-600 dark:text-slate-300">
              {candidate.recommendation}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
        {onToggleCompare && (
          <button
            type="button"
            onClick={onToggleCompare}
            className={`p-2 rounded-xl text-xs font-semibold border transition-all ${
              isSelectedForCompare
                ? 'bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title={isSelectedForCompare ? 'Remove from comparison' : 'Add to candidate comparison matrix'}
          >
            <span className="text-[10px] font-bold">Compare</span>
          </button>
        )}

        <button
          type="button"
          onClick={onViewDetails}
          className="flex-1 inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>View Candidate Profile</span>
        </button>

        {candidate.contact_info?.email && (
          <button
            type="button"
            onClick={onSendEmail}
            className="inline-flex items-center justify-center space-x-1 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
            title="Compose AI Interview Invitation"
          >
            <Send className="h-3.5 w-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Invite</span>
          </button>
        )}
      </div>
    </div>
  );
}