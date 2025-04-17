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
        ]
      }
      classes: {
        Row: {
          coach_id: string
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
          coach_id: string
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
          coach_id?: string
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
            foreignKeyName: "classes_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      extrato_caixa: {
        Row: {
          categoria: string | null
          created_at: string | null
          data_movimento: string
          descricao: string
          id: string
          pagamento_id: string | null
          tipo: Database["public"]["Enums"]["transaction_type"]
          updated_at: string | null
          valor: number
        }
        Insert: {
          categoria?: string | null
          created_at?: string | null
          data_movimento?: string
          descricao: string
          id?: string
          pagamento_id?: string | null
          tipo: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          valor: number
        }
        Update: {
          categoria?: string | null
          created_at?: string | null
          data_movimento?: string
          descricao?: string
          id?: string
          pagamento_id?: string | null
          tipo?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "extrato_caixa_pagamento_id_fkey"
            columns: ["pagamento_id"]
            isOneToOne: false
            referencedRelation: "pagamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamentos: {
        Row: {
          aluno_id: string
          comprovante_url: string | null
          created_at: string | null
          data_pagamento: string | null
          data_vencimento: string
          id: string
          metodo_pagamento: Database["public"]["Enums"]["payment_method"] | null
          plano_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string | null
          valor: number
        }
        Insert: {
          aluno_id: string
          comprovante_url?: string | null
          created_at?: string | null
          data_pagamento?: string | null
          data_vencimento: string
          id?: string
          metodo_pagamento?:
            | Database["public"]["Enums"]["payment_method"]
            | null
          plano_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string | null
          valor: number
        }
        Update: {
          aluno_id?: string
          comprovante_url?: string | null
          created_at?: string | null
          data_pagamento?: string | null
          data_vencimento?: string
          id?: string
          metodo_pagamento?:
            | Database["public"]["Enums"]["payment_method"]
            | null
          plano_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos_financeiros"
            referencedColumns: ["id"]
          },
        ]
      }
      planos_financeiros: {
        Row: {
          created_at: string | null
          descricao: string | null
          duracao_dias: number
          id: string
          nome: string
          updated_at: string | null
          valor: number
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          duracao_dias: number
          id?: string
          nome: string
          updated_at?: string | null
          valor: number
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          duracao_dias?: number
          id?: string
          nome?: string
          updated_at?: string | null
          valor?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birth_date: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string | null
          plano_id: string | null
          role: string
          status: string
        }
        Insert: {
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string | null
          email: string
          id: string
          name: string
          phone?: string | null
          plano_id?: string | null
          role?: string
          status?: string
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          plano_id?: string | null
          role?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos_financeiros"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
    }
    Enums: {
      payment_method: "dinheiro" | "cartao" | "pix" | "transferencia"
      payment_status: "pendente" | "pago" | "atrasado"
      transaction_type: "entrada" | "saida"
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
    Enums: {
      payment_method: ["dinheiro", "cartao", "pix", "transferencia"],
      payment_status: ["pendente", "pago", "atrasado"],
      transaction_type: ["entrada", "saida"],
    },
  },
} as const
