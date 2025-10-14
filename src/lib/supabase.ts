import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          email: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          email: string;
          avatar_url?: string | null;
        };
        Update: {
          username?: string;
          email?: string;
          avatar_url?: string | null;
        };
      };
      pages: {
        Row: {
          id: string;
          user_id: string;
          slug: string;
          title: string;
          is_active: boolean;
          is_primary: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      page_settings: {
        Row: {
          id: string;
          page_id: string;
          profile_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          header_media_url: string | null;
          header_media_type: string | null;
          background_color: string | null;
          background_gradient: string | null;
          theme: string;
          font_family: string | null;
          whatsapp_floating_enabled: boolean;
          whatsapp_floating_phone: string | null;
          whatsapp_floating_message: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      resources: {
        Row: {
          id: string;
          page_id: string;
          type: 'link' | 'gallery' | 'whatsapp' | 'spotify' | 'youtube' | 'image_banner';
          title: string;
          display_order: number;
          is_visible: boolean;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
}
