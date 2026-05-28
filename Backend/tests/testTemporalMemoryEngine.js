const assert = require("assert");
const {
  clearTemporalHistory,
  evaluateTemporalMemory,
  rememberTemporalCognition
} = require("../services/temporalMemoryEngine");
const {
  buildTemporalMemoryEndpoint,
  clearLatestCognitionSnapshot,
  setLatestCognitionSnapshot
} = require("../services/cognitionSnapshotStore");

clearTemporalHistory();
clearLatestCognitionSnapshot();

const fallback = buildTemporalMemoryEndpoint();
assert.strictEqual(fallback.temporalState, "UNKNOWN");
assert.strictEqual(fallback.summary, "Awaiting temporal memory cognition.");

const insufficient = evaluateTemporalMemory({ history: [] });
assert.strictEqual(insufficient.temporalState, "INSUFFICIENT_HISTORY");
assert.strictEqual(insufficient.memoryDepth, "LOW");

for (let index = 0; index < 8; index += 1) {
  rememberTemporalCognition({
    strategicEnvironment: { environment: "CAUTION", stability: "MODERATE" },
    confidenceProfile: { level: index % 2 === 0 ? "LOW" : "MODERATE" },
    crossBrainConsensus: { consensusState: "PARTIAL_CONSENSUS" },
    cognitiveDrift: { driftState: "STABLE" },
    regimeTransition: { regimeState: "CAUTION", transitionState: "COOLING" },
    liquidityPressure: { liquidityState: "STABILIZING", pressureState: "STABILIZING" }
  });
}

const temporalMemory = evaluateTemporalMemory({
  history: rememberTemporalCognition({
    strategicEnvironment: { environment: "CAUTION", stability: "MODERATE" },
    confidenceProfile: { level: "LOW" },
    crossBrainConsensus: { consensusState: "PARTIAL_CONSENSUS" },
    cognitiveDrift: { driftState: "STABLE" },
    regimeTransition: { regimeState: "CAUTION", transitionState: "COOLING" },
    liquidityPressure: { liquidityState: "STABILIZING", pressureState: "STABILIZING" }
  })
});

assert.strictEqual(temporalMemory.temporalState, "RECURRING_PATTERN");
assert.strictEqual(temporalMemory.memoryDepth, "LOW");
assert(temporalMemory.recurringPatterns.length >= 3);
assert(temporalMemory.longHorizonSignals.length >= 1);

setLatestCognitionSnapshot({ temporalMemory });
const endpoint = buildTemporalMemoryEndpoint();
assert.strictEqual(endpoint.temporalState, "RECURRING_PATTERN");
assert(Array.isArray(endpoint.recurringPatterns));
assert.notStrictEqual(endpoint.summary, "Awaiting temporal memory cognition.");

console.log("Temporal memory engine test passed.");
