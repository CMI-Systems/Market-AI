/*
 * Deterministic drift detection across supplied intelligence history.
 * It compares older and newer states without creating adaptive AI behavior.
 */

function safeArray(value) {
  return Array.isArray(value)
    ? value.filter((item) => item && typeof item === "object")
    : [];
}

function unique(values) {
  return [...new Set(values)];
}

function timestampValue(item = {}) {
  const timestamp = item.timestamp || item.savedAt || item.createdAt;
  const parsed = timestamp ? new Date(timestamp).getTime() : NaN;

  return Number.isFinite(parsed) ? parsed : 0;
}

function chronological(items) {
  return [...safeArray(items)].sort((first, second) => {
    return timestampValue(first) - timestampValue(second);
  });
}

function splitHistory(items) {
  const ordered = chronological(items);
  const midpoint = Math.ceil(ordered.length / 2);

  return {
    older: ordered.slice(0, midpoint),
    newer: ordered.slice(midpoint)
  };
}

function ratio(items, predicate) {
  return items.length
    ? items.filter(predicate).length / items.length
    : 0;
}

function confidenceIsDegraded(snapshot = {}) {
  return ["LOW", "AVOID"].includes(snapshot.confidenceLevel);
}

function behaviorIsUnstable(event = {}) {
  return ["OVERACTIVE", "UNCERTAIN", "CAUTIOUS"].includes(event.mood) ||
    ["UNSTABLE", "OVERACTIVE"].includes(event.behavioralState) ||
    event.riskLevel === "HIGH";
}

function anomalyIsElevated(event = {}) {
  return ["HIGH", "MEDIUM"].includes(event.severity);
}

function runtimeIsDegraded(event = {}) {
  const status = event.status || event.metadata?.status || event.runtimeStatus;

  return ["DEGRADED", "UNSTABLE", "CRITICAL"].includes(status);
}

function consensusIsFragmented(snapshot = {}) {
  return snapshot.consensusStrength === "CONFLICTED";
}

function environmentIsDeteriorated(item = {}) {
  const environment = item.environment ||
    item.metadata?.environment ||
    item.strategicEnvironment;

  return ["UNSTABLE", "HIGH_RISK"].includes(environment);
}

function newerWorse(comparison, minimumNewerRatio = 0.5) {
  return comparison.newerCount > 0 &&
    comparison.newerRatio >= minimumNewerRatio &&
    comparison.newerRatio > comparison.olderRatio;
}

function compareCollection(items, predicate) {
  const history = splitHistory(items);

  return {
    totalEvents: history.older.length + history.newer.length,
    olderCount: history.older.filter(predicate).length,
    newerCount: history.newer.filter(predicate).length,
    olderRatio: Number(ratio(history.older, predicate).toFixed(2)),
    newerRatio: Number(ratio(history.newer, predicate).toFixed(2))
  };
}

function compareTimelineStates(input = {}) {
  const strategicEnvironmentEvents = [
    ...safeArray(input.timelineEvents).filter((event) => event.type === "environment"),
    ...safeArray(input.strategicSnapshots)
  ];

  return {
    confidence_decay: compareCollection(
      input.strategicSnapshots,
      confidenceIsDegraded
    ),
    behavioral_instability: compareCollection(
      input.behavioralTimeline,
      behaviorIsUnstable
    ),
    anomaly_escalation: compareCollection(
      input.anomalyEvents,
      anomalyIsElevated
    ),
    runtime_degradation: compareCollection(
      [
        ...safeArray(input.runtimeEvents),
        ...safeArray(input.strategicSnapshots)
      ],
      runtimeIsDegraded
    ),
    fragmented_consensus: compareCollection(
      input.strategicSnapshots,
      consensusIsFragmented
    ),
    strategic_environment_deterioration: compareCollection(
      strategicEnvironmentEvents,
      environmentIsDeteriorated
    )
  };
}

function classifyDriftSeverity(driftCategories = []) {
  const count = Array.isArray(driftCategories) ? driftCategories.length : 0;

  if (count >= 3) return "HIGH";
  if (count === 2) return "MODERATE";
  if (count === 1) return "LOW";
  return "NONE";
}

function buildDriftObservations(comparisons, driftCategories) {
  if (!driftCategories.length) {
    return ["Supplied history remains comparatively stable across drift checks."];
  }

  return driftCategories.map((category) => {
    const comparison = comparisons[category];
    return `${category} worsens from ${comparison.olderCount} older markers to ${comparison.newerCount} newer markers.`;
  });
}

function buildDriftSummary(severity, driftCategories) {
  if (severity === "NONE") {
    return "No cognitive drift is detected in supplied intelligence history.";
  }

  return `${severity} cognitive drift is detected across ${driftCategories.length} review categor${driftCategories.length === 1 ? "y" : "ies"}.`;
}

function detectCognitiveDrift(input = {}) {
  const comparisons = compareTimelineStates(input);
  const driftCategories = Object.entries(comparisons)
    .filter(([, comparison]) => newerWorse(comparison))
    .map(([category]) => category);
  const severity = classifyDriftSeverity(driftCategories);

  return {
    driftDetected: driftCategories.length > 0,
    severity,
    driftCategories: unique(driftCategories),
    observations: buildDriftObservations(comparisons, driftCategories),
    summary: buildDriftSummary(severity, driftCategories)
  };
}

function summarizeCognitiveDrift(drift = {}) {
  const detectedCategories = Array.isArray(drift.driftCategories)
    ? drift.driftCategories
    : [];
  const dominantDrift = detectedCategories[0] || "NONE";

  return {
    detectedCategories,
    dominantDrift,
    observations: drift.driftDetected
      ? [
        `${detectedCategories.length} drift categories are detected.`,
        `Dominant drift category is ${dominantDrift}.`
      ]
      : ["No cognitive drift categories are detected."]
  };
}

module.exports = {
  classifyDriftSeverity,
  compareTimelineStates,
  detectCognitiveDrift,
  summarizeCognitiveDrift
};
