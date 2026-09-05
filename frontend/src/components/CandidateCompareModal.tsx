import { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, Building2, Award, Briefcase, Sparkles, Send, Eye, Trophy, Star } from 'lucide-react';
import { Candidate } from '../types';

interface CandidateCompareModalProps {
  candidates: Candidate[];
  isOpen: boolean;
  onClose: () => void;
  onViewCandidate: (candidate: Candidate) => void;
  onInviteCandidate: (candidate: Candidate) => void;
}

export function CandidateCompareModal({
  candidates,
  isOpen,
  onClose,
  onViewCandidate,
  onInviteCandidate
}: CandidateCompareModalProps) {
  if (!isOpen || candidates.length === 0) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-6xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-4 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-indigo-50/30 dark:from-slate-900 dark:to-indigo-950/30 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Candidate Head-to-Head Comparison
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {candidates.length} Profiles
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Side-by-side evaluation of skills coverage, experience depth, hiring probability, and AI recommendations.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Comparison Matrix Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          <div className="overflow-x-auto">
            <div className="min-w-[700px] grid" style={{ gridTemplateColumns: `180px repeat(${candidates.length}, minmax(220px, 1fr))` }}>
              
              {/* Row 1: Candidate Header Cards */}
              <div className="p-3 font-bold text-xs text-slate-400 uppercase tracking-wider flex items-center">
                Candidate Profile
              </div>
              {candidates.map((c, idx) => (
                <div key={c.id} className="p-4 bg-slate-50 dark:bg-slate-850/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 m-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-6 h-6 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                        {c.match_score}% Match
                      </span>
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                      {c.candidate_name}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {c.experience_level} • {c.experience_years} yrs
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                    <button
                      onClick={() => onViewCandidate(c)}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold shadow-sm flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Profile</span>
                    </button>
                    {c.contact_info?.email && (
                      <button
                        onClick={() => onInviteCandidate(c)}
                        className="py-1.5 px-2.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-bold hover:bg-slate-300"
                        title="Send invite"
                      >
                        <Send className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Row 2: Match Score & Hire Probability */}
              <div className="p-3 font-bold text-xs text-slate-500 dark:text-slate-400 flex items-center border-t border-slate-100 dark:border-slate-800">
                Match & Probability
              </div>
              {candidates.map((c) => {
                const hireProb = Math.round((c.hire_probability || (c.match_score / 100)) * 100);
                return (
                  <div key={c.id} className="p-3 border-t border-slate-100 dark:border-slate-800 m-1 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Hire Probability:</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{hireProb}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${hireProb}%` }} />
                    </div>
                  </div>
                );
              })}

              {/* Row 3: Experience & Company Background */}
              <div className="p-3 font-bold text-xs text-slate-500 dark:text-slate-400 flex items-center border-t border-slate-100 dark:border-slate-800">
                Companies & Domain
              </div>
              {candidates.map((c) => (
                <div key={c.id} className="p-3 border-t border-slate-100 dark:border-slate-800 m-1 space-y-1.5">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {c.experience_years} Years Industry Exp
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {c.notable_companies && c.notable_companies.length > 0 ? (
                      c.notable_companies.map((comp, i) => (
                        <span key={i} className="inline-flex items-center gap-1 text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          <Building2 className="w-2.5 h-2.5 text-indigo-500" />
                          {comp}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Engineering track</span>
                    )}
                  </div>
                </div>
              ))}

              {/* Row 4: Matched Skills */}
              <div className="p-3 font-bold text-xs text-slate-500 dark:text-slate-400 flex items-center border-t border-slate-100 dark:border-slate-800">
                Matched Skills ({candidates[0]?.matched_skills.length || 0})
              </div>
              {candidates.map((c) => (
                <div key={c.id} className="p-3 border-t border-slate-100 dark:border-slate-800 m-1">
                  <div className="flex flex-wrap gap-1">
                    {c.matched_skills.map((skill) => (
                      <span key={skill} className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              {/* Row 5: Missing Skills */}
              <div className="p-3 font-bold text-xs text-slate-500 dark:text-slate-400 flex items-center border-t border-slate-100 dark:border-slate-800">
                Missing Requirements
              </div>
              {candidates.map((c) => (
                <div key={c.id} className="p-3 border-t border-slate-100 dark:border-slate-800 m-1">
                  <div className="flex flex-wrap gap-1">
                    {c.missing_skills && c.missing_skills.length > 0 ? (
                      c.missing_skills.map((skill) => (
                        <span key={skill} className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          ! {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">No critical gaps</span>
                    )}
                  </div>
                </div>
              ))}

              {/* Row 6: AI Key Strengths */}
              <div className="p-3 font-bold text-xs text-slate-500 dark:text-slate-400 flex items-center border-t border-slate-100 dark:border-slate-800">
                Core Strengths
              </div>
              {candidates.map((c) => (
                <div key={c.id} className="p-3 border-t border-slate-100 dark:border-slate-800 m-1 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  {c.strengths && c.strengths.slice(0, 2).map((s, i) => (
                    <div key={i} className="flex items-start gap-1">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              ))}

              {/* Row 7: AI Recommendation */}
              <div className="p-3 font-bold text-xs text-slate-500 dark:text-slate-400 flex items-center border-t border-slate-100 dark:border-slate-800">
                AI Recommendation
              </div>
              {candidates.map((c) => (
                <div key={c.id} className="p-3 border-t border-slate-100 dark:border-slate-800 m-1">
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 italic bg-indigo-50/50 dark:bg-indigo-950/30 p-2 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                    "{c.recommendation || c.summary}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
}
