import { supabase } from "./supabaseClient";

const APPROVED_BETA_STATUS = "CLOSED_BETA_APPROVED";

function safeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function deriveDisplayName(user, profile) {
  const profileName = safeString(profile?.display_name);
  const metadata = user?.user_metadata || {};
  const fullName = safeString(metadata.full_name);
  const name = safeString(metadata.name);
  const email = safeString(user?.email);

  if (profileName) return profileName;
  if (fullName) return fullName;
  if (name) return name;
  if (email.includes("@")) return email.split("@")[0];
  if (email) return email;

  return "Guest Operator";
}

function createOperatorResult(user, overrides = {}, profile = null) {
  return {
    id: user?.id || null,
    email: user?.email || null,
    displayName: deriveDisplayName(user, profile),
    betaStatus: "UNAUTHENTICATED",
    authenticated: Boolean(user),
    betaApproved: false,
    authorizationState: user ? "DENIED" : "UNAUTHENTICATED",
    authorizationErrorCode: null,
    profileFound: false,
    ...overrides,
  };
}

function logAuthorizationError(error) {
  const code = safeString(error?.code) || "UNKNOWN";
  console.error("AICC operator authorization query failed.", { code });
}

export async function getCurrentOperator(session) {
  const user = session?.user || null;

  if (!user) {
    return createOperatorResult(null);
  }

  if (!supabase) {
    console.error("AICC operator authorization is unavailable.");
    return createOperatorResult(user, {
      betaStatus: "AUTHORIZATION_UNAVAILABLE",
      authorizationState: "QUERY_ERROR",
      authorizationErrorCode: "SUPABASE_NOT_CONFIGURED",
    });
  }

  let result;

  try {
    result = await supabase
      .from("operator_profiles")
      .select("id, display_name, beta_status, beta_approved")
      .eq("id", user.id)
      .maybeSingle();
  } catch (queryError) {
    logAuthorizationError(queryError);
    return createOperatorResult(user, {
      betaStatus: "AUTHORIZATION_UNAVAILABLE",
      authorizationState: "QUERY_ERROR",
      authorizationErrorCode: safeString(queryError?.code) || "UNKNOWN",
    });
  }

  const { data: profile, error } = result;

  if (error) {
    logAuthorizationError(error);
    return createOperatorResult(user, {
      betaStatus: "AUTHORIZATION_UNAVAILABLE",
      authorizationState: "QUERY_ERROR",
      authorizationErrorCode: safeString(error.code) || "UNKNOWN",
    });
  }

  if (!profile) {
    console.warn("AICC operator profile was not found; access remains blocked.");
    return createOperatorResult(user, {
      betaStatus: "PROFILE_MISSING",
      authorizationState: "PROFILE_MISSING",
    });
  }

  const betaStatus = safeString(profile.beta_status) || "UNKNOWN";
  const statusApproved = betaStatus === APPROVED_BETA_STATUS;
  const flagApproved = profile.beta_approved === true;
  const betaApproved = statusApproved && flagApproved;
  const approvalInconsistent = statusApproved !== flagApproved;

  return createOperatorResult(user, {
    displayName: deriveDisplayName(user, profile),
    betaStatus: approvalInconsistent
      ? "APPROVAL_INCONSISTENT"
      : betaStatus,
    betaApproved,
    authorizationState: betaApproved
      ? "APPROVED"
      : approvalInconsistent
        ? "APPROVAL_INCONSISTENT"
        : "PENDING",
    profileFound: true,
  }, profile);
}
