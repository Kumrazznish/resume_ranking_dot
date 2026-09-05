export type UserRole = 'admin' | 'hr' | 'recruiter';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company: string;
  department?: string;
  resumes_analyzed_count?: number;
  emails_sent_count?: number;
  status?: 'active' | 'inactive';
}

export interface AdminOverviewStats {
  totalHrs: number;
  activeHrs: number;
  totalResumesAnalyzed: number;
  totalEmailsSent: number;
  avgCandidateMatchScore: number;
  totalHiringSessions: number;
}

export interface HRAccount {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  company: string;
  department: string;
  resumes_analyzed_count: number;
  emails_sent_count: number;
  status: 'active' | 'inactive';
  last_active: string;
  createdAt?: string;
}

export interface ActivityLogItem {
  id: string;
  _id?: string;
  user_name: string;
  user_email: string;
  action_type: 'RESUME_ANALYSIS' | 'EMAIL_SENT' | 'JOB_CREATED' | 'CANDIDATE_EXPORT' | 'LOGIN';
  details: string;
  metadata?: {
    job_title?: string;
    resume_count?: number;
    recipient_email?: string;
    candidate_name?: string;
    score?: number;
  };
  timestamp: string;
}
