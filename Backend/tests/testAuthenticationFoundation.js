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

const missingByDefault = getSessionStatus(null);
assert.strictEqual(missingByDefault.authState, "UNAUTHENTICATED");

const stagingFallback = getSessionStatus(null, {
  allowLocalDevFallback: true,
  nodeEnv: "staging"
});
assert.strictEqual(stagingFallback.authState, "UNAUTHENTICATED");

const explicitDevelopmentFallback = getSessionStatus(null, {
  allowLocalDevFallback: true,
  nodeEnv: "development"
});
assert.strictEqual(explicitDevelopmentFallback.authState, "LOCAL_DEV");
assert(!Object.prototype.hasOwnProperty.call(explicitDevelopmentFallback, "password"));

console.log("Authentication foundation test passed.");
