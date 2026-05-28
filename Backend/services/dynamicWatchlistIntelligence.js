/*
 * Dynamic watchlist intelligence for Market AI.
 * This layer ranks and groups symbol contexts for review focus only.
 */

function safeArray(value) {
  return Array.isArray(value)
    ? value.filter((item) => item && typeof item === "object")
    : [];
}

function safeSymbol(value) {
  return typeof value === "string" && value.trim()
    ? value.trim().toUpperCase()
    : "UNKNOWN";
}

function clamp(score) {
  return Number(Math.max(0, Math.min(1, score)).toFixed(2));
}

function confidenceScore(context = {}) {
  const score = context.confidenceProfile?.score;

  if (typeof score === "number" && Number.isFinite(score)) {
    return clamp(score);
  }

  switch (context.confidenceProfile?.level) {
    case "HIGH":
      return 0.85;
    case "MODERATE":
      return 0.65;
    case "LOW":
      return 0.35;
    case "AVOID":
      return 0.05;
    default:
      return 0.15;
  }
}

function pressureScore(environmentalPressure = {}) {
  const score = environmentalPressure.pressureScore;

  if (typeof score === "number" && Number.isFinite(score)) {
    return clamp(score);
  }

  switch (environmentalPressure.pressureLevel) {
    case "EXTREME":
      return 1;
    case "HIGH":
      return 0.8;
    case "MODERATE":
      return 0.55;
    case "LOW":
      return 0.25;
    default:
      return 0;
  }
}

function anomalyScore(context = {}) {
  if (context.anomalyIntelligence?.anomalyDetected === false) {
    return 0;
  }

  switch (context.anomalyIntelligence?.severity) {
    case "HIGH":
      return 0.32;
    case "MEDIUM":
      return 0.22;
    case "LOW":
      return 0.1;
    default:
      return 0;
  }
}

function environmentScore(context = {}) {
  const environment = context.strategicEnvironment?.environment;
  const stability = context.strategicEnvironment?.stability;

  if (environment === "HIGH_RISK" || stability === "FRAGMENTED") {
    return 0.28;
  }

  if (environment === "UNSTABLE" || stability === "LOW") {
    return 0.22;
  }

  if (environment === "CAUTION") {
    return 0.14;
  }

  if (environment === "OPTIMAL" || environment === "FAVORABLE") {
    return 0.06;
  }

  return 0.08;
}

function stabilityScore(context = {}) {
  switch (context.intelligenceStabilityForecast?.trajectory) {
    case "FRAGMENTING":
    case "DETERIORATING":
      return 0.24;
    case "RECOVERING":
      return 0.12;
    case "STABILIZING":
    case "STABLE":
      return 0.04;
    default:
      return 0.08;
  }
}

function memoryScore(context = {}) {
  switch (context.adaptiveMemoryScore?.importance) {
    case "HIGH":
      return 0.18;
    case "MEDIUM":
      return 0.1;
    case "LOW":
      return 0.04;
    default:
      return 0;
  }
}

function insightScore(symbol, prioritizedInsights = []) {
  const matchingInsights = safeArray(prioritizedInsights).filter((insight) => {
    return safeSymbol(insight.symbol || insight.metadata?.symbol) === symbol;
  });
  const topPriority = matchingInsights.reduce((top, insight) => {
    switch (insight.priority) {
      case "CRITICAL":
        return Math.max(top, 0.26);
      case "HIGH":
        return Math.max(top, 0.2);
      case "MEDIUM":
        return Math.max(top, 0.12);
      case "LOW":
        return Math.max(top, 0.05);
      default:
        return top;
    }
  }, 0);

  return topPriority;
}

function scoreWatchlistSymbol(context = {}, input = {}) {
  const symbol = safeSymbol(context.symbol);
  const pressure = pressureScore(input.environmentalPressure);
  const inverseConfidence = 1 - confidenceScore(context);
  const score = 0.04 +
    anomalyScore(context) +
    environmentScore(context) +
    stabilityScore(context) +
    memoryScore(context) +
    insightScore(symbol, input.prioritizedInsights) +
    pressure * 0.12 +
    inverseConfidence * 0.08;

  return clamp(score);
}

function buildSymbolReasons(context = {}, score = 0, input = {}) {
  const reasons = [];

  if (context.anomalyIntelligence?.severity === "HIGH") {
    reasons.push("High anomaly severity raises watchlist focus.");
  } else if (context.anomalyIntelligence?.severity === "MEDIUM") {
    reasons.push("Elevated anomaly behavior deserves review.");
  }

  if (["HIGH_RISK", "UNSTABLE"].includes(context.strategicEnvironment?.environment)) {
    reasons.push("Strategic environment is unstable or high risk.");
  }

  if (context.strategicEnvironment?.stability === "FRAGMENTED") {
    reasons.push("Strategic stability is fragmented.");
  }

  if (["DETERIORATING", "FRAGMENTING"].includes(
    context.intelligenceStabilityForecast?.trajectory
  )) {
    reasons.push("Intelligence stability trajectory is weakening.");
  }

  if (context.adaptiveMemoryScore?.importance === "HIGH") {
    reasons.push("Adaptive memory marks this symbol as important.");
  }

  if (pressureScore(input.environmentalPressure) >= 0.7) {
    reasons.push("Environmental pressure is elevated across the watchlist.");
  }

  if (score < 0.25) {
    reasons.push("Symbol currently remains low-focus background context.");
  }

  return reasons;
}

function classifySymbolFocus(score) {
  if (score >= 0.72) return "HIGH_FOCUS";
  if (score >= 0.46) return "MODERATE_FOCUS";
  if (score >= 0.24) return "LOW_FOCUS";
  return "BACKGROUND";
}

function prioritizeWatchlistSymbols(input = {}) {
  return safeArray(input.symbolContexts)
    .filter((context) => safeSymbol(context.symbol) !== "UNKNOWN")
    .map((context) => {
      const score = scoreWatchlistSymbol(context, input);

      return {
        symbol: safeSymbol(context.symbol),
        focus: classifySymbolFocus(score),
        priorityScore: score,
        confidenceLevel: context.confidenceProfile?.level || "UNKNOWN",
        environment: context.strategicEnvironment?.environment || "UNKNOWN",
        anomalySeverity: context.anomalyIntelligence?.severity || "NONE",
        stabilityTrajectory: context.intelligenceStabilityForecast?.trajectory || "UNKNOWN",
        reasons: buildSymbolReasons(context, score, input)
      };
    })
    .sort((first, second) => {
      if (second.priorityScore === first.priorityScore) {
        return first.symbol.localeCompare(second.symbol);
      }

      return second.priorityScore - first.priorityScore;
    });
}

function groupKey(context = {}) {
  const confidence = context.confidenceProfile?.level || "UNKNOWN";
  const environment = context.strategicEnvironment?.environment || "UNKNOWN";
  const anomaly = context.anomalyIntelligence?.severity || "NONE";
  const trajectory = context.intelligenceStabilityForecast?.trajectory || "UNKNOWN";

  return `${confidence}|${environment}|${anomaly}|${trajectory}`;
}

function groupWatchlistContexts(input = {}) {
  const groups = new Map();

  safeArray(input.symbolContexts).forEach((context) => {
    const key = groupKey(context);

    if (!groups.has(key)) {
      groups.set(key, {
        confidenceLevel: context.confidenceProfile?.level || "UNKNOWN",
        environment: context.strategicEnvironment?.environment || "UNKNOWN",
        anomalySeverity: context.anomalyIntelligence?.severity || "NONE",
        stabilityTrajectory: context.intelligenceStabilityForecast?.trajectory || "UNKNOWN",
        symbols: []
      });
    }

    groups.get(key).symbols.push(safeSymbol(context.symbol));
  });

  return [...groups.values()]
    .map((group) => ({
      ...group,
      symbols: group.symbols.sort(),
      count: group.symbols.length
    }))
    .sort((first, second) => {
      if (second.count === first.count) {
        return first.environment.localeCompare(second.environment);
      }

      return second.count - first.count;
    });
}

function classifyWatchlistPriority(prioritizedSymbols, input = {}) {
  const top = prioritizedSymbols[0];
  const highCount = prioritizedSymbols.filter((symbol) => {
    return symbol.focus === "HIGH_FOCUS";
  }).length;
  const pressure = pressureScore(input.environmentalPressure);

  if (!prioritizedSymbols.length) {
    return "BACKGROUND";
  }

  if (highCount > 0 || top.priorityScore >= 0.72 || pressure >= 0.85) {
    return "HIGH_FOCUS";
  }

  if (top.priorityScore >= 0.46 || pressure >= 0.55) {
    return "MODERATE_FOCUS";
  }

  if (top.priorityScore >= 0.24) {
    return "LOW_FOCUS";
  }

  return "BACKGROUND";
}

function countValues(items, field) {
  return items.reduce((counts, item) => {
    const value = item[field] || "UNKNOWN";
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}

function dominantValues(distribution) {
  const entries = Object.entries(distribution);
  const topCount = Math.max(0, ...entries.map(([, count]) => count));

  if (!topCount) {
    return [];
  }

  return entries
    .filter(([, count]) => count === topCount)
    .map(([value]) => value)
    .sort();
}

function summarizeDynamicWatchlist(input = {}) {
  const prioritizedSymbols = input.prioritizedSymbols || prioritizeWatchlistSymbols(input);
  const groupedContexts = input.groupedContexts || groupWatchlistContexts(input);
  const environmentDistribution = countValues(groupedContexts, "environment");

  return {
    totalSymbols: safeArray(input.symbolContexts).length,
    highestPrioritySymbols: prioritizedSymbols
      .filter((symbol) => ["HIGH_FOCUS", "MODERATE_FOCUS"].includes(symbol.focus))
      .slice(0, 5)
      .map((symbol) => symbol.symbol),
    groupedEnvironmentCount: groupedContexts.length,
    dominantEnvironmentTypes: dominantValues(environmentDistribution),
    observations: [
      prioritizedSymbols.length
        ? `${prioritizedSymbols[0].symbol} currently carries the highest watchlist focus.`
        : "No symbol context is available for watchlist review.",
      groupedContexts.length
        ? `${groupedContexts.length} contextual groups are available for basket review.`
        : "No contextual groups are available yet."
    ]
  };
}

function evaluateDynamicWatchlist(input = {}) {
  const prioritizedSymbols = prioritizeWatchlistSymbols(input);
  const groupedContexts = groupWatchlistContexts(input);
  const watchlistPriority = classifyWatchlistPriority(prioritizedSymbols, input);
  const warnings = [];
  const observations = [];

  if (!prioritizedSymbols.length) {
    warnings.push("No symbol contexts are available for dynamic watchlist review.");
  }

  if (input.environmentalPressure?.pressureLevel === "EXTREME") {
    warnings.push("Environmental pressure is extreme across the watchlist context.");
  } else if (input.environmentalPressure?.pressureLevel === "HIGH") {
    warnings.push("Environmental pressure is high across the watchlist context.");
  }

  if (input.intelligenceConsensus?.consensusStrength === "CONFLICTED") {
    warnings.push("Intelligence consensus is conflicted across current context.");
  }

  if (input.strategicEnvironment?.stability === "FRAGMENTED") {
    warnings.push("Strategic environment is fragmented at the watchlist level.");
  }

  observations.push(`${prioritizedSymbols.length} symbols were reviewed for focus ranking.`);
  observations.push(`${groupedContexts.length} context groups were identified.`);

  return {
    watchlistPriority,
    prioritizedSymbols,
    groupedContexts,
    warnings,
    observations,
    summary: `Dynamic watchlist is classified as ${watchlistPriority} with ${prioritizedSymbols.length} symbols reviewed.`
  };
}

module.exports = {
  evaluateDynamicWatchlist,
  groupWatchlistContexts,
  prioritizeWatchlistSymbols,
  summarizeDynamicWatchlist
};
