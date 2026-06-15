const VALID_SOURCE_TYPES = new Set([
  "RAW_LIVE",
  "RAW_DELAYED",
  "RAW_CACHED",
  "PARTIAL_DATA",
  "STALE",
  "MARKET_CLOSED",
  "PROVIDER_OFFLINE",
  "BACKEND_UNAVAILABLE",
  "DATA_UNAVAILABLE",
  "UNKNOWN_SOURCE",
  "INVALID_TIMESTAMP",
  "SIMULATED",
  "GENERATED",
  "UNKNOWN",
  "PROVIDER_UNAVAILABLE"
]);

const DEFAULT_THRESHOLDS_MS = {
  quote: 15 * 60 * 1000,
  trade: 15 * 60 * 1000,
  stream: 60 * 1000,
  "1Min": 5 * 60 * 1000,
  "5Min": 20 * 60 * 1000,
  "15Min": 45 * 60 * 1000,
  "1Hour": 3 * 60 * 60 * 1000,
  "1Day": 3 * 24 * 60 * 60 * 1000
};

function normalizeSymbol(value) {
  return String(value || "").trim().toUpperCase();
}

function normalizeSourceType(value) {
  const normalized = String(value || "UNKNOWN").trim().toUpperCase();
  return VALID_SOURCE_TYPES.has(normalized) ? normalized : "UNKNOWN_SOURCE";
}

function finiteNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function validTimestamp(value) {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? new Date(time).toISOString() : null;
}

function dataAge(timestamp, currentTime) {
  const providerTime = new Date(timestamp).getTime();
  const current = new Date(currentTime || Date.now()).getTime();

  if (!Number.isFinite(providerTime) || !Number.isFinite(current)) return null;
  return current - providerTime;
}

function qualityLabel(score) {
  if (score >= 90) return "HIGH";
  if (score >= 75) return "ACCEPTABLE";
  if (score >= 50) return "DEGRADED";
  if (score > 0) return "UNSUITABLE";
  return "BLOCKED";
}

function statusFromCritical(errors, fallback = "VALID") {
  const priority = [
    "BLOCKED",
    "UNAVAILABLE",
    "SYMBOL_MISSING",
    "PROVIDER_MISSING",
    "UNKNOWN_SOURCE",
    "INVALID_TIMESTAMP",
    "INVALID_NUMERIC_DATA",
    "INVALID_OHLC",
    "SYMBOL_MISMATCH",
    "DUPLICATE",
    "OUT_OF_ORDER"
  ];

  return priority.find((status) => errors.includes(status)) || fallback;
}

function buildResult({ status, errors = [], warnings = [], normalized = {}, provenance = {}, score = 100 }) {
  const critical = [
    "BLOCKED",
    "UNAVAILABLE",
    "SYMBOL_MISSING",
    "PROVIDER_MISSING",
    "UNKNOWN_SOURCE",
    "INVALID_TIMESTAMP",
    "INVALID_NUMERIC_DATA",
    "INVALID_OHLC",
    "SYMBOL_MISMATCH",
    "DUPLICATE",
    "OUT_OF_ORDER"
  ].includes(status);
  const qualityScore = critical ? Math.min(score, 49) : Math.max(0, Math.min(100, Math.round(score)));

  return {
    valid: !critical && qualityScore >= 50,
    usable: !critical && status !== "STALE" && qualityScore >= 50,
    status,
    qualityScore,
    qualityLabel: qualityLabel(qualityScore),
    errors: [...new Set(errors)],
    warnings: [...new Set(warnings)],
    normalized,
    provenance
  };
}

function validateCommon(record = {}, options = {}) {
  const errors = [];
  const warnings = [];
  const expectedSymbol = normalizeSymbol(options.expectedSymbol);
  const symbol = normalizeSymbol(record.symbol || expectedSymbol);
  const provider = String(record.provider || options.provider || "").trim().toUpperCase();
  const sourceType = normalizeSourceType(record.sourceType || options.sourceType);
  const timestamp = validTimestamp(record.timestamp || record.updatedAt || record.t);
  const currentTime = options.currentTime || new Date().toISOString();
  const age = timestamp ? dataAge(timestamp, currentTime) : null;
  const available = record.available !== false;
  const simulated = record.simulated === true;
  const generated = record.generated === true;

  if (!symbol) errors.push("SYMBOL_MISSING");
  if (expectedSymbol && symbol && symbol !== expectedSymbol) errors.push("SYMBOL_MISMATCH");
  if (!provider) errors.push("PROVIDER_MISSING");
  if (sourceType === "UNKNOWN_SOURCE") errors.push("UNKNOWN_SOURCE");
  if (!available || ["PROVIDER_UNAVAILABLE", "DATA_UNAVAILABLE", "PROVIDER_OFFLINE", "BACKEND_UNAVAILABLE"].includes(sourceType)) {
    errors.push("UNAVAILABLE");
  }
  if (simulated || generated || sourceType === "SIMULATED" || sourceType === "GENERATED") errors.push("BLOCKED");
  if (!timestamp) errors.push("INVALID_TIMESTAMP");
  if (age !== null && age < -60 * 1000) errors.push("INVALID_TIMESTAMP");

  return {
    errors,
    warnings,
    normalized: {
      symbol,
      provider,
      sourceType,
      timestamp,
      dataAge: age,
      available,
      simulated,
      generated
    },
    provenance: {
      provider,
      sourceType,
      timestamp,
      dataAge: age,
      available,
      simulated,
      generated,
      sessionState: record.sessionState || options.sessionState || "UNKNOWN_SESSION"
    }
  };
}

function applyFreshness(common, thresholdMs) {
  if (common.normalized.dataAge !== null && common.normalized.dataAge > thresholdMs) {
    common.warnings.push("STALE");
  }
}

function validateQuote(record = {}, options = {}) {
  const common = validateCommon(record, options);
  const bidPrice = finiteNumber(record.bidPrice ?? record.bp);
  const askPrice = finiteNumber(record.askPrice ?? record.ap);
  const bidSize = finiteNumber(record.bidSize ?? record.bs);
  const askSize = finiteNumber(record.askSize ?? record.as);
  const lastPrice = finiteNumber(record.lastPrice ?? record.price ?? record.p);
  let score = 100;

  if (lastPrice === null || lastPrice <= 0) common.errors.push("INVALID_NUMERIC_DATA");
  if (bidPrice !== null && bidPrice < 0) common.errors.push("INVALID_NUMERIC_DATA");
  if (askPrice !== null && askPrice < 0) common.errors.push("INVALID_NUMERIC_DATA");
  if (bidSize !== null && bidSize < 0) common.errors.push("INVALID_NUMERIC_DATA");
  if (askSize !== null && askSize < 0) common.errors.push("INVALID_NUMERIC_DATA");
  if (bidPrice !== null && askPrice !== null && askPrice < bidPrice) {
    common.warnings.push("Crossed quote detected; ask is below bid.");
    score -= 20;
  }
  if (bidPrice === null || askPrice === null || bidSize === null || askSize === null) {
    common.warnings.push("Quote is missing optional bid/ask fields.");
    score -= 15;
  }

  applyFreshness(common, options.staleThresholdMs || DEFAULT_THRESHOLDS_MS.quote);

  if (common.warnings.includes("STALE")) score -= 30;
  const status = statusFromCritical(common.errors, common.warnings.includes("STALE") ? "STALE" : common.warnings.length ? "PARTIAL_DATA" : "VALID");

  return buildResult({
    status,
    errors: common.errors,
    warnings: common.warnings,
    normalized: {
      ...common.normalized,
      bidPrice,
      bidSize,
      askPrice,
      askSize,
      lastPrice
    },
    provenance: common.provenance,
    score
  });
}

function validateTrade(record = {}, options = {}) {
  const common = validateCommon(record, options);
  const price = finiteNumber(record.price ?? record.p);
  const size = finiteNumber(record.size ?? record.s ?? record.volume);
  let score = 100;

  if (price === null || price <= 0) common.errors.push("INVALID_NUMERIC_DATA");
  if (size === null || size < 0) common.errors.push("INVALID_NUMERIC_DATA");
  applyFreshness(common, options.staleThresholdMs || DEFAULT_THRESHOLDS_MS.trade);

  if (common.warnings.includes("STALE")) score -= 30;
  const status = statusFromCritical(common.errors, common.warnings.includes("STALE") ? "STALE" : "VALID");

  return buildResult({
    status,
    errors: common.errors,
    warnings: common.warnings,
    normalized: {
      ...common.normalized,
      price,
      size
    },
    provenance: common.provenance,
    score
  });
}

function validateCandle(record = {}, options = {}) {
  const common = validateCommon(record, options);
  const open = finiteNumber(record.open ?? record.o);
  const high = finiteNumber(record.high ?? record.h);
  const low = finiteNumber(record.low ?? record.l);
  const close = finiteNumber(record.close ?? record.c);
  const volume = finiteNumber(record.volume ?? record.v);
  const timeframe = String(record.timeframe || options.timeframe || "").trim();
  let score = 100;

  if (!timeframe && options.requireTimeframe !== false) {
    common.warnings.push("Candle timeframe is missing.");
    score -= 10;
  }

  if ([open, high, low, close].some((value) => value === null || value <= 0)) {
    common.errors.push("INVALID_NUMERIC_DATA");
  }

  if (volume === null || volume < 0) common.errors.push("INVALID_NUMERIC_DATA");

  if (
    [open, high, low, close].every((value) => value !== null) &&
    !(high >= open && high >= close && high >= low && low <= open && low <= close && low <= high)
  ) {
    common.errors.push("INVALID_OHLC");
  }

  applyFreshness(common, options.staleThresholdMs || DEFAULT_THRESHOLDS_MS[timeframe] || DEFAULT_THRESHOLDS_MS["5Min"]);

  if (common.warnings.includes("STALE")) score -= 25;
  const status = statusFromCritical(common.errors, common.warnings.includes("STALE") ? "STALE" : common.warnings.length ? "PARTIAL_DATA" : "VALID");

  return buildResult({
    status,
    errors: common.errors,
    warnings: common.warnings,
    normalized: {
      ...common.normalized,
      open,
      high,
      low,
      close,
      volume,
      timeframe
    },
    provenance: common.provenance,
    score
  });
}

function validateCandles(records = [], options = {}) {
  if (!Array.isArray(records) || records.length === 0) {
    return buildResult({
      status: "UNAVAILABLE",
      errors: ["UNAVAILABLE"],
      warnings: ["Candle series is empty."],
      normalized: { candles: [] },
      provenance: { provider: options.provider || null },
      score: 0
    });
  }

  const results = records.map((record) => validateCandle(record, options));
  const usable = results.filter((result) => result.usable || result.status === "STALE");
  const errors = [];
  const warnings = results.flatMap((result) => result.warnings);
  const excludedErrors = results
    .filter((result) => !result.usable)
    .flatMap((result) => result.errors);
  const timestamps = usable.map((result) => result.normalized.timestamp).filter(Boolean);
  const symbols = new Set(usable.map((result) => result.normalized.symbol).filter(Boolean));
  const providers = new Set(usable.map((result) => result.normalized.provider).filter(Boolean));
  const timeframes = new Set(usable.map((result) => result.normalized.timeframe).filter(Boolean));
  const duplicateCount = timestamps.length - new Set(timestamps).size;
  const ordered = timestamps.every((timestamp, index) => index === 0 || new Date(timestamp).getTime() > new Date(timestamps[index - 1]).getTime());
  let score = results.length ? Math.round(results.reduce((total, result) => total + result.qualityScore, 0) / results.length) : 0;

  if (usable.length < records.length) {
    warnings.push(`Candle series excluded ${records.length - usable.length} invalid or unusable record(s).`);
    if (excludedErrors.length) warnings.push(`Excluded record issues: ${[...new Set(excludedErrors)].join(", ")}.`);
    score -= 20;
  }

  if (excludedErrors.includes("SYMBOL_MISMATCH")) {
    errors.push("SYMBOL_MISMATCH");
    score -= 30;
  }

  if (!usable.length) {
    errors.push("UNAVAILABLE");
    score = 0;
  }

  if (duplicateCount > 0) {
    errors.push("DUPLICATE");
    score -= 30;
  }

  if (!ordered) {
    errors.push("OUT_OF_ORDER");
    score -= 30;
  }

  if (symbols.size > 1) {
    errors.push("SYMBOL_MISMATCH");
    score -= 30;
  }

  if (providers.size > 1) {
    warnings.push("Candle series contains mixed providers.");
    score -= 20;
  }

  if (timeframes.size > 1) {
    warnings.push("Candle series contains mixed timeframes.");
    score -= 20;
  }

  if (usable.length < (options.minimumSamples || 2)) {
    warnings.push("Candle series has fewer samples than required for reliable analysis.");
    score -= 20;
  }

  const status = statusFromCritical(errors, warnings.includes("STALE") ? "STALE" : warnings.length ? "PARTIAL_DATA" : "VALID");

  return buildResult({
    status,
    errors,
    warnings,
    normalized: {
      candles: usable.map((result) => result.normalized),
      totalRecords: records.length,
      usableRecords: usable.length
    },
    provenance: {
      provider: providers.size === 1 ? [...providers][0] : options.provider || null,
      sourceType: options.sourceType || null,
      sessionState: options.sessionState || "UNKNOWN_SESSION"
    },
    score
  });
}

function validateMarketClock(record = {}, options = {}) {
  const timestamp = validTimestamp(record.timestamp || record.currentTime || options.currentTime);
  const errors = [];
  const warnings = [];

  if (!timestamp) errors.push("INVALID_TIMESTAMP");
  if (!record.sessionState && record.marketOpen === undefined) warnings.push("Market clock/session state is incomplete.");

  return buildResult({
    status: statusFromCritical(errors, warnings.length ? "PARTIAL_DATA" : "VALID"),
    errors,
    warnings,
    normalized: {
      timestamp,
      sessionState: record.sessionState || "UNKNOWN_SESSION",
      marketOpen: record.marketOpen === true
    },
    provenance: {
      provider: record.provider || options.provider || null,
      sourceType: normalizeSourceType(record.sourceType || options.sourceType || "UNKNOWN")
    },
    score: warnings.length ? 80 : 100
  });
}

function validateStreamEvent(record = {}, options = {}) {
  const tradeLike = record.trade || record.eventType === "trade";
  return tradeLike
    ? validateTrade({ ...record, ...(record.trade || {}) }, options)
    : validateQuote(record, options);
}

function getMarketDataQualitySummary(results = []) {
  const safeResults = Array.isArray(results) ? results : [];
  const score = safeResults.length
    ? Math.round(safeResults.reduce((total, result) => total + (Number(result?.qualityScore) || 0), 0) / safeResults.length)
    : 0;
  const blocked = safeResults.filter((result) => result?.usable === false).length;

  return {
    valid: safeResults.length > 0 && blocked === 0,
    usable: safeResults.length > 0 && blocked === 0,
    status: safeResults.length === 0 ? "UNAVAILABLE" : blocked > 0 ? "DEGRADED" : "VALID",
    qualityScore: score,
    qualityLabel: qualityLabel(score),
    errors: [...new Set(safeResults.flatMap((result) => result?.errors || []))],
    warnings: [...new Set(safeResults.flatMap((result) => result?.warnings || []))]
  };
}

module.exports = {
  validateQuote,
  validateTrade,
  validateCandle,
  validateCandles,
  validateMarketClock,
  validateStreamEvent,
  getMarketDataQualitySummary
};
