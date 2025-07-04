import { createClient } from "@supabase/supabase-js";

// Use React environment variables (REACT_APP_ prefix) with fallback to VITE_
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'promptheroready-auth',
    flowType: 'pkce' as const,
    debug: process.env.NODE_ENV === 'development',
  }
});
