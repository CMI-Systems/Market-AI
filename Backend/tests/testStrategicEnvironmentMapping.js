const assert = require("assert");
const {
  mapStrategicEnvironment
} = require("../services/strategicEnvironmentMappingEngine");
const {
  buildEnvironmentMapEndpoint,
  clearLatestCognitionSnapshot,
  setLatestCognitionSnapshot
} = require("../services/cognitionSnapshotStore");

function context({
  symbol,
  environment = "CAUTION",
  stability = "MODERATE",
  trajectory = "STABILIZING",
  pressureLevel = "MODERATE",
  anomalySeverity = "NONE"
}) {
  return {
    symbol,
    strategicEnvironment: {
      environment,
      stability
    },
    intelligenceStabilityForecast: {
      trajectory
    },
    environmentalPressure: {
      pressureLevel
    },
    anomalyIntelligence: {
      anomalyDetected: anomalySeverity !== "NONE",
      severity: anomalySeverity
    }
  };
}

clearLatestCognitionSnapshot();

const fallback = buildEnvironmentMapEndpoint();
assert.strictEqual(fallback.globalEnvironmentState, "UNKNOWN");
assert.strictEqual(fallback.summary, "Awaiting strategic environment mapping cognition.");

const mapped = mapStrategicEnvironment({
  symbolContexts: [
    context({
      symbol: "NVDA",
      environment: "HIGH_RISK",
      stability: "FRAGMENTED",
      trajectory: "FRAGMENTING",
      pressureLevel: "HIGH",
      anomalySeverity: "HIGH"
    }),
    context({
      symbol: "AMD",
      environment: "UNSTABLE",
      stability: "LOW",
      trajectory: "DETERIORATING",
      pressureLevel: "HIGH"
    }),
    context({
      symbol: "MSFT",
      environment: "FAVORABLE",
      stability: "HIGH",
      trajectory: "RECOVERING",
      pressureLevel: "LOW"
    }),
    context({
      symbol: "META",
      environment: "FAVORABLE",
      stability: "HIGH",
      trajectory: "RECOVERING",
      pressureLevel: "LOW"
    }),
    context({
      symbol: "SPY",
      environment: "CAUTION",
      stability: "MODERATE",
      trajectory: "STABILIZING",
      pressureLevel: "MODERATE"
    })
  ]
});

assert(mapped.ecosystemRegions.length >= 3);
assert(mapped.pressureMap.length >= 3);
assert(mapped.fragmentationZones.length >= 1);
assert(mapped.synchronizationZones.length >= 1);
assert(mapped.transitionSignals.length >= 1);
assert(["FRAGMENTED", "ESCALATING", "CAUTION", "RECOVERING"].includes(mapped.globalEnvironmentState));

setLatestCognitionSnapshot({
  environmentMap: mapped
});

const endpoint = buildEnvironmentMapEndpoint();
assert.notStrictEqual(endpoint.summary, "Awaiting strategic environment mapping cognition.");
assert(Array.isArray(endpoint.ecosystemRegions));
assert(Array.isArray(endpoint.pressureMap));
assert(Array.isArray(endpoint.fragmentationZones));
assert(Array.isArray(endpoint.synchronizationZones));
assert(Array.isArray(endpoint.transitionSignals));

console.log("Strategic environment mapping test passed.");
