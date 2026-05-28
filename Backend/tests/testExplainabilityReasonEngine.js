const assert = require("assert");
const {
  evaluateExplainabilityReasons
} = require("../services/explainabilityReasonEngine");
const {
  buildExplainabilityEndpoint,
  clearLatestCognitionSnapshot,
  setLatestCognitionSnapshot
} = require("../services/cognitionSnapshotStore");

clearLatestCognitionSnapshot();

const fallback = buildExplainabilityEndpoint();
assert.strictEqual(fallback.explainabilityState, "UNKNOWN");
assert.strictEqual(fallback.summary, "Awaiting explainability cognition.");

const explainability = evaluateExplainabilityReasons({
  confidenceProfile: { level: "LOW" },
  adaptiveSignalIntelligence: { signalState: "SUPPRESSED" },
  crossBrainConsensus: { consensusState: "CONFLICTED" },
  liquidityPressure: { liquidityState: "PRESSURED" },
  crossSymbolEcosystem: { ecosystemState: "DIVERGENT" },
  regimeTransition: { regimeState: "TRANSITIONAL" },
  temporalSequence: { sequenceState: "ESCALATING" },
  environmentalCausality: { causalityState: "VOLATILE_CAUSALITY" }
});

assert.strictEqual(explainability.explainabilityState, "FRAGMENTED");
assert(explainability.reasoningChains.length >= 5);
assert(explainability.suppressionReasons.length >= 1);

const reinforced = evaluateExplainabilityReasons({
  confidenceProfile: { level: "MODERATE" },
  adaptiveSignalIntelligence: { signalState: "REINFORCED" },
  crossBrainConsensus: { consensusState: "FULL_CONSENSUS" },
  liquidityPressure: { liquidityState: "BALANCED" },
  crossSymbolEcosystem: { ecosystemState: "SYNCHRONIZED" }
});
assert(reinforced.reinforcementReasons.length >= 1);

setLatestCognitionSnapshot({ explainability });
const endpoint = buildExplainabilityEndpoint();
assert.strictEqual(endpoint.explainabilityState, "FRAGMENTED");
assert(Array.isArray(endpoint.reasoningChains));
assert.notStrictEqual(endpoint.summary, "Awaiting explainability cognition.");

console.log("Explainability reason engine test passed.");
