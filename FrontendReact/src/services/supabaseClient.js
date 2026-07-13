import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;
const configuredFrontendUrl = import.meta.env?.VITE_FRONTEND_URL;

const PASSWORD_RECOVERY_PENDING_KEY = "aicc.passwordRecoveryPending";
const PASSWORD_RECOVERY_HYDRATION_TIMEOUT_MS = 5000;

let passwordRecoveryPending = false;

function isBrowser() {
  return typeof window !== "undefined";
}

function getSessionStorage() {
  try {
    return isBrowser() ? window.sessionStorage : null;
  } catch {
    return null;
  }
}

function getFrontendBaseUrl() {
  if (configuredFrontendUrl) {
    return configuredFrontendUrl.replace(/\/$/, "");
  }

  return isBrowser() ? window.location.origin : "";
}

function getRecoveryUrlState() {
  if (!isBrowser()) {
    return {
      hasRecoveryType: false,
      hasRecoveryCode: false,
      hasRecoveryTokens: false,
      hasRecoveryHint: false,
    };
  }

  const searchParams = new URLSearchParams(window.location.search || "");
  const hash = window.location.hash?.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash || "";
  const hashParams = new URLSearchParams(hash);

  const recoveryType = searchParams.get("type") || hashParams.get("type");

  const hasRecoveryType = recoveryType === "recovery";
  const hasRecoveryCode = searchParams.has("code") || hashParams.has("code");
  const hasRecoveryTokens =
    hashParams.has("access_token") || hashParams.has("refresh_token");

  const hasRecoveryHint =
    hasRecoveryType ||
    (window.location.pathname === "/update-password" &&
      (hasRecoveryCode || hasRecoveryTokens));

  return {
    hasRecoveryType,
    hasRecoveryCode,
    hasRecoveryTokens,
    hasRecoveryHint,
  };
}

function clearRecoveryUrlParameters() {
  if (!isBrowser()) {
    return;
  }

  const searchParams = new URLSearchParams(window.location.search || "");
  const hash = window.location.hash?.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash || "";
  const hashParams = new URLSearchParams(hash);
  const authParameters = [
    "access_token",
    "refresh_token",
    "expires_at",
    "expires_in",
    "token_type",
    "type",
    "code",
  ];

  authParameters.forEach((parameter) => {
    searchParams.delete(parameter);
    hashParams.delete(parameter);
  });

  const nextSearch = searchParams.toString();
  const nextHash = hashParams.toString();
  const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}${
    nextHash ? `#${nextHash}` : ""
  }`;

  window.history.replaceState(window.history.state, "", nextUrl);
}

export function hasPasswordRecoveryUrlHint() {
  return getRecoveryUrlState().hasRecoveryHint;
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
        detectSessionInUrl: false,
        persistSession: true,
      },
    })
  : null;

if (hasPasswordRecoveryUrlHint()) {
  setPasswordRecoveryPending();
}

if (supabase) {
  supabase.auth.onAuthStateChange((event) => {
    if (event === "PASSWORD_RECOVERY") {
      setPasswordRecoveryPending();
    }

    if (event === "SIGNED_OUT") {
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

export async function getCurrentUser() {
  if (!supabase) {
    return {
      user: null,
      error: null,
      configured: false,
    };
  }

  const { data, error } = await supabase.auth.getUser();

  return {
    user: data?.user || null,
    error,
    configured: true,
  };
}

export async function waitForPasswordRecoverySession({
  timeoutMs = PASSWORD_RECOVERY_HYDRATION_TIMEOUT_MS,
} = {}) {
  if (!supabase) {
    return {
      session: null,
      error: new Error("Supabase is not configured for this environment."),
      timedOut: false,
    };
  }

  if (hasPasswordRecoveryUrlHint()) {
    setPasswordRecoveryPending();
  }

  const recoveredSession = await recoverPasswordSessionFromUrl();

  if (recoveredSession.error) {
    return {
      session: null,
      error: recoveredSession.error,
      timedOut: false,
    };
  }

  if (recoveredSession.session) {
    return {
      session: recoveredSession.session,
      error: null,
      timedOut: false,
    };
  }

  const initialSession = await getAuthSession();

  if (
    initialSession.session &&
    (isPasswordRecoveryPending() || hasPasswordRecoveryUrlHint())
  ) {
    return {
      session: initialSession.session,
      error: initialSession.error,
      timedOut: false,
    };
  }

  return new Promise((resolve) => {
    let settled = false;
    let timeoutId = null;
    let subscription = null;

    const settle = (result) => {
      if (settled) return;

      settled = true;

      if (timeoutId) {
        window.clearTimeout(timeoutId);
        timeoutId = null;
      }

      if (subscription) {
        subscription.unsubscribe();
        subscription = null;
      }

      resolve(result);
    };

    const authListener = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setPasswordRecoveryPending();

        settle({
          session: session || null,
          error: null,
          timedOut: false,
        });

        return;
      }

      if (
        session &&
        (isPasswordRecoveryPending() || hasPasswordRecoveryUrlHint())
      ) {
        settle({
          session,
          error: null,
          timedOut: false,
        });
      }
    });

    subscription = authListener?.data?.subscription || null;

    timeoutId = window.setTimeout(async () => {
      const finalSession = await getAuthSession();
      const hasRecoveryState =
        isPasswordRecoveryPending() || hasPasswordRecoveryUrlHint();

      settle({
        session:
          finalSession.session && hasRecoveryState
            ? finalSession.session
            : null,
        error: finalSession.error,
        timedOut: true,
      });
    }, timeoutMs);
  });
}

export async function recoverPasswordSessionFromUrl() {
  if (!supabase) {
    return {
      session: null,
      error: new Error("Supabase is not configured for this environment."),
      recovered: false,
    };
  }

  const urlState = getRecoveryUrlState();

  if (!urlState.hasRecoveryHint) {
    return {
      session: null,
      error: null,
      recovered: false,
    };
  }

  setPasswordRecoveryPending();

  const searchParams = new URLSearchParams(window.location.search || "");
  const hash = window.location.hash?.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash || "";
  const hashParams = new URLSearchParams(hash);
  const accessToken = hashParams.get("access_token");
  const refreshToken = hashParams.get("refresh_token");
  const code = searchParams.get("code") || hashParams.get("code");

  if (accessToken || refreshToken) {
    if (!accessToken || !refreshToken) {
      return {
        session: null,
        error: new Error("Password recovery link is missing required session tokens."),
        recovered: false,
      };
    }

    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (!error) {
      clearRecoveryUrlParameters();
    }

    return {
      session: data?.session || null,
      error,
      recovered: !error,
    };
  }

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      clearRecoveryUrlParameters();
    }

    return {
      session: data?.session || null,
      error,
      recovered: !error,
    };
  }

  return {
    session: null,
    error: null,
    recovered: false,
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

export async function requestPasswordRecovery(email) {
  if (!supabase) {
    return {
      error: new Error("Supabase is not configured for this environment."),
    };
  }

  const frontendBaseUrl = getFrontendBaseUrl();
  const redirectTo = frontendBaseUrl
    ? `${frontendBaseUrl}/update-password`
    : undefined;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  return { error };
}

export async function updateOperatorPassword(password) {
  if (!supabase) {
    return {
      error: new Error("Supabase is not configured for this environment."),
    };
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  return { error };
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
