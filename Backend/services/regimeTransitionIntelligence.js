/*
 * Regime transition intelligence for Market AI.
 * Detects broad environmental regime transitions without producing advice.
 */

const AWAITING_REGIME_TRANSITION = "Awaiting regime transition cognition.";

function safeArray(value) {
  return Array.isArray(value)
    ? value.filter((item) => item && typeof item === "object")
    : [];
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function awaitingRegimeTransition() {
  return {
    regimeState: "UNKNOWN",
    transitionState: "UNKNOWN",
    transitionRisk: "UNKNOWN",
    affectedEcosystems: [],
    warnings: [],
    summary: AWAITING_REGIME_TRANSITION
  };
}

function regimeFromEnvironment(environmentMap = {}, drift = {}, forecast = {}) {
  if (environmentMap.globalEnvironmentState === "ESCALATING" || drift.driftState === "VOLATILE") return "UNSTABLE";
  if (environmentMap.globalEnvironmentState === "FRAGMENTED" || drift.driftState === "FRAGMENTING") return "FRAGMENTED";
  if (forecast.forecastState === "DETERIORATING" || forecast.forecastState === "FRAGMENTING") return "TRANSITIONAL";
  if (environmentMap.globalEnvironmentState === "RECOVERING" || forecast.forecastState === "RECOVERING") return "RECOVERING";
  if (environmentMap.globalEnvironmentState === "CAUTION") return "CAUTION";
  if (environmentMap.globalEnvironmentState === "STABLE" || forecast.forecastState === "STABILIZING") return "STABLE";
  return "UNKNOWN";
}

function transitionFromInputs(regimeState, structure = {}, drift = {}, forecast = {}) {
  if (["UNSTABLE", "FRAGMENTED"].includes(regimeState) || drift.driftState === "VOLATILE") return "ACTIVE";
  if (forecast.forecastState === "DETERIORATING" || structure.structureState === "TRANSITIONAL") return "DETERIORATING";
  if (forecast.forecastState === "FRAGMENTING") return "BUILDING";
  if (forecast.forecastState === "RECOVERING") return "COOLING";
  if (forecast.forecastState === "STABILIZING" || regimeState === "STABLE") return "STABILIZING";
  return "UNKNOWN";
}

function riskFromTransition(regimeState, transitionState, drift = {}) {
  if (regimeState === "FRAGMENTED" || drift.severity === "SEVERE") return "SEVERE";
  if (regimeState === "UNSTABLE" || transitionState === "ACTIVE" || drift.severity === "HIGH") return "HIGH";
  if (transitionState === "DETERIORATING" || transitionState === "BUILDING" || regimeState === "CAUTION") return "MODERATE";
  if (["COOLING", "STABILIZING"].includes(transitionState) || regimeState === "STABLE") return "LOW";
  return "UNKNOWN";
}

function evaluateRegimeTransition(input = {}) {
  const environmentMap = input.strategicEnvironmentMap || {};
  const regions = safeArray(environmentMap.ecosystemRegions);
  const drift = input.cognitiveDrift || {};
  const forecast = input.environmentForecast || {};
  const structure = input.marketStructure || {};

  if (!regions.length) {
    return awaitingRegimeTransition();
  }

  const regimeState = regimeFromEnvironment(environmentMap, drift, forecast);
  const transitionState = transitionFromInputs(regimeState, structure, drift, forecast);
  const transitionRisk = riskFromTransition(regimeState, transitionState, drift);
  const affectedEcosystems = unique(regions
    .filter((region) => {
      return region.fragmentation === true ||
        ["HIGH", "SEVERE"].includes(region.pressure) ||
        ["FRAGMENTED", "ESCALATING", "CAUTION"].includes(region.state);
    })
    .map((region) => region.ecosystem));
  const warnings = [];

  if (["HIGH", "SEVERE"].includes(transitionRisk)) {
    warnings.push("Regime transition risk is elevated across backend ecosystem cognition.");
  }

  if (transitionState === "DETERIORATING") {
    warnings.push("Regime transition is deteriorating across mapped environments.");
  }

  if (transitionState === "COOLING") {
    warnings.push("Regime transition is cooling as recovery behavior appears.");
  }

  return {
    regimeState,
    transitionState,
    transitionRisk,
    affectedEcosystems,
    warnings,
    summary: `${regimeState} regime with ${transitionState} transition state and ${transitionRisk} transition risk.`
  };
}

module.exports = {
  AWAITING_REGIME_TRANSITION,
  awaitingRegimeTransition,
  evaluateRegimeTransition
};
