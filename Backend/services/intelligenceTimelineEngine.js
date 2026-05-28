/*
 * Unified chronological intelligence timeline engine.
 * It merges supplied event groups without loading large histories itself.
 */

const SUPPORTED_TYPES = new Set([
  "snapshot",
  "journal",
  "behavioral",
  "anomaly",
  "runtime",
  "environment"
]);

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeTimestamp(value) {
  const parsed = value ? new Date(value) : null;

  return parsed && !Number.isNaN(parsed.getTime())
    ? parsed.toISOString()
    : new Date(0).toISOString();
}

function safeString(value, fallback = "UNKNOWN") {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : fallback;
}

function safeMetadata(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? { ...value }
    : {};
}

function severityFromEnvironment(environment) {
  switch (environment) {
    case "HIGH_RISK":
      return "HIGH";
    case "UNSTABLE":
      return "MEDIUM";
    case "CAUTION":
      return "LOW";
    default:
      return "NONE";
  }
}

function snapshotEvent(snapshot = {}) {
  return {
    id: safeString(snapshot.id, `snapshot-${safeTimestamp(snapshot.timestamp)}`),
    type: "snapshot",
    timestamp: safeTimestamp(snapshot.timestamp),
    symbol: safeString(snapshot.symbol),
    severity: safeString(snapshot.anomalySeverity, "NONE"),
    summary: safeString(snapshot.summary, "Strategic snapshot is available."),
    metadata: {
      strategicEnvironment: snapshot.strategicEnvironment,
      consensusStrength: snapshot.consensusStrength,
      runtimeStatus: snapshot.runtimeStatus
    }
  };
}

function journalEvent(journal = {}) {
  return {
    id: safeString(journal.id, `journal-${safeTimestamp(journal.savedAt || journal.createdAt)}`),
    type: "journal",
    timestamp: safeTimestamp(journal.savedAt || journal.createdAt),
    symbol: safeString(journal.symbol),
    severity: journal.mood === "UNCERTAIN" || journal.mood === "CAUTIOUS"
      ? "LOW"
      : "NONE",
    summary: safeString(journal.summary, "Journal reflection is available."),
    metadata: {
      mood: journal.mood,
      tags: Array.isArray(journal.tags) ? [...journal.tags] : []
    }
  };
}

function behavioralEvent(event = {}) {
  return {
    id: safeString(event.id, `behavioral-${safeTimestamp(event.timestamp)}`),
    type: "behavioral",
    timestamp: safeTimestamp(event.timestamp),
    symbol: safeString(event.symbol),
    severity: event.mood === "OVERACTIVE" || event.mood === "UNCERTAIN"
      ? "LOW"
      : "NONE",
    summary: safeString(event.summary, "Behavioral timeline observation is available."),
    metadata: {
      mood: event.mood,
      tags: Array.isArray(event.tags) ? [...event.tags] : []
    }
  };
}

function suppliedEvent(type, event = {}) {
  return {
    id: safeString(event.id, `${type}-${safeTimestamp(event.timestamp)}`),
    type,
    timestamp: safeTimestamp(event.timestamp),
    symbol: safeString(event.symbol),
    severity: safeString(event.severity, "NONE"),
    summary: safeString(event.summary, `${type} observation is available.`),
    metadata: safeMetadata(event.metadata)
  };
}

function environmentEvent(event = {}) {
  return suppliedEvent("environment", {
    ...event,
    severity: event.severity || severityFromEnvironment(event.environment),
    metadata: {
      ...safeMetadata(event.metadata),
      environment: event.environment,
      stability: event.stability
    }
  });
}

function normalizeEvents(input = {}) {
  return [
    ...safeArray(input.snapshots).map(snapshotEvent),
    ...safeArray(input.journals).map(journalEvent),
    ...safeArray(input.behavioralTimeline).map(behavioralEvent),
    ...safeArray(input.anomalyEvents).map((event) => suppliedEvent("anomaly", event)),
    ...safeArray(input.runtimeEvents).map((event) => suppliedEvent("runtime", event)),
    ...safeArray(input.environmentEvents).map(environmentEvent)
  ].filter((event) => SUPPORTED_TYPES.has(event.type));
}

function sortNewestFirst(events) {
  return [...events].sort((first, second) => {
    return new Date(second.timestamp).getTime() - new Date(first.timestamp).getTime();
  });
}

function mergeTimelineEvents(input = {}) {
  return sortNewestFirst(normalizeEvents(input));
}

function filterTimelineEvents(events = [], options = {}) {
  const type = safeString(options.type, "").toLowerCase();
  const symbol = safeString(options.symbol, "").toUpperCase();
  const severity = safeString(options.severity, "").toUpperCase();
  const limit = Number.isInteger(options.limit) && options.limit > 0
    ? options.limit
    : Number.MAX_SAFE_INTEGER;

  return safeArray(events)
    .filter((event) => {
      const typeMatches = !type || event.type === type;
      const symbolMatches = !symbol || event.symbol?.toUpperCase() === symbol;
      const severityMatches = !severity || event.severity?.toUpperCase() === severity;

      return typeMatches && symbolMatches && severityMatches;
    })
    .slice(0, limit);
}

function countBy(events, field) {
  return events.reduce((distribution, event) => {
    const key = event[field] || "UNKNOWN";
    distribution[key] = (distribution[key] || 0) + 1;
    return distribution;
  }, {});
}

function dominantTypes(typeDistribution) {
  const topCount = Math.max(0, ...Object.values(typeDistribution));

  if (!topCount) {
    return [];
  }

  return Object.entries(typeDistribution)
    .filter(([, count]) => count === topCount)
    .map(([type]) => type)
    .sort();
}

function summarizeIntelligenceTimeline(events = []) {
  const timeline = safeArray(events);
  const typeDistribution = countBy(timeline, "type");
  const symbols = countBy(timeline, "symbol");

  return {
    totalEvents: timeline.length,
    dominantTypes: dominantTypes(typeDistribution),
    symbols,
    severityDistribution: countBy(timeline, "severity"),
    observations: timeline.length
      ? [
        `${timeline.length} unified intelligence events are available.`,
        `${Object.keys(symbols).length} symbols appear in the timeline.`
      ]
      : ["No unified intelligence timeline events are available."]
  };
}

function buildIntelligenceTimeline(input = {}) {
  const timeline = filterTimelineEvents(
    mergeTimelineEvents(input),
    input.filter || {}
  );

  return {
    timeline,
    summary: summarizeIntelligenceTimeline(timeline)
  };
}

module.exports = {
  buildIntelligenceTimeline,
  filterTimelineEvents,
  mergeTimelineEvents,
  summarizeIntelligenceTimeline
};
