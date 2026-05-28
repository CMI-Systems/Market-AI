const assert = require("assert");
const {
  evaluateLiquidityPressure
} = require("../services/liquidityPressureIntelligence");
const {
  buildLiquidityPressureEndpoint,
  clearLatestCognitionSnapshot,
  setLatestCognitionSnapshot
} = require("../services/cognitionSnapshotStore");

function map(regions) {
  return { ecosystemRegions: regions };
}

clearLatestCognitionSnapshot();

const fallback = buildLiquidityPressureEndpoint();
assert.strictEqual(fallback.liquidityState, "UNKNOWN");
assert.strictEqual(fallback.summary, "Awaiting liquidity pressure cognition.");

const pressured = evaluateLiquidityPressure({
  strategicEnvironmentMap: map([
    { ecosystem: "Semiconductors", state: "ESCALATING", pressure: "SEVERE", fragmentation: false, symbols: ["NVDA", "AMD"] },
    { ecosystem: "Broad Market", state: "CAUTION", pressure: "HIGH", fragmentation: false, symbols: ["SPY"] }
  ]),
  marketStructure: { structureState: "EXPANDING" },
  environmentForecast: { forecastState: "DETERIORATING" },
  adaptiveEcosystemPriority: { propagationState: "SPREADING" },
  institutionalFlow: { flowState: "ROTATING", flowStrength: "HIGH" }
});
assert.strictEqual(pressured.liquidityState, "PRESSURED");
assert.strictEqual(pressured.pressureState, "AMPLIFYING");
assert.strictEqual(pressured.vulnerabilityLevel, "SEVERE");
assert(pressured.pressureZones.length >= 2);

const compressed = evaluateLiquidityPressure({
  strategicEnvironmentMap: map([
    { ecosystem: "Mega Caps", state: "STABLE", pressure: "LOW", fragmentation: false, symbols: ["MSFT"] }
  ]),
  marketStructure: { structureState: "COMPRESSED" },
  environmentForecast: { forecastState: "STABILIZING" },
  adaptiveEcosystemPriority: { propagationState: "CONTAINED" },
  institutionalFlow: { flowState: "SYNCHRONIZED", flowStrength: "LOW" }
});
assert.strictEqual(compressed.liquidityState, "COMPRESSED");
assert.strictEqual(compressed.vulnerabilityLevel, "MODERATE");

setLatestCognitionSnapshot({ liquidityPressure: pressured });
const endpoint = buildLiquidityPressureEndpoint();
assert.strictEqual(endpoint.pressureState, "AMPLIFYING");
assert(Array.isArray(endpoint.pressureZones));
assert.notStrictEqual(endpoint.summary, "Awaiting liquidity pressure cognition.");

console.log("Liquidity pressure intelligence test passed.");
