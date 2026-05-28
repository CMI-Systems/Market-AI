/*
 * Deterministic behavioral intelligence for trader-condition review.
 * It interprets behavioral risk and timeline patterns without changing decisions.
 */

const LOW_CONFIDENCE_THRESHOLD = 0.55;
const OVERACTIVE_SIGNAL_COUNT = 8;

function safeTimeline(timeline) {
  return Array.isArray(timeline) ? timeline : [];
}

function countSignalType(timeline, signalType) {
  return safeTimeline(timeline).filter((item) => item.signalType === signalType).length;
}

function countLowConfidence(timeline) {
  return safeTimeline(timeline).filter((item) => {
    return typeof item.confidence === "number" &&
      Number.isFinite(item.confidence) &&
      item.confidence < LOW_CONFIDENCE_THRESHOLD;
  }).length;
}

function hasElevatedVolatility(input = {}) {
  const dominantSignalType = input.insightSummary?.statistics?.dominantSignalType;
  const volatilitySignals = countSignalType(input.timeline, "VOLATILITY_EXPANSION");

  return dominantSignalType === "VOLATILITY_EXPANSION" || volatilitySignals >= 2;
}

function detectBehavioralWarnings(input = {}) {
  const timeline = safeTimeline(input.timeline);
  const warnings = [];
  const lowConfidenceCount = countLowConfidence(timeline);
  const reversalWarnings = countSignalType(timeline, "REVERSAL_WARNING");

  if (!timeline.length) {
    warnings.push("Behavioral timeline context is not available yet.");
  }

  if (lowConfidenceCount >= Math.max(2, Math.ceil(timeline.length / 2))) {
    warnings.push("Recent observations include repeated low-confidence conditions.");
  }

  if (timeline.length >= OVERACTIVE_SIGNAL_COUNT) {
    warnings.push("Recent signal frequency is elevated.");
  }

  if (reversalWarnings >= 2 && hasElevatedVolatility(input)) {
    warnings.push("Reversal-heavy history overlaps elevated volatility conditions.");
  }

  if (input.behavioralRiskBrain?.riskLevel === "HIGH") {
    warnings.push("Behavioral risk brain reports elevated risk.");
  }

  if (input.signalIntelligence?.signalType === "LOW_CONFIDENCE_CHOP") {
    warnings.push("Current signal context reflects low-confidence chop.");
  }

  return [...new Set(warnings)];
}

function classifyBehavioralState(input = {}) {
  const timeline = safeTimeline(input.timeline);

  if (!timeline.length) {
    return "UNKNOWN";
  }

  const reversalWarnings = countSignalType(timeline, "REVERSAL_WARNING");
  const lowConfidenceCount = countLowConfidence(timeline);
  const directRiskHigh = input.behavioralRiskBrain?.riskLevel === "HIGH";
  const averageConfidence = input.insightSummary?.statistics?.averageConfidence;
  const currentConfidenceLow = ["LOW", "AVOID"].includes(
    input.confidenceProfile?.level
  );
  const lowWarnings = detectBehavioralWarnings(input).length <= 1;

  if (
    directRiskHigh ||
    (reversalWarnings >= 2 && hasElevatedVolatility(input))
  ) {
    return "UNSTABLE";
  }

  if (timeline.length >= OVERACTIVE_SIGNAL_COUNT) {
    return "OVERACTIVE";
  }

  if (
    currentConfidenceLow ||
    lowConfidenceCount >= Math.max(2, Math.ceil(timeline.length / 2))
  ) {
    return "CAUTION";
  }

  if (
    typeof averageConfidence === "number" &&
    averageConfidence >= 0.7 &&
    lowWarnings
  ) {
    return "DISCIPLINED";
  }

  return "CAUTION";
}

function getRiskLevel(behavioralState) {
  switch (behavioralState) {
    case "DISCIPLINED":
      return "LOW";
    case "UNSTABLE":
      return "HIGH";
    case "CAUTION":
    case "OVERACTIVE":
      return "MODERATE";
    default:
      return "MODERATE";
  }
}

function buildObservations(input = {}, behavioralState) {
  const timeline = safeTimeline(input.timeline);
  const observations = [];

  if (!timeline.length) {
    observations.push("No timeline observations are available for behavioral review.");
    return observations;
  }

  observations.push(`${timeline.length} timeline observations are available for review.`);

  if (input.insightSummary?.statistics?.suppressedSignals > 0) {
    observations.push("Cooldown suppression appears in recent signal history.");
  }

  if (input.insightSummary?.statistics?.dominantSignalType) {
    observations.push(
      `Dominant signal context is ${input.insightSummary.statistics.dominantSignalType}.`
    );
  }

  if (behavioralState === "DISCIPLINED") {
    observations.push("Confidence and warning conditions remain comparatively stable.");
  }

  if (behavioralState === "OVERACTIVE") {
    observations.push("Signal volume is elevated across the reviewed timeline.");
  }

  return observations;
}

function summarizeBehavioralCondition(input = {}) {
  const behavioralState = input.behavioralState || "UNKNOWN";

  switch (behavioralState) {
    case "DISCIPLINED":
      return "Behavioral conditions appear disciplined under stable confidence and low warning pressure.";
    case "CAUTION":
      return "Behavioral conditions warrant caution because recent context is less stable or lower confidence.";
    case "OVERACTIVE":
      return "Behavioral conditions show elevated activity across recent signal history.";
    case "UNSTABLE":
      return "Behavioral conditions appear unstable under elevated risk and shifting market context.";
    default:
      return "Behavioral conditions are not yet clear because timeline context is limited.";
  }
}

function evaluateBehavioralIntelligence(input = {}) {
  const behavioralState = classifyBehavioralState(input);

  return {
    behavioralState,
    riskLevel: getRiskLevel(behavioralState),
    warnings: detectBehavioralWarnings(input),
    observations: buildObservations(input, behavioralState),
    summary: summarizeBehavioralCondition({
      behavioralState
    })
  };
}

module.exports = {
  classifyBehavioralState,
  detectBehavioralWarnings,
  evaluateBehavioralIntelligence,
  summarizeBehavioralCondition
};
