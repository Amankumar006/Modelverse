export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      models: {
        Row: {
          id: string;
          name: string;
          slug: string;
          provider: string;
          description: string | null;
          architecture: string | null;
          parameters: string | null;
          context_window: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          provider: string;
          description?: string | null;
          architecture?: string | null;
          parameters?: string | null;
          context_window?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          provider?: string;
          description?: string | null;
          architecture?: string | null;
          parameters?: string | null;
          context_window?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export type ModelRow = Database['public']['Tables']['models']['Row'];
export type ModelInsert = Database['public']['Tables']['models']['Insert'];
export type ModelUpdate = Database['public']['Tables']['models']['Update'];
