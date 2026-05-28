/*
 * Local diagnostic for observational signal intelligence.
 * It checks deterministic classifications and safe avoid behavior.
 */

const assert = require("assert");
const {
  evaluateSignalIntelligence
} = require("../services/signalIntelligence");

function signal(overrides = {}) {
  return evaluateSignalIntelligence({
    marketState: {
      momentum: "ACCELERATING",
      volatility: "NORMAL",
      directionalBias: "BULLISH",
      compression: "NORMAL"
    },
    regime: {
      type: "TRENDING_BULLISH"
    },
    confidenceProfile: {
      score: 0.8,
      level: "HIGH"
    },
    recentMemory: [],
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
  });
}

function printSignal(label, result) {
  console.log(`\n${label}`);
  console.log(JSON.stringify(result, null, 2));
}

function run() {
  const momentum = signal();
  const volatility = signal({
    marketState: {
      momentum: "STABLE",
      volatility: "EXPANDING",
      directionalBias: "NEUTRAL",
      compression: "EXPANDING"
    },
    regime: {
      type: "HIGH_VOLATILITY"
    }
  });
  const compression = signal({
    marketState: {
      momentum: "STABLE",
      volatility: "NORMAL",
      directionalBias: "NEUTRAL",
      compression: "COMPRESSED"
    },
    regime: {
      type: "BREAKOUT_ATTEMPT"
    },
    confidenceProfile: {
      score: 0.65,
      level: "MODERATE"
    }
  });
  const reversal = signal({
    marketState: {
      momentum: "REVERSING",
      volatility: "NORMAL",
      directionalBias: "BULLISH",
      compression: "NORMAL"
    },
    regime: {
      type: "REVERSAL_RISK"
    }
  });
  const chop = signal({
    marketState: {
      momentum: "WEAKENING",
      volatility: "NORMAL",
      directionalBias: "NEUTRAL",
      compression: "NORMAL"
    },
    regime: {
      type: "CHOPPY"
    },
    confidenceProfile: {
      score: 0.4,
      level: "LOW"
    }
  });
  const failsafe = signal({
    failsafeBrain: {
      status: "ACTIVE"
    }
  });

  assert.strictEqual(momentum.signalType, "MOMENTUM_CONTINUATION");
  assert.strictEqual(volatility.signalType, "VOLATILITY_EXPANSION");
  assert.strictEqual(compression.signalType, "COMPRESSION_BREAKOUT_SETUP");
  assert.strictEqual(reversal.signalType, "REVERSAL_WARNING");
  assert.strictEqual(chop.signalType, "LOW_CONFIDENCE_CHOP");
  assert.strictEqual(failsafe.signalType, "NO_QUALITY_SIGNAL");
  assert.strictEqual(failsafe.quality, "AVOID");

  printSignal("Momentum continuation", momentum);
  printSignal("Volatility expansion", volatility);
  printSignal("Compression breakout setup", compression);
  printSignal("Reversal warning", reversal);
  printSignal("Low-confidence chop", chop);
  printSignal("Failsafe active", failsafe);
  console.log("\nSignal intelligence test passed.");
}

run();
