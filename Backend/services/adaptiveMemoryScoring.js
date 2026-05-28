/*
 * Deterministic significance scoring for future memory prioritization.
 * This layer scores review value only and does not change live decisions.
 */

const {
  assertNormalizedMarketEvent
} = require("../providers/shared/marketEvent");

function clamp(score) {
  return Number(Math.max(0, Math.min(1, score)).toFixed(2));
}

function isMeaningfulRegime(regimeType) {
  return [
    "TRENDING_BULLISH",
    "TRENDING_BEARISH",
    "BREAKOUT_ATTEMPT",
    "HIGH_VOLATILITY",
    "REVERSAL_RISK",
    "TRANSITIONAL"
  ].includes(regimeType);
}

function isReviewWorthySafetyContext(input = {}) {
  return input.signalIntelligence?.signalType === "REVERSAL_WARNING" ||
    ["HIGH_VOLATILITY", "REVERSAL_RISK", "TRANSITIONAL"].includes(
      input.regime?.type
    ) ||
    input.behavioralIntelligence?.riskLevel === "HIGH";
}

function classifyMemoryImportance(score) {
  if (score >= 0.75) return "HIGH";
  if (score >= 0.45) return "MEDIUM";
  if (score >= 0.15) return "LOW";
  return "IGNORE";
}

function buildMemoryScoreReason(input = {}) {
  if (input.signalIntelligence?.signalType === "REVERSAL_WARNING") {
    return "Reversal context is useful for future review.";
  }

  if (input.regime?.type === "HIGH_VOLATILITY") {
    return "High-volatility context is useful for future comparison.";
  }

  if (
    input.confidenceProfile?.level === "HIGH" &&
    input.signalIntelligence?.quality === "HIGH" &&
    isMeaningfulRegime(input.regime?.type)
  ) {
    return "Strong confidence, signal quality, and regime context align.";
  }

  if (input.behavioralIntelligence?.riskLevel === "HIGH") {
    return "Behavioral risk context is review-worthy.";
  }

  return "Normalized context is available for memory review.";
}

function invalidScore() {
  return {
    score: 0,
    importance: "IGNORE",
    reasons: [],
    warnings: ["Normalized market context is invalid or missing."]
  };
}

function scoreMemorySignificance(input = {}) {
  try {
    assertNormalizedMarketEvent(input.marketEvent);
  } catch {
    return invalidScore();
  }

  const confidenceLevel = input.confidenceProfile?.level || "UNKNOWN";
  const signalQuality = input.signalIntelligence?.quality || "UNKNOWN";
  const signalType = input.signalIntelligence?.signalType || "UNKNOWN";
  const regimeType = input.regime?.type || "UNKNOWN";
  const alertReadiness = input.alertReadiness || {};
  const behavioralIntelligence = input.behavioralIntelligence || {};
  const failsafeBrain = input.failsafeBrain || {};
  const reasons = [buildMemoryScoreReason(input)];
  const warnings = [];
  let score = 0.18;

  if (confidenceLevel === "HIGH") {
    score += 0.28;
    reasons.push("Confidence profile is strong.");
  } else if (confidenceLevel === "MODERATE") {
    score += 0.18;
    reasons.push("Confidence profile is usable for context review.");
  } else if (confidenceLevel === "LOW") {
    score += 0.04;
    warnings.push("Confidence profile is low.");
  } else {
    score -= 0.12;
    warnings.push("Confidence profile has limited value.");
  }

  if (signalQuality === "HIGH") {
    score += 0.22;
    reasons.push("Signal quality is strong.");
  } else if (signalQuality === "MODERATE") {
    score += 0.14;
    reasons.push("Signal quality adds review context.");
  } else if (signalQuality === "LOW") {
    score += 0.03;
    warnings.push("Signal quality is weak.");
  } else {
    score -= 0.12;
    warnings.push("No quality signal is available.");
  }

  if (["MOMENTUM_CONTINUATION", "VOLATILITY_EXPANSION"].includes(signalType)) {
    score += 0.12;
    reasons.push("Signal type captures active market structure.");
  }

  if (signalType === "REVERSAL_WARNING") {
    score += 0.18;
    reasons.push("Reversal warning deserves later review.");
  }

  if (isMeaningfulRegime(regimeType)) {
    score += 0.14;
    reasons.push(`Regime ${regimeType} adds context value.`);
  } else if (regimeType === "CHOPPY") {
    score -= 0.12;
    warnings.push("Choppy regime may be low-value noise.");
  } else if (regimeType === "UNKNOWN") {
    score -= 0.06;
    warnings.push("Regime context is unknown.");
  }

  if (alertReadiness.alertReady === true) {
    score += alertReadiness.priority === "HIGH" ? 0.1 : 0.06;
    reasons.push("Alert readiness marks the context as notable.");
  }

  if (behavioralIntelligence.riskLevel === "HIGH") {
    score += 0.12;
    reasons.push("High behavioral risk is review-worthy.");
    warnings.push("Behavioral risk is elevated.");
  } else if (
    ["UNSTABLE", "OVERACTIVE"].includes(behavioralIntelligence.behavioralState)
  ) {
    score += 0.07;
    reasons.push("Behavioral conditions add review context.");
  }

  if (
    signalType === "LOW_CONFIDENCE_CHOP" &&
    ["LOW", "AVOID"].includes(confidenceLevel)
  ) {
    score -= 0.2;
    warnings.push("Low-confidence chop is likely lower-value memory noise.");
  }

  if (failsafeBrain.status === "ACTIVE") {
    score -= 0.18;
    warnings.push("Failsafe brain is active.");

    if (isReviewWorthySafetyContext(input)) {
      score += 0.14;
      reasons.push("Safety context remains useful for later review.");
    }
  }

  const boundedScore = clamp(score);

  return {
    score: boundedScore,
    importance: classifyMemoryImportance(boundedScore),
    reasons,
    warnings
  };
}

function scoreMemoryBatch(inputs = []) {
  return Array.isArray(inputs)
    ? inputs.map(scoreMemorySignificance)
    : [];
}

module.exports = {
  buildMemoryScoreReason,
  classifyMemoryImportance,
  scoreMemoryBatch,
  scoreMemorySignificance
};
