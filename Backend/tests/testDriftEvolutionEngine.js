const assert = require("assert");
const {
  buildDriftEvolution
} = require("../services/driftEvolutionEngine");
const {
  buildDriftEvolutionEndpoint,
  clearLatestCognitionSnapshot,
  setLatestCognitionSnapshot
} = require("../services/cognitionSnapshotStore");

clearLatestCognitionSnapshot();

const fallback = buildDriftEvolutionEndpoint();
assert.strictEqual(fallback.driftState, "UNKNOWN");
assert.strictEqual(fallback.summary, "Awaiting drift evolution.");

const drift = buildDriftEvolution({
  memoryEntries: [
    { confidenceLevel: "LOW", suppressionState: "SUPPRESSED", replayState: "DRIFTING", ecosystemState: "FRAGMENTED", environment: "CAUTION", reinforcementLevel: "NONE" },
    { confidenceLevel: "LOW", suppressionState: "UNSTABLE", replayState: "ESCALATING", ecosystemState: "DIVERGENT", environment: "CAUTION", reinforcementLevel: "NONE" },
    { confidenceLevel: "MODERATE", suppressionState: "ALIGNED", replayState: "STABILIZING", ecosystemState: "SYNCHRONIZED", environment: "STABLE", reinforcementLevel: "HIGH" }
  ]
});
assert(["EVOLVING", "DETERIORATING", "STABILIZING"].includes(drift.driftState));
assert(drift.driftMetrics);
assert(drift.dominantDrift);

setLatestCognitionSnapshot({ driftEvolution: drift });
const endpoint = buildDriftEvolutionEndpoint();
assert(endpoint.driftMetrics);
assert.notStrictEqual(endpoint.summary, "Awaiting drift evolution.");

console.log("Drift evolution engine test passed.");
