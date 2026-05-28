const { buildNodeRegistry } = require("./cognitionNodeRegistry");

const AWAITING_DISTRIBUTED_COORDINATOR = "Awaiting distributed cognition coordinator.";

function buildDistributedCoordinator(options = {}) {
  const registry = options.registry || buildNodeRegistry(options);
  const nodes = registry.nodes || [];
  if (!nodes.length) {
    return {
      coordinatorState: "UNKNOWN",
      cognitionNodes: [],
      synchronizationHealth: "UNKNOWN",
      replaySynchronization: "UNKNOWN",
      warnings: [],
      summary: AWAITING_DISTRIBUTED_COORDINATOR
    };
  }

  const degraded = nodes.filter((node) => node.status !== "ACTIVE" || node.synchronizationState !== "SYNCHRONIZED");
  const inactive = nodes.filter((node) => node.status !== "ACTIVE");
  let coordinatorState = "SYNCHRONIZED";

  if (degraded.length && degraded.length < nodes.length) {
    coordinatorState = "PARTIAL";
  } else if (degraded.length === nodes.length && inactive.length === nodes.length) {
    coordinatorState = "DESYNCHRONIZED";
  } else if (degraded.length === nodes.length) {
    coordinatorState = "DEGRADED";
  }

  return {
    coordinatorState,
    cognitionNodes: nodes,
    synchronizationHealth: coordinatorState === "SYNCHRONIZED" ? "HEALTHY" : "DEGRADED",
    replaySynchronization: degraded.length ? "PARTIAL" : "SYNCED",
    warnings: degraded.length ? ["One or more cognition nodes are not synchronized."] : [],
    summary: `${coordinatorState} distributed cognition coordination across ${nodes.length} nodes.`
  };
}

module.exports = {
  AWAITING_DISTRIBUTED_COORDINATOR,
  buildDistributedCoordinator
};
