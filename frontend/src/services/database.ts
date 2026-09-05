import { Candidate, JobDescription, AnalysisResult } from '../types';
import { API_BASE } from './apiConfig';

// Fallback in-memory / localStorage keys when running standalone
const STORAGE_KEYS = {
  JOBS: 'resumeranker_jobs',
  CANDIDATES: 'resumeranker_candidates',
  ANALYSIS: 'resumeranker_analysis',
};

export class DatabaseService {
  private static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(options?.headers || {}),
        },
        ...options,
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data as T;
    } catch (networkError) {
      console.warn(`[MongoDB API] Request to ${endpoint} failed, checking local storage fallback:`, networkError);
      throw networkError;
    }
  }

  // ── Job Descriptions ───────────────────────────────────────────────────────

  static async createJobDescription(
    jobDesc: Omit<JobDescription, 'id' | 'created_at' | 'updated_at'>
  ): Promise<JobDescription> {
    try {
      return await this.request<JobDescription>('/jobs', {
        method: 'POST',
        body: JSON.stringify(jobDesc),
      });
    } catch {
      // Local fallback
      const newJob: JobDescription = {
        ...jobDesc,
        id: `job_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const existing = this.getLocal<JobDescription[]>(STORAGE_KEYS.JOBS, []);
      this.setLocal(STORAGE_KEYS.JOBS, [newJob, ...existing]);
      return newJob;
    }
  }

  static async getJobDescriptions(): Promise<JobDescription[]> {
    try {
      return await this.request<JobDescription[]>('/jobs');
    } catch {
      return this.getLocal<JobDescription[]>(STORAGE_KEYS.JOBS, []);
    }
  }

  // ── Candidates ─────────────────────────────────────────────────────────────

  static async createCandidates(
    candidates: Omit<Candidate, 'id' | 'created_at' | 'updated_at'>[]
  ): Promise<Candidate[]> {
    try {
      return await this.request<Candidate[]>('/candidates', {
        method: 'POST',
        body: JSON.stringify(candidates),
      });
    } catch {
      const saved: Candidate[] = candidates.map((c, i) => ({
        ...c,
        id: `cand_${Date.now()}_${i}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
      const existing = this.getLocal<Candidate[]>(STORAGE_KEYS.CANDIDATES, []);
      this.setLocal(STORAGE_KEYS.CANDIDATES, [...saved, ...existing]);
      return saved;
    }
  }

  static async getCandidates(limit = 100, offset = 0): Promise<Candidate[]> {
    try {
      return await this.request<Candidate[]>(`/candidates?limit=${limit}&offset=${offset}`);
    } catch {
      const all = this.getLocal<Candidate[]>(STORAGE_KEYS.CANDIDATES, []);
      return all
        .sort((a, b) => b.match_score - a.match_score)
        .slice(offset, offset + limit);
    }
  }

  static async searchCandidates(query: string, filters: any = {}): Promise<Candidate[]> {
    try {
      const params = new URLSearchParams();
      if (query) params.set('query', query);
      if (filters.experience_level) params.set('experience_level', filters.experience_level);
      if (filters.min_score) params.set('min_score', String(filters.min_score));
      if (filters.is_relevant !== undefined) params.set('is_relevant', String(filters.is_relevant));

      return await this.request<Candidate[]>(`/candidates?${params.toString()}`);
    } catch {
      const all = this.getLocal<Candidate[]>(STORAGE_KEYS.CANDIDATES, []);
      return all.filter((c) => {
        const matchesQuery = !query ||
          c.candidate_name.toLowerCase().includes(query.toLowerCase()) ||
          c.summary.toLowerCase().includes(query.toLowerCase());
        const matchesScore = !filters.min_score || c.match_score >= filters.min_score;
        const matchesRelevant = filters.is_relevant === undefined || c.is_relevant === filters.is_relevant;
        return matchesQuery && matchesScore && matchesRelevant;
      });
    }
  }

  // ── Analysis Results ───────────────────────────────────────────────────────

  static async createAnalysisResult(
    result: Omit<AnalysisResult, 'id' | 'created_at' | 'updated_at'>
  ): Promise<AnalysisResult> {
    try {
      return await this.request<AnalysisResult>('/analysis', {
        method: 'POST',
        body: JSON.stringify(result),
      });
    } catch {
      const newResult: AnalysisResult = {
        ...result,
        id: `analysis_${Date.now()}`,
      };
      const existing = this.getLocal<AnalysisResult[]>(STORAGE_KEYS.ANALYSIS, []);
      this.setLocal(STORAGE_KEYS.ANALYSIS, [newResult, ...existing]);
      return newResult;
    }
  }

  static async getAnalysisResults(): Promise<AnalysisResult[]> {
    try {
      return await this.request<AnalysisResult[]>('/analysis');
    } catch {
      return this.getLocal<AnalysisResult[]>(STORAGE_KEYS.ANALYSIS, []);
    }
  }

  static async getCandidateStats(): Promise<any> {
    try {
      return await this.request<any>('/stats');
    } catch {
      const candidates = this.getLocal<Candidate[]>(STORAGE_KEYS.CANDIDATES, []);
      if (!candidates.length) {
        return {
          totalCandidates: 0,
          relevantCandidates: 0,
          averageScore: 0,
          topCandidates: 0,
          averageExperience: 0,
          averageHireProbability: 0,
          matchRate: 0,
        };
      }
      const total = candidates.length;
      const relevant = candidates.filter((c) => c.is_relevant).length;
      const avgScore = candidates.reduce((s, c) => s + c.match_score, 0) / total;
      const top = candidates.filter((c) => c.match_score >= 80).length;
      const avgExp = candidates.reduce((s, c) => s + c.experience_years, 0) / total;

      return {
        totalCandidates: total,
        relevantCandidates: relevant,
        averageScore: Math.round(avgScore),
        topCandidates: top,
        averageExperience: Math.round(avgExp),
        averageHireProbability: 75,
        matchRate: Math.round((relevant / total) * 100),
      };
    }
  }

  // ── LocalStorage Helpers ───────────────────────────────────────────────────

  private static getLocal<T>(key: string, fallback: T): T {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : fallback;
    } catch {
      return fallback;
    }
  }

  private static setLocal<T>(key: string, val: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn('Storage write failed', e);
    }
  }
}