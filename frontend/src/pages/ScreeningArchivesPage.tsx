import { useState, useEffect } from 'react';
import {
  FolderOpen, Search, Calendar, Eye, ArrowRight, Trash2,
  PlusCircle, Briefcase, ChevronDown, ChevronUp, FilePlus2,
  RefreshCw, Users, TrendingUp, Clock, CheckCircle2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ScreeningArchiveService, ScreeningSession } from '../services/screeningArchiveService';

interface ScreeningArchivesPageProps {
  /** Load a past session into the leaderboard */
  onLoadSession: (session: ScreeningSession) => void;
  /** Pre-fill the JD and mark that new resumes should be appended to this session */
  onAppendToSession: (session: ScreeningSession) => void;
}

export function ScreeningArchivesPage({ onLoadSession, onAppendToSession }: ScreeningArchivesPageProps) {
  const [sessions, setSessions] = useState<ScreeningSession[]>([]);
  const [search, setSearch] = useState('');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    // 1. Instant display from local storage
    setSessions(ScreeningArchiveService.getAllSessions());

    // 2. Fetch latest from MongoDB
    try {
      const dbSessions = await ScreeningArchiveService.fetchSessionsFromDB();
      if (dbSessions && dbSessions.length > 0) {
        setSessions(dbSessions);
      }
    } catch (e) {
      console.warn('DB session fetch error:', e);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to permanently delete this screening record?')) {
      ScreeningArchiveService.deleteSession(id);
      loadSessions();
    }
  };

  const handleOpenLeaderboard = (session: ScreeningSession) => {
    onLoadSession(session);
    navigate('/results');
  };

  const handleAddMoreResumes = (session: ScreeningSession, e: React.MouseEvent) => {
    e.stopPropagation();
    onAppendToSession(session);
    navigate('/upload');
  };

  const filteredSessions = sessions.filter(session => {
    const q = search.toLowerCase();
    return (
      session.jobTitle.toLowerCase().includes(q) ||
      session.jobDescription.toLowerCase().includes(q) ||
      session.topCandidateName.toLowerCase().includes(q) ||
      (session.tags || []).some(t => t.toLowerCase().includes(q)) ||
      session.candidates.some(c => c.candidate_name.toLowerCase().includes(q))
    );
  });

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fade-in transition-colors">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center flex-wrap gap-2 mb-1.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Screening Archives & Evaluation Records
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-black bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-sm">
              {sessions.length} SESSIONS
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Complete audit trail of past screening batches. Reload any session into the leaderboard or add more resumes to an existing job description.
          </p>
        </div>
        <Link
          to="/upload"
          className="flex-shrink-0 inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02]"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Screening Run</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by job title, candidate name, or skill..."
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            {filteredSessions.length} of {sessions.length} sessions
          </span>
          <button
            onClick={loadSessions}
            className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Sessions */}
      {filteredSessions.length > 0 ? (
        <div className="space-y-4">
          {filteredSessions.map(session => {
            const isExpanded = expandedSessionId === session.id;
            const updatedLabel = session.appendCount && session.appendCount > 0
              ? `Updated ${session.appendCount}x with new resumes`
              : null;

            return (
              <div
                key={session.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">

                    {/* Left: Job Info */}
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/60 flex-shrink-0">
                          <Briefcase className="w-4 h-4" />
                        </span>
                        <h3
                          onClick={() => handleOpenLeaderboard(session)}
                          className="text-base sm:text-lg font-black text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer truncate max-w-xl"
                        >
                          {session.jobTitle}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex-shrink-0">
                          {session.totalCandidates} Candidates
                        </span>
                        {updatedLabel && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex-shrink-0 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {updatedLabel}
                          </span>
                        )}
                      </div>

                      {/* Meta Row */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                          {session.timestamp}
                        </span>
                        {session.lastUpdatedAt && session.lastUpdatedAt !== session.createdAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            Last updated: {ScreeningArchiveService.formatTimestamp(new Date(session.lastUpdatedAt))}
                          </span>
                        )}
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:inline">Avg Score: <strong className="text-slate-800 dark:text-slate-200">{session.averageScore}%</strong></span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                          Top: <strong className="text-emerald-600 dark:text-emerald-400">{session.topCandidateName} ({session.topScore}%)</strong>
                        </span>
                      </div>

                      {/* Skill Tags */}
                      {session.tags && session.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {session.tags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/60">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex items-center gap-2 w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800 flex-shrink-0 flex-wrap">

                      {/* Roster expand */}
                      <button
                        onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Roster ({session.candidates.length})</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {/* ★ Add More Resumes */}
                      <button
                        onClick={e => handleAddMoreResumes(session, e)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/80 transition-all hover:scale-[1.02]"
                        title="Upload more resumes for this same job description and merge results"
                      >
                        <FilePlus2 className="w-3.5 h-3.5" />
                        <span>Add More Resumes</span>
                      </button>

                      {/* Open Leaderboard */}
                      <button
                        onClick={() => handleOpenLeaderboard(session)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-500/20 transition-all hover:scale-[1.02]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Open Leaderboard</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={e => handleDelete(session.id, e)}
                        className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
                        title="Delete this session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Collapsible Candidate Roster */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3 bg-slate-50/50 dark:bg-slate-850/30">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                        Ranked Candidates in this Batch
                      </span>
                      <button
                        onClick={e => handleAddMoreResumes(session, e)}
                        className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        <FilePlus2 className="w-3.5 h-3.5" />
                        Add more resumes to this JD
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {[...session.candidates]
                        .sort((a, b) => b.match_score - a.match_score)
                        .map((cand, idx) => (
                          <div
                            key={cand.id || idx}
                            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center flex-shrink-0 ${
                                idx === 0 ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' :
                                idx === 1 ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300' :
                                idx === 2 ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300' :
                                'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              }`}>
                                #{idx + 1}
                              </span>
                              <div className="min-w-0">
                                <div className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                                  {cand.candidate_name}
                                </div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                  {cand.experience_years}y exp · {cand.matched_skills.length} matched
                                </div>
                              </div>
                            </div>
                            <span className={`text-xs font-black px-2 py-0.5 rounded-md flex-shrink-0 ${
                              cand.match_score >= 85
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                : cand.match_score >= 70
                                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                            }`}>
                              {cand.match_score}%
                            </span>
                          </div>
                        ))}
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{session.candidates.length} total · {session.relevantCandidates} relevant</span>
                      <button
                        onClick={() => handleOpenLeaderboard(session)}
                        className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        Open full leaderboard & dossiers <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="py-20 text-center rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto">
            <FolderOpen className="h-8 w-8 text-slate-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              {search ? 'No matching sessions found' : 'No screening records yet'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {search
                ? 'Try adjusting your search query.'
                : 'Every time you analyze resumes, the session is automatically saved here for future reference.'}
            </p>
          </div>
          {!search && (
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <PlusCircle className="h-4 w-4" />
              Run Your First Screening
            </Link>
          )}
        </div>
      )}
    </main>
  );
}
