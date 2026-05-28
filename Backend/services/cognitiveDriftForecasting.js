/*
 * Cognitive drift and environment forecast cognition for Market AI.
 * This is environmental trajectory analysis only, not trading prediction.
 */

const AWAITING_DRIFT = "Awaiting cognitive drift cognition.";
const AWAITING_FORECAST = "Awaiting strategic environment forecast cognition.";

function safeArray(value) {
  return Array.isArray(value)
    ? value.filter((item) => item && typeof item === "object")
    : [];
}

function driftSeverity(signals = []) {
  if (signals.some((signal) => signal.type === "PRESSURE_AMPLIFICATION")) return "SEVERE";
  if (signals.some((signal) => signal.type === "FRAGMENTATION_DRIFT")) return "HIGH";
  if (signals.some((signal) => signal.type === "DEGRADATION_DRIFT")) return "MODERATE";
  return signals.length ? "LOW" : "LOW";
}

function classifyDrift(signals = []) {
  if (!signals.length) return "STABLE";
  if (signals.some((signal) => signal.type === "PRESSURE_AMPLIFICATION")) return "VOLATILE";
  if (signals.some((signal) => signal.type === "FRAGMENTATION_DRIFT")) return "FRAGMENTING";
  if (signals.some((signal) => signal.type === "DEGRADATION_DRIFT")) return "DEGRADING";
  if (signals.some((signal) => signal.type === "RECOVERY_ACCELERATION")) return "RECOVERING";
  return "STABLE";
}

function signalsForRegion(region = {}) {
  const signals = [];

  if (region.fragmentation === true || region.state === "FRAGMENTED" || region.trajectory === "FRAGMENTING") {
    signals.push({
      ecosystem: region.ecosystem,
      type: "FRAGMENTATION_DRIFT",
      detail: "Fragmentation behavior is visible in this ecosystem."
    });
  }

  if (region.state === "ESCALATING" || region.trajectory === "DETERIORATING") {
    signals.push({
      ecosystem: region.ecosystem,
      type: "DEGRADATION_DRIFT",
      detail: "Environmental state is degrading."
    });
  }

  if (region.pressure === "SEVERE") {
    signals.push({
      ecosystem: region.ecosystem,
      type: "PRESSURE_AMPLIFICATION",
      detail: "Pressure intensity is amplified."
    });
  }

  if (region.synchronization === "MIXED" && ["HIGH", "SEVERE"].includes(region.pressure)) {
    signals.push({
      ecosystem: region.ecosystem,
      type: "SYNCHRONIZATION_DECAY",
      detail: "Synchronization is weakening under pressure."
    });
  }

  if (region.state === "RECOVERING" || region.trajectory === "RECOVERING") {
    signals.push({
      ecosystem: region.ecosystem,
      type: "RECOVERY_ACCELERATION",
      detail: "Environmental recovery behavior is visible."
    });
  }

  return signals;
}

function awaitingDrift() {
  return {
    driftState: "UNKNOWN",
    driftSignals: [],
    affectedEcosystems: [],
    severity: "LOW",
    warnings: [],
    summary: AWAITING_DRIFT
  };
}

function detectCognitiveDrift(input = {}) {
  const regions = safeArray(input.strategicEnvironmentMap?.ecosystemRegions);

  if (!regions.length) {
    return awaitingDrift();
  }

  const driftSignals = regions.flatMap(signalsForRegion);
  const affectedEcosystems = [...new Set(driftSignals.map((signal) => signal.ecosystem))].sort();
  const driftState = classifyDrift(driftSignals);
  const severity = driftSeverity(driftSignals);
  const warnings = [];

  if (["HIGH", "SEVERE"].includes(severity)) {
    warnings.push("Cognitive drift severity is elevated across mapped ecosystems.");
  }

  if (driftState === "FRAGMENTING") {
    warnings.push("Fragmentation drift is visible in environmental cognition.");
  }

  return {
    driftState,
    driftSignals,
    affectedEcosystems,
    severity,
    warnings,
    summary: `${driftState} cognitive drift across ${affectedEcosystems.length} ecosystem region${affectedEcosystems.length === 1 ? "" : "s"}.`
  };
}

function forecastForRegion(region = {}) {
  let forecastState = "UNCERTAIN";

  if (region.fragmentation === true || region.trajectory === "FRAGMENTING") {
    forecastState = "FRAGMENTING";
  } else if (region.state === "ESCALATING" || region.trajectory === "DETERIORATING") {
    forecastState = "DETERIORATING";
  } else if (region.state === "RECOVERING" || region.trajectory === "RECOVERING") {
    forecastState = "RECOVERING";
  } else if (region.state === "STABLE" || region.trajectory === "STABILIZING") {
    forecastState = "STABILIZING";
  }

  return {
    ecosystem: region.ecosystem || "UNKNOWN",
    forecastState,
    pressure: region.pressure || "UNKNOWN",
    trajectory: region.trajectory || "UNKNOWN"
  };
}

function aggregateForecast(forecasts = []) {
  if (!forecasts.length) return "UNKNOWN";
  if (forecasts.some((forecast) => forecast.forecastState === "FRAGMENTING")) return "FRAGMENTING";
  if (forecasts.some((forecast) => forecast.forecastState === "DETERIORATING")) return "DETERIORATING";
  if (forecasts.some((forecast) => forecast.forecastState === "RECOVERING")) return "RECOVERING";
  if (forecasts.every((forecast) => forecast.forecastState === "STABILIZING")) return "STABILIZING";
  return "UNCERTAIN";
}

function confidenceTrajectoryForForecast(forecastState) {
  if (forecastState === "STABILIZING") return "IMPROVING";
  if (forecastState === "RECOVERING") return "RECOVERING";
  if (forecastState === "DETERIORATING" || forecastState === "FRAGMENTING") return "WEAKENING";
  if (forecastState === "UNCERTAIN") return "MIXED";
  return "UNKNOWN";
}

function awaitingForecast() {
  return {
    forecastState: "UNKNOWN",
    confidenceTrajectory: "UNKNOWN",
    ecosystemForecasts: [],
    warnings: [],
    summary: AWAITING_FORECAST
  };
}

function forecastStrategicEnvironment(input = {}) {
  const regions = safeArray(input.strategicEnvironmentMap?.ecosystemRegions);

  if (!regions.length) {
    return awaitingForecast();
  }

  const ecosystemForecasts = regions.map(forecastForRegion);
  const forecastState = aggregateForecast(ecosystemForecasts);
  const confidenceTrajectory = confidenceTrajectoryForForecast(forecastState);
  const warnings = [];

  if (["DETERIORATING", "FRAGMENTING"].includes(forecastState)) {
    warnings.push("Environmental trajectory is weakening across mapped ecosystem cognition.");
  }

  if (forecastState === "UNCERTAIN") {
    warnings.push("Environmental trajectory remains mixed across ecosystem regions.");
  }

  return {
    forecastState,
    confidenceTrajectory,
    ecosystemForecasts,
    warnings,
    summary: `${forecastState} strategic environment forecast across ${ecosystemForecasts.length} ecosystem region${ecosystemForecasts.length === 1 ? "" : "s"}.`
  };
}

module.exports = {
  AWAITING_DRIFT,
  AWAITING_FORECAST,
  awaitingDrift,
  awaitingForecast,
  detectCognitiveDrift,
  forecastStrategicEnvironment
};
