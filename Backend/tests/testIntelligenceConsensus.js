/*
 * Local diagnostic for deterministic intelligence consensus review.
 * It checks agreement and conflict without changing brain decisions.
 */

const assert = require("assert");
const {
  evaluateIntelligenceConsensus
} = require("../services/intelligenceConsensus");

const FORBIDDEN_WORDS = ["BUY", "SELL", "CALL", "PUT", "entry", "exit"];

function consensus(overrides = {}) {
  return evaluateIntelligenceConsensus({
    confidenceProfile: {
      score: 0.84,
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
    behavioralRiskAlignment: {
      aligned: true,
      riskAdjustment: "NONE"
    },
    anomalyIntelligence: {
      anomalyDetected: false,
      severity: "NONE"
    },
    multiSymbolContext: {
      groupBias: "BULLISH",
      alignment: "STRONG"
    },
    runtimeHealth: {
      healthScore: 0.9,
      status: "HEALTHY"
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
      `Intelligence consensus output should not contain forbidden word: ${word}`
    );
  });
}

function printConsensus(label, output) {
  console.log(`\n${label}`);
  console.log(JSON.stringify(output, null, 2));
}

function run() {
  const strong = consensus();
  const moderate = consensus({
    confidenceProfile: {
      score: 0.64,
      level: "MODERATE"
    },
    signalIntelligence: {
      signalType: "COMPRESSION_BREAKOUT_SETUP",
      quality: "MODERATE"
    },
    multiSymbolContext: {
      groupBias: "UNKNOWN",
      alignment: "UNKNOWN"
    },
    runtimeHealth: {
      healthScore: 0.68,
      status: "STABLE"
    }
  });
  const weak = consensus({
    confidenceProfile: {
      score: 0.24,
      level: "LOW"
    },
    signalIntelligence: {
      signalType: "NO_QUALITY_SIGNAL",
      quality: "AVOID"
    },
    behavioralIntelligence: {
      behavioralState: "UNKNOWN",
      riskLevel: "MODERATE"
    },
    behavioralRiskAlignment: {
      aligned: true,
      riskAdjustment: "NONE"
    },
    multiSymbolContext: {
      groupBias: "UNKNOWN",
      alignment: "UNKNOWN"
    }
  });
  const conflicted = consensus({
    behavioralIntelligence: {
      behavioralState: "UNSTABLE",
      riskLevel: "HIGH"
    },
    behavioralRiskAlignment: {
      aligned: false,
      riskAdjustment: "SUPPRESS"
    },
    anomalyIntelligence: {
      anomalyDetected: true,
      severity: "HIGH"
    },
    multiSymbolContext: {
      groupBias: "MIXED",
      alignment: "CONFLICTED"
    },
    runtimeHealth: {
      healthScore: 0.37,
      status: "DEGRADED"
    }
  });
  const failsafeConflict = consensus({
    failsafeBrain: {
      status: "ACTIVE"
    }
  });

  assert.strictEqual(strong.consensusStrength, "STRONG");
  assert.strictEqual(moderate.consensusStrength, "MODERATE");
  assert.strictEqual(weak.consensusStrength, "WEAK");
  assert.strictEqual(conflicted.consensusStrength, "CONFLICTED");
  assert(conflicted.conflictingSystems.includes("multiSymbolContext"));
  assert.strictEqual(failsafeConflict.consensusStrength, "CONFLICTED");
  assert(failsafeConflict.warnings.some((warning) => warning.includes("Failsafe")));

  [
    strong,
    moderate,
    weak,
    conflicted,
    failsafeConflict
  ].forEach(assertNoForbiddenWords);

  printConsensus("Strong consensus", strong);
  printConsensus("Moderate consensus", moderate);
  printConsensus("Weak consensus", weak);
  printConsensus("Conflicted consensus", conflicted);
  printConsensus("Failsafe conflict", failsafeConflict);
  console.log("\nIntelligence consensus test passed.");
}

run();
