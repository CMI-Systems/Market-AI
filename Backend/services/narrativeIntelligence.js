/*
 * Deterministic narrative interpretation for Market AI context.
 * It produces concise observational language without recommendation wording.
 */

function displaySymbol(symbol) {
  return typeof symbol === "string" && symbol.trim() ? symbol : "Market";
}

function buildTacticalSummary(input = {}) {
  const { signalIntelligence = {}, marketState = {}, regime = {} } = input;

  switch (signalIntelligence.signalType) {
    case "MOMENTUM_CONTINUATION":
      return `${displaySymbol(input.symbol)} shows momentum continuation context with ${marketState.directionalBias?.toLowerCase() || "directional"} structure under ${regime.type || "current"} conditions.`;
    case "VOLATILITY_EXPANSION":
      return `${displaySymbol(input.symbol)} is showing volatility expansion with widening range behavior.`;
    case "COMPRESSION_BREAKOUT_SETUP":
      return `${displaySymbol(input.symbol)} is in compressed structure with possible expansion conditions still developing.`;
    case "REVERSAL_WARNING":
      return `${displaySymbol(input.symbol)} shows reversal-risk context and should be interpreted with heightened caution.`;
    case "LOW_CONFIDENCE_CHOP":
      return `${displaySymbol(input.symbol)} is showing unstable or choppy conditions with limited directional clarity.`;
    default:
      return `${displaySymbol(input.symbol)} does not currently show a quality observational signal.`;
  }
}

function buildRiskSummary(input = {}) {
  const { behavioralRiskBrain = {}, failsafeBrain = {} } = input;

  if (failsafeBrain.status === "ACTIVE") {
    return "Failsafe protection is active, reflecting degraded input quality or reduced confidence.";
  }

  if (behavioralRiskBrain.riskLevel === "HIGH") {
    return "Behavioral risk is elevated and warrants added discipline in interpretation.";
  }

  if (behavioralRiskBrain.riskLevel === "UNKNOWN") {
    return "Behavioral context remains incomplete, so risk interpretation is still limited.";
  }

  return "Risk context is being monitored without an active failsafe condition.";
}

function buildConfidenceSummary(input = {}) {
  const { confidenceProfile = {} } = input;

  if (confidenceProfile.level === "HIGH") {
    return "Confidence is high and the observed structure is comparatively strong.";
  }

  if (confidenceProfile.level === "MODERATE") {
    return "Confidence is moderate and context is usable but still developing.";
  }

  if (confidenceProfile.level === "LOW") {
    return "Confidence is low and interpretation should remain restrained.";
  }

  return "Confidence is degraded and observation should remain cautious.";
}

function buildHeadline(input = {}) {
  const symbol = displaySymbol(input.symbol);
  const signalType = input.signalIntelligence?.signalType;

  switch (signalType) {
    case "MOMENTUM_CONTINUATION":
      return `${symbol}: Momentum continuation context`;
    case "VOLATILITY_EXPANSION":
      return `${symbol}: Volatility expansion context`;
    case "COMPRESSION_BREAKOUT_SETUP":
      return `${symbol}: Compression with expansion potential`;
    case "REVERSAL_WARNING":
      return `${symbol}: Reversal risk context`;
    case "LOW_CONFIDENCE_CHOP":
      return `${symbol}: Choppy low-confidence context`;
    default:
      return `${symbol}: Cautious market observation`;
  }
}

function buildSummary(input = {}) {
  if (input.failsafeBrain?.status === "ACTIVE") {
    return "Market interpretation is degraded because the failsafe layer is active and confidence is reduced.";
  }

  return `${buildTacticalSummary(input)} ${buildConfidenceSummary(input)}`;
}

function buildMarketNarrative(input = {}) {
  const warnings = [
    ...(Array.isArray(input.signalIntelligence?.warnings)
      ? input.signalIntelligence.warnings
      : [])
  ];

  if (input.failsafeBrain?.status === "ACTIVE") {
    warnings.push("Failsafe layer is active.");
  }

  if (input.confidenceProfile?.level === "AVOID") {
    warnings.push("Confidence profile is degraded.");
  }

  return {
    headline: buildHeadline(input),
    summary: buildSummary(input),
    tacticalSummary: buildTacticalSummary(input),
    riskSummary: buildRiskSummary(input),
    confidenceSummary: buildConfidenceSummary(input),
    warnings
  };
}

module.exports = {
  buildConfidenceSummary,
  buildMarketNarrative,
  buildRiskSummary,
  buildTacticalSummary
};
