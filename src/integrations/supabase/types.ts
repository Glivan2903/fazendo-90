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
      bank_invoice_items: {
        Row: {
          created_at: string | null
          description: string
          discount: number
          id: string
          invoice_id: string
          item_type: string
          period_end: string | null
          period_start: string | null
          quantity: number
          total: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          description: string
          discount?: number
          id?: string
          invoice_id: string
          item_type?: string
          period_end?: string | null
          period_start?: string | null
          quantity?: number
          total: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          description?: string
          discount?: number
          id?: string
          invoice_id?: string
          item_type?: string
          period_end?: string | null
          period_start?: string | null
          quantity?: number
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "bank_invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "bank_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_invoices: {
        Row: {
          buyer_name: string
          created_at: string | null
          discount_amount: number
          due_date: string
          id: string
          invoice_number: string
          payment_date: string | null
          payment_method: string | null
          sale_date: string
          seller_name: string
          status: string
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          buyer_name: string
          created_at?: string | null
          discount_amount?: number
          due_date: string
          id?: string
          invoice_number: string
          payment_date?: string | null
          payment_method?: string | null
          sale_date?: string
          seller_name?: string
          status?: string
          total_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          buyer_name?: string
          created_at?: string | null
          discount_amount?: number
          due_date?: string
          id?: string
          invoice_number?: string
          payment_date?: string | null
          payment_method?: string | null
          sale_date?: string
          seller_name?: string
          status?: string
          total_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_checkin_counts"
            referencedColumns: ["user_id"]
          },
        ]
      }
      checkins: {
        Row: {
          checked_in_at: string | null
          class_id: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          checked_in_at?: string | null
          class_id: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          checked_in_at?: string | null
          class_id?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkins_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_checkin_counts"
            referencedColumns: ["user_id"]
          },
        ]
      }
      classes: {
        Row: {
          coach_id: string | null
          created_at: string | null
          date: string
          end_time: string
          id: string
          max_capacity: number
          program_id: string
          start_time: string
          updated_at: string | null
        }
        Insert: {
          coach_id?: string | null
          created_at?: string | null
          date: string
          end_time: string
          id?: string
          max_capacity?: number
          program_id: string
          start_time: string
          updated_at?: string | null
        }
        Update: {
          coach_id?: string | null
          created_at?: string | null
          date?: string
          end_time?: string
          id?: string
          max_capacity?: number
          program_id?: string
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "user_checkin_counts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "classes_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          bank_invoice_id: string | null
          created_at: string | null
          due_date: string
          id: string
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          reference: string | null
          status: string
          subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          bank_invoice_id?: string | null
          created_at?: string | null
          due_date: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          reference?: string | null
          status?: string
          subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          bank_invoice_id?: string | null
          created_at?: string | null
          due_date?: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          reference?: string | null
          status?: string
          subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_bank_invoice_id_fkey"
            columns: ["bank_invoice_id"]
            isOneToOne: false
            referencedRelation: "bank_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_checkin_counts"
            referencedColumns: ["user_id"]
          },
        ]
      }
      plans: {
        Row: {
          active: boolean | null
          allows_suspension: boolean | null
          amount: number
          auto_renewal: boolean | null
          check_in_limit_qty: number | null
          check_in_limit_type: string | null
          created_at: string | null
          days_validity: number | null
          description: string | null
          enrollment_fee: number | null
          id: string
          name: string
          periodicity: string
          single_checkin_per_day: boolean | null
          suspension_days: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          allows_suspension?: boolean | null
          amount: number
          auto_renewal?: boolean | null
          check_in_limit_qty?: number | null
          check_in_limit_type?: string | null
          created_at?: string | null
          days_validity?: number | null
          description?: string | null
          enrollment_fee?: number | null
          id?: string
          name: string
          periodicity: string
          single_checkin_per_day?: boolean | null
          suspension_days?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          allows_suspension?: boolean | null
          amount?: number
          auto_renewal?: boolean | null
          check_in_limit_qty?: number | null
          check_in_limit_type?: string | null
          created_at?: string | null
          days_validity?: number | null
          description?: string | null
          enrollment_fee?: number | null
          id?: string
          name?: string
          periodicity?: string
          single_checkin_per_day?: boolean | null
          suspension_days?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          birth_date: string | null
          created_at: string | null
          email: string
          gender: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          plan: string | null
          role: string
          status: string
          subscription_id: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string | null
          email: string
          gender?: string | null
          id: string
          name: string
          notes?: string | null
          phone?: string | null
          plan?: string | null
          role?: string
          status?: string
          subscription_id?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string | null
          email?: string
          gender?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          plan?: string | null
          role?: string
          status?: string
          subscription_id?: string | null
        }
        Relationships: []
      }
      programs: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          plan_id: string | null
          start_date: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          plan_id?: string | null
          start_date: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          plan_id?: string | null
          start_date?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_checkin_counts"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      user_checkin_counts: {
        Row: {
          avatar_url: string | null
          email: string | null
          last_checkin_date: string | null
          total_checkins: number | null
          user_id: string | null
          user_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_daily_checkins: {
        Args: { start_date: string; end_date: string }
        Returns: {
          check_date: string
          checkin_count: number
        }[]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      has_payment_for_month: {
        Args: { user_id: string; month: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
