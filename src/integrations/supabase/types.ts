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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      api_keys: {
        Row: {
          created_at: string
          created_by: string | null
          developer_project_id: string
          expires_at: string | null
          id: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          organization_id: string
          revoked_at: string | null
          revoked_by: string | null
          scopes: string[]
          status: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          developer_project_id: string
          expires_at?: string | null
          id?: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          organization_id: string
          revoked_at?: string | null
          revoked_by?: string | null
          scopes?: string[]
          status?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          developer_project_id?: string
          expires_at?: string | null
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          organization_id?: string
          revoked_at?: string | null
          revoked_by?: string | null
          scopes?: string[]
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_developer_project_id_fkey"
            columns: ["developer_project_id"]
            isOneToOne: false
            referencedRelation: "developer_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_keys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_request_logs: {
        Row: {
          api_key_id: string | null
          created_at: string
          developer_project_id: string | null
          id: string
          latency_ms: number | null
          method: string
          organization_id: string
          path: string
          request_id: string | null
          status_code: number
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string
          developer_project_id?: string | null
          id?: string
          latency_ms?: number | null
          method: string
          organization_id: string
          path: string
          request_id?: string | null
          status_code: number
        }
        Update: {
          api_key_id?: string | null
          created_at?: string
          developer_project_id?: string | null
          id?: string
          latency_ms?: number | null
          method?: string
          organization_id?: string
          path?: string
          request_id?: string | null
          status_code?: number
        }
        Relationships: [
          {
            foreignKeyName: "api_request_logs_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_request_logs_developer_project_id_fkey"
            columns: ["developer_project_id"]
            isOneToOne: false
            referencedRelation: "developer_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_request_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_events: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          id: string
          metadata: Json
          organization_id: string | null
          resource_id: string | null
          resource_type: string
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          organization_id?: string | null
          resource_id?: string | null
          resource_type: string
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          organization_id?: string | null
          resource_id?: string | null
          resource_type?: string
        }
        Relationships: []
      }
      business_locations: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          is_primary: boolean
          latitude: number | null
          lga: string | null
          location_id: string | null
          location_type: string
          longitude: number | null
          name: string
          organization_id: string
          postcode: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          is_primary?: boolean
          latitude?: number | null
          lga?: string | null
          location_id?: string | null
          location_type?: string
          longitude?: number | null
          name: string
          organization_id: string
          postcode?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          is_primary?: boolean
          latitude?: number | null
          lga?: string | null
          location_id?: string | null
          location_type?: string
          longitude?: number | null
          name?: string
          organization_id?: string
          postcode?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_locations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_locations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      developer_projects: {
        Row: {
          created_at: string
          created_by: string | null
          environment: string
          id: string
          name: string
          organization_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          environment?: string
          id?: string
          name: string
          organization_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          environment?: string
          id?: string
          name?: string
          organization_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "developer_projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          area: string | null
          confirmation_status: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          district: string | null
          formatted_address: string | null
          id: string
          input_text: string | null
          label: string
          latitude: number | null
          lga: string | null
          longitude: number | null
          organization_id: string
          postcode: string | null
          provider: string
          provider_reference: string | null
          resolution_status: string
          source_updated_at: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          area?: string | null
          confirmation_status?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          district?: string | null
          formatted_address?: string | null
          id?: string
          input_text?: string | null
          label: string
          latitude?: number | null
          lga?: string | null
          longitude?: number | null
          organization_id: string
          postcode?: string | null
          provider?: string
          provider_reference?: string | null
          resolution_status?: string
          source_updated_at?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          area?: string | null
          confirmation_status?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          district?: string | null
          formatted_address?: string | null
          id?: string
          input_text?: string | null
          label?: string
          latitude?: number | null
          lga?: string | null
          longitude?: number | null
          organization_id?: string
          postcode?: string | null
          provider?: string
          provider_reference?: string | null
          resolution_status?: string
          source_updated_at?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invites: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          organization_id: string
          revoked_at: string | null
          role: Database["public"]["Enums"]["org_role"]
          status: string
          token_hash: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          organization_id: string
          revoked_at?: string | null
          role?: Database["public"]["Enums"]["org_role"]
          status?: string
          token_hash: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          organization_id?: string
          revoked_at?: string | null
          role?: Database["public"]["Enums"]["org_role"]
          status?: string
          token_hash?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          organization_id: string
          role: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          organization_id: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          settings: Json
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          settings?: Json
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          settings?: Json
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active_organization_id: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          active_organization_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          active_organization_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_active_organization_id_fkey"
            columns: ["active_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          bucket_key: string
          id: string
          limit_value: number
          organization_id: string | null
          request_count: number
          subject_hash: string
          updated_at: string
          window_started_at: string
        }
        Insert: {
          bucket_key: string
          id?: string
          limit_value?: number
          organization_id?: string | null
          request_count?: number
          subject_hash: string
          updated_at?: string
          window_started_at: string
        }
        Update: {
          bucket_key?: string
          id?: string
          limit_value?: number
          organization_id?: string | null
          request_count?: number
          subject_hash?: string
          updated_at?: string
          window_started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rate_limits_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_counters: {
        Row: {
          count: number
          developer_project_id: string | null
          id: string
          metric: string
          organization_id: string
          period_start: string
          updated_at: string
        }
        Insert: {
          count?: number
          developer_project_id?: string | null
          id?: string
          metric: string
          organization_id: string
          period_start: string
          updated_at?: string
        }
        Update: {
          count?: number
          developer_project_id?: string | null
          id?: string
          metric?: string
          organization_id?: string
          period_start?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_counters_developer_project_id_fkey"
            columns: ["developer_project_id"]
            isOneToOne: false
            referencedRelation: "developer_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_counters_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_events: {
        Row: {
          actor_id: string | null
          actor_type: string
          created_at: string
          event_type: string
          id: string
          metadata: Json
          organization_id: string
          verification_request_id: string
        }
        Insert: {
          actor_id?: string | null
          actor_type: string
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json
          organization_id: string
          verification_request_id: string
        }
        Update: {
          actor_id?: string | null
          actor_type?: string
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json
          organization_id?: string
          verification_request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_events_verification_request_id_fkey"
            columns: ["verification_request_id"]
            isOneToOne: false
            referencedRelation: "verification_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_requests: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          expires_at: string
          id: string
          location_id: string | null
          message: string | null
          opened_at: string | null
          organization_id: string
          public_id: string
          purpose: string | null
          recipient_email: string | null
          recipient_name: string | null
          recipient_phone: string | null
          reference: string | null
          status: string
          token_hash: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string
          id?: string
          location_id?: string | null
          message?: string | null
          opened_at?: string | null
          organization_id: string
          public_id: string
          purpose?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          reference?: string | null
          status?: string
          token_hash: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string
          id?: string
          location_id?: string | null
          message?: string | null
          opened_at?: string | null
          organization_id?: string
          public_id?: string
          purpose?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          reference?: string | null
          status?: string
          token_hash?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_requests_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_deliveries: {
        Row: {
          attempt_count: number
          created_at: string
          event_id: string
          event_type: string
          id: string
          last_attempt_at: string | null
          next_attempt_at: string | null
          organization_id: string
          payload: Json
          response_excerpt: string | null
          response_status_code: number | null
          status: string
          webhook_endpoint_id: string
        }
        Insert: {
          attempt_count?: number
          created_at?: string
          event_id: string
          event_type: string
          id?: string
          last_attempt_at?: string | null
          next_attempt_at?: string | null
          organization_id: string
          payload?: Json
          response_excerpt?: string | null
          response_status_code?: number | null
          status?: string
          webhook_endpoint_id: string
        }
        Update: {
          attempt_count?: number
          created_at?: string
          event_id?: string
          event_type?: string
          id?: string
          last_attempt_at?: string | null
          next_attempt_at?: string | null
          organization_id?: string
          payload?: Json
          response_excerpt?: string | null
          response_status_code?: number | null
          status?: string
          webhook_endpoint_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_deliveries_webhook_endpoint_id_fkey"
            columns: ["webhook_endpoint_id"]
            isOneToOne: false
            referencedRelation: "webhook_endpoints"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_endpoints: {
        Row: {
          created_at: string
          created_by: string | null
          developer_project_id: string | null
          event_types: string[]
          id: string
          name: string
          organization_id: string
          secret_hash: string
          secret_prefix: string
          status: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          developer_project_id?: string | null
          event_types?: string[]
          id?: string
          name: string
          organization_id: string
          secret_hash: string
          secret_prefix: string
          status?: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          developer_project_id?: string | null
          event_types?: string[]
          id?: string
          name?: string
          organization_id?: string
          secret_hash?: string
          secret_prefix?: string
          status?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_endpoints_developer_project_id_fkey"
            columns: ["developer_project_id"]
            isOneToOne: false
            referencedRelation: "developer_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_endpoints_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_manage_org: {
        Args: { _org: string; _user: string }
        Returns: boolean
      }
      has_org_role: {
        Args: {
          _org: string
          _roles: Database["public"]["Enums"]["org_role"][]
          _user: string
        }
        Returns: boolean
      }
      is_org_member: { Args: { _org: string; _user: string }; Returns: boolean }
    }
    Enums: {
      org_role:
        | "owner"
        | "admin"
        | "member"
        | "viewer"
        | "manager"
        | "developer"
        | "analyst"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      org_role: [
        "owner",
        "admin",
        "member",
        "viewer",
        "manager",
        "developer",
        "analyst",
      ],
    },
  },
} as const
