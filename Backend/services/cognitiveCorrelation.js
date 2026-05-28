/*
 * Deterministic cognitive correlation engine.
 * It links related instability conditions without creating adaptive AI behavior.
 */

const ONE_MINUTE_MS = 60 * 1000;
const CORRELATION_WINDOW_MS = 5 * ONE_MINUTE_MS;

function safeArray(value) {
  return Array.isArray(value)
    ? value.filter((item) => item && typeof item === "object")
    : [];
}

function safeString(value, fallback = "") {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : fallback;
}

function safeMetadata(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function timestampValue(item = {}) {
  const timestamp = item.timestamp || item.savedAt || item.createdAt;
  const parsed = timestamp ? new Date(timestamp).getTime() : NaN;

  return Number.isFinite(parsed) ? parsed : 0;
}

function unique(values) {
  return [...new Set(values.filter((value) => {
    return typeof value === "string" && value.trim();
  }))];
}

function safeStringArray(value) {
  return Array.isArray(value) ? unique(value) : [];
}

function eventLabel(event = {}) {
  return safeString(event.id || event.transitionId || event.correlationId, "unlabeled-event");
}

function anomalyIsElevated(event = {}) {
  return ["HIGH", "MEDIUM"].includes(event.severity || event.anomalySeverity);
}

function runtimeIsDegraded(event = {}) {
  const metadata = safeMetadata(event.metadata);
  const status = event.status || event.runtimeStatus || metadata.status || metadata.runtimeStatus;

  return ["DEGRADED", "UNSTABLE", "CRITICAL"].includes(status);
}

function confidenceIsDegraded(snapshot = {}) {
  return ["LOW", "AVOID"].includes(snapshot.confidenceLevel || snapshot.level);
}

function behaviorIsUnstable(event = {}) {
  return ["UNSTABLE", "OVERACTIVE"].includes(event.behavioralState) ||
    ["OVERACTIVE", "UNCERTAIN", "CAUTIOUS"].includes(event.mood) ||
    event.riskLevel === "HIGH";
}

function strategicIsFragmented(snapshot = {}) {
  const metadata = safeMetadata(snapshot.metadata);
  const environment = snapshot.strategicEnvironment ||
    snapshot.environment ||
    metadata.environment ||
    metadata.strategicEnvironment;
  const consensus = snapshot.consensusStrength || metadata.consensusStrength;

  return ["UNSTABLE", "HIGH_RISK"].includes(environment) ||
    consensus === "CONFLICTED";
}

function driftIsActive(drift = {}) {
  return drift.driftDetected === true ||
    ["HIGH", "MODERATE", "LOW"].includes(drift.severity) ||
    safeArray(drift.driftCategories).length > 0;
}

function transitionIsBehavioral(transition = {}) {
  return transition.category === "behavioral_state" &&
    ["HIGH", "MODERATE"].includes(transition.severity);
}

function transitionIsFragmented(transition = {}) {
  return transition.category === "consensus_state" &&
    transition.toState === "CONFLICTED";
}

function transitionIsStrategic(transition = {}) {
  return transition.category === "strategic_environment" &&
    ["HIGH", "MODERATE"].includes(transition.severity);
}

function highPriorityInsight(event = {}) {
  return ["CRITICAL", "HIGH"].includes(event.priority);
}

function normalizeTimelineEvents(timelineEvents = []) {
  return safeArray(timelineEvents);
}

function eventsNear(first = {}, second = {}, windowMs = CORRELATION_WINDOW_MS) {
  const firstTime = timestampValue(first);
  const secondTime = timestampValue(second);

  if (!firstTime || !secondTime) {
    return false;
  }

  return Math.abs(firstTime - secondTime) <= windowMs;
}

function countNearbyPairs(leftEvents, rightEvents) {
  return safeArray(leftEvents).reduce((count, leftEvent) => {
    return count + safeArray(rightEvents).filter((rightEvent) => {
      return eventsNear(leftEvent, rightEvent);
    }).length;
  }, 0);
}

function relatedEventIds(...eventGroups) {
  return unique(eventGroups.flatMap((group) => {
    return safeArray(group).map(eventLabel);
  }));
}

function scoreCorrelationStrength(input = {}) {
  const eventCount = Array.isArray(input.relatedEvents)
    ? input.relatedEvents.length
    : 0;
  const nearbyPairs = input.nearbyPairs || 0;
  const hasDrift = input.hasDrift === true;
  const categoryCount = safeStringArray(input.categories).length;

  if (eventCount < 2 && !hasDrift) return "INSUFFICIENT";
  if ((nearbyPairs >= 2 && eventCount >= 4) || categoryCount >= 3) return "STRONG";
  if (nearbyPairs >= 1 || eventCount >= 3 || hasDrift) return "MODERATE";
  return "WEAK";
}

function buildCorrelation(input = {}) {
  const categories = safeStringArray(input.categories);
  const relatedEvents = relatedEventIds(...safeArray(input.eventGroups));
  const strength = scoreCorrelationStrength({
    categories,
    relatedEvents,
    nearbyPairs: input.nearbyPairs,
    hasDrift: input.hasDrift
  });

  return {
    correlationId: input.correlationId,
    categories,
    strength,
    relatedEvents,
    observations: strength === "INSUFFICIENT"
      ? ["Not enough linked observations are available for this correlation."]
      : [
        `${relatedEvents.length} related observations are linked.`,
        safeString(input.observation, "Linked cognitive conditions are available for review.")
      ],
    summary: strength === "INSUFFICIENT"
      ? "Insufficient data for this cognitive correlation."
      : safeString(input.summary, "Cognitive correlation is available for review.")
  };
}

function groupCorrelatedEvents(input = {}) {
  const timelineEvents = normalizeTimelineEvents(input.timelineEvents);
  const anomalies = [
    ...safeArray(input.anomalies),
    ...timelineEvents.filter((event) => event.type === "anomaly")
  ].filter(anomalyIsElevated);
  const runtimeEvents = [
    ...safeArray(input.runtimeEvents),
    ...timelineEvents.filter((event) => event.type === "runtime")
  ].filter(runtimeIsDegraded);
  const behavioralEvents = safeArray(input.behavioralTimeline)
    .filter(behaviorIsUnstable);
  const strategicSnapshots = safeArray(input.strategicSnapshots);
  const degradedConfidence = strategicSnapshots.filter(confidenceIsDegraded);
  const fragmentedStrategy = strategicSnapshots.filter(strategicIsFragmented);
  const transitions = safeArray(input.cognitiveTransitions);
  const behavioralTransitions = transitions.filter(transitionIsBehavioral);
  const fragmentedTransitions = transitions.filter(transitionIsFragmented);
  const strategicTransitions = transitions.filter(transitionIsStrategic);
  const highPriorityEvents = timelineEvents.filter(highPriorityInsight);
  const cognitiveDrift = input.cognitiveDrift || {};
  const hasDrift = driftIsActive(cognitiveDrift);

  return [
    buildCorrelation({
      correlationId: "correlation-anomaly-runtime",
      categories: ["anomaly_runtime"],
      eventGroups: [anomalies, runtimeEvents],
      nearbyPairs: countNearbyPairs(anomalies, runtimeEvents),
      observation: "Elevated anomaly events occur near degraded runtime states.",
      summary: "Anomaly escalation is correlated with runtime instability."
    }),
    buildCorrelation({
      correlationId: "correlation-confidence-behavioral",
      categories: ["confidence_behavioral"],
      eventGroups: [degradedConfidence, behavioralEvents],
      nearbyPairs: countNearbyPairs(degradedConfidence, behavioralEvents),
      observation: "Restrained confidence appears near behavioral instability markers.",
      summary: "Confidence decay is correlated with behavioral instability."
    }),
    buildCorrelation({
      correlationId: "correlation-strategic-anomaly",
      categories: ["strategic_anomaly"],
      eventGroups: [fragmentedStrategy, anomalies],
      nearbyPairs: countNearbyPairs(fragmentedStrategy, anomalies),
      observation: "Strategic fragmentation appears near elevated anomaly context.",
      summary: "Strategic fragmentation is correlated with anomaly activity."
    }),
    buildCorrelation({
      correlationId: "correlation-runtime-drift",
      categories: ["runtime_drift"],
      eventGroups: [runtimeEvents],
      nearbyPairs: 0,
      hasDrift,
      observation: "Runtime instability overlaps detected cognitive drift.",
      summary: "Runtime degradation is correlated with cognitive drift."
    }),
    buildCorrelation({
      correlationId: "correlation-behavioral-transition",
      categories: ["behavioral_transition"],
      eventGroups: [behavioralEvents, behavioralTransitions],
      nearbyPairs: countNearbyPairs(behavioralEvents, behavioralTransitions),
      observation: "Behavioral instability appears near behavioral state transitions.",
      summary: "Behavioral deterioration is correlated with state transitions."
    }),
    buildCorrelation({
      correlationId: "correlation-consensus-fragmentation",
      categories: ["consensus_fragmentation"],
      eventGroups: [fragmentedStrategy, fragmentedTransitions],
      nearbyPairs: countNearbyPairs(fragmentedStrategy, fragmentedTransitions),
      observation: "Conflicted consensus appears near fragmentation transitions.",
      summary: "Consensus fragmentation is correlated with cognitive transition pressure."
    }),
    buildCorrelation({
      correlationId: "correlation-multi-system-instability",
      categories: ["multi_system_instability"],
      eventGroups: [
        anomalies,
        runtimeEvents,
        behavioralEvents,
        fragmentedStrategy,
        strategicTransitions,
        highPriorityEvents
      ],
      nearbyPairs: countNearbyPairs(anomalies, runtimeEvents) +
        countNearbyPairs(behavioralEvents, strategicTransitions),
      hasDrift,
      observation: "Multiple instability systems are active in the same review context.",
      summary: "Multi-system instability is visible across supplied cognition history."
    })
  ];
}

function detectCognitiveCorrelations(input = {}) {
  return groupCorrelatedEvents(input).filter((correlation) => {
    return correlation.strength !== "INSUFFICIENT";
  });
}

function strongestCategories(correlations) {
  const rank = {
    STRONG: 3,
    MODERATE: 2,
    WEAK: 1,
    INSUFFICIENT: 0
  };
  const topRank = Math.max(0, ...safeArray(correlations).map((correlation) => {
    return rank[correlation.strength] || 0;
  }));

  if (!topRank) return [];

  return unique(safeArray(correlations)
    .filter((correlation) => (rank[correlation.strength] || 0) === topRank)
    .flatMap((correlation) => correlation.categories))
    .sort();
}

function summarizeCognitiveCorrelations(correlations = []) {
  const safeCorrelations = safeArray(correlations);
  const multiSystemInstabilityDetected = safeCorrelations.some((correlation) => {
    return correlation.categories.includes("multi_system_instability") &&
      ["STRONG", "MODERATE"].includes(correlation.strength);
  });

  return {
    totalCorrelations: safeCorrelations.length,
    strongestCategories: strongestCategories(safeCorrelations),
    multiSystemInstabilityDetected,
    observations: safeCorrelations.length
      ? [
        `${safeCorrelations.length} cognitive correlations are available for review.`,
        `${safeCorrelations.filter((correlation) => correlation.strength === "STRONG").length} strong correlations are present.`
      ]
      : ["No cognitive correlations are available yet."]
  };
}

module.exports = {
  detectCognitiveCorrelations,
  groupCorrelatedEvents,
  scoreCorrelationStrength,
  summarizeCognitiveCorrelations
};
