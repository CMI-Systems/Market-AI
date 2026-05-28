/*
 * Local diagnostic for deterministic intelligence summaries.
 * It verifies concise summaries from timeline data only.
 */

const assert = require("assert");
const {
  buildInsightSummary,
  summarizeConfidence,
  summarizeRegimes,
  summarizeSignals,
  summarizeWarnings
} = require("../services/insightSummary");

const FORBIDDEN_WORDS = ["BUY", "SELL", "CALL", "PUT", "entry", "exit"];

function timelineItem(overrides = {}) {
  return {
    timestamp: "2026-05-22T18:00:00.000Z",
    symbol: "NVDA",
    signalType: "MOMENTUM_CONTINUATION",
    quality: "HIGH",
    confidence: 0.88,
    regimeType: "TRENDING_BULLISH",
    alertReady: true,
    suppressed: false,
    headline: "NVDA: Momentum continuation context",
    summary: "NVDA shows momentum continuation context.",
    warnings: [],
    ...overrides
  };
}

function assertNoForbiddenWords(output) {
  const text = JSON.stringify(output);

  FORBIDDEN_WORDS.forEach((word) => {
    assert(
      !new RegExp(`\\b${word}\\b`, "i").test(text),
      `Insight summary output should not contain forbidden word: ${word}`
    );
  });
}

function run() {
  const timeline = [
    timelineItem(),
    timelineItem({
      timestamp: "2026-05-22T18:01:00.000Z",
      signalType: "VOLATILITY_EXPANSION",
      confidence: 0.62,
      regimeType: "HIGH_VOLATILITY",
      summary: "NVDA is showing volatility expansion."
    }),
    timelineItem({
      timestamp: "2026-05-22T18:02:00.000Z",
      signalType: "REVERSAL_WARNING",
      confidence: 0.46,
      regimeType: "REVERSAL_RISK",
      summary: "NVDA shows reversal-risk context.",
      warnings: ["Context may be changing."]
    }),
    timelineItem({
      timestamp: "2026-05-22T18:03:00.000Z",
      signalType: "REVERSAL_WARNING",
      confidence: 0.54,
      regimeType: "CHOPPY",
      suppressed: true,
      warnings: ["Directional quality is limited."]
    })
  ];
  const summary = buildInsightSummary({
    timeline,
    symbol: "NVDA"
  });
  const emptySummary = buildInsightSummary({
    timeline: [],
    symbol: "AMD"
  });

  assert.strictEqual(summarizeSignals(timeline).dominantSignalType, "REVERSAL_WARNING");
  assert.strictEqual(summarizeRegimes(timeline).dominantRegime, "CHOPPY");
  assert(summarizeConfidence(timeline).averageConfidence > 0);
  assert(summarizeWarnings(timeline).includes("unstable"));
  assert.strictEqual(summary.statistics.totalSignals, 4);
  assert.strictEqual(summary.statistics.suppressedSignals, 1);
  assert.strictEqual(summary.statistics.alertReadySignals, 4);
  assert.strictEqual(summary.statistics.dominantSignalType, "REVERSAL_WARNING");
  assert.strictEqual(summary.statistics.dominantRegime, "CHOPPY");
  assert(summary.marketSummary.includes("reversal risk"));
  assert(summary.warningSummary.includes("unstable"));
  assert.strictEqual(emptySummary.statistics.totalSignals, 0);

  assertNoForbiddenWords(summary);
  assertNoForbiddenWords(emptySummary);

  console.log("\nInsight summary");
  console.log(JSON.stringify(summary, null, 2));
  console.log("\nEmpty summary");
  console.log(JSON.stringify(emptySummary, null, 2));
  console.log("\nInsight summary test passed.");
}

run();
