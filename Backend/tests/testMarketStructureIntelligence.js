const assert = require("assert");
const {
  evaluateMarketStructure
} = require("../services/marketStructureIntelligence");
const {
  buildMarketStructureEndpoint,
  clearLatestCognitionSnapshot,
  setLatestCognitionSnapshot
} = require("../services/cognitionSnapshotStore");

function environmentMap(regions) {
  return {
    ecosystemRegions: regions
  };
}

clearLatestCognitionSnapshot();

const fallback = buildMarketStructureEndpoint();
assert.strictEqual(fallback.structureState, "UNKNOWN");
assert.strictEqual(fallback.summary, "Awaiting market structure cognition.");

const compressed = evaluateMarketStructure({
  strategicEnvironmentMap: environmentMap([
    {
      ecosystem: "Mega Caps",
      state: "STABLE",
      pressure: "LOW",
      synchronization: "SYNCHRONIZED",
      fragmentation: false,
      trajectory: "STABILIZING",
      symbols: ["MSFT", "META"]
    }
  ]),
  cognitiveDrift: {
    driftState: "STABLE"
  },
  environmentForecast: {
    forecastState: "STABILIZING"
  }
});

assert.strictEqual(compressed.structureState, "COMPRESSED");
assert.strictEqual(compressed.structureQuality, "STRONG");

const expanding = evaluateMarketStructure({
  strategicEnvironmentMap: environmentMap([
    {
      ecosystem: "Semiconductors",
      state: "ESCALATING",
      pressure: "SEVERE",
      synchronization: "SYNCHRONIZED",
      fragmentation: false,
      trajectory: "DETERIORATING",
      symbols: ["NVDA", "AMD"]
    },
    {
      ecosystem: "Broad Market",
      state: "CAUTION",
      pressure: "HIGH",
      synchronization: "MIXED",
      fragmentation: false,
      trajectory: "STABILIZING",
      symbols: ["SPY"]
    }
  ]),
  cognitiveDrift: {
    driftState: "VOLATILE"
  },
  environmentForecast: {
    forecastState: "UNCERTAIN"
  }
});

assert.strictEqual(expanding.structureState, "EXPANDING");
assert.strictEqual(expanding.structureQuality, "MODERATE");
assert(expanding.affectedSymbols.includes("NVDA"));
assert(expanding.affectedEcosystems.includes("Semiconductors"));

const weakening = evaluateMarketStructure({
  strategicEnvironmentMap: environmentMap([
    {
      ecosystem: "Semiconductors",
      state: "FRAGMENTED",
      pressure: "HIGH",
      synchronization: "MIXED",
      fragmentation: true,
      trajectory: "FRAGMENTING",
      symbols: ["NVDA", "AMD"]
    },
    {
      ecosystem: "Mega Caps",
      state: "FRAGMENTED",
      pressure: "HIGH",
      synchronization: "MIXED",
      fragmentation: true,
      trajectory: "FRAGMENTING",
      symbols: ["MSFT"]
    }
  ]),
  cognitiveDrift: {
    driftState: "FRAGMENTING"
  },
  environmentForecast: {
    forecastState: "FRAGMENTING"
  }
});

assert.strictEqual(weakening.structureState, "WEAKENING");
assert.strictEqual(weakening.structureQuality, "FRAGMENTED");

setLatestCognitionSnapshot({
  marketStructure: expanding
});

const endpoint = buildMarketStructureEndpoint();
assert.strictEqual(endpoint.structureState, "EXPANDING");
assert(Array.isArray(endpoint.affectedSymbols));
assert.notStrictEqual(endpoint.summary, "Awaiting market structure cognition.");

console.log("Market structure intelligence test passed.");
