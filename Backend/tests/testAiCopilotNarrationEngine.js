const assert = require("assert");
const {
  evaluateAiCopilotNarration
} = require("../services/aiCopilotNarrationEngine");
const {
  buildCopilotEndpoint,
  clearLatestCognitionSnapshot,
  setLatestCognitionSnapshot
} = require("../services/cognitionSnapshotStore");

clearLatestCognitionSnapshot();

const fallback = buildCopilotEndpoint();
assert.strictEqual(fallback.narrationState, "UNKNOWN");
assert.strictEqual(fallback.summary, "Awaiting AI Copilot narration.");

const narration = evaluateAiCopilotNarration({
  strategicEnvironment: { environment: "CAUTION", stability: "MODERATE", summary: "Environment requires operator awareness." },
  adaptiveSignalIntelligence: { signalState: "ALIGNED", signalTrust: "MODERATE", coherenceLevel: "PARTIAL" },
  crossBrainConsensus: { consensusState: "PARTIAL_CONSENSUS", agreementStrength: "MODERATE" },
  temporalMemory: { temporalState: "RECURRING_PATTERN" },
  liquidityPressure: { liquidityState: "BALANCED" },
  crossSymbolEcosystem: { ecosystemState: "PARTIALLY_SYNCHRONIZED" },
  replaySummary: { timelineSummary: "Replay timeline is coherent." }
});

assert.strictEqual(narration.narrationState, "ACTIVE");
assert(narration.cognitionSummary.includes("ALIGNED"));
assert(narration.environmentSummary.includes("CAUTION"));

const degraded = evaluateAiCopilotNarration({
  strategicEnvironment: { environment: "UNSTABLE", stability: "LOW" },
  adaptiveSignalIntelligence: { signalState: "SUPPRESSED", signalTrust: "LOW", coherenceLevel: "CONFLICTED" },
  crossBrainConsensus: { consensusState: "FAILSAFE_PRIORITY", agreementStrength: "FRAGMENTED" },
  temporalMemory: { temporalState: "VOLATILE_HISTORY" },
  liquidityPressure: { liquidityState: "PRESSURED" },
  crossSymbolEcosystem: { ecosystemState: "DIVERGENT" }
});
assert.strictEqual(degraded.narrationState, "DEGRADED");
assert(degraded.warnings.length >= 1);

setLatestCognitionSnapshot({ copilot: narration });
const endpoint = buildCopilotEndpoint();
assert.strictEqual(endpoint.narrationState, "ACTIVE");
assert.notStrictEqual(endpoint.summary, "Awaiting AI Copilot narration.");

console.log("AI Copilot narration engine test passed.");
