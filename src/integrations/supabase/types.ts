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
  public: {
    Tables: {
      ai_logs: {
        Row: {
          created_at: string
          error_message: string | null
          feature: string
          id: string
          model: string | null
          success: boolean
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          feature: string
          id?: string
          model?: string | null
          success?: boolean
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          feature?: string
          id?: string
          model?: string | null
          success?: boolean
          user_id?: string | null
        }
        Relationships: []
      }
      applications: {
        Row: {
          applied_at: string
          id: string
          job_id: string
          notes: string | null
          status: Database["public"]["Enums"]["application_status"]
          user_id: string
        }
        Insert: {
          applied_at?: string
          id?: string
          job_id: string
          notes?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          user_id: string
        }
        Update: {
          applied_at?: string
          id?: string
          job_id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          user_id?: string
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
      career_recommendations: {
        Row: {
          confidence: number
          demand: string | null
          description: string | null
          generated_at: string
          id: string
          reasoning: string | null
          required_skills: Json
          role: string
          salary_max: number | null
          salary_min: number | null
          user_id: string
        }
        Insert: {
          confidence?: number
          demand?: string | null
          description?: string | null
          generated_at?: string
          id?: string
          reasoning?: string | null
          required_skills?: Json
          role: string
          salary_max?: number | null
          salary_min?: number | null
          user_id: string
        }
        Update: {
          confidence?: number
          demand?: string | null
          description?: string | null
          generated_at?: string
          id?: string
          reasoning?: string | null
          required_skills?: Json
          role?: string
          salary_max?: number | null
          salary_min?: number | null
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          thread_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          thread_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "chat_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_threads: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
        }
        Relationships: []
      }
      interests: {
        Row: {
          created_at: string
          id: string
          tag: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          tag: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          tag?: string
          user_id?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          active: boolean
          apply_url: string | null
          company: string
          description: string
          id: string
          industry: string | null
          level: Database["public"]["Enums"]["job_level"]
          location: string | null
          posted_at: string
          remote: boolean
          required_skills: Json
          salary_max: number | null
          salary_min: number | null
          title: string
        }
        Insert: {
          active?: boolean
          apply_url?: string | null
          company: string
          description: string
          id?: string
          industry?: string | null
          level?: Database["public"]["Enums"]["job_level"]
          location?: string | null
          posted_at?: string
          remote?: boolean
          required_skills?: Json
          salary_max?: number | null
          salary_min?: number | null
          title: string
        }
        Update: {
          active?: boolean
          apply_url?: string | null
          company?: string
          description?: string
          id?: string
          industry?: string | null
          level?: Database["public"]["Enums"]["job_level"]
          location?: string | null
          posted_at?: string
          remote?: boolean
          required_skills?: Json
          salary_max?: number | null
          salary_min?: number | null
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          career_goals: string | null
          created_at: string
          education: string | null
          email: string | null
          full_name: string | null
          graduation_year: number | null
          id: string
          onboarded: boolean
          readiness_score: number
          target_role: string | null
          university: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          career_goals?: string | null
          created_at?: string
          education?: string | null
          email?: string | null
          full_name?: string | null
          graduation_year?: number | null
          id: string
          onboarded?: boolean
          readiness_score?: number
          target_role?: string | null
          university?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          career_goals?: string | null
          created_at?: string
          education?: string | null
          email?: string | null
          full_name?: string | null
          graduation_year?: number | null
          id?: string
          onboarded?: boolean
          readiness_score?: number
          target_role?: string | null
          university?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_free: boolean
          level: Database["public"]["Enums"]["skill_level"]
          provider: string | null
          skill_tag: string | null
          title: string
          type: Database["public"]["Enums"]["resource_type"]
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_free?: boolean
          level?: Database["public"]["Enums"]["skill_level"]
          provider?: string | null
          skill_tag?: string | null
          title: string
          type?: Database["public"]["Enums"]["resource_type"]
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_free?: boolean
          level?: Database["public"]["Enums"]["skill_level"]
          provider?: string | null
          skill_tag?: string | null
          title?: string
          type?: Database["public"]["Enums"]["resource_type"]
          url?: string
        }
        Relationships: []
      }
      resumes: {
        Row: {
          analyzed_at: string
          ats_score: number | null
          file_name: string | null
          formatting_score: number | null
          id: string
          improved_text: string | null
          keywords_found: Json | null
          keywords_missing: Json | null
          raw_text: string
          suggestions: Json | null
          target_role: string | null
          user_id: string
        }
        Insert: {
          analyzed_at?: string
          ats_score?: number | null
          file_name?: string | null
          formatting_score?: number | null
          id?: string
          improved_text?: string | null
          keywords_found?: Json | null
          keywords_missing?: Json | null
          raw_text: string
          suggestions?: Json | null
          target_role?: string | null
          user_id: string
        }
        Update: {
          analyzed_at?: string
          ats_score?: number | null
          file_name?: string | null
          formatting_score?: number | null
          id?: string
          improved_text?: string | null
          keywords_found?: Json | null
          keywords_missing?: Json | null
          raw_text?: string
          suggestions?: Json | null
          target_role?: string | null
          user_id?: string
        }
        Relationships: []
      }
      roadmaps: {
        Row: {
          edges: Json
          estimated_weeks: number | null
          generated_at: string
          id: string
          nodes: Json
          target_role: string
          user_id: string
        }
        Insert: {
          edges?: Json
          estimated_weeks?: number | null
          generated_at?: string
          id?: string
          nodes?: Json
          target_role: string
          user_id: string
        }
        Update: {
          edges?: Json
          estimated_weeks?: number | null
          generated_at?: string
          id?: string
          nodes?: Json
          target_role?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_jobs: {
        Row: {
          created_at: string
          id: string
          job_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          category: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_skills: {
        Row: {
          created_at: string
          id: string
          level: number
          skill_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          level?: number
          skill_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          level?: number
          skill_name?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "student"
      application_status:
        | "saved"
        | "applied"
        | "interview"
        | "offer"
        | "rejected"
      job_level: "internship" | "entry" | "junior" | "mid"
      resource_type:
        | "course"
        | "video"
        | "article"
        | "book"
        | "project"
        | "certification"
      skill_level: "beginner" | "intermediate" | "advanced"
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
  public: {
    Enums: {
      app_role: ["admin", "student"],
      application_status: [
        "saved",
        "applied",
        "interview",
        "offer",
        "rejected",
      ],
      job_level: ["internship", "entry", "junior", "mid"],
      resource_type: [
        "course",
        "video",
        "article",
        "book",
        "project",
        "certification",
      ],
      skill_level: ["beginner", "intermediate", "advanced"],
    },
  },
} as const
