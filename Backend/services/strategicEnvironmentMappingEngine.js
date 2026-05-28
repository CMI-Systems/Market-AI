/*
 * Strategic environment mapping for Market AI.
 * Builds spatial ecosystem cognition from existing backend symbol contexts.
 */

const {
  ECOSYSTEM_GROUPS
} = require("./crossSymbolCorrelationEngine");

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

function pressureRank(level) {
  return {
    LOW: 1,
    MODERATE: 2,
    HIGH: 3,
    SEVERE: 4
  }[level] || 0;
}

function maxPressure(levels = []) {
  return levels.reduce((highest, level) => {
    return pressureRank(level) > pressureRank(highest) ? level : highest;
  }, "LOW");
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

function classifyEcosystem(symbol) {
  const matched = Object.entries(ECOSYSTEM_GROUPS).find(([, symbols]) => {
    return symbols.includes(symbol);
  });

  return matched ? matched[0] : "Other";
}

function contextPressure(context = {}) {
  const explicit = context.environmentalPressure?.pressureLevel;
  const environment = context.strategicEnvironment?.environment;
  const stability = context.strategicEnvironment?.stability;
  const anomaly = context.anomalyIntelligence?.severity;

  if (explicit === "EXTREME" || environment === "HIGH_RISK" || anomaly === "HIGH") return "SEVERE";
  if (explicit === "HIGH" || environment === "UNSTABLE" || stability === "FRAGMENTED") return "HIGH";
  if (explicit === "MODERATE" || environment === "CAUTION" || anomaly === "MEDIUM") return "MODERATE";
  return "LOW";
}

function contextState(context = {}) {
  const environment = context.strategicEnvironment?.environment;
  const stability = context.strategicEnvironment?.stability;
  const trajectory = context.intelligenceStabilityForecast?.trajectory;
  const pressure = contextPressure(context);

  if (pressure === "SEVERE" || trajectory === "DETERIORATING") return "ESCALATING";
  if (stability === "FRAGMENTED" || trajectory === "FRAGMENTING") return "FRAGMENTED";
  if (trajectory === "RECOVERING") return "RECOVERING";
  if (environment === "CAUTION" || pressure === "MODERATE") return "CAUTION";
  if (["OPTIMAL", "FAVORABLE"].includes(environment) || pressure === "LOW") return "STABLE";
  return "UNKNOWN";
}

function contextTrajectory(context = {}) {
  return context.intelligenceStabilityForecast?.trajectory || "UNKNOWN";
}

function isSynchronized(contexts = []) {
  if (contexts.length < 2) {
    return false;
  }

  const states = contexts.map(contextState);
  const [dominantState, count] = mostCommon(states);

  return dominantState !== "UNKNOWN" && count / contexts.length >= 0.67;
}

function buildRegions(contexts = []) {
  const regions = new Map();

  contexts.forEach((context) => {
    const symbol = safeSymbol(context.symbol);
    const ecosystem = classifyEcosystem(symbol);

    if (!regions.has(ecosystem)) {
      regions.set(ecosystem, []);
    }

    regions.get(ecosystem).push(context);
  });

  return [...regions.entries()].map(([ecosystem, items]) => {
    const states = items.map(contextState);
    const pressures = items.map(contextPressure);
    const trajectories = items.map(contextTrajectory);
    const [state] = mostCommon(states);
    const [trajectory] = mostCommon(trajectories);
    const pressure = maxPressure(pressures);
    const fragmentation = states.includes("FRAGMENTED") ||
      items.some((item) => item.strategicEnvironment?.stability === "FRAGMENTED");
    const synchronization = isSynchronized(items) ? "SYNCHRONIZED" : "MIXED";

    return {
      ecosystem,
      state,
      pressure,
      synchronization,
      fragmentation,
      trajectory,
      symbols: items.map((item) => safeSymbol(item.symbol)).sort()
    };
  }).sort((first, second) => first.ecosystem.localeCompare(second.ecosystem));
}

function buildPressureMap(regions = []) {
  return regions
    .map((region) => ({
      ecosystem: region.ecosystem,
      pressure: region.pressure,
      state: region.state,
      symbols: region.symbols
    }))
    .sort((first, second) => {
      return pressureRank(second.pressure) - pressureRank(first.pressure) ||
        first.ecosystem.localeCompare(second.ecosystem);
    });
}

function buildTransitionSignals(regions = []) {
  return regions
    .filter((region) => {
      return ["RECOVERING", "ESCALATING", "FRAGMENTED"].includes(region.state) ||
        ["RECOVERING", "DETERIORATING", "FRAGMENTING"].includes(region.trajectory);
    })
    .map((region) => ({
      ecosystem: region.ecosystem,
      transition: region.state === "RECOVERING" || region.trajectory === "RECOVERING"
        ? "RECOVERING"
        : region.state === "ESCALATING" || region.trajectory === "DETERIORATING"
          ? "ESCALATING"
          : "FRAGMENTATION",
      trajectory: region.trajectory,
      symbols: region.symbols
    }));
}

function classifyGlobalEnvironment(regions = []) {
  if (!regions.length) return "UNKNOWN";

  const states = regions.map((region) => region.state);
  const severePressure = regions.some((region) => region.pressure === "SEVERE");
  const highPressureCount = regions.filter((region) => ["HIGH", "SEVERE"].includes(region.pressure)).length;

  if (severePressure || states.includes("ESCALATING")) return "ESCALATING";
  if (states.includes("FRAGMENTED") || highPressureCount >= 2) return "FRAGMENTED";
  if (states.includes("RECOVERING")) return "RECOVERING";
  if (states.includes("CAUTION") || regions.some((region) => region.pressure === "MODERATE")) return "CAUTION";
  if (states.every((state) => state === "STABLE")) return "STABLE";
  return "UNKNOWN";
}

function awaitingEnvironmentMap() {
  return {
    globalEnvironmentState: "UNKNOWN",
    ecosystemRegions: [],
    pressureMap: [],
    fragmentationZones: [],
    synchronizationZones: [],
    transitionSignals: [],
    warnings: [],
    summary: "Awaiting strategic environment mapping cognition."
  };
}

function mapStrategicEnvironment(input = {}) {
  const contexts = safeArray(input.symbolContexts)
    .filter((context) => safeSymbol(context.symbol) !== "UNKNOWN");

  if (contexts.length < 2) {
    return awaitingEnvironmentMap();
  }

  const ecosystemRegions = buildRegions(contexts);
  const pressureMap = buildPressureMap(ecosystemRegions);
  const fragmentationZones = ecosystemRegions
    .filter((region) => region.fragmentation || region.state === "FRAGMENTED")
    .map((region) => ({
      ecosystem: region.ecosystem,
      pressure: region.pressure,
      symbols: region.symbols
    }));
  const synchronizationZones = ecosystemRegions
    .filter((region) => region.synchronization === "SYNCHRONIZED")
    .map((region) => ({
      ecosystem: region.ecosystem,
      state: region.state,
      symbols: region.symbols
    }));
  const transitionSignals = buildTransitionSignals(ecosystemRegions);
  const globalEnvironmentState = classifyGlobalEnvironment(ecosystemRegions);
  const warnings = [];

  if (fragmentationZones.length) {
    warnings.push("Fragmentation zones are present in strategic environment mapping.");
  }

  if (pressureMap.filter((region) => ["HIGH", "SEVERE"].includes(region.pressure)).length >= 2) {
    warnings.push("Pressure propagation is elevated across multiple ecosystem regions.");
  }

  if (transitionSignals.some((signal) => signal.transition === "ESCALATING")) {
    warnings.push("Escalating environmental transition is visible in mapped regions.");
  }

  return {
    globalEnvironmentState,
    ecosystemRegions,
    pressureMap,
    fragmentationZones,
    synchronizationZones,
    transitionSignals,
    warnings: unique(warnings),
    summary: `${globalEnvironmentState} strategic environment map across ${ecosystemRegions.length} ecosystem regions.`
  };
}

module.exports = {
  awaitingEnvironmentMap,
  mapStrategicEnvironment
};
