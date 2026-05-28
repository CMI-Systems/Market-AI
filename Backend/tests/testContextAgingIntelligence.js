const assert = require("assert");
const {
  evaluateContextAging
} = require("../services/contextAgingIntelligence");
const {
  buildContextAgingEndpoint,
  clearLatestCognitionSnapshot,
  setLatestCognitionSnapshot
} = require("../services/cognitionSnapshotStore");

function record(minutesAgo, confidenceLevel = "MODERATE") {
  return {
    timestamp: new Date(Date.now() - minutesAgo * 60000).toISOString(),
    confidenceLevel
  };
}

clearLatestCognitionSnapshot();

const fallback = buildContextAgingEndpoint();
assert.strictEqual(fallback.contextAgeState, "UNKNOWN");
assert.strictEqual(fallback.summary, "Awaiting context aging cognition.");

const insufficient = evaluateContextAging({ history: [record(0)] });
assert.strictEqual(insufficient.contextAgeState, "INSUFFICIENT");
assert.strictEqual(insufficient.freshnessScore, 0);

const fresh = evaluateContextAging({
  history: [record(0), record(0), record(0), record(0), record(0), record(0)]
});
assert.strictEqual(fresh.contextAgeState, "FRESH");
assert(fresh.freshnessScore >= 0 && fresh.freshnessScore <= 1);

const stale = evaluateContextAging({
  history: [record(30), record(28), record(25), record(22), record(20), record(18)]
});
assert.strictEqual(stale.contextAgeState, "STALE");
assert(stale.freshnessScore >= 0 && stale.freshnessScore <= 1);
assert(stale.staleContexts.length >= 1);

setLatestCognitionSnapshot({ contextAging: fresh });
const endpoint = buildContextAgingEndpoint();
assert.strictEqual(endpoint.contextAgeState, "FRESH");
assert(endpoint.freshnessScore >= 0 && endpoint.freshnessScore <= 1);
assert.notStrictEqual(endpoint.summary, "Awaiting context aging cognition.");

console.log("Context aging intelligence test passed.");
