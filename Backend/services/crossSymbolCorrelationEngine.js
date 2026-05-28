/*
 * Cross-symbol ecosystem cognition for Market AI.
 * This engine compares existing backend symbol contexts only.
 */

const ECOSYSTEM_GROUPS = {
  Semiconductors: ["NVDA", "AMD", "TSM", "SOXL"],
  "Mega Caps": ["META", "MSFT", "QQQ"],
  "Broad Market": ["SPY"]
};

function safeArray(value) {
  return Array.isArray(value)
    ? value.filter((item) => item && typeof item === "object")
    : [];
}

function safeSymbol(value) {
  return typeof value === "string" && value.trim()
    ? value.trim().toUpperCase()
    : "UNKNOWN";
}

function unique(values) {
  return [...new Set(values)];
}

function mostCommon(values = []) {
  const counts = values.reduce((next, value) => {
    next[value] = (next[value] || 0) + 1;
    return next;
  }, {});

  return Object.entries(counts).sort((first, second) => {
    if (second[1] === first[1]) {
      return first[0].localeCompare(second[0]);
    }

    return second[1] - first[1];
  })[0] || ["UNKNOWN", 0];
}

function classifyGroup(symbol) {
  const found = Object.entries(ECOSYSTEM_GROUPS).find(([, symbols]) => {
    return symbols.includes(symbol);
  });

  return found ? found[0] : "Other";
}

function pressureLevel(context = {}) {
  const explicit = context.environmentalPressure?.pressureLevel;
  const environment = context.strategicEnvironment?.environment;
  const stability = context.strategicEnvironment?.stability;
  const anomaly = context.anomalyIntelligence?.severity;

  if (explicit === "EXTREME" || environment === "HIGH_RISK" || anomaly === "HIGH") {
    return "SEVERE";
  }

  if (explicit === "HIGH" || environment === "UNSTABLE" || stability === "FRAGMENTED") {
    return "HIGH";
  }

  if (explicit === "MODERATE" || environment === "CAUTION" || anomaly === "MEDIUM") {
    return "MODERATE";
  }

  if (explicit === "LOW" || ["OPTIMAL", "FAVORABLE"].includes(environment) || anomaly === "LOW") {
    return "LOW";
  }

  return "LOW";
}

function directionKey(context = {}) {
  return [
    context.strategicEnvironment?.environment || "UNKNOWN",
    context.strategicEnvironment?.stability || "UNKNOWN",
    context.intelligenceStabilityForecast?.trajectory || "UNKNOWN"
  ].join("|");
}

function pressureScore(level) {
  return {
    LOW: 1,
    MODERATE: 2,
    HIGH: 3,
    SEVERE: 4
  }[level] || 0;
}

function clusterByPressure(contexts = []) {
  const clusters = new Map();

  contexts.forEach((context) => {
    const level = pressureLevel(context);

    if (!clusters.has(level)) {
      clusters.set(level, []);
    }

    clusters.get(level).push(safeSymbol(context.symbol));
  });

  return [...clusters.entries()]
    .map(([level, symbols]) => ({
      pressureState: level,
      symbols: symbols.sort(),
      count: symbols.length
    }))
    .sort((first, second) => {
      const pressureDelta = pressureScore(second.pressureState) - pressureScore(first.pressureState);
      return pressureDelta || second.count - first.count;
    });
}

function buildEcosystemGroups(contexts = []) {
  const groups = new Map();

  contexts.forEach((context) => {
    const symbol = safeSymbol(context.symbol);
    const groupName = classifyGroup(symbol);

    if (!groups.has(groupName)) {
      groups.set(groupName, {
        group: groupName,
        symbols: [],
        pressureStates: []
      });
    }

    const group = groups.get(groupName);
    group.symbols.push(symbol);
    group.pressureStates.push(pressureLevel(context));
  });

  return [...groups.values()].map((group) => {
    const [dominantPressure] = mostCommon(group.pressureStates);

    return {
      group: group.group,
      symbols: group.symbols.sort(),
      pressureState: dominantPressure,
      count: group.symbols.length
    };
  });
}

function classifyEcosystemState({
  contextCount,
  dominantDirectionCount,
  highPressureCount,
  divergentSymbols
}) {
  if (contextCount < 2) return "UNKNOWN";

  const alignmentRatio = dominantDirectionCount / contextCount;
  const divergenceRatio = divergentSymbols.length / contextCount;

  if (divergenceRatio >= 0.5) return "DIVERGENT";
  if (highPressureCount >= 2 && alignmentRatio < 0.6) return "FRAGMENTED";
  if (alignmentRatio >= 0.8) return "SYNCHRONIZED";
  if (alignmentRatio >= 0.5) return "PARTIALLY_SYNCHRONIZED";
  return "FRAGMENTED";
}

function classifyCorrelationStrength(state, contextCount, dominantDirectionCount) {
  if (contextCount < 2 || state === "UNKNOWN") return "UNKNOWN";

  const alignmentRatio = dominantDirectionCount / contextCount;

  if (alignmentRatio >= 0.8) return "STRONG";
  if (alignmentRatio >= 0.5) return "MODERATE";
  return "WEAK";
}

function awaitingEcosystemCognition() {
  return {
    ecosystemState: "UNKNOWN",
    correlationStrength: "UNKNOWN",
    synchronizedSymbols: [],
    divergentSymbols: [],
    pressureClusters: [],
    ecosystemGroups: [],
    warnings: [],
    summary: "Awaiting cross-symbol ecosystem cognition."
  };
}

function evaluateCrossSymbolCorrelation(input = {}) {
  const contexts = safeArray(input.symbolContexts)
    .filter((context) => safeSymbol(context.symbol) !== "UNKNOWN");

  if (contexts.length < 2) {
    return awaitingEcosystemCognition();
  }

  const directionKeys = contexts.map(directionKey);
  const [dominantDirection, dominantDirectionCount] = mostCommon(directionKeys);
  const synchronizedSymbols = contexts
    .filter((context) => directionKey(context) === dominantDirection)
    .map((context) => safeSymbol(context.symbol))
    .sort();
  const divergentSymbols = contexts
    .filter((context) => directionKey(context) !== dominantDirection)
    .map((context) => safeSymbol(context.symbol))
    .sort();
  const pressureClusters = clusterByPressure(contexts);
  const highPressureCount = pressureClusters
    .filter((cluster) => ["HIGH", "SEVERE"].includes(cluster.pressureState))
    .reduce((total, cluster) => total + cluster.count, 0);
  const ecosystemState = classifyEcosystemState({
    contextCount: contexts.length,
    dominantDirectionCount,
    highPressureCount,
    divergentSymbols
  });
  const correlationStrength = classifyCorrelationStrength(
    ecosystemState,
    contexts.length,
    dominantDirectionCount
  );
  const warnings = [];

  if (ecosystemState === "FRAGMENTED") {
    warnings.push("Ecosystem environments are fragmented across active symbol contexts.");
  }

  if (ecosystemState === "DIVERGENT") {
    warnings.push("Cross-symbol context is diverging across active symbol groups.");
  }

  if (highPressureCount >= 2) {
    warnings.push("Elevated pressure is clustered across multiple symbols.");
  }

  return {
    ecosystemState,
    correlationStrength,
    synchronizedSymbols,
    divergentSymbols,
    pressureClusters,
    ecosystemGroups: buildEcosystemGroups(contexts),
    warnings,
    summary: `${ecosystemState} ecosystem cognition across ${contexts.length} active symbol contexts.`
  };
}

module.exports = {
  ECOSYSTEM_GROUPS,
  awaitingEcosystemCognition,
  evaluateCrossSymbolCorrelation
};
