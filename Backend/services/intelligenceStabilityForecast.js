/*
 * Deterministic intelligence-environment stability forecast.
 * This is not a price forecast and does not create recommendations.
 */

function clamp(score) {
  return Number(Math.max(0, Math.min(1, score)).toFixed(2));
}

function safeArray(value) {
  return Array.isArray(value)
    ? value.filter((item) => item && typeof item === "object")
    : [];
}

function unique(items) {
  return [...new Set(items.filter((item) => {
    return typeof item === "string" && item.trim();
  }))];
}

function pressureIsLow(pressure = {}) {
  return ["NONE", "LOW"].includes(pressure.pressureLevel);
}

function pressureIsElevated(pressure = {}) {
  return ["HIGH", "EXTREME"].includes(pressure.pressureLevel);
}

function runtimeIsStable(runtimeHealth = {}) {
  return ["HEALTHY", "STABLE"].includes(runtimeHealth.status);
}

function runtimeIsDegraded(runtimeHealth = {}) {
  return ["DEGRADED", "UNSTABLE", "CRITICAL"].includes(runtimeHealth.status);
}

function anomalyIsElevated(anomalyIntelligence = {}) {
  return ["HIGH", "MEDIUM"].includes(anomalyIntelligence.severity);
}

function anomalyIsLow(anomalyIntelligence = {}) {
  return ["NONE", "LOW"].includes(anomalyIntelligence.severity);
}

function consensusIsConflicted(consensus = {}) {
  return consensus.consensusStrength === "CONFLICTED" ||
    safeArray(consensus.conflictingSystems).length >= 3;
}

function consensusIsSupportive(consensus = {}) {
  return ["STRONG", "MODERATE"].includes(consensus.consensusStrength);
}

function environmentIsFragmented(strategicEnvironment = {}) {
  return strategicEnvironment.stability === "FRAGMENTED" ||
    ["UNSTABLE", "HIGH_RISK"].includes(strategicEnvironment.environment);
}

function driftDetected(cognitiveDrift = {}) {
  return cognitiveDrift.driftDetected === true ||
    ["HIGH", "MODERATE"].includes(cognitiveDrift.severity);
}

function strongInstabilityCorrelations(correlations = []) {
  return safeArray(correlations).filter((correlation) => {
    return correlation.strength === "STRONG";
  }).length;
}

function highTransitions(transitions = []) {
  return safeArray(transitions).filter((transition) => {
    return transition.severity === "HIGH";
  }).length;
}

function detectStabilityDrivers(input = {}) {
  const drivers = [];

  if (pressureIsLow(input.environmentalPressure)) {
    drivers.push("low_pressure");
  } else if (pressureIsElevated(input.environmentalPressure)) {
    drivers.push("elevated_pressure");
  }

  if (runtimeIsStable(input.runtimeHealth)) {
    drivers.push("stable_runtime");
  } else if (runtimeIsDegraded(input.runtimeHealth)) {
    drivers.push("degraded_runtime");
  }

  if (anomalyIsLow(input.anomalyIntelligence)) {
    drivers.push("minimal_anomaly_activity");
  } else if (anomalyIsElevated(input.anomalyIntelligence)) {
    drivers.push("elevated_anomaly_activity");
  }

  if (consensusIsSupportive(input.intelligenceConsensus)) {
    drivers.push("supportive_consensus");
  }

  if (consensusIsConflicted(input.intelligenceConsensus)) {
    drivers.push("conflicted_consensus");
  }

  if (environmentIsFragmented(input.strategicEnvironment)) {
    drivers.push("strategic_fragmentation");
  }

  if (driftDetected(input.cognitiveDrift)) {
    drivers.push("cognitive_drift");
  }

  if (highTransitions(input.cognitiveTransitions) > 0) {
    drivers.push("high_severity_transitions");
  }

  if (strongInstabilityCorrelations(input.cognitiveCorrelations) >= 2) {
    drivers.push("strong_instability_correlations");
  }

  if (
    input.environmentalPressure?.pressureLevel === "MODERATE" &&
    runtimeIsStable(input.runtimeHealth) &&
    anomalyIsLow(input.anomalyIntelligence)
  ) {
    drivers.push("recovering_pressure_context");
  }

  return unique(drivers);
}

function classifyStabilityTrajectory(input = {}) {
  const drivers = Array.isArray(input.drivers)
    ? input.drivers
    : detectStabilityDrivers(input);

  if (!drivers.length) {
    return "UNKNOWN";
  }

  if (
    drivers.includes("conflicted_consensus") ||
    drivers.includes("strategic_fragmentation") ||
    drivers.includes("strong_instability_correlations")
  ) {
    return "FRAGMENTING";
  }

  if (
    drivers.includes("elevated_pressure") ||
    drivers.includes("cognitive_drift") ||
    drivers.includes("degraded_runtime") ||
    drivers.includes("elevated_anomaly_activity") ||
    drivers.includes("high_severity_transitions")
  ) {
    return "DETERIORATING";
  }

  if (
    drivers.includes("recovering_pressure_context") ||
    (
      drivers.includes("stable_runtime") &&
      drivers.includes("supportive_consensus") &&
      !drivers.includes("elevated_anomaly_activity") &&
      input.environmentalPressure?.pressureLevel === "MODERATE"
    )
  ) {
    return "RECOVERING";
  }

  if (
    drivers.includes("stable_runtime") &&
    drivers.includes("low_pressure") &&
    drivers.includes("minimal_anomaly_activity") &&
    drivers.includes("supportive_consensus")
  ) {
    if (input.runtimeHealth?.status === "HEALTHY" &&
      input.intelligenceConsensus?.consensusStrength === "STRONG") {
      return "STABLE";
    }

    return "STABILIZING";
  }

  return "UNKNOWN";
}

function confidenceForTrajectory(trajectory, drivers = []) {
  const driverCount = drivers.length;

  if (trajectory === "UNKNOWN") return 0.15;
  if (trajectory === "STABLE") return clamp(0.62 + driverCount * 0.05);
  if (trajectory === "STABILIZING") return clamp(0.55 + driverCount * 0.05);
  if (trajectory === "RECOVERING") return clamp(0.5 + driverCount * 0.05);
  if (trajectory === "DETERIORATING") return clamp(0.58 + driverCount * 0.05);
  if (trajectory === "FRAGMENTING") return clamp(0.62 + driverCount * 0.05);
  return 0.15;
}

function buildWarnings(trajectory, drivers = []) {
  const warnings = [];

  if (trajectory === "FRAGMENTING") {
    warnings.push("Intelligence environment shows fragmentation pressure.");
  } else if (trajectory === "DETERIORATING") {
    warnings.push("Intelligence environment shows deterioration pressure.");
  }

  if (drivers.includes("degraded_runtime")) {
    warnings.push("Runtime health is degraded.");
  }

  if (drivers.includes("elevated_anomaly_activity")) {
    warnings.push("Anomaly activity is elevated.");
  }

  if (drivers.includes("cognitive_drift")) {
    warnings.push("Cognitive drift is detected.");
  }

  return unique(warnings);
}

function buildObservations(trajectory, drivers = []) {
  if (trajectory === "UNKNOWN") {
    return ["Insufficient intelligence stability context is available."];
  }

  return [
    `${drivers.length} stability drivers are active.`,
    `Intelligence stability trajectory is ${trajectory}.`
  ];
}

function buildStabilityForecastSummary(input = {}) {
  switch (input.trajectory) {
    case "STABLE":
      return "Intelligence environment appears stable under current system conditions.";
    case "STABILIZING":
      return "Intelligence environment appears to be stabilizing under current conditions.";
    case "RECOVERING":
      return "Intelligence environment shows early recovery characteristics.";
    case "DETERIORATING":
      return "Intelligence environment shows deterioration pressure.";
    case "FRAGMENTING":
      return "Intelligence environment shows fragmentation across systems.";
    default:
      return "Intelligence stability forecast is unclear from available context.";
  }
}

function forecastIntelligenceStability(input = {}) {
  const drivers = detectStabilityDrivers(input);
  const trajectory = classifyStabilityTrajectory({
    ...input,
    drivers
  });
  const confidence = confidenceForTrajectory(trajectory, drivers);

  return {
    trajectory,
    confidence,
    drivers,
    warnings: buildWarnings(trajectory, drivers),
    observations: buildObservations(trajectory, drivers),
    summary: buildStabilityForecastSummary({
      trajectory
    })
  };
}

module.exports = {
  buildStabilityForecastSummary,
  classifyStabilityTrajectory,
  detectStabilityDrivers,
  forecastIntelligenceStability
};
