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
      analytics: {
        Row: {
          analytics_id: number
          date: string | null
          popular_item: number | null
          revenue: number | null
          total_orders: number | null
          waste_level: number | null
        }
        Insert: {
          analytics_id?: never
          date?: string | null
          popular_item?: number | null
          revenue?: number | null
          total_orders?: number | null
          waste_level?: number | null
        }
        Update: {
          analytics_id?: never
          date?: string | null
          popular_item?: number | null
          revenue?: number | null
          total_orders?: number | null
          waste_level?: number | null
        }
        Relationships: []
      }
      cycle_tracking: {
        Row: {
          cycle_id: number
          date: string | null
          phase: string | null
          user_id: number | null
        }
        Insert: {
          cycle_id?: never
          date?: string | null
          phase?: string | null
          user_id?: number | null
        }
        Update: {
          cycle_id?: never
          date?: string | null
          phase?: string | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cycle_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      daily_logs: {
        Row: {
          created_at: string
          creatine_taken: boolean
          date: string
          id: string
          supplements_taken: Json
          updated_at: string
          user_id: string
          whey_taken: boolean
        }
        Insert: {
          created_at?: string
          creatine_taken?: boolean
          date?: string
          id?: string
          supplements_taken?: Json
          updated_at?: string
          user_id: string
          whey_taken?: boolean
        }
        Update: {
          created_at?: string
          creatine_taken?: boolean
          date?: string
          id?: string
          supplements_taken?: Json
          updated_at?: string
          user_id?: string
          whey_taken?: boolean
        }
        Relationships: []
      }
      food_items: {
        Row: {
          calories: number | null
          carbs: number | null
          category: string | null
          fats: number | null
          food_id: number
          is_available: boolean | null
          name: string | null
          price: number | null
          protein: number | null
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          category?: string | null
          fats?: number | null
          food_id?: never
          is_available?: boolean | null
          name?: string | null
          price?: number | null
          protein?: number | null
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          category?: string | null
          fats?: number | null
          food_id?: never
          is_available?: boolean | null
          name?: string | null
          price?: number | null
          protein?: number | null
        }
        Relationships: []
      }
      food_orders: {
        Row: {
          created_at: string | null
          id: string
          items: Json
          status: string | null
          stripe_session_id: string | null
          student_name: string | null
          total_amount: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          items: Json
          status?: string | null
          stripe_session_id?: string | null
          student_name?: string | null
          total_amount: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          items?: Json
          status?: string | null
          stripe_session_id?: string | null
          student_name?: string | null
          total_amount?: number
          user_id?: string | null
        }
        Relationships: []
      }
      food_waste: {
        Row: {
          date: string | null
          food_id: number | null
          quantity: number | null
          waste_id: number
        }
        Insert: {
          date?: string | null
          food_id?: number | null
          quantity?: number | null
          waste_id?: never
        }
        Update: {
          date?: string | null
          food_id?: number | null
          quantity?: number | null
          waste_id?: never
        }
        Relationships: [
          {
            foreignKeyName: "food_waste_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "food_items"
            referencedColumns: ["food_id"]
          },
        ]
      }
      foods: {
        Row: {
          calories: number
          carbs: number
          created_at: string
          fats: number
          id: string
          name: string
          protein: number
          serving_size: number
          serving_unit: string
          source: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          calories?: number
          carbs?: number
          created_at?: string
          fats?: number
          id?: string
          name: string
          protein?: number
          serving_size?: number
          serving_unit?: string
          source?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          calories?: number
          carbs?: number
          created_at?: string
          fats?: number
          id?: string
          name?: string
          protein?: number
          serving_size?: number
          serving_unit?: string
          source?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      inventory: {
        Row: {
          item_id: number
          last_updated: string | null
          name: string | null
          quantity: number | null
          unit: string | null
        }
        Insert: {
          item_id?: never
          last_updated?: string | null
          name?: string | null
          quantity?: number | null
          unit?: string | null
        }
        Update: {
          item_id?: never
          last_updated?: string | null
          name?: string | null
          quantity?: number | null
          unit?: string | null
        }
        Relationships: []
      }
      meal_entries: {
        Row: {
          created_at: string
          daily_log_id: string
          food_id: string
          id: string
          meal_type: string
          quantity: number
        }
        Insert: {
          created_at?: string
          daily_log_id: string
          food_id: string
          id?: string
          meal_type: string
          quantity?: number
        }
        Update: {
          created_at?: string
          daily_log_id?: string
          food_id?: string
          id?: string
          meal_type?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "meal_entries_daily_log_id_fkey"
            columns: ["daily_log_id"]
            isOneToOne: false
            referencedRelation: "daily_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_entries_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
        ]
      }
      menu: {
        Row: {
          date: string | null
          food_id: number | null
          meal_type: string | null
          menu_id: number
        }
        Insert: {
          date?: string | null
          food_id?: number | null
          meal_type?: string | null
          menu_id?: never
        }
        Update: {
          date?: string | null
          food_id?: number | null
          meal_type?: string | null
          menu_id?: never
        }
        Relationships: [
          {
            foreignKeyName: "menu_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "food_items"
            referencedColumns: ["food_id"]
          },
        ]
      }
      nutrition_logs: {
        Row: {
          log_date: string | null
          log_id: number
          total_calories: number | null
          total_carbs: number | null
          total_fats: number | null
          total_protein: number | null
          user_id: number | null
        }
        Insert: {
          log_date?: string | null
          log_id?: never
          total_calories?: number | null
          total_carbs?: number | null
          total_fats?: number | null
          total_protein?: number | null
          user_id?: number | null
        }
        Update: {
          log_date?: string | null
          log_id?: never
          total_calories?: number | null
          total_carbs?: number | null
          total_fats?: number | null
          total_protein?: number | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      order_items: {
        Row: {
          food_id: number | null
          order_id: number | null
          order_item_id: number
          quantity: number | null
        }
        Insert: {
          food_id?: number | null
          order_id?: number | null
          order_item_id?: never
          quantity?: number | null
        }
        Update: {
          food_id?: number | null
          order_id?: number | null
          order_item_id?: never
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "food_items"
            referencedColumns: ["food_id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["order_id"]
          },
        ]
      }
      orders: {
        Row: {
          order_id: number
          order_time: string | null
          status: string | null
          total_amount: number | null
          user_id: number | null
        }
        Insert: {
          order_id?: never
          order_time?: string | null
          status?: string | null
          total_amount?: number | null
          user_id?: number | null
        }
        Update: {
          order_id?: never
          order_time?: string | null
          status?: string | null
          total_amount?: number | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      payments: {
        Row: {
          order_id: number | null
          payment_id: number
          payment_method: string | null
          payment_status: string | null
          transaction_time: string | null
        }
        Insert: {
          order_id?: number | null
          payment_id?: never
          payment_method?: string | null
          payment_status?: string | null
          transaction_time?: string | null
        }
        Update: {
          order_id?: number | null
          payment_id?: never
          payment_method?: string | null
          payment_status?: string | null
          transaction_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["order_id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          created_at: string | null
          food_id: number | null
          reason: string | null
          rec_id: number
          score: number | null
          user_id: number | null
        }
        Insert: {
          created_at?: string | null
          food_id?: number | null
          reason?: string | null
          rec_id?: never
          score?: number | null
          user_id?: number | null
        }
        Update: {
          created_at?: string | null
          food_id?: number | null
          reason?: string | null
          rec_id?: never
          score?: number | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "food_items"
            referencedColumns: ["food_id"]
          },
          {
            foreignKeyName: "recommendations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_activity: {
        Row: {
          activity_id: number
          calories: number | null
          carbs: number | null
          consumed_at: string | null
          fats: number | null
          food_id: number | null
          protein: number | null
          user_id: number | null
        }
        Insert: {
          activity_id?: never
          calories?: number | null
          carbs?: number | null
          consumed_at?: string | null
          fats?: number | null
          food_id?: number | null
          protein?: number | null
          user_id?: number | null
        }
        Update: {
          activity_id?: never
          calories?: number | null
          carbs?: number | null
          consumed_at?: string | null
          fats?: number | null
          food_id?: number | null
          protein?: number | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_profile: {
        Row: {
          age: number | null
          budget_limit: number | null
          caffeine_intake: number | null
          diet_type: string | null
          gender: string | null
          health_conditions: string | null
          height: number | null
          profile_id: number
          sleep_hours: number | null
          user_id: number | null
          weight: number | null
        }
        Insert: {
          age?: number | null
          budget_limit?: number | null
          caffeine_intake?: number | null
          diet_type?: string | null
          gender?: string | null
          health_conditions?: string | null
          height?: number | null
          profile_id?: never
          sleep_hours?: number | null
          user_id?: number | null
          weight?: number | null
        }
        Update: {
          age?: number | null
          budget_limit?: number | null
          caffeine_intake?: number | null
          diet_type?: string | null
          gender?: string | null
          health_conditions?: string | null
          height?: number | null
          profile_id?: never
          sleep_hours?: number | null
          user_id?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profile_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          calorie_target: number
          carb_target: number
          created_at: string
          fat_target: number
          id: string
          notification_time: string
          protein_target: number
          supplements: Json
          theme: string
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          calorie_target?: number
          carb_target?: number
          created_at?: string
          fat_target?: number
          id?: string
          notification_time?: string
          protein_target?: number
          supplements?: Json
          theme?: string
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          calorie_target?: number
          carb_target?: number
          created_at?: string
          fat_target?: number
          id?: string
          notification_time?: string
          protein_target?: number
          supplements?: Json
          theme?: string
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string | null
          name: string | null
          password: string | null
          role: string | null
          user_id: number
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          name?: string | null
          password?: string | null
          role?: string | null
          user_id?: never
        }
        Update: {
          created_at?: string | null
          email?: string | null
          name?: string | null
          password?: string | null
          role?: string | null
          user_id?: never
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
      invoke_send_reminders: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
