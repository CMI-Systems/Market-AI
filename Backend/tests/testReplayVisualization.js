/*
 * Local diagnostic for replay visualization frame preparation.
 * It builds backend-only frames for future dashboards without creating UI.
 */

const assert = require("assert");
const {
  buildReplayFrame,
  buildReplayFrames,
  filterReplayFrames,
  summarizeReplayFrames
} = require("../services/replayVisualization");

const FORBIDDEN_WORDS = ["BUY", "SELL", "CALL", "PUT", "entry", "exit"];

function assertNoForbiddenWords(output) {
  const text = JSON.stringify(output);

  FORBIDDEN_WORDS.forEach((word) => {
    assert(
      !new RegExp(`\\b${word}\\b`, "i").test(text),
      `Replay visualization output should not contain forbidden word: ${word}`
    );
  });
}

function run() {
  const snapshots = [
    {
      id: "snapshot-1",
      timestamp: "2026-05-22T14:00:00.000Z",
      symbol: "NVDA",
      strategicEnvironment: "OPTIMAL",
      confidenceLevel: "HIGH",
      anomalySeverity: "NONE",
      runtimeStatus: "HEALTHY",
      behavioralState: "DISCIPLINED",
      summary: "NVDA strategic environment is stable."
    },
    {
      id: "snapshot-2",
      timestamp: "2026-05-22T14:05:00.000Z",
      symbol: "NVDA",
      strategicEnvironment: "HIGH_RISK",
      confidenceLevel: "AVOID",
      anomalySeverity: "HIGH",
      runtimeStatus: "CRITICAL",
      behavioralState: "UNSTABLE",
      summary: "NVDA strategic environment is high risk."
    }
  ];
  const timelineEvents = [
    {
      id: "environment-1",
      type: "environment",
      timestamp: "2026-05-22T14:02:00.000Z",
      symbol: "AMD",
      severity: "LOW",
      summary: "AMD environment warrants caution.",
      metadata: {
        environment: "CAUTION",
        stability: "LOW"
      }
    }
  ];
  const transitions = [
    {
      transitionId: "transition-1",
      timestamp: "2026-05-22T14:04:00.000Z",
      category: "strategic_environment",
      fromState: "FAVORABLE",
      toState: "HIGH_RISK",
      severity: "HIGH",
      summary: "HIGH strategic environment transition from FAVORABLE to HIGH_RISK."
    }
  ];
  const anomalyEvents = [
    {
      id: "anomaly-1",
      timestamp: "2026-05-22T14:03:00.000Z",
      symbol: "SPY",
      severity: "HIGH",
      summary: "SPY anomaly context is elevated."
    }
  ];
  const behavioralTimeline = [
    {
      id: "behavior-1",
      timestamp: "2026-05-22T14:01:00.000Z",
      symbol: "NVDA",
      mood: "CAUTIOUS",
      summary: "NVDA behavioral review is cautious."
    }
  ];
  const runtimeEvents = [
    {
      id: "runtime-1",
      timestamp: "2026-05-22T14:06:00.000Z",
      symbol: "SYSTEM",
      status: "DEGRADED",
      summary: "Runtime health is degraded."
    }
  ];

  const singleFrame = buildReplayFrame({
    id: "manual-frame",
    timestamp: "2026-05-22T13:59:00.000Z",
    symbol: "QQQ",
    environment: "CAUTION",
    confidenceLevel: "LOW"
  });
  const frames = buildReplayFrames({
    snapshots,
    timelineEvents,
    transitions,
    anomalyEvents,
    behavioralTimeline,
    runtimeEvents
  });
  const cautionFrames = filterReplayFrames(frames, {
    visualTag: "caution"
  });
  const nvdaFrames = filterReplayFrames(frames, {
    symbol: "NVDA"
  });
  const highRiskFrames = filterReplayFrames(frames, {
    environment: "HIGH_RISK",
    limit: 2
  });
  const summary = summarizeReplayFrames(frames);
  const emptySummary = summarizeReplayFrames([]);

  assert(singleFrame.visualTags.includes("caution"));
  assert(singleFrame.visualTags.includes("confidence"));
  assert.strictEqual(frames.length, 7);
  assert.strictEqual(frames[0].frameId, "snapshot-1");
  assert.strictEqual(frames[frames.length - 1].frameId, "runtime-1");
  assert(cautionFrames.length >= 1);
  assert.strictEqual(nvdaFrames.length, 3);
  assert.strictEqual(highRiskFrames.length, 2);
  assert(summary.totalFrames === 7);
  assert(summary.visualTags["high-risk"] >= 2);
  assert(summary.visualTags.anomaly >= 2);
  assert(summary.visualTags.transition >= 1);
  assert.strictEqual(emptySummary.totalFrames, 0);

  [
    singleFrame,
    frames,
    cautionFrames,
    nvdaFrames,
    highRiskFrames,
    summary,
    emptySummary
  ].forEach(assertNoForbiddenWords);

  console.log("\nReplay visualization frames");
  console.log(JSON.stringify(frames, null, 2));
  console.log("\nReplay visualization summary");
  console.log(JSON.stringify(summary, null, 2));
  console.log("\nReplay visualization test passed.");
}

run();
