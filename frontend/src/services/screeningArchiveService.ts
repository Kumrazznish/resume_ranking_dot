import { Candidate } from '../types';
import { API_BASE } from './apiConfig';

export interface ScreeningSession {
  id: string;
  jobTitle: string;
  jobDescription: string;
  timestamp: string;
  createdAt: number;
  lastUpdatedAt?: number;
  totalCandidates: number;
  relevantCandidates: number;
  averageScore: number;
  topScore: number;
  topCandidateName: string;
  candidates: Candidate[];
  recruiterEmail?: string;
  tags?: string[];
  appendCount?: number;
}

const STORAGE_KEY = 'resumeranker_screening_sessions_v1';

export class ScreeningArchiveService {
  /**
   * Get all cached sessions from localStorage (instant synchronous read)
   */
  static getAllSessions(): ScreeningSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return (parsed as ScreeningSession[]).filter(
          s => s && s.id && !s.id.startsWith('session_sample_')
        );
      }
    } catch (e) {
      console.warn('Error reading screening sessions from localStorage:', e);
    }
    return [];
  }

  /**
   * Fetch all screening sessions directly from MongoDB with automatic bidirectional sync:
   * 1. Pulls all saved records from MongoDB.
   * 2. If the local browser has any unsynced sessions, uploads them to MongoDB.
   * 3. Returns the unified, complete list sorted by newest first.
   */
  static async fetchSessionsFromDB(): Promise<ScreeningSession[]> {
    const localSessions = this.getAllSessions();

    try {
      const res = await fetch(`${API_BASE}/analysis/sessions`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const dbSessions: ScreeningSession[] = json.data.filter(
            (s: any) => s && s.id && !s.id.startsWith('session_sample_')
          );

          // Map by session ID
          const sessionMap = new Map<string, ScreeningSession>();
          dbSessions.forEach(s => sessionMap.set(s.id, s));

          // Check if any local sessions are missing from MongoDB, and upload them
          for (const localS of localSessions) {
            if (!sessionMap.has(localS.id)) {
              sessionMap.set(localS.id, localS);
              // Push to MongoDB in background
              this.syncSessionToDB(localS).catch(() => {});
            }
          }

          const unified = Array.from(sessionMap.values()).sort(
            (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
          );

          // Cache unified list
          localStorage.setItem(STORAGE_KEY, JSON.stringify(unified));
          return unified;
        }
      }
    } catch (err) {
      console.warn('[ScreeningArchiveService] MongoDB fetch error, using local state:', err);
    }

    return localSessions;
  }

  /**
   * Save a brand-new screening session to MongoDB & local cache
   */
  static saveSession(
    jobDescription: string,
    candidates: Candidate[],
    recruiterEmail = 'recruiter@company.org'
  ): ScreeningSession {
    if (!candidates || candidates.length === 0) {
      throw new Error('Cannot save empty screening session');
    }

    const jobTitle = this.extractJobTitle(jobDescription);
    const sorted = [...candidates].sort((a, b) => b.match_score - a.match_score);
    const topCandidate = sorted[0];
    const avgScore = Math.round(
      candidates.reduce((acc, c) => acc + c.match_score, 0) / candidates.length
    );
    const relevantCount = candidates.filter(c => c.is_relevant).length;

    const newSession: ScreeningSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      jobTitle,
      jobDescription,
      timestamp: this.formatTimestamp(new Date()),
      createdAt: Date.now(),
      lastUpdatedAt: Date.now(),
      totalCandidates: candidates.length,
      relevantCandidates: relevantCount,
      averageScore: avgScore,
      topScore: topCandidate ? topCandidate.match_score : 0,
      topCandidateName: topCandidate ? topCandidate.candidate_name : 'N/A',
      candidates,
      recruiterEmail,
      tags: this.extractKeySkillsFromCandidates(candidates),
      appendCount: 0,
    };

    // 1. Update localStorage immediately for zero latency
    const existing = this.getAllSessions().filter(s => s.id !== newSession.id);
    const updated = [newSession, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // 2. Persist to MongoDB
    this.syncSessionToDB(newSession);

    return newSession;
  }

  /**
   * Append new candidates to an existing session in MongoDB & local cache
   */
  static appendCandidatesToSession(
    sessionId: string,
    newCandidates: Candidate[]
  ): ScreeningSession | null {
    const sessions = this.getAllSessions();
    const idx = sessions.findIndex(s => s.id === sessionId);

    if (idx === -1) return null;

    const session = sessions[idx];

    // Merge: new candidates override existing ones with the same name
    const existingMap = new Map<string, Candidate>(
      session.candidates.map(c => [c.candidate_name.toLowerCase().trim(), c])
    );
    newCandidates.forEach(c => {
      existingMap.set(c.candidate_name.toLowerCase().trim(), c);
    });

    const mergedCandidates = Array.from(existingMap.values());
    const sorted = [...mergedCandidates].sort((a, b) => b.match_score - a.match_score);
    const topCandidate = sorted[0];
    const avgScore = Math.round(
      mergedCandidates.reduce((acc, c) => acc + c.match_score, 0) / mergedCandidates.length
    );
    const relevantCount = mergedCandidates.filter(c => c.is_relevant).length;

    const updatedSession: ScreeningSession = {
      ...session,
      candidates: mergedCandidates,
      totalCandidates: mergedCandidates.length,
      relevantCandidates: relevantCount,
      averageScore: avgScore,
      topScore: topCandidate ? topCandidate.match_score : session.topScore,
      topCandidateName: topCandidate ? topCandidate.candidate_name : session.topCandidateName,
      tags: this.extractKeySkillsFromCandidates(mergedCandidates),
      lastUpdatedAt: Date.now(),
      appendCount: (session.appendCount || 0) + 1,
    };

    sessions[idx] = updatedSession;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));

    // Sync to MongoDB
    this.syncSessionToDB(updatedSession);

    return updatedSession;
  }

  /**
   * Delete a session by ID from MongoDB and local storage
   */
  static deleteSession(sessionId: string): void {
    const sessions = this.getAllSessions().filter(s => s.id !== sessionId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));

    // Delete from MongoDB
    try {
      fetch(`${API_BASE}/analysis/sessions/${sessionId}`, { method: 'DELETE' }).catch(() => {});
    } catch (e) {
      console.warn('MongoDB session delete error:', e);
    }
  }

  /**
   * Get a session by ID
   */
  static getSessionById(sessionId: string): ScreeningSession | null {
    return this.getAllSessions().find(s => s.id === sessionId) || null;
  }

  /**
   * Helper: Sync single session to MongoDB
   */
  private static async syncSessionToDB(session: ScreeningSession): Promise<void> {
    try {
      await fetch(`${API_BASE}/analysis/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session)
      });
    } catch (err) {
      console.warn('[ScreeningArchiveService] MongoDB sync failure:', err);
    }
  }

  /**
   * Helper: Format timestamp
   */
  static formatTimestamp(date: Date): string {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Helper: Extract job title from JD text
   */
  private static extractJobTitle(jd: string): string {
    const lines = jd.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length > 0) {
      const firstLine = lines[0].replace(/^(Job Title|Position|Role|Title|Role Overview):?\s*/i, '');
      if (firstLine.length > 3 && firstLine.length < 80) {
        return firstLine;
      }
    }
    if (/soc|security analyst|siem|cyber/i.test(jd)) return 'Security Operations Center (SOC) Analyst';
    if (/react|frontend|typescript/i.test(jd)) return 'Senior Frontend / React Engineer';
    if (/full.?stack|\.net|node/i.test(jd)) return 'Senior Full Stack Software Engineer';
    if (/python|machine learning|ai|llm/i.test(jd)) return 'AI / Machine Learning Engineer';
    if (/devops|cloud|aws|kubernetes/i.test(jd)) return 'Cloud DevOps Infrastructure Lead';
    return 'Software Engineering Role';
  }

  /**
   * Helper: Extract top common matched skill tags across all candidates
   */
  private static extractKeySkillsFromCandidates(candidates: Candidate[]): string[] {
    const skillsMap: Record<string, number> = {};
    candidates.forEach(c => {
      (c.matched_skills || []).forEach(s => {
        skillsMap[s] = (skillsMap[s] || 0) + 1;
      });
    });
    return Object.entries(skillsMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([s]) => s);
  }
}
