/*
 * Deterministic Trading Journal draft builder.
 * It creates draft-ready reflection objects without persisting them.
 */

function safeSymbol(symbol) {
  return typeof symbol === "string" && symbol.trim()
    ? symbol.trim().toUpperCase()
    : "UNKNOWN";
}

function classifyJournalMood(input = {}) {
  const behavioralState = input.behavioralIntelligence?.behavioralState;
  const confidenceLevel = input.confidenceProfile?.level;
  const riskAdjustment = input.behavioralRiskAlignment?.riskAdjustment;

  if (behavioralState === "OVERACTIVE") {
    return "OVERACTIVE";
  }

  if (behavioralState === "UNSTABLE" || confidenceLevel === "AVOID") {
    return riskAdjustment === "SUPPRESS" ? "CAUTIOUS" : "UNCERTAIN";
  }

  if (confidenceLevel === "LOW") {
    return "UNCERTAIN";
  }

  if (behavioralState === "DISCIPLINED") {
    return input.reflectionPrompts?.theme === "CONFIDENCE"
      ? "CALM"
      : "FOCUSED";
  }

  if (behavioralState === "CAUTION") {
    return "CAUTIOUS";
  }

  return "UNKNOWN";
}

function buildJournalTags(input = {}) {
  const tags = new Set(["signal-review"]);
  const theme = input.reflectionPrompts?.theme;
  const behavioralState = input.behavioralIntelligence?.behavioralState;
  const signalType = input.signalIntelligence?.signalType;

  if (["DISCIPLINE", "RISK_CONTROL"].includes(theme)) {
    tags.add("discipline");
  }

  if (["PATIENCE", "OVERACTIVITY"].includes(theme)) {
    tags.add("patience");
  }

  if (theme === "RISK_CONTROL" || input.behavioralRiskAlignment?.riskAdjustment === "SUPPRESS") {
    tags.add("risk-control");
  }

  if (theme === "UNCERTAINTY" || ["LOW", "AVOID"].includes(input.confidenceProfile?.level)) {
    tags.add("uncertainty");
  }

  if (theme === "CONFIDENCE" || input.confidenceProfile?.level === "HIGH") {
    tags.add("confidence");
  }

  if (behavioralState === "OVERACTIVE" || theme === "OVERACTIVITY") {
    tags.add("overactivity");
  }

  if (
    input.insightSummary?.statistics?.dominantRegime &&
    input.insightSummary.statistics.dominantRegime !== "NONE"
  ) {
    tags.add("regime-review");
  }

  if (signalType === "LOW_CONFIDENCE_CHOP") {
    tags.add("patience");
    tags.add("uncertainty");
  }

  return Array.from(tags);
}

function buildSummary(input = {}, mood) {
  const symbol = safeSymbol(input.symbol);
  const reflectionSummary = input.reflectionPrompts?.summary;

  if (typeof reflectionSummary === "string" && reflectionSummary.trim()) {
    return `${symbol} reflection draft: ${reflectionSummary}`;
  }

  return `${symbol} reflection draft prepared for ${mood.toLowerCase()} process review.`;
}

function buildJournalDraft(input = {}) {
  const mood = classifyJournalMood(input);

  return {
    draftType: "REFLECTION",
    symbol: safeSymbol(input.symbol),
    mood,
    tags: buildJournalTags(input),
    prompts: Array.isArray(input.reflectionPrompts?.prompts)
      ? [...input.reflectionPrompts.prompts]
      : [],
    summary: buildSummary(input, mood),
    createdAt: new Date().toISOString()
  };
}

module.exports = {
  buildJournalDraft,
  buildJournalTags,
  classifyJournalMood
};
