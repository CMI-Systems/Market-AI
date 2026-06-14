/*
 * Local stream controller.
 * It starts the simulated stream now and reserves a clean interface for providers later.
 */

const {
  getSimulatedStreamStatus,
  startSimulatedStream,
  stopSimulatedStream
} = require("./simulatedStreamRunner");
const {
  getMarketHoursStatus
} = require("./marketHours");
const {
  evaluateMarketAvailability,
  resolveMarketSession
} = require("./marketSessionPolicy");
const {
  getSimulationPolicy
} = require("../config/runtimePolicy");

let activeSimulatedStream = null;
let lastSimulatedStatus = null;

function providerPlaceholder(source) {
  return {
    started: false,
    source,
    reason: "provider_stream_not_connected_yet"
  };
}

function startStream(options = {}) {
  const source = options.source;

  if (source === "webull" || source === "alpaca") {
    return providerPlaceholder(source);
  }

  if (source !== "simulated") {
    return providerPlaceholder(source || "unknown");
  }

  const policy = getSimulationPolicy(options.env || process.env);

  if (!policy.simulationAllowed) {
    return {
      started: false,
      source,
      reason: "simulation_not_allowed",
      code: "SIMULATION_NOT_ALLOWED",
      runtimeEnvironment: policy.runtimeEnvironment,
      simulationAllowed: false,
      simulated: false,
      generated: false
    };
  }

  if (activeSimulatedStream) {
    return {
      started: false,
      source,
      reason: "simulated_stream_already_active"
    };
  }

  const streamHandle = startSimulatedStream({
    symbol: options.symbol,
    symbols: options.symbols,
    provider: options.provider,
    intervalMs: options.intervalMs,
    maxEvents: options.maxEvents,
    systemContext: options.systemContext
  });
  activeSimulatedStream = streamHandle;
  lastSimulatedStatus = getSimulatedStreamStatus(activeSimulatedStream);

  streamHandle.completed.then(() => {
    lastSimulatedStatus = getSimulatedStreamStatus(streamHandle);

    if (activeSimulatedStream === streamHandle) {
      activeSimulatedStream = null;
    }
  });

  return {
    started: true,
    source,
    stream: activeSimulatedStream
  };
}

function stopStream() {
  const stopped = stopSimulatedStream(activeSimulatedStream);

  if (stopped) {
    lastSimulatedStatus = getSimulatedStreamStatus(activeSimulatedStream);
    activeSimulatedStream = null;
  }

  return stopped;
}

function createIdleStatus() {
  const marketHoursStatus = getMarketHoursStatus();
  const session = resolveMarketSession();
  const dataAvailability = evaluateMarketAvailability({
    available: false,
    provider: null,
    sourceType: session.marketOpen ? "DATA_UNAVAILABLE" : "MARKET_CLOSED",
    providerAvailable: false,
    backendAvailable: true,
    session
  });
  const policy = getSimulationPolicy();

  return {
    active: false,
    source: null,
    symbol: null,
    provider: null,
    mode: null,
    marketOpen: marketHoursStatus.isOpen,
    sessionState: session.sessionState,
    extendedHours: session.extendedHours,
    sessionSource: session.source,
    sessionVerified: session.verified,
    dataState: dataAvailability.dataState,
    dataAge: dataAvailability.dataAge,
    sourceType: dataAvailability.sourceType,
    eventsProcessed: 0,
    maxEvents: null,
    intervalMs: null,
    startedAt: null,
    stoppedAt: null,
    lastEventAt: null,
    lastActionBias: null,
    lastFailsafeStatus: null,
    runtimeEnvironment: policy.runtimeEnvironment,
    simulationAllowed: policy.simulationAllowed,
    simulationActive: false,
    simulated: false,
    generated: false,
    warnings: dataAvailability.warnings
  };
}

function getStreamStatus() {
  return getSimulatedStreamStatus(activeSimulatedStream) ||
    lastSimulatedStatus ||
    createIdleStatus();
}

module.exports = {
  getStreamStatus,
  startStream,
  stopStream
};
