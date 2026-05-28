/*
 * Failsafe and reserve brain placeholder.
 * It activates on degraded brain inputs and returns the safest action bias.
 */

const {
  isNormalizedMarketEvent
} = require("../../providers/shared/marketEvent");

function hasConfidenceCollapse(brainOutput) {
  return Boolean(
    brainOutput &&
    brainOutput.status !== "OBSERVING" &&
    (
      typeof brainOutput.confidence !== "number" ||
      !Number.isFinite(brainOutput.confidence) ||
      brainOutput.confidence <= 0
    )
  );
}

function hasSevereConflict(tacticalBrain, behavioralRiskBrain) {
  return Boolean(
    tacticalBrain &&
    behavioralRiskBrain &&
    ["BULLISH", "BEARISH"].includes(tacticalBrain.bias) &&
    behavioralRiskBrain.bias === "BLOCKED"
  );
}

function runFailsafeBrain(input = {}) {
  const triggeredBy = [];

  if (!isNormalizedMarketEvent(input.marketEvent)) {
    triggeredBy.push("INVALID_NORMALIZED_EVENT");
  }

  if (input.tacticalBrain?.status === "DEGRADED") {
    triggeredBy.push("TACTICAL_BRAIN_DEGRADED");
  }

  if (input.behavioralRiskBrain?.status === "DEGRADED") {
    triggeredBy.push("BEHAVIORAL_BRAIN_DEGRADED");
  }

  if (
    hasConfidenceCollapse(input.tacticalBrain) ||
    hasConfidenceCollapse(input.behavioralRiskBrain)
  ) {
    triggeredBy.push("CONFIDENCE_COLLAPSE");
  }

  if (hasSevereConflict(input.tacticalBrain, input.behavioralRiskBrain)) {
    triggeredBy.push("SEVERE_BRAIN_CONFLICT");
  }

  if (input.reason) {
    triggeredBy.push(input.reason);
  }

  if (triggeredBy.length) {
    return {
      status: "ACTIVE",
      bias: "NO_TRADE",
      confidence: 1,
      message: "Failsafe brain activated to protect decision quality.",
      triggeredBy: [...new Set(triggeredBy)],
      safeAction: "Pause trade action until normalized inputs and brain state are safe."
    };
  }

  return {
    status: "STANDBY",
    bias: "NO_TRADE",
    confidence: 0,
    message: "Failsafe brain is standing by.",
    triggeredBy: [],
    safeAction: "Continue observing without failsafe intervention."
  };
}

module.exports = {
  runFailsafeBrain
};
