/*
 * Local diagnostic for intelligence-environment stability forecasting.
 * It does not forecast price direction or create recommendations.
 */

const assert = require("assert");
const {
  buildStabilityForecastSummary,
  classifyStabilityTrajectory,
  detectStabilityDrivers,
  forecastIntelligenceStability
} = require("../services/intelligenceStabilityForecast");

const FORBIDDEN_WORDS = ["BUY", "SELL", "CALL", "PUT", "entry", "exit"];

function assertNoForbiddenWords(output) {
  const text = JSON.stringify(output);

  FORBIDDEN_WORDS.forEach((word) => {
    assert(
      !new RegExp(`\\b${word}\\b`, "i").test(text),
      `Intelligence stability forecast output should not contain forbidden word: ${word}`
    );
  });
}

function baseInput(overrides = {}) {
  return {
    environmentalPressure: {
      pressureLevel: "NONE",
      pressureScore: 0
    },
    cognitiveDrift: {
      driftDetected: false,
      severity: "NONE"
    },
    cognitiveTransitions: [],
    cognitiveCorrelations: [],
    runtimeHealth: {
      status: "HEALTHY"
    },
    anomalyIntelligence: {
      severity: "NONE",
      anomalyDetected: false
    },
    strategicEnvironment: {
      environment: "FAVORABLE",
      stability: "MODERATE"
    },
    intelligenceConsensus: {
      consensusStrength: "STRONG",
      conflictingSystems: []
    },
    ...overrides
  };
}

function strongCorrelation(id) {
  return {
    correlationId: id,
    strength: "STRONG"
  };
}

function run() {
  const deterioratingInput = baseInput({
    environmentalPressure: {
      pressureLevel: "HIGH",
      pressureScore: 0.72
    },
    cognitiveDrift: {
      driftDetected: true,
      severity: "HIGH"
    },
    runtimeHealth: {
      status: "DEGRADED"
    },
    anomalyIntelligence: {
      severity: "HIGH",
      anomalyDetected: true
    },
    intelligenceConsensus: {
      consensusStrength: "WEAK"
    }
  });
  const stable = forecastIntelligenceStability(baseInput({
    strategicEnvironment: {
      environment: "OPTIMAL",
      stability: "HIGH"
    }
  }));
  const deteriorating = forecastIntelligenceStability(deterioratingInput);
  const fragmenting = forecastIntelligenceStability(baseInput({
    environmentalPressure: {
      pressureLevel: "EXTREME",
      pressureScore: 1
    },
    strategicEnvironment: {
      environment: "HIGH_RISK",
      stability: "FRAGMENTED"
    },
    intelligenceConsensus: {
      consensusStrength: "CONFLICTED",
      conflictingSystems: ["confidence", "runtime", "anomaly"]
    },
    cognitiveCorrelations: [
      strongCorrelation("correlation-1"),
      strongCorrelation("correlation-2")
    ]
  }));
  const recovering = forecastIntelligenceStability(baseInput({
    environmentalPressure: {
      pressureLevel: "MODERATE",
      pressureScore: 0.32
    },
    runtimeHealth: {
      status: "STABLE"
    },
    anomalyIntelligence: {
      severity: "LOW",
      anomalyDetected: false
    },
    intelligenceConsensus: {
      consensusStrength: "MODERATE"
    }
  }));
  const stabilizing = forecastIntelligenceStability(baseInput({
    environmentalPressure: {
      pressureLevel: "LOW",
      pressureScore: 0.14
    },
    runtimeHealth: {
      status: "STABLE"
    },
    anomalyIntelligence: {
      severity: "LOW",
      anomalyDetected: false
    },
    intelligenceConsensus: {
      consensusStrength: "MODERATE"
    }
  }));
  const unknown = forecastIntelligenceStability({});
  const drivers = detectStabilityDrivers(deterioratingInput);
  const summary = buildStabilityForecastSummary({
    trajectory: "FRAGMENTING"
  });

  assert.strictEqual(classifyStabilityTrajectory({
    drivers: []
  }), "UNKNOWN");
  assert.strictEqual(stable.trajectory, "STABLE");
  assert.strictEqual(deteriorating.trajectory, "DETERIORATING");
  assert.strictEqual(fragmenting.trajectory, "FRAGMENTING");
  assert.strictEqual(recovering.trajectory, "RECOVERING");
  assert.strictEqual(stabilizing.trajectory, "STABILIZING");
  assert.strictEqual(unknown.trajectory, "UNKNOWN");
  assert(deteriorating.confidence >= 0 && deteriorating.confidence <= 1);
  assert(drivers.includes("elevated_pressure"));
  assert(drivers.includes("cognitive_drift"));
  assert(summary.includes("fragmentation"));

  [
    stable,
    deteriorating,
    fragmenting,
    recovering,
    stabilizing,
    unknown,
    drivers,
    summary
  ].forEach(assertNoForbiddenWords);

  console.log("\nIntelligence stability forecasts");
  console.log(JSON.stringify({
    stable,
    deteriorating,
    fragmenting,
    recovering,
    stabilizing,
    unknown
  }, null, 2));
  console.log("\nIntelligence stability forecast test passed.");
}

run();
