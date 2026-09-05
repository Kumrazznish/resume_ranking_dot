export interface ContactInfo {
  email: string;
  phone: string;
}

export interface Candidate {
  id: string;
  candidate_name: string;
  contact_info: ContactInfo;
  skills: string[];
  experience_years: number;
  education: string;
  certifications: string[];
  notable_companies: string[];
  summary: string;
  matched_skills: string[];
  missing_skills: string[];
  match_score: number;
  recommendation: string;
  is_relevant: boolean;
  issues_detected: string[];
  strengths: string[];
  weaknesses: string[];
  interview_questions: string[];
  salary_range: string;
  hire_probability: number;
  experience_level: string;
  skill_diversity: number;
  company_prestige: number;
  created_at?: string;
  updated_at?: string;
}

export interface JobDescription {
  id: string;
  title: string;
  description: string;
  required_skills: string[];
  experience_level: string;
  salary_range: string;
  created_at: string;
  updated_at: string;
}

export interface AnalysisResult {
  id: string;
  job_description_id: string;
  candidates: Candidate[];
  total_candidates: number;
  relevant_candidates: number;
  average_score: number;
  top_candidates: number;
  analysis_date: string;
  processing_time: number;
}

export interface FilterOptions {
  sort: string;
  relevance: string;
  search: string;
  experience: string;
}

export interface UploadedFile {
  id: string;
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'error';
  text: string | null;
  error: string | null;
  uploadTime: Date;
}

export interface AnalyticsData {
  totalCandidates: number;
  relevantCandidates: number;
  averageScore: number;
  topCandidates: number;
  matchRate: number;
  topSkillMatch: string;
  bestCandidate: string;
  averageExperience: number;
}