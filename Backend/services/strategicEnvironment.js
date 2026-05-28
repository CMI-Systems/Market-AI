/*
 * Deterministic strategic environment classification for Market AI.
 * It summarizes broader intelligence conditions without changing decisions.
 */

function unique(items) {
  return [...new Set(items)];
}

function hasAlignedGroupContext(multiSymbolContext = {}) {
  return ["STRONG", "MODERATE"].includes(multiSymbolContext.alignment) &&
    !["MIXED", "UNKNOWN"].includes(multiSymbolContext.groupBias);
}

function behaviorIsStable(behavioralIntelligence = {}) {
  return behavioralIntelligence.behavioralState === "DISCIPLINED" ||
    (
      behavioralIntelligence.behavioralState === "CAUTION" &&
      behavioralIntelligence.riskLevel !== "HIGH"
    );
}

function severeAnomaly(anomalyIntelligence = {}) {
  return anomalyIntelligence.severity === "HIGH";
}

function moderateAnomaly(anomalyIntelligence = {}) {
  return anomalyIntelligence.severity === "MEDIUM";
}

function lowAnomaly(anomalyIntelligence = {}) {
  return !anomalyIntelligence.anomalyDetected ||
    ["NONE", "LOW"].includes(anomalyIntelligence.severity);
}

function fragmentedContext(input = {}) {
  return input.intelligenceConsensus?.consensusStrength === "CONFLICTED" ||
    input.multiSymbolContext?.alignment === "CONFLICTED" ||
    (Array.isArray(input.intelligenceConsensus?.conflictingSystems) &&
      input.intelligenceConsensus.conflictingSystems.length >= 3);
}

function detectEnvironmentWarnings(input = {}) {
  const warnings = [];

  if (input.failsafeBrain?.status === "ACTIVE") {
    warnings.push("Failsafe protection is active.");
  }

  if (input.runtimeHealth?.status === "CRITICAL") {
    warnings.push("Runtime health is critical.");
  } else if (["DEGRADED", "UNSTABLE"].includes(input.runtimeHealth?.status)) {
    warnings.push("Runtime health is degraded or unstable.");
  }

  if (severeAnomaly(input.anomalyIntelligence)) {
    warnings.push("Severe anomaly activity is present.");
  } else if (moderateAnomaly(input.anomalyIntelligence)) {
    warnings.push("Moderate anomaly activity is present.");
  }

  if (
    input.behavioralIntelligence?.behavioralState === "UNSTABLE" ||
    input.behavioralIntelligence?.riskLevel === "HIGH"
  ) {
    warnings.push("Behavioral conditions are unstable or high risk.");
  }

  if (["LOW", "AVOID"].includes(input.confidenceProfile?.level)) {
    warnings.push("Confidence quality is restrained.");
  }

  if (input.multiSymbolContext?.alignment === "CONFLICTED") {
    warnings.push("Multi-symbol alignment is conflicted.");
  }

  if (
    input.adaptiveMemoryScore?.importance === "HIGH" &&
    input.anomalyIntelligence?.anomalyDetected === true
  ) {
    warnings.push("High-significance anomaly context deserves strategic review.");
  }

  return unique(warnings);
}

function classifyStability(input = {}) {
  if (!input || typeof input !== "object") {
    return "UNKNOWN";
  }

  if (fragmentedContext(input)) {
    return "FRAGMENTED";
  }

  if (
    input.failsafeBrain?.status === "ACTIVE" ||
    input.runtimeHealth?.status === "CRITICAL" ||
    severeAnomaly(input.anomalyIntelligence)
  ) {
    return "LOW";
  }

  if (
    input.intelligenceConsensus?.consensusStrength === "STRONG" &&
    input.runtimeHealth?.status === "HEALTHY" &&
    behaviorIsStable(input.behavioralIntelligence) &&
    hasAlignedGroupContext(input.multiSymbolContext)
  ) {
    return "HIGH";
  }

  if (
    ["MODERATE", "STRONG"].includes(input.intelligenceConsensus?.consensusStrength) &&
    ["HEALTHY", "STABLE"].includes(input.runtimeHealth?.status)
  ) {
    return "MODERATE";
  }

  if (
    input.intelligenceConsensus?.consensusStrength === "WEAK" ||
    ["DEGRADED", "UNSTABLE"].includes(input.runtimeHealth?.status)
  ) {
    return "LOW";
  }

  return "UNKNOWN";
}

function classifyStrategicEnvironment(input = {}) {
  if (
    input.failsafeBrain?.status === "ACTIVE" ||
    input.runtimeHealth?.status === "CRITICAL" ||
    severeAnomaly(input.anomalyIntelligence) &&
      fragmentedContext(input)
  ) {
    return "HIGH_RISK";
  }

  if (
    fragmentedContext(input) ||
    ["DEGRADED", "UNSTABLE"].includes(input.runtimeHealth?.status) ||
    input.behavioralIntelligence?.behavioralState === "UNSTABLE" ||
    severeAnomaly(input.anomalyIntelligence)
  ) {
    return "UNSTABLE";
  }

  if (
    input.intelligenceConsensus?.consensusStrength === "STRONG" &&
    input.runtimeHealth?.status === "HEALTHY" &&
    lowAnomaly(input.anomalyIntelligence) &&
    behaviorIsStable(input.behavioralIntelligence) &&
    hasAlignedGroupContext(input.multiSymbolContext)
  ) {
    return "OPTIMAL";
  }

  if (
    ["STRONG", "MODERATE"].includes(input.intelligenceConsensus?.consensusStrength) &&
    ["HIGH", "MODERATE"].includes(input.confidenceProfile?.level) &&
    ["HEALTHY", "STABLE"].includes(input.runtimeHealth?.status) &&
    lowAnomaly(input.anomalyIntelligence) &&
    detectEnvironmentWarnings(input).length <= 1
  ) {
    return "FAVORABLE";
  }

  if (
    input.intelligenceConsensus?.consensusStrength === "WEAK" ||
    moderateAnomaly(input.anomalyIntelligence) ||
    ["LOW", "AVOID"].includes(input.confidenceProfile?.level) ||
    !hasAlignedGroupContext(input.multiSymbolContext)
  ) {
    return "CAUTION";
  }

  return "UNKNOWN";
}

function buildEnvironmentSummary(input = {}) {
  switch (input.environment) {
    case "OPTIMAL":
      return "Strategic environment is optimal under aligned and stable intelligence conditions.";
    case "FAVORABLE":
      return "Strategic environment is favorable with usable alignment and limited warning pressure.";
    case "CAUTION":
      return "Strategic environment warrants caution because context is mixed or lower clarity.";
    case "UNSTABLE":
      return "Strategic environment is unstable under conflicting or degraded conditions.";
    case "HIGH_RISK":
      return "Strategic environment is high risk under severe system or anomaly conditions.";
    default:
      return "Strategic environment is not yet clear from available context.";
  }
}

function buildObservations(input = {}, environment, stability) {
  const observations = [
    `Consensus strength is ${input.intelligenceConsensus?.consensusStrength || "UNKNOWN"}.`,
    `Runtime health is ${input.runtimeHealth?.status || "UNKNOWN"}.`,
    `Environment stability is ${stability}.`
  ];

  if (hasAlignedGroupContext(input.multiSymbolContext)) {
    observations.push("Multi-symbol context contributes aligned evidence.");
  } else {
    observations.push("Multi-symbol context is limited or uneven.");
  }

  if (
    input.adaptiveMemoryScore?.importance === "HIGH" &&
    environment !== "OPTIMAL"
  ) {
    observations.push("High-significance memory context remains visible in strategic review.");
  }

  return observations;
}

function evaluateStrategicEnvironment(input = {}) {
  const environment = classifyStrategicEnvironment(input);
  const stability = classifyStability(input);

  return {
    environment,
    stability,
    warnings: detectEnvironmentWarnings(input),
    observations: buildObservations(input, environment, stability),
    summary: buildEnvironmentSummary({ environment })
  };
}

module.exports = {
  buildEnvironmentSummary,
  classifyStrategicEnvironment,
  detectEnvironmentWarnings,
  evaluateStrategicEnvironment
};
