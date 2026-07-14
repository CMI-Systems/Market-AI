/*
 * Deterministic consensus review across Market AI intelligence layers.
 * It describes alignment and conflict without changing live decisions.
 */

function unique(items) {
  return [...new Set(items)];
}

function isUsableConfidence(confidenceProfile = {}) {
  return ["HIGH", "MODERATE"].includes(confidenceProfile.level);
}

function isUsableSignal(signalIntelligence = {}) {
  return ["HIGH", "MODERATE"].includes(signalIntelligence.quality) &&
    signalIntelligence.signalType !== "NO_QUALITY_SIGNAL";
}

function behavioralAligned(input = {}) {
  return input.behavioralRiskAlignment?.aligned === true &&
    !["UNSTABLE", "OVERACTIVE"].includes(
      input.behavioralIntelligence?.behavioralState
    ) &&
    input.behavioralIntelligence?.riskLevel !== "HIGH";
}

function anomalyAligned(anomalyIntelligence = {}) {
  return anomalyIntelligence.anomalyDetected !== true ||
    ["NONE", "LOW"].includes(anomalyIntelligence.severity);
}

function runtimeAligned(runtimeHealth = {}) {
  return ["HEALTHY", "STABLE"].includes(runtimeHealth.status);
}

function GroupAligned(multiSymbolContext = {}) {
  return ["STRONG", "MODERATE"].includes(multiSymbolContext.alignment) &&
    !["MIXED", "UNKNOWN"].includes(multiSymbolContext.groupBias);
}

function collectSystemAlignment(input = {}) {
  const alignedSystems = [];
  const conflictingSystems = [];
  const warnings = [];
  const observations = [];

  if (isUsableConfidence(input.confidenceProfile)) {
    alignedSystems.push("confidenceProfile");
    observations.push("Confidence profile is usable for consensus review.");
  } else {
    conflictingSystems.push("confidenceProfile");
    warnings.push("Confidence context is limited.");
  }

  if (isUsableSignal(input.signalIntelligence)) {
    alignedSystems.push("signalIntelligence");
    observations.push("Signal intelligence contributes structured context.");
  } else {
    conflictingSystems.push("signalIntelligence");
    warnings.push("Signal intelligence is weak or unavailable.");
  }

  if (behavioralAligned(input)) {
    alignedSystems.push("behavioralIntelligence");
    observations.push("Behavioral conditions remain aligned.");
  } else if (input.behavioralRiskAlignment?.riskAdjustment === "SUPPRESS") {
    conflictingSystems.push("behavioralRiskAlignment");
    warnings.push("Behavioral suppression reduces consensus strength.");
  } else if (
    input.behavioralIntelligence?.behavioralState === "UNSTABLE" ||
    input.behavioralIntelligence?.riskLevel === "HIGH"
  ) {
    conflictingSystems.push("behavioralIntelligence");
    warnings.push("Behavioral conditions are unstable.");
  } else {
    observations.push("Behavioral context is not fully aligned yet.");
  }

  if (anomalyAligned(input.anomalyIntelligence)) {
    alignedSystems.push("anomalyIntelligence");
    observations.push("Anomaly activity is limited.");
  } else {
    conflictingSystems.push("anomalyIntelligence");
    warnings.push("Anomaly severity weakens consensus.");
  }

  if (runtimeAligned(input.runtimeHealth)) {
    alignedSystems.push("runtimeHealth");
    observations.push("Runtime health supports consensus review.");
  } else {
    conflictingSystems.push("runtimeHealth");
    warnings.push("Runtime health is degraded or unstable.");
  }

  if (input.multiSymbolContext?.alignment === "CONFLICTED") {
    conflictingSystems.push("multiSymbolContext");
    warnings.push("Multi-symbol context is conflicted.");
  } else if (GroupAligned(input.multiSymbolContext)) {
    alignedSystems.push("multiSymbolContext");
    observations.push("Multi-symbol context is aligned.");
  } else {
    observations.push("Multi-symbol context is limited or not provided.");
  }

  if (input.failsafeBrain?.status === "ACTIVE") {
    conflictingSystems.push("failsafeBrain");
    warnings.push("Failsafe activation creates consensus conflict.");
  } else if (input.failsafeBrain?.status === "STANDBY") {
    alignedSystems.push("failsafeBrain");
    observations.push("Failsafe brain is standing by.");
  } else {
    warnings.push("Failsafe status is not available.");
  }

  return {
    alignedSystems: unique(alignedSystems),
    conflictingSystems: unique(conflictingSystems),
    warnings: unique(warnings),
    observations: unique(observations)
  };
}

function detectConsensusConflict(input = {}) {
  if (input.failsafeBrain?.status === "ACTIVE") {
    return true;
  }

  if (input.multiSymbolContext?.alignment === "CONFLICTED") {
    return true;
  }

  if (
    input.behavioralIntelligence?.behavioralState === "UNSTABLE" ||
    input.behavioralRiskAlignment?.riskAdjustment === "SUPPRESS"
  ) {
    return true;
  }

  if (input.anomalyIntelligence?.severity === "HIGH") {
    return true;
  }

  if (["DEGRADED", "UNSTABLE", "CRITICAL"].includes(input.runtimeHealth?.status)) {
    return true;
  }

  if (
    ["BULLISH", "BEARISH"].includes(input.multiSymbolContext?.groupBias) &&
    input.signalIntelligence?.signalType === "LOW_CONFIDENCE_CHOP"
  ) {
    return true;
  }

  return false;
}

function classifyConsensusStrength(input = {}) {
  const alignedSystems = Array.isArray(input.alignedSystems)
    ? input.alignedSystems
    : [];
  const conflictingSystems = Array.isArray(input.conflictingSystems)
    ? input.conflictingSystems
    : [];

  if (input.conflictDetected) {
    return "CONFLICTED";
  }

  if (!alignedSystems.length && !conflictingSystems.length) {
    return "UNKNOWN";
  }

  if (
    alignedSystems.length >= 6 &&
    conflictingSystems.length === 0 &&
    input.confidenceProfile?.level === "HIGH" &&
    input.runtimeHealth?.status === "HEALTHY" &&
    alignedSystems.includes("multiSymbolContext")
  ) {
    return "STRONG";
  }

  if (
    alignedSystems.length >= 4 &&
    conflictingSystems.length <= 1 &&
    isUsableConfidence(input.confidenceProfile)
  ) {
    return "MODERATE";
  }

  if (
    !isUsableConfidence(input.confidenceProfile) ||
    alignedSystems.length < 3
  ) {
    return "WEAK";
  }

  return conflictingSystems.length ? "WEAK" : "MODERATE";
}

function buildConsensusSummary(input = {}) {
  switch (input.consensusStrength) {
    case "STRONG":
      return "Intelligence consensus is strong across aligned system context.";
    case "MODERATE":
      return "Intelligence consensus is moderate with usable alignment and visible limits.";
    case "WEAK":
      return "Intelligence consensus is weak because context remains limited or uneven.";
    case "CONFLICTED":
      return "Intelligence consensus is conflicted under current system conditions.";
    default:
      return "Intelligence consensus is not yet clear from available context.";
  }
}

function evaluateIntelligenceConsensus(input = {}) {
  const alignment = collectSystemAlignment(input);
  const conflictDetected = detectConsensusConflict(input);
  const consensusStrength = classifyConsensusStrength({
    ...input,
    ...alignment,
    conflictDetected
  });

  return {
    consensusStrength,
    alignedSystems: alignment.alignedSystems,
    conflictingSystems: alignment.conflictingSystems,
    warnings: alignment.warnings,
    observations: alignment.observations,
    summary: buildConsensusSummary({ consensusStrength })
  };
}

module.exports = {
  buildConsensusSummary,
  classifyConsensusStrength,
  detectConsensusConflict,
  evaluateIntelligenceConsensus
};
