const assert = require("assert");
const {
  evaluateAdaptiveSignalIntelligence
} = require("../services/adaptiveSignalIntelligence");
const {
  buildAdaptiveSignalsEndpoint,
  clearLatestCognitionSnapshot,
  setLatestCognitionSnapshot
} = require("../services/cognitionSnapshotStore");

clearLatestCognitionSnapshot();

const fallback = buildAdaptiveSignalsEndpoint();
assert.strictEqual(fallback.signalState, "UNKNOWN");
assert.strictEqual(fallback.summary, "Awaiting adaptive signal cognition.");

const aligned = evaluateAdaptiveSignalIntelligence({
  crossBrainConsensus: { consensusState: "FULL_CONSENSUS" },
  crossSymbolEcosystem: { ecosystemState: "SYNCHRONIZED" },
  marketStructure: { structureState: "STRENGTHENING" },
  regimeTransition: { regimeState: "STABLE" },
  institutionalFlow: { flowState: "ACCUMULATING" },
  liquidityPressure: { liquidityState: "BALANCED", vulnerabilityLevel: "LOW" },
  anomalyIntelligence: { severity: "LOW" },
  cognitiveDrift: { driftState: "STABLE" }
});
assert.strictEqual(aligned.signalState, "REINFORCED");
assert.strictEqual(aligned.signalTrust, "HIGH");
assert.strictEqual(aligned.suppressionLevel, "NONE");
assert(["MODERATE", "HIGH"].includes(aligned.reinforcementLevel));
assert(aligned.confidenceWeight > 0.5);

const suppressed = evaluateAdaptiveSignalIntelligence({
  crossBrainConsensus: { consensusState: "FAILSAFE_PRIORITY" },
  crossSymbolEcosystem: { ecosystemState: "DIVERGENT" },
  marketStructure: { structureState: "WEAKENING" },
  regimeTransition: { regimeState: "UNSTABLE" },
  liquidityPressure: { liquidityState: "PRESSURED", vulnerabilityLevel: "SEVERE" },
  anomalyIntelligence: { severity: "HIGH" },
  cognitiveDrift: { driftState: "VOLATILE" }
});
assert.strictEqual(suppressed.signalState, "SUPPRESSED");
assert.strictEqual(suppressed.signalTrust, "INVALID");
assert.strictEqual(suppressed.suppressionLevel, "SEVERE");
assert(suppressed.warnings.length >= 4);

const conflicted = evaluateAdaptiveSignalIntelligence({
  crossBrainConsensus: { consensusState: "CONFLICTED" },
  crossSymbolEcosystem: { ecosystemState: "DIVERGENT" },
  marketStructure: { structureState: "RANGING" },
  regimeTransition: { regimeState: "CAUTION" },
  liquidityPressure: { liquidityState: "BALANCED", vulnerabilityLevel: "LOW" },
  anomalyIntelligence: { severity: "LOW" },
  cognitiveDrift: { driftState: "STABLE" }
});
assert.strictEqual(conflicted.signalState, "CONFLICTED");
assert.strictEqual(conflicted.coherenceLevel, "CONFLICTED");
assert.strictEqual(conflicted.suppressionLevel, "MODERATE");

setLatestCognitionSnapshot({ adaptiveSignals: suppressed });
const endpoint = buildAdaptiveSignalsEndpoint();
assert.strictEqual(endpoint.signalState, "SUPPRESSED");
assert.strictEqual(endpoint.signalTrust, "INVALID");
assert(Array.isArray(endpoint.warnings));
assert.notStrictEqual(endpoint.summary, "Awaiting adaptive signal cognition.");

console.log("Adaptive signal intelligence test passed.");
