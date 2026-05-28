/*
 * Local diagnostic for deterministic cognitive correlation detection.
 * It links anomalies, runtime conditions, drift, behavior, and transitions.
 */

const assert = require("assert");
const {
  detectCognitiveCorrelations,
  groupCorrelatedEvents,
  scoreCorrelationStrength,
  summarizeCognitiveCorrelations
} = require("../services/cognitiveCorrelation");

const FORBIDDEN_WORDS = ["BUY", "SELL", "CALL", "PUT", "entry", "exit"];

function assertNoForbiddenWords(output) {
  const text = JSON.stringify(output);

  FORBIDDEN_WORDS.forEach((word) => {
    assert(
      !new RegExp(`\\b${word}\\b`, "i").test(text),
      `Cognitive correlation output should not contain forbidden word: ${word}`
    );
  });
}

function anomaly(id, timestamp, severity = "HIGH") {
  return {
    id,
    timestamp,
    severity
  };
}

function runtime(id, timestamp, status = "DEGRADED") {
  return {
    id,
    timestamp,
    status
  };
}

function behavior(id, timestamp, mood = "OVERACTIVE") {
  return {
    id,
    timestamp,
    mood,
    riskLevel: "HIGH"
  };
}

function snapshot(id, timestamp, overrides = {}) {
  return {
    id,
    timestamp,
    symbol: "NVDA",
    confidenceLevel: "HIGH",
    consensusStrength: "STRONG",
    strategicEnvironment: "FAVORABLE",
    ...overrides
  };
}

function transition(transitionId, timestamp, category, toState, severity = "HIGH") {
  return {
    transitionId,
    timestamp,
    category,
    fromState: "STABLE",
    toState,
    severity
  };
}

function run() {
  const fullInput = {
    anomalies: [
      anomaly("anomaly-1", "2026-05-22T14:00:00Z"),
      anomaly("anomaly-2", "2026-05-22T14:02:00Z", "MEDIUM")
    ],
    runtimeEvents: [
      runtime("runtime-1", "2026-05-22T14:01:00Z"),
      runtime("runtime-2", "2026-05-22T14:03:00Z", "CRITICAL")
    ],
    behavioralTimeline: [
      behavior("behavior-1", "2026-05-22T14:04:00Z"),
      behavior("behavior-2", "2026-05-22T14:05:00Z", "UNCERTAIN")
    ],
    strategicSnapshots: [
      snapshot("snapshot-1", "2026-05-22T14:04:00Z", {
        confidenceLevel: "LOW",
        strategicEnvironment: "HIGH_RISK",
        consensusStrength: "CONFLICTED"
      }),
      snapshot("snapshot-2", "2026-05-22T14:05:00Z", {
        confidenceLevel: "AVOID",
        strategicEnvironment: "UNSTABLE",
        consensusStrength: "CONFLICTED"
      })
    ],
    cognitiveTransitions: [
      transition("transition-behavior-1", "2026-05-22T14:05:00Z", "behavioral_state", "UNSTABLE"),
      transition("transition-consensus-1", "2026-05-22T14:05:00Z", "consensus_state", "CONFLICTED"),
      transition("transition-strategic-1", "2026-05-22T14:06:00Z", "strategic_environment", "HIGH_RISK")
    ],
    cognitiveDrift: {
      driftDetected: true,
      severity: "HIGH",
      driftCategories: ["runtime_degradation", "confidence_decay"]
    },
    timelineEvents: [
      {
        id: "priority-1",
        timestamp: "2026-05-22T14:06:00Z",
        priority: "CRITICAL"
      }
    ]
  };
  const grouped = groupCorrelatedEvents(fullInput);
  const correlations = detectCognitiveCorrelations(fullInput);
  const anomalyRuntime = correlations.find((correlation) => {
    return correlation.categories.includes("anomaly_runtime");
  });
  const confidenceBehavioral = correlations.find((correlation) => {
    return correlation.categories.includes("confidence_behavioral");
  });
  const strategicAnomaly = correlations.find((correlation) => {
    return correlation.categories.includes("strategic_anomaly");
  });
  const runtimeDrift = correlations.find((correlation) => {
    return correlation.categories.includes("runtime_drift");
  });
  const multiSystem = correlations.find((correlation) => {
    return correlation.categories.includes("multi_system_instability");
  });
  const insufficient = detectCognitiveCorrelations({
    anomalies: [anomaly("anomaly-alone", "2026-05-22T15:00:00Z")]
  });
  const summary = summarizeCognitiveCorrelations(correlations);

  assert.strictEqual(scoreCorrelationStrength({
    categories: ["anomaly_runtime"],
    relatedEvents: [],
    nearbyPairs: 0
  }), "INSUFFICIENT");
  assert.strictEqual(scoreCorrelationStrength({
    categories: ["anomaly_runtime"],
    relatedEvents: ["a", "b"],
    nearbyPairs: 0
  }), "WEAK");
  assert.strictEqual(scoreCorrelationStrength({
    categories: ["anomaly_runtime"],
    relatedEvents: ["a", "b"],
    nearbyPairs: 1
  }), "MODERATE");
  assert.strictEqual(scoreCorrelationStrength({
    categories: ["a", "b", "c"],
    relatedEvents: ["a", "b", "c", "d"],
    nearbyPairs: 2
  }), "STRONG");
  assert.strictEqual(grouped.length, 7);
  assert(anomalyRuntime);
  assert(["STRONG", "MODERATE"].includes(anomalyRuntime.strength));
  assert(confidenceBehavioral);
  assert(strategicAnomaly);
  assert(runtimeDrift);
  assert(multiSystem);
  assert.strictEqual(multiSystem.strength, "STRONG");
  assert.strictEqual(insufficient.length, 0);
  assert(summary.totalCorrelations >= 6);
  assert.strictEqual(summary.multiSystemInstabilityDetected, true);

  [grouped, correlations, insufficient, summary].forEach(assertNoForbiddenWords);

  console.log("\nCognitive correlations");
  console.log(JSON.stringify(correlations, null, 2));
  console.log("\nCognitive correlation summary");
  console.log(JSON.stringify(summary, null, 2));
  console.log("\nCognitive correlation test passed.");
}

run();
