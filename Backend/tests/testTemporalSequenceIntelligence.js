const assert = require("assert");
const {
  evaluateTemporalSequence
} = require("../services/temporalSequenceIntelligence");
const {
  buildTemporalSequencesEndpoint,
  clearLatestCognitionSnapshot,
  setLatestCognitionSnapshot
} = require("../services/cognitionSnapshotStore");

function record(overrides = {}) {
  return {
    timestamp: new Date().toISOString(),
    environment: "STABLE",
    confidenceLevel: "MODERATE",
    transitionState: "STABILIZING",
    liquidityState: "BALANCED",
    pressureState: "STABILIZING",
    driftState: "STABLE",
    signalState: "ALIGNED",
    suppressionLevel: "NONE",
    anomalySeverity: "LOW",
    ecosystemState: "SYNCHRONIZED",
    ...overrides
  };
}

clearLatestCognitionSnapshot();

const fallback = buildTemporalSequencesEndpoint();
assert.strictEqual(fallback.sequenceState, "UNKNOWN");
assert.strictEqual(fallback.summary, "Awaiting temporal sequence cognition.");

const accelerating = evaluateTemporalSequence({
  history: [
    record({ confidenceLevel: "LOW", signalState: "ALIGNED" }),
    record({ confidenceLevel: "LOW", signalState: "SUPPRESSED", suppressionLevel: "HIGH" }),
    record({ confidenceLevel: "LOW", signalState: "SUPPRESSED", suppressionLevel: "HIGH" }),
    record({ confidenceLevel: "LOW", signalState: "SUPPRESSED", suppressionLevel: "HIGH" })
  ]
});
assert.strictEqual(accelerating.sequenceState, "ACCELERATING");
assert(["LOW", "MODERATE", "HIGH", "SEVERE"].includes(accelerating.progressionMomentum));
assert(accelerating.transitionChains.length >= 1);

const cooling = evaluateTemporalSequence({
  history: [
    record({ transitionState: "ACTIVE", pressureState: "AMPLIFYING" }),
    record({ transitionState: "COOLING", pressureState: "STABILIZING", liquidityState: "COMPRESSED" }),
    record({ transitionState: "COOLING", pressureState: "STABILIZING", liquidityState: "COMPRESSED" }),
    record({ transitionState: "COOLING", pressureState: "STABILIZING", liquidityState: "COMPRESSED" })
  ]
});
assert.strictEqual(cooling.sequenceState, "COOLING");

const recovering = evaluateTemporalSequence({
  history: [
    record({ environment: "CAUTION", liquidityState: "PRESSURED" }),
    record({ environment: "RECOVERING", liquidityState: "RELEASING" }),
    record({ environment: "RECOVERING", liquidityState: "RELEASING" }),
    record({ environment: "RECOVERING", liquidityState: "RELEASING" }),
    record({ environment: "RECOVERING", liquidityState: "RELEASING" })
  ]
});
assert.strictEqual(recovering.sequenceState, "RECOVERING");

setLatestCognitionSnapshot({ temporalSequences: accelerating });
const endpoint = buildTemporalSequencesEndpoint();
assert.strictEqual(endpoint.sequenceState, "ACCELERATING");
assert(Array.isArray(endpoint.activeSequences));
assert.notStrictEqual(endpoint.summary, "Awaiting temporal sequence cognition.");

console.log("Temporal sequence intelligence test passed.");
