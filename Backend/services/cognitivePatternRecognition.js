/*
 * Deterministic recurring-pattern recognition across supplied intelligence history.
 * It groups repeated structures without adding adaptive AI behavior.
 */

function safeArray(value) {
  return Array.isArray(value)
    ? value.filter((item) => item && typeof item === "object")
    : [];
}

function unique(values) {
  return [...new Set(values.filter((value) => {
    return typeof value === "string" && value.trim();
  }))];
}

function classifyPatternStrength(occurrences) {
  if (occurrences >= 3) return "STRONG";
  if (occurrences === 2) return "MODERATE";
  if (occurrences === 1) return "WEAK";
  return "INSUFFICIENT";
}

function safeSummary(value, fallback) {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : fallback;
}

function collectTags(items) {
  return unique(items.flatMap((item) => {
    if (Array.isArray(item.tags)) {
      return item.tags;
    }

    if (Array.isArray(item.metadata?.tags)) {
      return item.metadata.tags;
    }

    return [];
  }));
}

function buildPattern(input = {}) {
  const items = safeArray(input.items);
  const occurrences = items.length;

  return {
    patternId: input.patternId,
    category: input.category,
    occurrences,
    strength: classifyPatternStrength(occurrences),
    relatedSymbols: unique(items.map((item) => item.symbol)),
    relatedTags: collectTags(items),
    observations: occurrences
      ? [
        `${occurrences} related ${input.category} observations were grouped.`,
        safeSummary(input.observation, "Recurring structure is available for review.")
      ]
      : ["No related observations are available for this pattern."],
    summary: safeSummary(input.summary, "Recurring intelligence structure is available.")
  };
}

function unstableTimelineEvents(timelineEvents) {
  return safeArray(timelineEvents).filter((event) => {
    return event.type === "environment" &&
      ["UNSTABLE", "HIGH_RISK"].includes(event.metadata?.environment);
  });
}

function degradedConfidenceSnapshots(strategicSnapshots) {
  return safeArray(strategicSnapshots).filter((snapshot) => {
    return ["LOW", "AVOID"].includes(snapshot.confidenceLevel);
  });
}

function fragmentedConsensusSnapshots(strategicSnapshots) {
  return safeArray(strategicSnapshots).filter((snapshot) => {
    return snapshot.consensusStrength === "CONFLICTED";
  });
}

function runtimeStressSnapshots(strategicSnapshots) {
  return safeArray(strategicSnapshots).filter((snapshot) => {
    return ["DEGRADED", "UNSTABLE", "CRITICAL"].includes(snapshot.runtimeStatus);
  });
}

function anomalyClusterEvents(anomalyEvents) {
  return safeArray(anomalyEvents).filter((event) => {
    return ["HIGH", "MEDIUM"].includes(event.severity) ||
      Array.isArray(event.anomalyTypes) ||
      Array.isArray(event.metadata?.anomalyTypes);
  });
}

function behavioralInstabilityEvents(behavioralTimeline) {
  return safeArray(behavioralTimeline).filter((event) => {
    return ["OVERACTIVE", "UNCERTAIN", "CAUTIOUS"].includes(event.mood) ||
      ["UNSTABLE", "OVERACTIVE"].includes(event.behavioralState) ||
      ["HIGH", "MODERATE"].includes(event.riskLevel);
  });
}

function highPriorityInsights(prioritizedInsights) {
  return safeArray(prioritizedInsights).filter((insight) => {
    return ["CRITICAL", "HIGH"].includes(insight.priority);
  });
}

function groupRecurringPatterns(input = {}) {
  return [
    buildPattern({
      patternId: "anomaly-cluster",
      category: "anomaly",
      items: anomalyClusterEvents(input.anomalyEvents),
      observation: "Anomaly clusters recur across supplied history.",
      summary: "Recurring anomaly clusters are present in supplied intelligence history."
    }),
    buildPattern({
      patternId: "behavioral-instability",
      category: "behavioral",
      items: behavioralInstabilityEvents(input.behavioralTimeline),
      observation: "Behavioral instability markers recur across review history.",
      summary: "Recurring behavioral instability conditions are present."
    }),
    buildPattern({
      patternId: "unstable-environment",
      category: "environment",
      items: unstableTimelineEvents(input.timelineEvents),
      observation: "Unstable environment observations recur in the timeline.",
      summary: "Recurring unstable strategic environment observations are present."
    }),
    buildPattern({
      patternId: "confidence-degradation",
      category: "confidence",
      items: degradedConfidenceSnapshots(input.strategicSnapshots),
      observation: "Confidence degradation repeats across strategic snapshots.",
      summary: "Repeated restrained confidence appears in snapshot history."
    }),
    buildPattern({
      patternId: "fragmented-consensus",
      category: "consensus",
      items: fragmentedConsensusSnapshots(input.strategicSnapshots),
      observation: "Conflicted consensus repeats across strategic snapshots.",
      summary: "Recurring fragmented consensus is visible in snapshot history."
    }),
    buildPattern({
      patternId: "runtime-stress",
      category: "runtime",
      items: runtimeStressSnapshots(input.strategicSnapshots),
      observation: "Runtime stress repeats across strategic snapshots.",
      summary: "Recurring runtime stress is visible in supplied snapshot history."
    }),
    buildPattern({
      patternId: "high-priority-insights",
      category: "strategic",
      items: highPriorityInsights(input.prioritizedInsights),
      observation: "High-priority review focus recurs across prioritized insights.",
      summary: "Recurring high-priority intelligence observations are present."
    })
  ];
}

function detectCognitivePatterns(input = {}) {
  return groupRecurringPatterns(input)
    .filter((pattern) => pattern.strength !== "INSUFFICIENT");
}

function strongestCategories(patterns) {
  const strengthRank = {
    STRONG: 3,
    MODERATE: 2,
    WEAK: 1,
    INSUFFICIENT: 0
  };
  const topRank = Math.max(0, ...safeArray(patterns).map((pattern) => {
    return strengthRank[pattern.strength] || 0;
  }));

  if (!topRank) {
    return [];
  }

  return unique(safeArray(patterns)
    .filter((pattern) => (strengthRank[pattern.strength] || 0) === topRank)
    .map((pattern) => pattern.category))
    .sort();
}

function recurringSymbols(patterns) {
  const counts = safeArray(patterns).reduce((distribution, pattern) => {
    (Array.isArray(pattern.relatedSymbols) ? pattern.relatedSymbols : [])
      .forEach((symbol) => {
      distribution[symbol] = (distribution[symbol] || 0) + 1;
      });

    return distribution;
  }, {});

  return Object.entries(counts)
    .filter(([, count]) => count >= 2)
    .map(([symbol]) => symbol)
    .sort();
}

function summarizeCognitivePatterns(patterns = []) {
  const safePatterns = safeArray(patterns);

  return {
    totalPatterns: safePatterns.length,
    strongestCategories: strongestCategories(safePatterns),
    recurringSymbols: recurringSymbols(safePatterns),
    observations: safePatterns.length
      ? [
        `${safePatterns.length} recurring intelligence patterns are available for review.`,
        `${safePatterns.filter((pattern) => pattern.strength === "STRONG").length} strong patterns are present.`
      ]
      : ["No recurring intelligence patterns are available yet."]
  };
}

module.exports = {
  classifyPatternStrength,
  detectCognitivePatterns,
  groupRecurringPatterns,
  summarizeCognitivePatterns
};
