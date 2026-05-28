const AWAITING_REPLAY_ARCHIVE = "Awaiting replay archive.";

function buildReplayArchive(input = {}) {
  const entries = Array.isArray(input.memoryEntries) ? input.memoryEntries : [];
  if (!entries.length) {
    return {
      replayArchiveState: "UNKNOWN",
      replaySnapshots: [],
      replayIndex: [],
      compressionState: "UNKNOWN",
      warnings: [],
      summary: AWAITING_REPLAY_ARCHIVE
    };
  }

  const replaySnapshots = entries
    .filter((entry) => entry.replayState && entry.replayState !== "UNKNOWN")
    .slice(-30)
    .reverse()
    .map((entry) => ({
      timestamp: entry.timestamp,
      symbol: entry.symbol,
      replayState: entry.replayState,
      confidenceLevel: entry.confidenceLevel,
      summary: `${entry.replayState} replay archive context for ${entry.symbol}.`
    }));
  const replayIndex = replaySnapshots.reduce((next, snapshot) => {
    next[snapshot.replayState] = (next[snapshot.replayState] || 0) + 1;
    return next;
  }, {});

  return {
    replayArchiveState: replaySnapshots.length ? "ACTIVE" : "LIMITED",
    replaySnapshots,
    replayIndex: Object.entries(replayIndex).map(([state, count]) => ({ state, count })),
    compressionState: entries.length > replaySnapshots.length ? "COMPRESSED" : "UNCOMPRESSED",
    warnings: [],
    summary: `Replay archive contains ${replaySnapshots.length} compressed replay snapshots.`
  };
}

module.exports = {
  AWAITING_REPLAY_ARCHIVE,
  buildReplayArchive
};
