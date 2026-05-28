/*
 * Safe learning guardrails for Market AI.
 * This layer only permits advisory calibration metadata.
 */

const AWAITING_LEARNING_GUARDRAILS = "Awaiting learning guardrail cognition.";

function evaluateLearningGuardrails(input = {}) {
  const history = Array.isArray(input.history) ? input.history : [];
  const failsafeStatus = input.failsafeBrain?.status;
  const confidenceLevel = input.confidenceProfile?.level;
  const blockedReasons = [];
  const warnings = [];

  if (history.length < 3) {
    return {
      learningAllowed: false,
      guardrailState: "INSUFFICIENT_DATA",
      blockedReasons: [],
      warnings: [],
      summary: AWAITING_LEARNING_GUARDRAILS
    };
  }

  if (failsafeStatus === "ACTIVE") {
    blockedReasons.push("Failsafe priority blocks learning adjustment.");
  }

  if (confidenceLevel === "AVOID") {
    blockedReasons.push("Confidence profile requires conservative learning.");
  }

  if (blockedReasons.length) {
    warnings.push("Learning metadata is blocked and must remain conservative.");
    return {
      learningAllowed: false,
      guardrailState: "BLOCKED",
      blockedReasons,
      warnings,
      summary: "Learning guardrails blocked advisory adaptation metadata."
    };
  }

  const caution = history.slice(-8).some((item) => {
    return ["SUPPRESSED", "UNSTABLE"].includes(item.signalState) ||
      ["HIGH", "SEVERE"].includes(item.suppressionLevel) ||
      ["VOLATILE", "FRAGMENTING"].includes(item.driftState);
  });

  return {
    learningAllowed: true,
    guardrailState: caution ? "CAUTION" : "CLEAR",
    blockedReasons: [],
    warnings: caution ? ["Learning metadata should remain conservative in unstable history."] : [],
    summary: caution
      ? "Learning guardrails allow advisory metadata with caution."
      : "Learning guardrails are clear for advisory metadata."
  };
}

module.exports = {
  AWAITING_LEARNING_GUARDRAILS,
  evaluateLearningGuardrails
};
