export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string | null
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          new_value: string | null
          old_value: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
        }
      }
      applications: {
        Row: {
          applied_at: string | null
          cover_letter_text: string | null
          created_at: string | null
          cv_pdf_url: string | null
          follow_up_date: string | null
          follow_up_sent: boolean | null
          generation_model: string | null
          hiring_manager_name: string | null
          id: string
          interview_date: string | null
          job_id: string | null
          notes: string | null
          outreach_email: string | null
          outreach_linkedin: string | null
          recruiter_email: string | null
          recruiter_linkedin: string | null
          recruiter_name: string | null
          rejection_reason: string | null
          response_received_at: string | null
          salary_offered: number | null
          status: string | null
          tailored_cv_markdown: string | null
          updated_at: string | null
        }
        Insert: {
          applied_at?: string | null
          cover_letter_text?: string | null
          created_at?: string | null
          cv_pdf_url?: string | null
          follow_up_date?: string | null
          follow_up_sent?: boolean | null
          generation_model?: string | null
          hiring_manager_name?: string | null
          id?: string
          interview_date?: string | null
          job_id?: string | null
          notes?: string | null
          outreach_email?: string | null
          outreach_linkedin?: string | null
          recruiter_email?: string | null
          recruiter_linkedin?: string | null
          recruiter_name?: string | null
          rejection_reason?: string | null
          response_received_at?: string | null
          salary_offered?: number | null
          status?: string | null
          tailored_cv_markdown?: string | null
          updated_at?: string | null
        }
        Update: {
          applied_at?: string | null
          cover_letter_text?: string | null
          created_at?: string | null
          cv_pdf_url?: string | null
          follow_up_date?: string | null
          follow_up_sent?: boolean | null
          generation_model?: string | null
          hiring_manager_name?: string | null
          id?: string
          interview_date?: string | null
          job_id?: string | null
          notes?: string | null
          outreach_email?: string | null
          outreach_linkedin?: string | null
          recruiter_email?: string | null
          recruiter_linkedin?: string | null
          recruiter_name?: string | null
          rejection_reason?: string | null
          response_received_at?: string | null
          salary_offered?: number | null
          status?: string | null
          tailored_cv_markdown?: string | null
          updated_at?: string | null
        }
      }
      fetch_runs: {
        Row: {
          duration_ms: number | null
          error_message: string | null
          id: string
          jobs_duplicate: number | null
          jobs_found: number | null
          jobs_new: number | null
          ran_at: string | null
          source: string | null
          status: string | null
        }
        Insert: {
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          jobs_duplicate?: number | null
          jobs_found?: number | null
          jobs_new?: number | null
          ran_at?: string | null
          source?: string | null
          status?: string | null
        }
        Update: {
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          jobs_duplicate?: number | null
          jobs_found?: number | null
          jobs_new?: number | null
          ran_at?: string | null
          source?: string | null
          status?: string | null
        }
      }
      jobs: {
        Row: {
          company: string
          company_source: string | null
          created_at: string | null
          description_cleaned: string | null
          description_raw: string | null
          discovered_at: string | null
          disqualify_reason: string | null
          employment_type: string | null
          experience_years_required: number | null
          id: string
          is_disqualified: boolean | null
          is_duplicate: boolean | null
          location_text: string | null
          matched_keywords: string[] | null
          posted_at: string | null
          relevance_score: number | null
          remote_abroad_score: number | null
          salary_fit: boolean | null
          salary_max_usd: number | null
          salary_min_usd: number | null
          salary_text: string | null
          score_reasoning: string | null
          scored_at: string | null
          source: string | null
          spain_valencia_compatible: boolean | null
          status: string | null
          timezone_requirement: string | null
          title: string
          url: string
        }
        Insert: {
          company: string
          company_source?: string | null
          created_at?: string | null
          description_cleaned?: string | null
          description_raw?: string | null
          discovered_at?: string | null
          disqualify_reason?: string | null
          employment_type?: string | null
          experience_years_required?: number | null
          id?: string
          is_disqualified?: boolean | null
          is_duplicate?: boolean | null
          location_text?: string | null
          matched_keywords?: string[] | null
          posted_at?: string | null
          relevance_score?: number | null
          remote_abroad_score?: number | null
          salary_fit?: boolean | null
          salary_max_usd?: number | null
          salary_min_usd?: number | null
          salary_text?: string | null
          score_reasoning?: string | null
          scored_at?: string | null
          source?: string | null
          spain_valencia_compatible?: boolean | null
          status?: string | null
          timezone_requirement?: string | null
          title: string
          url: string
        }
        Update: {
          company?: string
          company_source?: string | null
          created_at?: string | null
          description_cleaned?: string | null
          description_raw?: string | null
          discovered_at?: string | null
          disqualify_reason?: string | null
          employment_type?: string | null
          experience_years_required?: number | null
          id?: string
          is_disqualified?: boolean | null
          is_duplicate?: boolean | null
          location_text?: string | null
          matched_keywords?: string[] | null
          posted_at?: string | null
          relevance_score?: number | null
          remote_abroad_score?: number | null
          salary_fit?: boolean | null
          salary_max_usd?: number | null
          salary_min_usd?: number | null
          salary_text?: string | null
          score_reasoning?: string | null
          scored_at?: string | null
          source?: string | null
          spain_valencia_compatible?: boolean | null
          status?: string | null
          timezone_requirement?: string | null
          title?: string
          url?: string
        }
      }
      master_resume: {
        Row: {
          content_markdown: string
          created_at: string | null
          id: string
          is_active: boolean | null
          label: string | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          content_markdown: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          label?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          content_markdown?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          label?: string | null
          updated_at?: string | null
          version?: number | null
        }
      }
      profile: {
        Row: {
          blocklist_keywords: string[] | null
          current_location: string | null
          email: string
          full_name: string
          id: string
          job_fetch_tags: string[] | null
          languages: string[] | null
          linkedin_url: string | null
          nationality: string | null
          remote_policy: string | null
          resume_file_url: string | null
          skills: string[] | null
          spain_remote_keywords: string[] | null
          target_location: string | null
          target_location_alt: string | null
          target_roles: string[] | null
          target_salary_usd_max: number | null
          target_salary_usd_min: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          blocklist_keywords?: string[] | null
          current_location?: string | null
          email?: string
          full_name?: string
          id?: string
          job_fetch_tags?: string[] | null
          languages?: string[] | null
          linkedin_url?: string | null
          nationality?: string | null
          remote_policy?: string | null
          resume_file_url?: string | null
          skills?: string[] | null
          spain_remote_keywords?: string[] | null
          target_location?: string | null
          target_location_alt?: string | null
          target_roles?: string[] | null
          target_salary_usd_max?: number | null
          target_salary_usd_min?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          blocklist_keywords?: string[] | null
          current_location?: string | null
          email?: string
          full_name?: string
          id?: string
          job_fetch_tags?: string[] | null
          languages?: string[] | null
          linkedin_url?: string | null
          nationality?: string | null
          remote_policy?: string | null
          resume_file_url?: string | null
          skills?: string[] | null
          spain_remote_keywords?: string[] | null
          target_location?: string | null
          target_location_alt?: string | null
          target_roles?: string[] | null
          target_salary_usd_max?: number | null
          target_salary_usd_min?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
