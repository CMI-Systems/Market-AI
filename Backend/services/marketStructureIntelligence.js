/*
 * Market structure intelligence for Market AI.
 * Evaluates structural behavior across existing backend ecosystem cognition.
 */

const AWAITING_MARKET_STRUCTURE = "Awaiting market structure cognition.";

function safeArray(value) {
  return Array.isArray(value)
    ? value.filter((item) => item && typeof item === "object")
    : [];
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function awaitingMarketStructure() {
  return {
    structureState: "UNKNOWN",
    structureQuality: "UNKNOWN",
    affectedSymbols: [],
    affectedEcosystems: [],
    warnings: [],
    summary: AWAITING_MARKET_STRUCTURE
  };
}

function classifyStructureState({ regions, drift, forecast }) {
  const states = regions.map((region) => region.state);
  const pressures = regions.map((region) => region.pressure);
  const synchronizedCount = regions.filter((region) => region.synchronization === "SYNCHRONIZED").length;
  const fragmentedCount = regions.filter((region) => region.fragmentation === true || region.state === "FRAGMENTED").length;
  const highPressureCount = pressures.filter((pressure) => ["HIGH", "SEVERE"].includes(pressure)).length;

  if (fragmentedCount >= 2 || drift.driftState === "FRAGMENTING") return "WEAKENING";
  if (forecast.forecastState === "FRAGMENTING" || forecast.forecastState === "DETERIORATING") return "TRANSITIONAL";
  if (highPressureCount >= 2 || drift.driftState === "VOLATILE") return "EXPANDING";
  if (states.every((state) => state === "STABLE") && pressures.every((pressure) => pressure === "LOW")) return "COMPRESSED";
  if (synchronizedCount >= 2 && ["STABILIZING", "RECOVERING"].includes(forecast.forecastState)) return "STRENGTHENING";
  if (regions.some((region) => region.state === "STABLE" || region.state === "RECOVERING")) return "TRENDING";
  if (regions.some((region) => region.state === "CAUTION")) return "RANGING";
  return "UNKNOWN";
}

function classifyStructureQuality(state, regions) {
  const fragmentedCount = regions.filter((region) => region.fragmentation === true || region.state === "FRAGMENTED").length;
  const synchronizedCount = regions.filter((region) => region.synchronization === "SYNCHRONIZED").length;

  if (fragmentedCount >= 2 || state === "WEAKENING") return "FRAGMENTED";
  if (["COMPRESSED", "TRENDING", "STRENGTHENING"].includes(state) && synchronizedCount >= 1) return "STRONG";
  if (["RANGING", "TRANSITIONAL"].includes(state)) return "MODERATE";
  if (state === "EXPANDING") return "MODERATE";
  if (state === "UNKNOWN") return "UNKNOWN";
  return "WEAK";
}

function evaluateMarketStructure(input = {}) {
  const regions = safeArray(input.strategicEnvironmentMap?.ecosystemRegions);
  const drift = input.cognitiveDrift || {};
  const forecast = input.environmentForecast || {};

  if (!regions.length) {
    return awaitingMarketStructure();
  }

  const structureState = classifyStructureState({
    regions,
    drift,
    forecast
  });
  const structureQuality = classifyStructureQuality(structureState, regions);
  const affectedRegions = regions.filter((region) => {
    return region.fragmentation === true ||
      ["HIGH", "SEVERE"].includes(region.pressure) ||
      ["FRAGMENTED", "ESCALATING", "CAUTION"].includes(region.state);
  });
  const affectedSymbols = unique(affectedRegions.flatMap((region) => region.symbols || []));
  const affectedEcosystems = unique(affectedRegions.map((region) => region.ecosystem));
  const warnings = [];

  if (structureQuality === "FRAGMENTED") {
    warnings.push("Market structure quality is fragmented across mapped ecosystems.");
  }

  if (structureState === "TRANSITIONAL") {
    warnings.push("Market structure is in a transitional environmental state.");
  }

  if (structureState === "EXPANDING") {
    warnings.push("Expansion behavior is visible through elevated ecosystem pressure.");
  }

  return {
    structureState,
    structureQuality,
    affectedSymbols,
    affectedEcosystems,
    warnings,
    summary: `${structureState} market structure with ${structureQuality} structural quality across ${regions.length} ecosystem region${regions.length === 1 ? "" : "s"}.`
  };
}

module.exports = {
  AWAITING_MARKET_STRUCTURE,
  awaitingMarketStructure,
  evaluateMarketStructure
};
