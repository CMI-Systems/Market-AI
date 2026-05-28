const assert = require("assert");
const {
  clearPriorityFeed,
  evaluatePriorityCognitionFeed
} = require("../services/priorityCognitionFeed");
const {
  buildPriorityFeedEndpoint,
  clearLatestCognitionSnapshot,
  setLatestCognitionSnapshot
} = require("../services/cognitionSnapshotStore");

clearPriorityFeed();
clearLatestCognitionSnapshot();

const fallback = buildPriorityFeedEndpoint();
assert.strictEqual(fallback.feedState, "UNKNOWN");
assert.strictEqual(fallback.summary, "Awaiting cognition feed.");

const feed = evaluatePriorityCognitionFeed({
  adaptiveSignalIntelligence: { signalState: "SUPPRESSED" },
  crossBrainConsensus: { consensusState: "FAILSAFE_PRIORITY", divergenceRisk: "SEVERE" },
  temporalMemory: { temporalState: "RECURRING_PATTERN" },
  liquidityPressure: { liquidityState: "PRESSURED" },
  environmentalCausality: { causalityState: "VOLATILE_CAUSALITY" }
});

assert(["ACTIVE", "DEGRADED"].includes(feed.feedState));
assert(feed.events.length >= 4);
assert(feed.events.some((event) => event.type === "SUPPRESSION"));
assert(feed.events.every((event) => event.timestamp && event.message && event.severity));

setLatestCognitionSnapshot({ priorityFeed: feed });
const endpoint = buildPriorityFeedEndpoint();
assert(["ACTIVE", "DEGRADED"].includes(endpoint.feedState));
assert(Array.isArray(endpoint.events));
assert.notStrictEqual(endpoint.summary, "Awaiting cognition feed.");

console.log("Priority cognition feed test passed.");
