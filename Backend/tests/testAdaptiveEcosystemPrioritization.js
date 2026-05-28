const assert = require("assert");
const {
  prioritizeEcosystems
} = require("../services/adaptiveEcosystemPrioritization");
const {
  buildEcosystemPriorityEndpoint,
  clearLatestCognitionSnapshot,
  setLatestCognitionSnapshot
} = require("../services/cognitionSnapshotStore");

function environmentMap(regions) {
  return {
    ecosystemRegions: regions,
    pressureMap: regions.map((region) => ({
      ecosystem: region.ecosystem,
      pressure: region.pressure,
      state: region.state,
      symbols: region.symbols || []
    })),
    fragmentationZones: regions
      .filter((region) => region.fragmentation)
      .map((region) => ({
        ecosystem: region.ecosystem,
        pressure: region.pressure,
        symbols: region.symbols || []
      })),
    synchronizationZones: regions
      .filter((region) => region.synchronization === "SYNCHRONIZED")
      .map((region) => ({
        ecosystem: region.ecosystem,
        state: region.state,
        symbols: region.symbols || []
      })),
    transitionSignals: regions
      .filter((region) => ["RECOVERING", "ESCALATING", "FRAGMENTED"].includes(region.state))
      .map((region) => ({
        ecosystem: region.ecosystem,
        transition: region.state,
        trajectory: region.trajectory,
        symbols: region.symbols || []
      }))
  };
}

clearLatestCognitionSnapshot();

const fallback = buildEcosystemPriorityEndpoint();
assert.strictEqual(fallback.priorityLevel, "UNKNOWN");
assert.strictEqual(fallback.summary, "Awaiting adaptive ecosystem prioritization cognition.");

const contained = prioritizeEcosystems({
  strategicEnvironmentMap: environmentMap([
    {
      ecosystem: "Semiconductors",
      state: "CAUTION",
      pressure: "MODERATE",
      synchronization: "MIXED",
      fragmentation: false,
      trajectory: "STABILIZING",
      symbols: ["NVDA", "AMD"]
    },
    {
      ecosystem: "Mega Caps",
      state: "STABLE",
      pressure: "LOW",
      synchronization: "SYNCHRONIZED",
      fragmentation: false,
      trajectory: "STABLE",
      symbols: ["MSFT", "META"]
    }
  ])
});

assert.strictEqual(contained.propagationState, "CONTAINED");
assert(contained.prioritizedEcosystems.find((item) => item.priority === "MODERATE_FOCUS"));
assert(contained.suppressedEcosystems.find((item) => item.ecosystem === "Mega Caps"));

const spreading = prioritizeEcosystems({
  strategicEnvironmentMap: environmentMap([
    {
      ecosystem: "Semiconductors",
      state: "ESCALATING",
      pressure: "SEVERE",
      synchronization: "SYNCHRONIZED",
      fragmentation: false,
      trajectory: "DETERIORATING",
      symbols: ["NVDA", "AMD", "TSM"]
    },
    {
      ecosystem: "Broad Market",
      state: "CAUTION",
      pressure: "HIGH",
      synchronization: "MIXED",
      fragmentation: false,
      trajectory: "STABILIZING",
      symbols: ["SPY"]
    },
    {
      ecosystem: "Mega Caps",
      state: "STABLE",
      pressure: "LOW",
      synchronization: "SYNCHRONIZED",
      fragmentation: false,
      trajectory: "STABLE",
      symbols: ["MSFT", "META"]
    }
  ])
});

assert(["HIGH_FOCUS", "CRITICAL_FOCUS"].includes(spreading.priorityLevel));
assert(spreading.prioritizedEcosystems.find((item) => item.ecosystem === "Semiconductors"));
assert.strictEqual(spreading.propagationState, "SPREADING");
assert(spreading.originRegions.includes("Semiconductors"));
assert(spreading.receivingRegions.includes("Mega Caps"));
assert(spreading.propagationPaths.length > 0);

setLatestCognitionSnapshot({
  ecosystemPriority: spreading
});

const endpoint = buildEcosystemPriorityEndpoint();
assert(endpoint.prioritizedEcosystems.length > 0);
assert(Array.isArray(endpoint.priorityDrivers));
assert(Array.isArray(endpoint.propagationPaths));
assert.notStrictEqual(endpoint.summary, "Awaiting adaptive ecosystem prioritization cognition.");

console.log("Adaptive ecosystem prioritization test passed.");
