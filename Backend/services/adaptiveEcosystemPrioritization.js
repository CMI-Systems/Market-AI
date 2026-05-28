/*
 * Adaptive ecosystem prioritization for Market AI.
 * Ranks ecosystem regions for strategic attention using backend cognition only.
 */

const AWAITING_PRIORITY = "Awaiting adaptive ecosystem prioritization cognition.";

function safeArray(value) {
  return Array.isArray(value)
    ? value.filter((item) => item && typeof item === "object")
    : [];
}

function pressureScore(level) {
  return {
    LOW: 0.12,
    MODERATE: 0.38,
    HIGH: 0.68,
    SEVERE: 0.9
  }[level] || 0;
}

function stateScore(state) {
  return {
    STABLE: 0.06,
    RECOVERING: 0.18,
    CAUTION: 0.35,
    FRAGMENTED: 0.66,
    ESCALATING: 0.88
  }[state] || 0.1;
}

function trajectoryScore(trajectory) {
  return {
    STABLE: 0.04,
    STABILIZING: 0.08,
    RECOVERING: 0.12,
    FRAGMENTING: 0.56,
    DETERIORATING: 0.68
  }[trajectory] || 0.12;
}

function clamp(value) {
  return Number(Math.max(0, Math.min(1, value)).toFixed(2));
}

function priorityFromScore(score) {
  if (score >= 0.82) return "CRITICAL_FOCUS";
  if (score >= 0.62) return "HIGH_FOCUS";
  if (score >= 0.26) return "MODERATE_FOCUS";
  if (score >= 0.12) return "LOW_FOCUS";
  return "BACKGROUND";
}

function topPriority(prioritizedEcosystems = []) {
  const order = [
    "CRITICAL_FOCUS",
    "HIGH_FOCUS",
    "MODERATE_FOCUS",
    "LOW_FOCUS",
    "BACKGROUND"
  ];

  return prioritizedEcosystems.reduce((top, ecosystem) => {
    return order.indexOf(ecosystem.priority) < order.indexOf(top)
      ? ecosystem.priority
      : top;
  }, "BACKGROUND");
}

function buildDrivers(region = {}, score = 0) {
  const drivers = [];

  if (["HIGH", "SEVERE"].includes(region.pressure)) {
    drivers.push("Elevated pressure region.");
  }

  if (region.fragmentation === true || region.state === "FRAGMENTED") {
    drivers.push("Fragmentation is present.");
  }

  if (region.state === "ESCALATING" || region.trajectory === "DETERIORATING") {
    drivers.push("Environmental transition is escalating.");
  }

  if (region.synchronization === "SYNCHRONIZED" && ["HIGH", "SEVERE"].includes(region.pressure)) {
    drivers.push("Pressure is synchronized inside the ecosystem.");
  }

  if (score < 0.18) {
    drivers.push("Region remains background context.");
  }

  return drivers;
}

function scoreRegion(region = {}) {
  const fragmentationBoost = region.fragmentation === true ? 0.18 : 0;
  const synchronizationBoost = region.synchronization === "SYNCHRONIZED" &&
    ["HIGH", "SEVERE"].includes(region.pressure)
    ? 0.12
    : 0;

  return clamp(
    pressureScore(region.pressure) * 0.4 +
    stateScore(region.state) * 0.32 +
    trajectoryScore(region.trajectory) * 0.18 +
    fragmentationBoost +
    synchronizationBoost
  );
}

function classifyPropagationState(environmentMap = {}) {
  const pressureMap = safeArray(environmentMap.pressureMap);
  const fragmentationZones = safeArray(environmentMap.fragmentationZones);
  const transitionSignals = safeArray(environmentMap.transitionSignals);
  const highPressure = pressureMap.filter((region) => {
    return ["HIGH", "SEVERE"].includes(region.pressure);
  });

  if (!pressureMap.length) return "UNKNOWN";
  if (fragmentationZones.length >= 2) return "FRAGMENTING";
  if (highPressure.length >= 2) return "SPREADING";
  if (transitionSignals.some((signal) => signal.transition === "RECOVERING")) return "RECOVERING";
  if (pressureMap.every((region) => region.pressure === "LOW")) return "STABLE";
  return "CONTAINED";
}

function buildPropagationPaths(environmentMap = {}) {
  const pressureMap = safeArray(environmentMap.pressureMap);
  const origins = pressureMap.filter((region) => {
    return ["HIGH", "SEVERE"].includes(region.pressure);
  });
  const receivers = pressureMap.filter((region) => {
    return ["LOW", "MODERATE"].includes(region.pressure);
  });

  return origins.flatMap((origin) => {
    return receivers.map((receiver) => ({
      from: origin.ecosystem,
      to: receiver.ecosystem,
      pressure: origin.pressure,
      pathwayState: pressureScore(origin.pressure) > pressureScore(receiver.pressure)
        ? "PROPAGATING"
        : "CONTAINED"
    }));
  }).slice(0, 8);
}

function awaitingPrioritization() {
  return {
    priorityLevel: "UNKNOWN",
    prioritizedEcosystems: [],
    priorityDrivers: [],
    suppressedEcosystems: [],
    propagationState: "UNKNOWN",
    originRegions: [],
    receivingRegions: [],
    propagationPaths: [],
    warnings: [],
    summary: AWAITING_PRIORITY
  };
}

function prioritizeEcosystems(input = {}) {
  const environmentMap = input.strategicEnvironmentMap || {};
  const regions = safeArray(environmentMap.ecosystemRegions);

  if (!regions.length) {
    return awaitingPrioritization();
  }

  const prioritizedEcosystems = regions
    .map((region) => {
      const score = scoreRegion(region);

      return {
        ecosystem: region.ecosystem || "UNKNOWN",
        priority: priorityFromScore(score),
        pressure: region.pressure || "UNKNOWN",
        synchronization: region.synchronization || "UNKNOWN",
        fragmentation: region.fragmentation === true,
        trajectory: region.trajectory || "UNKNOWN",
        drivers: buildDrivers(region, score),
        score
      };
    })
    .sort((first, second) => {
      return second.score - first.score || first.ecosystem.localeCompare(second.ecosystem);
    });
  const suppressedEcosystems = prioritizedEcosystems
    .filter((ecosystem) => ecosystem.priority === "BACKGROUND")
    .map((ecosystem) => ({
      ecosystem: ecosystem.ecosystem,
      reason: "Background pressure and stability context."
    }));
  const propagationState = classifyPropagationState(environmentMap);
  const originRegions = safeArray(environmentMap.pressureMap)
    .filter((region) => ["HIGH", "SEVERE"].includes(region.pressure))
    .map((region) => region.ecosystem);
  const receivingRegions = safeArray(environmentMap.pressureMap)
    .filter((region) => ["LOW", "MODERATE"].includes(region.pressure))
    .map((region) => region.ecosystem);
  const priorityDrivers = [...new Set(prioritizedEcosystems.flatMap((ecosystem) => ecosystem.drivers))];
  const warnings = [];

  if (propagationState === "SPREADING") {
    warnings.push("Pressure propagation is spreading across ecosystem regions.");
  }

  if (propagationState === "FRAGMENTING") {
    warnings.push("Fragmentation spread is elevated across ecosystem regions.");
  }

  if (prioritizedEcosystems.some((ecosystem) => ecosystem.priority === "CRITICAL_FOCUS")) {
    warnings.push("Critical ecosystem focus is present in backend cognition.");
  }

  return {
    priorityLevel: topPriority(prioritizedEcosystems),
    prioritizedEcosystems,
    priorityDrivers,
    suppressedEcosystems,
    propagationState,
    originRegions,
    receivingRegions,
    propagationPaths: buildPropagationPaths(environmentMap),
    warnings,
    summary: `${topPriority(prioritizedEcosystems)} ecosystem prioritization across ${prioritizedEcosystems.length} mapped regions.`
  };
}

module.exports = {
  AWAITING_PRIORITY,
  awaitingPrioritization,
  prioritizeEcosystems
};
