/*
 * Local diagnostic for deterministic adaptive memory significance scoring.
 * It verifies review value scoring without changing live brain decisions.
 */

const assert = require("assert");
const {
  createCandleEvent
} = require("../providers/shared/marketEvent");
const {
  scoreMemoryBatch,
  scoreMemorySignificance
} = require("../services/adaptiveMemoryScoring");

const FORBIDDEN_WORDS = ["BUY", "SELL", "CALL", "PUT", "entry", "exit"];

function marketEvent(symbol = "NVDA") {
  return createCandleEvent({
    provider: "unknown",
    source: "historical",
    assetClass: "equity",
    symbol,
    timestamp: "2026-05-22T14:30:00.000Z"
  }, {
    timeframe: "1m",
    open: 100,
    high: 102,
    low: 99,
    close: 101,
    volume: 1200
  });
}

function score(overrides = {}) {
  return scoreMemorySignificance({
    marketEvent: marketEvent(),
    marketState: {
      momentum: "ACCELERATING",
      volatility: "NORMAL",
      directionalBias: "BULLISH",
      compression: "NORMAL"
    },
    regime: {
      type: "TRENDING_BULLISH",
      confidence: 0.86
    },
    confidenceProfile: {
      score: 0.86,
      level: "HIGH"
    },
    signalIntelligence: {
      signalType: "MOMENTUM_CONTINUATION",
      quality: "HIGH",
      confidence: 0.86
    },
    alertReadiness: {
      alertReady: true,
      priority: "HIGH"
    },
    behavioralIntelligence: {
      behavioralState: "DISCIPLINED",
      riskLevel: "LOW"
    },
    failsafeBrain: {
      status: "STANDBY"
    },
    ...overrides
  });
}

function assertNoForbiddenWords(output) {
  const text = JSON.stringify(output);

  FORBIDDEN_WORDS.forEach((word) => {
    assert(
      !new RegExp(`\\b${word}\\b`, "i").test(text),
      `Adaptive memory score output should not contain forbidden word: ${word}`
    );
  });
}

function printScore(label, output) {
  console.log(`\n${label}`);
  console.log(JSON.stringify(output, null, 2));
}

function run() {
  const highConfidenceMomentum = score();
  const highVolatility = score({
    marketState: {
      momentum: "STABLE",
      volatility: "EXPANDING",
      directionalBias: "NEUTRAL",
      compression: "EXPANDING"
    },
    regime: {
      type: "HIGH_VOLATILITY",
      confidence: 0.72
    },
    signalIntelligence: {
      signalType: "VOLATILITY_EXPANSION",
      quality: "MODERATE",
      confidence: 0.68
    },
    confidenceProfile: {
      score: 0.68,
      level: "MODERATE"
    },
    alertReadiness: {
      alertReady: true,
      priority: "MEDIUM"
    }
  });
  const reversalWarning = score({
    regime: {
      type: "REVERSAL_RISK",
      confidence: 0.62
    },
    signalIntelligence: {
      signalType: "REVERSAL_WARNING",
      quality: "MODERATE",
      confidence: 0.61
    },
    confidenceProfile: {
      score: 0.61,
      level: "MODERATE"
    }
  });
  const lowConfidenceChop = score({
    regime: {
      type: "CHOPPY",
      confidence: 0.28
    },
    confidenceProfile: {
      score: 0.31,
      level: "LOW"
    },
    signalIntelligence: {
      signalType: "LOW_CONFIDENCE_CHOP",
      quality: "LOW",
      confidence: 0.31
    },
    alertReadiness: {
      alertReady: false,
      priority: "NONE"
    }
  });
  const failsafeSafetyEvent = score({
    regime: {
      type: "HIGH_VOLATILITY",
      confidence: 0.54
    },
    confidenceProfile: {
      score: 0,
      level: "AVOID"
    },
    signalIntelligence: {
      signalType: "REVERSAL_WARNING",
      quality: "LOW",
      confidence: 0.22
    },
    alertReadiness: {
      alertReady: false,
      priority: "NONE"
    },
    behavioralIntelligence: {
      behavioralState: "UNSTABLE",
      riskLevel: "HIGH"
    },
    failsafeBrain: {
      status: "ACTIVE"
    }
  });
  const invalidInput = scoreMemorySignificance({
    marketEvent: {
      symbol: "NVDA",
      raw: true
    }
  });
  const batch = scoreMemoryBatch([
    {
      marketEvent: marketEvent("AMD"),
      regime: { type: "TRANSITIONAL" },
      confidenceProfile: { level: "MODERATE" },
      signalIntelligence: {
        signalType: "COMPRESSION_BREAKOUT_SETUP",
        quality: "MODERATE"
      },
      alertReadiness: { alertReady: false, priority: "NONE" },
      behavioralIntelligence: { behavioralState: "CAUTION", riskLevel: "MODERATE" },
      failsafeBrain: { status: "STANDBY" }
    },
    { marketEvent: null }
  ]);

  assert.strictEqual(highConfidenceMomentum.importance, "HIGH");
  assert(highVolatility.score >= 0.45);
  assert(reversalWarning.reasons.some((reason) => reason.includes("Reversal")));
  assert(["LOW", "IGNORE"].includes(lowConfidenceChop.importance));
  assert(failsafeSafetyEvent.warnings.some((warning) => warning.includes("Failsafe")));
  assert.notStrictEqual(failsafeSafetyEvent.importance, "IGNORE");
  assert.strictEqual(invalidInput.importance, "IGNORE");
  assert.strictEqual(invalidInput.score, 0);
  assert.strictEqual(batch.length, 2);
  assert.strictEqual(batch[1].importance, "IGNORE");

  [
    highConfidenceMomentum,
    highVolatility,
    reversalWarning,
    lowConfidenceChop,
    failsafeSafetyEvent,
    invalidInput,
    batch
  ].forEach(assertNoForbiddenWords);

  printScore("High-confidence momentum memory", highConfidenceMomentum);
  printScore("High-volatility memory", highVolatility);
  printScore("Reversal warning memory", reversalWarning);
  printScore("Low-confidence chop memory", lowConfidenceChop);
  printScore("Failsafe safety memory", failsafeSafetyEvent);
  printScore("Invalid memory input", invalidInput);
  console.log("\nAdaptive memory scoring test passed.");
}

run();
