export function displayState(value, fallback = "OFFLINE") {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value).replace(/_/g, " ");
}

export function isWebullClosedBetaLocked(webull = {}) {
  return webull.enabled === false || webull.status === "MISSING_CREDENTIALS";
}

export function displayWebullStatus(webull = {}) {
  return isWebullClosedBetaLocked(webull)
    ? "INTEGRATION PENDING"
    : displayState(webull.status, "PENDING");
}

export function displayWebullConfigured(webull = {}) {
  return isWebullClosedBetaLocked(webull)
    ? "CLOSED BETA LOCKED"
    : webull.configured
      ? "YES"
      : "NO";
}

export function displayWebullEnvironment(webull = {}) {
  return isWebullClosedBetaLocked(webull)
    ? "PAPER PLANNED"
    : displayState(webull.environment, "UNKNOWN");
}

export function displayWebullActivation(webull = {}) {
  return isWebullClosedBetaLocked(webull)
    ? "PLANNED"
    : webull.readyForActivation
      ? "YES"
      : "NO";
}

export function displayProviderWarning(warning) {
  if (!warning) return "CLEAR";

  return String(warning).toUpperCase().includes("WEBULL")
    ? "Webull provider is reserved for a future closed-beta activation phase."
    : warning;
}
