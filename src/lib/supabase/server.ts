import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export function createServerClient() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.warn(
      'Supabase server client initialized without SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL'
    );
  }
  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
