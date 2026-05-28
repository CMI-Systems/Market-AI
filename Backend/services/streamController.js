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

  return {
    active: false,
    source: null,
    symbol: null,
    provider: null,
    mode: null,
    marketOpen: marketHoursStatus.isOpen,
    eventsProcessed: 0,
    maxEvents: null,
    intervalMs: null,
    startedAt: null,
    stoppedAt: null,
    lastEventAt: null,
    lastActionBias: null,
    lastFailsafeStatus: null
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
