/*
 * In-memory event log for structured signal intelligence observations.
 * It keeps bounded event-safe records for future analytics and replay work.
 */

const DEFAULT_MAX_EVENTS = 500;
const events = [];
let eventCounter = 0;

function safeString(value, fallback = "") {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : fallback;
}

function safeNumber(value, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : fallback;
}

function safeTimestamp(timestamp) {
  const parsed = timestamp ? new Date(timestamp) : new Date();

  return Number.isNaN(parsed.getTime())
    ? new Date().toISOString()
    : parsed.toISOString();
}

function createEventId(timestamp) {
  eventCounter += 1;

  return `signal-${timestamp.replace(/[^0-9]/g, "")}-${eventCounter}`;
}

function collectWarnings(input = {}) {
  const warnings = [
    ...(Array.isArray(input.signalIntelligence?.warnings)
      ? input.signalIntelligence.warnings
      : []),
    ...(Array.isArray(input.narrativeIntelligence?.warnings)
      ? input.narrativeIntelligence.warnings
      : []),
    ...(Array.isArray(input.alertReadiness?.warnings)
      ? input.alertReadiness.warnings
      : [])
  ].filter((warning) => typeof warning === "string" && warning.trim());

  if (input.failsafeBrain?.status === "ACTIVE") {
    warnings.push("Failsafe layer is active.");
  }

  if (input.signalCooldown?.suppressed === true) {
    warnings.push("Signal was suppressed by cooldown.");
  }

  return [...new Set(warnings)];
}

function createSignalEvent(input = {}) {
  const timestamp = safeTimestamp(input.timestamp);

  return {
    id: createEventId(timestamp),
    timestamp,
    symbol: safeString(input.symbol, "UNKNOWN"),
    signalType: safeString(input.signalIntelligence?.signalType, "UNKNOWN"),
    quality: safeString(input.signalIntelligence?.quality, "UNKNOWN"),
    confidence: safeNumber(input.signalIntelligence?.confidence),
    regimeType: safeString(input.regime?.type, "UNKNOWN"),
    alertReady: input.alertReadiness?.alertReady === true,
    suppressed: input.signalCooldown?.suppressed === true,
    priority: safeString(input.alertReadiness?.priority, "NONE"),
    headline: safeString(input.narrativeIntelligence?.headline),
    summary: safeString(input.narrativeIntelligence?.summary),
    warnings: collectWarnings(input)
  };
}

function logSignalEvent(input = {}, options = {}) {
  if (input.signalIntelligence?.signalType === "NO_QUALITY_SIGNAL") {
    return {
      logged: false,
      eventId: null,
      suppressed: input.signalCooldown?.suppressed === true,
      reason: "no_quality_signal"
    };
  }

  const event = createSignalEvent(input);
  const maxEvents = Number.isInteger(options.maxEvents) && options.maxEvents > 0
    ? options.maxEvents
    : DEFAULT_MAX_EVENTS;

  // Newest events stay first so recent queries remain simple.
  events.unshift(event);

  if (events.length > maxEvents) {
    events.length = maxEvents;
  }

  return {
    logged: true,
    eventId: event.id,
    suppressed: event.suppressed
  };
}

function getRecentSignalEvents(input = {}) {
  const limit = Number.isInteger(input.limit) && input.limit > 0
    ? input.limit
    : events.length;
  const symbol = safeString(input.symbol).toUpperCase();
  const signalType = safeString(input.signalType).toUpperCase();

  return events
    .filter((event) => {
      const symbolMatches = !symbol || event.symbol.toUpperCase() === symbol;
      const signalMatches = !signalType ||
        event.signalType.toUpperCase() === signalType;

      return symbolMatches && signalMatches;
    })
    .slice(0, limit)
    .map((event) => ({
      ...event,
      warnings: [...event.warnings]
    }));
}

function clearSignalEvents() {
  events.length = 0;

  return {
    cleared: true,
    totalEvents: 0
  };
}

function countBy(field) {
  return events.reduce((counts, event) => {
    const key = event[field] || "UNKNOWN";
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}

function getSignalEventStats() {
  return {
    totalEvents: events.length,
    suppressedEvents: events.filter((event) => event.suppressed).length,
    alertReadyEvents: events.filter((event) => event.alertReady).length,
    bySignalType: countBy("signalType"),
    byPriority: countBy("priority")
  };
}

module.exports = {
  clearSignalEvents,
  getRecentSignalEvents,
  getSignalEventStats,
  logSignalEvent
};
