/*
 * Institutional flow cognition for Market AI.
 * Evaluates structural flow behavior from backend ecosystem cognition only.
 */

const AWAITING_INSTITUTIONAL_FLOW = "Awaiting institutional flow cognition.";

function safeArray(value) {
  return Array.isArray(value)
    ? value.filter((item) => item && typeof item === "object")
    : [];
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function strengthFromCounts(highPressureCount, synchronizedCount, regionCount) {
  if (!regionCount) return "UNKNOWN";
  if (highPressureCount >= 2 && synchronizedCount >= 1) return "SEVERE";
  if (highPressureCount >= 2) return "HIGH";
  if (highPressureCount === 1 || synchronizedCount >= 2) return "MODERATE";
  return "LOW";
}

function classifyFlowState({ regions, structure, regime, priority }) {
  const fragmented = regions.filter((region) => region.fragmentation === true || region.state === "FRAGMENTED");
  const synchronized = regions.filter((region) => region.synchronization === "SYNCHRONIZED");
  const highPressure = regions.filter((region) => ["HIGH", "SEVERE"].includes(region.pressure));

  if (fragmented.length >= 2 || regime.regimeState === "FRAGMENTED") return "FRAGMENTED";
  if (regime.regimeState === "CAUTION" && priority.propagationState === "CONTAINED") return "DEFENSIVE";
  if (structure.structureState === "STRENGTHENING" || regime.regimeState === "RECOVERING") return "ACCUMULATING";
  if (structure.structureState === "WEAKENING" || regime.regimeState === "UNSTABLE") return "DISTRIBUTING";
  if (priority.propagationState === "SPREADING") return "ROTATING";
  if (synchronized.length >= 2 && highPressure.length <= 1) return "SYNCHRONIZED";
  if (structure.structureState === "TRANSITIONAL") return "TRANSITIONAL";
  return "UNKNOWN";
}

function buildFlowClusters(regions = []) {
  return regions
    .filter((region) => region.synchronization === "SYNCHRONIZED" || ["HIGH", "SEVERE"].includes(region.pressure))
    .map((region) => ({
      ecosystem: region.ecosystem,
      pressure: region.pressure,
      synchronization: region.synchronization,
      symbols: region.symbols || []
    }));
}

function awaitingInstitutionalFlow() {
  return {
    flowState: "UNKNOWN",
    flowStrength: "UNKNOWN",
    synchronizedRegions: [],
    divergingRegions: [],
    flowClusters: [],
    warnings: [],
    summary: AWAITING_INSTITUTIONAL_FLOW
  };
}

function evaluateInstitutionalFlow(input = {}) {
  const regions = safeArray(input.strategicEnvironmentMap?.ecosystemRegions);

  if (!regions.length) {
    return awaitingInstitutionalFlow();
  }

  const structure = input.marketStructure || {};
  const regime = input.regimeTransition || {};
  const priority = input.adaptiveEcosystemPriority || {};
  const synchronizedRegions = unique(regions
    .filter((region) => region.synchronization === "SYNCHRONIZED")
    .map((region) => region.ecosystem));
  const divergingRegions = unique(regions
    .filter((region) => region.fragmentation === true || region.synchronization === "MIXED")
    .map((region) => region.ecosystem));
  const highPressureCount = regions.filter((region) => ["HIGH", "SEVERE"].includes(region.pressure)).length;
  const flowState = classifyFlowState({
    regions,
    structure,
    regime,
    priority
  });
  const flowStrength = strengthFromCounts(highPressureCount, synchronizedRegions.length, regions.length);
  const flowClusters = buildFlowClusters(regions);
  const warnings = [];

  if (flowState === "FRAGMENTED") {
    warnings.push("Institutional-style flow is fragmented across mapped ecosystems.");
  }

  if (flowState === "DISTRIBUTING") {
    warnings.push("Structural flow pressure is weakening across mapped ecosystems.");
  }

  if (flowStrength === "SEVERE") {
    warnings.push("Synchronized flow concentration is severe in backend cognition.");
  }

  return {
    flowState,
    flowStrength,
    synchronizedRegions,
    divergingRegions,
    flowClusters,
    warnings,
    summary: `${flowState} institutional flow cognition with ${flowStrength} flow strength across ${regions.length} ecosystem region${regions.length === 1 ? "" : "s"}.`
  };
}

module.exports = {
  AWAITING_INSTITUTIONAL_FLOW,
  awaitingInstitutionalFlow,
  evaluateInstitutionalFlow
};
