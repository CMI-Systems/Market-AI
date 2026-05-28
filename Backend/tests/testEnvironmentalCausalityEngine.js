const assert = require("assert");
const {
  evaluateEnvironmentalCausality
} = require("../services/environmentalCausalityEngine");
const {
  buildEnvironmentCausalityEndpoint,
  clearLatestCognitionSnapshot,
  setLatestCognitionSnapshot
} = require("../services/cognitionSnapshotStore");

function record(overrides = {}) {
  return {
    timestamp: new Date().toISOString(),
    environment: "STABLE",
    confidenceLevel: "MODERATE",
    liquidityState: "BALANCED",
    signalState: "ALIGNED",
    driftState: "STABLE",
    ecosystemState: "SYNCHRONIZED",
    anomalySeverity: "LOW",
    suppressionLevel: "NONE",
    ...overrides
  };
}

clearLatestCognitionSnapshot();

const fallback = buildEnvironmentCausalityEndpoint();
assert.strictEqual(fallback.causalityState, "UNKNOWN");
assert.strictEqual(fallback.summary, "Awaiting environmental causality cognition.");

const stable = evaluateEnvironmentalCausality({
  history: [
    record({ liquidityState: "STABILIZING", environment: "RECOVERING" }),
    record({ liquidityState: "STABILIZING", environment: "STABLE" }),
    record({ liquidityState: "RELEASING", environment: "STABLE" }),
    record({ liquidityState: "STABILIZING", environment: "RECOVERING" })
  ]
});
assert.strictEqual(stable.causalityState, "STABLE_CAUSALITY");
assert(stable.influenceChains.length >= 3);

const fragmented = evaluateEnvironmentalCausality({
  history: [
    record({ ecosystemState: "FRAGMENTED" }),
    record({ ecosystemState: "DIVERGENT" }),
    record({ ecosystemState: "FRAGMENTED" }),
    record({ ecosystemState: "DIVERGENT" }),
    record({ ecosystemState: "FRAGMENTED" })
  ]
});
assert.strictEqual(fragmented.causalityState, "FRACTURED_CAUSALITY");

const volatile = evaluateEnvironmentalCausality({
  history: [
    record({ liquidityState: "PRESSURED" }),
    record({ signalState: "SUPPRESSED", anomalySeverity: "HIGH", suppressionLevel: "HIGH" }),
    record({ liquidityState: "FRAGMENTED" }),
    record({ signalState: "UNSTABLE", anomalySeverity: "HIGH", suppressionLevel: "SEVERE" }),
    record({ anomalySeverity: "HIGH", suppressionLevel: "HIGH" })
  ]
});
assert.strictEqual(volatile.causalityState, "VOLATILE_CAUSALITY");
assert(volatile.dominantDrivers.length >= 1);

setLatestCognitionSnapshot({ environmentCausality: volatile });
const endpoint = buildEnvironmentCausalityEndpoint();
assert.strictEqual(endpoint.causalityState, "VOLATILE_CAUSALITY");
assert(Array.isArray(endpoint.influenceChains));
assert.notStrictEqual(endpoint.summary, "Awaiting environmental causality cognition.");

console.log("Environmental causality engine test passed.");
