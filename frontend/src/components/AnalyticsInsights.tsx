import { 
  Brain, TrendingUp, Users, Award, AlertTriangle, CheckCircle2, 
  Info, Sparkles, Target, Zap, ShieldCheck, DollarSign, Clock, 
  ArrowUpRight, BarChart3, CheckSquare
} from 'lucide-react';
import { Candidate } from '../types';

interface AnalyticsInsightsProps {
  data: any;
  candidates: Candidate[];
  stats: any;
}

export function AnalyticsInsights({ data, candidates, stats }: AnalyticsInsightsProps) {
  if (!data) return null;

  const topTierCandidates = candidates.filter(c => c.match_score >= 85);
  const topTierCount = topTierCandidates.length;
  const seniorCount = candidates.filter(c => c.experience_years >= 6).length;
  const seniorPct = candidates.length > 0 ? Math.round((seniorCount / candidates.length) * 100) : 0;
  
  // Calculate average hire probability
  const avgHireProb = candidates.length > 0
    ? Math.round(candidates.reduce((acc, c) => acc + ((c.hire_probability || (c.match_score / 100)) * 100), 0) / candidates.length)
    : 0;

  // Identify most frequent missing skills across the pool
  const missingSkillFrequency: { [key: string]: number } = {};
  candidates.forEach(c => {
    if (c.missing_skills) {
      c.missing_skills.forEach(skill => {
        missingSkillFrequency[skill] = (missingSkillFrequency[skill] || 0) + 1;
      });
    }
  });

  const topMissingSkills = Object.entries(missingSkillFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  const qualifiedRate = stats && stats.totalCandidates > 0
    ? Math.round((stats.relevantCandidates / stats.totalCandidates) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Executive AI Summary Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white shadow-xl shadow-indigo-600/15 space-y-3 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center space-x-2 text-indigo-200 font-black text-xs uppercase tracking-wider">
          <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
          <span>TalentAI Advisory Synthesis Report</span>
        </div>

        <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
          Applicant Pool Health & Hiring Viability Report
        </h3>

        <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed max-w-3xl">
          Based on the evaluation of {candidates.length} candidate profiles against your job specification, 
          {topTierCount > 0 
            ? ` you have ${topTierCount} high-conviction candidate${topTierCount > 1 ? 's' : ''} scoring above 85% with immediate interview viability.`
            : ' the applicant pool shows moderate skill alignment with room for targeted technical probes.'}
          {seniorPct > 40 && ` The pool is senior-heavy (${seniorPct}% with 6+ years experience), indicating strong domain leadership readiness.`}
          {topMissingSkills.length > 0 && ` Common gap areas detected across multiple resumes include: ${topMissingSkills.map(([s]) => s).join(', ')}.`}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/10">
          <div>
            <span className="text-[10px] text-indigo-200 uppercase font-bold block">Avg Match Score</span>
            <span className="text-xl sm:text-2xl font-black">{stats?.averageScore || 0}%</span>
          </div>
          <div>
            <span className="text-[10px] text-indigo-200 uppercase font-bold block">Avg Hire Probability</span>
            <span className="text-xl sm:text-2xl font-black">{avgHireProb}%</span>
          </div>
          <div>
            <span className="text-[10px] text-indigo-200 uppercase font-bold block">Top Tier Candidates</span>
            <span className="text-xl sm:text-2xl font-black text-amber-300">{topTierCount}</span>
          </div>
          <div>
            <span className="text-[10px] text-indigo-200 uppercase font-bold block">Seniority Index</span>
            <span className="text-xl sm:text-2xl font-black">{seniorPct}% Senior</span>
          </div>
        </div>
      </div>

      {/* Structured Actionable Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Pipeline Readiness */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
          <div className="flex items-center space-x-2 text-xs font-black text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="uppercase tracking-wider">Pipeline Readiness</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {stats?.relevantCandidates || 0} out of {stats?.totalCandidates || 0} candidates meet or exceed the qualification threshold ({qualifiedRate}%).
            {(stats?.averageScore || 0) >= 75 ? ' High correlation with core engineering deliverables.' : ' May require broadening requirements.'}
          </p>
        </div>

        {/* Card 2: Skill Gaps Alert */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
          <div className="flex items-center space-x-2 text-xs font-black text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="uppercase tracking-wider">Candidate Gaps Alert</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {topMissingSkills.length > 0 ? (
              <>Frequent missing skills across applicants: <strong className="text-slate-800 dark:text-slate-100">{topMissingSkills.map(([s]) => s).join(', ')}</strong>. Focus interview rounds on these areas.</>
            ) : (
              <>No persistent skill gaps identified across candidate submissions.</>
            )}
          </p>
        </div>

        {/* Card 3: Hiring Recommendation */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
          <div className="flex items-center space-x-2 text-xs font-black text-indigo-700 dark:text-indigo-400">
            <Zap className="h-4 w-4 text-indigo-500" />
            <span className="uppercase tracking-wider">Recommended Next Step</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Send introductory screening invitations to the top {Math.max(1, topTierCount)} ranked profiles within 48 hours to minimize talent drop-off.
          </p>
        </div>
      </div>
    </div>
  );
}