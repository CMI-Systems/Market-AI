/*
 * Visualization-ready replay frame builder.
 * This module prepares backend replay data for future dashboards without UI code.
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
    ? { ...value }
    : {};
}

function safeTimestamp(value) {
  const parsed = value ? new Date(value) : null;

  return parsed && !Number.isNaN(parsed.getTime())
    ? parsed.toISOString()
    : new Date(0).toISOString();
}

function timestampValue(frame = {}) {
  const parsed = frame.timestamp ? new Date(frame.timestamp).getTime() : NaN;

  return Number.isFinite(parsed) ? parsed : 0;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function tagForEnvironment(environment) {
  const state = safeString(environment).toUpperCase();

  if (state === "HIGH_RISK" || state === "UNSTABLE") return "high-risk";
  if (state === "CAUTION") return "caution";
  if (state === "OPTIMAL" || state === "FAVORABLE") return "stable";
  return null;
}

function tagsForFrame(frame) {
  const tags = [
    tagForEnvironment(frame.environment)
  ];

  if (["HIGH", "MEDIUM"].includes(frame.anomalySeverity)) {
    tags.push("anomaly");
  }

  if (["HIGH", "MODERATE"].includes(frame.transitionSeverity)) {
    tags.push("transition");
  }

  if (!["UNKNOWN", "DISCIPLINED"].includes(frame.behavioralState)) {
    tags.push("behavioral");
  }

  if (["DEGRADED", "UNSTABLE", "CRITICAL"].includes(frame.runtimeStatus)) {
    tags.push("runtime");
  }

  if (["LOW", "AVOID"].includes(frame.confidenceLevel)) {
    tags.push("confidence");
  }

  return unique(tags);
}

function headlineForFrame(frame) {
  if (frame.transitionSeverity !== "UNKNOWN") {
    return `${frame.symbol}: ${frame.transitionSeverity} transition context`;
  }

  if (frame.anomalySeverity !== "NONE") {
    return `${frame.symbol}: ${frame.anomalySeverity} anomaly context`;
  }

  if (frame.environment !== "UNKNOWN") {
    return `${frame.symbol}: ${frame.environment} environment context`;
  }

  return `${frame.symbol}: replay context`;
}

function summaryForFrame(frame) {
  if (frame.summary && frame.summary !== "UNKNOWN") {
    return frame.summary;
  }

  return `${frame.symbol} replay frame captures ${frame.environment} environment, ${frame.runtimeStatus} runtime, and ${frame.confidenceLevel} confidence context.`;
}

function buildReplayFrame(input = {}, options = {}) {
  const metadata = safeMetadata(input.metadata);
  const frame = {
    frameId: safeString(
      input.frameId || input.id || input.transitionId,
      `frame-${safeTimestamp(input.timestamp)}`
    ),
    timestamp: safeTimestamp(input.timestamp || input.savedAt || input.createdAt),
    symbol: safeString(input.symbol || metadata.symbol),
    environment: safeString(
      input.environment ||
      input.strategicEnvironment ||
      metadata.environment ||
      metadata.strategicEnvironment
    ),
    stability: safeString(input.stability || metadata.stability),
    confidenceLevel: safeString(
      input.confidenceLevel ||
      input.confidence ||
      metadata.confidenceLevel
    ),
    anomalySeverity: safeString(
      input.anomalySeverity ||
      input.severity ||
      metadata.anomalySeverity,
      "NONE"
    ),
    runtimeStatus: safeString(
      input.runtimeStatus ||
      input.status ||
      metadata.runtimeStatus ||
      metadata.status
    ),
    behavioralState: safeString(
      input.behavioralState ||
      input.mood ||
      metadata.behavioralState ||
      metadata.mood
    ),
    transitionSeverity: safeString(
      input.transitionSeverity ||
      input.severity ||
      metadata.transitionSeverity,
      "UNKNOWN"
    ),
    headline: safeString(input.headline, ""),
    summary: safeString(input.summary),
    visualTags: [],
    metadata: {
      ...metadata,
      sourceType: options.sourceType || input.type || "unknown"
    }
  };

  frame.headline = frame.headline || headlineForFrame(frame);
  frame.summary = summaryForFrame(frame);
  frame.visualTags = unique([
    ...tagsForFrame(frame),
    ...safeArray(input.visualTags)
  ]);

  return frame;
}

function frameFromSnapshot(snapshot = {}) {
  return buildReplayFrame({
    ...snapshot,
    environment: snapshot.strategicEnvironment,
    anomalySeverity: snapshot.anomalySeverity,
    runtimeStatus: snapshot.runtimeStatus,
    behavioralState: snapshot.behavioralState,
    transitionSeverity: "UNKNOWN"
  }, {
    sourceType: "snapshot"
  });
}

function frameFromTransition(transition = {}) {
  return buildReplayFrame({
    frameId: transition.transitionId,
    timestamp: transition.timestamp,
    symbol: transition.symbol || "SYSTEM",
    environment: transition.category === "strategic_environment"
      ? transition.toState
      : undefined,
    runtimeStatus: transition.category === "runtime_health"
      ? transition.toState
      : undefined,
    confidenceLevel: transition.category === "confidence_structure"
      ? transition.toState
      : undefined,
    anomalySeverity: transition.category === "anomaly_state"
      ? transition.toState
      : undefined,
    behavioralState: transition.category === "behavioral_state"
      ? transition.toState
      : undefined,
    transitionSeverity: transition.severity,
    summary: transition.summary,
    metadata: {
      category: transition.category,
      fromState: transition.fromState,
      toState: transition.toState
    }
  }, {
    sourceType: "transition"
  });
}

function frameFromTimelineEvent(event = {}) {
  return buildReplayFrame({
    ...event,
    environment: event.metadata?.environment || event.metadata?.strategicEnvironment,
    runtimeStatus: event.metadata?.status || event.metadata?.runtimeStatus,
    behavioralState: event.metadata?.mood || event.metadata?.behavioralState,
    anomalySeverity: event.type === "anomaly" ? event.severity : undefined,
    transitionSeverity: "UNKNOWN"
  }, {
    sourceType: event.type || "timeline"
  });
}

function frameFromBehavioralEvent(event = {}) {
  return buildReplayFrame({
    ...event,
    behavioralState: event.behavioralState || event.mood,
    transitionSeverity: "UNKNOWN"
  }, {
    sourceType: "behavioral"
  });
}

function frameFromRuntimeEvent(event = {}) {
  return buildReplayFrame({
    ...event,
    runtimeStatus: event.status || event.metadata?.status,
    transitionSeverity: "UNKNOWN"
  }, {
    sourceType: "runtime"
  });
}

function frameFromAnomalyEvent(event = {}) {
  return buildReplayFrame({
    ...event,
    anomalySeverity: event.severity || event.anomalySeverity,
    transitionSeverity: "UNKNOWN"
  }, {
    sourceType: "anomaly"
  });
}

function buildReplayFrames(input = {}) {
  const frames = [
    ...safeArray(input.snapshots).map(frameFromSnapshot),
    ...safeArray(input.timelineEvents).map(frameFromTimelineEvent),
    ...safeArray(input.transitions).map(frameFromTransition),
    ...safeArray(input.anomalyEvents).map(frameFromAnomalyEvent),
    ...safeArray(input.behavioralTimeline).map(frameFromBehavioralEvent),
    ...safeArray(input.runtimeEvents).map(frameFromRuntimeEvent)
  ];

  return frames.sort((first, second) => {
    return timestampValue(first) - timestampValue(second);
  });
}

function filterReplayFrames(frames = [], options = {}) {
  const symbol = safeString(options.symbol, "").toUpperCase();
  const visualTag = safeString(options.visualTag, "").toLowerCase();
  const environment = safeString(options.environment, "").toUpperCase();
  const limit = Number.isInteger(options.limit) && options.limit > 0
    ? options.limit
    : Number.MAX_SAFE_INTEGER;

  return safeArray(frames)
    .filter((frame) => {
      const symbolMatches = !symbol || frame.symbol?.toUpperCase() === symbol;
      const tagMatches = !visualTag || frame.visualTags.includes(visualTag);
      const environmentMatches = !environment ||
        frame.environment?.toUpperCase() === environment;

      return symbolMatches && tagMatches && environmentMatches;
    })
    .slice(0, limit);
}

function countBy(frames, field) {
  return frames.reduce((distribution, frame) => {
    const value = frame[field] || "UNKNOWN";
    distribution[value] = (distribution[value] || 0) + 1;
    return distribution;
  }, {});
}

function countVisualTags(frames) {
  return frames.reduce((distribution, frame) => {
    frame.visualTags.forEach((tag) => {
      distribution[tag] = (distribution[tag] || 0) + 1;
    });

    return distribution;
  }, {});
}

function summarizeReplayFrames(frames = []) {
  const safeFrames = safeArray(frames);

  return {
    totalFrames: safeFrames.length,
    symbols: countBy(safeFrames, "symbol"),
    environmentDistribution: countBy(safeFrames, "environment"),
    anomalyDistribution: countBy(safeFrames, "anomalySeverity"),
    transitionDistribution: countBy(safeFrames, "transitionSeverity"),
    visualTags: countVisualTags(safeFrames),
    observations: safeFrames.length
      ? [
        `${safeFrames.length} replay frames are prepared for visualization.`,
        `${Object.keys(countBy(safeFrames, "symbol")).length} symbols appear in replay frames.`
      ]
      : ["No replay frames are available for visualization."]
  };
}

module.exports = {
  buildReplayFrame,
  buildReplayFrames,
  filterReplayFrames,
  summarizeReplayFrames
};
