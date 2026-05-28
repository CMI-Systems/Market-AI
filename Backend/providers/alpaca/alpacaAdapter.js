/*
 * Normalizes Alpaca REST or streaming market data into shared market events.
 * Keep Alpaca field names here so brains never depend on provider payloads.
 */

const {
  createCandleEvent,
  createOptionEvent,
  createQuoteEvent,
  createTradeEvent,
  firstDefined
} = require("../shared/marketEvent");

function metadata(raw, options = {}) {
  return {
    provider: "alpaca",
    source: options.source || "unknown",
    assetClass: options.assetClass || "equity",
    symbol: firstDefined(raw.S, raw.symbol, raw.s, options.symbol),
    timestamp: firstDefined(raw.t, raw.timestamp, raw.time, options.timestamp),
    receivedAt: options.receivedAt
  };
}

function normalizeAlpacaTrade(rawTrade = {}, options = {}) {
  return createTradeEvent(metadata(rawTrade, options), {
    price: firstDefined(rawTrade.p, rawTrade.price),
    size: firstDefined(rawTrade.s, rawTrade.size, rawTrade.volume),
    side: firstDefined(rawTrade.side, "unknown"),
    tradeId: firstDefined(rawTrade.i, rawTrade.id),
    exchange: firstDefined(rawTrade.x, rawTrade.exchange),
    conditions: firstDefined(rawTrade.c, rawTrade.conditions, [])
  });
}

function normalizeAlpacaQuote(rawQuote = {}, options = {}) {
  return createQuoteEvent(metadata(rawQuote, options), {
    bidPrice: firstDefined(rawQuote.bp, rawQuote.bidPrice),
    bidSize: firstDefined(rawQuote.bs, rawQuote.bidSize),
    askPrice: firstDefined(rawQuote.ap, rawQuote.askPrice),
    askSize: firstDefined(rawQuote.as, rawQuote.askSize),
    bidExchange: firstDefined(rawQuote.bx, rawQuote.bidExchange),
    askExchange: firstDefined(rawQuote.ax, rawQuote.askExchange)
  });
}

function normalizeAlpacaCandle(rawBar = {}, options = {}) {
  return createCandleEvent(metadata(rawBar, options), {
    open: firstDefined(rawBar.o, rawBar.open),
    high: firstDefined(rawBar.h, rawBar.high),
    low: firstDefined(rawBar.l, rawBar.low),
    close: firstDefined(rawBar.c, rawBar.close),
    volume: firstDefined(rawBar.v, rawBar.volume),
    tradeCount: firstDefined(rawBar.n, rawBar.tradeCount),
    vwap: firstDefined(rawBar.vw, rawBar.vwap),
    timeframe: firstDefined(options.timeframe, rawBar.timeframe, "unknown")
  });
}

function normalizeAlpacaOption(rawOption = {}, options = {}) {
  return createOptionEvent(metadata(rawOption, {
    ...options,
    assetClass: "option"
  }), {
    contractSymbol: firstDefined(rawOption.S, rawOption.symbol, rawOption.contractSymbol),
    underlyingSymbol: firstDefined(rawOption.underlyingSymbol, rawOption.underlying),
    expiration: firstDefined(rawOption.expiration, rawOption.expirationDate),
    strike: firstDefined(rawOption.strike, rawOption.strikePrice),
    optionType: firstDefined(rawOption.optionType, rawOption.type),
    bidPrice: firstDefined(rawOption.bp, rawOption.bidPrice),
    askPrice: firstDefined(rawOption.ap, rawOption.askPrice),
    lastPrice: firstDefined(rawOption.p, rawOption.lastPrice, rawOption.price),
    volume: firstDefined(rawOption.v, rawOption.volume),
    openInterest: firstDefined(rawOption.openInterest, rawOption.oi),
    impliedVolatility: firstDefined(rawOption.impliedVolatility, rawOption.iv),
    greeks: rawOption.greeks
  });
}

function normalizeAlpacaStreamMessage(message = {}, options = {}) {
  switch (message.T) {
    case "t":
      return normalizeAlpacaTrade(message, { ...options, source: "stream" });
    case "q":
      return normalizeAlpacaQuote(message, { ...options, source: "stream" });
    case "b":
      return normalizeAlpacaCandle(message, { ...options, source: "stream" });
    default:
      return null;
  }
}

module.exports = {
  normalizeAlpacaCandle,
  normalizeAlpacaOption,
  normalizeAlpacaQuote,
  normalizeAlpacaStreamMessage,
  normalizeAlpacaTrade
};
