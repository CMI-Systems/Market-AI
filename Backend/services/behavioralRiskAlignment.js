/*
 * Deterministic behavioral risk alignment for Market AI safety posture.
 * It adjusts confidence posture and alert surfacing without changing decisions.
 */

const CONFIDENCE_ORDER = ["AVOID", "LOW", "MODERATE", "HIGH"];

function safeConfidenceLevel(level) {
  return CONFIDENCE_ORDER.includes(level) ? level : "LOW";
}

function downgradeConfidence(level) {
  const currentIndex = CONFIDENCE_ORDER.indexOf(safeConfidenceLevel(level));

  return CONFIDENCE_ORDER[Math.max(currentIndex - 1, 0)];
}

function classifyRiskAlignment(input = {}) {
  const behavioralIntelligence = input.behavioralIntelligence || {};

  if (input.failsafeBrain?.status === "ACTIVE") {
    return "SUPPRESS";
  }

  if (
    behavioralIntelligence.behavioralState === "UNSTABLE" ||
    behavioralIntelligence.riskLevel === "HIGH"
  ) {
    return "SUPPRESS";
  }

  if (behavioralIntelligence.behavioralState === "OVERACTIVE") {
    return "DOWNGRADE";
  }

  return "NONE";
}

function buildWarnings(input = {}, riskAdjustment) {
  const warnings = [];
  const behavioralIntelligence = input.behavioralIntelligence || {};

  if (input.failsafeBrain?.status === "ACTIVE") {
    warnings.push("Failsafe posture suppresses behavioral alignment surfacing.");
  }

  if (behavioralIntelligence.riskLevel === "HIGH") {
    warnings.push("Behavioral intelligence reports high risk.");
  }

  if (behavioralIntelligence.behavioralState === "UNSTABLE") {
    warnings.push("Behavioral state is unstable.");
  }

  if (behavioralIntelligence.behavioralState === "OVERACTIVE") {
    warnings.push("Behavioral activity is elevated.");
  }

  if (riskAdjustment === "SUPPRESS" && input.alertReadiness?.alertReady === true) {
    warnings.push("Alert readiness is suppressed by behavioral risk alignment.");
  }

  return [...new Set(warnings)];
}

function buildRiskAlignmentNote(input = {}) {
  const riskAdjustment = input.riskAdjustment || classifyRiskAlignment(input);
  const behavioralState = input.behavioralIntelligence?.behavioralState;

  if (input.failsafeBrain?.status === "ACTIVE") {
    return "Behavioral alignment is suppressed while failsafe posture is active.";
  }

  if (riskAdjustment === "SUPPRESS") {
    return "Behavioral alignment suppresses alert surfacing under high-risk conditions.";
  }

  if (riskAdjustment === "DOWNGRADE") {
    return "Behavioral alignment downgrades confidence posture under elevated activity.";
  }

  if (behavioralState === "DISCIPLINED") {
    return "Behavioral alignment remains steady under disciplined conditions.";
  }

  return "Behavioral alignment records no added adjustment for current conditions.";
}

function adjustedConfidenceLevel(input = {}, riskAdjustment) {
  const currentLevel = safeConfidenceLevel(input.confidenceProfile?.level);

  if (riskAdjustment === "SUPPRESS") {
    return "AVOID";
  }

  if (riskAdjustment === "DOWNGRADE") {
    return downgradeConfidence(currentLevel);
  }

  return currentLevel;
}

function evaluateBehavioralRiskAlignment(input = {}) {
  const riskAdjustment = classifyRiskAlignment(input);

  return {
    aligned: riskAdjustment === "NONE",
    riskAdjustment,
    adjustedConfidenceLevel: adjustedConfidenceLevel(input, riskAdjustment),
    warnings: buildWarnings(input, riskAdjustment),
    note: buildRiskAlignmentNote({
      ...input,
      riskAdjustment
    })
  };
}

module.exports = {
  buildRiskAlignmentNote,
  classifyRiskAlignment,
  evaluateBehavioralRiskAlignment
};
