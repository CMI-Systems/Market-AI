/*
 * Deterministic anomaly intelligence for structured review signals.
 * It flags abnormal context without creating recommendations or notifications.
 */

function unique(items) {
  return [...new Set(items)];
}

function hasAlertLikeSignalContext(input = {}) {
  return ["HIGH", "MODERATE"].includes(input.signalIntelligence?.quality) ||
    (
      input.signalIntelligence?.signalType &&
      !["NO_QUALITY_SIGNAL", "LOW_CONFIDENCE_CHOP"].includes(
        input.signalIntelligence.signalType
      )
    );
}

function detectMarketAnomalies(input = {}) {
  const anomalyTypes = [];
  const warnings = [];

  if (
    input.marketState?.volatility === "EXPANDING" ||
    input.regime?.type === "HIGH_VOLATILITY"
  ) {
    if (input.signalIntelligence?.signalType === "REVERSAL_WARNING") {
      anomalyTypes.push("HIGH_VOLATILITY_REVERSAL");
      warnings.push("High-volatility context overlaps reversal warning conditions.");
    }
  }

  if (input.multiSymbolContext?.alignment === "CONFLICTED") {
    anomalyTypes.push("GROUP_CONTEXT_CONFLICT");
    warnings.push("Multi-symbol context shows directional conflict.");
  }

  return {
    anomalyTypes,
    warnings
  };
}

function detectConfidenceAnomalies(input = {}) {
  const anomalyTypes = [];
  const warnings = [];
  const lowConfidence = ["LOW", "AVOID"].includes(input.confidenceProfile?.level);
  const highMemoryImportance = input.adaptiveMemoryScore?.importance === "HIGH" ||
    input.adaptiveMemoryScore?.score >= 0.75;

  if (input.confidenceProfile?.level === "AVOID" && hasAlertLikeSignalContext(input)) {
    anomalyTypes.push("CONFIDENCE_SIGNAL_MISMATCH");
    warnings.push("Avoid-level confidence overlaps notable signal context.");
  }

  if (lowConfidence && highMemoryImportance) {
    anomalyTypes.push("HIGH_MEMORY_LOW_CONFIDENCE");
    warnings.push("High memory significance overlaps restrained confidence.");
  }

  return {
    anomalyTypes,
    warnings
  };
}

function detectBehavioralAnomalies(input = {}) {
  const anomalyTypes = [];
  const warnings = [];

  if (
    input.behavioralIntelligence?.behavioralState === "UNSTABLE" ||
    input.behavioralIntelligence?.riskLevel === "HIGH"
  ) {
    anomalyTypes.push("BEHAVIORAL_RISK_ANOMALY");
    warnings.push("Behavioral conditions are elevated for review.");
  }

  return {
    anomalyTypes,
    warnings
  };
}

function classifyAnomalySeverity(input = {}) {
  const anomalyTypes = Array.isArray(input.anomalyTypes)
    ? input.anomalyTypes
    : [];

  if (!anomalyTypes.length) {
    return "NONE";
  }

  if (
    input.failsafeBrain?.status === "ACTIVE" ||
    anomalyTypes.includes("HIGH_VOLATILITY_REVERSAL") ||
    (
      anomalyTypes.includes("CONFIDENCE_SIGNAL_MISMATCH") &&
      anomalyTypes.includes("BEHAVIORAL_RISK_ANOMALY")
    )
  ) {
    return "HIGH";
  }

  if (
    anomalyTypes.includes("GROUP_CONTEXT_CONFLICT") ||
    anomalyTypes.includes("CONFIDENCE_SIGNAL_MISMATCH") ||
    anomalyTypes.includes("BEHAVIORAL_RISK_ANOMALY") ||
    anomalyTypes.includes("HIGH_MEMORY_LOW_CONFIDENCE")
  ) {
    return "MEDIUM";
  }

  return "LOW";
}

function buildSummary(severity, anomalyTypes) {
  if (severity === "NONE") {
    return "No structured anomaly conditions are detected in current context.";
  }

  return `${severity} anomaly context is present across ${anomalyTypes.length} review condition${anomalyTypes.length === 1 ? "" : "s"}.`;
}

function evaluateAnomalyIntelligence(input = {}) {
  const marketAnomalies = detectMarketAnomalies(input);
  const confidenceAnomalies = detectConfidenceAnomalies(input);
  const behavioralAnomalies = detectBehavioralAnomalies(input);
  const anomalyTypes = [
    ...marketAnomalies.anomalyTypes,
    ...confidenceAnomalies.anomalyTypes,
    ...behavioralAnomalies.anomalyTypes
  ];
  const warnings = [
    ...marketAnomalies.warnings,
    ...confidenceAnomalies.warnings,
    ...behavioralAnomalies.warnings
  ];

  if (input.failsafeBrain?.status === "ACTIVE") {
    anomalyTypes.push("SYSTEM_FAILSAFE_ACTIVE");
    warnings.push("Failsafe brain is active under current system context.");
  }

  const safeAnomalyTypes = unique(anomalyTypes);
  const safeWarnings = unique(warnings);
  const severity = classifyAnomalySeverity({
    anomalyTypes: safeAnomalyTypes,
    failsafeBrain: input.failsafeBrain
  });

  return {
    anomalyDetected: safeAnomalyTypes.length > 0,
    severity,
    anomalyTypes: safeAnomalyTypes,
    warnings: safeWarnings,
    summary: buildSummary(severity, safeAnomalyTypes)
  };
}

module.exports = {
  classifyAnomalySeverity,
  detectBehavioralAnomalies,
  detectConfidenceAnomalies,
  detectMarketAnomalies,
  evaluateAnomalyIntelligence
};
