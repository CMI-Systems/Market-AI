/*
 * Temporal memory engine for Market AI.
 * Keeps lightweight cognition history in memory for read-only visualization.
 */

const MAX_TEMPORAL_HISTORY = 120;
const AWAITING_TEMPORAL_MEMORY = "Awaiting temporal memory cognition.";

const temporalHistory = [];

function safeState(value, fallback = "UNKNOWN") {
  return typeof value === "string" && value.trim()
    ? value
    : fallback;
}

function rememberTemporalCognition(cognition = {}) {
  const record = {
    timestamp: new Date().toISOString(),
    environment: safeState(cognition.strategicEnvironment?.environment),
    stability: safeState(cognition.strategicEnvironment?.stability),
    confidenceLevel: safeState(cognition.confidenceProfile?.level),
    consensusState: safeState(cognition.crossBrainConsensus?.consensusState),
    driftState: safeState(cognition.cognitiveDrift?.driftState),
    regimeState: safeState(cognition.regimeTransition?.regimeState),
    transitionState: safeState(cognition.regimeTransition?.transitionState),
    liquidityState: safeState(cognition.liquidityPressure?.liquidityState),
    pressureState: safeState(cognition.liquidityPressure?.pressureState),
    anomalySeverity: safeState(cognition.anomalyIntelligence?.severity),
    ecosystemState: safeState(cognition.crossSymbolEcosystem?.ecosystemState),
    signalState: safeState(cognition.adaptiveSignalIntelligence?.signalState),
    suppressionLevel: safeState(cognition.adaptiveSignalIntelligence?.suppressionLevel)
  };

  temporalHistory.push(record);

  while (temporalHistory.length > MAX_TEMPORAL_HISTORY) {
    temporalHistory.shift();
  }

  return [...temporalHistory];
}

function getTemporalHistory() {
  return [...temporalHistory];
}

function clearTemporalHistory() {
  temporalHistory.length = 0;
}

function topRepeatedValues(history, key) {
  const counts = history.reduce((next, item) => {
    const value = safeState(item[key]);
    if (value === "UNKNOWN") return next;
    next[value] = (next[value] || 0) + 1;
    return next;
  }, {});

  return Object.entries(counts)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([value, count]) => ({
      type: key,
      value,
      count
    }));
}

function memoryDepthFor(count) {
  if (count >= 80) return "DEEP";
  if (count >= 35) return "HIGH";
  if (count >= 12) return "MODERATE";
  if (count >= 3) return "LOW";
  return "UNKNOWN";
}

function evaluateTemporalMemory(input = {}) {
  const history = Array.isArray(input.history) ? input.history : getTemporalHistory();

  if (history.length < 3) {
    return {
      temporalState: "INSUFFICIENT_HISTORY",
      memoryDepth: "LOW",
      recurringPatterns: [],
      agingContexts: [],
      longHorizonSignals: [],
      warnings: [],
      summary: AWAITING_TEMPORAL_MEMORY
    };
  }

  const recent = history.slice(-12);
  const recurringPatterns = [
    ...topRepeatedValues(recent, "environment"),
    ...topRepeatedValues(recent, "confidenceLevel"),
    ...topRepeatedValues(recent, "consensusState"),
    ...topRepeatedValues(recent, "driftState"),
    ...topRepeatedValues(recent, "regimeState"),
    ...topRepeatedValues(recent, "liquidityState")
  ].slice(0, 8);
  const volatileCount = recent.filter((item) => {
    return ["UNSTABLE", "FRAGMENTED", "VOLATILE", "DIVERGENT"].includes(item.environment) ||
      ["VOLATILE", "FRAGMENTING", "DEGRADING"].includes(item.driftState) ||
      ["UNSTABLE", "FRAGMENTED"].includes(item.regimeState);
  }).length;
  const agingContexts = history.length < 6
    ? ["Low memory depth limits temporal confidence."]
    : [];
  const longHorizonSignals = topRepeatedValues(history, "regimeState")
    .concat(topRepeatedValues(history, "liquidityState"))
    .slice(0, 6);

  let temporalState = "STABLE_MEMORY";
  if (volatileCount >= 5) {
    temporalState = "VOLATILE_HISTORY";
  } else if (agingContexts.length) {
    temporalState = "AGING_CONTEXT";
  } else if (recurringPatterns.length >= 3) {
    temporalState = "RECURRING_PATTERN";
  }

  return {
    temporalState,
    memoryDepth: memoryDepthFor(history.length),
    recurringPatterns,
    agingContexts,
    longHorizonSignals,
    warnings: volatileCount >= 5 ? ["Recent cognition history contains repeated instability."] : [],
    summary: `${temporalState} across ${history.length} recent cognition records.`
  };
}

module.exports = {
  AWAITING_TEMPORAL_MEMORY,
  clearTemporalHistory,
  evaluateTemporalMemory,
  getTemporalHistory,
  rememberTemporalCognition
};
