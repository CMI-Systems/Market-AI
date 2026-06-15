import {
  getMarketCandles,
  getMarketProviderStatus,
  getMarketQuotes,
  getOfflineMarketProviderStatus,
} from "./marketProviderApi";

export const CHART_TIMEFRAMES = ["1Min", "5Min", "15Min", "1Hour", "1Day"];

const TIMEFRAME_ALIASES = {
  "1M": "1Min",
  "1MIN": "1Min",
  "5M": "5Min",
  "5MIN": "5Min",
  "15M": "15Min",
  "15MIN": "15Min",
  "1H": "1Hour",
  "1HR": "1Hour",
  "1HOUR": "1Hour",
  "1D": "1Day",
  "1DAY": "1Day",
  DAY: "1Day",
};

const BLOCKED_SOURCE_TYPES = new Set([
  "SIMULATED",
  "GENERATED",
  "UNKNOWN_SOURCE",
  "INVALID_TIMESTAMP",
  "PROVIDER_OFFLINE",
  "BACKEND_UNAVAILABLE",
  "DATA_UNAVAILABLE",
  "PROVIDER_UNAVAILABLE",
  "BLOCKED",
]);

const DISPLAY_STATUS_BY_SOURCE = {
  RAW_LIVE: "LIVE",
  RAW_DELAYED: "DELAYED",
  RAW_CACHED: "CACHED",
  STALE: "STALE",
  PARTIAL_DATA: "PARTIAL",
  MARKET_CLOSED: "MARKET CLOSED",
  PROVIDER_OFFLINE: "PROVIDER OFFLINE",
  BACKEND_UNAVAILABLE: "DATA UNAVAILABLE",
  DATA_UNAVAILABLE: "DATA UNAVAILABLE",
  PROVIDER_UNAVAILABLE: "DATA UNAVAILABLE",
};

function normalizeSymbol(symbol) {
  return String(symbol || "").trim().toUpperCase().replace(/[^A-Z0-9.-]/g, "");
}

export function normalizeChartTimeframe(timeframe = "5Min") {
  const normalized = String(timeframe || "5Min").replace(/\s+/g, "").toUpperCase();
  return TIMEFRAME_ALIASES[normalized] || (CHART_TIMEFRAMES.includes(timeframe) ? timeframe : null);
}

function isFinitePositive(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0;
}

function isNonNegative(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0;
}

function parseTimestamp(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

function secondsFromDate(date) {
  return Math.floor(date.getTime() / 1000);
}

function baseValidation(status = "DATA_UNAVAILABLE") {
  return {
    valid: false,
    usable: false,
    status,
    qualityScore: 0,
    qualityLabel: "BLOCKED",
    errors: [],
    warnings: [],
  };
}

function createUnavailableResult(symbol, timeframe, reason = "DATA_UNAVAILABLE", extra = {}) {
  const providerStatus = extra.providerStatus || getOfflineMarketProviderStatus();
  const sourceType = extra.sourceType || reason;

  return {
    symbol: normalizeSymbol(symbol),
    timeframe: normalizeChartTimeframe(timeframe) || timeframe,
    candles: [],
    quote: null,
    loading: false,
    error: extra.error || "",
    status: reason,
    displayStatus: getChartDataStatus({ status: reason, provenance: { sourceType } }),
    validation: {
      ...baseValidation(reason),
      errors: extra.errors || [reason],
      warnings: extra.warnings || [],
    },
    provenance: {
      provider: providerStatus.activeProvider || providerStatus.primaryProvider || "UNKNOWN",
      sourceType,
      available: false,
      simulated: false,
      generated: false,
      timestamp: null,
      dataAge: null,
      sessionState: providerStatus.sessionState || "UNKNOWN_SESSION",
      marketOpen: providerStatus.marketOpen === true,
      dataState: providerStatus.dataState || reason,
      environment: providerStatus.environment || providerStatus.runtimeEnvironment || "unknown",
    },
    providerStatus,
  };
}

function normalizeSourceType(record) {
  return record?.sourceType || record?.dataState || "UNKNOWN_SOURCE";
}

function validateSingleCandle(record, expectedSymbol, expectedTimeframe) {
  const errors = [];
  const warnings = [];
  const symbol = normalizeSymbol(record?.symbol || expectedSymbol);
  const provider = String(record?.provider || record?.source || "").toUpperCase();
  const sourceType = normalizeSourceType(record);
  const timestamp = record?.timestamp || record?.time;
  const timestampDate = parseTimestamp(timestamp);
  const now = Date.now();
  const open = Number(record?.open);
  const high = Number(record?.high);
  const low = Number(record?.low);
  const close = Number(record?.close);
  const volume = Number(record?.volume);

  if (!symbol || symbol !== expectedSymbol) errors.push("SYMBOL_MISMATCH");
  if (!provider || provider !== "ALPACA") errors.push("UNSUPPORTED_PROVIDER");
  if (record?.available === false) errors.push("UNAVAILABLE");
  if (record?.simulated === true) errors.push("SIMULATED");
  if (record?.generated === true) errors.push("GENERATED");
  if (BLOCKED_SOURCE_TYPES.has(sourceType)) errors.push(sourceType);
  if (!timestampDate) errors.push("INVALID_TIMESTAMP");
  if (timestampDate && timestampDate.getTime() > now + 60000) errors.push("FUTURE_TIMESTAMP");
  if (![open, high, low, close].every((value) => Number.isFinite(value) && value > 0)) {
    errors.push("INVALID_NUMERIC_DATA");
  }
  if (!isNonNegative(volume)) errors.push("INVALID_VOLUME");
  if (
    [open, high, low, close].every(Number.isFinite) &&
    (high < Math.max(open, close, low) || low > Math.min(open, close, high))
  ) {
    errors.push("INVALID_OHLC");
  }

  if (sourceType === "PARTIAL_DATA") warnings.push("PARTIAL_DATA");
  if (sourceType === "STALE") warnings.push("STALE");
  if (record?.timeframe && normalizeChartTimeframe(record.timeframe) !== expectedTimeframe) {
    warnings.push("TIMEFRAME_MISMATCH");
  }

  if (errors.length) {
    return { valid: false, errors, warnings };
  }

  return {
    valid: true,
    errors,
    warnings,
    candle: {
      time: secondsFromDate(timestampDate),
      open,
      high,
      low,
      close,
      volume,
      symbol,
      provider,
      sourceType,
      dataState: record?.dataState || sourceType,
      validationStatus: record?.validationStatus || record?.marketDataValidation?.status || "VALID",
      qualityLabel: record?.qualityLabel || record?.marketDataValidation?.qualityLabel || "ACCEPTABLE",
      timestamp: timestampDate.toISOString(),
      timeframe: expectedTimeframe,
      dataAge: record?.dataAge ?? null,
      sessionState: record?.sessionState || "UNKNOWN_SESSION",
      marketOpen: record?.marketOpen === true,
      available: true,
      simulated: false,
      generated: false,
    },
  };
}

export function normalizeChartCandles(records, options = {}) {
  const expectedSymbol = normalizeSymbol(options.symbol);
  const expectedTimeframe = normalizeChartTimeframe(options.timeframe || "5Min") || "5Min";
  const validation = baseValidation("VALID");
  const warnings = [];
  const errors = [];

  if (!expectedSymbol) {
    return {
      candles: [],
      validation: {
        ...validation,
        status: "SYMBOL_MISMATCH",
        errors: ["SYMBOL_REQUIRED"],
      },
    };
  }

  if (!Array.isArray(records) || !records.length) {
    return {
      candles: [],
      validation: {
        ...validation,
        status: "DATA_UNAVAILABLE",
        errors: ["EMPTY_CANDLE_SERIES"],
      },
    };
  }

  const normalized = [];
  const timestamps = new Set();
  let previousTime = null;
  let provider = null;

  records.forEach((record) => {
    const result = validateSingleCandle(record, expectedSymbol, expectedTimeframe);

    warnings.push(...result.warnings);

    if (!result.valid) {
      errors.push(...result.errors);
      return;
    }

    if (timestamps.has(result.candle.time)) {
      errors.push("DUPLICATE");
      return;
    }

    if (previousTime !== null && result.candle.time <= previousTime) {
      errors.push("OUT_OF_ORDER");
      return;
    }

    if (provider && provider !== result.candle.provider) {
      errors.push("MIXED_PROVIDERS");
      return;
    }

    timestamps.add(result.candle.time);
    previousTime = result.candle.time;
    provider = result.candle.provider;
    normalized.push(result.candle);
  });

  const uniqueErrors = [...new Set(errors)];
  const uniqueWarnings = [...new Set(warnings)];

  if (uniqueErrors.length) {
    return {
      candles: [],
      validation: {
        ...validation,
        status: uniqueErrors.includes("INVALID_OHLC")
          ? "INVALID_OHLC"
          : uniqueErrors.includes("INVALID_TIMESTAMP") || uniqueErrors.includes("FUTURE_TIMESTAMP")
            ? "INVALID_TIMESTAMP"
            : uniqueErrors.includes("DUPLICATE")
              ? "DUPLICATE"
              : uniqueErrors.includes("OUT_OF_ORDER")
                ? "OUT_OF_ORDER"
                : uniqueErrors.includes("SYMBOL_MISMATCH")
                  ? "SYMBOL_MISMATCH"
                  : "BLOCKED",
        errors: uniqueErrors,
        warnings: uniqueWarnings,
      },
    };
  }

  if (!normalized.length) {
    return {
      candles: [],
      validation: {
        ...validation,
        status: "DATA_UNAVAILABLE",
        errors: ["NO_USABLE_CANDLES"],
        warnings: uniqueWarnings,
      },
    };
  }

  const sourceTypes = new Set(normalized.map((candle) => candle.sourceType));
  const latest = normalized[normalized.length - 1];
  const status = sourceTypes.has("STALE")
    ? "STALE"
    : sourceTypes.has("PARTIAL_DATA")
      ? "PARTIAL_DATA"
      : "VALID";
  const qualityScore = status === "VALID" ? 92 : status === "PARTIAL_DATA" ? 74 : 58;

  return {
    candles: normalized,
    validation: {
      valid: status !== "STALE",
      usable: true,
      status,
      qualityScore,
      qualityLabel: qualityScore >= 90 ? "HIGH" : qualityScore >= 75 ? "ACCEPTABLE" : "DEGRADED",
      errors: [],
      warnings: uniqueWarnings,
    },
    provenance: {
      provider: latest.provider,
      sourceType: latest.sourceType,
      available: true,
      simulated: false,
      generated: false,
      timestamp: latest.timestamp,
      dataAge: latest.dataAge,
      sessionState: latest.sessionState,
      marketOpen: latest.marketOpen,
      dataState: latest.dataState,
    },
  };
}

function normalizeQuote(quote, expectedSymbol) {
  if (!quote || quote.available === false) return null;
  const symbol = normalizeSymbol(quote.symbol);
  const provider = String(quote.provider || quote.source || "").toUpperCase();
  const sourceType = normalizeSourceType(quote);
  const timestamp = quote.timestamp || quote.updatedAt;
  const timestampDate = parseTimestamp(timestamp);
  const price = Number(quote.price ?? quote.lastPrice);

  if (symbol !== expectedSymbol) return null;
  if (provider !== "ALPACA") return null;
  if (quote.simulated === true || quote.generated === true) return null;
  if (BLOCKED_SOURCE_TYPES.has(sourceType)) return null;
  if (!isFinitePositive(price)) return null;

  return {
    ...quote,
    symbol,
    provider,
    sourceType,
    price,
    timestamp: timestampDate ? timestampDate.toISOString() : timestamp || null,
  };
}

export function getChartDataStatus(result) {
  const sourceType = result?.provenance?.sourceType || result?.status || "DATA_UNAVAILABLE";
  if (result?.loading) return "LOADING";
  if (result?.error) return "DATA UNAVAILABLE";
  return DISPLAY_STATUS_BY_SOURCE[sourceType] || DISPLAY_STATUS_BY_SOURCE[result?.status] || "DATA UNAVAILABLE";
}

export async function getValidatedChartData(symbol, timeframe = "5Min", options = {}) {
  const normalizedSymbol = normalizeSymbol(symbol);
  const normalizedTimeframe = normalizeChartTimeframe(timeframe);
  const limit = Math.max(1, Math.min(Number(options.limit) || 80, 500));

  if (!normalizedSymbol) {
    return createUnavailableResult(symbol, timeframe, "SYMBOL_MISMATCH", {
      errors: ["SYMBOL_REQUIRED"],
    });
  }

  if (!normalizedTimeframe) {
    return createUnavailableResult(normalizedSymbol, timeframe, "INVALID_TIMEFRAME", {
      errors: ["UNSUPPORTED_TIMEFRAME"],
    });
  }

  try {
    const [providerStatus, quotes, rawCandles] = await Promise.all([
      getMarketProviderStatus(),
      getMarketQuotes([normalizedSymbol]),
      getMarketCandles(normalizedSymbol, normalizedTimeframe, limit),
    ]);
    const status = providerStatus || getOfflineMarketProviderStatus();
    const normalized = normalizeChartCandles(rawCandles, {
      symbol: normalizedSymbol,
      timeframe: normalizedTimeframe,
    });
    const quote = normalizeQuote(quotes?.[0], normalizedSymbol);

    if (!normalized.candles.length) {
      return createUnavailableResult(normalizedSymbol, normalizedTimeframe, normalized.validation.status, {
        providerStatus: status,
        sourceType: status.dataState || "DATA_UNAVAILABLE",
        errors: normalized.validation.errors,
        warnings: normalized.validation.warnings,
      });
    }

    const provenance = {
      ...normalized.provenance,
      provider: normalized.provenance?.provider || status.activeProvider || "UNKNOWN",
      sessionState: normalized.provenance?.sessionState || status.sessionState || "UNKNOWN_SESSION",
      marketOpen: normalized.provenance?.marketOpen ?? status.marketOpen === true,
      environment: status.environment || status.runtimeEnvironment || "unknown",
    };
    const result = {
      symbol: normalizedSymbol,
      timeframe: normalizedTimeframe,
      candles: normalized.candles,
      quote,
      loading: false,
      error: "",
      status: normalized.validation.status,
      validation: normalized.validation,
      provenance,
      providerStatus: status,
    };

    return {
      ...result,
      displayStatus: getChartDataStatus(result),
    };
  } catch (error) {
    return createUnavailableResult(normalizedSymbol, normalizedTimeframe, "BACKEND_UNAVAILABLE", {
      error: error?.message || "BACKEND_UNAVAILABLE",
    });
  }
}
