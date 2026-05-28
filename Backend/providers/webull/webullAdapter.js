/*
 * Normalizes Webull payloads into shared market events.
 * The streaming-oriented paths match Webull Tick, Quote, and Snapshot concepts.
 */

const {
  createCandleEvent,
  createOptionEvent,
  createQuoteEvent,
  createTradeEvent,
  firstDefined
} = require("../shared/marketEvent");

function readBasic(raw = {}) {
  return raw.basic || raw.Basic || {};
}

function metadata(raw, options = {}) {
  const basic = readBasic(raw);

  return {
    provider: "webull",
    source: options.source || "unknown",
    assetClass: options.assetClass || "equity",
    symbol: firstDefined(basic.symbol, raw.symbol, options.symbol),
    timestamp: firstDefined(
      raw.time,
      raw.trade_time,
      raw.timestamp,
      basic.timestamp,
      options.timestamp
    ),
    receivedAt: options.receivedAt
  };
}

function bestBookLevel(levels) {
  return Array.isArray(levels) && levels.length ? levels[0] : {};
}

function normalizeWebullTrade(rawTick = {}, options = {}) {
  return createTradeEvent(metadata(rawTick, options), {
    price: firstDefined(rawTick.price, rawTick.lastPrice),
    size: firstDefined(rawTick.volume, rawTick.size),
    volume: firstDefined(rawTick.volume, rawTick.size),
    side: firstDefined(rawTick.side, "unknown"),
    tradeId: firstDefined(rawTick.trade_id, rawTick.tradeId),
    exchange: firstDefined(rawTick.exchange, null)
  });
}

function normalizeWebullQuote(rawQuote = {}, options = {}) {
  const bestBid = bestBookLevel(firstDefined(rawQuote.bids, rawQuote.bidLevels));
  const bestAsk = bestBookLevel(firstDefined(rawQuote.asks, rawQuote.askLevels));

  return createQuoteEvent(metadata(rawQuote, options), {
    bidPrice: firstDefined(bestBid.price, rawQuote.bidPrice),
    bidSize: firstDefined(bestBid.size, rawQuote.bidSize),
    askPrice: firstDefined(bestAsk.price, rawQuote.askPrice),
    askSize: firstDefined(bestAsk.size, rawQuote.askSize),
    bidExchange: firstDefined(rawQuote.bidExchange, null),
    askExchange: firstDefined(rawQuote.askExchange, null)
  });
}

function normalizeWebullCandle(rawBar = {}, options = {}) {
  return createCandleEvent(metadata(rawBar, options), {
    open: firstDefined(rawBar.open, rawBar.o),
    high: firstDefined(rawBar.high, rawBar.h),
    low: firstDefined(rawBar.low, rawBar.l),
    close: firstDefined(rawBar.close, rawBar.c, rawBar.price),
    volume: firstDefined(rawBar.volume, rawBar.v),
    tradeCount: firstDefined(rawBar.tradeCount, rawBar.n),
    vwap: firstDefined(rawBar.vwap, rawBar.vw),
    timeframe: firstDefined(options.timeframe, rawBar.timeframe, "unknown")
  });
}

function normalizeWebullSnapshot(rawSnapshot = {}, options = {}) {
  return normalizeWebullCandle(rawSnapshot, {
    ...options,
    source: options.source || "stream"
  });
}

function normalizeWebullOption(rawOption = {}, options = {}) {
  return createOptionEvent(metadata(rawOption, {
    ...options,
    assetClass: "option"
  }), {
    contractSymbol: firstDefined(rawOption.contractSymbol, rawOption.symbol),
    underlyingSymbol: firstDefined(rawOption.underlyingSymbol, rawOption.underlying),
    expiration: firstDefined(rawOption.expiration, rawOption.expirationDate),
    strike: firstDefined(rawOption.strike, rawOption.strikePrice),
    optionType: firstDefined(rawOption.optionType, rawOption.type),
    bidPrice: rawOption.bidPrice,
    askPrice: rawOption.askPrice,
    lastPrice: firstDefined(rawOption.lastPrice, rawOption.price),
    volume: rawOption.volume,
    openInterest: rawOption.openInterest,
    impliedVolatility: rawOption.impliedVolatility,
    greeks: rawOption.greeks
  });
}

function normalizeWebullStreamEnvelope(envelope = {}) {
  const payload = envelope.payload || {};
  const options = {
    source: "stream",
    assetClass: envelope.assetClass,
    timeframe: envelope.timeframe,
    receivedAt: envelope.receivedAt
  };

  switch (envelope.channel) {
    case "tick":
      return normalizeWebullTrade(payload, options);
    case "quote":
      return normalizeWebullQuote(payload, options);
    case "snapshot":
      return normalizeWebullSnapshot(payload, options);
    default:
      return null;
  }
}

module.exports = {
  normalizeWebullCandle,
  normalizeWebullOption,
  normalizeWebullQuote,
  normalizeWebullSnapshot,
  normalizeWebullStreamEnvelope,
  normalizeWebullTrade
};
