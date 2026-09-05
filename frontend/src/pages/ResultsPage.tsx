import { useState } from 'react';
import { 
  Search, Filter, Download, Target, Users, TrendingUp, CheckCircle2, 
  Award, Zap, LayoutGrid, Table, List, Sparkles, ArrowRight, ShieldCheck, 
  Building2, Briefcase, Eye, Send, SlidersHorizontal, CheckSquare, 
  Square, Scale, ArrowUpDown, RefreshCw, ChevronRight, Star, Trophy
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Candidate } from '../types';
import { CandidateCard } from '../components/CandidateCard';
import { CandidateModal } from '../components/CandidateModal';
import { CandidateCompareModal } from '../components/CandidateCompareModal';
import { EmailModal } from '../components/EmailModal';
import { ExportService } from '../services/exportService';

interface ResultsPageProps {
  candidates: Candidate[];
  stats: {
    totalCandidates: number;
    relevantCandidates: number;
    averageScore: number;
    topCandidates: number;
  };
}

export function ResultsPage({ candidates, stats }: ResultsPageProps) {
  const [filters, setFilters] = useState({
    sort: 'score-desc',
    relevance: 'all',
    search: '',
    experience: 'all'
  });
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [emailCandidate, setEmailCandidate] = useState<Candidate | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'compact'>('grid');
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Filter and sort candidates
  const filteredCandidates = candidates
    .filter(candidate => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          candidate.candidate_name.toLowerCase().includes(searchLower) ||
          candidate.skills.some(skill => skill.toLowerCase().includes(searchLower)) ||
          (candidate.summary && candidate.summary.toLowerCase().includes(searchLower)) ||
          (candidate.notable_companies && candidate.notable_companies.some(c => c.toLowerCase().includes(searchLower)));
        if (!matchesSearch) return false;
      }

      // Relevance filter
      if (filters.relevance !== 'all') {
        switch (filters.relevance) {
          case 'relevant':
            if (!candidate.is_relevant) return false;
            break;
          case 'top':
            if (candidate.match_score < 90) return false;
            break;
          case 'strong':
            if (candidate.match_score < 75 || candidate.match_score >= 90) return false;
            break;
          case 'moderate':
            if (candidate.match_score < 50 || candidate.match_score >= 75) return false;
            break;
        }
      }

      // Experience filter
      if (filters.experience !== 'all') {
        switch (filters.experience) {
          case 'entry':
            if (candidate.experience_years > 2) return false;
            break;
          case 'mid':
            if (candidate.experience_years < 3 || candidate.experience_years > 5) return false;
            break;
          case 'senior':
            if (candidate.experience_years < 6 || candidate.experience_years > 8) return false;
            break;
          case 'lead':
            if (candidate.experience_years < 9) return false;
            break;
        }
      }

      return true;
    })
    .sort((a, b) => {
      switch (filters.sort) {
        case 'score-desc':
          return b.match_score - a.match_score;
        case 'score-asc':
          return a.match_score - b.match_score;
        case 'hire-prob-desc': {
          const probA = a.hire_probability || (a.match_score / 100);
          const probB = b.hire_probability || (b.match_score / 100);
          return probB - probA;
        }
        case 'name-asc':
          return a.candidate_name.localeCompare(b.candidate_name);
        case 'experience-desc':
          return b.experience_years - a.experience_years;
        default:
          return 0;
      }
    });

  const handleExport = async (format: string) => {
    setIsExporting(true);
    try {
      await ExportService.exportCandidates(filteredCandidates, format, stats);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const toggleCompareCandidate = (id: string) => {
    setCompareIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        if (prev.length >= 4) {
          alert('You can compare up to 4 candidates simultaneously.');
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  const selectedForComparison = candidates.filter(c => compareIds.includes(c.id));

  const qualifiedRate = stats.totalCandidates > 0 ? Math.round((stats.relevantCandidates / stats.totalCandidates) * 100) : 0;
  const topTierCount = candidates.filter(c => c.match_score >= 85).length;

  if (candidates.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <Target className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Active Screening Run Found</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            Upload candidate resumes in the Screen Resumes workspace to generate real-time AI leaderboards and match scores.
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Zap className="h-4 w-4" />
            <span>Go to Screen Resumes Workspace</span>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in transition-colors">
      
      {/* Top Header & Export Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2.5 mb-1.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Candidate Leaderboard & Rankings
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-black bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-sm">
              {candidates.length} CANDIDATES
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Semantic match scoring powered by Gemini 2.0 Flash across skill coverage, seniority depth, and requirement fit.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Compare Button */}
          {compareIds.length > 0 && (
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all animate-scale-in"
            >
              <Scale className="h-3.5 w-3.5 text-indigo-600" />
              <span>Compare Selected ({compareIds.length})</span>
            </button>
          )}

          {/* Export Dropdown */}
          <div className="relative group">
            <button
              disabled={isExporting}
              className="inline-flex items-center space-x-2 px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Download className="h-3.5 w-3.5 text-indigo-500" />
              <span>{isExporting ? 'Exporting...' : 'Export Results'}</span>
            </button>

            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20 text-xs">
              <button
                onClick={() => handleExport('csv')}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center justify-between"
              >
                <span>Export CSV / Excel</span>
                <span className="text-[10px] text-slate-400">.csv</span>
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center justify-between"
              >
                <span>Executive Report (PDF)</span>
                <span className="text-[10px] text-slate-400">.pdf</span>
              </button>
              <button
                onClick={() => handleExport('json')}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center justify-between"
              >
                <span>Raw Candidate JSON</span>
                <span className="text-[10px] text-slate-400">.json</span>
              </button>
            </div>
          </div>

          <Link
            to="/analytics"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-500/20 transition-all hover:scale-[1.02]"
          >
            <span>Talent Analytics</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Dashboard Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Evaluated</span>
            <Users className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {stats.totalCandidates}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">100% processed</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Average Match</span>
            <Target className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {stats.averageScore}%
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Candidate pool average</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Top Tier Matches</span>
            <Award className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
            {topTierCount}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Scored ≥ 85% match</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Qualification Rate</span>
            <CheckCircle2 className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
            {qualifiedRate}%
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{stats.relevantCandidates} meet threshold</span>
        </div>
      </div>

      {/* Interactive Controls Bar: View Mode Switcher, Search, Sort & Tier Filters */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        {/* Top Control Line: Search + View Modes */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search candidate name, skill, company, or keyword..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
            />
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center justify-between sm:justify-end space-x-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 hidden sm:inline">View Mode:</span>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Grid Card View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>

              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Recruiter Data Table View"
              >
                <Table className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>

              <button
                onClick={() => setViewMode('compact')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'compact'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Compact List View"
              >
                <List className="w-3.5 h-3.5" />
                <span>Compact</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills & Sorting */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          {/* Relevance & Match Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 mr-1">Match Tier:</span>
            {[
              { id: 'all', label: 'All Candidates' },
              { id: 'top', label: 'Top Tier (90%+)' },
              { id: 'strong', label: 'Strong (75-89%)' },
              { id: 'moderate', label: 'Moderate (50-74%)' },
            ].map((rf) => (
              <button
                key={rf.id}
                onClick={() => setFilters({ ...filters, relevance: rf.id })}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                  filters.relevance === rf.id
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {rf.label}
              </button>
            ))}
          </div>

          {/* Experience Filter & Sort Select */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-slate-400">Experience:</span>
              <select
                value={filters.experience}
                onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
                className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
              >
                <option value="all">All Levels</option>
                <option value="entry">Entry Level (0-2 yrs)</option>
                <option value="mid">Mid Level (3-5 yrs)</option>
                <option value="senior">Senior Level (6-8 yrs)</option>
                <option value="lead">Lead/Principal (9+ yrs)</option>
              </select>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-slate-400">Sort By:</span>
              <select
                value={filters.sort}
                onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
              >
                <option value="score-desc">Match Score (High to Low)</option>
                <option value="score-asc">Match Score (Low to High)</option>
                <option value="hire-prob-desc">Hire Probability (High to Low)</option>
                <option value="experience-desc">Experience Years (High to Low)</option>
                <option value="name-asc">Candidate Name (A to Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* RESULTS DISPLAY: GRID, TABLE, OR COMPACT VIEW */}
      {filteredCandidates.length > 0 ? (
        <>
          {/* VIEW 1: GRID VIEW */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 animate-fade-in">
              {filteredCandidates.map((candidate, index) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  onViewDetails={() => setSelectedCandidate(candidate)}
                  onSendEmail={() => setEmailCandidate(candidate)}
                  index={index}
                  isSelectedForCompare={compareIds.includes(candidate.id)}
                  onToggleCompare={() => toggleCompareCandidate(candidate.id)}
                />
              ))}
            </div>
          )}

          {/* VIEW 2: DATA TABLE VIEW */}
          {viewMode === 'table' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-fade-in">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[850px]">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-850/50 text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4 w-12 text-center">Rank</th>
                      <th className="py-3.5 px-4">Candidate</th>
                      <th className="py-3.5 px-4">Match Score</th>
                      <th className="py-3.5 px-4">Experience & Company</th>
                      <th className="py-3.5 px-4">Key Skills</th>
                      <th className="py-3.5 px-4 text-center">Hire Prob</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {filteredCandidates.map((candidate, index) => {
                      const hireProb = Math.round((candidate.hire_probability || (candidate.match_score / 100)) * 100);
                      const isSelected = compareIds.includes(candidate.id);

                      return (
                        <tr 
                          key={candidate.id}
                          className={`hover:bg-slate-50/80 dark:hover:bg-slate-850/50 transition-colors ${
                            isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                          }`}
                        >
                          {/* Rank */}
                          <td className="py-4 px-4 text-center">
                            <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold text-xs inline-flex items-center justify-center">
                              #{index + 1}
                            </span>
                          </td>

                          {/* Candidate Info */}
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-800 dark:text-slate-200 text-xs">
                                {candidate.candidate_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 transition-colors cursor-pointer" onClick={() => setSelectedCandidate(candidate)}>
                                  {candidate.candidate_name}
                                </div>
                                <div className="text-[11px] text-slate-400 truncate max-w-[160px]">
                                  {candidate.contact_info?.email || 'No email specified'}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Match Score */}
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <span className="font-black text-sm text-indigo-600 dark:text-indigo-400 w-9">
                                {candidate.match_score}%
                              </span>
                              <div className="w-20 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    candidate.match_score >= 90 ? 'bg-emerald-500' :
                                    candidate.match_score >= 75 ? 'bg-indigo-500' :
                                    candidate.match_score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                                  }`} 
                                  style={{ width: `${candidate.match_score}%` }} 
                                />
                              </div>
                            </div>
                          </td>

                          {/* Experience & Company */}
                          <td className="py-4 px-4">
                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                              {candidate.experience_years} Years Exp
                            </div>
                            {candidate.notable_companies && candidate.notable_companies.length > 0 && (
                              <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                <Building2 className="w-3 h-3 text-indigo-500" />
                                <span className="truncate max-w-[140px]">{candidate.notable_companies[0]}</span>
                              </div>
                            )}
                          </td>

                          {/* Key Skills */}
                          <td className="py-4 px-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {candidate.matched_skills.slice(0, 3).map((skill) => (
                                <span key={skill} className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                  {skill}
                                </span>
                              ))}
                              {candidate.matched_skills.length > 3 && (
                                <span className="text-[10px] text-slate-400 font-semibold self-center">
                                  +{candidate.matched_skills.length - 3}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Hire Probability */}
                          <td className="py-4 px-4 text-center">
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {hireProb}%
                            </span>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => toggleCompareCandidate(candidate.id)}
                                className={`p-1.5 rounded-lg border text-xs font-semibold ${
                                  isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                                }`}
                                title="Compare"
                              >
                                <Scale className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => setSelectedCandidate(candidate)}
                                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1 shadow-sm"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Profile</span>
                              </button>

                              {candidate.contact_info?.email && (
                                <button
                                  onClick={() => setEmailCandidate(candidate)}
                                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 border border-slate-200 dark:border-slate-700"
                                  title="Invite"
                                >
                                  <Send className="w-3.5 h-3.5 text-indigo-500" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 3: COMPACT LIST VIEW */}
          {viewMode === 'compact' && (
            <div className="space-y-2.5 animate-fade-in">
              {filteredCandidates.map((candidate, index) => {
                const hireProb = Math.round((candidate.hire_probability || (candidate.match_score / 100)) * 100);
                const isSelected = compareIds.includes(candidate.id);

                return (
                  <div
                    key={candidate.id}
                    className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm hover:shadow-md ${
                      isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                        #{index + 1}
                      </span>
                      
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 
                            className="font-extrabold text-sm text-slate-900 dark:text-white cursor-pointer hover:text-indigo-600 transition-colors truncate"
                            onClick={() => setSelectedCandidate(candidate)}
                          >
                            {candidate.candidate_name}
                          </h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            {candidate.match_score}% Match
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {candidate.experience_level} • {candidate.experience_years} yrs exp
                          {candidate.notable_companies && candidate.notable_companies.length > 0 && ` • ${candidate.notable_companies.join(', ')}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => toggleCompareCandidate(candidate.id)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        Compare
                      </button>

                      <button
                        onClick={() => setSelectedCandidate(candidate)}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1 shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Profile</span>
                      </button>

                      {candidate.contact_info?.email && (
                        <button
                          onClick={() => setEmailCandidate(candidate)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center space-x-1"
                        >
                          <Send className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Invite</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <Search className="h-8 w-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No candidates match your current filters</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try adjusting search keywords or clearing the match tier filter.
          </p>
          <button
            onClick={() => setFilters({ sort: 'score-desc', relevance: 'all', search: '', experience: 'all' })}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-indigo-700 transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Candidate Deep Dive Modal */}
      {selectedCandidate && (
        <CandidateModal
          candidate={selectedCandidate}
          isOpen={!!selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onSendEmail={(c) => {
            setSelectedCandidate(null);
            setEmailCandidate(c);
          }}
        />
      )}

      {/* Candidate Comparison Matrix Modal */}
      <CandidateCompareModal
        candidates={selectedForComparison}
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        onViewCandidate={(c) => {
          setIsCompareModalOpen(false);
          setSelectedCandidate(c);
        }}
        onInviteCandidate={(c) => {
          setIsCompareModalOpen(false);
          setEmailCandidate(c);
        }}
      />

      {/* Quick Email Modal */}
      {emailCandidate && (
        <EmailModal
          candidate={emailCandidate}
          isOpen={!!emailCandidate}
          onClose={() => setEmailCandidate(null)}
          jobTitle="Target Engineering Role"
        />
      )}
    </main>
  );
}