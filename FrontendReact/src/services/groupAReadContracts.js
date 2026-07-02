const FRESHNESS_STATES = new Set([
  "fresh",
  "delayed",
  "stale",
  "unavailable",
  "unknown",
]);

const PROVIDER_TYPES = new Set([
  "market_data",
  "news",
  "brokerage",
  "research",
  "internal_system",
  "unknown",
]);

const PROVIDER_STATUSES = new Set([
  "ok",
  "degraded",
  "stale",
  "unavailable",
  "unknown",
]);

const PROVIDER_HEALTH_STATES = new Set([
  "healthy",
  "degraded",
  "failing",
  "not_ready",
  "unknown",
]);

const DIGEST_TYPES = new Set([
  "intraday",
  "daily",
  "event_driven",
  "regime",
  "watchlist",
  "not_ready",
]);

const FORBIDDEN_FIELD_PATTERN =
  /(api[_-]?key|bearer|secret|credential|service[_-]?role|private[_-]?key|password|raw[_-]?(payload|provider)?|stack[_-]?trace|stack|hidden[_-]?reasoning|chain[_-]?of[_-]?thought|training|autonomous|autonomy|brain[_-]?learning|shadow[_-]?trainer|token)/i;

const SECRET_VALUE_PATTERN =
  /(s[k]-[a-z0-9_-]+|bearer\s+[a-z0-9._-]+|api[_-]?key=|secret=|token=)/i;

export const GROUP_A_UI_STATES = {
  LOADING: "loading",
  FRESH: "fresh",
  DELAYED: "delayed",
  STALE: "stale",
  UNAVAILABLE: "unavailable",
  UNKNOWN: "unknown",
  UNAUTHORIZED: "unauthorized",
  RATE_LIMITED: "rate_limited",
  ERROR_REDACTED: "error_redacted",
  MALFORMED_RESPONSE: "malformed_response",
};

export function createRedactedErrorResponse(reason = "error_redacted", statusCode = null) {
  return {
    ok: false,
    uiState: GROUP_A_UI_STATES.ERROR_REDACTED,
    status: "unavailable",
    freshnessState: "unknown",
    reason,
    message: "Group A read-service data is unavailable.",
    data: null,
    warnings: ["not_ready"],
    statusCode,
    generatedAt: new Date().toISOString(),
  };
}

export function createLoadingState() {
  return {
    ok: false,
    uiState: GROUP_A_UI_STATES.LOADING,
    status: "loading",
    freshnessState: "unknown",
    reason: "loading",
    message: "Checking approved Backend read service.",
    data: null,
    warnings: [],
    generatedAt: new Date().toISOString(),
  };
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isIsoTimestamp(value) {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function isNumberInRange(value, min = 0, max = 1) {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

export function sanitizeDisplayText(value, fallback = "Unavailable") {
  if (value === null || value === undefined || value === "") return fallback;

  return String(value)
    .replace(SECRET_VALUE_PATTERN, "[redacted]")
    .slice(0, 280);
}

function findForbiddenContent(value, path = "payload", findings = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => findForbiddenContent(item, `${path}[${index}]`, findings));
    return findings;
  }

  if (isObject(value)) {
    Object.entries(value).forEach(([key, item]) => {
      const nextPath = `${path}.${key}`;
      if (FORBIDDEN_FIELD_PATTERN.test(key)) {
        findings.push(nextPath);
      }
      findForbiddenContent(item, nextPath, findings);
    });
    return findings;
  }

  if (typeof value === "string" && SECRET_VALUE_PATTERN.test(value)) {
    findings.push(path);
  }

  return findings;
}

export function hasForbiddenContent(value) {
  return findForbiddenContent(value).length > 0;
}

export function uiStateFromFreshness(freshnessState, ok = false) {
  if (!ok) {
    if (freshnessState === "unknown") return GROUP_A_UI_STATES.UNKNOWN;
    return GROUP_A_UI_STATES.UNAVAILABLE;
  }

  if (freshnessState === "fresh") return GROUP_A_UI_STATES.FRESH;
  if (freshnessState === "delayed") return GROUP_A_UI_STATES.DELAYED;
  if (freshnessState === "stale") return GROUP_A_UI_STATES.STALE;
  if (freshnessState === "unavailable") return GROUP_A_UI_STATES.UNAVAILABLE;
  return GROUP_A_UI_STATES.UNKNOWN;
}

export function validateProviderHealthDto(dto) {
  if (!isObject(dto) || hasForbiddenContent(dto)) return false;

  return (
    typeof dto.providerId === "string" &&
    typeof dto.providerName === "string" &&
    PROVIDER_TYPES.has(dto.providerType) &&
    PROVIDER_STATUSES.has(dto.status) &&
    PROVIDER_HEALTH_STATES.has(dto.healthState) &&
    FRESHNESS_STATES.has(dto.freshnessState) &&
    isNumberInRange(dto.confidence) &&
    Array.isArray(dto.warnings) &&
    isIsoTimestamp(dto.generatedAt)
  );
}

export function validateProviderHealthResponse(payload) {
  if (!isObject(payload) || hasForbiddenContent(payload)) return false;

  if (payload.ok === true) {
    if (Array.isArray(payload.data)) {
      return payload.data.every(validateProviderHealthDto);
    }
    return validateProviderHealthDto(payload.data);
  }

  return validateFailClosedResponse(payload);
}

export function validateMarketContextDigestDto(dto) {
  if (!isObject(dto) || hasForbiddenContent(dto)) return false;

  return (
    typeof dto.digestId === "string" &&
    (typeof dto.symbol === "string" || typeof dto.marketScope === "string") &&
    DIGEST_TYPES.has(dto.digestType) &&
    typeof dto.summary === "string" &&
    typeof dto.sourceCount === "number" &&
    isNumberInRange(dto.confidence) &&
    FRESHNESS_STATES.has(dto.freshnessState) &&
    isIsoTimestamp(dto.generatedAt)
  );
}

export function validateMarketContextDigestResponse(payload) {
  if (!isObject(payload) || hasForbiddenContent(payload)) return false;

  if (payload.ok === true) {
    if (Array.isArray(payload.data)) {
      return payload.data.every(validateMarketContextDigestDto);
    }
    return validateMarketContextDigestDto(payload.data);
  }

  return validateFailClosedResponse(payload);
}

export function validateFailClosedResponse(payload) {
  if (!isObject(payload) || hasForbiddenContent(payload)) return false;

  return (
    payload.ok === false &&
    typeof payload.status === "string" &&
    FRESHNESS_STATES.has(payload.freshnessState) &&
    typeof payload.reason === "string" &&
    typeof payload.message === "string" &&
    payload.data === null &&
    Array.isArray(payload.warnings) &&
    isIsoTimestamp(payload.generatedAt)
  );
}

export function normalizeGroupAResponse(payload, validator, statusCode = 200) {
  if (statusCode === 401) {
    return {
      ...createRedactedErrorResponse("unauthorized", statusCode),
      uiState: GROUP_A_UI_STATES.UNAUTHORIZED,
      status: "unauthorized",
      message: "Authenticated operator access is required.",
    };
  }

  if (statusCode === 429) {
    return {
      ...createRedactedErrorResponse("rate_limited", statusCode),
      uiState: GROUP_A_UI_STATES.RATE_LIMITED,
      message: "Group A read-service rate limit reached.",
    };
  }

  if (!validator(payload)) {
    return {
      ...createRedactedErrorResponse("malformed_response", statusCode),
      uiState: GROUP_A_UI_STATES.MALFORMED_RESPONSE,
      message: "Backend response did not match the approved Group A DTO contract.",
    };
  }

  const freshnessState = payload.freshnessState || payload.data?.freshnessState || "unknown";

  return {
    ...payload,
    uiState: uiStateFromFreshness(freshnessState, payload.ok),
    statusCode,
  };
}
