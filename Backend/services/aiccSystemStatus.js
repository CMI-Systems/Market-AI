const { loadEnvironmentConfig } = require("../config/environment");
const {
  buildBrainStatus,
  buildConfidence,
  buildOverview,
  buildPriorityFeedEndpoint,
  buildStrategicEnvironment
} = require("./cognitionSnapshotStore");
const { getMarketHoursStatus } = require("./marketHours");
const {
  getProviderStatus,
  isAlpacaAvailable
} = require("./marketProviderService");
const { buildProductionHealth } = require("./productionHealthService");
const { getStreamStatus } = require("./streamController");

function normalizePercent(score) {
  if (!Number.isFinite(score)) return null;
  return score <= 1 ? Math.round(score * 100) : Math.round(score);
}

function hasValue(value) {
  return value !== undefined &&
    value !== null &&
    value !== "" &&
    value !== "AWAITING_COGNITION" &&
    !String(value).toLowerCase().includes("awaiting");
}

function runtimeState(health) {
  if (!health) return "DEGRADED";
  if (health.status === "HEALTHY") return "HEALTHY";
  if (health.status === "DEGRADED") return "DEGRADED";
  return "DEGRADED";
}

function confidenceLabel(score) {
  if (score >= 75) return "HIGH";
  if (score >= 50) return "MODERATE";
  if (score > 0) return "BUILDING";
  return "LOW";
}

function calculateScore({ providerActive, marketOpen, runtimeHealthy, brainsActive }) {
  return 25 +
    (providerActive ? 25 : 0) +
    (marketOpen ? 15 : 0) +
    (runtimeHealthy ? 20 : 0) +
    (brainsActive ? 15 : 0);
}

function resolveStreamMode({ backendOnline, marketHours, providerStatus, env, options = {} }) {
  const marketOpen = Boolean(marketHours.isOpen);
  const alpacaConnected = Boolean(
    backendOnline &&
    providerStatus.activeProvider === "ALPACA" &&
    providerStatus.providerHealth === "HEALTHY" &&
    isAlpacaAvailable(env, options)
  );

  if (backendOnline && alpacaConnected && marketOpen) {
    return {
      streamMode: "LIVE_ALPACA",
      provider: "ALPACA",
      simulationActive: false,
      marketStatus: "OPEN",
      environment: "LIVE_MARKET"
    };
  }

  if (marketOpen && !alpacaConnected) {
    return {
      streamMode: "FALLBACK_SIMULATION",
      provider: "SIMULATION",
      simulationActive: true,
      marketStatus: "OPEN",
      environment: "LOCAL_FALLBACK"
    };
  }

  if (marketHours.reason === "weekend" || marketHours.reason === "holiday") {
    return {
      streamMode: "MARKET_CLOSED_SIMULATION",
      provider: "SIMULATION",
      simulationActive: true,
      marketStatus: "CLOSED",
      environment: "MARKET_CLOSED"
    };
  }

  return {
    streamMode: "AFTER_HOURS_SIMULATION",
    provider: "SIMULATION",
    simulationActive: true,
    marketStatus: "CLOSED",
    environment: "AFTER_HOURS"
  };
}

function buildAiccSystemStatus(options = {}) {
  const env = options.env || process.env;
  const config = options.config || loadEnvironmentConfig(env);
  const marketHours = options.marketHours || getMarketHoursStatus();
  const health = options.health || buildProductionHealth({ config });
  const streamStatus = options.streamStatus || getStreamStatus();
  const overview = options.overview || buildOverview();
  const brainStatus = options.brainStatus || buildBrainStatus();
  const confidence = options.confidence || buildConfidence();
  const environment = options.environment || buildStrategicEnvironment();
  const priorityFeed = options.priorityFeed || buildPriorityFeedEndpoint();
  const providerOptions = { env, simulate: options.simulate };
  const providerStatus = options.providerStatus || getProviderStatus(providerOptions);

  const backendOnline = true;
  const activeProvider = providerStatus.activeProvider;
  const providerActive = activeProvider === "ALPACA" || activeProvider === "WEBULL";
  const marketOpen = Boolean(
    typeof overview.marketOpen === "boolean"
      ? overview.marketOpen
      : marketHours.isOpen
  );
  const runtime = runtimeState(health);
  const runtimeHealthy = runtime === "HEALTHY";
  const streamState = resolveStreamMode({
    backendOnline,
    marketHours,
    providerStatus,
    env,
    options: providerOptions
  });
  const liveDataActive = streamState.streamMode === "LIVE_ALPACA";
  const brainsActive = liveDataActive || Boolean(streamStatus.active);
  const backendConfidence = normalizePercent(confidence.score || overview.confidence?.score);
  const score = backendConfidence && backendConfidence > 0
    ? backendConfidence
    : calculateScore({
      providerActive,
      marketOpen,
      runtimeHealthy,
      brainsActive
    });

  const mode = !backendOnline
    ? "OFFLINE"
    : liveDataActive
      ? "LIVE_ANALYSIS"
      : "SIMULATION";

  const normalizedEnvironment = streamState.environment;

  const stability = !backendOnline
    ? "OFFLINE"
    : runtimeHealthy
      ? "STABLE"
      : "DEGRADED";

  const tactical = !backendOnline
    ? "STANDBY"
    : liveDataActive
      ? "ANALYZING"
      : "OBSERVING";
  const behavioral = backendOnline && brainStatus.behavioralBrain
    ? "OBSERVING"
    : "STANDBY";
  const failsafe = backendOnline && (runtimeHealthy || liveDataActive)
    ? "MONITORING"
    : "STANDBY";

  const memoryValue = Number.isFinite(health.memory?.heapUsedMb)
    ? Math.round(health.memory.heapUsedMb)
    : "LOCAL";

  return {
    backend: backendOnline ? "ONLINE" : "OFFLINE",
    mode,
    streamMode: streamState.streamMode,
    simulationActive: streamState.simulationActive,
    marketStatus: streamState.marketStatus,
    runtime,
    provider: streamState.provider,
    primaryProvider: providerStatus.primaryProvider,
    secondaryProvider: providerActive ? `${activeProvider}_ACTIVE` : "SIMULATION_ACTIVE",
    fallbackProvider: providerStatus.fallbackProvider,
    providerHealth: providerStatus.providerHealth,
    capabilities: providerStatus.capabilities,
    environment: hasValue(environment.environment)
      ? normalizedEnvironment
      : normalizedEnvironment,
    stability,
    confidence: confidenceLabel(score),
    score,
    brains: {
      tactical,
      behavioral,
      failsafe
    },
    feeds: {
      equities: providerStatus.capabilities.equities ? "ONLINE" : "OFFLINE",
      options: providerStatus.capabilities.options ? "ONLINE" : "PENDING",
      futures: providerStatus.capabilities.futures ? "ONLINE" : "UNAVAILABLE",
      symbol: hasValue(overview.symbol)
        ? overview.symbol
        : streamStatus.symbol || "SPY",
      feedState: providerStatus.providerHealth === "HEALTHY" || streamStatus.active ? "ACTIVE" : "DEGRADED",
      events: Array.isArray(priorityFeed.events)
        ? priorityFeed.events.length
        : streamStatus.eventsProcessed || 0,
      memory: memoryValue
    }
  };
}

module.exports = {
  buildAiccSystemStatus,
  calculateScore,
  confidenceLabel,
  normalizePercent,
  resolveStreamMode
};
