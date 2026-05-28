/*
 * Recurrence intelligence for Market AI.
 * Detects repeated cognition themes across recent in-memory history.
 */

const AWAITING_RECURRENCE = "Awaiting recurrence cognition.";

function stateOf(value) {
  return typeof value === "string" && value.trim() ? value : "UNKNOWN";
}

function addTheme(themes, affected, label, value, count, ecosystem = "Global") {
  if (count >= 2 && value !== "UNKNOWN") {
    themes.push({ theme: label, value, count });
    affected.add(ecosystem);
  }
}

function countValues(history, key) {
  return history.reduce((next, item) => {
    const value = stateOf(item[key]);
    next[value] = (next[value] || 0) + 1;
    return next;
  }, {});
}

function strengthFor(themeCount, historyCount) {
  if (themeCount >= 6 && historyCount >= 10) return "SEVERE";
  if (themeCount >= 4) return "HIGH";
  if (themeCount >= 2) return "MODERATE";
  if (themeCount === 1) return "LOW";
  return "UNKNOWN";
}

function recurrenceStateFor(strength) {
  return {
    LOW: "WEAK_RECURRENCE",
    MODERATE: "MODERATE_RECURRENCE",
    HIGH: "STRONG_RECURRENCE",
    SEVERE: "STRONG_RECURRENCE"
  }[strength] || "NO_RECURRENCE";
}

function evaluateRecurrenceIntelligence(input = {}) {
  const history = Array.isArray(input.history) ? input.history : [];

  if (history.length < 3) {
    return {
      recurrenceState: "UNKNOWN",
      recurrenceStrength: "UNKNOWN",
      recurringThemes: [],
      affectedEcosystems: [],
      warnings: [],
      summary: AWAITING_RECURRENCE
    };
  }

  const recent = history.slice(-16);
  const environmentCounts = countValues(recent, "environment");
  const confidenceCounts = countValues(recent, "confidenceLevel");
  const consensusCounts = countValues(recent, "consensusState");
  const driftCounts = countValues(recent, "driftState");
  const transitionCounts = countValues(recent, "transitionState");
  const liquidityCounts = countValues(recent, "liquidityState");
  const recurringThemes = [];
  const affected = new Set();

  addTheme(recurringThemes, affected, "Repeated caution environment", "CAUTION", environmentCounts.CAUTION || 0);
  addTheme(recurringThemes, affected, "Repeated low confidence", "LOW", confidenceCounts.LOW || 0);
  addTheme(recurringThemes, affected, "Repeated recovering context", "RECOVERING", environmentCounts.RECOVERING || 0);
  addTheme(recurringThemes, affected, "Repeated consensus agreement", "FULL_CONSENSUS", consensusCounts.FULL_CONSENSUS || 0);
  addTheme(recurringThemes, affected, "Repeated consensus disagreement", "CONFLICTED", consensusCounts.CONFLICTED || 0);
  addTheme(recurringThemes, affected, "Repeated drift state", "DEGRADING", driftCounts.DEGRADING || 0);
  addTheme(recurringThemes, affected, "Repeated liquidity stabilization", "STABILIZING", liquidityCounts.STABILIZING || 0);
  addTheme(recurringThemes, affected, "Repeated transition cooling", "COOLING", transitionCounts.COOLING || 0);

  const strength = strengthFor(recurringThemes.length, recent.length);
  const recurrenceState = recurringThemes.length
    ? recurrenceStateFor(strength)
    : "NO_RECURRENCE";

  return {
    recurrenceState,
    recurrenceStrength: recurringThemes.length ? strength : "LOW",
    recurringThemes: recurringThemes.slice(0, 8),
    affectedEcosystems: [...affected],
    warnings: recurrenceState === "STRONG_RECURRENCE"
      ? ["Strong recurrence detected across recent cognition history."]
      : [],
    summary: recurringThemes.length
      ? `${recurrenceState} with ${recurringThemes.length} repeated cognition themes.`
      : "No recurring cognition themes detected across recent history."
  };
}

module.exports = {
  AWAITING_RECURRENCE,
  evaluateRecurrenceIntelligence
};
