/*
 * Event escalation engine for Market AI.
 * It identifies review-priority instability without creating alerts or recommendations.
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

function unique(values) {
  return [...new Set(values.filter((value) => {
    return typeof value === "string" && value.trim();
  }))];
}

function escalationRank(level) {
  return {
    NONE: 0,
    LOW: 1,
    MODERATE: 2,
    HIGH: 3,
    CRITICAL: 4
  }[level] || 0;
}

function levelFromScore(score) {
  if (score >= 0.9) return "CRITICAL";
  if (score >= 0.68) return "HIGH";
  if (score >= 0.4) return "MODERATE";
  if (score > 0) return "LOW";
  return "NONE";
}

function strongestLevel(levels) {
  return levels.reduce((highest, level) => {
    return escalationRank(level) > escalationRank(highest) ? level : highest;
  }, "NONE");
}

function highPriorityInsights(prioritizedInsights = []) {
  return safeArray(prioritizedInsights).filter((insight) => {
    return ["CRITICAL", "HIGH"].includes(insight.priority);
  });
}

function strongCorrelations(cognitiveCorrelations = []) {
  return safeArray(cognitiveCorrelations).filter((correlation) => {
    return correlation.strength === "STRONG";
  });
}

function highTransitions(cognitiveTransitions = []) {
  return safeArray(cognitiveTransitions).filter((transition) => {
    return transition.severity === "HIGH";
  });
}

function trigger(label, level, reason) {
  return {
    type: label,
    level,
    reason
  };
}

function detectEscalationTriggers(input = {}) {
  const triggers = [];
  const insights = highPriorityInsights(input.prioritizedInsights);
  const correlations = strongCorrelations(input.cognitiveCorrelations);
  const transitions = highTransitions(input.cognitiveTransitions);

  if (input.anomalyIntelligence?.severity === "HIGH") {
    triggers.push(trigger(
      "anomaly_escalation",
      "CRITICAL",
      "Severe anomaly escalation is present."
    ));
  } else if (input.anomalyIntelligence?.severity === "MEDIUM") {
    triggers.push(trigger(
      "anomaly_escalation",
      "MODERATE",
      "Elevated anomaly conditions deserve review."
    ));
  }

  if (input.runtimeHealth?.status === "CRITICAL") {
    triggers.push(trigger(
      "runtime_degradation",
      "CRITICAL",
      "Runtime health is critical."
    ));
  } else if (["DEGRADED", "UNSTABLE"].includes(input.runtimeHealth?.status)) {
    triggers.push(trigger(
      "runtime_degradation",
      "HIGH",
      "Runtime health is degraded or unstable."
    ));
  }

  if (
    input.strategicEnvironment?.environment === "HIGH_RISK" ||
    input.strategicEnvironment?.stability === "FRAGMENTED"
  ) {
    triggers.push(trigger(
      "strategic_fragmentation",
      "CRITICAL",
      "Strategic environment is high risk or fragmented."
    ));
  } else if (input.strategicEnvironment?.environment === "UNSTABLE") {
    triggers.push(trigger(
      "strategic_fragmentation",
      "HIGH",
      "Strategic environment is unstable."
    ));
  }

  if (input.environmentalPressure?.pressureLevel === "EXTREME") {
    triggers.push(trigger(
      "pressure_escalation",
      "CRITICAL",
      "Environmental pressure is extreme."
    ));
  } else if (input.environmentalPressure?.pressureLevel === "HIGH") {
    triggers.push(trigger(
      "pressure_escalation",
      "HIGH",
      "Environmental pressure is high."
    ));
  } else if (input.environmentalPressure?.pressureLevel === "MODERATE") {
    triggers.push(trigger(
      "pressure_escalation",
      "MODERATE",
      "Environmental pressure is elevated enough for review."
    ));
  }

  if (input.intelligenceStabilityForecast?.trajectory === "FRAGMENTING") {
    triggers.push(trigger(
      "instability_forecast",
      "CRITICAL",
      "Intelligence stability forecast is fragmenting."
    ));
  } else if (input.intelligenceStabilityForecast?.trajectory === "DETERIORATING") {
    triggers.push(trigger(
      "instability_forecast",
      "HIGH",
      "Intelligence stability forecast is deteriorating."
    ));
  }

  if (input.intelligenceConsensus?.consensusStrength === "CONFLICTED") {
    triggers.push(trigger(
      "strategic_fragmentation",
      "HIGH",
      "Intelligence consensus is conflicted."
    ));
  }

  if (transitions.length) {
    triggers.push(trigger(
      "transition_escalation",
      transitions.length >= 2 ? "HIGH" : "MODERATE",
      `${transitions.length} high-severity cognitive transitions are present.`
    ));
  }

  if (correlations.length >= 2) {
    triggers.push(trigger(
      "instability_clustering",
      "CRITICAL",
      "Multiple strong cognitive correlations indicate clustered instability."
    ));
  } else if (correlations.length === 1) {
    triggers.push(trigger(
      "instability_clustering",
      "HIGH",
      "A strong cognitive correlation indicates linked instability."
    ));
  }

  if (insights.length) {
    triggers.push(trigger(
      "review_priority",
      insights.some((insight) => insight.priority === "CRITICAL") ? "HIGH" : "MODERATE",
      `${insights.length} prioritized insights deserve elevated review.`
    ));
  }

  return triggers;
}

function classifyEscalationLevel(input = {}) {
  const triggers = input.escalationTriggers || detectEscalationTriggers(input);
  const highestTriggerLevel = strongestLevel(triggers.map((item) => item.level));
  const triggerScore = triggers.reduce((score, item) => {
    return score + {
      CRITICAL: 0.38,
      HIGH: 0.24,
      MODERATE: 0.14,
      LOW: 0.06
    }[item.level];
  }, 0);
  const scoreLevel = levelFromScore(triggerScore);

  if (!triggers.length) {
    return "NONE";
  }

  return strongestLevel([highestTriggerLevel, scoreLevel]);
}

function eventFromInsight(insight = {}) {
  return {
    id: safeString(insight.id, `insight-${safeString(insight.type, "event")}`),
    type: "prioritized_insight",
    level: insight.priority === "CRITICAL" ? "CRITICAL" : "HIGH",
    summary: safeString(insight.summary, "Prioritized intelligence deserves review.")
  };
}

function eventFromTransition(transition = {}) {
  return {
    id: safeString(transition.transitionId, "transition-event"),
    type: "cognitive_transition",
    level: transition.severity === "HIGH" ? "HIGH" : "MODERATE",
    summary: safeString(transition.summary, "Cognitive transition deserves review.")
  };
}

function eventFromCorrelation(correlation = {}) {
  return {
    id: safeString(correlation.correlationId, "correlation-event"),
    type: "cognitive_correlation",
    level: correlation.strength === "STRONG" ? "HIGH" : "MODERATE",
    summary: safeString(correlation.summary, "Cognitive correlation deserves review.")
  };
}

function buildElevatedEvents(input = {}, escalationTriggers = []) {
  const events = [];

  highPriorityInsights(input.prioritizedInsights).forEach((insight) => {
    events.push(eventFromInsight(insight));
  });

  highTransitions(input.cognitiveTransitions).forEach((transition) => {
    events.push(eventFromTransition(transition));
  });

  strongCorrelations(input.cognitiveCorrelations).forEach((correlation) => {
    events.push(eventFromCorrelation(correlation));
  });

  escalationTriggers.forEach((item) => {
    if (["CRITICAL", "HIGH"].includes(item.level)) {
      events.push({
        id: `trigger-${item.type}`,
        type: item.type,
        level: item.level,
        summary: item.reason
      });
    }
  });

  return events;
}

function buildWarnings(escalationLevel, triggers = []) {
  const warnings = [];

  if (escalationLevel === "CRITICAL") {
    warnings.push("Critical escalation conditions are present.");
  } else if (escalationLevel === "HIGH") {
    warnings.push("High escalation conditions deserve elevated review.");
  }

  if (triggers.some((item) => item.type === "runtime_degradation")) {
    warnings.push("Runtime degradation is part of the escalation context.");
  }

  if (triggers.some((item) => item.type === "instability_clustering")) {
    warnings.push("Instability clustering is present.");
  }

  return unique(warnings);
}

function buildObservations(escalationLevel, triggers = [], elevatedEvents = []) {
  if (escalationLevel === "NONE") {
    return ["No meaningful escalation conditions are detected."];
  }

  return [
    `${triggers.length} escalation triggers are active.`,
    `${elevatedEvents.length} elevated events are available for review.`,
    `Escalation level is ${escalationLevel}.`
  ];
}

function buildSummary(escalationLevel, triggers = []) {
  if (escalationLevel === "NONE") {
    return "No event escalation is detected from available context.";
  }

  const triggerTypes = unique(triggers.map((item) => item.type));

  return `${escalationLevel} event escalation is active across ${triggerTypes.length} trigger groups.`;
}

function evaluateEventEscalation(input = {}) {
  const escalationTriggers = detectEscalationTriggers(input);
  const escalationLevel = classifyEscalationLevel({
    ...input,
    escalationTriggers
  });
  const elevatedEvents = buildElevatedEvents(input, escalationTriggers);
  const warnings = buildWarnings(escalationLevel, escalationTriggers);
  const observations = buildObservations(escalationLevel, escalationTriggers, elevatedEvents);

  return {
    escalationLevel,
    escalationTriggers,
    elevatedEvents,
    warnings,
    observations,
    summary: buildSummary(escalationLevel, escalationTriggers)
  };
}

function summarizeEscalationEvents(escalations = []) {
  const safeEscalations = safeArray(escalations);
  const triggerTypes = safeEscalations.flatMap((escalation) => {
    return safeArray(escalation.escalationTriggers).map((triggerItem) => {
      return triggerItem.type;
    });
  });
  const triggerCounts = triggerTypes.reduce((counts, type) => {
    counts[type] = (counts[type] || 0) + 1;
    return counts;
  }, {});
  const topCount = Math.max(0, ...Object.values(triggerCounts));

  return {
    totalEscalations: safeEscalations.length,
    dominantEscalationTypes: Object.entries(triggerCounts)
      .filter(([, count]) => count === topCount && topCount > 0)
      .map(([type]) => type)
      .sort(),
    highestEscalationLevel: strongestLevel(safeEscalations.map((escalation) => {
      return escalation.escalationLevel;
    })),
    observations: safeEscalations.length
      ? [`${safeEscalations.length} escalation evaluations are available for review.`]
      : ["No escalation evaluations are available yet."]
  };
}

module.exports = {
  classifyEscalationLevel,
  detectEscalationTriggers,
  evaluateEventEscalation,
  summarizeEscalationEvents
};
