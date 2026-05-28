/*
 * Deterministic health scoring for the intelligence pipeline runtime.
 * This layer summarizes operational stability and does not change decisions.
 */

function clamp(score) {
  return Number(Math.max(0, Math.min(1, score)).toFixed(2));
}

function safeNumber(value, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : fallback;
}

function rejectionRate(runtimeMetrics = {}) {
  const received = safeNumber(runtimeMetrics.totalEventsReceived);
  const rejected = safeNumber(runtimeMetrics.totalEventsRejected);

  return received > 0 ? rejected / received : 0;
}

function metricsAreCorrupted(runtimeMetrics) {
  if (!runtimeMetrics || typeof runtimeMetrics !== "object") {
    return true;
  }

  const counters = [
    "totalEventsReceived",
    "totalEventsAccepted",
    "totalEventsRejected",
    "totalBrainOutputs",
    "totalFailsafeActivations",
    "totalLowConfidenceOutputs"
  ];

  return counters.some((counter) => {
    const value = runtimeMetrics[counter];
    return typeof value !== "number" || !Number.isFinite(value) || value < 0;
  });
}

function streamLooksUnstable(streamStatus = {}, runtimeMetrics = {}) {
  if (streamStatus.active === true && streamStatus.stoppedAt) {
    return true;
  }

  if (
    streamStatus.active === true &&
    safeNumber(streamStatus.maxEvents, 0) > 0 &&
    safeNumber(streamStatus.eventsProcessed, 0) > safeNumber(streamStatus.maxEvents, 0)
  ) {
    return true;
  }

  return runtimeMetrics.activeStream === true && runtimeMetrics.streamStartedAt === null;
}

function memoryLooksUnstable(memoryStatus = {}) {
  if (!memoryStatus || typeof memoryStatus !== "object") {
    return true;
  }

  return safeNumber(memoryStatus.totalEventsStored, -1) < 0 ||
    safeNumber(memoryStatus.totalSymbolsTracked, -1) < 0 ||
    !memoryStatus.memoryBySymbol ||
    typeof memoryStatus.memoryBySymbol !== "object";
}

function detectRuntimeWarnings(input = {}) {
  const warnings = [];
  const metrics = input.runtimeMetrics || {};
  const confidenceLevel = input.confidenceProfile?.level;
  const anomalySeverity = input.anomalyIntelligence?.severity;

  if (metricsAreCorrupted(input.runtimeMetrics)) {
    warnings.push("Runtime metrics are incomplete or corrupted.");
  }

  if (streamLooksUnstable(input.streamStatus, metrics)) {
    warnings.push("Stream state appears unstable.");
  }

  if (
    safeNumber(metrics.totalEventsRejected) >= 3 ||
    rejectionRate(metrics) >= 0.4
  ) {
    warnings.push("Repeated ingestion failures are present.");
  }

  if (
    input.anomalyIntelligence?.anomalyDetected === true &&
    ["HIGH", "MEDIUM"].includes(anomalySeverity)
  ) {
    warnings.push("Anomaly activity is elevated.");
  }

  if (input.failsafeBrain?.status === "ACTIVE") {
    warnings.push("Failsafe activation is present.");
  }

  if (["LOW", "AVOID"].includes(confidenceLevel)) {
    warnings.push("Confidence conditions are restrained.");
  }

  if (safeNumber(metrics.totalLowConfidenceOutputs) >= 3) {
    warnings.push("Repeated low-confidence conditions are present.");
  }

  if (memoryLooksUnstable(input.memoryStatus)) {
    warnings.push("Memory status appears unstable.");
  }

  return [...new Set(warnings)];
}

function classifyRuntimeHealth(input = {}) {
  if (
    input.failsafeBrain?.status === "ACTIVE" ||
    metricsAreCorrupted(input.runtimeMetrics) ||
    rejectionRate(input.runtimeMetrics) >= 0.6
  ) {
    return "CRITICAL";
  }

  if (input.healthScore <= 0.2) {
    return "UNSTABLE";
  }

  if (input.healthScore < 0.5) {
    return "DEGRADED";
  }

  if (input.healthScore < 0.8) {
    return "STABLE";
  }

  return "HEALTHY";
}

function buildRuntimeHealthSummary(input = {}) {
  switch (input.status) {
    case "HEALTHY":
      return "Runtime health is healthy under stable pipeline conditions.";
    case "STABLE":
      return "Runtime health is stable with some conditions to keep visible.";
    case "DEGRADED":
      return "Runtime health is degraded and requires closer operational review.";
    case "UNSTABLE":
      return "Runtime health is unstable under elevated pipeline stress.";
    default:
      return "Runtime health is critical under current pipeline conditions.";
  }
}

function buildObservations(input = {}) {
  const metrics = input.runtimeMetrics || {};
  const streamStatus = input.streamStatus || {};
  const memoryStatus = input.memoryStatus || {};
  const observations = [];

  observations.push(
    `${safeNumber(metrics.totalBrainOutputs)} brain outputs are visible in runtime metrics.`
  );
  observations.push(
    `${safeNumber(memoryStatus.totalEventsStored)} memory events are currently tracked.`
  );

  if (streamStatus.active === true || metrics.activeStream === true) {
    observations.push("A stream is currently active.");
  } else {
    observations.push("No active stream is reported.");
  }

  if (input.anomalyIntelligence?.anomalyDetected !== true) {
    observations.push("No elevated anomaly condition is reported.");
  }

  return observations;
}

function evaluateRuntimeHealth(input = {}) {
  const metrics = input.runtimeMetrics || {};
  const warnings = detectRuntimeWarnings(input);
  let healthScore = 0.9;

  if (metricsAreCorrupted(input.runtimeMetrics)) {
    healthScore -= 0.6;
  }

  if (streamLooksUnstable(input.streamStatus, metrics)) {
    healthScore -= 0.18;
  }

  if (memoryLooksUnstable(input.memoryStatus)) {
    healthScore -= 0.18;
  }

  if (rejectionRate(metrics) >= 0.4) {
    healthScore -= 0.28;
  } else if (safeNumber(metrics.totalEventsRejected) >= 3) {
    healthScore -= 0.18;
  } else if (safeNumber(metrics.totalEventsRejected) > 0) {
    healthScore -= 0.08;
  }

  if (input.anomalyIntelligence?.severity === "HIGH") {
    healthScore -= 0.25;
  } else if (input.anomalyIntelligence?.severity === "MEDIUM") {
    healthScore -= 0.14;
  } else if (input.anomalyIntelligence?.severity === "LOW") {
    healthScore -= 0.06;
  }

  if (input.confidenceProfile?.level === "AVOID") {
    healthScore -= 0.22;
  } else if (input.confidenceProfile?.level === "LOW") {
    healthScore -= 0.12;
  } else if (input.confidenceProfile?.level === "MODERATE") {
    healthScore -= 0.04;
  }

  if (input.failsafeBrain?.status === "ACTIVE") {
    healthScore = 0;
  }

  const boundedScore = clamp(healthScore);
  const status = classifyRuntimeHealth({
    runtimeMetrics: input.runtimeMetrics,
    failsafeBrain: input.failsafeBrain,
    healthScore: boundedScore
  });

  return {
    healthScore: boundedScore,
    status,
    warnings,
    observations: buildObservations(input),
    summary: buildRuntimeHealthSummary({ status })
  };
}

module.exports = {
  buildRuntimeHealthSummary,
  classifyRuntimeHealth,
  detectRuntimeWarnings,
  evaluateRuntimeHealth
};
