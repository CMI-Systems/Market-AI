/*
 * Deterministic environmental pressure analysis.
 * This layer scores pressure buildup without changing decisions or creating alerts.
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

function countStrongCorrelations(correlations = []) {
  return safeArray(correlations).filter((correlation) => {
    return correlation.strength === "STRONG";
  }).length;
}

function hasHighSeverityTransition(transitions = []) {
  return safeArray(transitions).some((transition) => {
    return transition.severity === "HIGH";
  });
}

function hasNotableDrift(cognitiveDrift = {}) {
  return cognitiveDrift.driftDetected === true ||
    ["HIGH", "MODERATE"].includes(cognitiveDrift.severity);
}

function detectPressureSources(input = {}) {
  const sources = [];

  if (input.strategicEnvironment?.environment === "HIGH_RISK") {
    sources.push("high_risk_environment");
  } else if (input.strategicEnvironment?.environment === "UNSTABLE") {
    sources.push("unstable_environment");
  } else if (input.strategicEnvironment?.environment === "CAUTION") {
    sources.push("caution_environment");
  }

  if (input.runtimeHealth?.status === "CRITICAL") {
    sources.push("critical_runtime");
  } else if (["DEGRADED", "UNSTABLE"].includes(input.runtimeHealth?.status)) {
    sources.push("runtime_instability");
  }

  if (input.anomalyIntelligence?.severity === "HIGH") {
    sources.push("severe_anomaly");
  } else if (input.anomalyIntelligence?.severity === "MEDIUM") {
    sources.push("moderate_anomaly");
  }

  if (["LOW", "AVOID"].includes(input.confidenceProfile?.level)) {
    sources.push("confidence_pressure");
  }

  if (
    input.behavioralIntelligence?.behavioralState === "UNSTABLE" ||
    input.behavioralIntelligence?.riskLevel === "HIGH"
  ) {
    sources.push("behavioral_instability");
  }

  if (input.intelligenceConsensus?.consensusStrength === "CONFLICTED") {
    sources.push("consensus_conflict");
  }

  if (hasNotableDrift(input.cognitiveDrift)) {
    sources.push("cognitive_drift");
  }

  if (hasHighSeverityTransition(input.cognitiveTransitions)) {
    sources.push("high_severity_transition");
  }

  if (countStrongCorrelations(input.cognitiveCorrelations) >= 2) {
    sources.push("strong_cognitive_correlations");
  }

  return unique(sources);
}

function sourceScore(source) {
  return {
    high_risk_environment: 0.3,
    unstable_environment: 0.22,
    caution_environment: 0.12,
    critical_runtime: 0.28,
    runtime_instability: 0.16,
    severe_anomaly: 0.26,
    moderate_anomaly: 0.14,
    confidence_pressure: 0.1,
    behavioral_instability: 0.18,
    consensus_conflict: 0.2,
    cognitive_drift: 0.14,
    high_severity_transition: 0.16,
    strong_cognitive_correlations: 0.18
  }[source] || 0;
}

function classifyPressureLevel(scoreOrInput = 0) {
  const score = typeof scoreOrInput === "number"
    ? scoreOrInput
    : scoreOrInput.pressureScore;
  const sources = Array.isArray(scoreOrInput.sources)
    ? scoreOrInput.sources
    : [];
  const extremeSourceCount = [
    "high_risk_environment",
    "critical_runtime",
    "severe_anomaly",
    "consensus_conflict",
    "strong_cognitive_correlations"
  ].filter((source) => sources.includes(source)).length;

  if (
    sources.includes("high_risk_environment") ||
    sources.includes("critical_runtime") ||
    extremeSourceCount >= 3
  ) {
    return "EXTREME";
  }

  if (
    sources.includes("unstable_environment") ||
    sources.includes("severe_anomaly") ||
    sources.includes("behavioral_instability") ||
    sources.includes("cognitive_drift")
  ) {
    return "HIGH";
  }

  if (
    sources.includes("caution_environment") ||
    sources.includes("moderate_anomaly") ||
    sources.includes("runtime_instability") ||
    sources.includes("high_severity_transition") ||
    sources.includes("strong_cognitive_correlations")
  ) {
    return "MODERATE";
  }

  if (score >= 0.85) return "EXTREME";
  if (score >= 0.6) return "HIGH";
  if (score >= 0.3) return "MODERATE";
  if (score > 0) return "LOW";
  return "NONE";
}

function buildWarnings(level, sources = []) {
  const warnings = [];

  if (level === "EXTREME") {
    warnings.push("Environmental pressure is extreme across multiple systems.");
  } else if (level === "HIGH") {
    warnings.push("Environmental pressure is elevated.");
  }

  if (sources.includes("critical_runtime")) {
    warnings.push("Runtime health is critical.");
  }

  if (sources.includes("severe_anomaly")) {
    warnings.push("Severe anomaly pressure is present.");
  }

  if (sources.includes("consensus_conflict")) {
    warnings.push("Intelligence consensus is conflicted.");
  }

  return unique(warnings);
}

function buildObservations(level, sources = []) {
  if (level === "NONE") {
    return ["No meaningful environmental pressure sources are detected."];
  }

  return [
    `${sources.length} environmental pressure sources are active.`,
    `Pressure level is ${level}.`
  ];
}

function buildPressureSummary(input = {}) {
  if (input.pressureLevel === "NONE") {
    return "Environmental pressure is not meaningful from available context.";
  }

  if (input.pressureLevel === "EXTREME") {
    return "Environmental pressure is extreme across the current intelligence context.";
  }

  return `${input.pressureLevel} environmental pressure is present across current review context.`;
}

function evaluateEnvironmentalPressure(input = {}) {
  const sources = detectPressureSources(input);
  const baseScore = sources.reduce((score, source) => {
    return score + sourceScore(source);
  }, 0);
  const strongCorrelationBonus = Math.min(
    0.12,
    countStrongCorrelations(input.cognitiveCorrelations) * 0.04
  );
  const pressureScore = clamp(baseScore + strongCorrelationBonus);
  const pressureLevel = classifyPressureLevel({
    pressureScore,
    sources
  });
  const warnings = buildWarnings(pressureLevel, sources);
  const observations = buildObservations(pressureLevel, sources);

  return {
    pressureLevel,
    pressureScore,
    sources,
    warnings,
    observations,
    summary: buildPressureSummary({
      pressureLevel
    })
  };
}

module.exports = {
  buildPressureSummary,
  classifyPressureLevel,
  detectPressureSources,
  evaluateEnvironmentalPressure
};
