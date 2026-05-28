/*
 * Local diagnostic for alert readiness.
 * It checks that intelligence can be gated without sending any alerts.
 */

const assert = require("assert");
const {
  evaluateAlertReadiness
} = require("../services/alertReadiness");

const FORBIDDEN_WORDS = ["BUY", "SELL", "CALL", "PUT", "entry", "exit"];

function readiness(overrides = {}) {
  return evaluateAlertReadiness({
    symbol: "NVDA",
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
      score: 0.85,
      level: "HIGH"
    },
    signalIntelligence: {
      signalType: "MOMENTUM_CONTINUATION",
      quality: "HIGH",
      warnings: []
    },
    narrativeIntelligence: {
      warnings: []
    },
    failsafeBrain: {
      status: "STANDBY"
    },
    behavioralRiskBrain: {
      riskLevel: "LOW"
    },
    ...overrides
  });
}

function assertNoForbiddenWords(output) {
  const text = JSON.stringify(output);

  FORBIDDEN_WORDS.forEach((word) => {
    assert(
      !new RegExp(`\\b${word}\\b`, "i").test(text),
      `Alert readiness output should not contain forbidden word: ${word}`
    );
  });
}

function printReadiness(label, output) {
  console.log(`\n${label}`);
  console.log(JSON.stringify(output, null, 2));
}

function run() {
  const highQualityMomentum = readiness();
  const moderateSignal = readiness({
    confidenceProfile: {
      score: 0.65,
      level: "MODERATE"
    },
    signalIntelligence: {
      signalType: "COMPRESSION_BREAKOUT_SETUP",
      quality: "MODERATE",
      warnings: ["Expansion remains unconfirmed."]
    }
  });
  const choppyDowngraded = readiness({
    regime: {
      type: "CHOPPY"
    }
  });
  const failsafeActive = readiness({
    failsafeBrain: {
      status: "ACTIVE"
    }
  });
  const highBehavioralRisk = readiness({
    confidenceProfile: {
      score: 0.65,
      level: "MODERATE"
    },
    signalIntelligence: {
      signalType: "VOLATILITY_EXPANSION",
      quality: "MODERATE",
      warnings: []
    },
    behavioralRiskBrain: {
      riskLevel: "HIGH"
    }
  });
  const noQualitySignal = readiness({
    signalIntelligence: {
      signalType: "NO_QUALITY_SIGNAL",
      quality: "AVOID",
      warnings: ["Current context remains limited."]
    }
  });

  assert.strictEqual(highQualityMomentum.alertReady, true);
  assert.strictEqual(highQualityMomentum.priority, "HIGH");
  assert.strictEqual(moderateSignal.alertReady, true);
  assert.strictEqual(moderateSignal.priority, "MEDIUM");
  assert.strictEqual(choppyDowngraded.priority, "MEDIUM");
  assert.strictEqual(failsafeActive.alertReady, false);
  assert.strictEqual(failsafeActive.priority, "NONE");
  assert.strictEqual(highBehavioralRisk.alertReady, false);
  assert.strictEqual(noQualitySignal.alertReady, false);

  [
    highQualityMomentum,
    moderateSignal,
    choppyDowngraded,
    failsafeActive,
    highBehavioralRisk,
    noQualitySignal
  ].forEach(assertNoForbiddenWords);

  printReadiness("High-quality momentum signal", highQualityMomentum);
  printReadiness("Moderate signal", moderateSignal);
  printReadiness("Choppy downgraded signal", choppyDowngraded);
  printReadiness("Failsafe active", failsafeActive);
  printReadiness("High behavioral risk", highBehavioralRisk);
  printReadiness("No-quality signal", noQualitySignal);
  console.log("\nAlert readiness test passed.");
}

run();
