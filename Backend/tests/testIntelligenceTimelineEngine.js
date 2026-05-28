/*
 * Local diagnostic for the unified intelligence timeline engine.
 * It merges supplied event groups into one deterministic chronology.
 */

const assert = require("assert");
const {
  buildIntelligenceTimeline,
  filterTimelineEvents,
  mergeTimelineEvents,
  summarizeIntelligenceTimeline
} = require("../services/intelligenceTimelineEngine");

const FORBIDDEN_WORDS = ["BUY", "SELL", "CALL", "PUT", "entry", "exit"];

function assertNoForbiddenWords(output) {
  const text = JSON.stringify(output);

  FORBIDDEN_WORDS.forEach((word) => {
    assert(
      !new RegExp(`\\b${word}\\b`, "i").test(text),
      `Intelligence timeline output should not contain forbidden word: ${word}`
    );
  });
}

function run() {
  const input = {
    snapshots: [
      {
        id: "snapshot-1",
        timestamp: "2026-05-22T14:30:00.000Z",
        symbol: "NVDA",
        anomalySeverity: "NONE",
        strategicEnvironment: "OPTIMAL",
        consensusStrength: "STRONG",
        runtimeStatus: "HEALTHY",
        summary: "NVDA strategic snapshot is stable."
      }
    ],
    journals: [
      {
        id: "journal-1",
        savedAt: "2026-05-22T14:31:00.000Z",
        symbol: "NVDA",
        mood: "CAUTIOUS",
        tags: ["discipline"],
        summary: "NVDA reflection remains cautious."
      }
    ],
    behavioralTimeline: [
      {
        id: "behavior-1",
        timestamp: "2026-05-22T14:32:00.000Z",
        symbol: "AMD",
        mood: "OVERACTIVE",
        tags: ["patience"],
        summary: "AMD behavioral review shows elevated activity."
      }
    ],
    anomalyEvents: [
      {
        id: "anomaly-1",
        timestamp: "2026-05-22T14:35:00.000Z",
        symbol: "SPY",
        severity: "HIGH",
        summary: "SPY anomaly context is elevated.",
        metadata: {
          anomalyTypes: ["HIGH_VOLATILITY_REVERSAL"]
        }
      }
    ],
    runtimeEvents: [
      {
        id: "runtime-1",
        timestamp: "2026-05-22T14:34:00.000Z",
        symbol: "SYSTEM",
        severity: "MEDIUM",
        summary: "Runtime health is degraded.",
        metadata: {
          status: "DEGRADED"
        }
      }
    ],
    environmentEvents: [
      {
        id: "environment-1",
        timestamp: "2026-05-22T14:33:00.000Z",
        symbol: "QQQ",
        environment: "CAUTION",
        stability: "LOW",
        summary: "QQQ strategic environment warrants caution."
      }
    ]
  };

  const merged = mergeTimelineEvents(input);
  const anomalyOnly = filterTimelineEvents(merged, {
    type: "anomaly"
  });
  const nvdaOnly = filterTimelineEvents(merged, {
    symbol: "NVDA"
  });
  const highSeverity = filterTimelineEvents(merged, {
    severity: "HIGH",
    limit: 1
  });
  const summary = summarizeIntelligenceTimeline(merged);
  const built = buildIntelligenceTimeline(input);
  const empty = buildIntelligenceTimeline({});

  assert.strictEqual(merged.length, 6);
  assert.strictEqual(merged[0].id, "anomaly-1");
  assert.strictEqual(merged[5].id, "snapshot-1");
  assert.strictEqual(anomalyOnly.length, 1);
  assert.strictEqual(nvdaOnly.length, 2);
  assert.strictEqual(highSeverity.length, 1);
  assert.strictEqual(summary.totalEvents, 6);
  assert.strictEqual(summary.severityDistribution.HIGH, 1);
  assert.strictEqual(summary.symbols.NVDA, 2);
  assert.strictEqual(built.timeline.length, 6);
  assert.strictEqual(empty.timeline.length, 0);
  assert.strictEqual(empty.summary.totalEvents, 0);

  [
    merged,
    anomalyOnly,
    nvdaOnly,
    highSeverity,
    summary,
    built,
    empty
  ].forEach(assertNoForbiddenWords);

  console.log("\nUnified intelligence timeline");
  console.log(JSON.stringify(merged, null, 2));
  console.log("\nUnified intelligence timeline summary");
  console.log(JSON.stringify(summary, null, 2));
  console.log("\nIntelligence timeline engine test passed.");
}

run();
