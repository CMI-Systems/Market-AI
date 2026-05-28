/*
 * Local diagnostic for deterministic cognitive pattern recognition.
 * It verifies recurring intelligence structures from supplied history.
 */

const assert = require("assert");
const {
  classifyPatternStrength,
  detectCognitivePatterns,
  groupRecurringPatterns,
  summarizeCognitivePatterns
} = require("../services/cognitivePatternRecognition");

const FORBIDDEN_WORDS = ["BUY", "SELL", "CALL", "PUT", "entry", "exit"];

function assertNoForbiddenWords(output) {
  const text = JSON.stringify(output);

  FORBIDDEN_WORDS.forEach((word) => {
    assert(
      !new RegExp(`\\b${word}\\b`, "i").test(text),
      `Cognitive pattern output should not contain forbidden word: ${word}`
    );
  });
}

function run() {
  const input = {
    timelineEvents: [
      {
        id: "environment-1",
        type: "environment",
        symbol: "NVDA",
        metadata: { environment: "UNSTABLE" }
      },
      {
        id: "environment-2",
        type: "environment",
        symbol: "AMD",
        metadata: { environment: "HIGH_RISK" }
      },
      {
        id: "environment-3",
        type: "environment",
        symbol: "NVDA",
        metadata: { environment: "UNSTABLE" }
      }
    ],
    strategicSnapshots: [
      {
        id: "snapshot-1",
        symbol: "NVDA",
        confidenceLevel: "LOW",
        consensusStrength: "CONFLICTED",
        runtimeStatus: "DEGRADED"
      },
      {
        id: "snapshot-2",
        symbol: "AMD",
        confidenceLevel: "AVOID",
        consensusStrength: "CONFLICTED",
        runtimeStatus: "CRITICAL"
      },
      {
        id: "snapshot-3",
        symbol: "NVDA",
        confidenceLevel: "LOW",
        consensusStrength: "CONFLICTED",
        runtimeStatus: "DEGRADED"
      }
    ],
    behavioralTimeline: [
      {
        id: "behavior-1",
        symbol: "NVDA",
        mood: "OVERACTIVE",
        tags: ["patience"]
      },
      {
        id: "behavior-2",
        symbol: "NVDA",
        mood: "UNCERTAIN",
        tags: ["uncertainty"]
      },
      {
        id: "behavior-3",
        symbol: "AMD",
        behavioralState: "UNSTABLE",
        riskLevel: "HIGH",
        tags: ["risk-control"]
      }
    ],
    anomalyEvents: [
      {
        id: "anomaly-1",
        symbol: "NVDA",
        severity: "HIGH",
        anomalyTypes: ["HIGH_VOLATILITY_REVERSAL"]
      },
      {
        id: "anomaly-2",
        symbol: "NVDA",
        severity: "MEDIUM",
        anomalyTypes: ["GROUP_CONTEXT_CONFLICT"]
      },
      {
        id: "anomaly-3",
        symbol: "AMD",
        severity: "HIGH",
        metadata: { anomalyTypes: ["SYSTEM_FAILSAFE_ACTIVE"] }
      }
    ],
    prioritizedInsights: [
      {
        id: "priority-1",
        symbol: "NVDA",
        priority: "CRITICAL"
      },
      {
        id: "priority-2",
        symbol: "AMD",
        priority: "HIGH"
      },
      {
        id: "priority-3",
        symbol: "SPY",
        priority: "LOW"
      }
    ]
  };

  const grouped = groupRecurringPatterns(input);
  const patterns = detectCognitivePatterns(input);
  const summary = summarizeCognitivePatterns(patterns);
  const anomalyPattern = patterns.find((pattern) => pattern.patternId === "anomaly-cluster");
  const behaviorPattern = patterns.find((pattern) => pattern.patternId === "behavioral-instability");
  const environmentPattern = patterns.find((pattern) => pattern.patternId === "unstable-environment");
  const highPriorityPattern = patterns.find((pattern) => pattern.patternId === "high-priority-insights");

  assert.strictEqual(classifyPatternStrength(0), "INSUFFICIENT");
  assert.strictEqual(classifyPatternStrength(1), "WEAK");
  assert.strictEqual(classifyPatternStrength(2), "MODERATE");
  assert.strictEqual(classifyPatternStrength(3), "STRONG");
  assert.strictEqual(grouped.length, 7);
  assert.strictEqual(anomalyPattern.strength, "STRONG");
  assert.strictEqual(behaviorPattern.strength, "STRONG");
  assert.strictEqual(environmentPattern.strength, "STRONG");
  assert.strictEqual(highPriorityPattern.strength, "MODERATE");
  assert(summary.strongestCategories.includes("anomaly"));
  assert(summary.recurringSymbols.includes("NVDA"));
  assert(summary.totalPatterns >= 6);

  [grouped, patterns, summary].forEach(assertNoForbiddenWords);

  console.log("\nCognitive patterns");
  console.log(JSON.stringify(patterns, null, 2));
  console.log("\nCognitive pattern summary");
  console.log(JSON.stringify(summary, null, 2));
  console.log("\nCognitive pattern recognition test passed.");
}

run();
