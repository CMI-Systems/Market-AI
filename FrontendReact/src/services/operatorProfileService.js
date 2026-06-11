function safeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function deriveDisplayName(user) {
  const metadata = user?.user_metadata || {};
  const fullName = safeString(metadata.full_name);
  const name = safeString(metadata.name);
  const email = safeString(user?.email);

  if (fullName) return fullName;
  if (name) return name;
  if (email.includes("@")) return email.split("@")[0];
  if (email) return email;

  return "Guest Operator";
}

export function isClosedBetaApproved(email) {
  const normalizedEmail = safeString(email).toLowerCase();
  const allowlist = safeString(import.meta.env?.VITE_CLOSED_BETA_EMAILS)
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  if (!normalizedEmail || !allowlist.length) return false;

  return allowlist.includes(normalizedEmail);
}

export function getCurrentOperator(session) {
  const user = session?.user || null;

  if (!user) {
    return {
      id: null,
      email: null,
      displayName: "Guest Operator",
      betaStatus: "UNAUTHENTICATED",
      authenticated: false,
      betaApproved: false,
    };
  }

  const email = user.email || null;
  const betaApproved = isClosedBetaApproved(email);

  return {
    id: user.id || null,
    email,
    displayName: deriveDisplayName(user),
    betaStatus: betaApproved ? "CLOSED_BETA_APPROVED" : "CLOSED_BETA_PENDING",
    authenticated: true,
    betaApproved,
  };
}
