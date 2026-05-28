/*
 * Local diagnostic for adaptive insight prioritization.
 * It checks review-focus scoring over supplied timeline observations.
 */

const assert = require("assert");
const {
  prioritizeInsights,
  scoreInsightPriority
} = require("../services/adaptiveInsightPrioritization");

const FORBIDDEN_WORDS = ["BUY", "SELL", "CALL", "PUT", "entry", "exit"];

function context(overrides = {}) {
  return {
    strategicEnvironment: {
      environment: "FAVORABLE",
      stability: "MODERATE"
    },
    anomalyIntelligence: {
      severity: "NONE"
    },
    runtimeHealth: {
      status: "STABLE"
    },
    intelligenceConsensus: {
      consensusStrength: "MODERATE",
      conflictingSystems: []
    },
    adaptiveMemoryScore: {
      importance: "MEDIUM"
    },
    behavioralIntelligence: {
      behavioralState: "DISCIPLINED",
      riskLevel: "LOW"
    },
    ...overrides
  };
}

function assertNoForbiddenWords(output) {
  const text = JSON.stringify(output);

  FORBIDDEN_WORDS.forEach((word) => {
    assert(
      !new RegExp(`\\b${word}\\b`, "i").test(text),
      `Adaptive insight output should not contain forbidden word: ${word}`
    );
  });
}

function run() {
  const criticalEvent = {
    id: "anomaly-critical",
    type: "anomaly",
    timestamp: "2026-05-22T14:35:00.000Z",
    severity: "HIGH",
    summary: "High-severity anomaly context is present.",
    metadata: {}
  };
  const unstableEnvironmentEvent = {
    id: "environment-unstable",
    type: "environment",
    timestamp: "2026-05-22T14:34:00.000Z",
    severity: "MEDIUM",
    summary: "Strategic environment is unstable.",
    metadata: {
      environment: "UNSTABLE",
      stability: "FRAGMENTED"
    }
  };
  const mediumReviewEvent = {
    id: "snapshot-review",
    type: "snapshot",
    timestamp: "2026-05-22T14:33:00.000Z",
    severity: "LOW",
    summary: "Snapshot context remains useful for review.",
    metadata: {
      strategicEnvironment: "CAUTION"
    }
  };
  const backgroundNoiseEvent = {
    id: "journal-background",
    type: "journal",
    timestamp: "2026-05-22T14:32:00.000Z",
    severity: "NONE",
    summary: "Routine reflection context is available.",
    metadata: {
      mood: "FOCUSED"
    }
  };

  const critical = scoreInsightPriority({
    ...context({
      anomalyIntelligence: { severity: "HIGH" },
      runtimeHealth: { status: "CRITICAL" },
      intelligenceConsensus: {
        consensusStrength: "CONFLICTED",
        conflictingSystems: ["runtimeHealth", "anomalyIntelligence", "failsafeBrain"]
      }
    }),
    event: criticalEvent
  });
  const high = scoreInsightPriority({
    ...context({
      strategicEnvironment: {
        environment: "UNSTABLE",
        stability: "FRAGMENTED"
      },
      adaptiveMemoryScore: {
        importance: "HIGH"
      },
      behavioralIntelligence: {
        behavioralState: "UNSTABLE",
        riskLevel: "HIGH"
      }
    }),
    event: unstableEnvironmentEvent
  });
  const medium = scoreInsightPriority({
    ...context(),
    event: mediumReviewEvent
  });
  const background = scoreInsightPriority({
    ...context({
      adaptiveMemoryScore: { importance: "IGNORE" }
    }),
    event: backgroundNoiseEvent
  });
  const prioritized = prioritizeInsights({
    ...context({
      anomalyIntelligence: { severity: "HIGH" },
      runtimeHealth: { status: "CRITICAL" },
      intelligenceConsensus: {
        consensusStrength: "CONFLICTED",
        conflictingSystems: ["runtimeHealth", "anomalyIntelligence", "failsafeBrain"]
      }
    }),
    timelineEvents: [
      backgroundNoiseEvent,
      mediumReviewEvent,
      unstableEnvironmentEvent,
      criticalEvent
    ]
  });

  assert.strictEqual(critical.priority, "CRITICAL");
  assert(["HIGH", "CRITICAL"].includes(high.priority));
  assert(["MEDIUM", "LOW"].includes(medium.priority));
  assert(["LOW", "BACKGROUND"].includes(background.priority));
  assert.strictEqual(prioritized[0].id, "anomaly-critical");
  assert(prioritized[0].priorityScore >= prioritized[1].priorityScore);
  assert(prioritized[3].priorityScore <= prioritized[2].priorityScore);

  [
    critical,
    high,
    medium,
    background,
    prioritized
  ].forEach(assertNoForbiddenWords);

  console.log("\nPrioritized insights");
  console.log(JSON.stringify(prioritized, null, 2));
  console.log("\nAdaptive insight prioritization test passed.");
}

run();
