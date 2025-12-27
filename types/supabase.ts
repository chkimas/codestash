// types/supabase.ts
// Generated from your exact schema. Run `supabase gen types typescript` when CLI is installed to auto-update.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          image: string | null
          created_at: string | null
          last_name_change: string | null
          last_email_change: string | null
          last_password_change: string | null
          bio: string | null
          username: string | null
          last_ip: string | null
          is_banned: boolean | null
          banned_until: string | null
          role: 'user' | 'admin'
        }
        Insert: {
          id?: string
          name: string
          email: string
          image?: string | null
          created_at?: string | null
          last_name_change?: string | null
          last_email_change?: string | null
          last_password_change?: string | null
          bio?: string | null
          username?: string | null
          last_ip?: string | null
          is_banned?: boolean | null
          banned_until?: string | null
          role?: 'user' | 'admin'
        }
        Update: {
          id?: string
          name?: string
          email?: string
          image?: string | null
          created_at?: string | null
          last_name_change?: string | null
          last_email_change?: string | null
          last_password_change?: string | null
          bio?: string | null
          username?: string | null
          last_ip?: string | null
          is_banned?: boolean | null
          banned_until?: string | null
          role?: 'user' | 'admin'
        }
        Relationships: [
          {
            foreignKeyName: 'users_id_fkey'
            columns: ['id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      snippets: {
        Row: {
          id: string
          user_id: string
          title: string
          code: string
          language: string
          description: string | null
          is_public: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          code: string
          language: string
          description?: string | null
          is_public?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          code?: string
          language?: string
          description?: string | null
          is_public?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'snippets_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      announcements: {
        Row: {
          id: string
          message: string
          type: string | null
          is_active: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          message: string
          type?: string | null
          is_active?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          message?: string
          type?: string | null
          is_active?: boolean | null
          created_at?: string | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          user_id: string
          snippet_id: string
          created_at: string | null
        }
        Insert: {
          user_id: string
          snippet_id: string
          created_at?: string | null
        }
        Update: {
          user_id?: string
          snippet_id?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'favorites_snippet_id_fkey'
            columns: ['snippet_id']
            referencedRelation: 'snippets'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'favorites_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      search_stats: {
        Row: {
          term: string
          count: number | null
          last_searched_at: string | null
        }
        Insert: {
          term: string
          count?: number | null
          last_searched_at?: string | null
        }
        Update: {
          term?: string
          count?: number | null
          last_searched_at?: string | null
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
