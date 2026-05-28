/*
 * Deterministic strategic summaries for intelligence timeline data.
 * This layer summarizes structured observations without creating predictions.
 */

function safeTimeline(timeline) {
  return Array.isArray(timeline) ? timeline : [];
}

function safeSymbol(symbol) {
  return typeof symbol === "string" && symbol.trim()
    ? symbol.trim()
    : "Market";
}

function countBy(timeline, field) {
  return safeTimeline(timeline).reduce((counts, item) => {
    const key = item[field] || "UNKNOWN";
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}

function getDominant(distribution) {
  return Object.entries(distribution)
    .sort((first, second) => {
      if (second[1] === first[1]) {
        return first[0].localeCompare(second[0]);
      }

      return second[1] - first[1];
    })[0]?.[0] || "NONE";
}

function summarizeSignals(timeline = []) {
  const signalDistribution = countBy(timeline, "signalType");
  const dominantSignalType = getDominant(signalDistribution);

  if (dominantSignalType === "MOMENTUM_CONTINUATION") {
    return {
      dominantSignalType,
      signalDistribution,
      summary: "Signal history emphasizes directional persistence across recent observations."
    };
  }

  if (dominantSignalType === "VOLATILITY_EXPANSION") {
    return {
      dominantSignalType,
      signalDistribution,
      summary: "Signal history emphasizes elevated volatility conditions and range expansion."
    };
  }

  if (dominantSignalType === "REVERSAL_WARNING") {
    return {
      dominantSignalType,
      signalDistribution,
      summary: "Signal history emphasizes elevated reversal risk in recent observations."
    };
  }

  if (dominantSignalType === "NONE") {
    return {
      dominantSignalType,
      signalDistribution,
      summary: "No structured signal history is available yet."
    };
  }

  return {
    dominantSignalType,
    signalDistribution,
    summary: "Signal history shows mixed structured observations without one dominant condition."
  };
}

function summarizeConfidence(timeline = []) {
  const confidences = safeTimeline(timeline)
    .map((item) => item.confidence)
    .filter((confidence) => typeof confidence === "number" && Number.isFinite(confidence));
  const averageConfidence = confidences.length
    ? confidences.reduce((total, confidence) => total + confidence, 0) /
      confidences.length
    : 0;

  if (!confidences.length) {
    return {
      averageConfidence,
      summary: "Confidence history is not available yet."
    };
  }

  if (averageConfidence >= 0.75) {
    return {
      averageConfidence,
      summary: "Recent confidence behavior is comparatively strong across logged observations."
    };
  }

  if (averageConfidence >= 0.5) {
    return {
      averageConfidence,
      summary: "Recent confidence behavior is mixed but remains usable for review."
    };
  }

  return {
    averageConfidence,
    summary: "Recent confidence behavior is restrained and should be interpreted cautiously."
  };
}

function summarizeRegimes(timeline = []) {
  const regimeDistribution = countBy(timeline, "regimeType");
  const dominantRegime = getDominant(regimeDistribution);

  if (dominantRegime === "NONE") {
    return {
      dominantRegime,
      regimeDistribution,
      summary: "Regime history is not available yet."
    };
  }

  if (["CHOPPY", "TRANSITIONAL"].includes(dominantRegime)) {
    return {
      dominantRegime,
      regimeDistribution,
      summary: "Regime history is dominated by unstable market conditions."
    };
  }

  return {
    dominantRegime,
    regimeDistribution,
    summary: `Regime history is centered on ${dominantRegime} conditions.`
  };
}

function summarizeWarnings(timeline = []) {
  const items = safeTimeline(timeline);
  const dominantSignalType = getDominant(countBy(items, "signalType"));
  const dominantRegime = getDominant(countBy(items, "regimeType"));
  const warnings = items
    .flatMap((item) => Array.isArray(item.warnings) ? item.warnings : [])
    .filter((warning) => typeof warning === "string" && warning.trim());

  if (["CHOPPY", "TRANSITIONAL"].includes(dominantRegime)) {
    return "Warning context reflects unstable market conditions in the dominant regime.";
  }

  if (dominantSignalType === "REVERSAL_WARNING") {
    return "Warning context reflects elevated reversal risk across recent observations.";
  }

  if (warnings.length) {
    return "Warning context is present in recent observations and should remain visible in review.";
  }

  return "No prominent warning pattern is present in the current timeline.";
}

function createEmptySummary(symbol) {
  return {
    symbol,
    headline: `${symbol}: No intelligence timeline data`,
    marketSummary: "No structured signal history is available yet.",
    confidenceSummary: "Confidence history is not available yet.",
    regimeSummary: "Regime history is not available yet.",
    warningSummary: "No warning history is available yet.",
    statistics: {
      totalSignals: 0,
      dominantSignalType: "NONE",
      dominantRegime: "NONE",
      averageConfidence: 0,
      suppressedSignals: 0,
      alertReadySignals: 0
    }
  };
}

function buildInsightSummary(input = {}) {
  const timeline = safeTimeline(input.timeline);
  const symbol = safeSymbol(input.symbol);

  if (!timeline.length) {
    return createEmptySummary(symbol);
  }

  const signalSummary = summarizeSignals(timeline);
  const confidenceSummary = summarizeConfidence(timeline);
  const regimeSummary = summarizeRegimes(timeline);

  return {
    symbol,
    headline: `${symbol}: ${timeline.length} intelligence observations summarized`,
    marketSummary: signalSummary.summary,
    confidenceSummary: confidenceSummary.summary,
    regimeSummary: regimeSummary.summary,
    warningSummary: summarizeWarnings(timeline),
    statistics: {
      totalSignals: timeline.length,
      dominantSignalType: signalSummary.dominantSignalType,
      dominantRegime: regimeSummary.dominantRegime,
      averageConfidence: Number(confidenceSummary.averageConfidence.toFixed(4)),
      suppressedSignals: timeline.filter((item) => item.suppressed).length,
      alertReadySignals: timeline.filter((item) => item.alertReady).length
    }
  };
}

module.exports = {
  buildInsightSummary,
  summarizeConfidence,
  summarizeRegimes,
  summarizeSignals,
  summarizeWarnings
};
