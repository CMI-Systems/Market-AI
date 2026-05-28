/*
 * Deterministic state transition detection across supplied intelligence history.
 * This layer compares known state changes without creating adaptive AI behavior.
 */

const STATE_FIELDS = {
  strategic_environment: [
    "strategicEnvironment",
    "environment"
  ],
  runtime_health: [
    "runtimeStatus",
    "status"
  ],
  confidence_structure: [
    "confidenceLevel",
    "level"
  ],
  behavioral_state: [
    "behavioralState",
    "mood"
  ],
  anomaly_state: [
    "anomalySeverity",
    "severity"
  ],
  consensus_state: [
    "consensusStrength"
  ]
};

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

function safeTimestamp(item = {}) {
  const value = item.timestamp || item.savedAt || item.createdAt;
  const parsed = value ? new Date(value) : null;

  return parsed && !Number.isNaN(parsed.getTime())
    ? parsed.toISOString()
    : new Date(0).toISOString();
}

function readField(item, field) {
  const metadata = safeMetadata(item.metadata);
  const fieldValue = item[field] ?? metadata[field];

  if (fieldValue && typeof fieldValue === "object" && !Array.isArray(fieldValue)) {
    return fieldValue.level ||
      fieldValue.status ||
      fieldValue.environment ||
      fieldValue.consensusStrength ||
      "";
  }

  return fieldValue;
}

function stateForCategory(item, category) {
  return STATE_FIELDS[category]
    .map((field) => safeString(readField(item, field)))
    .find(Boolean) || "";
}

function categoriesForItem(item = {}) {
  const type = safeString(item.type).toLowerCase();

  if (type === "environment") return ["strategic_environment"];
  if (type === "runtime") return ["runtime_health"];
  if (type === "behavioral" || type === "journal") return ["behavioral_state"];
  if (type === "anomaly") return ["anomaly_state"];

  return Object.keys(STATE_FIELDS).filter((category) => {
    return Boolean(stateForCategory(item, category));
  });
}

function stateObservation(category, state, item) {
  return {
    category,
    state,
    timestamp: safeTimestamp(item),
    order: timestampValue(item)
  };
}

function collectObservations(input = {}) {
  const sources = [
    ...safeArray(input.timelineEvents),
    ...safeArray(input.strategicSnapshots),
    ...safeArray(input.runtimeEvents),
    ...safeArray(input.behavioralTimeline),
    ...safeArray(input.prioritizedInsights)
  ];

  return sources.flatMap((item) => {
    return categoriesForItem(item)
      .map((category) => stateObservation(
        category,
        stateForCategory(item, category),
        item
      ))
      .filter((observation) => observation.state);
  });
}

function uniqueChronologicalStates(observations = []) {
  return [...observations]
    .sort((first, second) => first.order - second.order)
    .reduce((states, observation) => {
      const previous = states[states.length - 1];

      if (!previous || previous.state !== observation.state) {
        states.push(observation);
      }

      return states;
    }, []);
}

function highSeverityTarget(category, toState) {
  const state = safeString(toState).toUpperCase();

  return {
    strategic_environment: ["UNSTABLE", "HIGH_RISK"],
    runtime_health: ["UNSTABLE", "CRITICAL"],
    confidence_structure: ["AVOID"],
    behavioral_state: ["UNSTABLE"],
    anomaly_state: ["HIGH"],
    consensus_state: ["CONFLICTED"]
  }[category]?.includes(state) || false;
}

function moderateSeverityTarget(category, toState) {
  const state = safeString(toState).toUpperCase();

  return {
    strategic_environment: ["CAUTION"],
    runtime_health: ["DEGRADED"],
    confidence_structure: ["LOW"],
    behavioral_state: ["OVERACTIVE", "CAUTIOUS", "UNCERTAIN"],
    anomaly_state: ["MEDIUM"],
    consensus_state: ["WEAK"]
  }[category]?.includes(state) || false;
}

function classifyTransitionSeverity(transition = {}) {
  if (highSeverityTarget(transition.category, transition.toState)) {
    return "HIGH";
  }

  if (moderateSeverityTarget(transition.category, transition.toState)) {
    return "MODERATE";
  }

  return "LOW";
}

function describeCategory(category) {
  return category.replace(/_/g, " ");
}

function buildTransitionObservations(transition) {
  const observations = [
    `${describeCategory(transition.category)} changes from ${transition.fromState} to ${transition.toState}.`
  ];

  if (transition.severity === "HIGH") {
    observations.push("The newer state deserves elevated review attention.");
  } else if (transition.severity === "MODERATE") {
    observations.push("The newer state marks a noticeable review shift.");
  } else {
    observations.push("The state change remains mild under current rules.");
  }

  return observations;
}

function transitionSummary(transition) {
  return `${transition.severity} ${describeCategory(transition.category)} transition from ${transition.fromState} to ${transition.toState}.`;
}

function buildTransition(category, fromState, toState, timestamp, index) {
  const transition = {
    transitionId: `transition-${category}-${index + 1}`,
    fromState,
    toState,
    category,
    severity: classifyTransitionSeverity({
      category,
      toState
    }),
    timestamp,
    observations: [],
    summary: ""
  };

  transition.observations = buildTransitionObservations(transition);
  transition.summary = transitionSummary(transition);
  return transition;
}

function compareStrategicStates(states = [], category = "strategic_environment") {
  const orderedStates = uniqueChronologicalStates(
    safeArray(states)
      .map((state) => {
        const nextState = safeString(state.state) ||
          stateForCategory(state, category);

        return nextState
          ? stateObservation(category, nextState, state)
          : null;
      })
      .filter(Boolean)
  );

  return orderedStates.slice(1).map((state, index) => {
    const previous = orderedStates[index];

    return buildTransition(
      category,
      previous.state,
      state.state,
      state.timestamp,
      index
    );
  });
}

function severityRank(severity) {
  return {
    HIGH: 3,
    MODERATE: 2,
    LOW: 1
  }[severity] || 0;
}

function transitionTime(transition) {
  const parsed = transition.timestamp ? new Date(transition.timestamp).getTime() : NaN;

  return Number.isFinite(parsed) ? parsed : 0;
}

function detectStateTransitions(input = {}) {
  const observations = collectObservations(input);
  const transitions = Object.keys(STATE_FIELDS).flatMap((category) => {
    const categoryStates = observations.filter((observation) => {
      return observation.category === category;
    });

    return compareStrategicStates(categoryStates, category);
  });

  return transitions.sort((first, second) => {
    if (transitionTime(second) === transitionTime(first)) {
      return severityRank(second.severity) - severityRank(first.severity);
    }

    return transitionTime(second) - transitionTime(first);
  });
}

function dominantCategories(transitions) {
  const counts = transitions.reduce((distribution, transition) => {
    distribution[transition.category] = (distribution[transition.category] || 0) + 1;
    return distribution;
  }, {});
  const topCount = Math.max(0, ...Object.values(counts));

  return Object.entries(counts)
    .filter(([, count]) => count === topCount)
    .map(([category]) => category)
    .sort();
}

function summarizeStateTransitions(transitions = []) {
  const safeTransitions = safeArray(transitions);
  const highSeverityTransitions = safeTransitions.filter((transition) => {
    return transition.severity === "HIGH";
  }).length;

  return {
    totalTransitions: safeTransitions.length,
    dominantTransitionCategories: dominantCategories(safeTransitions),
    highSeverityTransitions,
    observations: safeTransitions.length
      ? [
        `${safeTransitions.length} cognitive state transitions are available for review.`,
        `${highSeverityTransitions} transitions carry high severity.`
      ]
      : ["No cognitive state transitions are detected in supplied history."]
  };
}

module.exports = {
  classifyTransitionSeverity,
  compareStrategicStates,
  detectStateTransitions,
  summarizeStateTransitions
};
