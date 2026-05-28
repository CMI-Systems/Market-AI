const AWAITING_ENVIRONMENT_ARCHIVE = "Awaiting environment archive.";

function countTransitions(entries, key) {
  const counts = {};
  for (let index = 1; index < entries.length; index += 1) {
    const from = entries[index - 1][key] || "UNKNOWN";
    const to = entries[index][key] || "UNKNOWN";
    if (from !== to) {
      const label = `${from} to ${to}`;
      counts[label] = (counts[label] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .map(([transition, count]) => ({ transition, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

function buildEnvironmentArchive(input = {}) {
  const entries = Array.isArray(input.memoryEntries) ? input.memoryEntries : [];
  if (!entries.length) {
    return {
      archiveState: "UNKNOWN",
      environmentHistory: [],
      dominantTransitions: [],
      recurrenceClusters: [],
      warnings: [],
      summary: AWAITING_ENVIRONMENT_ARCHIVE
    };
  }

  const environmentHistory = entries.slice(-40).map((entry) => ({
    timestamp: entry.timestamp,
    environment: entry.environment,
    confidenceLevel: entry.confidenceLevel,
    ecosystemState: entry.ecosystemState,
    replayState: entry.replayState
  }));
  const recurrenceCounts = entries.reduce((next, entry) => {
    const key = entry.environment || "UNKNOWN";
    next[key] = (next[key] || 0) + 1;
    return next;
  }, {});

  return {
    archiveState: entries.length >= 10 ? "ACTIVE" : "LIMITED",
    environmentHistory,
    dominantTransitions: countTransitions(entries, "environment"),
    recurrenceClusters: Object.entries(recurrenceCounts)
      .filter(([, count]) => count >= 2)
      .map(([environment, count]) => ({ environment, count }))
      .slice(0, 8),
    warnings: [],
    summary: `Environment archive contains ${entries.length} historical cognition entries.`
  };
}

module.exports = {
  AWAITING_ENVIRONMENT_ARCHIVE,
  buildEnvironmentArchive
};
