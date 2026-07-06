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
      activity_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      article_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      articles: {
        Row: {
          author_id: string | null
          category_id: string | null
          content: string | null
          created_at: string
          excerpt: string | null
          featured_image: string | null
          gallery: Json
          id: string
          locale: string
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["article_status"]
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          gallery?: Json
          id?: string
          locale?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["article_status"]
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          gallery?: Json
          id?: string
          locale?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["article_status"]
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "article_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          created_at: string
          customer_name: string
          email: string | null
          end_date: string | null
          id: string
          laptop_id: string | null
          laptop_name: string | null
          locale: string | null
          notes: string | null
          quantity: number
          source_page: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string
          whatsapp: string
        }
        Insert: {
          created_at?: string
          customer_name: string
          email?: string | null
          end_date?: string | null
          id?: string
          laptop_id?: string | null
          laptop_name?: string | null
          locale?: string | null
          notes?: string | null
          quantity?: number
          source_page?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
          whatsapp: string
        }
        Update: {
          created_at?: string
          customer_name?: string
          email?: string | null
          end_date?: string | null
          id?: string
          laptop_id?: string | null
          laptop_name?: string | null
          locale?: string | null
          notes?: string | null
          quantity?: number
          source_page?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_laptop_id_fkey"
            columns: ["laptop_id"]
            isOneToOne: false
            referencedRelation: "laptops"
            referencedColumns: ["id"]
          },
        ]
      }
      instagram_gallery: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          image_url: string
          is_published: boolean
          link_url: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url: string
          is_published?: boolean
          link_url?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url?: string
          is_published?: boolean
          link_url?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      laptops: {
        Row: {
          brand: string | null
          created_at: string
          gallery: Json
          id: string
          name: string
          notes: string | null
          photo_url: string | null
          price_daily: number | null
          price_monthly: number | null
          price_weekly: number | null
          processor: string | null
          ram: string | null
          screen_size: string | null
          sort_order: number
          ssd: string | null
          status: Database["public"]["Enums"]["laptop_status"]
          updated_at: string
          vga: string | null
        }
        Insert: {
          brand?: string | null
          created_at?: string
          gallery?: Json
          id?: string
          name: string
          notes?: string | null
          photo_url?: string | null
          price_daily?: number | null
          price_monthly?: number | null
          price_weekly?: number | null
          processor?: string | null
          ram?: string | null
          screen_size?: string | null
          sort_order?: number
          ssd?: string | null
          status?: Database["public"]["Enums"]["laptop_status"]
          updated_at?: string
          vga?: string | null
        }
        Update: {
          brand?: string | null
          created_at?: string
          gallery?: Json
          id?: string
          name?: string
          notes?: string | null
          photo_url?: string | null
          price_daily?: number | null
          price_monthly?: number | null
          price_weekly?: number | null
          processor?: string | null
          ram?: string | null
          screen_size?: string | null
          sort_order?: number
          ssd?: string | null
          status?: Database["public"]["Enums"]["laptop_status"]
          updated_at?: string
          vga?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          comment: string | null
          company: string | null
          created_at: string
          customer_name: string
          id: string
          laptop_rented: string | null
          location: string | null
          published: boolean
          rating: number
          screenshot_url: string | null
          sort_order: number
          testimonial_date: string | null
          updated_at: string
        }
        Insert: {
          comment?: string | null
          company?: string | null
          created_at?: string
          customer_name: string
          id?: string
          laptop_rented?: string | null
          location?: string | null
          published?: boolean
          rating?: number
          screenshot_url?: string | null
          sort_order?: number
          testimonial_date?: string | null
          updated_at?: string
        }
        Update: {
          comment?: string | null
          company?: string | null
          created_at?: string
          customer_name?: string
          id?: string
          laptop_rented?: string | null
          location?: string | null
          published?: boolean
          rating?: number
          screenshot_url?: string | null
          sort_order?: number
          testimonial_date?: string | null
          updated_at?: string
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
      website_settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      whatsapp_leads: {
        Row: {
          created_at: string
          event_type: string
          id: string
          locale: string | null
          location: string | null
          page_path: string | null
          service_category: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          locale?: string | null
          location?: string | null
          page_path?: string | null
          service_category?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          locale?: string | null
          location?: string | null
          page_path?: string | null
          service_category?: string | null
          user_agent?: string | null
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
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "super_admin" | "staff"
      article_status: "draft" | "published"
      booking_status:
        | "pending"
        | "confirmed"
        | "active"
        | "completed"
        | "cancelled"
      laptop_status: "ready" | "rented" | "maintenance" | "out_of_stock"
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
    Enums: {
      app_role: ["super_admin", "staff"],
      article_status: ["draft", "published"],
      booking_status: [
        "pending",
        "confirmed",
        "active",
        "completed",
        "cancelled",
      ],
      laptop_status: ["ready", "rented", "maintenance", "out_of_stock"],
    },
  },
} as const
