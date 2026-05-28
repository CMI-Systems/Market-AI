/*
 * Replay timeline builder for structured signal events.
 * It reads the existing in-memory event log and does not create new narratives.
 */

const {
  getRecentSignalEvents
} = require("./signalEventLog");

function toTimelineItem(event = {}) {
  return {
    timestamp: event.timestamp,
    symbol: event.symbol,
    signalType: event.signalType,
    quality: event.quality,
    confidence: event.confidence,
    regimeType: event.regimeType,
    alertReady: event.alertReady === true,
    suppressed: event.suppressed === true,
    priority: event.priority,
    headline: event.headline,
    summary: event.summary,
    warnings: Array.isArray(event.warnings) ? [...event.warnings] : []
  };
}

function sortTimeline(timeline, newestFirst) {
  return [...timeline].sort((first, second) => {
    const firstTime = new Date(first.timestamp).getTime() || 0;
    const secondTime = new Date(second.timestamp).getTime() || 0;

    return newestFirst
      ? secondTime - firstTime
      : firstTime - secondTime;
  });
}

function buildTimeline(options = {}) {
  const newestFirst = options.newestFirst === true;
  const events = getRecentSignalEvents({
    symbol: options.symbol,
    signalType: options.signalType
  });
  const timeline = sortTimeline(events.map(toTimelineItem), newestFirst);
  const limit = Number.isInteger(options.limit) && options.limit > 0
    ? options.limit
    : timeline.length;

  return timeline.slice(0, limit);
}

function getTimelineBySymbol(symbol, options = {}) {
  return buildTimeline({
    ...options,
    symbol
  });
}

function getTimelineBySignalType(signalType, options = {}) {
  return buildTimeline({
    ...options,
    signalType
  });
}

function countBy(items, field) {
  return items.reduce((distribution, item) => {
    const key = item[field] || "UNKNOWN";
    distribution[key] = (distribution[key] || 0) + 1;
    return distribution;
  }, {});
}

function summarizeTimeline(timeline = []) {
  const safeTimeline = Array.isArray(timeline) ? timeline : [];
  const signalDistribution = countBy(safeTimeline, "signalType");
  const priorityDistribution = safeTimeline.reduce((distribution, item) => {
    const priority = item.priority || "UNAVAILABLE";
    distribution[priority] = (distribution[priority] || 0) + 1;
    return distribution;
  }, {});
  const uniqueSymbols = [...new Set(
    safeTimeline
      .map((item) => item.symbol)
      .filter((symbol) => typeof symbol === "string" && symbol.trim())
  )];
  const topSignalTypes = Object.entries(signalDistribution)
    .sort((first, second) => {
      if (second[1] === first[1]) {
        return first[0].localeCompare(second[0]);
      }

      return second[1] - first[1];
    })
    .map(([signalType, count]) => ({
      signalType,
      count
    }));

  return {
    totalEvents: safeTimeline.length,
    uniqueSymbols,
    signalDistribution,
    priorityDistribution,
    suppressedCount: safeTimeline.filter((item) => item.suppressed).length,
    alertReadyCount: safeTimeline.filter((item) => item.alertReady).length,
    topSignalTypes
  };
}

module.exports = {
  buildTimeline,
  getTimelineBySignalType,
  getTimelineBySymbol,
  summarizeTimeline
};
