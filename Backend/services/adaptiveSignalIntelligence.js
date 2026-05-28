/*
 * Adaptive signal intelligence for Market AI.
 * Validates backend cognition quality without generating recommendations.
 */

const AWAITING_ADAPTIVE_SIGNAL = "Awaiting adaptive signal cognition.";

function severityRank(value) {
  return {
    NONE: 0,
    LOW: 1,
    MODERATE: 2,
    MEDIUM: 2,
    HIGH: 3,
    SEVERE: 4,
    CRITICAL: 4
  }[value] || 0;
}

function clamp(value) {
  return Number(Math.max(0, Math.min(1, value)).toFixed(2));
}

function suppressionLevel(score) {
  if (score >= 0.85) return "SEVERE";
  if (score >= 0.62) return "HIGH";
  if (score >= 0.38) return "MODERATE";
  if (score > 0) return "LOW";
  return "NONE";
}

function reinforcementLevel(score) {
  if (score >= 0.72) return "HIGH";
  if (score >= 0.42) return "MODERATE";
  if (score > 0) return "LOW";
  return "NONE";
}

function trustFromSuppression(level) {
  return {
    NONE: "HIGH",
    LOW: "MODERATE",
    MODERATE: "LOW",
    HIGH: "LOW",
    SEVERE: "INVALID"
  }[level] || "UNKNOWN";
}

function coherenceFromInputs(input = {}) {
  if (input.crossBrainConsensus?.consensusState === "FULL_CONSENSUS" &&
    ["SYNCHRONIZED", "PARTIALLY_SYNCHRONIZED"].includes(input.crossSymbolEcosystem?.ecosystemState)) {
    return "SYNCHRONIZED";
  }

  if (["FRAGMENTED", "DIVERGENT"].includes(input.crossSymbolEcosystem?.ecosystemState) ||
    input.crossBrainConsensus?.consensusState === "FAILSAFE_PRIORITY") {
    return "CONFLICTED";
  }

  if (input.strategicEnvironmentMap?.globalEnvironmentState === "FRAGMENTED" ||
    input.cognitiveDrift?.driftState === "FRAGMENTING") {
    return "FRAGMENTED";
  }

  if (input.crossBrainConsensus?.consensusState === "PARTIAL_CONSENSUS") {
    return "PARTIAL";
  }

  return "UNKNOWN";
}

function signalState({ suppression, reinforcement, coherence, input }) {
  if (suppression === "SEVERE" || input.crossBrainConsensus?.consensusState === "FAILSAFE_PRIORITY") return "SUPPRESSED";
  if (suppression === "HIGH") return "UNSTABLE";
  if (coherence === "CONFLICTED") return "CONFLICTED";
  if (input.regimeTransition?.regimeState === "TRANSITIONAL" || input.marketStructure?.structureState === "TRANSITIONAL") return "TRANSITIONAL";
  if (["MODERATE", "HIGH"].includes(reinforcement) && coherence === "SYNCHRONIZED") return "REINFORCED";
  if (coherence === "SYNCHRONIZED" || coherence === "PARTIAL") return "ALIGNED";
  return "UNKNOWN";
}

function awaitingAdaptiveSignal() {
  return {
    signalState: "UNKNOWN",
    signalTrust: "UNKNOWN",
    suppressionLevel: "NONE",
    reinforcementLevel: "NONE",
    coherenceLevel: "UNKNOWN",
    confidenceWeight: 0,
    warnings: [],
    summary: AWAITING_ADAPTIVE_SIGNAL
  };
}

function evaluateAdaptiveSignalIntelligence(input = {}) {
  if (!input.crossBrainConsensus?.consensusState && !input.marketStructure?.structureState) {
    return awaitingAdaptiveSignal();
  }

  const warnings = [];
  let suppressionScore = 0;
  let reinforcementScore = 0;

  if (["FRAGMENTED", "DIVERGENT"].includes(input.crossSymbolEcosystem?.ecosystemState)) {
    suppressionScore += 0.22;
    warnings.push("Ecosystem divergence suppresses cognition quality.");
  }

  if (["FRAGMENTED", "UNSTABLE"].includes(input.regimeTransition?.regimeState)) {
    suppressionScore += 0.2;
    warnings.push("Regime instability suppresses cognition quality.");
  }

  if (["WEAKENING", "TRANSITIONAL"].includes(input.marketStructure?.structureState)) {
    suppressionScore += 0.16;
    warnings.push("Market structure alignment is not fully supportive.");
  }

  if (["HIGH", "SEVERE"].includes(input.liquidityPressure?.vulnerabilityLevel)) {
    suppressionScore += 0.2;
    warnings.push("Liquidity vulnerability suppresses cognition quality.");
  }

  if (severityRank(input.anomalyIntelligence?.severity) >= 3) {
    suppressionScore += 0.18;
    warnings.push("Anomaly severity suppresses cognition quality.");
  }

  if (["VOLATILE", "FRAGMENTING", "DEGRADING"].includes(input.cognitiveDrift?.driftState)) {
    suppressionScore += 0.18;
    warnings.push("Cognitive drift instability suppresses cognition quality.");
  }

  if (input.crossBrainConsensus?.consensusState === "FAILSAFE_PRIORITY") {
    suppressionScore += 0.38;
  } else if (input.crossBrainConsensus?.consensusState === "CONFLICTED") {
    suppressionScore += 0.24;
  }

  if (input.crossBrainConsensus?.consensusState === "FULL_CONSENSUS") reinforcementScore += 0.24;
  if (input.crossSymbolEcosystem?.ecosystemState === "SYNCHRONIZED") reinforcementScore += 0.2;
  if (["STRENGTHENING", "TRENDING"].includes(input.marketStructure?.structureState)) reinforcementScore += 0.18;
  if (["ACCUMULATING", "SYNCHRONIZED"].includes(input.institutionalFlow?.flowState)) reinforcementScore += 0.18;
  if (["BALANCED", "STABILIZING"].includes(input.liquidityPressure?.liquidityState)) reinforcementScore += 0.16;

  const suppression = suppressionLevel(clamp(suppressionScore));
  const reinforcement = reinforcementLevel(clamp(reinforcementScore));
  const coherence = coherenceFromInputs(input);
  const state = signalState({
    suppression,
    reinforcement,
    coherence,
    input
  });
  const confidenceWeight = clamp(0.55 + reinforcementScore * 0.35 - suppressionScore * 0.55);

  return {
    signalState: state,
    signalTrust: state === "SUPPRESSED" ? "INVALID" : trustFromSuppression(suppression),
    suppressionLevel: suppression,
    reinforcementLevel: reinforcement,
    coherenceLevel: coherence,
    confidenceWeight,
    warnings,
    summary: `${state} adaptive signal cognition with ${suppression} suppression and ${reinforcement} reinforcement.`
  };
}

module.exports = {
  AWAITING_ADAPTIVE_SIGNAL,
  awaitingAdaptiveSignal,
  evaluateAdaptiveSignalIntelligence
};
