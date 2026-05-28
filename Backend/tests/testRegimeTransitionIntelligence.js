const assert = require("assert");
const {
  evaluateRegimeTransition
} = require("../services/regimeTransitionIntelligence");
const {
  buildRegimeTransitionEndpoint,
  clearLatestCognitionSnapshot,
  setLatestCognitionSnapshot
} = require("../services/cognitionSnapshotStore");

function environmentMap(globalEnvironmentState, regions) {
  return {
    globalEnvironmentState,
    ecosystemRegions: regions
  };
}

clearLatestCognitionSnapshot();

const fallback = buildRegimeTransitionEndpoint();
assert.strictEqual(fallback.regimeState, "UNKNOWN");
assert.strictEqual(fallback.summary, "Awaiting regime transition cognition.");

const caution = evaluateRegimeTransition({
  strategicEnvironmentMap: environmentMap("CAUTION", [
    {
      ecosystem: "Broad Market",
      state: "CAUTION",
      pressure: "MODERATE",
      fragmentation: false
    }
  ]),
  cognitiveDrift: {
    driftState: "DEGRADING",
    severity: "MODERATE"
  },
  environmentForecast: {
    forecastState: "DETERIORATING"
  },
  marketStructure: {
    structureState: "TRANSITIONAL"
  }
});

assert.strictEqual(caution.regimeState, "TRANSITIONAL");
assert.strictEqual(caution.transitionState, "DETERIORATING");
assert.strictEqual(caution.transitionRisk, "MODERATE");

const unstable = evaluateRegimeTransition({
  strategicEnvironmentMap: environmentMap("ESCALATING", [
    {
      ecosystem: "Semiconductors",
      state: "ESCALATING",
      pressure: "SEVERE",
      fragmentation: false
    }
  ]),
  cognitiveDrift: {
    driftState: "VOLATILE",
    severity: "SEVERE"
  },
  environmentForecast: {
    forecastState: "DETERIORATING"
  },
  marketStructure: {
    structureState: "EXPANDING"
  }
});

assert.strictEqual(unstable.regimeState, "UNSTABLE");
assert.strictEqual(unstable.transitionState, "ACTIVE");
assert.strictEqual(unstable.transitionRisk, "SEVERE");
assert(unstable.affectedEcosystems.includes("Semiconductors"));

const recovering = evaluateRegimeTransition({
  strategicEnvironmentMap: environmentMap("RECOVERING", [
    {
      ecosystem: "Mega Caps",
      state: "RECOVERING",
      pressure: "LOW",
      fragmentation: false
    }
  ]),
  cognitiveDrift: {
    driftState: "RECOVERING",
    severity: "LOW"
  },
  environmentForecast: {
    forecastState: "RECOVERING"
  },
  marketStructure: {
    structureState: "STRENGTHENING"
  }
});

assert.strictEqual(recovering.regimeState, "RECOVERING");
assert.strictEqual(recovering.transitionState, "COOLING");
assert.strictEqual(recovering.transitionRisk, "LOW");

setLatestCognitionSnapshot({
  regimeTransition: unstable
});

const endpoint = buildRegimeTransitionEndpoint();
assert.strictEqual(endpoint.regimeState, "UNSTABLE");
assert(Array.isArray(endpoint.affectedEcosystems));
assert.notStrictEqual(endpoint.summary, "Awaiting regime transition cognition.");

console.log("Regime transition intelligence test passed.");
