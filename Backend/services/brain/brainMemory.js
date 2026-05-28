/*
 * Rolling in-memory event memory for the brain layer.
 * It stores normalized market-event.v1 objects only and does not persist them.
 */

const {
  assertNormalizedMarketEvent,
  normalizeSymbol
} = require("../../providers/shared/marketEvent");

const DEFAULT_MAX_EVENTS_PER_SYMBOL = 100;
const memoryBySymbol = new Map();

function normalizeTimeframe(timeframe) {
  return typeof timeframe === "string" && timeframe.trim()
    ? timeframe
    : "unknown";
}

function getSymbolMemory(symbol, createIfMissing = false) {
  const normalizedSymbol = normalizeSymbol(symbol);

  if (!normalizedSymbol) {
    return null;
  }

  if (!memoryBySymbol.has(normalizedSymbol) && createIfMissing) {
    memoryBySymbol.set(normalizedSymbol, new Map());
  }

  return memoryBySymbol.get(normalizedSymbol) || null;
}

function addMemoryEvent(marketEvent, options = {}) {
  try {
    const normalizedEvent = assertNormalizedMarketEvent(marketEvent);
    const symbolMemory = getSymbolMemory(normalizedEvent.symbol, true);
    const timeframe = normalizeTimeframe(normalizedEvent.timeframe);
    const maxEventsPerSymbol = Number.isInteger(options.maxEventsPerSymbol) &&
      options.maxEventsPerSymbol > 0
      ? options.maxEventsPerSymbol
      : DEFAULT_MAX_EVENTS_PER_SYMBOL;
    const events = symbolMemory.get(timeframe) || [];

    events.push(normalizedEvent);

    while (events.length > maxEventsPerSymbol) {
      events.shift();
    }

    symbolMemory.set(timeframe, events);

    return {
      accepted: true,
      symbol: normalizedEvent.symbol,
      timeframe,
      storedEvents: events.length
    };
  } catch {
    return {
      accepted: false,
      reason: "invalid_market_event"
    };
  }
}

function getRecentMemory(options = {}) {
  const symbolMemory = getSymbolMemory(options.symbol);

  if (!symbolMemory) {
    return [];
  }

  const timeframe = normalizeTimeframe(options.timeframe);
  const events = symbolMemory.get(timeframe) || [];
  const limit = Number.isInteger(options.limit) && options.limit > 0
    ? options.limit
    : events.length;

  return events.slice(-limit);
}

function clearMemory() {
  memoryBySymbol.clear();
}

function getMemoryStats() {
  const memoryBySymbolStats = {};
  let totalEventsStored = 0;

  memoryBySymbol.forEach((timeframes, symbol) => {
    memoryBySymbolStats[symbol] = {};

    timeframes.forEach((events, timeframe) => {
      memoryBySymbolStats[symbol][timeframe] = events.length;
      totalEventsStored += events.length;
    });
  });

  return {
    totalSymbolsTracked: memoryBySymbol.size,
    totalEventsStored,
    memoryBySymbol: memoryBySymbolStats
  };
}

module.exports = {
  addMemoryEvent,
  clearMemory,
  getMemoryStats,
  getRecentMemory
};
