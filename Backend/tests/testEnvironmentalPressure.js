/*
 * Local diagnostic for deterministic environmental pressure analysis.
 * It verifies pressure scoring without creating recommendations or alerts.
 */

const assert = require("assert");
const {
  buildPressureSummary,
  classifyPressureLevel,
  detectPressureSources,
  evaluateEnvironmentalPressure
} = require("../services/environmentalPressure");

const FORBIDDEN_WORDS = ["BUY", "SELL", "CALL", "PUT", "entry", "exit"];

function assertNoForbiddenWords(output) {
  const text = JSON.stringify(output);

  FORBIDDEN_WORDS.forEach((word) => {
    assert(
      !new RegExp(`\\b${word}\\b`, "i").test(text),
      `Environmental pressure output should not contain forbidden word: ${word}`
    );
  });
}

function baseInput(overrides = {}) {
  return {
    strategicEnvironment: {
      environment: "FAVORABLE",
      stability: "MODERATE"
    },
    anomalyIntelligence: {
      anomalyDetected: false,
      severity: "NONE"
    },
    runtimeHealth: {
      status: "HEALTHY"
    },
    confidenceProfile: {
      level: "HIGH"
    },
    behavioralIntelligence: {
      behavioralState: "DISCIPLINED",
      riskLevel: "LOW"
    },
    cognitiveDrift: {
      driftDetected: false,
      severity: "NONE"
    },
    cognitiveTransitions: [],
    cognitiveCorrelations: [],
    intelligenceConsensus: {
      consensusStrength: "STRONG"
    },
    ...overrides
  };
}

function strongCorrelation(id) {
  return {
    correlationId: id,
    categories: ["multi_system_instability"],
    strength: "STRONG"
  };
}

function run() {
  const noPressure = evaluateEnvironmentalPressure(baseInput());
  const moderatePressure = evaluateEnvironmentalPressure(baseInput({
    strategicEnvironment: {
      environment: "CAUTION"
    },
    anomalyIntelligence: {
      severity: "MEDIUM"
    },
    confidenceProfile: {
      level: "LOW"
    }
  }));
  const highPressure = evaluateEnvironmentalPressure(baseInput({
    strategicEnvironment: {
      environment: "UNSTABLE"
    },
    anomalyIntelligence: {
      severity: "HIGH"
    },
    behavioralIntelligence: {
      behavioralState: "CAUTION",
      riskLevel: "MODERATE"
    }
  }));
  const extremePressure = evaluateEnvironmentalPressure(baseInput({
    strategicEnvironment: {
      environment: "HIGH_RISK"
    },
    anomalyIntelligence: {
      severity: "HIGH"
    },
    runtimeHealth: {
      status: "CRITICAL"
    },
    intelligenceConsensus: {
      consensusStrength: "CONFLICTED"
    },
    cognitiveCorrelations: [
      strongCorrelation("correlation-1"),
      strongCorrelation("correlation-2")
    ]
  }));
  const behavioralPressure = evaluateEnvironmentalPressure(baseInput({
    behavioralIntelligence: {
      behavioralState: "UNSTABLE",
      riskLevel: "HIGH"
    }
  }));
  const correlationPressure = evaluateEnvironmentalPressure(baseInput({
    cognitiveDrift: {
      driftDetected: true,
      severity: "MODERATE"
    },
    cognitiveTransitions: [
      {
        severity: "HIGH"
      }
    ],
    cognitiveCorrelations: [
      strongCorrelation("correlation-3"),
      strongCorrelation("correlation-4")
    ]
  }));
  const sources = detectPressureSources(extremePressure);
  const emptySummary = buildPressureSummary({
    pressureLevel: "NONE"
  });

  assert.strictEqual(classifyPressureLevel(0), "NONE");
  assert.strictEqual(classifyPressureLevel(0.1), "LOW");
  assert.strictEqual(classifyPressureLevel(0.35), "MODERATE");
  assert.strictEqual(classifyPressureLevel(0.65), "HIGH");
  assert.strictEqual(classifyPressureLevel(0.9), "EXTREME");
  assert.strictEqual(noPressure.pressureLevel, "NONE");
  assert.strictEqual(moderatePressure.pressureLevel, "MODERATE");
  assert.strictEqual(highPressure.pressureLevel, "HIGH");
  assert.strictEqual(extremePressure.pressureLevel, "EXTREME");
  assert(behavioralPressure.sources.includes("behavioral_instability"));
  assert(correlationPressure.sources.includes("strong_cognitive_correlations"));
  assert(correlationPressure.sources.includes("cognitive_drift"));
  assert(correlationPressure.sources.includes("high_severity_transition"));
  assert(extremePressure.pressureScore >= 0 && extremePressure.pressureScore <= 1);
  assert.strictEqual(Array.isArray(sources), true);
  assert(emptySummary.includes("not meaningful"));

  [
    noPressure,
    moderatePressure,
    highPressure,
    extremePressure,
    behavioralPressure,
    correlationPressure,
    sources,
    emptySummary
  ].forEach(assertNoForbiddenWords);

  console.log("\nEnvironmental pressure scenarios");
  console.log(JSON.stringify({
    noPressure,
    moderatePressure,
    highPressure,
    extremePressure,
    behavioralPressure,
    correlationPressure
  }, null, 2));
  console.log("\nEnvironmental pressure test passed.");
}

run();
