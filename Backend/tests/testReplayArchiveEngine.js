const assert = require("assert");
const {
  buildReplayArchive
} = require("../services/replayArchiveEngine");
const {
  buildReplayArchiveEndpoint,
  clearLatestCognitionSnapshot,
  setLatestCognitionSnapshot
} = require("../services/cognitionSnapshotStore");

clearLatestCognitionSnapshot();

const fallback = buildReplayArchiveEndpoint();
assert.strictEqual(fallback.replayArchiveState, "UNKNOWN");
assert.strictEqual(fallback.summary, "Awaiting replay archive.");

const archive = buildReplayArchive({
  memoryEntries: [
    { timestamp: "t1", symbol: "NVDA", replayState: "DRIFTING", confidenceLevel: "LOW" },
    { timestamp: "t2", symbol: "AMD", replayState: "STABILIZING", confidenceLevel: "MODERATE" },
    { timestamp: "t3", symbol: "MSFT", replayState: "DRIFTING", confidenceLevel: "LOW" }
  ]
});
assert.strictEqual(archive.replayArchiveState, "ACTIVE");
assert(archive.replaySnapshots.length >= 3);
assert(archive.replayIndex.length >= 1);

setLatestCognitionSnapshot({ replayArchive: archive });
const endpoint = buildReplayArchiveEndpoint();
assert(Array.isArray(endpoint.replaySnapshots));
assert.notStrictEqual(endpoint.summary, "Awaiting replay archive.");

console.log("Replay archive engine test passed.");
