/*
 * Reinforcement weighting engine for Market AI.
 * Weights recurring cognition factors as advisory metadata only.
 */

const AWAITING_REINFORCEMENT_WEIGHTING = "Awaiting reinforcement weighting cognition.";

function clamp(value) {
  return Number(Math.max(0, Math.min(1, value)).toFixed(2));
}

function evaluateReinforcementWeighting(input = {}) {
  const history = Array.isArray(input.history) ? input.history : [];
  const recurrence = input.recurrenceIntelligence || {};

  if (history.length < 4) {
    return {
      reinforcementState: "INSUFFICIENT_DATA",
      reinforcedFactors: [],
      weakenedFactors: [],
      learningWeight: 0,
      warnings: [],
      summary: AWAITING_REINFORCEMENT_WEIGHTING
    };
  }

  const recent = history.slice(-16);
  const suppressed = recent.filter((item) => ["SUPPRESSED", "UNSTABLE"].includes(item.signalState)).length;
  const stable = recent.filter((item) => ["ALIGNED", "REINFORCED"].includes(item.signalState)).length;
  const recurringThemes = Array.isArray(recurrence.recurringThemes) ? recurrence.recurringThemes : [];
  const reinforcedFactors = recurringThemes.slice(0, 5).map((theme) => ({
    factor: theme.theme || theme.value || "Recurring cognition",
    weight: "REINFORCED"
  }));
  const weakenedFactors = suppressed >= 3
    ? [{ factor: "Suppression-heavy contexts", weight: "WEAKENED" }]
    : [];
  let reinforcementState = "OBSERVING";

  if (stable >= 5 && suppressed <= 1) {
    reinforcementState = "REINFORCING";
  } else if (suppressed >= 4) {
    reinforcementState = "WEAKENING";
  } else if (reinforcedFactors.length || weakenedFactors.length) {
    reinforcementState = "BALANCING";
  }

  return {
    reinforcementState,
    reinforcedFactors,
    weakenedFactors,
    learningWeight: clamp((stable + recurringThemes.length) / Math.max(1, recent.length + 4)),
    warnings: suppressed >= 4 ? ["Suppression recurrence weakens learning weight."] : [],
    summary: `${reinforcementState} advisory learning weights across recent cognition history.`
  };
}

module.exports = {
  AWAITING_REINFORCEMENT_WEIGHTING,
  evaluateReinforcementWeighting
};
