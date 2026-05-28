const assert = require("assert");
const {
  evaluateAdaptiveThresholds
} = require("../services/adaptiveThresholdEngine");
const {
  buildAdaptiveThresholdsEndpoint,
  clearLatestCognitionSnapshot,
  setLatestCognitionSnapshot
} = require("../services/cognitionSnapshotStore");

function record(overrides = {}) {
  return {
    environment: "STABLE",
    signalState: "ALIGNED",
    suppressionLevel: "NONE",
    ...overrides
  };
}

clearLatestCognitionSnapshot();

const fallback = buildAdaptiveThresholdsEndpoint();
assert.strictEqual(fallback.thresholdState, "UNKNOWN");
assert.strictEqual(fallback.summary, "Awaiting adaptive threshold cognition.");

const insufficient = evaluateAdaptiveThresholds({ history: [record()], learningGuardrails: { guardrailState: "CLEAR" } });
assert.strictEqual(insufficient.thresholdState, "INSUFFICIENT_DATA");

const tightening = evaluateAdaptiveThresholds({
  history: [
    record({ environment: "UNSTABLE", signalState: "SUPPRESSED", suppressionLevel: "HIGH" }),
    record({ environment: "FRAGMENTED", signalState: "UNSTABLE", suppressionLevel: "SEVERE" }),
    record({ environment: "UNSTABLE", signalState: "SUPPRESSED", suppressionLevel: "HIGH" }),
    record({ environment: "HIGH_RISK", signalState: "SUPPRESSED", suppressionLevel: "HIGH" }),
    record({ environment: "FRAGMENTED", signalState: "UNSTABLE", suppressionLevel: "SEVERE" })
  ],
  learningGuardrails: { guardrailState: "CAUTION" }
});
assert.strictEqual(tightening.thresholdState, "TIGHTENING");
assert.strictEqual(tightening.adjustedThresholds.consensusRequirement, "STRICTER");

const loosening = evaluateAdaptiveThresholds({
  history: [
    record(), record(), record(), record(),
    record({ environment: "FAVORABLE", signalState: "REINFORCED" }),
    record({ environment: "OPTIMAL", signalState: "ALIGNED" }),
    record({ environment: "RECOVERING", signalState: "REINFORCED" })
  ],
  learningGuardrails: { guardrailState: "CLEAR" }
});
assert.strictEqual(loosening.thresholdState, "LOOSENING");
assert.strictEqual(loosening.adjustedThresholds.confidenceFloor, "RELAXED");

setLatestCognitionSnapshot({ adaptiveThresholds: tightening });
const endpoint = buildAdaptiveThresholdsEndpoint();
assert.strictEqual(endpoint.thresholdState, "TIGHTENING");
assert(endpoint.adjustedThresholds);
assert.notStrictEqual(endpoint.summary, "Awaiting adaptive threshold cognition.");

console.log("Adaptive threshold engine test passed.");
