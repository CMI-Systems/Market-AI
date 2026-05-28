const AWAITING_REPLAY_SYNCHRONIZATION = "Awaiting replay synchronization.";

function buildDistributedReplaySync(input = {}) {
  const nodes = input.nodes || [];
  if (!nodes.length) {
    return {
      replaySyncState: "UNKNOWN",
      synchronizationConflicts: [],
      replayConsistency: "UNKNOWN",
      propagationHealth: "UNKNOWN",
      warnings: [],
      summary: AWAITING_REPLAY_SYNCHRONIZATION
    };
  }

  const conflicts = nodes
    .filter((node) => node.synchronizationState !== "SYNCHRONIZED")
    .map((node) => ({ nodeId: node.nodeId, state: node.synchronizationState }));

  const replaySyncState = conflicts.length === 0
    ? "SYNCED"
    : conflicts.length === nodes.length
      ? "CONFLICT"
      : "PARTIAL";

  return {
    replaySyncState,
    synchronizationConflicts: conflicts,
    replayConsistency: conflicts.length ? "PARTIAL" : "CONSISTENT",
    propagationHealth: conflicts.length ? "DEGRADED" : "HEALTHY",
    warnings: conflicts.length ? ["Replay synchronization has node-level conflicts."] : [],
    summary: conflicts.length ? "Replay synchronization is partially aligned." : "Replay synchronization is aligned across registered nodes."
  };
}

module.exports = {
  AWAITING_REPLAY_SYNCHRONIZATION,
  buildDistributedReplaySync
};
