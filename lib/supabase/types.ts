export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
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
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: []
      }
      jobs: {
        Row: {
          company: string
          created_at: string | null
          description_cleaned: string | null
          description_raw: string | null
          discovered_at: string | null
          disqualify_reason: string | null
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
          title: string
          url: string
        }
        Insert: {
          company: string
          created_at?: string | null
          description_cleaned?: string | null
          description_raw?: string | null
          discovered_at?: string | null
          disqualify_reason?: string | null
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
          title: string
          url: string
        }
        Update: {
          company?: string
          created_at?: string | null
          description_cleaned?: string | null
          description_raw?: string | null
          discovered_at?: string | null
          disqualify_reason?: string | null
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
          title?: string
          url?: string
        }
        Relationships: []
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
        Relationships: []
      }
      profile: {
        Row: {
          blocklist_keywords: string[] | null
          current_location: string | null
          email: string
          full_name: string
          id: string
          languages: string[] | null
          nationality: string | null
          remote_policy: string | null
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
          languages?: string[] | null
          nationality?: string | null
          remote_policy?: string | null
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
          languages?: string[] | null
          nationality?: string | null
          remote_policy?: string | null
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
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
