/*
 * Deterministic prioritization for supplied intelligence observations.
 * It ranks review focus without creating alerts or changing decisions.
 */

function clamp(score) {
  return Number(Math.max(0, Math.min(1, score)).toFixed(2));
}

function safeEvents(events) {
  return Array.isArray(events)
    ? events.filter((event) => event && typeof event === "object")
    : [];
}

function safeString(value, fallback = "UNKNOWN") {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : fallback;
}

function classifyInsightPriority(score) {
  if (score >= 0.9) return "CRITICAL";
  if (score >= 0.7) return "HIGH";
  if (score >= 0.45) return "MEDIUM";
  if (score >= 0.2) return "LOW";
  return "BACKGROUND";
}

function fragmentedEnvironment(strategicEnvironment = {}) {
  return strategicEnvironment.stability === "FRAGMENTED" ||
    strategicEnvironment.environment === "HIGH_RISK";
}

function majorConflict(intelligenceConsensus = {}) {
  return intelligenceConsensus.consensusStrength === "CONFLICTED" ||
    (
      Array.isArray(intelligenceConsensus.conflictingSystems) &&
      intelligenceConsensus.conflictingSystems.length >= 3
    );
}

function buildPriorityReason(input = {}) {
  const event = input.event || {};

  if (event.severity === "HIGH" && event.type === "anomaly") {
    return "Severe anomaly observation deserves elevated review focus.";
  }

  if (input.runtimeHealth?.status === "CRITICAL") {
    return "Critical runtime context raises review priority.";
  }

  if (fragmentedEnvironment(input.strategicEnvironment)) {
    return "Fragmented strategic context raises review priority.";
  }

  if (input.behavioralIntelligence?.behavioralState === "UNSTABLE") {
    return "Unstable behavioral context deserves review.";
  }

  if (input.adaptiveMemoryScore?.importance === "HIGH") {
    return "High memory importance supports elevated visibility.";
  }

  return "Structured intelligence observation remains available for review.";
}

function eventSeverityScore(event = {}) {
  switch (event.severity) {
    case "HIGH":
      return 0.45;
    case "MEDIUM":
      return 0.28;
    case "LOW":
      return 0.12;
    default:
      return 0.03;
  }
}

function typeScore(event = {}) {
  switch (event.type) {
    case "anomaly":
      return 0.22;
    case "environment":
      return ["UNSTABLE", "HIGH_RISK"].includes(event.metadata?.environment)
        ? 0.24
        : 0.14;
    case "runtime":
      return event.metadata?.status === "CRITICAL" ? 0.24 : 0.14;
    case "behavioral":
      return event.metadata?.mood === "OVERACTIVE" ? 0.14 : 0.08;
    case "snapshot":
      return ["UNSTABLE", "HIGH_RISK"].includes(
        event.metadata?.strategicEnvironment
      )
        ? 0.18
        : 0.1;
    case "journal":
      return 0.06;
    default:
      return 0.03;
  }
}

function eventLooksLikeBackgroundNoise(event = {}) {
  return ["NONE", "LOW"].includes(event.severity) &&
    event.type === "journal" &&
    !["UNCERTAIN", "CAUTIOUS"].includes(event.metadata?.mood);
}

function scoreInsightPriority(input = {}) {
  const event = input.event || {};
  let score = 0.08 + eventSeverityScore(event) + typeScore(event);
  const reasons = [buildPriorityReason(input)];

  if (input.anomalyIntelligence?.severity === "HIGH") {
    score += 0.16;
    reasons.push("Current anomaly severity is high.");
  } else if (input.anomalyIntelligence?.severity === "MEDIUM") {
    score += 0.08;
    reasons.push("Current anomaly severity is elevated.");
  }

  if (input.runtimeHealth?.status === "CRITICAL") {
    score += 0.22;
    reasons.push("Runtime health is critical.");
  } else if (["DEGRADED", "UNSTABLE"].includes(input.runtimeHealth?.status)) {
    score += 0.12;
    reasons.push("Runtime health is degraded or unstable.");
  }

  if (fragmentedEnvironment(input.strategicEnvironment)) {
    score += 0.22;
    reasons.push("Strategic environment is fragmented or high risk.");
  } else if (
    ["UNSTABLE", "CAUTION"].includes(input.strategicEnvironment?.environment)
  ) {
    score += 0.1;
    reasons.push("Strategic environment warrants closer review.");
  }

  if (majorConflict(input.intelligenceConsensus)) {
    score += 0.16;
    reasons.push("Intelligence consensus shows material conflict.");
  }

  if (input.adaptiveMemoryScore?.importance === "HIGH") {
    score += 0.12;
    reasons.push("Adaptive memory importance is high.");
  } else if (input.adaptiveMemoryScore?.importance === "IGNORE") {
    score -= 0.08;
  }

  if (
    input.behavioralIntelligence?.behavioralState === "UNSTABLE" ||
    input.behavioralIntelligence?.riskLevel === "HIGH"
  ) {
    score += 0.12;
    reasons.push("Behavioral context is unstable or high risk.");
  } else if (input.behavioralIntelligence?.behavioralState === "OVERACTIVE") {
    score += 0.08;
    reasons.push("Behavioral activity is elevated.");
  }

  if (eventLooksLikeBackgroundNoise(event)) {
    score -= 0.14;
    reasons.push("Event resembles lower-signal review background.");
  }

  const priorityScore = clamp(score);

  return {
    priorityScore,
    priority: classifyInsightPriority(priorityScore),
    reasons
  };
}

function toPrioritizedInsight(event, context) {
  const scored = scoreInsightPriority({
    ...context,
    event
  });

  return {
    id: safeString(event.id),
    type: safeString(event.type),
    priorityScore: scored.priorityScore,
    priority: scored.priority,
    summary: safeString(event.summary, "Intelligence observation is available."),
    reasons: scored.reasons,
    timestamp: safeString(event.timestamp)
  };
}

function prioritizeInsights(input = {}) {
  return safeEvents(input.timelineEvents)
    .map((event) => toPrioritizedInsight(event, input))
    .sort((first, second) => {
      if (second.priorityScore === first.priorityScore) {
        return new Date(second.timestamp).getTime() - new Date(first.timestamp).getTime();
      }

      return second.priorityScore - first.priorityScore;
    });
}

module.exports = {
  buildPriorityReason,
  classifyInsightPriority,
  prioritizeInsights,
  scoreInsightPriority
};
