const assert = require("assert");
const {
  buildEnvironmentArchive
} = require("../services/environmentArchiveEngine");
const {
  buildEnvironmentArchiveEndpoint,
  clearLatestCognitionSnapshot,
  setLatestCognitionSnapshot
} = require("../services/cognitionSnapshotStore");

clearLatestCognitionSnapshot();

const fallback = buildEnvironmentArchiveEndpoint();
assert.strictEqual(fallback.archiveState, "UNKNOWN");
assert.strictEqual(fallback.summary, "Awaiting environment archive.");

const archive = buildEnvironmentArchive({
  memoryEntries: [
    { timestamp: "t1", environment: "CAUTION", confidenceLevel: "LOW", ecosystemState: "FRAGMENTED", replayState: "DRIFTING" },
    { timestamp: "t2", environment: "STABLE", confidenceLevel: "MODERATE", ecosystemState: "SYNCHRONIZED", replayState: "STABILIZING" },
    { timestamp: "t3", environment: "CAUTION", confidenceLevel: "LOW", ecosystemState: "FRAGMENTED", replayState: "DRIFTING" }
  ]
});
assert.strictEqual(archive.archiveState, "LIMITED");
assert(archive.environmentHistory.length === 3);
assert(archive.dominantTransitions.length >= 1);
assert(archive.recurrenceClusters.length >= 1);

setLatestCognitionSnapshot({ environmentArchive: archive });
const endpoint = buildEnvironmentArchiveEndpoint();
assert.strictEqual(endpoint.archiveState, "LIMITED");
assert.notStrictEqual(endpoint.summary, "Awaiting environment archive.");

console.log("Environment archive engine test passed.");
