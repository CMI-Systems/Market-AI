/*
 * Priority cognition feed for Market AI.
 * Generates rolling operator-awareness events from backend cognition only.
 */

const AWAITING_PRIORITY_FEED = "Awaiting cognition feed.";
const MAX_EVENTS = 30;
const feedEvents = [];

function pushEvent(type, message, severity = "LOW") {
  feedEvents.push({
    type,
    timestamp: new Date().toISOString(),
    message,
    severity
  });

  while (feedEvents.length > MAX_EVENTS) {
    feedEvents.shift();
  }
}

function clearPriorityFeed() {
  feedEvents.length = 0;
}

function evaluatePriorityCognitionFeed(input = {}) {
  const adaptiveSignals = input.adaptiveSignalIntelligence || {};
  const consensus = input.crossBrainConsensus || {};
  const temporalMemory = input.temporalMemory || {};
  const liquidity = input.liquidityPressure || {};
  const causality = input.environmentalCausality || {};

  if (!adaptiveSignals.signalState && !consensus.consensusState && !temporalMemory.temporalState) {
    return {
      feedState: "UNKNOWN",
      events: [],
      warnings: [],
      summary: AWAITING_PRIORITY_FEED
    };
  }

  pushEvent("INFO", `Adaptive signal state is ${adaptiveSignals.signalState || "UNKNOWN"}.`, "LOW");

  if (["SUPPRESSED", "UNSTABLE"].includes(adaptiveSignals.signalState)) {
    pushEvent("SUPPRESSION", "Adaptive validation is constrained by backend cognition.", "HIGH");
  }

  if (consensus.consensusState && consensus.consensusState !== "UNKNOWN") {
    pushEvent("CONSENSUS", `Brain consensus state is ${consensus.consensusState}.`, consensus.divergenceRisk === "SEVERE" ? "HIGH" : "MODERATE");
  }

  if (["PRESSURED", "FRAGMENTED"].includes(liquidity.liquidityState)) {
    pushEvent("CAUTION", "Liquidity pressure is elevated in backend cognition.", "MODERATE");
  }

  if (["STABLE_MEMORY", "RECURRING_PATTERN"].includes(temporalMemory.temporalState)) {
    pushEvent("STABILIZATION", "Temporal memory shows stable or recurring cognition.", "LOW");
  }

  if (["VOLATILE_CAUSALITY", "FRACTURED_CAUSALITY"].includes(causality.causalityState)) {
    pushEvent("DRIFT", "Environmental causality is unstable.", "HIGH");
  }

  const recent = feedEvents.slice(-10).reverse();
  const highSeverity = recent.filter((event) => event.severity === "HIGH").length;

  return {
    feedState: highSeverity >= 3 ? "DEGRADED" : recent.length ? "ACTIVE" : "QUIET",
    events: recent,
    warnings: highSeverity >= 3 ? ["Priority feed contains repeated high-severity cognition events."] : [],
    summary: recent.length
      ? `Priority cognition feed contains ${recent.length} recent backend events.`
      : AWAITING_PRIORITY_FEED
  };
}

module.exports = {
  AWAITING_PRIORITY_FEED,
  clearPriorityFeed,
  evaluatePriorityCognitionFeed
};
