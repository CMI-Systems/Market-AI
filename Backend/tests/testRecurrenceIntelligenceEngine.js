const assert = require("assert");
const {
  buildRecurrenceIntelligence
} = require("../services/recurrenceIntelligenceEngine");
const {
  buildRecurrenceIntelligenceEndpoint,
  clearLatestCognitionSnapshot,
  setLatestCognitionSnapshot
} = require("../services/cognitionSnapshotStore");

clearLatestCognitionSnapshot();

const fallback = buildRecurrenceIntelligenceEndpoint();
assert.strictEqual(fallback.recurrenceState, "UNKNOWN");
assert.strictEqual(fallback.summary, "Awaiting recurrence intelligence.");

const recurrence = buildRecurrenceIntelligence({
  memoryEntries: [
    { environment: "CAUTION", suppressionState: "SUPPRESSED", ecosystemState: "FRAGMENTED", replayState: "DRIFTING", driftState: "DEGRADING" },
    { environment: "CAUTION", suppressionState: "SUPPRESSED", ecosystemState: "FRAGMENTED", replayState: "DRIFTING", driftState: "DEGRADING" },
    { environment: "STABLE", suppressionState: "ALIGNED", ecosystemState: "SYNCHRONIZED", replayState: "STABILIZING", driftState: "STABLE" }
  ]
});
assert(["DETECTED", "STRONG"].includes(recurrence.recurrenceState));
assert(recurrence.recurrencePatterns.length >= 1);

setLatestCognitionSnapshot({ recurrenceIntelligence: recurrence });
const endpoint = buildRecurrenceIntelligenceEndpoint();
assert(Array.isArray(endpoint.recurrencePatterns));
assert.notStrictEqual(endpoint.summary, "Awaiting recurrence intelligence.");

console.log("Recurrence intelligence engine test passed.");
