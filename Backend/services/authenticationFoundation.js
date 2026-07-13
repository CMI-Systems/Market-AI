const crypto = require("crypto");

const AWAITING_SESSION_STATUS = "Awaiting session status.";
const SESSION_TTL_MS = 60 * 60 * 1000;
const sessions = new Map();

function createUnauthenticatedStatus() {
  return {
    authState: "UNAUTHENTICATED",
    sessionState: "MISSING",
    operatorRole: null,
    warnings: ["Authenticated operator session is required."],
    summary: "Operator session is unavailable."
  };
}

function createLocalSession(operatorRole = "operator", now = Date.now()) {
  const sessionId = crypto.randomBytes(16).toString("hex");
  const session = {
    sessionId,
    operatorRole,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + SESSION_TTL_MS).toISOString()
  };
  sessions.set(sessionId, session);
  return session;
}

function validateSession(sessionId, now = Date.now(), options = {}) {
  const session = sessionId ? sessions.get(sessionId) : null;

  if (!session) {
    const localDevelopmentAllowed =
      options.allowLocalDevFallback === true &&
      String(options.nodeEnv || process.env.NODE_ENV || "").toLowerCase() === "development";

    if (localDevelopmentAllowed) {
      return {
        authState: "LOCAL_DEV",
        sessionState: "LOCAL_DEV",
        operatorRole: "operator",
        warnings: ["Explicit local development session fallback is active."],
        summary: "Local development authentication foundation is active."
      };
    }

    return createUnauthenticatedStatus();
  }

  if (Date.parse(session.expiresAt) <= now) {
    sessions.delete(sessionId);
    return {
      authState: "EXPIRED",
      sessionState: "EXPIRED",
      operatorRole: session.operatorRole,
      warnings: ["Operator session expired safely."],
      summary: "Operator session expired."
    };
  }

  return {
    authState: "AUTHENTICATED",
    sessionState: "ACTIVE",
    operatorRole: session.operatorRole,
    warnings: [],
    summary: "Operator session is active."
  };
}

function getSessionStatus(sessionId, options = {}) {
  return validateSession(sessionId, Date.now(), options);
}

module.exports = {
  AWAITING_SESSION_STATUS,
  createLocalSession,
  getSessionStatus,
  validateSession
};
