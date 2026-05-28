/*
 * Deterministic replay compression.
 * This keeps review-worthy events and removes repetitive low-value background noise.
 */

function safeArray(value) {
  return Array.isArray(value)
    ? value.filter((item) => item && typeof item === "object")
    : [];
}

function safeString(value, fallback = "UNKNOWN") {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : fallback;
}

function safeMetadata(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function safeTimestamp(value) {
  const parsed = value ? new Date(value) : null;

  return parsed && !Number.isNaN(parsed.getTime())
    ? parsed.toISOString()
    : new Date(0).toISOString();
}

function timestampValue(event = {}) {
  const parsed = event.timestamp ? new Date(event.timestamp).getTime() : NaN;

  return Number.isFinite(parsed) ? parsed : 0;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function safeStringArray(value) {
  return Array.isArray(value)
    ? unique(value.filter((item) => typeof item === "string" && item.trim()))
    : [];
}

function normalizeEvent(event = {}, sourceType = "event") {
  const metadata = safeMetadata(event.metadata);

  return {
    id: safeString(event.frameId || event.id || event.transitionId, `event-${safeTimestamp(event.timestamp)}`),
    timestamp: safeTimestamp(event.timestamp || event.savedAt || event.createdAt),
    symbol: safeString(event.symbol || metadata.symbol),
    type: safeString(event.type || metadata.sourceType || sourceType).toLowerCase(),
    environment: safeString(event.environment || event.strategicEnvironment || metadata.environment || metadata.strategicEnvironment),
    severity: safeString(event.severity || event.anomalySeverity || metadata.severity || metadata.anomalySeverity, "NONE"),
    priority: safeString(event.priority || metadata.priority, "NONE"),
    transitionSeverity: safeString(event.transitionSeverity || metadata.transitionSeverity, "UNKNOWN"),
    behavioralState: safeString(event.behavioralState || event.mood || metadata.behavioralState || metadata.mood),
    runtimeStatus: safeString(event.runtimeStatus || event.status || metadata.runtimeStatus || metadata.status),
    summary: safeString(event.summary, "Replay event is available for review."),
    visualTags: unique([
      ...safeStringArray(event.visualTags),
      ...safeStringArray(metadata.tags)
    ]),
    originalEvent: event
  };
}

function normalizeInputs(input = {}) {
  return [
    ...safeArray(input.replayFrames).map((event) => normalizeEvent(event, "replay")),
    ...safeArray(input.timelineEvents).map((event) => normalizeEvent(event, "timeline")),
    ...safeArray(input.strategicSnapshots).map((event) => normalizeEvent(event, "snapshot")),
    ...safeArray(input.journalEvents).map((event) => normalizeEvent(event, "journal")),
    ...safeArray(input.anomalyEvents).map((event) => normalizeEvent(event, "anomaly")),
    ...safeArray(input.behavioralTimeline).map((event) => normalizeEvent(event, "behavioral"))
  ].sort((first, second) => {
    return timestampValue(first) - timestampValue(second);
  });
}

function eventKey(event) {
  return [
    event.symbol,
    event.type,
    event.environment,
    event.severity,
    event.behavioralState,
    event.runtimeStatus,
    event.summary
  ].join("|");
}

function eventImportance(event = {}) {
  let score = 0;

  if (["HIGH", "CRITICAL"].includes(event.priority)) score += 4;
  if (["HIGH", "MEDIUM"].includes(event.severity)) score += event.severity === "HIGH" ? 4 : 2;
  if (["HIGH_RISK", "UNSTABLE"].includes(event.environment)) score += 4;
  if (["CAUTION"].includes(event.environment)) score += 1;
  if (["HIGH", "MODERATE"].includes(event.transitionSeverity)) score += 3;
  if (["UNSTABLE", "OVERACTIVE", "CAUTIOUS", "UNCERTAIN"].includes(event.behavioralState)) score += 2;
  if (["DEGRADED", "UNSTABLE", "CRITICAL"].includes(event.runtimeStatus)) score += 3;
  if (event.visualTags.some((tag) => {
    return ["high-risk", "anomaly", "transition", "behavioral", "runtime", "confidence"].includes(tag);
  })) {
    score += 2;
  }
  if (["snapshot", "environment", "anomaly", "behavioral"].includes(event.type)) score += 1;

  return score;
}

function shouldRetainEvent(event, seenCounts) {
  const score = eventImportance(event);

  if (score >= 3) {
    return true;
  }

  const key = eventKey(event);
  const previousCount = seenCounts[key] || 0;
  seenCounts[key] = previousCount + 1;

  // Keep the first low-value background marker for context, compress repeats.
  return previousCount === 0;
}

function classifyCompressionQuality(input = {}) {
  const ratio = typeof input === "number"
    ? input
    : input.compressionRatio;
  const retained = input.retainedCount ?? 0;
  const original = input.originalCount ?? 0;

  if (!original || retained === 0) return "INSUFFICIENT";
  if (ratio <= 0.65 && retained >= 3) return "HIGH";
  if (ratio <= 0.85) return "MODERATE";
  return "LOW";
}

function compressReplayTimeline(input = {}) {
  const events = normalizeInputs(input);
  const seenCounts = {};
  const compressedEvents = events.filter((event) => {
    return shouldRetainEvent(event, seenCounts);
  });
  const originalCount = events.length;
  const retainedCount = compressedEvents.length;
  const compressionRatio = originalCount
    ? Number((retainedCount / originalCount).toFixed(2))
    : 0;
  const quality = classifyCompressionQuality({
    compressionRatio,
    retainedCount,
    originalCount
  });
  const retainedHighlights = compressedEvents
    .filter((event) => eventImportance(event) >= 3)
    .map((event) => event.id);

  return {
    compressedEvents,
    compressionRatio,
    quality,
    retainedHighlights,
    removedNoiseCount: originalCount - retainedCount,
    summary: summarizeCompressedReplay({
      compressedEvents,
      compressionRatio,
      quality,
      removedNoiseCount: originalCount - retainedCount
    }).summary
  };
}

function compressReplayFrames(replayFrames = []) {
  return compressReplayTimeline({
    replayFrames
  });
}

function summarizeCompressedReplay(input = {}) {
  const compressedEvents = safeArray(input.compressedEvents);
  const quality = input.quality || classifyCompressionQuality({
    compressionRatio: input.compressionRatio,
    retainedCount: compressedEvents.length,
    originalCount: compressedEvents.length + (input.removedNoiseCount || 0)
  });
  const removedNoiseCount = input.removedNoiseCount || 0;

  return {
    totalCompressedEvents: compressedEvents.length,
    quality,
    removedNoiseCount,
    retainedHighlightCount: compressedEvents.filter((event) => {
      return eventImportance(event) >= 3;
    }).length,
    summary: compressedEvents.length
      ? `${compressedEvents.length} replay events retained with ${removedNoiseCount} repetitive background events compressed.`
      : "No replay events are available for compression."
  };
}

module.exports = {
  classifyCompressionQuality,
  compressReplayFrames,
  compressReplayTimeline,
  summarizeCompressedReplay
};
