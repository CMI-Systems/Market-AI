/*
 * Temporal sequence intelligence for Market AI.
 * Reads ordered cognition history and describes progression without recommendations.
 */

const AWAITING_TEMPORAL_SEQUENCE = "Awaiting temporal sequence cognition.";

function stateOf(value) {
  return typeof value === "string" && value.trim() ? value : "UNKNOWN";
}

function chainOf(previous, current, key) {
  return {
    type: key,
    from: stateOf(previous[key]),
    to: stateOf(current[key]),
    count: 1
  };
}

function chainKey(chain) {
  return `${chain.type}:${chain.from}:${chain.to}`;
}

function mergeChains(chains) {
  const merged = new Map();

  chains.forEach((chain) => {
    if (chain.from === "UNKNOWN" || chain.to === "UNKNOWN" || chain.from === chain.to) return;
    const key = chainKey(chain);
    const existing = merged.get(key) || { ...chain, count: 0 };
    existing.count += 1;
    merged.set(key, existing);
  });

  return [...merged.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

function rankMomentum(score) {
  if (score >= 6) return "SEVERE";
  if (score >= 4) return "HIGH";
  if (score >= 2) return "MODERATE";
  if (score > 0) return "LOW";
  return "UNKNOWN";
}

function confidenceFor(historyCount, chainCount) {
  if (historyCount >= 12 && chainCount >= 4) return "HIGH";
  if (historyCount >= 6 && chainCount >= 2) return "MODERATE";
  if (historyCount >= 3) return "LOW";
  return "UNKNOWN";
}

function evaluateTemporalSequence(input = {}) {
  const history = Array.isArray(input.history) ? input.history : [];

  if (history.length < 3) {
    return {
      sequenceState: "UNKNOWN",
      progressionMomentum: "UNKNOWN",
      sequenceConfidence: "UNKNOWN",
      activeSequences: [],
      transitionChains: [],
      warnings: [],
      summary: AWAITING_TEMPORAL_SEQUENCE
    };
  }

  const recent = history.slice(-14);
  const rawChains = [];
  let escalationScore = 0;
  let recoveryScore = 0;
  let coolingScore = 0;
  let unstableScore = 0;
  let accelerationScore = 0;

  for (let index = 1; index < recent.length; index += 1) {
    const previous = recent[index - 1];
    const current = recent[index];
    rawChains.push(chainOf(previous, current, "environment"));
    rawChains.push(chainOf(previous, current, "transitionState"));
    rawChains.push(chainOf(previous, current, "liquidityState"));
    rawChains.push(chainOf(previous, current, "driftState"));
    rawChains.push(chainOf(previous, current, "signalState"));

    if (["HIGH", "SEVERE", "CRITICAL"].includes(stateOf(current.anomalySeverity)) ||
      ["SUPPRESSED", "UNSTABLE"].includes(stateOf(current.signalState)) ||
      ["HIGH", "SEVERE"].includes(stateOf(current.suppressionLevel))) {
      escalationScore += 1;
    }

    if (["RECOVERING", "STABILIZING"].includes(stateOf(current.environment)) ||
      ["STABILIZING", "RELEASING"].includes(stateOf(current.liquidityState))) {
      recoveryScore += 1;
    }

    if (stateOf(current.transitionState) === "COOLING" ||
      stateOf(current.pressureState) === "STABILIZING") {
      coolingScore += 1;
    }

    if (["FRAGMENTING", "VOLATILE", "DEGRADING"].includes(stateOf(current.driftState)) ||
      ["FRAGMENTED", "DIVERGENT"].includes(stateOf(current.ecosystemState))) {
      unstableScore += 1;
    }

    if (stateOf(previous.confidenceLevel) === "LOW" && stateOf(current.signalState) === "SUPPRESSED") {
      accelerationScore += 1;
    }
  }

  const transitionChains = mergeChains(rawChains);
  const activeSequences = transitionChains.slice(0, 5).map((chain) => ({
    label: `${chain.from} to ${chain.to}`,
    type: chain.type,
    count: chain.count
  }));
  let sequenceState = "STABLE_SEQUENCE";
  const topScore = Math.max(escalationScore, recoveryScore, coolingScore, unstableScore, accelerationScore);

  if (unstableScore >= 4) {
    sequenceState = "UNSTABLE_SEQUENCE";
  } else if (accelerationScore >= 2) {
    sequenceState = "ACCELERATING";
  } else if (escalationScore >= 4) {
    sequenceState = "ESCALATING";
  } else if (recoveryScore >= 4) {
    sequenceState = "RECOVERING";
  } else if (coolingScore >= 3) {
    sequenceState = "COOLING";
  }

  return {
    sequenceState,
    progressionMomentum: rankMomentum(topScore),
    sequenceConfidence: confidenceFor(recent.length, transitionChains.length),
    activeSequences,
    transitionChains,
    warnings: ["ESCALATING", "UNSTABLE_SEQUENCE"].includes(sequenceState)
      ? ["Temporal sequence progression is elevated across recent cognition."]
      : [],
    summary: `${sequenceState} with ${transitionChains.length} observed transition chains.`
  };
}

module.exports = {
  AWAITING_TEMPORAL_SEQUENCE,
  evaluateTemporalSequence
};
