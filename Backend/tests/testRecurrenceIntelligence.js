const assert = require("assert");
const {
  evaluateRecurrenceIntelligence
} = require("../services/recurrenceIntelligence");
const {
  buildRecurrenceEndpoint,
  clearLatestCognitionSnapshot,
  setLatestCognitionSnapshot
} = require("../services/cognitionSnapshotStore");

function record(overrides = {}) {
  return {
    timestamp: new Date().toISOString(),
    environment: "CAUTION",
    confidenceLevel: "LOW",
    consensusState: "FULL_CONSENSUS",
    driftState: "STABLE",
    transitionState: "COOLING",
    liquidityState: "STABILIZING",
    ...overrides
  };
}

clearLatestCognitionSnapshot();

const fallback = buildRecurrenceEndpoint();
assert.strictEqual(fallback.recurrenceState, "UNKNOWN");
assert.strictEqual(fallback.summary, "Awaiting recurrence cognition.");

const insufficient = evaluateRecurrenceIntelligence({ history: [record()] });
assert.strictEqual(insufficient.recurrenceState, "UNKNOWN");

const history = [
  record(),
  record(),
  record({ consensusState: "CONFLICTED" }),
  record({ consensusState: "CONFLICTED" }),
  record({ environment: "RECOVERING" }),
  record({ environment: "RECOVERING" })
];
const recurrence = evaluateRecurrenceIntelligence({ history });

assert(["MODERATE_RECURRENCE", "STRONG_RECURRENCE"].includes(recurrence.recurrenceState));
assert(["MODERATE", "HIGH", "SEVERE"].includes(recurrence.recurrenceStrength));
assert(recurrence.recurringThemes.length >= 3);
assert(Array.isArray(recurrence.affectedEcosystems));

setLatestCognitionSnapshot({ recurrence });
const endpoint = buildRecurrenceEndpoint();
assert.strictEqual(endpoint.recurrenceState, recurrence.recurrenceState);
assert(Array.isArray(endpoint.recurringThemes));
assert.notStrictEqual(endpoint.summary, "Awaiting recurrence cognition.");

console.log("Recurrence intelligence test passed.");
