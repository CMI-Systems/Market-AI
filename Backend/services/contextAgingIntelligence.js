/*
 * Context aging intelligence for Market AI.
 * Evaluates whether recent cognition history is fresh enough for visualization.
 */

const AWAITING_CONTEXT_AGING = "Awaiting context aging cognition.";

function clamp(value) {
  return Number(Math.max(0, Math.min(1, value)).toFixed(2));
}

function minutesSince(timestamp) {
  const time = Date.parse(timestamp);
  if (!Number.isFinite(time)) return Infinity;
  return (Date.now() - time) / 60000;
}

function ageStateFor(score, historyCount) {
  if (historyCount < 3) return "INSUFFICIENT";
  if (score >= 0.75) return "FRESH";
  if (score >= 0.45) return "AGING";
  return "STALE";
}

function evaluateContextAging(input = {}) {
  const history = Array.isArray(input.history) ? input.history : [];

  if (history.length < 3) {
    return {
      contextAgeState: "INSUFFICIENT",
      freshnessScore: 0,
      staleContexts: [],
      warnings: [],
      summary: AWAITING_CONTEXT_AGING
    };
  }

  const latest = history[history.length - 1] || {};
  const ageMinutes = minutesSince(latest.timestamp);
  const recencyScore = ageMinutes <= 1
    ? 1
    : ageMinutes <= 5
      ? 0.78
      : ageMinutes <= 15
        ? 0.48
        : 0.2;
  const depthScore = clamp(history.length / 20);
  const freshnessScore = clamp(recencyScore * 0.7 + depthScore * 0.3);
  const staleContexts = [];

  if (ageMinutes > 5) {
    staleContexts.push("Latest cognition record is aging.");
  }

  if (history.length < 6) {
    staleContexts.push("Timeline evidence is still shallow.");
  }

  if (latest.confidenceLevel === "UNKNOWN") {
    staleContexts.push("Confidence context is incomplete.");
  }

  const contextAgeState = ageStateFor(freshnessScore, history.length);

  return {
    contextAgeState,
    freshnessScore,
    staleContexts,
    warnings: staleContexts,
    summary: `${contextAgeState} cognition context with ${Math.round(freshnessScore * 100)}% freshness.`
  };
}

module.exports = {
  AWAITING_CONTEXT_AGING,
  evaluateContextAging
};
