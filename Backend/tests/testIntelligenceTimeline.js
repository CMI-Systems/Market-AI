/*
 * Local diagnostic for replay timelines built from signal event logs.
 * It verifies filtering, ordering, and deterministic summaries.
 */

const assert = require("assert");
const {
  clearSignalEvents,
  logSignalEvent
} = require("../services/signalEventLog");
const {
  buildTimeline,
  getTimelineBySignalType,
  getTimelineBySymbol,
  summarizeTimeline
} = require("../services/intelligenceTimeline");

function signalInput(overrides = {}) {
  return {
    symbol: "NVDA",
    timestamp: "2026-05-22T17:00:00Z",
    regime: {
      type: "TRENDING_BULLISH"
    },
    signalIntelligence: {
      signalType: "MOMENTUM_CONTINUATION",
      quality: "HIGH",
      confidence: 0.88,
      warnings: []
    },
    narrativeIntelligence: {
      headline: "NVDA: Momentum continuation context",
      summary: "NVDA shows momentum continuation context.",
      warnings: []
    },
    alertReadiness: {
      alertReady: true,
      priority: "HIGH",
      warnings: []
    },
    signalCooldown: {
      suppressed: false
    },
    failsafeBrain: {
      status: "STANDBY"
    },
    ...overrides
  };
}

function run() {
  clearSignalEvents();

  logSignalEvent(signalInput());
  logSignalEvent(signalInput({
    symbol: "AMD",
    timestamp: "2026-05-22T17:01:00Z",
    regime: {
      type: "HIGH_VOLATILITY"
    },
    signalIntelligence: {
      signalType: "VOLATILITY_EXPANSION",
      quality: "MODERATE",
      confidence: 0.68,
      warnings: []
    },
    narrativeIntelligence: {
      headline: "AMD: Volatility expansion context",
      summary: "AMD is showing volatility expansion.",
      warnings: []
    },
    alertReadiness: {
      alertReady: true,
      priority: "MEDIUM",
      warnings: []
    }
  }));
  logSignalEvent(signalInput({
    timestamp: "2026-05-22T17:02:00Z",
    regime: {
      type: "REVERSAL_RISK"
    },
    signalIntelligence: {
      signalType: "REVERSAL_WARNING",
      quality: "MODERATE",
      confidence: 0.64,
      warnings: ["Context may be changing."]
    },
    narrativeIntelligence: {
      headline: "NVDA: Reversal risk context",
      summary: "NVDA shows reversal-risk context.",
      warnings: ["Context may be changing."]
    },
    alertReadiness: {
      alertReady: true,
      priority: "MEDIUM",
      warnings: []
    }
  }));
  logSignalEvent(signalInput({
    timestamp: "2026-05-22T17:03:00Z",
    signalCooldown: {
      suppressed: true
    }
  }));

  const fullTimeline = buildTimeline();
  const newestTimeline = buildTimeline({
    newestFirst: true
  });
  const nvdaTimeline = getTimelineBySymbol("NVDA");
  const momentumTimeline = getTimelineBySignalType("MOMENTUM_CONTINUATION");
  const summary = summarizeTimeline(fullTimeline);

  assert.strictEqual(fullTimeline.length, 4);
  assert.strictEqual(fullTimeline[0].timestamp, "2026-05-22T17:00:00.000Z");
  assert.strictEqual(newestTimeline[0].timestamp, "2026-05-22T17:03:00.000Z");
  assert.strictEqual(nvdaTimeline.length, 3);
  assert.strictEqual(momentumTimeline.length, 2);
  assert.strictEqual(summary.totalEvents, 4);
  assert.strictEqual(summary.uniqueSymbols.length, 2);
  assert.strictEqual(summary.suppressedCount, 1);
  assert.strictEqual(summary.alertReadyCount, 4);
  assert.strictEqual(summary.signalDistribution.MOMENTUM_CONTINUATION, 2);
  assert.strictEqual(summary.topSignalTypes[0].signalType, "MOMENTUM_CONTINUATION");

  console.log("\nFull timeline");
  console.log(JSON.stringify(fullTimeline, null, 2));
  console.log("\nNVDA timeline summary");
  console.log(JSON.stringify(summarizeTimeline(nvdaTimeline), null, 2));
  console.log("\nMomentum timeline summary");
  console.log(JSON.stringify(summarizeTimeline(momentumTimeline), null, 2));
  console.log("\nFull timeline summary");
  console.log(JSON.stringify(summary, null, 2));
  console.log("\nIntelligence timeline test passed.");
}

run();
