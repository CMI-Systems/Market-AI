/*
 * Liquidity pressure intelligence for Market AI.
 * Classifies structural pressure concentration and vulnerability.
 */

const AWAITING_LIQUIDITY_PRESSURE = "Awaiting liquidity pressure cognition.";

function safeArray(value) {
  return Array.isArray(value)
    ? value.filter((item) => item && typeof item === "object")
    : [];
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function classifyLiquidityState({ regions, structure, forecast }) {
  const highPressure = regions.filter((region) => ["HIGH", "SEVERE"].includes(region.pressure));
  const fragmented = regions.filter((region) => region.fragmentation === true || region.state === "FRAGMENTED");

  if (fragmented.length >= 2) return "FRAGMENTED";
  if (structure.structureState === "COMPRESSED") return "COMPRESSED";
  if (forecast.forecastState === "RECOVERING") return "STABILIZING";
  if (highPressure.length >= 1) return "PRESSURED";
  if (forecast.forecastState === "STABILIZING") return "BALANCED";
  return "UNKNOWN";
}

function classifyPressureState({ regions, priority, flow }) {
  const severe = regions.some((region) => region.pressure === "SEVERE");
  const highPressure = regions.filter((region) => ["HIGH", "SEVERE"].includes(region.pressure));

  if (severe || priority.propagationState === "SPREADING") return "AMPLIFYING";
  if (highPressure.length >= 1 && flow.flowState === "SYNCHRONIZED") return "CONCENTRATING";
  if (flow.flowState === "DISTRIBUTING") return "RELEASING";
  if (flow.flowState === "ACCUMULATING" || priority.propagationState === "RECOVERING") return "STABILIZING";
  if (!highPressure.length && flow.flowStrength === "LOW") return "EXHAUSTED";
  return "UNKNOWN";
}

function classifyVulnerability(liquidityState, pressureState, regions) {
  const fragmented = regions.filter((region) => region.fragmentation === true || region.state === "FRAGMENTED").length;

  if (liquidityState === "FRAGMENTED" || pressureState === "AMPLIFYING") return "SEVERE";
  if (liquidityState === "PRESSURED" || fragmented >= 1 || pressureState === "CONCENTRATING") return "HIGH";
  if (liquidityState === "COMPRESSED" || pressureState === "RELEASING") return "MODERATE";
  if (liquidityState === "BALANCED" || liquidityState === "STABILIZING") return "LOW";
  return "UNKNOWN";
}

function buildPressureZones(regions = []) {
  return regions
    .filter((region) => ["MODERATE", "HIGH", "SEVERE"].includes(region.pressure) || region.fragmentation === true)
    .map((region) => ({
      ecosystem: region.ecosystem,
      pressure: region.pressure,
      vulnerability: region.fragmentation === true || region.pressure === "SEVERE"
        ? "SEVERE"
        : region.pressure === "HIGH"
          ? "HIGH"
          : "MODERATE",
      symbols: region.symbols || []
    }));
}

function awaitingLiquidityPressure() {
  return {
    liquidityState: "UNKNOWN",
    pressureState: "UNKNOWN",
    vulnerabilityLevel: "UNKNOWN",
    affectedEcosystems: [],
    pressureZones: [],
    warnings: [],
    summary: AWAITING_LIQUIDITY_PRESSURE
  };
}

function evaluateLiquidityPressure(input = {}) {
  const regions = safeArray(input.strategicEnvironmentMap?.ecosystemRegions);

  if (!regions.length) {
    return awaitingLiquidityPressure();
  }

  const structure = input.marketStructure || {};
  const forecast = input.environmentForecast || {};
  const priority = input.adaptiveEcosystemPriority || {};
  const flow = input.institutionalFlow || {};
  const liquidityState = classifyLiquidityState({
    regions,
    structure,
    forecast
  });
  const pressureState = classifyPressureState({
    regions,
    priority,
    flow
  });
  const vulnerabilityLevel = classifyVulnerability(liquidityState, pressureState, regions);
  const pressureZones = buildPressureZones(regions);
  const affectedEcosystems = unique(pressureZones.map((zone) => zone.ecosystem));
  const warnings = [];

  if (["HIGH", "SEVERE"].includes(vulnerabilityLevel)) {
    warnings.push("Liquidity pressure vulnerability is elevated across mapped ecosystems.");
  }

  if (pressureState === "AMPLIFYING") {
    warnings.push("Pressure amplification is visible in structural liquidity cognition.");
  }

  return {
    liquidityState,
    pressureState,
    vulnerabilityLevel,
    affectedEcosystems,
    pressureZones,
    warnings,
    summary: `${liquidityState} liquidity pressure with ${pressureState} pressure state and ${vulnerabilityLevel} vulnerability.`
  };
}

module.exports = {
  AWAITING_LIQUIDITY_PRESSURE,
  awaitingLiquidityPressure,
  evaluateLiquidityPressure
};
