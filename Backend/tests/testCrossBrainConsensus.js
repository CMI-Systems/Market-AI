const assert = require("assert");
const {
  evaluateCrossBrainConsensus
} = require("../services/crossBrainConsensusEngine");
const {
  buildBrainConsensusEndpoint,
  clearLatestCognitionSnapshot,
  setLatestCognitionSnapshot
} = require("../services/cognitionSnapshotStore");

clearLatestCognitionSnapshot();

const fallback = buildBrainConsensusEndpoint();
assert.strictEqual(fallback.consensusState, "UNKNOWN");
assert.strictEqual(fallback.summary, "Awaiting cross-brain consensus cognition.");

const fullConsensus = evaluateCrossBrainConsensus({
  tacticalBrain: { status: "OBSERVING", confidence: 0.82 },
  behavioralBrain: { status: "OBSERVING", confidence: 0.74 },
  failsafeBrain: { status: "STANDBY", confidence: 1 }
});
assert.strictEqual(fullConsensus.consensusState, "FULL_CONSENSUS");
assert.strictEqual(fullConsensus.agreementStrength, "STRONG");
assert.strictEqual(fullConsensus.divergenceRisk, "LOW");
assert.strictEqual(fullConsensus.participatingBrains.length, 3);

const failsafePriority = evaluateCrossBrainConsensus({
  tacticalBrain: { status: "OBSERVING", confidence: 0.65 },
  behavioralBrain: { status: "OBSERVING", confidence: 0.62 },
  failsafeBrain: { status: "ACTIVE", confidence: 1 }
});
assert.strictEqual(failsafePriority.consensusState, "FAILSAFE_PRIORITY");
assert.strictEqual(failsafePriority.divergenceRisk, "SEVERE");
assert(failsafePriority.warnings.length >= 1);

const unstable = evaluateCrossBrainConsensus({
  tacticalBrain: { status: "DEGRADED", confidence: 0.31 },
  behavioralBrain: { status: "OBSERVING", confidence: 0.68 },
  failsafeBrain: { status: "STANDBY", confidence: 1 }
});
assert.strictEqual(unstable.consensusState, "UNSTABLE");
assert.strictEqual(unstable.agreementStrength, "FRAGMENTED");
assert.strictEqual(unstable.divergenceRisk, "HIGH");

setLatestCognitionSnapshot({ brainConsensus: fullConsensus });
const endpoint = buildBrainConsensusEndpoint();
assert.strictEqual(endpoint.consensusState, "FULL_CONSENSUS");
assert(Array.isArray(endpoint.participatingBrains));
assert.notStrictEqual(endpoint.summary, "Awaiting cross-brain consensus cognition.");

console.log("Cross-brain consensus test passed.");
