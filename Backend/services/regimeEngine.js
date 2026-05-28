/*
 * Deterministic regime classification over market state and recent memory.
 * It describes the environment only and does not make trade recommendations.
 */

function countCandles(recentMemory = []) {
  return recentMemory.filter(event => event?.eventType === "candle").length;
}

function classifyRegime({ marketState = {}, recentMemory = [] } = {}) {
  const candleCount = countCandles(recentMemory);

  if (candleCount < 4) {
    return {
      type: "UNKNOWN",
      reasons: ["Insufficient candle memory for regime classification."]
    };
  }

  if (marketState.momentum === "REVERSING") {
    return {
      type: "REVERSAL_RISK",
      reasons: ["Momentum state is reversing."]
    };
  }

  if (
    marketState.compression === "COMPRESSED" &&
    marketState.volatility !== "LOW"
  ) {
    return {
      type: "BREAKOUT_ATTEMPT",
      reasons: ["Compression is present before a possible expansion attempt."]
    };
  }

  if (marketState.volatility === "EXPANDING" || marketState.volatility === "ELEVATED") {
    return {
      type: "HIGH_VOLATILITY",
      reasons: [`Volatility state is ${marketState.volatility.toLowerCase()}.`]
    };
  }

  if (marketState.volatility === "LOW") {
    return {
      type: "LOW_VOLATILITY",
      reasons: ["Volatility state is low."]
    };
  }

  if (
    marketState.directionalBias === "BULLISH" &&
    ["ACCELERATING", "STABLE"].includes(marketState.momentum)
  ) {
    return {
      type: "TRENDING_BULLISH",
      reasons: ["Directional bias is bullish with supportive momentum."]
    };
  }

  if (
    marketState.directionalBias === "BEARISH" &&
    ["ACCELERATING", "STABLE"].includes(marketState.momentum)
  ) {
    return {
      type: "TRENDING_BEARISH",
      reasons: ["Directional bias is bearish with supportive momentum."]
    };
  }

  if (
    marketState.directionalBias === "NEUTRAL" &&
    marketState.volatility === "NORMAL"
  ) {
    return {
      type: marketState.momentum === "WEAKENING" ? "RANGING" : "CHOPPY",
      reasons: ["Direction is neutral while volatility remains normal."]
    };
  }

  return {
    type: "TRANSITIONAL",
    reasons: ["Market state signals do not align into a stronger regime yet."]
  };
}

function scoreRegimeConfidence({ type, marketState = {}, recentMemory = [] } = {}) {
  const candleCount = countCandles(recentMemory);

  if (type === "UNKNOWN") {
    return candleCount ? 0.2 : 0.1;
  }

  let confidence = candleCount >= 6 ? 0.7 : 0.55;

  if (type.startsWith("TRENDING") && marketState.volatility === "NORMAL") {
    confidence += 0.1;
  }

  if (type === "REVERSAL_RISK" || type === "HIGH_VOLATILITY") {
    confidence += 0.05;
  }

  if (
    marketState.momentum === "UNKNOWN" ||
    marketState.volatility === "UNKNOWN" ||
    marketState.directionalBias === "UNKNOWN" ||
    marketState.compression === "UNKNOWN"
  ) {
    confidence -= 0.2;
  }

  return Number(Math.max(0, Math.min(1, confidence)).toFixed(2));
}

function evaluateRegime({ marketState = {}, recentMemory = [] } = {}) {
  const classification = classifyRegime({
    marketState,
    recentMemory
  });

  return {
    type: classification.type,
    confidence: scoreRegimeConfidence({
      type: classification.type,
      marketState,
      recentMemory
    }),
    reasons: classification.reasons
  };
}

module.exports = {
  classifyRegime,
  evaluateRegime,
  scoreRegimeConfidence
};
