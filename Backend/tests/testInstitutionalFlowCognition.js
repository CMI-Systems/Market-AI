const assert = require("assert");
const {
  evaluateInstitutionalFlow
} = require("../services/institutionalFlowCognition");
const {
  buildInstitutionalFlowEndpoint,
  clearLatestCognitionSnapshot,
  setLatestCognitionSnapshot
} = require("../services/cognitionSnapshotStore");

function map(regions) {
  return { ecosystemRegions: regions };
}

clearLatestCognitionSnapshot();

const fallback = buildInstitutionalFlowEndpoint();
assert.strictEqual(fallback.flowState, "UNKNOWN");
assert.strictEqual(fallback.summary, "Awaiting institutional flow cognition.");

const accumulating = evaluateInstitutionalFlow({
  strategicEnvironmentMap: map([
    { ecosystem: "Mega Caps", state: "RECOVERING", pressure: "LOW", synchronization: "SYNCHRONIZED", fragmentation: false, symbols: ["MSFT", "META"] },
    { ecosystem: "Broad Market", state: "STABLE", pressure: "LOW", synchronization: "SYNCHRONIZED", fragmentation: false, symbols: ["SPY"] }
  ]),
  marketStructure: { structureState: "STRENGTHENING" },
  regimeTransition: { regimeState: "RECOVERING" },
  adaptiveEcosystemPriority: { propagationState: "RECOVERING" }
});
assert.strictEqual(accumulating.flowState, "ACCUMULATING");
assert.strictEqual(accumulating.flowStrength, "MODERATE");

const defensive = evaluateInstitutionalFlow({
  strategicEnvironmentMap: map([
    { ecosystem: "Broad Market", state: "CAUTION", pressure: "MODERATE", synchronization: "MIXED", fragmentation: false, symbols: ["SPY"] }
  ]),
  marketStructure: { structureState: "RANGING" },
  regimeTransition: { regimeState: "CAUTION" },
  adaptiveEcosystemPriority: { propagationState: "CONTAINED" }
});
assert.strictEqual(defensive.flowState, "DEFENSIVE");

const synchronized = evaluateInstitutionalFlow({
  strategicEnvironmentMap: map([
    { ecosystem: "Semiconductors", state: "STABLE", pressure: "LOW", synchronization: "SYNCHRONIZED", fragmentation: false, symbols: ["NVDA", "AMD"] },
    { ecosystem: "Mega Caps", state: "STABLE", pressure: "LOW", synchronization: "SYNCHRONIZED", fragmentation: false, symbols: ["MSFT"] }
  ]),
  marketStructure: { structureState: "TRENDING" },
  regimeTransition: { regimeState: "STABLE" },
  adaptiveEcosystemPriority: { propagationState: "STABLE" }
});
assert.strictEqual(synchronized.flowState, "SYNCHRONIZED");
assert(synchronized.synchronizedRegions.includes("Mega Caps"));

setLatestCognitionSnapshot({ institutionalFlow: synchronized });
const endpoint = buildInstitutionalFlowEndpoint();
assert.strictEqual(endpoint.flowState, "SYNCHRONIZED");
assert(Array.isArray(endpoint.flowClusters));

console.log("Institutional flow cognition test passed.");
