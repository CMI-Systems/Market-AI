const assert = require("assert");
const {
  evaluateCrossSymbolCorrelation
} = require("../services/crossSymbolCorrelationEngine");
const {
  buildEcosystemEndpoint,
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

const fallback = buildEcosystemEndpoint();
assert.strictEqual(fallback.ecosystemState, "UNKNOWN");
assert.strictEqual(fallback.summary, "Awaiting cross-symbol ecosystem cognition.");

const synchronized = evaluateCrossSymbolCorrelation({
  symbolContexts: [
    context({ symbol: "NVDA", environment: "CAUTION", stability: "MODERATE" }),
    context({ symbol: "AMD", environment: "CAUTION", stability: "MODERATE" }),
    context({ symbol: "TSM", environment: "CAUTION", stability: "MODERATE" })
  ]
});

assert.strictEqual(synchronized.ecosystemState, "SYNCHRONIZED");
assert.strictEqual(synchronized.correlationStrength, "STRONG");
assert.deepStrictEqual(synchronized.synchronizedSymbols, ["AMD", "NVDA", "TSM"]);
assert(synchronized.ecosystemGroups.find((group) => group.group === "Semiconductors"));

const fragmented = evaluateCrossSymbolCorrelation({
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
      symbol: "MSFT",
      environment: "OPTIMAL",
      stability: "HIGH",
      trajectory: "STABLE",
      pressureLevel: "LOW"
    }),
    context({
      symbol: "SPY",
      environment: "UNSTABLE",
      stability: "LOW",
      trajectory: "DETERIORATING",
      pressureLevel: "HIGH"
    })
  ]
});

assert(["FRAGMENTED", "DIVERGENT"].includes(fragmented.ecosystemState));
assert(fragmented.divergentSymbols.length >= 1);
assert(fragmented.pressureClusters.find((cluster) => cluster.pressureState === "SEVERE" || cluster.pressureState === "HIGH"));

setLatestCognitionSnapshot({
  ecosystem: synchronized
});

const endpoint = buildEcosystemEndpoint();
assert.strictEqual(endpoint.ecosystemState, "SYNCHRONIZED");
assert(endpoint.synchronizedSymbols.length >= 2);
assert(Array.isArray(endpoint.pressureClusters));
assert(Array.isArray(endpoint.ecosystemGroups));

console.log("Cross-symbol ecosystem cognition test passed.");
