/*
 * Local diagnostic for structured signal event logging.
 * It verifies bounded in-memory logging without persistence or delivery.
 */

const assert = require("assert");
const {
  clearSignalEvents,
  getRecentSignalEvents,
  getSignalEventStats,
  logSignalEvent
} = require("../services/signalEventLog");

function signalEventInput(overrides = {}) {
  return {
    symbol: "NVDA",
    timestamp: "2026-05-22T16:30:00Z",
    marketState: {
      momentum: "ACCELERATING"
    },
    regime: {
      type: "TRENDING_BULLISH"
    },
    confidenceProfile: {
      score: 0.86,
      level: "HIGH"
    },
    signalIntelligence: {
      signalType: "MOMENTUM_CONTINUATION",
      quality: "HIGH",
      confidence: 0.86,
      warnings: []
    },
    narrativeIntelligence: {
      headline: "NVDA: Momentum continuation context",
      summary: "NVDA shows strong observational structure.",
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
    tacticalBrain: {
      status: "OBSERVING"
    },
    behavioralRiskBrain: {
      status: "OBSERVING"
    },
    failsafeBrain: {
      status: "STANDBY"
    },
    ...overrides
  };
}

function run() {
  clearSignalEvents();

  const highQuality = logSignalEvent(signalEventInput());
  const suppressed = logSignalEvent(signalEventInput({
    timestamp: "2026-05-22T16:31:00Z",
    signalCooldown: {
      suppressed: true
    }
  }));
  const failsafeActive = logSignalEvent(signalEventInput({
    symbol: "AMD",
    timestamp: "2026-05-22T16:32:00Z",
    alertReadiness: {
      alertReady: false,
      priority: "NONE",
      warnings: ["Failsafe layer is active."]
    },
    failsafeBrain: {
      status: "ACTIVE"
    }
  }));
  const noQuality = logSignalEvent(signalEventInput({
    signalIntelligence: {
      signalType: "NO_QUALITY_SIGNAL",
      quality: "AVOID",
      confidence: 0,
      warnings: ["Current context remains limited."]
    }
  }));
  const recentEvents = getRecentSignalEvents({
    limit: 5
  });
  const stats = getSignalEventStats();

  assert.strictEqual(highQuality.logged, true);
  assert.strictEqual(suppressed.logged, true);
  assert.strictEqual(suppressed.suppressed, true);
  assert.strictEqual(failsafeActive.logged, true);
  assert.strictEqual(noQuality.logged, false);
  assert.strictEqual(stats.totalEvents, 3);
  assert.strictEqual(stats.suppressedEvents, 1);
  assert.strictEqual(stats.alertReadyEvents, 2);
  assert.strictEqual(recentEvents[0].symbol, "AMD");
  assert(recentEvents[0].warnings.includes("Failsafe layer is active."));

  console.log("\nRecent signal events");
  console.log(JSON.stringify(recentEvents, null, 2));
  console.log("\nSignal event stats");
  console.log(JSON.stringify(stats, null, 2));
  console.log("\nSignal event log test passed.");
}

run();
