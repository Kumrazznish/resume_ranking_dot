import { useState } from 'react';
import { Search, Filter, Download, Share2, Eye } from 'lucide-react';
import { Candidate, FilterOptions } from '../types';
import { CandidateCard } from './CandidateCard';
import { CandidateModal } from './CandidateModal';
import { EmailModal } from './EmailModal';

interface ResultsSectionProps {
  candidates: Candidate[];
  isVisible: boolean;
  stats: {
    totalCandidates: number;
    relevantCandidates: number;
    averageScore: number;
    topCandidates: number;
  };
}

export function ResultsSection({ candidates, isVisible, stats }: ResultsSectionProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    sort: 'score-desc',
    relevance: 'all',
    search: '',
    experience: 'all'
  });
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [emailCandidate, setEmailCandidate] = useState<Candidate | null>(null);

  if (!isVisible) return null;

  // Filter and sort candidates
  const filteredCandidates = candidates
    .filter(candidate => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          candidate.candidate_name.toLowerCase().includes(searchLower) ||
          candidate.skills.some(skill => skill.toLowerCase().includes(searchLower)) ||
          candidate.summary.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Relevance filter
      if (filters.relevance !== 'all') {
        switch (filters.relevance) {
          case 'relevant':
            if (!candidate.is_relevant) return false;
            break;
          case 'excellent':
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
            if (candidate.experience_years < 3 || candidate.experience_years > 7) return false;
            break;
          case 'senior':
            if (candidate.experience_years < 8) return false;
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
        case 'name-asc':
          return a.candidate_name.localeCompare(b.candidate_name);
        case 'experience-desc':
          return b.experience_years - a.experience_years;
        default:
          return 0;
      }
    });

  const handleExport = (format: string) => {
    // Implementation for export functionality
    console.log(`Exporting as ${format}`);
  };

  return (
    <section id="results" className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-6 lg:space-y-0">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
            🎯 Candidate Analysis Results
          </h2>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalCandidates}</div>
            <div className="text-sm text-gray-600">Total Candidates</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.relevantCandidates}</div>
            <div className="text-sm text-gray-600">Relevant Matches</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.averageScore}%</div>
            <div className="text-sm text-gray-600">Average Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.topCandidates}</div>
            <div className="text-sm text-gray-600">Top Matches (80%+)</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 rounded-2xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
            <select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="score-desc">Score (High to Low)</option>
              <option value="score-asc">Score (Low to High)</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="experience-desc">Experience</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Relevance</label>
            <select
              value={filters.relevance}
              onChange={(e) => setFilters({ ...filters, relevance: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Candidates</option>
              <option value="relevant">Relevant Only</option>
              <option value="excellent">Excellent Match (90%+)</option>
              <option value="strong">Strong Match (75-89%)</option>
              <option value="moderate">Moderate Match (50-74%)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
            <select
              value={filters.experience}
              onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Experience Levels</option>
              <option value="entry">Entry Level (0-2 years)</option>
              <option value="mid">Mid Level (3-7 years)</option>
              <option value="senior">Senior Level (8+ years)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search by name or skills..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {filteredCandidates.map((candidate, index) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            onViewDetails={() => setSelectedCandidate(candidate)}
            onSendEmail={() => setEmailCandidate(candidate)}
            index={index}
          />
        ))}
      </div>

      {/* No Results */}
      {filteredCandidates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No candidates match your filters
          </h3>
          <p className="text-gray-500">
            Try adjusting your search criteria or filters
          </p>
        </div>
      )}

      {/* Export Options */}
      <div className="flex justify-center space-x-4 pt-8 border-t border-gray-200">
        <button
          onClick={() => handleExport('pdf')}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Export PDF</span>
        </button>
        <button
          onClick={() => handleExport('csv')}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </button>
        <button
          onClick={() => handleExport('json')}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Export JSON</span>
        </button>
        <button
          onClick={() => handleExport('share')}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Share2 className="h-4 w-4" />
          <span>Share Results</span>
        </button>
      </div>

      {/* Candidate Modal */}
      {selectedCandidate && (
        <CandidateModal
          candidate={selectedCandidate}
          isOpen={!!selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}

      {/* Email Modal */}
      {emailCandidate && (
        <EmailModal
          candidate={emailCandidate}
          isOpen={!!emailCandidate}
          onClose={() => setEmailCandidate(null)}
          jobTitle="Software Developer"
        />
      )}
    </section>
  );
}