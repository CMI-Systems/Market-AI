/*
 * Adaptive threshold engine for Market AI.
 * Produces advisory threshold metadata without mutating cognition.
 */

const AWAITING_ADAPTIVE_THRESHOLDS = "Awaiting adaptive threshold cognition.";

function countRecent(history, predicate) {
  return history.slice(-16).filter(predicate).length;
}

function evaluateAdaptiveThresholds(input = {}) {
  const history = Array.isArray(input.history) ? input.history : [];
  const guardrails = input.learningGuardrails || {};

  if (history.length < 4 || guardrails.guardrailState === "INSUFFICIENT_DATA") {
    return {
      thresholdState: "INSUFFICIENT_DATA",
      adjustedThresholds: {},
      adjustmentReasons: [],
      warnings: [],
      summary: AWAITING_ADAPTIVE_THRESHOLDS
    };
  }

  const unstable = countRecent(history, (item) => {
    return ["UNSTABLE", "FRAGMENTED", "HIGH_RISK"].includes(item.environment) ||
      ["SUPPRESSED", "UNSTABLE"].includes(item.signalState) ||
      ["HIGH", "SEVERE"].includes(item.suppressionLevel);
  });
  const stable = countRecent(history, (item) => {
    return ["OPTIMAL", "FAVORABLE", "STABLE", "RECOVERING"].includes(item.environment) ||
      ["ALIGNED", "REINFORCED"].includes(item.signalState);
  });
  const adjustmentReasons = [];
  let thresholdState = "STABLE";

  if (guardrails.guardrailState === "BLOCKED" || unstable >= 5) {
    thresholdState = "TIGHTENING";
    adjustmentReasons.push("Unstable cognition history supports tighter advisory thresholds.");
  } else if (stable >= 7 && unstable <= 1) {
    thresholdState = "LOOSENING";
    adjustmentReasons.push("Stable cognition history supports looser advisory thresholds.");
  } else if (stable > 0 || unstable > 0) {
    thresholdState = "CALIBRATING";
    adjustmentReasons.push("Mixed cognition history supports calibration only.");
  }

  return {
    thresholdState,
    adjustedThresholds: {
      confidenceFloor: thresholdState === "TIGHTENING" ? "RAISED" : thresholdState === "LOOSENING" ? "RELAXED" : "UNCHANGED",
      suppressionSensitivity: thresholdState === "TIGHTENING" ? "HIGHER" : thresholdState === "LOOSENING" ? "LOWER" : "UNCHANGED",
      consensusRequirement: thresholdState === "TIGHTENING" ? "STRICTER" : "UNCHANGED"
    },
    adjustmentReasons,
    warnings: guardrails.guardrailState === "CAUTION" ? ["Guardrails require conservative threshold metadata."] : [],
    summary: `${thresholdState} advisory threshold metadata from recent cognition history.`
  };
}

module.exports = {
  AWAITING_ADAPTIVE_THRESHOLDS,
  evaluateAdaptiveThresholds
};
