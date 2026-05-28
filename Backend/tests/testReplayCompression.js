/*
 * Local diagnostic for replay intelligence compression.
 * It keeps important replay events and compresses repetitive background noise.
 */

const assert = require("assert");
const {
  classifyCompressionQuality,
  compressReplayFrames,
  compressReplayTimeline,
  summarizeCompressedReplay
} = require("../services/replayCompression");

const FORBIDDEN_WORDS = ["BUY", "SELL", "CALL", "PUT", "entry", "exit"];

function assertNoForbiddenWords(output) {
  const text = JSON.stringify(output);

  FORBIDDEN_WORDS.forEach((word) => {
    assert(
      !new RegExp(`\\b${word}\\b`, "i").test(text),
      `Replay compression output should not contain forbidden word: ${word}`
    );
  });
}

function backgroundFrame(index) {
  return {
    frameId: `background-${index}`,
    timestamp: `2026-05-22T14:0${index}:00.000Z`,
    symbol: "NVDA",
    environment: "FAVORABLE",
    anomalySeverity: "NONE",
    runtimeStatus: "HEALTHY",
    behavioralState: "DISCIPLINED",
    transitionSeverity: "UNKNOWN",
    summary: "NVDA replay context remains stable.",
    visualTags: ["stable"]
  };
}

function run() {
  const replayFrames = [
    backgroundFrame(0),
    backgroundFrame(1),
    backgroundFrame(2),
    backgroundFrame(3),
    {
      frameId: "high-risk-1",
      timestamp: "2026-05-22T14:04:00.000Z",
      symbol: "NVDA",
      environment: "HIGH_RISK",
      anomalySeverity: "HIGH",
      runtimeStatus: "CRITICAL",
      behavioralState: "UNSTABLE",
      summary: "NVDA high-risk strategic replay context.",
      visualTags: ["high-risk", "anomaly", "runtime", "behavioral"]
    },
    {
      frameId: "transition-1",
      timestamp: "2026-05-22T14:05:00.000Z",
      symbol: "SYSTEM",
      transitionSeverity: "HIGH",
      summary: "High-severity strategic transition is available.",
      visualTags: ["transition"]
    }
  ];
  const timelineEvents = [
    {
      id: "timeline-anomaly-1",
      type: "anomaly",
      timestamp: "2026-05-22T14:06:00.000Z",
      symbol: "SPY",
      severity: "HIGH",
      summary: "SPY anomaly context is elevated."
    }
  ];
  const strategicSnapshots = [
    {
      id: "snapshot-1",
      timestamp: "2026-05-22T14:07:00.000Z",
      symbol: "AMD",
      strategicEnvironment: "UNSTABLE",
      anomalySeverity: "MEDIUM",
      runtimeStatus: "DEGRADED",
      summary: "AMD strategic snapshot is unstable."
    }
  ];
  const journalEvents = [
    {
      id: "journal-1",
      timestamp: "2026-05-22T14:08:00.000Z",
      symbol: "NVDA",
      mood: "FOCUSED",
      summary: "NVDA journal context is routine."
    },
    {
      id: "journal-2",
      timestamp: "2026-05-22T14:09:00.000Z",
      symbol: "NVDA",
      mood: "FOCUSED",
      summary: "NVDA journal context is routine."
    }
  ];
  const behavioralTimeline = [
    {
      id: "behavior-1",
      timestamp: "2026-05-22T14:10:00.000Z",
      symbol: "NVDA",
      mood: "OVERACTIVE",
      summary: "NVDA behavioral context is elevated."
    }
  ];
  const anomalyEvents = [
    {
      id: "anomaly-2",
      timestamp: "2026-05-22T14:11:00.000Z",
      symbol: "QQQ",
      severity: "MEDIUM",
      summary: "QQQ anomaly context is notable."
    }
  ];

  const compressed = compressReplayTimeline({
    replayFrames,
    timelineEvents,
    strategicSnapshots,
    journalEvents,
    anomalyEvents,
    behavioralTimeline
  });
  const frameOnlyCompression = compressReplayFrames(replayFrames);
  const compressedSummary = summarizeCompressedReplay(compressed);
  const emptyCompression = compressReplayTimeline({});

  assert(compressed.compressedEvents.some((event) => event.id === "high-risk-1"));
  assert(compressed.compressedEvents.some((event) => event.id === "transition-1"));
  assert(compressed.compressedEvents.some((event) => event.id === "timeline-anomaly-1"));
  assert(compressed.compressedEvents.some((event) => event.id === "behavior-1"));
  assert(compressed.compressedEvents.some((event) => event.id === "snapshot-1"));
  assert(compressed.removedNoiseCount > 0);
  assert(compressed.compressionRatio > 0 && compressed.compressionRatio <= 1);
  assert(compressed.retainedHighlights.includes("high-risk-1"));
  assert(frameOnlyCompression.removedNoiseCount >= 3);
  assert(["HIGH", "MODERATE", "LOW"].includes(compressed.quality));
  assert.strictEqual(classifyCompressionQuality({
    compressionRatio: 0,
    retainedCount: 0,
    originalCount: 0
  }), "INSUFFICIENT");
  assert.strictEqual(emptyCompression.quality, "INSUFFICIENT");
  assert(compressedSummary.summary.includes("retained"));

  [
    compressed,
    frameOnlyCompression,
    compressedSummary,
    emptyCompression
  ].forEach(assertNoForbiddenWords);

  console.log("\nCompressed replay");
  console.log(JSON.stringify(compressed, null, 2));
  console.log("\nReplay compression summary");
  console.log(JSON.stringify(compressedSummary, null, 2));
  console.log("\nReplay compression test passed.");
}

run();
