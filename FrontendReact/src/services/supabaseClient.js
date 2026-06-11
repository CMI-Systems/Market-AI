import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    })
  : null;

export async function getAuthSession() {
  if (!supabase) {
    return {
      session: null,
      error: null,
      configured: false,
    };
  }

  const { data, error } = await supabase.auth.getSession();

  return {
    session: data?.session || null,
    error,
    configured: true,
  };
}

export async function signInOperator({ email, password }) {
  if (!supabase) {
    return {
      session: null,
      error: new Error("Supabase is not configured for this environment."),
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return {
    session: data?.session || null,
    error,
  };
}

export async function signOutOperator() {
  if (!supabase) return { error: null };

  const { error } = await supabase.auth.signOut();
  return { error };
}
