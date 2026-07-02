const FRESHNESS_STATES = new Set([
  "fresh",
  "delayed",
  "stale",
  "unavailable",
  "unknown"
]);

const PROVIDER_TYPES = new Set([
  "market_data",
  "news",
  "brokerage",
  "research",
  "internal_system",
  "unknown"
]);

const PROVIDER_STATUS = new Set([
  "ok",
  "degraded",
  "stale",
  "unavailable",
  "unknown"
]);

const PROVIDER_HEALTH_STATES = new Set([
  "healthy",
  "degraded",
  "failing",
  "not_ready",
  "unknown"
]);

const PROVIDER_DEGRADED_REASONS = new Set([
  "rate_limited",
  "provider_outage",
  "internal_validation_failed",
  "stale_data",
  "missing_source",
  "not_ready",
  "unknown",
  null
]);

const PROVIDER_WARNINGS = new Set([
  "data_delayed",
  "data_stale",
  "source_missing",
  "confidence_low",
  "provider_unavailable",
  "not_ready",
  "validation_failed"
]);

const DIGEST_TYPES = new Set([
  "intraday",
  "daily",
  "event_driven",
  "regime",
  "watchlist",
  "not_ready"
]);

const DOMINANT_REGIMES = new Set([
  "risk_on",
  "risk_off",
  "mixed",
  "transition",
  "unknown",
  null
]);

const SENTIMENT_STATES = new Set([
  "bullish",
  "bearish",
  "neutral",
  "mixed",
  "unknown",
  null
]);

const SENSITIVE_KEY_PATTERN = /(api[_-]?key|secret|token|password|credential|authorization|service[_-]?role|database[_-]?url|raw|stack|trace|reasoning|training|autonomous)/i;

function isIsoTimestamp(value) {
  if (typeof value !== "string" || !value) return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp);
}

function sanitizeText(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  return String(value)
    .replace(/(api[_-]?key|secret|token|password|credential|authorization)=?[^\s,}]*/gi, "$1=[redacted]")
    .slice(0, 1200);
}

function sanitizeArray(values, maxItems = 20, maxLength = 180) {
  if (!Array.isArray(values)) return [];
  return values
    .map((value) => sanitizeText(value).slice(0, maxLength))
    .filter(Boolean)
    .slice(0, maxItems);
}

function clampConfidence(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(1, number));
}

function classifyFreshness(timestampValue, now = Date.now(), thresholds = {}) {
  if (!timestampValue || !isIsoTimestamp(timestampValue)) return "unknown";

  const ageMs = Math.max(0, now - Date.parse(timestampValue));
  const freshMs = thresholds.freshMs || 5 * 60 * 1000;
  const delayedMs = thresholds.delayedMs || 30 * 60 * 1000;

  if (ageMs <= freshMs) return "fresh";
  if (ageMs <= delayedMs) return "delayed";
  return "stale";
}

function failClosedResponse({
  status = "not_ready",
  freshnessState = "unavailable",
  reason = "approved_source_missing",
  message = "The requested read model is not available.",
  warnings = ["not_ready"]
} = {}) {
  return {
    ok: false,
    status,
    freshnessState,
    reason,
    message: sanitizeText(message),
    data: null,
    warnings: sanitizeArray(warnings, 20, 80),
    generatedAt: new Date().toISOString()
  };
}

function assertNoSensitiveKeys(value, path = "payload", findings = []) {
  if (!value || typeof value !== "object") return findings;

  for (const [key, item] of Object.entries(value)) {
    const nextPath = `${path}.${key}`;
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      findings.push(nextPath);
    }
    if (item && typeof item === "object") {
      assertNoSensitiveKeys(item, nextPath, findings);
    }
  }

  return findings;
}

function validateProviderHealthDto(dto) {
  const errors = [];

  if (!dto || typeof dto !== "object") errors.push("dto_required");
  else {
    ["providerId", "providerName", "providerType", "status", "healthState", "freshnessState", "confidence", "warnings", "generatedAt"].forEach((field) => {
      if (dto[field] === undefined) errors.push(`missing_${field}`);
    });
    if (!PROVIDER_TYPES.has(dto.providerType)) errors.push("invalid_providerType");
    if (!PROVIDER_STATUS.has(dto.status)) errors.push("invalid_status");
    if (!PROVIDER_HEALTH_STATES.has(dto.healthState)) errors.push("invalid_healthState");
    if (!FRESHNESS_STATES.has(dto.freshnessState)) errors.push("invalid_freshnessState");
    if (!PROVIDER_DEGRADED_REASONS.has(dto.degradedReason ?? null)) errors.push("invalid_degradedReason");
    if (!Number.isFinite(dto.confidence) || dto.confidence < 0 || dto.confidence > 1) errors.push("invalid_confidence");
    if (!Array.isArray(dto.warnings)) errors.push("invalid_warnings");
    else {
      dto.warnings.forEach((warning) => {
        if (!PROVIDER_WARNINGS.has(warning)) errors.push(`invalid_warning_${warning}`);
      });
    }
    if (!isIsoTimestamp(dto.generatedAt)) errors.push("invalid_generatedAt");
    if (dto.lastCheckedAt !== null && dto.lastCheckedAt !== undefined && !isIsoTimestamp(dto.lastCheckedAt)) errors.push("invalid_lastCheckedAt");
    if (dto.lastSuccessfulEventAt !== null && dto.lastSuccessfulEventAt !== undefined && !isIsoTimestamp(dto.lastSuccessfulEventAt)) errors.push("invalid_lastSuccessfulEventAt");
    if (assertNoSensitiveKeys(dto).length) errors.push("sensitive_key_detected");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function validateMarketContextDigestDto(dto) {
  const errors = [];

  if (!dto || typeof dto !== "object") errors.push("dto_required");
  else {
    ["digestId", "digestType", "summary", "sourceCount", "confidence", "freshnessState", "generatedAt"].forEach((field) => {
      if (dto[field] === undefined) errors.push(`missing_${field}`);
    });
    if (!dto.symbol && !dto.marketScope) errors.push("missing_scope");
    if (!DIGEST_TYPES.has(dto.digestType)) errors.push("invalid_digestType");
    if (!DOMINANT_REGIMES.has(dto.dominantRegime ?? null)) errors.push("invalid_dominantRegime");
    if (!SENTIMENT_STATES.has(dto.sentimentState ?? null)) errors.push("invalid_sentimentState");
    if (!FRESHNESS_STATES.has(dto.freshnessState)) errors.push("invalid_freshnessState");
    if (!Number.isFinite(dto.sourceCount) || dto.sourceCount < 0) errors.push("invalid_sourceCount");
    if (!Number.isFinite(dto.confidence) || dto.confidence < 0 || dto.confidence > 1) errors.push("invalid_confidence");
    if (!isIsoTimestamp(dto.generatedAt)) errors.push("invalid_generatedAt");
    if (dto.windowStart !== null && dto.windowStart !== undefined && !isIsoTimestamp(dto.windowStart)) errors.push("invalid_windowStart");
    if (dto.windowEnd !== null && dto.windowEnd !== undefined && !isIsoTimestamp(dto.windowEnd)) errors.push("invalid_windowEnd");
    if (Array.isArray(dto.keyDrivers) && dto.keyDrivers.length > 12) errors.push("too_many_keyDrivers");
    if (Array.isArray(dto.risks) && dto.risks.length > 12) errors.push("too_many_risks");
    if (assertNoSensitiveKeys(dto).length) errors.push("sensitive_key_detected");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  classifyFreshness,
  clampConfidence,
  failClosedResponse,
  sanitizeArray,
  sanitizeText,
  validateMarketContextDigestDto,
  validateProviderHealthDto
};
