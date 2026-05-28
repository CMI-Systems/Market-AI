/*
 * Replay timeline engine for Market AI.
 * Converts temporal cognition history into operator drilldown events.
 */

const AWAITING_REPLAY_TIMELINE = "Awaiting replay timeline.";

function state(value, fallback = "UNKNOWN") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function replayStateFor(item = {}) {
  if (["SUPPRESSED", "UNSTABLE"].includes(item.signalState)) return "DRIFT";
  if (["FRAGMENTING", "VOLATILE", "DEGRADING"].includes(item.driftState)) return "FRAGMENTATION";
  if (["RECOVERING", "STABILIZING"].includes(item.environment) || item.liquidityState === "STABILIZING") return "STABILIZATION";
  if (["RECURRING_PATTERN", "STABLE_MEMORY"].includes(item.temporalState)) return "RECURRENCE";
  return "OBSERVING";
}

function evaluateReplayTimeline(input = {}) {
  const history = Array.isArray(input.history) ? input.history : [];

  if (history.length < 3) {
    return {
      replayState: "LIMITED",
      timeline: [],
      replaySummary: AWAITING_REPLAY_TIMELINE,
      recurrenceSignals: [],
      warnings: []
    };
  }

  const recent = history.slice(-12);
  const timeline = recent.map((item) => {
    const replayState = replayStateFor(item);
    return {
      timestamp: state(item.timestamp, new Date().toISOString()),
      environment: state(item.environment),
      cognitionShift: `${state(item.signalState)} / ${state(item.driftState)}`,
      replayState,
      confidenceLevel: state(item.confidenceLevel),
      summary: `${replayState} replay context with ${state(item.environment)} environment and ${state(item.confidenceLevel)} confidence.`
    };
  });
  const recurrenceSignals = Object.entries(recent.reduce((next, item) => {
    const key = state(item.environment);
    if (key !== "UNKNOWN") next[key] = (next[key] || 0) + 1;
    return next;
  }, {}))
    .filter(([, count]) => count >= 2)
    .map(([environment, count]) => ({ environment, count }));
  const driftCount = timeline.filter((event) => ["DRIFT", "FRAGMENTATION"].includes(event.replayState)).length;
  const stabilizationCount = timeline.filter((event) => event.replayState === "STABILIZATION").length;
  let replayState = "EVOLVING";
  if (driftCount >= 4) replayState = "DRIFTING";
  else if (stabilizationCount >= 4) replayState = "STABILIZING";
  else if (recurrenceSignals.length >= 2) replayState = "RECURRING";

  return {
    replayState,
    timeline,
    replaySummary: `${replayState} replay timeline across ${timeline.length} cognition records.`,
    recurrenceSignals,
    warnings: driftCount >= 4 ? ["Replay timeline contains repeated drift or fragmentation events."] : []
  };
}

module.exports = {
  AWAITING_REPLAY_TIMELINE,
  evaluateReplayTimeline
};
