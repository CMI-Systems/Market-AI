const assert = require("assert");
const {
  buildSectorHeatmap
} = require("../services/sectorHeatmapCognition");
const {
  buildSectorHeatmapEndpoint,
  clearLatestCognitionSnapshot,
  setLatestCognitionSnapshot
} = require("../services/cognitionSnapshotStore");

function environmentMap(regions) {
  return {
    ecosystemRegions: regions
  };
}

clearLatestCognitionSnapshot();

const fallback = buildSectorHeatmapEndpoint();
assert.strictEqual(fallback.heatmapState, "UNKNOWN");
assert.strictEqual(fallback.summary, "Awaiting sector heatmap cognition.");

const heatmap = buildSectorHeatmap({
  strategicEnvironmentMap: environmentMap([
    {
      ecosystem: "Semiconductors",
      state: "FRAGMENTED",
      pressure: "HIGH",
      synchronization: "MIXED",
      fragmentation: true,
      trajectory: "FRAGMENTING"
    },
    {
      ecosystem: "Mega Caps",
      state: "RECOVERING",
      pressure: "LOW",
      synchronization: "SYNCHRONIZED",
      fragmentation: false,
      trajectory: "RECOVERING"
    },
    {
      ecosystem: "Broad Market",
      state: "CAUTION",
      pressure: "MODERATE",
      synchronization: "MIXED",
      fragmentation: false,
      trajectory: "STABILIZING"
    }
  ])
});

assert.strictEqual(heatmap.heatmapState, "FRAGMENTING");
assert.strictEqual(heatmap.sectors.length, 3);
assert(heatmap.sectors.find((sector) => sector.ecosystem === "Mega Caps" && sector.stability === "RECOVERING"));
assert(heatmap.warnings.length >= 1);

setLatestCognitionSnapshot({
  sectorHeatmap: heatmap
});

const endpoint = buildSectorHeatmapEndpoint();
assert.strictEqual(endpoint.heatmapState, "FRAGMENTING");
assert(Array.isArray(endpoint.sectors));
assert.notStrictEqual(endpoint.summary, "Awaiting sector heatmap cognition.");

console.log("Sector heatmap cognition test passed.");
