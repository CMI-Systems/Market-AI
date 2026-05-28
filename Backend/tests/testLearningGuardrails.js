const assert = require("assert");
const {
  evaluateLearningGuardrails
} = require("../services/learningGuardrails");
const {
  buildLearningGuardrailsEndpoint,
  clearLatestCognitionSnapshot,
  setLatestCognitionSnapshot
} = require("../services/cognitionSnapshotStore");

function record(overrides = {}) {
  return {
    signalState: "ALIGNED",
    suppressionLevel: "NONE",
    driftState: "STABLE",
    ...overrides
  };
}

clearLatestCognitionSnapshot();

const fallback = buildLearningGuardrailsEndpoint();
assert.strictEqual(fallback.guardrailState, "UNKNOWN");
assert.strictEqual(fallback.summary, "Awaiting learning guardrail cognition.");

const insufficient = evaluateLearningGuardrails({ history: [record()] });
assert.strictEqual(insufficient.guardrailState, "INSUFFICIENT_DATA");
assert.strictEqual(insufficient.learningAllowed, false);

const clear = evaluateLearningGuardrails({
  history: [record(), record(), record(), record()],
  failsafeBrain: { status: "STANDBY" },
  confidenceProfile: { level: "MODERATE" }
});
assert.strictEqual(clear.guardrailState, "CLEAR");
assert.strictEqual(clear.learningAllowed, true);

const caution = evaluateLearningGuardrails({
  history: [record(), record({ signalState: "SUPPRESSED", suppressionLevel: "HIGH" }), record(), record()],
  failsafeBrain: { status: "STANDBY" },
  confidenceProfile: { level: "LOW" }
});
assert.strictEqual(caution.guardrailState, "CAUTION");
assert.strictEqual(caution.learningAllowed, true);

const blocked = evaluateLearningGuardrails({
  history: [record(), record(), record(), record()],
  failsafeBrain: { status: "ACTIVE" },
  confidenceProfile: { level: "AVOID" }
});
assert.strictEqual(blocked.guardrailState, "BLOCKED");
assert.strictEqual(blocked.learningAllowed, false);
assert(blocked.blockedReasons.length >= 2);
assert(!Object.prototype.hasOwnProperty.call(blocked, "action"));

setLatestCognitionSnapshot({ learningGuardrails: blocked });
const endpoint = buildLearningGuardrailsEndpoint();
assert.strictEqual(endpoint.guardrailState, "BLOCKED");
assert.strictEqual(endpoint.learningAllowed, false);
assert.notStrictEqual(endpoint.summary, "Awaiting learning guardrail cognition.");

console.log("Learning guardrails test passed.");
