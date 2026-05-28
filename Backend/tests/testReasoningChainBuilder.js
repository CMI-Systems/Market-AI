const assert = require("assert");
const {
  evaluateReasoningChains
} = require("../services/reasoningChainBuilder");
const {
  buildReasoningChainsEndpoint,
  clearLatestCognitionSnapshot,
  setLatestCognitionSnapshot
} = require("../services/cognitionSnapshotStore");

clearLatestCognitionSnapshot();

const fallback = buildReasoningChainsEndpoint();
assert.strictEqual(fallback.chainState, "UNKNOWN");
assert.strictEqual(fallback.summary, "Awaiting reasoning chains.");

const chains = evaluateReasoningChains({
  confidenceProfile: { level: "LOW" },
  adaptiveSignalIntelligence: { signalState: "SUPPRESSED", suppressionLevel: "HIGH", coherenceLevel: "CONFLICTED" },
  temporalSequence: { sequenceState: "ESCALATING", progressionMomentum: "HIGH" },
  crossSymbolEcosystem: { ecosystemState: "DIVERGENT", correlationStrength: "WEAK" },
  crossBrainConsensus: { consensusState: "CONFLICTED", agreementStrength: "WEAK", divergenceRisk: "HIGH" },
  liquidityPressure: { liquidityState: "PRESSURED" },
  environmentalCausality: { causalityState: "VOLATILE_CAUSALITY" },
  explainabilityReasons: { warnings: ["Explainability warning."] }
});

assert(["STRUCTURED", "FRAGMENTED"].includes(chains.chainState));
assert(chains.chains.length >= 4);
assert(chains.dominantChain);
assert(chains.chains.every((chain) => Array.isArray(chain.steps)));

setLatestCognitionSnapshot({ reasoningChains: chains });
const endpoint = buildReasoningChainsEndpoint();
assert(Array.isArray(endpoint.chains));
assert.notStrictEqual(endpoint.summary, "Awaiting reasoning chains.");

console.log("Reasoning chain builder test passed.");
