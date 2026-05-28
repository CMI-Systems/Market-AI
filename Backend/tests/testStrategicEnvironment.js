/*
 * Local diagnostic for deterministic strategic environment classification.
 * It checks broad environment posture without changing brain decisions.
 */

const assert = require("assert");
const {
  evaluateStrategicEnvironment
} = require("../services/strategicEnvironment");

const FORBIDDEN_WORDS = ["BUY", "SELL", "CALL", "PUT", "entry", "exit"];

function environment(overrides = {}) {
  return evaluateStrategicEnvironment({
    intelligenceConsensus: {
      consensusStrength: "STRONG",
      conflictingSystems: []
    },
    runtimeHealth: {
      healthScore: 0.91,
      status: "HEALTHY"
    },
    anomalyIntelligence: {
      anomalyDetected: false,
      severity: "NONE"
    },
    confidenceProfile: {
      score: 0.86,
      level: "HIGH"
    },
    behavioralIntelligence: {
      behavioralState: "DISCIPLINED",
      riskLevel: "LOW"
    },
    multiSymbolContext: {
      groupBias: "BULLISH",
      alignment: "STRONG"
    },
    adaptiveMemoryScore: {
      score: 0.82,
      importance: "HIGH"
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
      `Strategic environment output should not contain forbidden word: ${word}`
    );
  });
}

function printEnvironment(label, output) {
  console.log(`\n${label}`);
  console.log(JSON.stringify(output, null, 2));
}

function run() {
  const optimal = environment();
  const favorable = environment({
    intelligenceConsensus: {
      consensusStrength: "MODERATE",
      conflictingSystems: []
    },
    runtimeHealth: {
      healthScore: 0.76,
      status: "STABLE"
    },
    confidenceProfile: {
      score: 0.68,
      level: "MODERATE"
    },
    multiSymbolContext: {
      groupBias: "BEARISH",
      alignment: "MODERATE"
    }
  });
  const caution = environment({
    intelligenceConsensus: {
      consensusStrength: "WEAK",
      conflictingSystems: ["confidenceProfile"]
    },
    confidenceProfile: {
      score: 0.36,
      level: "LOW"
    },
    anomalyIntelligence: {
      anomalyDetected: true,
      severity: "MEDIUM"
    },
    multiSymbolContext: {
      groupBias: "UNKNOWN",
      alignment: "UNKNOWN"
    }
  });
  const unstable = environment({
    intelligenceConsensus: {
      consensusStrength: "CONFLICTED",
      conflictingSystems: ["runtimeHealth", "anomalyIntelligence"]
    },
    runtimeHealth: {
      healthScore: 0.42,
      status: "DEGRADED"
    },
    behavioralIntelligence: {
      behavioralState: "UNSTABLE",
      riskLevel: "HIGH"
    }
  });
  const highRisk = environment({
    failsafeBrain: {
      status: "ACTIVE"
    },
    runtimeHealth: {
      healthScore: 0,
      status: "CRITICAL"
    },
    anomalyIntelligence: {
      anomalyDetected: true,
      severity: "HIGH"
    }
  });
  const fragmented = environment({
    intelligenceConsensus: {
      consensusStrength: "CONFLICTED",
      conflictingSystems: [
        "anomalyIntelligence",
        "runtimeHealth",
        "multiSymbolContext"
      ]
    },
    multiSymbolContext: {
      groupBias: "MIXED",
      alignment: "CONFLICTED"
    }
  });

  assert.strictEqual(optimal.environment, "OPTIMAL");
  assert.strictEqual(optimal.stability, "HIGH");
  assert.strictEqual(favorable.environment, "FAVORABLE");
  assert.strictEqual(favorable.stability, "MODERATE");
  assert.strictEqual(caution.environment, "CAUTION");
  assert.strictEqual(unstable.environment, "UNSTABLE");
  assert.strictEqual(highRisk.environment, "HIGH_RISK");
  assert.strictEqual(fragmented.stability, "FRAGMENTED");
  assert(["UNSTABLE", "HIGH_RISK"].includes(fragmented.environment));

  [
    optimal,
    favorable,
    caution,
    unstable,
    highRisk,
    fragmented
  ].forEach(assertNoForbiddenWords);

  printEnvironment("Optimal environment", optimal);
  printEnvironment("Favorable environment", favorable);
  printEnvironment("Caution environment", caution);
  printEnvironment("Unstable environment", unstable);
  printEnvironment("High-risk environment", highRisk);
  printEnvironment("Fragmented environment", fragmented);
  console.log("\nStrategic environment test passed.");
}

run();
