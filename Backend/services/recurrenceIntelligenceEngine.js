const AWAITING_RECURRENCE_INTELLIGENCE = "Awaiting recurrence intelligence.";

function buildRecurrenceIntelligence(input = {}) {
  const entries = Array.isArray(input.memoryEntries) ? input.memoryEntries : [];
  if (entries.length < 3) {
    return {
      recurrenceState: "UNKNOWN",
      recurrencePatterns: [],
      recurrenceConfidence: "UNKNOWN",
      historicalMatches: [],
      warnings: [],
      summary: AWAITING_RECURRENCE_INTELLIGENCE
    };
  }

  const patternKeys = [
    ["environment", "Environment recurrence"],
    ["suppressionState", "Suppression recurrence"],
    ["ecosystemState", "Synchronization recurrence"],
    ["replayState", "Replay recurrence"],
    ["driftState", "Drift recurrence"]
  ];
  const recurrencePatterns = [];

  patternKeys.forEach(([key, label]) => {
    const counts = entries.reduce((next, entry) => {
      const value = entry[key] || "UNKNOWN";
      if (value !== "UNKNOWN") next[value] = (next[value] || 0) + 1;
      return next;
    }, {});
    Object.entries(counts).forEach(([value, count]) => {
      if (count >= 2) {
        recurrencePatterns.push({
          pattern: `${label}: ${value}`,
          frequency: count,
          confidence: count >= 5 ? "HIGH" : count >= 3 ? "MODERATE" : "LOW",
          environmentType: value,
          summary: `${value} appeared ${count} times in persistent cognition memory.`
        });
      }
    });
  });

  return {
    recurrenceState: recurrencePatterns.length >= 5 ? "STRONG" : recurrencePatterns.length ? "DETECTED" : "QUIET",
    recurrencePatterns: recurrencePatterns.slice(0, 10),
    recurrenceConfidence: entries.length >= 20 ? "HIGH" : entries.length >= 8 ? "MODERATE" : "LOW",
    historicalMatches: entries.slice(-8).reverse(),
    warnings: [],
    summary: `${recurrencePatterns.length} historical recurrence patterns detected.`
  };
}

module.exports = {
  AWAITING_RECURRENCE_INTELLIGENCE,
  buildRecurrenceIntelligence
};
