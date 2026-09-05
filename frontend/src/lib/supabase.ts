import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      job_descriptions: {
        Row: {
          id: string;
          title: string;
          description: string;
          required_skills: string[];
          experience_level: string;
          salary_range: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          required_skills: string[];
          experience_level: string;
          salary_range: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          required_skills?: string[];
          experience_level?: string;
          salary_range?: string;
          updated_at?: string;
        };
      };
      candidates: {
        Row: {
          id: string;
          candidate_name: string;
          contact_info: any;
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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          candidate_name: string;
          contact_info: any;
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
        };
        Update: {
          id?: string;
          candidate_name?: string;
          contact_info?: any;
          skills?: string[];
          experience_years?: number;
          education?: string;
          certifications?: string[];
          notable_companies?: string[];
          summary?: string;
          matched_skills?: string[];
          missing_skills?: string[];
          match_score?: number;
          recommendation?: string;
          is_relevant?: boolean;
          issues_detected?: string[];
          strengths?: string[];
          weaknesses?: string[];
          interview_questions?: string[];
          salary_range?: string;
          hire_probability?: number;
          experience_level?: string;
          skill_diversity?: number;
          company_prestige?: number;
          updated_at?: string;
        };
      };
      analysis_results: {
        Row: {
          id: string;
          job_description_id: string;
          candidate_ids: string[];
          total_candidates: number;
          relevant_candidates: number;
          average_score: number;
          top_candidates: number;
          analysis_date: string;
          processing_time: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          job_description_id: string;
          candidate_ids: string[];
          total_candidates: number;
          relevant_candidates: number;
          average_score: number;
          top_candidates: number;
          analysis_date: string;
          processing_time: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          job_description_id?: string;
          candidate_ids?: string[];
          total_candidates?: number;
          relevant_candidates?: number;
          average_score?: number;
          top_candidates?: number;
          analysis_date?: string;
          processing_time?: number;
          updated_at?: string;
        };
      };
    };
  };
}