import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;
const PASSWORD_RECOVERY_PENDING_KEY = "aicc.passwordRecoveryPending";

let passwordRecoveryPending = false;

function getSessionStorage() {
  try {
    return typeof window !== "undefined" ? window.sessionStorage : null;
  } catch {
    return null;
  }
}

export function isPasswordRecoveryPending() {
  const storage = getSessionStorage();
  return (
    passwordRecoveryPending ||
    storage?.getItem(PASSWORD_RECOVERY_PENDING_KEY) === "true"
  );
}

export function setPasswordRecoveryPending() {
  passwordRecoveryPending = true;
  getSessionStorage()?.setItem(PASSWORD_RECOVERY_PENDING_KEY, "true");
}

export function clearPasswordRecoveryPending() {
  passwordRecoveryPending = false;
  getSessionStorage()?.removeItem(PASSWORD_RECOVERY_PENDING_KEY);
}

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

if (supabase) {
  supabase.auth.onAuthStateChange((event) => {
    // A recovery session is authenticated but cannot enter operator surfaces.
    if (event === "PASSWORD_RECOVERY") {
      setPasswordRecoveryPending();
    } else if (event === "SIGNED_OUT") {
      clearPasswordRecoveryPending();
    }
  });
}

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
  if (!supabase) {
    clearPasswordRecoveryPending();
    return { error: null };
  }

  const { error } = await supabase.auth.signOut();

  if (!error) {
    clearPasswordRecoveryPending();
  }

  return { error };
}
