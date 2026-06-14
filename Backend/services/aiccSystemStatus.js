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
const { getSimulationPolicy } = require("../config/runtimePolicy");
const {
  evaluateMarketAvailability,
  resolveMarketSession
} = require("./marketSessionPolicy");

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

function resolveStreamMode({ backendOnline, marketHours, marketSession, providerStatus, env, options = {} }) {
  const simulationPolicy = getSimulationPolicy(env);
  const session = marketSession || resolveMarketSession({
    currentTime: marketHours?.currentTime || options.currentTime
  });
  const marketOpen = Boolean(session.marketOpen);
  const alpacaConnected = Boolean(
    backendOnline &&
    providerStatus.activeProvider === "ALPACA" &&
    providerStatus.providerHealth === "HEALTHY" &&
    isAlpacaAvailable(env, options)
  );
  const dataAvailability = evaluateMarketAvailability({
    provider: alpacaConnected ? "ALPACA" : providerStatus.activeProvider,
    sourceType: alpacaConnected ? "RAW_DELAYED" : providerStatus.sourceType,
    available: backendOnline && alpacaConnected && marketOpen,
    providerAvailable: providerStatus.providerAvailable,
    backendAvailable: backendOnline,
    simulated: providerStatus.simulated,
    generated: providerStatus.generated,
    environment: simulationPolicy.runtimeEnvironment,
    currentTime: session.currentTime,
    session
  });

  if (backendOnline && alpacaConnected && marketOpen) {
    return {
      streamMode: "LIVE_ALPACA",
      provider: "ALPACA",
      simulationActive: false,
      simulationAllowed: simulationPolicy.simulationAllowed,
      providerAvailable: true,
      rawDataAvailable: true,
      marketStatus: "OPEN",
      environment: "LIVE_MARKET",
      sessionState: session.sessionState,
      extendedHours: session.extendedHours,
      sessionSource: session.source,
      sessionVerified: session.verified,
      currentTime: session.currentTime,
      nextOpen: session.nextOpen,
      previousClose: session.previousClose,
      dataState: dataAvailability.dataState,
      dataAge: dataAvailability.dataAge,
      sourceType: "RAW_DELAYED",
      warnings: dataAvailability.warnings
    };
  }

  if (marketOpen && !alpacaConnected) {
    return {
      streamMode: "PROVIDER_OFFLINE",
      provider: "PROVIDER_UNAVAILABLE",
      simulationActive: false,
      simulationAllowed: simulationPolicy.simulationAllowed,
      providerAvailable: false,
      rawDataAvailable: false,
      marketStatus: "OPEN",
      environment: "PROVIDER_OFFLINE",
      sessionState: session.sessionState,
      extendedHours: session.extendedHours,
      sessionSource: session.source,
      sessionVerified: session.verified,
      currentTime: session.currentTime,
      nextOpen: session.nextOpen,
      previousClose: session.previousClose,
      dataState: "PROVIDER_OFFLINE",
      dataAge: dataAvailability.dataAge,
      sourceType: "PROVIDER_OFFLINE",
      warnings: dataAvailability.warnings
    };
  }

  if (!marketOpen) {
    return {
      streamMode: "MARKET_CLOSED",
      provider: providerStatus.activeProvider,
      simulationActive: false,
      simulationAllowed: simulationPolicy.simulationAllowed,
      providerAvailable: providerStatus.providerAvailable,
      rawDataAvailable: false,
      marketStatus: "CLOSED",
      environment: "MARKET_CLOSED",
      sessionState: session.sessionState,
      extendedHours: session.extendedHours,
      sessionSource: session.source,
      sessionVerified: session.verified,
      currentTime: session.currentTime,
      nextOpen: session.nextOpen,
      previousClose: session.previousClose,
      dataState: "MARKET_CLOSED",
      dataAge: dataAvailability.dataAge,
      sourceType: "MARKET_CLOSED",
      warnings: dataAvailability.warnings
    };
  };
}

function buildAiccSystemStatus(options = {}) {
  const env = options.env || process.env;
  const config = options.config || loadEnvironmentConfig(env);
  const marketSession = options.marketSession || resolveMarketSession({ currentTime: options.currentTime });
  const marketHours = options.marketHours || {
    isOpen: marketSession.marketOpen,
    reason: marketSession.sessionState,
    timeZone: "America/New_York"
  };
  const health = options.health || buildProductionHealth({ config });
  const streamStatus = options.streamStatus || getStreamStatus();
  const overview = options.overview || buildOverview();
  const brainStatus = options.brainStatus || buildBrainStatus();
  const confidence = options.confidence || buildConfidence();
  const environment = options.environment || buildStrategicEnvironment();
  const priorityFeed = options.priorityFeed || buildPriorityFeedEndpoint();
  const providerOptions = { env, simulate: options.simulate };
  const providerStatus = options.providerStatus || getProviderStatus(providerOptions);
  const simulationPolicy = getSimulationPolicy(env);

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
    marketSession,
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
      : "DATA_UNAVAILABLE";

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
    simulationAllowed: simulationPolicy.simulationAllowed,
    runtimeEnvironment: simulationPolicy.runtimeEnvironment,
    providerAvailable: streamState.providerAvailable,
    rawDataAvailable: streamState.rawDataAvailable,
    dataState: streamState.dataState,
    dataAge: streamState.dataAge,
    sourceType: streamState.sourceType,
    sessionState: streamState.sessionState,
    extendedHours: streamState.extendedHours,
    sessionSource: streamState.sessionSource,
    sessionVerified: streamState.sessionVerified,
    currentTime: streamState.currentTime,
    nextOpen: streamState.nextOpen,
    previousClose: streamState.previousClose,
    marketStatus: streamState.marketStatus,
    runtime,
    provider: streamState.provider,
    primaryProvider: providerStatus.primaryProvider,
    secondaryProvider: providerActive ? `${activeProvider}_ACTIVE` : "RAW_DATA_UNAVAILABLE",
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
      feedState: streamState.dataState === "MARKET_CLOSED"
        ? "MARKET_CLOSED"
        : providerStatus.providerHealth === "HEALTHY" || streamStatus.active ? "ACTIVE" : "DEGRADED",
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
