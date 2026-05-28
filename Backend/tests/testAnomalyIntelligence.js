/*
 * Local diagnostic for deterministic anomaly intelligence.
 * It verifies abnormal context flags without connecting alerts or providers.
 */

const assert = require("assert");
const {
  evaluateAnomalyIntelligence
} = require("../services/anomalyIntelligence");

const FORBIDDEN_WORDS = ["BUY", "SELL", "CALL", "PUT", "entry", "exit"];

function anomaly(overrides = {}) {
  return evaluateAnomalyIntelligence({
    marketState: {
      momentum: "STABLE",
      volatility: "NORMAL",
      directionalBias: "BULLISH",
      compression: "NORMAL"
    },
    regime: {
      type: "TRENDING_BULLISH"
    },
    confidenceProfile: {
      score: 0.82,
      level: "HIGH"
    },
    signalIntelligence: {
      signalType: "MOMENTUM_CONTINUATION",
      quality: "HIGH"
    },
    behavioralIntelligence: {
      behavioralState: "DISCIPLINED",
      riskLevel: "LOW"
    },
    adaptiveMemoryScore: {
      score: 0.84,
      importance: "HIGH"
    },
    multiSymbolContext: {
      alignment: "STRONG"
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
      `Anomaly intelligence output should not contain forbidden word: ${word}`
    );
  });
}

function printAnomaly(label, output) {
  console.log(`\n${label}`);
  console.log(JSON.stringify(output, null, 2));
}

function run() {
  const normal = anomaly();
  const highVolatilityReversal = anomaly({
    marketState: {
      momentum: "REVERSING",
      volatility: "EXPANDING",
      directionalBias: "BULLISH",
      compression: "EXPANDING"
    },
    regime: {
      type: "HIGH_VOLATILITY"
    },
    signalIntelligence: {
      signalType: "REVERSAL_WARNING",
      quality: "MODERATE"
    }
  });
  const confidenceMismatch = anomaly({
    confidenceProfile: {
      score: 0,
      level: "AVOID"
    },
    signalIntelligence: {
      signalType: "VOLATILITY_EXPANSION",
      quality: "MODERATE"
    }
  });
  const behavioralRisk = anomaly({
    behavioralIntelligence: {
      behavioralState: "UNSTABLE",
      riskLevel: "HIGH"
    }
  });
  const groupConflict = anomaly({
    multiSymbolContext: {
      alignment: "CONFLICTED"
    }
  });
  const failsafeActive = anomaly({
    failsafeBrain: {
      status: "ACTIVE"
    }
  });

  assert.strictEqual(normal.anomalyDetected, false);
  assert.strictEqual(normal.severity, "NONE");
  assert(highVolatilityReversal.anomalyTypes.includes("HIGH_VOLATILITY_REVERSAL"));
  assert.strictEqual(highVolatilityReversal.severity, "HIGH");
  assert(confidenceMismatch.anomalyTypes.includes("CONFIDENCE_SIGNAL_MISMATCH"));
  assert(behavioralRisk.anomalyTypes.includes("BEHAVIORAL_RISK_ANOMALY"));
  assert(groupConflict.anomalyTypes.includes("GROUP_CONTEXT_CONFLICT"));
  assert(failsafeActive.anomalyTypes.includes("SYSTEM_FAILSAFE_ACTIVE"));
  assert.strictEqual(failsafeActive.severity, "HIGH");

  [
    normal,
    highVolatilityReversal,
    confidenceMismatch,
    behavioralRisk,
    groupConflict,
    failsafeActive
  ].forEach(assertNoForbiddenWords);

  printAnomaly("Normal context", normal);
  printAnomaly("High-volatility reversal anomaly", highVolatilityReversal);
  printAnomaly("Confidence anomaly", confidenceMismatch);
  printAnomaly("Behavioral anomaly", behavioralRisk);
  printAnomaly("Multi-symbol conflict anomaly", groupConflict);
  printAnomaly("Failsafe active anomaly", failsafeActive);
  console.log("\nAnomaly intelligence test passed.");
}

run();
