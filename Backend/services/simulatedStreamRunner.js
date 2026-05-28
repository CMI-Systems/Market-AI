/*
 * Local-only simulated stream runner for backend development.
 * It creates normalized fake market events and sends them through live ingestion.
 */

const {
  createTradeEvent
} = require("../providers/shared/marketEvent");
const {
  ingestMarketEvent
} = require("./liveIngestion");
const {
  recordStreamStart,
  recordStreamStop
} = require("./runtimeMetrics");
const {
  getMarketHoursStatus
} = require("./marketHours");
const {
  CLOSED_MARKET_SIM_MODE,
  SHADOW_MODE
} = require("./simulationMode");

const activeStreams = new Set();
const DEFAULT_SIMULATED_WATCHLIST = [
  "NVDA",
  "AMD",
  "TSM",
  "META",
  "MSFT",
  "QQQ",
  "SPY",
  "SOXL"
];

function normalizeSymbols(options = {}) {
  const rawSymbols = Array.isArray(options.symbols) && options.symbols.length
    ? options.symbols
    : options.symbol
      ? [options.symbol]
      : DEFAULT_SIMULATED_WATCHLIST;
  const symbols = rawSymbols
    .map((symbol) => String(symbol || "").trim().toUpperCase())
    .filter(Boolean);

  return symbols.length ? [...new Set(symbols)] : [...DEFAULT_SIMULATED_WATCHLIST];
}

function createInitialStatus({
  symbols,
  provider,
  intervalMs,
  maxEvents,
  mode,
  marketOpen
}) {
  return {
    active: true,
    source: "simulated",
    symbol: symbols[0],
    symbols,
    provider,
    mode,
    marketOpen,
    eventsProcessed: 0,
    maxEvents,
    intervalMs,
    startedAt: new Date().toISOString(),
    stoppedAt: null,
    lastEventAt: null,
    lastActionBias: null,
    lastFailsafeStatus: null
  };
}

function createSimulatedTradeEvent({ symbol, provider, eventNumber }) {
  const price = Number((100 + eventNumber * 0.25).toFixed(2));

  return createTradeEvent(
    {
      provider,
      source: "stream",
      assetClass: "equity",
      symbol,
      timestamp: new Date().toISOString()
    },
    {
      price,
      size: 10 + eventNumber,
      side: eventNumber % 2 === 0 ? "SELL" : "BUY",
      tradeId: `simulated-${eventNumber}`
    }
  );
}

function logIngestionResult(eventNumber, symbol, result) {
  const finalDecision = result.brainOutput?.finalDecision;
  const failsafeBrain = result.brainOutput?.failsafeBrain;

  console.log(
    `[simulated stream] event ${eventNumber} | ${symbol} | accepted: ${result.accepted}` +
    ` | actionBias: ${finalDecision?.actionBias || "n/a"}` +
    ` | failsafe: ${failsafeBrain?.status || "n/a"}`
  );
}

function stopSimulatedStream(streamHandle) {
  if (!streamHandle || streamHandle.stopped) {
    return false;
  }

  clearInterval(streamHandle.timer);
  streamHandle.stopped = true;
  streamHandle.status.active = false;
  streamHandle.status.stoppedAt = new Date().toISOString();
  recordStreamStop();
  activeStreams.delete(streamHandle);
  streamHandle.resolveCompletion({
    stopped: true,
    emittedEvents: streamHandle.emittedEvents
  });

  return true;
}

function startSimulatedStream(options = {}) {
  const symbols = normalizeSymbols(options);
  const provider = options.provider || "simulated";
  const intervalMs = Number.isFinite(options.intervalMs) && options.intervalMs > 0
    ? options.intervalMs
    : 1000;
  const maxEvents = Number.isInteger(options.maxEvents) && options.maxEvents > 0
    ? options.maxEvents
    : 5;
  const systemContext = options.systemContext || {};
  const marketHoursStatus = getMarketHoursStatus();
  const marketOpen = typeof systemContext.marketOpen === "boolean"
    ? systemContext.marketOpen
    : marketHoursStatus.isOpen;
  // Closed-market simulated streams are for cockpit testing only.
  // Force their mode so downstream persistence guards can recognize them.
  const mode = marketOpen
    ? systemContext.mode || SHADOW_MODE
    : CLOSED_MARKET_SIM_MODE;
  const streamSystemContext = {
    ...systemContext,
    mode,
    marketOpen,
    marketHoursReason: systemContext.marketHoursReason || marketHoursStatus.reason
  };

  let resolveCompletion;
  const completed = new Promise((resolve) => {
    resolveCompletion = resolve;
  });
  const streamHandle = {
    completed,
    emittedEvents: 0,
    resolveCompletion,
    status: createInitialStatus({
      symbols,
      provider,
      intervalMs,
      maxEvents,
      mode,
      marketOpen
    }),
    stopped: false,
    timer: null
  };

  function emitEvent() {
    if (streamHandle.stopped) {
      return;
    }

    streamHandle.emittedEvents += 1;
    const symbolIndex = (streamHandle.emittedEvents - 1) % symbols.length;
    const symbol = symbols[symbolIndex];

    const marketEvent = createSimulatedTradeEvent({
      symbol,
      provider,
      eventNumber: streamHandle.emittedEvents
    });
    const result = ingestMarketEvent({
      marketEvent,
      userContext: {},
      journalContext: {},
      systemContext: streamSystemContext
    });

    streamHandle.status.eventsProcessed = streamHandle.emittedEvents;
    streamHandle.status.symbol = marketEvent.symbol;
    streamHandle.status.lastEventAt = new Date().toISOString();
    streamHandle.status.lastActionBias =
      result.brainOutput?.finalDecision?.actionBias || null;
    streamHandle.status.lastFailsafeStatus =
      result.brainOutput?.failsafeBrain?.status || null;

    logIngestionResult(streamHandle.emittedEvents, marketEvent.symbol, result);

    if (streamHandle.emittedEvents >= maxEvents) {
      stopSimulatedStream(streamHandle);
    }
  }

  streamHandle.timer = setInterval(emitEvent, intervalMs);
  activeStreams.add(streamHandle);
  recordStreamStart({
    source: "simulated",
    symbol: symbols.join(",")
  });

  return streamHandle;
}

function getSimulatedStreamStatus(streamHandle) {
  if (!streamHandle?.status) {
    return null;
  }

  return {
    ...streamHandle.status
  };
}

module.exports = {
  DEFAULT_SIMULATED_WATCHLIST,
  createSimulatedTradeEvent,
  getSimulatedStreamStatus,
  normalizeSymbols,
  startSimulatedStream,
  stopSimulatedStream
};
