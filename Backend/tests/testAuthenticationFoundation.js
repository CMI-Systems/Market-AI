const assert = require("assert");
const {
  createLocalSession,
  getSessionStatus,
  validateSession
} = require("../services/authenticationFoundation");

const session = createLocalSession("operator", 1000);
const active = validateSession(session.sessionId, 2000);
assert.strictEqual(active.authState, "AUTHENTICATED");
assert.strictEqual(active.sessionState, "ACTIVE");

const expired = validateSession(session.sessionId, 1000 + 60 * 60 * 1000 + 1);
assert.strictEqual(expired.authState, "EXPIRED");

const fallback = getSessionStatus(null);
assert.strictEqual(fallback.authState, "LOCAL_DEV");
assert(!Object.prototype.hasOwnProperty.call(fallback, "password"));

console.log("Authentication foundation test passed.");
