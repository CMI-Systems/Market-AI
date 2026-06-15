const axios = require("axios");
const {
  getWebullCapabilities,
  getWebullConfigStatus,
  getWebullHealth
} = require("./webullService");
const {
  getSimulationPolicy,
  normalizeRuntimeEnvironment
} = require("../config/runtimePolicy");
const {
  evaluateMarketAvailability,
  resolveMarketSession
} = require("./marketSessionPolicy");
const {
  validateQuote,
  validateCandle,
  validateCandles
} = require("./marketDataValidator");

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

function getAuthorizedSimulation(options = {}, env = process.env) {
  const requestedSimulation = normalizeSimulation(options.simulate);
  const policy = getSimulationPolicy(env);

  return {
    policy,
    requestedSimulation,
    simulation: requestedSimulation && policy.simulationAllowed
      ? requestedSimulation
      : null,
    simulationRejected: Boolean(requestedSimulation && !policy.simulationAllowed)
  };
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

function isFiniteNumber(value) {
  return Number.isFinite(Number(value));
}

function isPositiveNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0;
}

function isNonNegativeNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0;
}

function isValidTimestamp(value) {
  if (!value) return false;
  return Number.isFinite(new Date(value).getTime());
}

function classifyProviderError(error) {
  const status = error?.response?.status;
  const code = String(error?.code || "").toUpperCase();
  const message = String(error?.message || "").toUpperCase();

  if (status === 401) return "AUTHENTICATION_FAILED";
  if (status === 403) return "NOT_ENTITLED";
  if (status === 408 || code === "ECONNABORTED" || message.includes("TIMEOUT")) return "PROVIDER_TIMEOUT";
  if (status === 429) return "RATE_LIMITED";
  if (status >= 500) return "PROVIDER_OFFLINE";
  if (status >= 400) return "PROVIDER_ERROR";
  if (code === "ENOTFOUND" || code === "ECONNREFUSED" || code === "ECONNRESET") return "PROVIDER_OFFLINE";
  return "RAW_DATA_UNAVAILABLE";
}

function normalizeQuote(quote, provider, providerStatus = getProviderStatus()) {
  const normalizedSymbol = String(quote.symbol || "SPY").toUpperCase();
  const sourceType = quote.sourceType ||
    (provider === "SIMULATION"
      ? "SIMULATED"
      : provider === "ALPACA" || provider === "WEBULL"
        ? "RAW_DELAYED"
        : "PROVIDER_UNAVAILABLE");
  const updatedAt = quote.updatedAt || quote.timestamp || null;
  const providerBacked = provider === "ALPACA" || provider === "WEBULL";
  const price = Number(quote.price);
  const changePercent = Number(quote.changePercent);
  const volume = Number(quote.volume);
  const timestampValid = !providerBacked || isValidTimestamp(updatedAt);
  const criticalFieldsValid = providerBacked
    ? isPositiveNumber(price) && timestampValid
    : true;
  const optionalFieldsValid = (!quote.changePercent && quote.changePercent !== 0 ? true : isFiniteNumber(changePercent)) &&
    (!quote.volume && quote.volume !== 0 ? true : isNonNegativeNumber(volume) || typeof quote.volume === "string");
  const requestedAvailable = quote.available !== undefined ? Boolean(quote.available) : sourceType !== "PROVIDER_UNAVAILABLE";
  const validationWarnings = [];
  const normalizedSourceType = requestedAvailable && providerBacked && !criticalFieldsValid
    ? "DATA_UNAVAILABLE"
    : requestedAvailable && providerBacked && !optionalFieldsValid
      ? "PARTIAL_DATA"
      : sourceType;
  const marketDataValidation = validateQuote(
    {
      symbol: normalizedSymbol,
      lastPrice: quote.lastPrice ?? quote.price,
      bidPrice: quote.bidPrice,
      bidSize: quote.bidSize,
      askPrice: quote.askPrice,
      askSize: quote.askSize,
      timestamp: updatedAt,
      provider,
      sourceType: normalizedSourceType,
      available: requestedAvailable,
      simulated: quote.simulated !== undefined ? Boolean(quote.simulated) : provider === "SIMULATION",
      generated: quote.generated !== undefined ? Boolean(quote.generated) : provider === "SIMULATION",
      sessionState: quote.sessionState
    },
    {
      expectedSymbol: normalizedSymbol,
      provider,
      sourceType: normalizedSourceType,
      currentTime: quote.receivedAt || quote.currentTime
    }
  );
  const marketDataStructurallyValid = !marketDataValidation.errors.length;
  const available = requestedAvailable && criticalFieldsValid && marketDataStructurallyValid;
  const finalSourceType = requestedAvailable && providerBacked && marketDataValidation.status === "STALE"
    ? "STALE"
    : normalizedSourceType;

  if (providerBacked && requestedAvailable && !isPositiveNumber(price)) {
    validationWarnings.push("Provider quote price is missing or invalid.");
  }

  if (providerBacked && requestedAvailable && !timestampValid) {
    validationWarnings.push("Provider quote timestamp is missing or invalid.");
  }

  if (providerBacked && requestedAvailable && !optionalFieldsValid) {
    validationWarnings.push("Provider quote contains partial optional fields.");
  }

  const marketAvailability = evaluateMarketAvailability({
    provider,
    sourceType: finalSourceType,
    available,
    timestamp: updatedAt,
    providerAvailable: provider === "ALPACA" || provider === "WEBULL",
    simulated: quote.simulated !== undefined ? Boolean(quote.simulated) : provider === "SIMULATION",
    generated: quote.generated !== undefined ? Boolean(quote.generated) : provider === "SIMULATION",
    environment: quote.environment || normalizeRuntimeEnvironment().runtimeEnvironment
  });

  return {
    symbol: normalizedSymbol,
    name: SYMBOL_NAMES[normalizedSymbol] || normalizedSymbol,
    price: available && Number.isFinite(price) ? price : null,
    changePercent: available && Number.isFinite(changePercent) ? changePercent : null,
    volume: available
      ? typeof quote.volume === "string" ? quote.volume : formatVolume(Number.isFinite(volume) ? volume : 0)
      : null,
    provider,
    providerStatus: providerStatus.providerHealth,
    updatedAt,
    timestamp: quote.timestamp || updatedAt,
    source: quote.source || provider,
    sourceType: finalSourceType,
    dataState: marketAvailability.dataState,
    dataAge: marketAvailability.dataAge,
    sessionState: marketAvailability.sessionState,
    marketOpen: marketAvailability.marketOpen,
    extendedHours: marketAvailability.extendedHours,
    sessionSource: marketAvailability.source,
    sessionVerified: marketAvailability.verified,
    nextOpen: marketAvailability.nextOpen,
    previousClose: marketAvailability.previousClose,
    available,
    simulated: quote.simulated !== undefined ? Boolean(quote.simulated) : provider === "SIMULATION",
    generated: quote.generated !== undefined ? Boolean(quote.generated) : provider === "SIMULATION",
    error: quote.error || null,
    environment: quote.environment || normalizeRuntimeEnvironment().runtimeEnvironment,
    marketDataValidation,
    qualityScore: marketDataValidation.qualityScore,
    qualityLabel: marketDataValidation.qualityLabel,
    validationStatus: marketDataValidation.status,
    validationErrors: marketDataValidation.errors,
    validationWarnings: marketDataValidation.warnings,
    warnings: [...validationWarnings, ...marketAvailability.warnings, ...marketDataValidation.warnings]
  };
}

function formatCandleTime(timestamp) {
  if (!timestamp) return "Unavailable";
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
  const timestamp = candle.timestamp || candle.t || null;
  const sourceType = candle.sourceType ||
    (provider === "SIMULATION"
      ? "SIMULATED"
      : provider === "ALPACA" || provider === "WEBULL"
        ? "RAW_DELAYED"
        : "PROVIDER_UNAVAILABLE");
  const providerBacked = provider === "ALPACA" || provider === "WEBULL";
  const open = Number(candle.open ?? candle.o);
  const high = Number(candle.high ?? candle.h);
  const low = Number(candle.low ?? candle.l);
  const close = Number(candle.close ?? candle.c);
  const volume = Number(candle.volume ?? candle.v);
  const timestampValid = !providerBacked || isValidTimestamp(timestamp);
  const ohlcValid = [open, high, low, close].every((value) => isPositiveNumber(value)) &&
    high >= Math.max(open, close) &&
    low <= Math.min(open, close);
  const volumeValid = isNonNegativeNumber(volume);
  const requestedAvailable = candle.available !== undefined ? Boolean(candle.available) : sourceType !== "PROVIDER_UNAVAILABLE";
  const validationWarnings = [];
  const marketDataValidation = validateCandle(
    {
      symbol: candle.symbol,
      open,
      high,
      low,
      close,
      volume,
      timestamp,
      timeframe: candle.timeframe,
      provider,
      sourceType,
      available: requestedAvailable,
      simulated: candle.simulated !== undefined ? Boolean(candle.simulated) : provider === "SIMULATION",
      generated: candle.generated !== undefined ? Boolean(candle.generated) : provider === "SIMULATION",
      sessionState: candle.sessionState
    },
    {
      expectedSymbol: candle.symbol,
      provider,
      sourceType,
      timeframe: candle.timeframe,
      currentTime: candle.receivedAt || candle.currentTime
    }
  );
  const marketDataStructurallyValid = !marketDataValidation.errors.length;
  const available = requestedAvailable &&
    (!providerBacked || (timestampValid && ohlcValid && volumeValid)) &&
    marketDataStructurallyValid;
  const finalSourceType = requestedAvailable && providerBacked && !available
    ? marketDataValidation.status === "STALE" ? "STALE" : "PARTIAL_DATA"
    : requestedAvailable && providerBacked && marketDataValidation.status === "STALE"
      ? "STALE"
    : sourceType;

  if (providerBacked && requestedAvailable && !timestampValid) {
    validationWarnings.push("Provider candle timestamp is missing or invalid.");
  }

  if (providerBacked && requestedAvailable && !ohlcValid) {
    validationWarnings.push("Provider candle OHLC values are missing, invalid, or inconsistent.");
  }

  if (providerBacked && requestedAvailable && !volumeValid) {
    validationWarnings.push("Provider candle volume is missing or invalid.");
  }

  const marketAvailability = evaluateMarketAvailability({
    provider,
    sourceType: finalSourceType,
    available,
    timestamp,
    providerAvailable: provider === "ALPACA" || provider === "WEBULL",
    simulated: candle.simulated !== undefined ? Boolean(candle.simulated) : provider === "SIMULATION",
    generated: candle.generated !== undefined ? Boolean(candle.generated) : provider === "SIMULATION",
    environment: candle.environment || normalizeRuntimeEnvironment().runtimeEnvironment
  });

  return {
    time: candle.time || formatCandleTime(timestamp),
    timestamp,
    open: available && Number.isFinite(open) ? open : null,
    high: available && Number.isFinite(high) ? high : null,
    low: available && Number.isFinite(low) ? low : null,
    close: available && Number.isFinite(close) ? close : null,
    volume: available && Number.isFinite(volume) ? volume : null,
    provider,
    source: candle.source || provider,
    sourceType: finalSourceType,
    dataState: marketAvailability.dataState,
    dataAge: marketAvailability.dataAge,
    sessionState: marketAvailability.sessionState,
    marketOpen: marketAvailability.marketOpen,
    extendedHours: marketAvailability.extendedHours,
    sessionSource: marketAvailability.source,
    sessionVerified: marketAvailability.verified,
    nextOpen: marketAvailability.nextOpen,
    previousClose: marketAvailability.previousClose,
    available,
    simulated: candle.simulated !== undefined ? Boolean(candle.simulated) : provider === "SIMULATION",
    generated: candle.generated !== undefined ? Boolean(candle.generated) : provider === "SIMULATION",
    environment: candle.environment || normalizeRuntimeEnvironment().runtimeEnvironment,
    marketDataValidation,
    qualityScore: marketDataValidation.qualityScore,
    qualityLabel: marketDataValidation.qualityLabel,
    validationStatus: marketDataValidation.status,
    validationErrors: marketDataValidation.errors,
    validationWarnings: marketDataValidation.warnings,
    warnings: [...validationWarnings, ...marketAvailability.warnings, ...marketDataValidation.warnings]
  };
}

function isWebullConfigured(env = process.env) {
  return getWebullConfigStatus(env).configured;
}

function isWebullEnabled(env = process.env, options = {}) {
  if (getAuthorizedSimulation(options, env).simulation === "no_provider") return false;
  return false;
}

function getAlpacaDataUrl(env = process.env) {
  return env.ALPACA_DATA_URL || env.ALPACA_BASE_URL;
}

function isAlpacaAvailable(env = process.env, options = {}) {
  const simulate = getAuthorizedSimulation(options, env).simulation;
  if (simulate === "alpaca_down" || simulate === "no_provider" || simulate === "provider_timeout") {
    return false;
  }
  return Boolean(env.ALPACA_API_KEY && env.ALPACA_SECRET_KEY && getAlpacaDataUrl(env));
}

function getActiveProvider(env = process.env, options = {}) {
  if (getAuthorizedSimulation(options, env).simulation) return "SIMULATION";
  if (isWebullEnabled(env, options)) return "WEBULL";
  if (isAlpacaAvailable(env, options)) return "ALPACA";
  return "PROVIDER_UNAVAILABLE";
}

function getMarketStatus() {
  const marketHours = resolveMarketSession();

  return marketHours.marketOpen ? "OPEN" : "CLOSED";
}

function getProviderCapabilities(provider = getActiveProvider(), options = {}) {
  const simulate = getAuthorizedSimulation(options, options.env || process.env).simulation;

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

  if (provider === "SIMULATION") {
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
    equities: false,
    options: false,
    futures: false,
    historicalCandles: false,
    quotes: false,
    news: false
  };
}

function getProviderHealth(provider = getActiveProvider(), options = {}) {
  const simulate = getAuthorizedSimulation(options, options.env || process.env).simulation;

  if (simulate === "no_provider") return "OFFLINE";
  if (provider === "SIMULATION" || simulate) return "DEGRADED";
  if (provider === "PROVIDER_UNAVAILABLE") return "OFFLINE";
  if (provider === "ALPACA") return options.rawDataVerified === true ? "HEALTHY" : "PARTIAL_CAPABILITY";
  if (provider === "WEBULL") return "NOT_IMPLEMENTED";
  return "HEALTHY";
}

function getProviderStatus(options = {}) {
  const env = options.env || process.env;
  const activeProvider = getActiveProvider(env, options);
  const providerHealth = getProviderHealth(activeProvider, options);
  const capabilities = getProviderCapabilities(activeProvider, options);
  const simulationContext = getAuthorizedSimulation(options, env);
  const runtime = normalizeRuntimeEnvironment(env);
  const warnings = [];
  const session = resolveMarketSession({ currentTime: options.currentTime });
  const marketAvailability = evaluateMarketAvailability({
    provider: activeProvider,
    sourceType: activeProvider === "SIMULATION"
      ? "SIMULATED"
      : activeProvider === "PROVIDER_UNAVAILABLE"
        ? "PROVIDER_UNAVAILABLE"
        : "RAW_DELAYED",
    available: providerHealth === "HEALTHY",
    providerAvailable: activeProvider === "ALPACA" || activeProvider === "WEBULL",
    simulated: activeProvider === "SIMULATION",
    generated: activeProvider === "SIMULATION",
    environment: runtime.runtimeEnvironment,
    currentTime: options.currentTime,
    session
  });

  if (activeProvider === "PROVIDER_UNAVAILABLE") {
    warnings.push("Primary live provider unavailable; raw market data is unavailable.");
  }

  if (simulationContext.simulationRejected) {
    warnings.push("Simulation was requested but is blocked in the current runtime environment.");
  }

  if (simulationContext.simulation) {
    warnings.push(`Provider simulation active: ${options.simulate}.`);
  }

  return {
    primaryProvider: isWebullEnabled(env, options) ? "WEBULL" : "WEBULL_PENDING",
    activeProvider,
    fallbackProvider: simulationContext.policy.simulationAllowed ? "SIMULATION_DEV_ONLY" : "NONE",
    marketStatus: session.marketOpen ? "OPEN" : "CLOSED",
    sessionState: session.sessionState,
    marketOpen: session.marketOpen,
    extendedHours: session.extendedHours,
    sessionSource: session.source,
    sessionVerified: session.verified,
    currentTime: session.currentTime,
    nextOpen: session.nextOpen,
    previousClose: session.previousClose,
    dataState: marketAvailability.dataState,
    dataAge: marketAvailability.dataAge,
    providerHealth,
    capabilities,
    trackedSymbols: TRACKED_SYMBOLS,
    lastUpdate: marketAvailability.available ? session.currentTime : null,
    failoverReady: false,
    sourceType: activeProvider === "SIMULATION"
      ? "SIMULATED"
      : activeProvider === "PROVIDER_UNAVAILABLE"
        ? "PROVIDER_UNAVAILABLE"
        : "RAW_DELAYED",
    simulated: activeProvider === "SIMULATION",
    generated: activeProvider === "SIMULATION",
    environment: runtime.runtimeEnvironment,
    runtimeEnvironment: runtime.runtimeEnvironment,
    simulationAllowed: simulationContext.policy.simulationAllowed,
    simulationActive: activeProvider === "SIMULATION",
    providerAvailable: activeProvider === "ALPACA" || activeProvider === "WEBULL",
    rawDataAvailable: providerHealth === "HEALTHY",
    warnings: [...warnings, ...marketAvailability.warnings]
  };
}

function simulatedQuote(symbol, providerHealth = "DEGRADED", env = process.env) {
  const normalizedSymbol = String(symbol || "SPY").toUpperCase();
  const quote = FALLBACK_QUOTES[normalizedSymbol] || FALLBACK_QUOTES.SPY;

  return normalizeQuote(
    {
      ...quote,
      symbol: normalizedSymbol,
      updatedAt: new Date().toISOString(),
      sourceType: "SIMULATED",
      available: true,
      simulated: true,
      generated: true,
      environment: normalizeRuntimeEnvironment(env).runtimeEnvironment
    },
    "SIMULATION",
    { providerHealth }
  );
}

function unavailableQuote(symbol, providerHealth = "OFFLINE", error = "RAW_DATA_UNAVAILABLE", env = process.env) {
  const normalizedSymbol = String(symbol || "SPY").toUpperCase();

  return normalizeQuote(
    {
      symbol: normalizedSymbol,
      price: null,
      changePercent: null,
      volume: null,
      updatedAt: null,
      timestamp: null,
      source: "PROVIDER_UNAVAILABLE",
      sourceType: "PROVIDER_UNAVAILABLE",
      available: false,
      simulated: false,
      generated: false,
      error,
      environment: normalizeRuntimeEnvironment(env).runtimeEnvironment
    },
    "PROVIDER_UNAVAILABLE",
    { providerHealth }
  );
}

function simulatedCandles(symbol, limit = 80, timeframe = "5Min", env = process.env) {
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
        symbol: normalizedSymbol,
        timestamp,
        timeframe: normalizedTimeframe.provider,
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume: Math.round((quote.volume || 1000000) / requestedLimit),
        sourceType: "SIMULATED",
        available: true,
        simulated: true,
        generated: true,
        environment: normalizeRuntimeEnvironment(env).runtimeEnvironment
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
  const price = trade.p ?? bar.c;
  const timestamp = trade.t || bar.t || null;

  if (!isPositiveNumber(price)) {
    const error = new Error("Alpaca quote payload missing valid price.");
    error.providerError = "INVALID_PROVIDER_RESPONSE";
    throw error;
  }

  if (!isValidTimestamp(timestamp)) {
    const error = new Error("Alpaca quote payload missing valid timestamp.");
    error.providerError = "INVALID_TIMESTAMP";
    throw error;
  }

  const open = isPositiveNumber(bar.o) ? Number(bar.o) : null;
  const changePercent = open
    ? ((price - open) / open) * 100
    : null;

  return normalizeQuote(
    {
      symbol: normalizedSymbol,
      price: Number(price),
      changePercent: changePercent === null ? null : Number(changePercent.toFixed(2)),
      volume: isNonNegativeNumber(bar.v) ? Number(bar.v) : null,
      updatedAt: timestamp,
      timestamp
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
  const { simulation: simulate, simulationRejected } = getAuthorizedSimulation(options, env);

  if (simulate === "quotes_down" || simulate === "provider_timeout" || simulate === "alpaca_down") {
    return simulatedQuote(symbol, "DEGRADED", env);
  }

  if (simulate === "no_provider") {
    return simulatedQuote(symbol, "OFFLINE", env);
  }

  if (simulationRejected) {
    return unavailableQuote(symbol, "OFFLINE", "SIMULATION_NOT_ALLOWED", env);
  }

  if (activeProvider === "ALPACA") {
    try {
      return await getAlpacaQuote(symbol, env);
    } catch (error) {
      return unavailableQuote(symbol, "OFFLINE", error.providerError || classifyProviderError(error), env);
    }
  }

  return unavailableQuote(symbol, "OFFLINE", "RAW_DATA_UNAVAILABLE", env);
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

  const normalizedCandles = bars.map((bar) => normalizeCandle({
      ...bar,
      symbol: normalizedSymbol,
      timeframe: normalizedTimeframe.provider
    }, "ALPACA"));
  const seriesValidation = validateCandles(normalizedCandles, {
    expectedSymbol: normalizedSymbol,
    provider: "ALPACA",
    sourceType: "RAW_DELAYED",
    timeframe: normalizedTimeframe.provider,
    minimumSamples: Math.min(2, requestedLimit)
  });

  const blockedSeriesStatuses = new Set([
    "BLOCKED",
    "UNAVAILABLE",
    "UNKNOWN_SOURCE",
    "INVALID_TIMESTAMP",
    "INVALID_NUMERIC_DATA",
    "INVALID_OHLC",
    "SYMBOL_MISMATCH",
    "OUT_OF_ORDER",
    "DUPLICATE"
  ]);

  if (blockedSeriesStatuses.has(seriesValidation.status)) {
    if (shouldLogProviderDiagnostics(env)) {
      console.warn("[marketProviderService] Alpaca candle series failed validation", {
        symbol: normalizedSymbol,
        timeframe: normalizedTimeframe.provider,
        status: seriesValidation.status,
        errors: seriesValidation.errors
      });
    }

    return [];
  }

  return normalizedCandles
    .filter((candle) => candle.available)
    .map((candle) => ({
      ...candle,
      seriesValidation,
      seriesValidationStatus: seriesValidation.status,
      seriesQualityScore: seriesValidation.qualityScore,
      seriesQualityLabel: seriesValidation.qualityLabel,
      validationWarnings: [
        ...new Set([
          ...(candle.validationWarnings || []),
          ...(seriesValidation.warnings || [])
        ])
      ]
    }));
}

async function getHistoricalCandles(symbol, timeframe = "5Min", limit = 80, options = {}) {
  const env = options.env || process.env;
  const activeProvider = getActiveProvider(env, options);
  const { simulation: simulate, simulationRejected } = getAuthorizedSimulation(options, env);

  if (simulate === "candles_down" || simulate === "provider_timeout" || simulate === "alpaca_down" || simulate === "no_provider") {
    return simulatedCandles(symbol, limit, timeframe, env);
  }

  if (simulationRejected) {
    return [];
  }

  if (activeProvider === "ALPACA") {
    try {
      const candles = await getAlpacaHistoricalCandles(symbol, timeframe, limit, env);

      return candles;
    } catch (error) {
      if (shouldLogProviderDiagnostics(env)) {
        console.warn("[marketProviderService] Alpaca candles unavailable", {
          symbol,
          timeframe,
          error: classifyProviderError(error)
        });
      }

      return [];
    }
  }

  return [];
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
  if (!quote?.available || quote.sourceType === "PROVIDER_UNAVAILABLE" || !Array.isArray(candles) || !candles.length) {
    return {
      symbol: quote?.symbol || "UNKNOWN",
      price: quote?.price ?? null,
      changePercent: quote?.changePercent ?? null,
      volume: quote?.volume ?? null,
      signal: "UNAVAILABLE",
      signalType: "DATA_UNAVAILABLE",
      confidence: 0,
      risk: "UNKNOWN",
      reason: "Raw provider data is unavailable; provider signal was not generated.",
      provider: quote?.provider || "PROVIDER_UNAVAILABLE",
      updatedAt: quote?.timestamp || quote?.updatedAt || null,
      available: false,
      dataState: quote?.dataState || "DATA_UNAVAILABLE",
      dataAge: quote?.dataAge ?? null,
      sessionState: quote?.sessionState || "UNKNOWN_SESSION",
      marketOpen: quote?.marketOpen === true,
      sourceType: quote?.sourceType || "PROVIDER_UNAVAILABLE",
      simulated: false,
      generated: false,
      error: quote?.error || "RAW_DATA_UNAVAILABLE"
    };
  }

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
    updatedAt: quote.timestamp || quote.updatedAt || latest?.timestamp || null,
    available: true,
    sourceType: quote.sourceType || "RAW_DELAYED",
    simulated: Boolean(quote.simulated),
    generated: false
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
  const { simulation: simulate, simulationRejected, policy } = getAuthorizedSimulation(options, env);
  const webullHealth = getWebullHealth(env);
  const alpacaConfigured = Boolean(env.ALPACA_API_KEY && env.ALPACA_SECRET_KEY && getAlpacaDataUrl(env));
  const alpacaEnabled = alpacaConfigured && simulate !== "no_provider";
  const alpacaPathAvailable = alpacaConfigured &&
    !["alpaca_down", "provider_timeout", "no_provider"].includes(simulate || "");
  const quotesHealthy = alpacaPathAvailable && simulate !== "quotes_down";
  const candlesHealthy = alpacaPathAvailable && simulate !== "candles_down";
  const providerStatus = getProviderStatus(options);
  const warnings = [...providerStatus.warnings];

  if (!alpacaPathAvailable) {
    warnings.push("Alpaca provider path is unavailable.");
  } else {
    warnings.push("Alpaca provider path is configured but health is not verified until a raw provider response succeeds.");
  }

  if (simulationRejected) {
    warnings.push("Simulation was requested but blocked by runtime policy.");
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
      status: alpacaPathAvailable ? "IMPLEMENTED_UNVERIFIED" : "CONFIGURATION_MISSING",
      quotes: quotesHealthy,
      candles: candlesHealthy
    },
    fallback: {
      enabled: policy.simulationAllowed,
      status: policy.simulationAllowed ? "AVAILABLE_DEV_ONLY" : "DISABLED"
    },
    activeProvider: providerStatus.activeProvider,
    providerHealth: providerStatus.providerHealth,
    failoverReady: false,
    sourceType: providerStatus.sourceType,
    simulated: providerStatus.simulated,
    generated: providerStatus.generated,
    environment: providerStatus.environment,
    runtimeEnvironment: providerStatus.runtimeEnvironment,
    simulationAllowed: providerStatus.simulationAllowed,
    simulationActive: providerStatus.simulationActive,
    providerAvailable: providerStatus.providerAvailable,
    rawDataAvailable: providerStatus.rawDataAvailable,
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
