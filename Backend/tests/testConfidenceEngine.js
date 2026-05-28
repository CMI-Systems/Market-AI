/*
 * Local diagnostic for deterministic Confidence Engine scoring.
 * It checks supportive context, penalties, and failsafe avoidance.
 */

const assert = require("assert");
const {
  createCandleEvent
} = require("../providers/shared/marketEvent");
const {
  calculateConfidence
} = require("../services/confidenceEngine");

function memory(count) {
  return Array.from({ length: count }, (_, index) => {
    return createCandleEvent(
      {
        provider: "alpaca",
        source: "historical",
        assetClass: "equity",
        symbol: "NVDA",
        timestamp: `2026-05-22T16:${String(index).padStart(2, "0")}:00Z`
      },
      {
        timeframe: "1m",
        open: 100 + index,
        high: 101 + index,
        low: 99 + index,
        close: 100.5 + index,
        volume: 1000 + index
      }
    );
  });
}

function profile(overrides = {}) {
  return calculateConfidence({
    marketState: {
      momentum: "ACCELERATING",
      volatility: "NORMAL",
      directionalBias: "BULLISH",
      compression: "NORMAL"
    },
    regime: {
      type: "TRENDING_BULLISH",
      confidence: 0.85
    },
    recentMemory: memory(10),
    tacticalBrain: {
      status: "OBSERVING",
      bias: "NEUTRAL"
    },
    behavioralRiskBrain: {
      status: "OBSERVING",
      bias: "ALIGNED",
      riskLevel: "LOW"
    },
    failsafeBrain: {
      status: "STANDBY"
    },
    ...overrides
  });
}

function printProfile(label, confidenceProfile) {
  console.log(`\n${label}`);
  console.log(JSON.stringify(confidenceProfile, null, 2));
}

function run() {
  const highTrending = profile();
  const choppy = profile({
    marketState: {
      momentum: "WEAKENING",
      volatility: "NORMAL",
      directionalBias: "NEUTRAL",
      compression: "NORMAL"
    },
    regime: {
      type: "CHOPPY",
      confidence: 0.4
    }
  });
  const failsafeActive = profile({
    failsafeBrain: {
      status: "ACTIVE"
    }
  });
  const insufficientMemory = profile({
    recentMemory: memory(2)
  });
  const highBehavioralRisk = profile({
    behavioralRiskBrain: {
      status: "OBSERVING",
      bias: "CAUTION",
      riskLevel: "HIGH"
    }
  });

  assert.strictEqual(highTrending.level, "HIGH");
  assert(["LOW", "AVOID"].includes(choppy.level));
  assert.strictEqual(failsafeActive.score, 0);
  assert.strictEqual(failsafeActive.level, "AVOID");
  assert(insufficientMemory.score < highTrending.score);
  assert(highBehavioralRisk.score < highTrending.score);

  printProfile("High-confidence trending bullish", highTrending);
  printProfile("Choppy low-confidence", choppy);
  printProfile("Failsafe active", failsafeActive);
  printProfile("Insufficient memory", insufficientMemory);
  printProfile("High behavioral risk", highBehavioralRisk);
  console.log("\nConfidence engine test passed.");
}

run();
