/*
 * Local diagnostic for deterministic cognitive drift detection.
 * It compares older and newer supplied history across several systems.
 */

const assert = require("assert");
const {
  classifyDriftSeverity,
  compareTimelineStates,
  detectCognitiveDrift,
  summarizeCognitiveDrift
} = require("../services/cognitiveDriftDetection");

const FORBIDDEN_WORDS = ["BUY", "SELL", "CALL", "PUT", "entry", "exit"];

function assertNoForbiddenWords(output) {
  const text = JSON.stringify(output);

  FORBIDDEN_WORDS.forEach((word) => {
    assert(
      !new RegExp(`\\b${word}\\b`, "i").test(text),
      `Cognitive drift output should not contain forbidden word: ${word}`
    );
  });
}

function snapshot(timestamp, overrides = {}) {
  return {
    timestamp,
    confidenceLevel: "HIGH",
    consensusStrength: "STRONG",
    runtimeStatus: "HEALTHY",
    strategicEnvironment: "OPTIMAL",
    ...overrides
  };
}

function behavior(timestamp, overrides = {}) {
  return {
    timestamp,
    mood: "FOCUSED",
    riskLevel: "LOW",
    ...overrides
  };
}

function anomaly(timestamp, severity = "NONE") {
  return {
    timestamp,
    severity
  };
}

function runtime(timestamp, status = "STABLE") {
  return {
    timestamp,
    metadata: {
      status
    }
  };
}

function environment(timestamp, environmentState = "FAVORABLE") {
  return {
    type: "environment",
    timestamp,
    metadata: {
      environment: environmentState
    }
  };
}

function run() {
  const stable = detectCognitiveDrift({
    strategicSnapshots: [
      snapshot("2026-05-22T14:00:00Z"),
      snapshot("2026-05-22T14:01:00Z"),
      snapshot("2026-05-22T14:02:00Z"),
      snapshot("2026-05-22T14:03:00Z")
    ],
    behavioralTimeline: [
      behavior("2026-05-22T14:00:00Z"),
      behavior("2026-05-22T14:01:00Z"),
      behavior("2026-05-22T14:02:00Z"),
      behavior("2026-05-22T14:03:00Z")
    ],
    anomalyEvents: [
      anomaly("2026-05-22T14:00:00Z"),
      anomaly("2026-05-22T14:01:00Z"),
      anomaly("2026-05-22T14:02:00Z"),
      anomaly("2026-05-22T14:03:00Z")
    ]
  });
  const confidenceDecay = detectCognitiveDrift({
    strategicSnapshots: [
      snapshot("2026-05-22T14:00:00Z"),
      snapshot("2026-05-22T14:01:00Z"),
      snapshot("2026-05-22T14:02:00Z", { confidenceLevel: "LOW" }),
      snapshot("2026-05-22T14:03:00Z", { confidenceLevel: "AVOID" })
    ]
  });
  const behavioralEscalation = detectCognitiveDrift({
    behavioralTimeline: [
      behavior("2026-05-22T14:00:00Z"),
      behavior("2026-05-22T14:01:00Z"),
      behavior("2026-05-22T14:02:00Z", { mood: "OVERACTIVE" }),
      behavior("2026-05-22T14:03:00Z", {
        behavioralState: "UNSTABLE",
        riskLevel: "HIGH"
      })
    ]
  });
  const anomalyEscalation = detectCognitiveDrift({
    anomalyEvents: [
      anomaly("2026-05-22T14:00:00Z", "NONE"),
      anomaly("2026-05-22T14:01:00Z", "LOW"),
      anomaly("2026-05-22T14:02:00Z", "MEDIUM"),
      anomaly("2026-05-22T14:03:00Z", "HIGH")
    ]
  });
  const runtimeDegradation = detectCognitiveDrift({
    runtimeEvents: [
      runtime("2026-05-22T14:00:00Z"),
      runtime("2026-05-22T14:01:00Z"),
      runtime("2026-05-22T14:02:00Z", "DEGRADED"),
      runtime("2026-05-22T14:03:00Z", "CRITICAL")
    ]
  });
  const fragmentedConsensus = detectCognitiveDrift({
    strategicSnapshots: [
      snapshot("2026-05-22T14:00:00Z"),
      snapshot("2026-05-22T14:01:00Z"),
      snapshot("2026-05-22T14:02:00Z", { consensusStrength: "CONFLICTED" }),
      snapshot("2026-05-22T14:03:00Z", { consensusStrength: "CONFLICTED" })
    ],
    timelineEvents: [
      environment("2026-05-22T14:00:00Z"),
      environment("2026-05-22T14:01:00Z"),
      environment("2026-05-22T14:02:00Z", "UNSTABLE"),
      environment("2026-05-22T14:03:00Z", "HIGH_RISK")
    ]
  });
  const combined = detectCognitiveDrift({
    strategicSnapshots: [
      snapshot("2026-05-22T14:00:00Z"),
      snapshot("2026-05-22T14:01:00Z"),
      snapshot("2026-05-22T14:02:00Z", {
        confidenceLevel: "LOW",
        consensusStrength: "CONFLICTED",
        runtimeStatus: "DEGRADED",
        strategicEnvironment: "UNSTABLE"
      }),
      snapshot("2026-05-22T14:03:00Z", {
        confidenceLevel: "AVOID",
        consensusStrength: "CONFLICTED",
        runtimeStatus: "CRITICAL",
        strategicEnvironment: "HIGH_RISK"
      })
    ],
    anomalyEvents: [
      anomaly("2026-05-22T14:00:00Z"),
      anomaly("2026-05-22T14:01:00Z"),
      anomaly("2026-05-22T14:02:00Z", "MEDIUM"),
      anomaly("2026-05-22T14:03:00Z", "HIGH")
    ],
    behavioralTimeline: [
      behavior("2026-05-22T14:00:00Z"),
      behavior("2026-05-22T14:01:00Z"),
      behavior("2026-05-22T14:02:00Z", { mood: "CAUTIOUS" }),
      behavior("2026-05-22T14:03:00Z", { mood: "OVERACTIVE" })
    ]
  });
  const comparisons = compareTimelineStates({
    strategicSnapshots: [
      snapshot("2026-05-22T14:00:00Z"),
      snapshot("2026-05-22T14:01:00Z"),
      snapshot("2026-05-22T14:02:00Z", { confidenceLevel: "LOW" }),
      snapshot("2026-05-22T14:03:00Z", { confidenceLevel: "AVOID" })
    ]
  });
  const combinedSummary = summarizeCognitiveDrift(combined);

  assert.strictEqual(classifyDriftSeverity([]), "NONE");
  assert.strictEqual(classifyDriftSeverity(["confidence_decay"]), "LOW");
  assert.strictEqual(classifyDriftSeverity(["confidence_decay", "runtime_degradation"]), "MODERATE");
  assert.strictEqual(classifyDriftSeverity(["a", "b", "c"]), "HIGH");
  assert.strictEqual(stable.driftDetected, false);
  assert(confidenceDecay.driftCategories.includes("confidence_decay"));
  assert(behavioralEscalation.driftCategories.includes("behavioral_instability"));
  assert(anomalyEscalation.driftCategories.includes("anomaly_escalation"));
  assert(runtimeDegradation.driftCategories.includes("runtime_degradation"));
  assert(fragmentedConsensus.driftCategories.includes("fragmented_consensus"));
  assert(fragmentedConsensus.driftCategories.includes("strategic_environment_deterioration"));
  assert.strictEqual(combined.severity, "HIGH");
  assert.strictEqual(comparisons.confidence_decay.newerCount, 2);
  assert.strictEqual(combinedSummary.dominantDrift, "confidence_decay");

  [
    stable,
    confidenceDecay,
    behavioralEscalation,
    anomalyEscalation,
    runtimeDegradation,
    fragmentedConsensus,
    combined,
    comparisons,
    combinedSummary
  ].forEach(assertNoForbiddenWords);

  console.log("\nCombined cognitive drift");
  console.log(JSON.stringify(combined, null, 2));
  console.log("\nCognitive drift summary");
  console.log(JSON.stringify(combinedSummary, null, 2));
  console.log("\nCognitive drift detection test passed.");
}

run();
