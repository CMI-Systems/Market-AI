/*
 * Behavioral and risk brain placeholder.
 * It observes context only and does not block or recommend live trades yet.
 */

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function analyzeBehavioralRisk(input = {}) {
  const userContext = asObject(input.userContext);
  const journalContext = asObject(input.journalContext);
  const systemContext = asObject(input.systemContext);
  const reasons = [];

  if (!Object.keys(userContext).length) {
    reasons.push("User context is not available yet.");
  }

  if (!Object.keys(journalContext).length) {
    reasons.push("Journal context is not available yet.");
  }

  if (systemContext.mode === "shadow") {
    reasons.push("Shadow mode observes behavioral risk without live intervention.");
  }

  if (reasons.length) {
    return {
      status: "OBSERVING",
      bias: "ALIGNED",
      confidence: 0,
      riskLevel: "UNKNOWN",
      message: "Behavioral brain is observing context only.",
      reasons
    };
  }

  return {
    status: "OBSERVING",
    bias: "ALIGNED",
    confidence: 0,
    riskLevel: "LOW",
    message: "Behavioral context accepted for future risk analysis.",
    reasons: [
      "Placeholder behavioral analysis does not block trades yet."
    ]
  };
}

module.exports = {
  analyzeBehavioralRisk
};
