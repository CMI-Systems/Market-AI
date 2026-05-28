/*
 * Deterministic alert readiness gate for Market AI observations.
 * It decides whether an existing intelligence result is worth surfacing later.
 */

const PRIORITY_ORDER = ["NONE", "LOW", "MEDIUM", "HIGH"];

function downgradePriority(priority) {
  const currentIndex = PRIORITY_ORDER.indexOf(priority);

  if (currentIndex <= 0) {
    return "NONE";
  }

  return PRIORITY_ORDER[currentIndex - 1];
}

function classifyAlertPriority(input = {}) {
  const {
    confidenceProfile = {},
    signalIntelligence = {},
    failsafeBrain = {},
    behavioralRiskBrain = {},
    regime = {}
  } = input;

  if (
    failsafeBrain.status === "ACTIVE" ||
    confidenceProfile.level === "AVOID" ||
    signalIntelligence.signalType === "NO_QUALITY_SIGNAL"
  ) {
    return "NONE";
  }

  let priority = "NONE";

  if (signalIntelligence.quality === "HIGH") {
    priority = confidenceProfile.level === "HIGH" ? "HIGH" : "MEDIUM";
  } else if (signalIntelligence.quality === "MODERATE") {
    priority = confidenceProfile.level === "LOW" ? "LOW" : "MEDIUM";
  }

  if (["CHOPPY", "TRANSITIONAL"].includes(regime.type)) {
    priority = downgradePriority(priority);
  }

  if (behavioralRiskBrain.riskLevel === "HIGH") {
    if (signalIntelligence.quality !== "HIGH") {
      return "NONE";
    }

    priority = downgradePriority(priority);
  }

  return priority;
}

function buildAlertReason(input = {}) {
  const {
    confidenceProfile = {},
    signalIntelligence = {},
    failsafeBrain = {},
    behavioralRiskBrain = {},
    regime = {}
  } = input;
  const symbol = typeof input.symbol === "string" && input.symbol.trim()
    ? input.symbol
    : "Market";

  if (failsafeBrain.status === "ACTIVE") {
    return "Alert readiness is withheld because the failsafe layer is active.";
  }

  if (confidenceProfile.level === "AVOID") {
    return "Alert readiness is withheld because confidence is degraded.";
  }

  if (signalIntelligence.signalType === "NO_QUALITY_SIGNAL") {
    return "Alert readiness is withheld because no quality observational signal is present.";
  }

  if (behavioralRiskBrain.riskLevel === "HIGH" && signalIntelligence.quality !== "HIGH") {
    return "Alert readiness is withheld because behavioral risk is elevated.";
  }

  if (["CHOPPY", "TRANSITIONAL"].includes(regime.type)) {
    return `${symbol} has observational signal context, but unstable regime conditions reduce readiness priority.`;
  }

  return `${symbol} has ${signalIntelligence.quality?.toLowerCase() || "usable"} observational signal context with ${confidenceProfile.level?.toLowerCase() || "limited"} confidence.`;
}

function buildWarnings(input = {}) {
  const warnings = [
    ...(Array.isArray(input.signalIntelligence?.warnings)
      ? input.signalIntelligence.warnings
      : []),
    ...(Array.isArray(input.narrativeIntelligence?.warnings)
      ? input.narrativeIntelligence.warnings
      : [])
  ];

  if (["CHOPPY", "TRANSITIONAL"].includes(input.regime?.type)) {
    warnings.push("Regime conditions reduce alert priority.");
  }

  if (input.behavioralRiskBrain?.riskLevel === "HIGH") {
    warnings.push("Behavioral risk is elevated.");
  }

  if (input.failsafeBrain?.status === "ACTIVE") {
    warnings.push("Failsafe layer is active.");
  }

  return [...new Set(warnings)];
}

function evaluateAlertReadiness(input = {}) {
  const priority = classifyAlertPriority(input);

  return {
    alertReady: priority !== "NONE",
    priority,
    alertType: input.signalIntelligence?.signalType || "NO_QUALITY_SIGNAL",
    reason: buildAlertReason(input),
    warnings: buildWarnings(input)
  };
}

module.exports = {
  buildAlertReason,
  classifyAlertPriority,
  evaluateAlertReadiness
};
