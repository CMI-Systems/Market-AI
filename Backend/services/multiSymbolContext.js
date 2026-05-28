/*
 * Deterministic group context across multiple symbol observations.
 * This layer summarizes watchlist-like conditions without changing decisions.
 */

function safeContexts(symbolContexts) {
  return Array.isArray(symbolContexts)
    ? symbolContexts.filter((context) => {
      return context &&
        typeof context === "object" &&
        typeof context.symbol === "string" &&
        context.symbol.trim();
    })
    : [];
}

function confidenceScore(context = {}) {
  const score = context.confidenceProfile?.score;

  if (typeof score === "number" && Number.isFinite(score)) {
    return Math.max(0, Math.min(1, score));
  }

  switch (context.confidenceProfile?.level) {
    case "HIGH":
      return 0.85;
    case "MODERATE":
      return 0.65;
    case "LOW":
      return 0.35;
    default:
      return 0.1;
  }
}

function memoryImportanceScore(context = {}) {
  switch (context.adaptiveMemoryScore?.importance) {
    case "HIGH":
      return 0.25;
    case "MEDIUM":
      return 0.16;
    case "LOW":
      return 0.08;
    default:
      return 0;
  }
}

function directionalBias(context = {}) {
  const marketBias = context.marketState?.directionalBias;
  const regimeType = context.regime?.type;

  if (["BULLISH", "BEARISH", "NEUTRAL"].includes(marketBias)) {
    return marketBias;
  }

  if (regimeType === "TRENDING_BULLISH") {
    return "BULLISH";
  }

  if (regimeType === "TRENDING_BEARISH") {
    return "BEARISH";
  }

  return "UNKNOWN";
}

function scoreSymbolStrength(context = {}) {
  const bias = directionalBias(context);
  const directionalBoost = ["BULLISH", "BEARISH"].includes(bias) ? 0.18 : 0;
  const signalBoost = ["HIGH", "MODERATE"].includes(
    context.signalIntelligence?.quality
  )
    ? 0.12
    : 0;

  return Number(Math.min(
    1,
    confidenceScore(context) * 0.6 +
      memoryImportanceScore(context) +
      directionalBoost +
      signalBoost
  ).toFixed(2));
}

function buildStats(contexts) {
  return contexts.reduce((stats, context) => {
    const bias = directionalBias(context);
    const level = context.confidenceProfile?.level;

    stats.totalSymbols += 1;
    if (bias === "BULLISH") stats.bullishCount += 1;
    if (bias === "BEARISH") stats.bearishCount += 1;
    if (bias === "NEUTRAL") stats.neutralCount += 1;
    if (level === "HIGH") stats.highConfidenceCount += 1;
    if (level === "AVOID") stats.avoidCount += 1;

    return stats;
  }, {
    totalSymbols: 0,
    bullishCount: 0,
    bearishCount: 0,
    neutralCount: 0,
    highConfidenceCount: 0,
    avoidCount: 0
  });
}

function supportiveCount(contexts, bias) {
  return contexts.filter((context) => {
    return directionalBias(context) === bias &&
      ["HIGH", "MODERATE"].includes(context.confidenceProfile?.level);
  }).length;
}

function classifyGroupBias(input = {}) {
  const contexts = safeContexts(input.symbolContexts);

  if (contexts.length < 2) {
    return "UNKNOWN";
  }

  const bullishSupport = supportiveCount(contexts, "BULLISH");
  const bearishSupport = supportiveCount(contexts, "BEARISH");
  const threshold = Math.ceil(contexts.length / 2);

  if (bullishSupport >= threshold && bearishSupport === 0) {
    return "BULLISH";
  }

  if (bearishSupport >= threshold && bullishSupport === 0) {
    return "BEARISH";
  }

  if (bullishSupport > 0 && bearishSupport > 0) {
    return "MIXED";
  }

  if (contexts.every((context) => directionalBias(context) === "NEUTRAL")) {
    return "NEUTRAL";
  }

  return "UNKNOWN";
}

function detectSymbolAlignment(input = {}) {
  const contexts = safeContexts(input.symbolContexts);
  const groupBias = input.groupBias || classifyGroupBias({ symbolContexts: contexts });

  if (contexts.length < 2) {
    return "UNKNOWN";
  }

  if (groupBias === "MIXED") {
    return "CONFLICTED";
  }

  const knownBiases = contexts
    .map(directionalBias)
    .filter((bias) => bias !== "UNKNOWN");
  const matchingBiases = knownBiases.filter((bias) => bias === groupBias).length;

  if (!knownBiases.length || groupBias === "UNKNOWN") {
    return "WEAK";
  }

  if (matchingBiases === knownBiases.length && knownBiases.length >= 3) {
    return "STRONG";
  }

  if (matchingBiases >= Math.ceil(knownBiases.length / 2)) {
    return "MODERATE";
  }

  return "WEAK";
}

function rankSymbols(contexts, strongest) {
  return [...contexts]
    .map((context) => ({
      symbol: context.symbol.trim().toUpperCase(),
      score: scoreSymbolStrength(context)
    }))
    .sort((first, second) => {
      if (second.score === first.score) {
        return first.symbol.localeCompare(second.symbol);
      }

      return strongest
        ? second.score - first.score
        : first.score - second.score;
    })
    .slice(0, Math.min(3, contexts.length))
    .map((item) => item.symbol);
}

function buildGroupContextReason(input = {}) {
  if (input.groupBias === "BULLISH") {
    return "Group context shows aligned bullish observations with usable confidence.";
  }

  if (input.groupBias === "BEARISH") {
    return "Group context shows aligned bearish observations with usable confidence.";
  }

  if (input.groupBias === "MIXED") {
    return "Group context shows conflicting directional observations.";
  }

  if (input.groupBias === "NEUTRAL") {
    return "Group context is neutral across available symbol observations.";
  }

  return "Group context does not yet have enough directional evidence.";
}

function summarizeSymbolGroup(input = {}) {
  const contexts = safeContexts(input.symbolContexts);
  const groupBias = input.groupBias || classifyGroupBias({ symbolContexts: contexts });
  const alignment = input.alignment || detectSymbolAlignment({
    symbolContexts: contexts,
    groupBias
  });

  if (!contexts.length) {
    return "No symbol context is available for group review.";
  }

  return `${buildGroupContextReason({ groupBias })} Alignment is ${alignment}.`;
}

function evaluateMultiSymbolContext(input = {}) {
  const contexts = safeContexts(input.symbolContexts);
  const stats = buildStats(contexts);
  const warnings = [];
  const groupBias = classifyGroupBias({ symbolContexts: contexts });
  const alignment = detectSymbolAlignment({
    symbolContexts: contexts,
    groupBias
  });

  if (contexts.length < 2) {
    warnings.push("Additional symbol context is needed for group awareness.");
  }

  if (stats.avoidCount >= Math.ceil(Math.max(stats.totalSymbols, 1) / 2)) {
    warnings.push("Avoid-level confidence is elevated across the group.");
  }

  if (alignment === "CONFLICTED") {
    warnings.push("Directional conflict is present across symbols.");
  }

  return {
    groupBias,
    alignment,
    strongestSymbols: rankSymbols(contexts, true),
    weakestSymbols: rankSymbols(contexts, false),
    warnings,
    summary: summarizeSymbolGroup({
      symbolContexts: contexts,
      groupBias,
      alignment
    }),
    stats
  };
}

module.exports = {
  buildGroupContextReason,
  classifyGroupBias,
  detectSymbolAlignment,
  evaluateMultiSymbolContext,
  summarizeSymbolGroup
};
