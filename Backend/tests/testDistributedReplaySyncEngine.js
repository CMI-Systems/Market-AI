const assert = require("assert");
const { buildDistributedReplaySync } = require("../services/distributedReplaySyncEngine");

function run() {
  const fallback = buildDistributedReplaySync({ nodes: [] });
  assert.strictEqual(fallback.replaySyncState, "UNKNOWN");
  assert.strictEqual(fallback.summary, "Awaiting replay synchronization.");

  const synced = buildDistributedReplaySync({
    nodes: [
      { nodeId: "node-a", synchronizationState: "SYNCHRONIZED" },
      { nodeId: "node-b", synchronizationState: "SYNCHRONIZED" }
    ]
  });
  assert.strictEqual(synced.replaySyncState, "SYNCED");
  assert.strictEqual(synced.replayConsistency, "CONSISTENT");

  const partial = buildDistributedReplaySync({
    nodes: [
      { nodeId: "node-a", synchronizationState: "SYNCHRONIZED" },
      { nodeId: "node-b", synchronizationState: "PARTIAL" }
    ]
  });
  assert.strictEqual(partial.replaySyncState, "PARTIAL");
  assert.strictEqual(partial.synchronizationConflicts.length, 1);

  const conflict = buildDistributedReplaySync({
    nodes: [
      { nodeId: "node-a", synchronizationState: "CONFLICT" },
      { nodeId: "node-b", synchronizationState: "DEGRADED" }
    ]
  });
  assert.strictEqual(conflict.replaySyncState, "CONFLICT");

  console.log("Distributed replay sync engine test passed.");
}

run();
