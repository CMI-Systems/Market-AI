/*
 * Shared normalized market event helpers.
 * Intelligence systems should consume this provider-independent shape only.
 */

const EVENT_TYPES = new Set(["trade", "quote", "candle", "option"]);
const PROVIDERS = new Set(["webull", "alpaca", "unknown"]);
const SOURCES = new Set(["rest", "stream", "historical", "unknown"]);
const ASSET_CLASSES = new Set([
  "equity",
  "option",
  "crypto",
  "future",
  "unknown"
]);

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function firstDefined(...values) {
  return values.find(value => value !== undefined && value !== null);
}

function toNumber(value, fallback = null) {
  if (value === "" || value === undefined || value === null) {
    return fallback;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function toTimestamp(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const milliseconds = value > 100000000000 ? value : value * 1000;
    const date = new Date(milliseconds);
    return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  }

  if (typeof value === "string" && value.trim()) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  }

  return new Date().toISOString();
}

function normalizeSymbol(value) {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

function normalizeProvider(value) {
  return PROVIDERS.has(value) ? value : "unknown";
}

function normalizeSource(value) {
  return SOURCES.has(value) ? value : "unknown";
}

function normalizeAssetClass(value) {
  return ASSET_CLASSES.has(value) ? value : "unknown";
}

function createBaseEvent(eventType, metadata = {}) {
  if (!EVENT_TYPES.has(eventType)) {
    throw new Error(`Unsupported normalized market event type: ${eventType}`);
  }

  return {
    schemaVersion: "market-event.v1",
    eventType,
    provider: normalizeProvider(metadata.provider),
    source: normalizeSource(metadata.source),
    assetClass: normalizeAssetClass(metadata.assetClass),
    symbol: normalizeSymbol(metadata.symbol),
    timestamp: toTimestamp(metadata.timestamp),
    receivedAt: toTimestamp(metadata.receivedAt || new Date()),
    volume: toNumber(metadata.volume)
  };
}

function createTradeEvent(metadata = {}, trade = {}) {
  const normalizedTrade = asObject(trade);

  return {
    ...createBaseEvent("trade", {
      ...metadata,
      volume: firstDefined(metadata.volume, normalizedTrade.volume, normalizedTrade.size)
    }),
    trade: {
      price: toNumber(normalizedTrade.price),
      size: toNumber(firstDefined(normalizedTrade.size, normalizedTrade.volume)),
      side: typeof normalizedTrade.side === "string" ? normalizedTrade.side : "unknown",
      tradeId: firstDefined(normalizedTrade.tradeId, null),
      exchange: firstDefined(normalizedTrade.exchange, null),
      conditions: Array.isArray(normalizedTrade.conditions)
        ? normalizedTrade.conditions
        : []
    }
  };
}

function createQuoteEvent(metadata = {}, quote = {}) {
  const normalizedQuote = asObject(quote);
  const bidPrice = toNumber(normalizedQuote.bidPrice);
  const askPrice = toNumber(normalizedQuote.askPrice);

  return {
    ...createBaseEvent("quote", metadata),
    quote: {
      bidPrice,
      bidSize: toNumber(normalizedQuote.bidSize),
      askPrice,
      askSize: toNumber(normalizedQuote.askSize),
      bidExchange: firstDefined(normalizedQuote.bidExchange, null),
      askExchange: firstDefined(normalizedQuote.askExchange, null),
      spread: bidPrice !== null && askPrice !== null ? askPrice - bidPrice : null,
      midpoint: bidPrice !== null && askPrice !== null
        ? (bidPrice + askPrice) / 2
        : null
    }
  };
}

function createCandleEvent(metadata = {}, candle = {}) {
  const normalizedCandle = asObject(candle);

  return {
    ...createBaseEvent("candle", {
      ...metadata,
      volume: firstDefined(metadata.volume, normalizedCandle.volume)
    }),
    timeframe:
      typeof normalizedCandle.timeframe === "string" && normalizedCandle.timeframe.trim()
        ? normalizedCandle.timeframe
        : "unknown",
    candle: {
      open: toNumber(normalizedCandle.open),
      high: toNumber(normalizedCandle.high),
      low: toNumber(normalizedCandle.low),
      close: toNumber(normalizedCandle.close),
      volume: toNumber(normalizedCandle.volume),
      tradeCount: toNumber(normalizedCandle.tradeCount),
      vwap: toNumber(normalizedCandle.vwap)
    }
  };
}

function createOptionEvent(metadata = {}, option = {}) {
  const normalizedOption = asObject(option);
  const greeks = asObject(normalizedOption.greeks);

  return {
    ...createBaseEvent("option", {
      ...metadata,
      assetClass: "option",
      volume: firstDefined(metadata.volume, normalizedOption.volume)
    }),
    option: {
      contractSymbol: normalizeSymbol(normalizedOption.contractSymbol),
      underlyingSymbol: normalizeSymbol(normalizedOption.underlyingSymbol),
      expiration: firstDefined(normalizedOption.expiration, null),
      strike: toNumber(normalizedOption.strike),
      optionType: firstDefined(normalizedOption.optionType, "unknown"),
      bidPrice: toNumber(normalizedOption.bidPrice),
      askPrice: toNumber(normalizedOption.askPrice),
      lastPrice: toNumber(normalizedOption.lastPrice),
      volume: toNumber(normalizedOption.volume),
      openInterest: toNumber(normalizedOption.openInterest),
      impliedVolatility: toNumber(normalizedOption.impliedVolatility),
      greeks: {
        delta: toNumber(greeks.delta),
        gamma: toNumber(greeks.gamma),
        theta: toNumber(greeks.theta),
        vega: toNumber(greeks.vega),
        rho: toNumber(greeks.rho)
      }
    }
  };
}

function isNormalizedMarketEvent(event) {
  return Boolean(
    event &&
    event.schemaVersion === "market-event.v1" &&
    EVENT_TYPES.has(event.eventType) &&
    PROVIDERS.has(event.provider) &&
    typeof event.symbol === "string" &&
    event.symbol.length > 0 &&
    typeof event.timestamp === "string"
  );
}

function assertNormalizedMarketEvent(event) {
  if (!isNormalizedMarketEvent(event)) {
    throw new Error("Brains must receive normalized market-event.v1 objects only.");
  }

  return event;
}

module.exports = {
  assertNormalizedMarketEvent,
  createCandleEvent,
  createOptionEvent,
  createQuoteEvent,
  createTradeEvent,
  firstDefined,
  isNormalizedMarketEvent,
  normalizeSymbol,
  toNumber,
  toTimestamp
};
