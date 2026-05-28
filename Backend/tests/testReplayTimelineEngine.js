const assert = require("assert");
const {
  evaluateReplayTimeline
} = require("../services/replayTimelineEngine");
const {
  buildReplayTimelineEndpoint,
  clearLatestCognitionSnapshot,
  setLatestCognitionSnapshot
} = require("../services/cognitionSnapshotStore");

function record(overrides = {}) {
  return {
    timestamp: new Date().toISOString(),
    environment: "CAUTION",
    signalState: "ALIGNED",
    driftState: "STABLE",
    liquidityState: "BALANCED",
    confidenceLevel: "MODERATE",
    ...overrides
  };
}

clearLatestCognitionSnapshot();

const fallback = buildReplayTimelineEndpoint();
assert.strictEqual(fallback.replayState, "UNKNOWN");
assert.strictEqual(fallback.replaySummary, "Awaiting replay timeline.");

const timeline = evaluateReplayTimeline({
  history: [
    record({ environment: "CAUTION" }),
    record({ environment: "CAUTION", signalState: "SUPPRESSED" }),
    record({ environment: "RECOVERING", liquidityState: "STABILIZING" }),
    record({ environment: "RECOVERING", liquidityState: "STABILIZING" }),
    record({ environment: "RECOVERING", liquidityState: "STABILIZING" })
  ]
});

assert(["EVOLVING", "STABILIZING", "RECURRING"].includes(timeline.replayState));
assert(timeline.timeline.length >= 5);
assert(timeline.recurrenceSignals.length >= 1);

setLatestCognitionSnapshot({ replayTimeline: timeline });
const endpoint = buildReplayTimelineEndpoint();
assert(Array.isArray(endpoint.timeline));
assert.notStrictEqual(endpoint.replaySummary, "Awaiting replay timeline.");

console.log("Replay timeline engine test passed.");
