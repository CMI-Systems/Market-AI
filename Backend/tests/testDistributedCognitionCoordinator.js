const assert = require("assert");
const { buildDistributedCoordinator } = require("../services/distributedCognitionCoordinator");

function run() {
  const fallback = buildDistributedCoordinator({ registry: { nodes: [] } });
  assert.strictEqual(fallback.coordinatorState, "UNKNOWN");
  assert.strictEqual(fallback.summary, "Awaiting distributed cognition coordinator.");

  const synchronized = buildDistributedCoordinator({
    registry: {
      nodes: [
        { nodeId: "node-a", status: "ACTIVE", synchronizationState: "SYNCHRONIZED" },
        { nodeId: "node-b", status: "ACTIVE", synchronizationState: "SYNCHRONIZED" }
      ]
    }
  });
  assert.strictEqual(synchronized.coordinatorState, "SYNCHRONIZED");
  assert.strictEqual(synchronized.synchronizationHealth, "HEALTHY");

  const partial = buildDistributedCoordinator({
    registry: {
      nodes: [
        { nodeId: "node-a", status: "ACTIVE", synchronizationState: "SYNCHRONIZED" },
        { nodeId: "node-b", status: "ACTIVE", synchronizationState: "PARTIAL" }
      ]
    }
  });
  assert.strictEqual(partial.coordinatorState, "PARTIAL");
  assert(partial.warnings.length > 0);

  const degraded = buildDistributedCoordinator({
    registry: {
      nodes: [
        { nodeId: "node-a", status: "ACTIVE", synchronizationState: "DEGRADED" }
      ]
    }
  });
  assert.strictEqual(degraded.coordinatorState, "DEGRADED");

  const desynchronized = buildDistributedCoordinator({
    registry: {
      nodes: [
        { nodeId: "node-a", status: "OFFLINE", synchronizationState: "DESYNCHRONIZED" }
      ]
    }
  });
  assert.strictEqual(desynchronized.coordinatorState, "DESYNCHRONIZED");

  console.log("Distributed cognition coordinator test passed.");
}

run();
