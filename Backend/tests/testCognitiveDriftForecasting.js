const assert = require("assert");
const {
  detectCognitiveDrift,
  forecastStrategicEnvironment
} = require("../services/cognitiveDriftForecasting");
const {
  buildCognitiveDriftEndpoint,
  buildEnvironmentForecastEndpoint,
  clearLatestCognitionSnapshot,
  setLatestCognitionSnapshot
} = require("../services/cognitionSnapshotStore");

function environmentMap(regions) {
  return {
    ecosystemRegions: regions
  };
}

clearLatestCognitionSnapshot();

const fallbackDrift = buildCognitiveDriftEndpoint();
const fallbackForecast = buildEnvironmentForecastEndpoint();
assert.strictEqual(fallbackDrift.driftState, "UNKNOWN");
assert.strictEqual(fallbackForecast.forecastState, "UNKNOWN");

const degradingMap = environmentMap([
  {
    ecosystem: "Semiconductors",
    state: "ESCALATING",
    pressure: "SEVERE",
    synchronization: "MIXED",
    fragmentation: false,
    trajectory: "DETERIORATING"
  },
  {
    ecosystem: "Broad Market",
    state: "FRAGMENTED",
    pressure: "HIGH",
    synchronization: "MIXED",
    fragmentation: true,
    trajectory: "FRAGMENTING"
  }
]);

const degradingDrift = detectCognitiveDrift({
  strategicEnvironmentMap: degradingMap
});
const degradingForecast = forecastStrategicEnvironment({
  strategicEnvironmentMap: degradingMap
});

assert(["VOLATILE", "FRAGMENTING", "DEGRADING"].includes(degradingDrift.driftState));
assert(["HIGH", "SEVERE", "MODERATE"].includes(degradingDrift.severity));
assert(degradingDrift.affectedEcosystems.length >= 1);
assert(["DETERIORATING", "FRAGMENTING"].includes(degradingForecast.forecastState));

const recoveringMap = environmentMap([
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
    state: "STABLE",
    pressure: "LOW",
    synchronization: "SYNCHRONIZED",
    fragmentation: false,
    trajectory: "STABILIZING"
  }
]);

const recoveringDrift = detectCognitiveDrift({
  strategicEnvironmentMap: recoveringMap
});
const recoveringForecast = forecastStrategicEnvironment({
  strategicEnvironmentMap: recoveringMap
});

assert.strictEqual(recoveringDrift.driftState, "RECOVERING");
assert.strictEqual(recoveringForecast.forecastState, "RECOVERING");

setLatestCognitionSnapshot({
  cognitiveDrift: degradingDrift,
  environmentForecast: degradingForecast
});

const driftEndpoint = buildCognitiveDriftEndpoint();
const forecastEndpoint = buildEnvironmentForecastEndpoint();
assert.notStrictEqual(driftEndpoint.summary, "Awaiting cognitive drift cognition.");
assert.notStrictEqual(forecastEndpoint.summary, "Awaiting strategic environment forecast cognition.");
assert(Array.isArray(driftEndpoint.driftSignals));
assert(Array.isArray(forecastEndpoint.ecosystemForecasts));

console.log("Cognitive drift forecasting test passed.");
