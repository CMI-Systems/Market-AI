/*
 * Local diagnostic for adaptive cognitive weighting.
 * It scores influence of intelligence factors without changing decisions.
 */

const assert = require("assert");
const {
  calculateCognitiveWeights,
  classifyWeightPriority,
  normalizeCognitiveWeights,
  summarizeCognitiveWeights
} = require("../services/adaptiveCognitiveWeighting");

const FORBIDDEN_WORDS = ["BUY", "SELL", "CALL", "PUT", "entry", "exit"];

function assertNoForbiddenWords(output) {
  const text = JSON.stringify(output);

  FORBIDDEN_WORDS.forEach((word) => {
    assert(
      !new RegExp(`\\b${word}\\b`, "i").test(text),
      `Adaptive cognitive weighting output should not contain forbidden word: ${word}`
    );
  });
}

function baseInput(overrides = {}) {
  return {
    anomalyIntelligence: {
      severity: "NONE"
    },
    confidenceProfile: {
      level: "HIGH"
    },
    runtimeHealth: {
      status: "HEALTHY"
    },
    behavioralIntelligence: {
      behavioralState: "DISCIPLINED",
      riskLevel: "LOW"
    },
    cognitiveDrift: {
      severity: "NONE",
      driftDetected: false
    },
    cognitiveTransitions: [],
    environmentalPressure: {
      pressureLevel: "NONE"
    },
    intelligenceConsensus: {
      consensusStrength: "STRONG"
    },
    strategicEnvironment: {
      environment: "OPTIMAL",
      stability: "HIGH"
    },
    intelligenceStabilityForecast: {
      trajectory: "STABLE"
    },
    ...overrides
  };
}

function allWeightsAreNormalized(result) {
  return Object.values(result.weights).every((weight) => {
    return weight >= 0 && weight <= 1;
  });
}

function run() {
  const stable = calculateCognitiveWeights(baseInput());
  const anomalyHeavy = calculateCognitiveWeights(baseInput({
    anomalyIntelligence: {
      severity: "HIGH"
    },
    environmentalPressure: {
      pressureLevel: "HIGH"
    },
    intelligenceStabilityForecast: {
      trajectory: "DETERIORATING"
    }
  }));
  const fragmented = calculateCognitiveWeights(baseInput({
    confidenceProfile: {
      level: "HIGH"
    },
    intelligenceConsensus: {
      consensusStrength: "CONFLICTED"
    },
    strategicEnvironment: {
      environment: "HIGH_RISK",
      stability: "FRAGMENTED"
    },
    intelligenceStabilityForecast: {
      trajectory: "FRAGMENTING"
    }
  }));
  const runtimeDegraded = calculateCognitiveWeights(baseInput({
    runtimeHealth: {
      status: "DEGRADED"
    },
    cognitiveDrift: {
      severity: "MODERATE",
      driftDetected: true
    },
    cognitiveTransitions: [
      {
        severity: "HIGH"
      }
    ],
    intelligenceStabilityForecast: {
      trajectory: "DETERIORATING"
    }
  }));
  const pressureEscalation = calculateCognitiveWeights(baseInput({
    environmentalPressure: {
      pressureLevel: "EXTREME"
    },
    behavioralIntelligence: {
      behavioralState: "UNSTABLE",
      riskLevel: "HIGH"
    },
    intelligenceStabilityForecast: {
      trajectory: "FRAGMENTING"
    }
  }));
  const normalized = normalizeCognitiveWeights({
    anomalies: 2,
    confidence: -1
  });
  const manualSummary = summarizeCognitiveWeights(stable);

  assert.strictEqual(classifyWeightPriority(0.8), "HIGH");
  assert.strictEqual(classifyWeightPriority(0.55), "MODERATE");
  assert.strictEqual(classifyWeightPriority(0.3), "LOW");
  assert.strictEqual(classifyWeightPriority(0.1), "SUPPRESSED");
  assert.strictEqual(normalized.anomalies, 1);
  assert.strictEqual(normalized.confidence, 0);
  assert(allWeightsAreNormalized(stable));
  assert(allWeightsAreNormalized(anomalyHeavy));
  assert(allWeightsAreNormalized(fragmented));
  assert(allWeightsAreNormalized(runtimeDegraded));
  assert(allWeightsAreNormalized(pressureEscalation));
  assert(stable.dominantFactors.includes("confidence"));
  assert(stable.dominantFactors.includes("consensus"));
  assert(anomalyHeavy.dominantFactors.includes("anomalies"));
  assert(anomalyHeavy.dominantFactors.includes("pressure"));
  assert(fragmented.dominantFactors.includes("strategicEnvironment"));
  assert(fragmented.suppressedFactors.includes("confidence"));
  assert(runtimeDegraded.dominantFactors.includes("runtime"));
  assert(runtimeDegraded.dominantFactors.includes("transitions"));
  assert(pressureEscalation.dominantFactors.includes("pressure"));
  assert(pressureEscalation.dominantFactors.includes("behavior"));
  assert(manualSummary.includes("Strongest influences"));

  [
    stable,
    anomalyHeavy,
    fragmented,
    runtimeDegraded,
    pressureEscalation,
    normalized,
    manualSummary
  ].forEach(assertNoForbiddenWords);

  console.log("\nAdaptive cognitive weights");
  console.log(JSON.stringify({
    stable,
    anomalyHeavy,
    fragmented,
    runtimeDegraded,
    pressureEscalation
  }, null, 2));
  console.log("\nAdaptive cognitive weighting test passed.");
}

run();
