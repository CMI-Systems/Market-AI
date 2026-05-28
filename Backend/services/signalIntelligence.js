/*
 * Deterministic observational signal intelligence.
 * It names market conditions without emitting execution or recommendation language.
 */

function avoidSignal(reason) {
  return {
    signalType: "NO_QUALITY_SIGNAL",
    reasons: [],
    warnings: [reason]
  };
}

function classifySignalType(input = {}) {
  const {
    marketState = {},
    regime = {},
    confidenceProfile = {},
    failsafeBrain = {}
  } = input;

  if (failsafeBrain.status === "ACTIVE") {
    return avoidSignal("Failsafe brain is active.");
  }

  if (confidenceProfile.level === "AVOID") {
    return avoidSignal("Confidence profile is in avoid mode.");
  }

  if (["CHOPPY", "TRANSITIONAL"].includes(regime.type)) {
    return {
      signalType: "LOW_CONFIDENCE_CHOP",
      reasons: ["Regime is choppy or transitional."],
      warnings: ["Directional quality is limited."]
    };
  }

  if (marketState.momentum === "REVERSING" || regime.type === "REVERSAL_RISK") {
    return {
      signalType: "REVERSAL_WARNING",
      reasons: ["Momentum or regime state indicates reversal risk."],
      warnings: ["Context may be changing."]
    };
  }

  if (
    marketState.compression === "COMPRESSED" &&
    ["MODERATE", "HIGH"].includes(confidenceProfile.level)
  ) {
    return {
      signalType: "COMPRESSION_BREAKOUT_SETUP",
      reasons: ["Compression is present with usable confidence."],
      warnings: ["Expansion is not confirmed by this observation alone."]
    };
  }

  if (
    marketState.volatility === "EXPANDING" &&
    marketState.compression === "EXPANDING"
  ) {
    return {
      signalType: "VOLATILITY_EXPANSION",
      reasons: ["Volatility and range expansion are both present."],
      warnings: []
    };
  }

  if (
    marketState.momentum === "ACCELERATING" &&
    ["BULLISH", "BEARISH"].includes(marketState.directionalBias) &&
    ["MODERATE", "HIGH"].includes(confidenceProfile.level)
  ) {
    return {
      signalType: "MOMENTUM_CONTINUATION",
      reasons: ["Momentum is accelerating with directional context."],
      warnings: []
    };
  }

  return {
    signalType: "NO_QUALITY_SIGNAL",
    reasons: ["Current context does not meet a stronger observational signal rule."],
    warnings: []
  };
}

function scoreSignalQuality(input = {}) {
  const { signalType } = input;
  const confidenceLevel = input.confidenceProfile?.level;

  if (signalType === "NO_QUALITY_SIGNAL" || confidenceLevel === "AVOID") {
    return "AVOID";
  }

  if (signalType === "LOW_CONFIDENCE_CHOP") {
    return "LOW";
  }

  if (confidenceLevel === "HIGH") {
    return "HIGH";
  }

  if (confidenceLevel === "MODERATE") {
    return "MODERATE";
  }

  return "LOW";
}

function buildSignalNarrative({ signalType, marketState = {}, regime = {} } = {}) {
  switch (signalType) {
    case "MOMENTUM_CONTINUATION":
      return `Observed ${marketState.directionalBias?.toLowerCase() || "directional"} momentum continuation context.`;
    case "VOLATILITY_EXPANSION":
      return "Observed volatility expansion context with widening ranges.";
    case "COMPRESSION_BREAKOUT_SETUP":
      return "Observed compressed market structure that may be preparing for expansion.";
    case "REVERSAL_WARNING":
      return `Observed reversal-risk context under ${regime.type || "changing"} regime conditions.`;
    case "LOW_CONFIDENCE_CHOP":
      return "Observed low-confidence chop or transition context.";
    default:
      return "No quality observational signal is available from the current context.";
  }
}

function evaluateSignalIntelligence(input = {}) {
  const classification = classifySignalType(input);
  const quality = scoreSignalQuality({
    signalType: classification.signalType,
    confidenceProfile: input.confidenceProfile
  });

  return {
    signalType: classification.signalType,
    quality,
    confidence: quality === "AVOID" ? 0 : input.confidenceProfile?.score || 0,
    narrative: buildSignalNarrative({
      signalType: classification.signalType,
      marketState: input.marketState,
      regime: input.regime
    }),
    reasons: classification.reasons,
    warnings: classification.warnings
  };
}

module.exports = {
  buildSignalNarrative,
  classifySignalType,
  evaluateSignalIntelligence,
  scoreSignalQuality
};
