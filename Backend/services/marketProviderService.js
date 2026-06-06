const axios = require("axios");
const { getMarketHoursStatus } = require("./marketHours");
const {
  getWebullCapabilities,
  getWebullConfigStatus,
  getWebullHealth
} = require("./webullService");

const TRACKED_SYMBOLS = ["SPY", "QQQ", "NVDA", "AAPL", "MSFT"];

const SYMBOL_NAMES = {
  SPY: "SPDR S&P 500 ETF Trust",
  QQQ: "Invesco QQQ Trust",
  NVDA: "NVIDIA Corporation",
  AAPL: "Apple Inc.",
  MSFT: "Microsoft Corporation",
  TSLA: "Tesla Inc.",
  AMD: "Advanced Micro Devices",
  META: "Meta Platforms",
  SOXL: "Direxion Semiconductor Bull 3X",
  PLTR: "Palantir Technologies"
};

const FALLBACK_QUOTES = {
  SPY: { symbol: "SPY", price: 604.23, changePercent: 0.51, volume: 71600000 },
  QQQ: { symbol: "QQQ", price: 531.79, changePercent: 0.92, volume: 38900000 },
  NVDA: { symbol: "NVDA", price: 145.22, changePercent: 2.14, volume: 45200000 },
  AAPL: { symbol: "AAPL", price: 203.41, changePercent: 0.64, volume: 52800000 },
  MSFT: { symbol: "MSFT", price: 489.12, changePercent: 1.08, volume: 29400000 },
  TSLA: { symbol: "TSLA", price: 184.06, changePercent: -2.36, volume: 93500000 },
  AMD: { symbol: "AMD", price: 164.58, changePercent: -0.72, volume: 61100000 },
  META: { symbol: "META", price: 641.33, changePercent: 1.42, volume: 18700000 },
  SOXL: { symbol: "SOXL", price: 48.91, changePercent: 3.88, volume: 82300000 },
  PLTR: { symbol: "PLTR", price: 126.75, changePercent: 1.76, volume: 54700000 }
};

const SIMULATION_FAILURES = new Set([
  "alpaca_down",
  "quotes_down",
  "candles_down",
  "provider_timeout",
  "no_provider"
]);

const TIMEFRAME_MAP = {
  "1MIN": { provider: "1Min", minutes: 1 },
  "1MINUTE": { provider: "1Min", minutes: 1 },
  "5MIN": { provider: "5Min", minutes: 5 },
  "5MINUTE": { provider: "5Min", minutes: 5 },
  "15MIN": { provider: "15Min", minutes: 15 },
  "15MINUTE": { provider: "15Min", minutes: 15 },
  "1H": { provider: "1Hour", minutes: 60 },
  "1HR": { provider: "1Hour", minutes: 60 },
  "1HOUR": { provider: "1Hour", minutes: 60 },
  "1D": { provider: "1Day", minutes: 1440 },
  "1DAY": { provider: "1Day", minutes: 1440 },
  DAY: { provider: "1Day", minutes: 1440 }
};

function normalizeSimulation(value) {
  return SIMULATION_FAILURES.has(value) ? value : null;
}

function normalizeTimeframe(timeframe = "5Min") {
  const key = String(timeframe || "5Min").replace(/\s+/g, "").toUpperCase();

  return TIMEFRAME_MAP[key] || TIMEFRAME_MAP["5MIN"];
}

function getHistoricalWindow(timeframe = "5Min", limit = 80) {
  const normalizedTimeframe = normalizeTimeframe(timeframe);
  const requestedLimit = Math.max(1, Math.min(Number(limit) || 80, 1000));
  const minimumLookbackDays = {
    "1Min": 2,
    "5Min": 5,
    "15Min": 10,
    "1Hour": 30,
    "1Day": 180
  };
  const barLookbackMinutes = normalizedTimeframe.minutes * requestedLimit * 2;
  const bufferLookbackMinutes =
    (minimumLookbackDays[normalizedTimeframe.provider] || 5) * 24 * 60;
  const lookbackMinutes = Math.max(barLookbackMinutes, bufferLookbackMinutes);
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - lookbackMinutes * 60 * 1000);

  return {
    start: startDate.toISOString(),
    end: endDate.toISOString()
  };
}

function shouldLogProviderDiagnostics(env = process.env) {
  return env.NODE_ENV !== "production" || env.MARKET_PROVIDER_DEBUG === "true";
}

function logEmptyAlpacaBarsDiagnostic(details, env = process.env) {
  if (!shouldLogProviderDiagnostics(env)) return;

  console.warn("[marketProviderService] Empty Alpaca bars response", details);
}

function formatVolume(volume) {
  if (!Number.isFinite(volume)) return "0";
  if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`;
  if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
  return String(volume);
}

function normalizeQuote(quote, provider, providerStatus = getProviderStatus()) {
  const normalizedSymbol = String(quote.symbol || "SPY").toUpperCase();

  return {
    symbol: normalizedSymbol,
    name: SYMBOL_NAMES[normalizedSymbol] || normalizedSymbol,
    price: Number(quote.price || 0),
    changePercent: Number(quote.changePercent || 0),
    volume: typeof quote.volume === "string" ? quote.volume : formatVolume(Number(quote.volume || 0)),
    provider,
    providerStatus: providerStatus.providerHealth,
    updatedAt: quote.updatedAt || new Date().toISOString()
  };
}

function formatCandleTime(timestamp) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) return "00:00";

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/New_York"
  });
}

function normalizeCandle(candle, provider) {
  const timestamp = candle.timestamp || candle.t || new Date().toISOString();

  return {
    time: candle.time || formatCandleTime(timestamp),
    timestamp,
    open: Number(candle.open ?? candle.o ?? 0),
    high: Number(candle.high ?? candle.h ?? 0),
    low: Number(candle.low ?? candle.l ?? 0),
    close: Number(candle.close ?? candle.c ?? 0),
    volume: Number(candle.volume ?? candle.v ?? 0),
    provider
  };
}

function isWebullConfigured(env = process.env) {
  return getWebullConfigStatus(env).configured;
}

function isWebullEnabled(env = process.env, options = {}) {
  if (normalizeSimulation(options.simulate) === "no_provider") return false;
  return getWebullConfigStatus(env).enabled;
}

function getAlpacaDataUrl(env = process.env) {
  return env.ALPACA_DATA_URL || env.ALPACA_BASE_URL;
}

function isAlpacaAvailable(env = process.env, options = {}) {
  const simulate = normalizeSimulation(options.simulate);
  if (simulate === "alpaca_down" || simulate === "no_provider" || simulate === "provider_timeout") {
    return false;
  }
  return Boolean(env.ALPACA_API_KEY && env.ALPACA_SECRET_KEY && getAlpacaDataUrl(env));
}

function getActiveProvider(env = process.env, options = {}) {
  if (isWebullEnabled(env, options)) return "WEBULL";
  if (isAlpacaAvailable(env, options)) return "ALPACA";
  return "FALLBACK";
}

function getMarketStatus() {
  const marketHours = getMarketHoursStatus();

  return marketHours.isOpen ? "OPEN" : "CLOSED";
}

function getProviderCapabilities(provider = getActiveProvider(), options = {}) {
  const simulate = normalizeSimulation(options.simulate);

  if (simulate === "no_provider") {
    return {
      equities: false,
      options: false,
      futures: false,
      historicalCandles: false,
      quotes: false,
      news: false
    };
  }

  if (provider === "WEBULL") {
    return getWebullCapabilities();
  }

  if (provider === "ALPACA") {
    return {
      equities: true,
      options: false,
      futures: false,
      historicalCandles: true,
      quotes: true,
      news: false
    };
  }

  return {
    equities: true,
    options: false,
    futures: false,
    historicalCandles: true,
    quotes: true,
    news: false
  };
}

function getProviderHealth(provider = getActiveProvider(), options = {}) {
  const simulate = normalizeSimulation(options.simulate);

  if (simulate === "no_provider") return "OFFLINE";
  if (provider === "FALLBACK" || simulate) return "DEGRADED";
  return provider === "FALLBACK" ? "DEGRADED" : "HEALTHY";
}

function getProviderStatus(options = {}) {
  const env = options.env || process.env;
  const activeProvider = getActiveProvider(env, options);
  const providerHealth = getProviderHealth(activeProvider, options);
  const capabilities = getProviderCapabilities(activeProvider, options);
  const warnings = [];

  if (activeProvider === "FALLBACK") {
    warnings.push("Primary live provider unavailable; simulation fallback is active.");
  }

  if (normalizeSimulation(options.simulate)) {
    warnings.push(`Provider simulation active: ${options.simulate}.`);
  }

  return {
    primaryProvider: isWebullEnabled(env, options) ? "WEBULL" : "WEBULL_PENDING",
    activeProvider: activeProvider === "FALLBACK" ? "SIMULATION" : activeProvider,
    fallbackProvider: "SIMULATION",
    marketStatus: getMarketStatus(),
    providerHealth,
    capabilities,
    trackedSymbols: TRACKED_SYMBOLS,
    lastUpdate: new Date().toISOString(),
    failoverReady: true,
    warnings
  };
}

function fallbackQuote(symbol, providerHealth = "DEGRADED") {
  const normalizedSymbol = String(symbol || "SPY").toUpperCase();
  const quote = FALLBACK_QUOTES[normalizedSymbol] || FALLBACK_QUOTES.SPY;

  return normalizeQuote(
    {
      ...quote,
      symbol: normalizedSymbol,
      updatedAt: new Date().toISOString()
    },
    "SIMULATION",
    { providerHealth }
  );
}

function fallbackCandles(symbol, limit = 80, timeframe = "5Min") {
  const normalizedSymbol = String(symbol || "SPY").toUpperCase();
  const quote = FALLBACK_QUOTES[normalizedSymbol] || FALLBACK_QUOTES.SPY;
  const requestedLimit = Math.max(12, Math.min(Number(limit) || 80, 120));
  const normalizedTimeframe = normalizeTimeframe(timeframe);
  const startTime = Date.now() - requestedLimit * normalizedTimeframe.minutes * 60 * 1000;
  const basePrice = quote.price * 0.992;

  return Array.from({ length: requestedLimit }, (_, index) => {
    const timestamp = new Date(startTime + index * normalizedTimeframe.minutes * 60 * 1000).toISOString();
    const progress = requestedLimit > 1 ? index / (requestedLimit - 1) : 1;
    const center = basePrice + (quote.price - basePrice) * progress;
    const wave = Math.sin(index / 4) * quote.price * 0.0015;
    const open = center + wave;
    const close = index === requestedLimit - 1
      ? quote.price
      : center + Math.sin((index + 1) / 4) * quote.price * 0.0015;
    const wickSize = quote.price * 0.0008;
    const high = Math.max(open, close) + wickSize;
    const low = Math.min(open, close) - wickSize;

    return normalizeCandle(
      {
        timestamp,
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume: Math.round((quote.volume || 1000000) / requestedLimit)
      },
      "SIMULATION"
    );
  });
}

async function getAlpacaQuote(symbol, env = process.env) {
  const normalizedSymbol = String(symbol || "SPY").toUpperCase();
  const headers = {
    "APCA-API-KEY-ID": env.ALPACA_API_KEY,
    "APCA-API-SECRET-KEY": env.ALPACA_SECRET_KEY
  };
  const alpacaDataUrl = getAlpacaDataUrl(env);
  const [tradeResponse, barResponse] = await Promise.all([
    axios.get(`${alpacaDataUrl}/v2/stocks/${normalizedSymbol}/trades/latest`, { headers, timeout: 5000 }),
    axios.get(`${alpacaDataUrl}/v2/stocks/${normalizedSymbol}/bars/latest`, {
      headers,
      params: {
        feed: "iex"
      },
      timeout: 5000
    })
  ]);
  const trade = tradeResponse.data?.trade || {};
  const bar = barResponse.data?.bar || {};
  const price = trade.p ?? bar.c ?? 0;
  const open = bar.o ?? price;
  const changePercent = open
    ? ((price - open) / open) * 100
    : 0;

  return normalizeQuote(
    {
      symbol: normalizedSymbol,
      price,
      changePercent: Number(changePercent.toFixed(2)),
      volume: bar.v ?? 0,
      updatedAt: trade.t || bar.t || new Date().toISOString()
    },
    "ALPACA",
    {
      providerHealth: "HEALTHY"
    }
  );
}

async function getQuote(symbol, options = {}) {
  const env = options.env || process.env;
  const activeProvider = getActiveProvider(env, options);
  const simulate = normalizeSimulation(options.simulate);

  if (simulate === "quotes_down" || simulate === "provider_timeout" || simulate === "alpaca_down") {
    return fallbackQuote(symbol, "DEGRADED");
  }

  if (simulate === "no_provider") {
    return fallbackQuote(symbol, "OFFLINE");
  }

  if (activeProvider === "ALPACA") {
    try {
      return await getAlpacaQuote(symbol, env);
    } catch {
      return fallbackQuote(symbol);
    }
  }

  return fallbackQuote(symbol);
}

async function getQuotes(symbols, options = {}) {
  const requestedSymbols = Array.isArray(symbols) && symbols.length
    ? symbols
    : TRACKED_SYMBOLS;

  return Promise.all(requestedSymbols.map((symbol) => getQuote(symbol, options)));
}

async function getAlpacaHistoricalCandles(symbol, timeframe = "5Min", limit = 80, env = process.env) {
  const normalizedSymbol = String(symbol || "SPY").toUpperCase();
  const headers = {
    "APCA-API-KEY-ID": env.ALPACA_API_KEY,
    "APCA-API-SECRET-KEY": env.ALPACA_SECRET_KEY
  };
  const requestedLimit = Math.max(1, Math.min(Number(limit) || 80, 1000));
  const normalizedTimeframe = normalizeTimeframe(timeframe);
  const historicalWindow = getHistoricalWindow(timeframe, requestedLimit);
  const alpacaDataUrl = getAlpacaDataUrl(env);
  const response = await axios.get(
    `${alpacaDataUrl}/v2/stocks/${normalizedSymbol}/bars`,
    {
      headers,
      params: {
        timeframe: normalizedTimeframe.provider,
        start: historicalWindow.start,
        end: historicalWindow.end,
        limit: requestedLimit,
        adjustment: "raw",
        feed: "iex"
      },
      timeout: 5000
    }
  );
  const bars = Array.isArray(response.data?.bars)
    ? response.data.bars
    : Array.isArray(response.data?.bars?.[normalizedSymbol])
      ? response.data.bars[normalizedSymbol]
      : [];

  if (!bars.length) {
    logEmptyAlpacaBarsDiagnostic(
      {
        symbol: normalizedSymbol,
        timeframe: normalizedTimeframe.provider,
        start: historicalWindow.start,
        end: historicalWindow.end,
        status: response.status,
        responseKeys: Object.keys(response.data || {}),
        reason: "EMPTY_ALPACA_BARS"
      },
      env
    );
  }

  return bars.map((bar) => normalizeCandle(bar, "ALPACA"));
}

async function getHistoricalCandles(symbol, timeframe = "5Min", limit = 80, options = {}) {
  const env = options.env || process.env;
  const activeProvider = getActiveProvider(env, options);
  const simulate = normalizeSimulation(options.simulate);

  if (simulate === "candles_down" || simulate === "provider_timeout" || simulate === "alpaca_down" || simulate === "no_provider") {
    return fallbackCandles(symbol, limit, timeframe);
  }

  if (activeProvider === "ALPACA") {
    try {
      const candles = await getAlpacaHistoricalCandles(symbol, timeframe, limit, env);

      return candles.length ? candles : fallbackCandles(symbol, limit, timeframe);
    } catch {
      return fallbackCandles(symbol, limit, timeframe);
    }
  }

  return fallbackCandles(symbol, limit, timeframe);
}

function averageClose(candles) {
  if (!candles.length) return 0;

  return candles.reduce((total, candle) => total + candle.close, 0) / candles.length;
}

function isRisingTrend(candles) {
  if (candles.length < 2) return false;

  const midpoint = Math.floor(candles.length / 2);
  const firstAverage = averageClose(candles.slice(0, midpoint));
  const secondAverage = averageClose(candles.slice(midpoint));

  return secondAverage > firstAverage;
}

function isVolatile(candles, latestClose) {
  if (!candles.length || !latestClose) return false;

  const recent = candles.slice(-20);
  const high = Math.max(...recent.map((candle) => candle.high));
  const low = Math.min(...recent.map((candle) => candle.low));

  return ((high - low) / latestClose) * 100 > 2.5;
}

function crossedAboveAverageAfterWeakness(candles) {
  if (candles.length < 25) return false;

  const recentAverage = averageClose(candles.slice(-20));
  const previous = candles[candles.length - 2];
  const latest = candles[candles.length - 1];
  const priorWeakness = candles.slice(-8, -2).some((candle) => candle.close < recentAverage);

  return priorWeakness && previous.close <= recentAverage && latest.close > recentAverage;
}

function signalConfidence({ changePercent, latestClose, recentAverage, rising, volatile, signal }) {
  let confidence = 50;

  if (signal === "BUY WATCH") confidence += 22;
  if (signal === "MOMENTUM WATCH") confidence += 14;
  if (signal === "REVERSAL WATCH") confidence += 12;
  if (signal === "RISK WATCH") confidence += 18;
  if (Math.abs(changePercent) > 2) confidence += 8;
  if (latestClose > recentAverage) confidence += 8;
  if (rising) confidence += 6;
  if (volatile) confidence -= 12;

  return Math.max(25, Math.min(95, Math.round(confidence)));
}

function generateProviderSignal(quote, candles) {
  const latest = candles[candles.length - 1];
  const recent = candles.slice(-20);
  const recentAverage = averageClose(recent);
  const latestClose = latest?.close || quote.price;
  const rising = isRisingTrend(recent);
  const volatile = isVolatile(candles, latestClose);
  const changePercent = Number(quote.changePercent || 0);
  const reversal = crossedAboveAverageAfterWeakness(candles);
  let signal = "NEUTRAL";
  let signalType = "BALANCED";
  let reason = "Provider price action remains balanced without a confirmed signal.";

  if (changePercent < -1.5) {
    signal = "RISK WATCH";
    signalType = "RISK";
    reason = "Price pressure is negative and risk monitoring is elevated.";
  } else if (changePercent > 1.5 && latestClose > recentAverage) {
    signal = "BUY WATCH";
    signalType = "MOMENTUM";
    reason = "Price momentum and candle strength are improving.";
  } else if (changePercent > 0.75 && rising) {
    signal = "MOMENTUM WATCH";
    signalType = "MOMENTUM";
    reason = "Provider candles show a rising trend with improving price action.";
  } else if (reversal) {
    signal = "REVERSAL WATCH";
    signalType = "REVERSAL";
    reason = "Latest close crossed above the recent average after prior weakness.";
  }

  const confidence = signalConfidence({
    changePercent,
    latestClose,
    recentAverage,
    rising,
    volatile,
    signal
  });
  const risk = changePercent < -2 || volatile
    ? "HIGH"
    : signal.includes("WATCH") && confidence >= 65
      ? "LOW"
      : "MODERATE";

  return {
    symbol: quote.symbol,
    price: quote.price,
    changePercent,
    volume: quote.volume,
    signal,
    signalType,
    confidence,
    risk,
    reason,
    provider: quote.provider,
    updatedAt: new Date().toISOString()
  };
}

async function getProviderSignals(symbols, options = {}) {
  const requestedSymbols = Array.isArray(symbols) && symbols.length
    ? symbols
    : TRACKED_SYMBOLS;
  const quotes = await getQuotes(requestedSymbols, options);

  return Promise.all(
    quotes.map(async (quote) => {
      const candles = await getHistoricalCandles(quote.symbol, "5Min", 80, options);

      return generateProviderSignal(quote, candles);
    })
  );
}

function getProviderDiagnostics(options = {}) {
  const env = options.env || process.env;
  const simulate = normalizeSimulation(options.simulate);
  const webullHealth = getWebullHealth(env);
  const alpacaConfigured = Boolean(env.ALPACA_API_KEY && env.ALPACA_SECRET_KEY && getAlpacaDataUrl(env));
  const alpacaEnabled = alpacaConfigured && simulate !== "no_provider";
  const alpacaHealthy = alpacaConfigured &&
    !["alpaca_down", "provider_timeout", "no_provider"].includes(simulate || "");
  const quotesHealthy = alpacaHealthy && simulate !== "quotes_down";
  const candlesHealthy = alpacaHealthy && simulate !== "candles_down";
  const providerStatus = getProviderStatus(options);
  const warnings = [...providerStatus.warnings];

  if (!alpacaHealthy) {
    warnings.push("Alpaca provider path is unavailable or simulated down.");
  }

  return {
    webull: {
      configured: webullHealth.configured,
      enabled: webullHealth.enabled,
      status: webullHealth.status,
      readyForActivation: webullHealth.readyForActivation,
      environment: webullHealth.environment,
      capabilities: getWebullCapabilities()
    },
    alpaca: {
      enabled: alpacaEnabled,
      status: alpacaHealthy ? "HEALTHY" : "DEGRADED",
      quotes: quotesHealthy,
      candles: candlesHealthy
    },
    fallback: {
      enabled: true,
      status: "AVAILABLE"
    },
    activeProvider: providerStatus.activeProvider,
    providerHealth: providerStatus.providerHealth,
    failoverReady: true,
    warnings
  };
}

module.exports = {
  getActiveProvider,
  getProviderDiagnostics,
  getProviderStatus,
  getQuote,
  getQuotes,
  getHistoricalCandles,
  getProviderSignals,
  getMarketStatus,
  getProviderCapabilities,
  isAlpacaAvailable,
  isWebullEnabled,
  getAlpacaDataUrl,
  normalizeTimeframe
};
