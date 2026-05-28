const crypto = require("crypto");

const AWAITING_SESSION_STATUS = "Awaiting session status.";
const SESSION_TTL_MS = 60 * 60 * 1000;
const sessions = new Map();

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

function validateSession(sessionId, now = Date.now()) {
  const session = sessionId ? sessions.get(sessionId) : null;
  if (!session) {
    return {
      authState: "LOCAL_DEV",
      sessionState: "LOCAL_DEV",
      operatorRole: "operator",
      warnings: ["Local development session fallback is active."],
      summary: "Local development authentication foundation is active."
    };
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

function getSessionStatus(sessionId) {
  return validateSession(sessionId);
}

module.exports = {
  AWAITING_SESSION_STATUS,
  createLocalSession,
  getSessionStatus,
  validateSession
};
