import { useState } from 'react';
import { 
  BarChart3, PieChart, TrendingUp, Activity, CheckCircle2, 
  AlertTriangle, Layers, Users, Zap, Award, Target, Sparkles, 
  ChevronRight, Filter, Eye, Briefcase
} from 'lucide-react';
import { Candidate } from '../types';

interface AnalyticsChartsProps {
  data: any;
  candidates: Candidate[];
  onSelectCandidate?: (candidate: Candidate) => void;
}

export function AnalyticsCharts({ data, candidates, onSelectCandidate }: AnalyticsChartsProps) {
  const [selectedScoreRange, setSelectedScoreRange] = useState<string | null>(null);
  const [selectedExperienceLevel, setSelectedExperienceLevel] = useState<string | null>(null);

  if (!data) return null;

  // Filter candidates based on clicked score distribution range
  const getCandidatesInRange = (range: string) => {
    if (!range) return [];
    if (range.startsWith('90')) return candidates.filter(c => c.match_score >= 90);
    if (range.startsWith('80')) return candidates.filter(c => c.match_score >= 80 && c.match_score < 90);
    if (range.startsWith('70')) return candidates.filter(c => c.match_score >= 70 && c.match_score < 80);
    if (range.startsWith('60')) return candidates.filter(c => c.match_score >= 60 && c.match_score < 70);
    if (range.startsWith('50')) return candidates.filter(c => c.match_score >= 50 && c.match_score < 60);
    return candidates.filter(c => c.match_score < 50);
  };

  const getCandidatesInExpLevel = (level: string) => {
    if (!level) return [];
    if (level.includes('0 - 2')) return candidates.filter(c => c.experience_years <= 2);
    if (level.includes('3 - 5')) return candidates.filter(c => c.experience_years >= 3 && c.experience_years <= 5);
    if (level.includes('6 - 8')) return candidates.filter(c => c.experience_years >= 6 && c.experience_years <= 8);
    return candidates.filter(c => c.experience_years >= 9);
  };

  const highlightedScoreCandidates = selectedScoreRange ? getCandidatesInRange(selectedScoreRange) : [];
  const highlightedExpCandidates = selectedExperienceLevel ? getCandidatesInExpLevel(selectedExperienceLevel) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      
      {/* Chart 1: Interactive Match Score Distribution */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                Match Score Distribution
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Click any score bucket to inspect matching applicants
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
            Interactive Histogram
          </span>
        </div>

        <div className="space-y-3 pt-1">
          {data.scoreDistribution.map((item: any, index: number) => {
            const total = candidates.length || 1;
            const pctOfPool = Math.round((item.count / total) * 100);
            const isSelected = selectedScoreRange === item.range;

            const getBarColor = (range: string) => {
              if (range.startsWith('90')) return 'bg-emerald-500 shadow-emerald-500/20';
              if (range.startsWith('80')) return 'bg-indigo-500 shadow-indigo-500/20';
              if (range.startsWith('70')) return 'bg-blue-500 shadow-blue-500/20';
              if (range.startsWith('60')) return 'bg-amber-500 shadow-amber-500/20';
              return 'bg-rose-500 shadow-rose-500/20';
            };

            return (
              <div 
                key={index} 
                onClick={() => setSelectedScoreRange(isSelected ? null : item.range)}
                className={`p-2.5 rounded-2xl cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-indigo-50/80 dark:bg-indigo-950/40 ring-2 ring-indigo-500/30' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-850/60'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-slate-900 dark:text-slate-100">{item.range}</span>
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">({item.label})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{pctOfPool}%</span>
                    <span className="font-black text-slate-900 dark:text-white px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px]">
                      {item.count} {item.count === 1 ? 'applicant' : 'applicants'}
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ${getBarColor(item.range)}`}
                    style={{ width: `${Math.max(pctOfPool, item.count > 0 ? 8 : 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Bucket Candidate Drawer */}
        {selectedScoreRange && highlightedScoreCandidates.length > 0 && (
          <div className="mt-3 p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 space-y-2 animate-scale-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                Candidates in {selectedScoreRange} bracket:
              </span>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                {highlightedScoreCandidates.length} found
              </span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {highlightedScoreCandidates.map(cand => (
                <button
                  key={cand.id}
                  onClick={() => onSelectCandidate && onSelectCandidate(cand)}
                  className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-indigo-500 flex items-center space-x-1.5 shadow-sm"
                >
                  <span>{cand.candidate_name}</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-black">({cand.match_score}%)</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chart 2: Seniority & Experience Breakdown */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                Seniority & Tenure Spread
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Distribution of industry experience across applicants
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-800">
            Career Levels
          </span>
        </div>

        <div className="space-y-3 pt-1">
          {Object.entries(data?.experienceBreakdown || {}).map(([level, count]: [string, any], idx) => {
            const total = Object.values(data?.experienceBreakdown || {}).reduce((a: any, b: any) => a + b, 0) as number;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            const isSelected = selectedExperienceLevel === level;

            return (
              <div 
                key={idx}
                onClick={() => setSelectedExperienceLevel(isSelected ? null : level)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700 ring-2 ring-purple-500/30'
                    : 'bg-slate-50 dark:bg-slate-850/60 border-slate-200/80 dark:border-slate-800 hover:border-purple-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-purple-500" />
                    <span>{level}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-28 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-purple-600 dark:bg-purple-400 h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{pct}% of pool</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-black text-purple-600 dark:text-purple-400">{count}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">candidates</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Exp Bucket Candidates */}
        {selectedExperienceLevel && highlightedExpCandidates.length > 0 && (
          <div className="mt-3 p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/60 space-y-2 animate-scale-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-900 dark:text-purple-200">
                Applicants in {selectedExperienceLevel}:
              </span>
              <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
                {highlightedExpCandidates.length} found
              </span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {highlightedExpCandidates.map(cand => (
                <button
                  key={cand.id}
                  onClick={() => onSelectCandidate && onSelectCandidate(cand)}
                  className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-purple-500 flex items-center space-x-1.5 shadow-sm"
                >
                  <span>{cand.candidate_name}</span>
                  <span className="text-purple-600 dark:text-purple-400 font-black">({cand.experience_years} yrs)</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chart 3: Skills Frequency & Demand Heatmap */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 lg:col-span-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                Skill Supply & Frequency Heatmap
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Most prominent technical competencies extracted across uploaded candidate profiles
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full self-start sm:self-auto">
            AI Extracted Competencies
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-2">
          {(data?.skillsAnalysis?.topSkills || []).map(([skill, count]: [string, number], i: number) => {
            const total = candidates.length || 1;
            const pct = Math.round((count / total) * 100);

            return (
              <div 
                key={i} 
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850/70 border border-slate-200/80 dark:border-slate-800 space-y-2 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-slate-100 truncate pr-1">
                    {skill}
                  </span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                    {count}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold block text-right">
                    {pct}% of pool
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}