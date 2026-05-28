/*
 * Environmental causality engine for Market AI.
 * Maps repeated predecessor and successor relationships in cognition history.
 */

const AWAITING_ENVIRONMENT_CAUSALITY = "Awaiting environmental causality cognition.";

function stateOf(value) {
  return typeof value === "string" && value.trim() ? value : "UNKNOWN";
}

function addDriver(drivers, name, reason, count) {
  if (count > 0) {
    drivers.push({ driver: name, reason, count });
  }
}

function confidenceFor(historyCount, driverCount) {
  if (historyCount >= 12 && driverCount >= 4) return "HIGH";
  if (historyCount >= 6 && driverCount >= 2) return "MODERATE";
  if (historyCount >= 3) return "LOW";
  return "UNKNOWN";
}

function evaluateEnvironmentalCausality(input = {}) {
  const history = Array.isArray(input.history) ? input.history : [];

  if (history.length < 3) {
    return {
      causalityState: "UNKNOWN",
      dominantDrivers: [],
      influenceChains: [],
      affectedRegions: [],
      causalityConfidence: "UNKNOWN",
      warnings: [],
      summary: AWAITING_ENVIRONMENT_CAUSALITY
    };
  }

  const recent = history.slice(-16);
  const dominantDrivers = [];
  const influenceChains = [];
  const affectedRegions = new Set();
  let fracturedScore = 0;
  let volatileScore = 0;
  let stableScore = 0;

  for (let index = 1; index < recent.length; index += 1) {
    const previous = recent[index - 1];
    const current = recent[index];
    const previousLiquidity = stateOf(previous.liquidityState);
    const currentSignal = stateOf(current.signalState);
    const currentDrift = stateOf(current.driftState);
    const currentEnvironment = stateOf(current.environment);
    const currentEcosystem = stateOf(current.ecosystemState);
    const currentAnomaly = stateOf(current.anomalySeverity);
    const currentSuppression = stateOf(current.suppressionLevel);

    if (["PRESSURED", "FRAGMENTED"].includes(previousLiquidity) &&
      ["SUPPRESSED", "UNSTABLE"].includes(currentSignal)) {
      influenceChains.push({
        driver: "Liquidity pressure",
        from: previousLiquidity,
        to: currentSignal,
        effect: "Suppression progression"
      });
      volatileScore += 1;
      affectedRegions.add("Liquidity");
    }

    if (stateOf(previous.confidenceLevel) === "LOW" &&
      ["DEGRADING", "FRAGMENTING", "VOLATILE"].includes(currentDrift)) {
      influenceChains.push({
        driver: "Confidence deterioration",
        from: "LOW",
        to: currentDrift,
        effect: "Drift progression"
      });
      fracturedScore += 1;
      affectedRegions.add("Confidence");
    }

    if (["FRAGMENTED", "DIVERGENT"].includes(currentEcosystem)) {
      fracturedScore += 1;
      affectedRegions.add("Ecosystem");
    }

    if (["HIGH", "SEVERE", "CRITICAL"].includes(currentAnomaly) ||
      ["HIGH", "SEVERE"].includes(currentSuppression)) {
      volatileScore += 1;
      affectedRegions.add("Anomaly");
    }

    if (["STABLE", "RECOVERING"].includes(currentEnvironment) &&
      ["STABILIZING", "RELEASING"].includes(stateOf(current.liquidityState))) {
      influenceChains.push({
        driver: "Liquidity stabilization",
        from: stateOf(current.liquidityState),
        to: currentEnvironment,
        effect: "Stabilization structure"
      });
      stableScore += 1;
      affectedRegions.add("Environment");
    }
  }

  addDriver(dominantDrivers, "Liquidity pressure", "Pressure conditions preceded suppression or instability.", volatileScore);
  addDriver(dominantDrivers, "Confidence deterioration", "Low confidence preceded drift changes.", fracturedScore);
  addDriver(dominantDrivers, "Stabilization structure", "Stabilizing liquidity preceded calmer environments.", stableScore);

  let causalityState = "EMERGING_CAUSALITY";
  if (volatileScore >= 4) {
    causalityState = "VOLATILE_CAUSALITY";
  } else if (fracturedScore >= 4) {
    causalityState = "FRACTURED_CAUSALITY";
  } else if (stableScore >= 3 && volatileScore < 2 && fracturedScore < 2) {
    causalityState = "STABLE_CAUSALITY";
  }

  return {
    causalityState,
    dominantDrivers: dominantDrivers.slice(0, 6),
    influenceChains: influenceChains.slice(0, 8),
    affectedRegions: [...affectedRegions],
    causalityConfidence: confidenceFor(recent.length, dominantDrivers.length),
    warnings: ["VOLATILE_CAUSALITY", "FRACTURED_CAUSALITY"].includes(causalityState)
      ? ["Environmental causality is unstable across recent cognition history."]
      : [],
    summary: `${causalityState} mapped across ${influenceChains.length} influence chains.`
  };
}

module.exports = {
  AWAITING_ENVIRONMENT_CAUSALITY,
  evaluateEnvironmentalCausality
};
