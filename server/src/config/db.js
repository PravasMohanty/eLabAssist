import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

const globalForSupabase = globalThis;

export const supabase =
  globalForSupabase.supabase ||
  createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForSupabase.supabase = supabase;
}
