/*
 * Deterministic confidence scoring over market context and brain alignment.
 * It describes confidence quality only and does not create trade recommendations.
 */

function clamp(score) {
  return Number(Math.max(0, Math.min(1, score)).toFixed(2));
}

function scoreMarketStateConfidence(marketState = {}) {
  if (
    marketState.momentum === "UNKNOWN" ||
    marketState.volatility === "UNKNOWN" ||
    marketState.directionalBias === "UNKNOWN" ||
    marketState.compression === "UNKNOWN"
  ) {
    return 0.15;
  }

  if (
    ["ACCELERATING", "STABLE"].includes(marketState.momentum) &&
    ["BULLISH", "BEARISH"].includes(marketState.directionalBias)
  ) {
    return marketState.volatility === "NORMAL" ? 0.9 : 0.7;
  }

  if (marketState.momentum === "REVERSING") {
    return 0.35;
  }

  return 0.55;
}

function scoreRegimeConfidence(regime = {}) {
  if (!regime.type || regime.type === "UNKNOWN") {
    return 0.15;
  }

  if (["TRENDING_BULLISH", "TRENDING_BEARISH"].includes(regime.type)) {
    return clamp(Math.max(regime.confidence || 0, 0.85));
  }

  if (["CHOPPY", "TRANSITIONAL", "REVERSAL_RISK"].includes(regime.type)) {
    return clamp(Math.min(regime.confidence || 0.3, 0.3));
  }

  return clamp(regime.confidence || 0.6);
}

function scoreMemoryConfidence(recentMemory = []) {
  const eventCount = Array.isArray(recentMemory) ? recentMemory.length : 0;

  if (eventCount < 4) return 0.15;
  if (eventCount < 8) return 0.55;
  return 0.9;
}

function scoreBrainAlignment(tacticalBrain = {}, behavioralRiskBrain = {}) {
  if (
    tacticalBrain.status === "DEGRADED" ||
    behavioralRiskBrain.status === "DEGRADED"
  ) {
    return 0.1;
  }

  if (
    behavioralRiskBrain.bias === "BLOCKED" &&
    ["BULLISH", "BEARISH"].includes(tacticalBrain.bias)
  ) {
    return 0.2;
  }

  if (behavioralRiskBrain.riskLevel === "HIGH") {
    return 0.35;
  }

  return 0.75;
}

function classifyConfidence(score) {
  if (score <= 0) return "AVOID";
  if (score >= 0.8) return "HIGH";
  if (score >= 0.55) return "MODERATE";
  if (score >= 0.3) return "LOW";
  return "AVOID";
}

function calculateConfidence(input = {}) {
  const {
    marketState = {},
    regime = {},
    recentMemory = [],
    tacticalBrain = {},
    behavioralRiskBrain = {},
    failsafeBrain = {}
  } = input;
  const reasons = [];
  const penalties = [];
  const components = {
    marketState: scoreMarketStateConfidence(marketState),
    regime: scoreRegimeConfidence(regime),
    memory: scoreMemoryConfidence(recentMemory),
    brainAlignment: scoreBrainAlignment(tacticalBrain, behavioralRiskBrain)
  };

  if (failsafeBrain.status === "ACTIVE") {
    penalties.push("Failsafe brain is active.");

    return {
      score: 0,
      level: "AVOID",
      reasons,
      penalties,
      components
    };
  }

  if (components.marketState >= 0.8) {
    reasons.push("Market state is directional and supported by momentum.");
  } else if (components.marketState <= 0.2) {
    penalties.push("Market state remains unknown.");
  }

  if (["TRENDING_BULLISH", "TRENDING_BEARISH"].includes(regime.type)) {
    reasons.push("Regime is aligned with a stronger trend state.");
  }

  if (!regime.type || regime.type === "UNKNOWN") {
    penalties.push("Regime remains unknown.");
  }

  if (["CHOPPY", "TRANSITIONAL", "REVERSAL_RISK"].includes(regime.type)) {
    penalties.push(`Regime ${regime.type} reduces confidence.`);
  }

  if (components.memory < 0.5) {
    penalties.push("Recent memory depth is low.");
  } else {
    reasons.push("Recent memory depth supports contextual scoring.");
  }

  if (behavioralRiskBrain.riskLevel === "HIGH") {
    penalties.push("Behavioral risk level is high.");
  }

  if (components.brainAlignment <= 0.2) {
    penalties.push("Brain outputs are degraded or in conflict.");
  }

  const weightedScore =
    components.marketState * 0.3 +
    components.regime * 0.3 +
    components.memory * 0.2 +
    components.brainAlignment * 0.2;
  const penaltyAmount = penalties.length * 0.05;
  const score = clamp(weightedScore - penaltyAmount);

  return {
    score,
    level: classifyConfidence(score),
    reasons,
    penalties,
    components
  };
}

module.exports = {
  calculateConfidence,
  classifyConfidence,
  scoreBrainAlignment,
  scoreMarketStateConfidence,
  scoreMemoryConfidence,
  scoreRegimeConfidence
};
