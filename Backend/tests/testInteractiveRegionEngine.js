const assert = require("assert");
const {
  evaluateInteractiveRegions
} = require("../services/interactiveRegionEngine");
const {
  buildInteractiveRegionsEndpoint,
  clearLatestCognitionSnapshot,
  setLatestCognitionSnapshot
} = require("../services/cognitionSnapshotStore");

clearLatestCognitionSnapshot();

const fallback = buildInteractiveRegionsEndpoint();
assert.strictEqual(fallback.regionState, "UNKNOWN");
assert.strictEqual(fallback.summary, "Awaiting region cognition.");

const regions = evaluateInteractiveRegions({
  crossSymbolEcosystem: {
    ecosystemGroups: [
      { ecosystem: "Semiconductors", synchronization: "LOW" },
      { ecosystem: "Mega Caps", synchronization: "HIGH" }
    ]
  },
  strategicEnvironmentMap: {
    ecosystemRegions: [
      { ecosystem: "Semiconductors", state: "FRAGMENTED", pressure: "HIGH", synchronization: "LOW" },
      { ecosystem: "Mega Caps", state: "STABLE", pressure: "LOW", synchronization: "HIGH" },
      { ecosystem: "Broad Market", state: "CAUTION", pressure: "MODERATE", synchronization: "MODERATE" }
    ]
  },
  sectorHeatmap: {
    sectors: [
      { ecosystem: "Semiconductors", confidence: "LOW" },
      { ecosystem: "Mega Caps", confidence: "HIGH" }
    ]
  }
});

assert.strictEqual(regions.regionState, "STRUCTURED");
assert(regions.regions.length >= 3);
assert(regions.dominantRegion);
assert(Array.isArray(regions.driftSignals));

setLatestCognitionSnapshot({ interactiveRegions: regions });
const endpoint = buildInteractiveRegionsEndpoint();
assert(Array.isArray(endpoint.regions));
assert.notStrictEqual(endpoint.summary, "Awaiting region cognition.");

console.log("Interactive region engine test passed.");
