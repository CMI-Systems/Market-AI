/*
 * Local diagnostic for deterministic cognitive state transitions.
 * It compares supplied strategic, runtime, and behavioral state history.
 */

const assert = require("assert");
const {
  classifyTransitionSeverity,
  compareStrategicStates,
  detectStateTransitions,
  summarizeStateTransitions
} = require("../services/cognitiveStateTransitions");

const FORBIDDEN_WORDS = ["BUY", "SELL", "CALL", "PUT", "entry", "exit"];

function assertNoForbiddenWords(output) {
  const text = JSON.stringify(output);

  FORBIDDEN_WORDS.forEach((word) => {
    assert(
      !new RegExp(`\\b${word}\\b`, "i").test(text),
      `Cognitive state transition output should not contain forbidden word: ${word}`
    );
  });
}

function snapshot(timestamp, overrides = {}) {
  return {
    timestamp,
    strategicEnvironment: "FAVORABLE",
    runtimeStatus: "HEALTHY",
    confidenceLevel: "HIGH",
    behavioralState: "DISCIPLINED",
    anomalySeverity: "NONE",
    consensusStrength: "STRONG",
    ...overrides
  };
}

function runtime(timestamp, status) {
  return {
    timestamp,
    metadata: {
      status
    }
  };
}

function behavior(timestamp, behavioralState) {
  return {
    timestamp,
    behavioralState
  };
}

function run() {
  const unstable = detectStateTransitions({
    strategicSnapshots: [
      snapshot("2026-05-22T14:00:00Z", {
        strategicEnvironment: "OPTIMAL"
      }),
      snapshot("2026-05-22T14:02:00Z", {
        strategicEnvironment: "UNSTABLE"
      })
    ]
  });
  const caution = compareStrategicStates([
    snapshot("2026-05-22T14:00:00Z"),
    snapshot("2026-05-22T14:01:00Z", {
      strategicEnvironment: "CAUTION"
    })
  ]);
  const runtimeDegradation = detectStateTransitions({
    runtimeEvents: [
      runtime("2026-05-22T14:00:00Z", "HEALTHY"),
      runtime("2026-05-22T14:03:00Z", "DEGRADED")
    ]
  });
  const behavioralDeterioration = detectStateTransitions({
    behavioralTimeline: [
      behavior("2026-05-22T14:00:00Z", "DISCIPLINED"),
      behavior("2026-05-22T14:04:00Z", "UNSTABLE")
    ]
  });
  const fragmentedConsensus = detectStateTransitions({
    strategicSnapshots: [
      snapshot("2026-05-22T14:00:00Z"),
      snapshot("2026-05-22T14:05:00Z", {
        consensusStrength: "CONFLICTED"
      })
    ]
  });
  const anomalyShift = detectStateTransitions({
    timelineEvents: [
      {
        type: "anomaly",
        timestamp: "2026-05-22T14:00:00Z",
        severity: "NONE"
      },
      {
        type: "anomaly",
        timestamp: "2026-05-22T14:06:00Z",
        severity: "HIGH"
      }
    ]
  });
  const ordered = detectStateTransitions({
    strategicSnapshots: [
      snapshot("2026-05-22T14:00:00Z"),
      snapshot("2026-05-22T14:01:00Z", {
        confidenceLevel: "LOW"
      }),
      snapshot("2026-05-22T14:07:00Z", {
        confidenceLevel: "AVOID",
        consensusStrength: "CONFLICTED"
      })
    ],
    prioritizedInsights: [
      {
        timestamp: "2026-05-22T14:08:00Z",
        metadata: {
          strategicEnvironment: "HIGH_RISK"
        }
      }
    ]
  });
  const summary = summarizeStateTransitions([
    ...unstable,
    ...runtimeDegradation,
    ...behavioralDeterioration,
    ...fragmentedConsensus,
    ...anomalyShift
  ]);

  assert.strictEqual(classifyTransitionSeverity({
    category: "strategic_environment",
    toState: "HIGH_RISK"
  }), "HIGH");
  assert.strictEqual(classifyTransitionSeverity({
    category: "runtime_health",
    toState: "DEGRADED"
  }), "MODERATE");
  assert.strictEqual(classifyTransitionSeverity({
    category: "confidence_structure",
    toState: "MODERATE"
  }), "LOW");
  assert(unstable.some((transition) => {
    return transition.category === "strategic_environment" &&
      transition.fromState === "OPTIMAL" &&
      transition.toState === "UNSTABLE" &&
      transition.severity === "HIGH";
  }));
  assert.strictEqual(caution[0].severity, "MODERATE");
  assert(runtimeDegradation.some((transition) => {
    return transition.category === "runtime_health" &&
      transition.toState === "DEGRADED";
  }));
  assert(behavioralDeterioration.some((transition) => {
    return transition.category === "behavioral_state" &&
      transition.toState === "UNSTABLE";
  }));
  assert(fragmentedConsensus.some((transition) => {
    return transition.category === "consensus_state" &&
      transition.toState === "CONFLICTED";
  }));
  assert(anomalyShift.some((transition) => {
    return transition.category === "anomaly_state" &&
      transition.severity === "HIGH";
  }));
  assert(ordered.length > 1);
  assert(new Date(ordered[0].timestamp).getTime() >= new Date(ordered[1].timestamp).getTime());
  assert.strictEqual(summary.totalTransitions, 5);
  assert(summary.highSeverityTransitions >= 4);

  [
    unstable,
    caution,
    runtimeDegradation,
    behavioralDeterioration,
    fragmentedConsensus,
    anomalyShift,
    ordered,
    summary
  ].forEach(assertNoForbiddenWords);

  console.log("\nCognitive state transitions");
  console.log(JSON.stringify(ordered, null, 2));
  console.log("\nCognitive state transition summary");
  console.log(JSON.stringify(summary, null, 2));
  console.log("\nCognitive state transitions test passed.");
}

run();
