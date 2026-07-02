const { buildProductionHealth } = require("./productionHealthService");
const {
  classifyFreshness,
  clampConfidence,
  failClosedResponse,
  sanitizeArray,
  sanitizeText,
  validateProviderHealthDto
} = require("./groupAReadServiceContracts");

function normalizeProviderName(providerId) {
  if (providerId === "alpaca") return "Alpaca";
  if (providerId === "webull") return "Webull";
  if (providerId === "market-ai-backend") return "Market AI Backend";
  return providerId;
}

function mapProviderStatusToDto(providerStatus = {}, now = Date.now()) {
  const activeProvider = String(providerStatus.activeProvider || "PROVIDER_UNAVAILABLE").toUpperCase();
  const providerId = activeProvider === "ALPACA"
    ? "alpaca"
    : activeProvider === "WEBULL"
      ? "webull"
      : "market-ai-backend";
  const providerHealth = String(providerStatus.providerHealth || "UNKNOWN").toUpperCase();
  const providerAvailable = Boolean(providerStatus.providerAvailable && providerStatus.rawDataAvailable);
  const lastUpdate = providerStatus.lastUpdate || providerStatus.currentTime || null;
  const freshnessState = providerAvailable
    ? classifyFreshness(lastUpdate, now)
    : "unavailable";
  const warnings = [];

  if (!providerAvailable) warnings.push("provider_unavailable");
  if (freshnessState === "delayed") warnings.push("data_delayed");
  if (freshnessState === "stale") warnings.push("data_stale");
  if (freshnessState === "unavailable") warnings.push("source_missing");
  if (providerStatus.warnings?.length) warnings.push("not_ready");

  const status = providerAvailable && freshnessState === "fresh"
    ? "ok"
    : providerAvailable
      ? freshnessState === "stale" ? "stale" : "degraded"
      : "unavailable";
  const healthState = providerHealth === "HEALTHY" && providerAvailable
    ? "healthy"
    : providerHealth === "DEGRADED" || providerHealth === "PARTIAL_CAPABILITY"
      ? "degraded"
      : "not_ready";
  const confidence = providerAvailable && freshnessState === "fresh"
    ? 0.9
    : providerAvailable
      ? 0.65
      : 0;

  return {
    providerId,
    providerName: normalizeProviderName(providerId),
    providerType: activeProvider === "ALPACA" || activeProvider === "WEBULL" ? "market_data" : "internal_system",
    status,
    healthState,
    lastCheckedAt: providerStatus.currentTime || new Date(now).toISOString(),
    lastSuccessfulEventAt: providerAvailable ? lastUpdate : null,
    freshnessState,
    latencyMs: null,
    degradedReason: providerAvailable ? null : "missing_source",
    sourceCount: providerAvailable ? 1 : 0,
    confidence: clampConfidence(confidence),
    warnings: Array.from(new Set(sanitizeArray(warnings))),
    generatedAt: new Date(now).toISOString()
  };
}

function mapBackendHealthToDto(health = {}, now = Date.now()) {
  const healthy = String(health.status || "").toUpperCase() === "HEALTHY";
  const warnings = Array.isArray(health.warnings) && health.warnings.length
    ? ["not_ready"]
    : [];

  return {
    providerId: "market-ai-backend",
    providerName: "Market AI Backend",
    providerType: "internal_system",
    status: healthy ? "ok" : "degraded",
    healthState: healthy ? "healthy" : "degraded",
    lastCheckedAt: new Date(now).toISOString(),
    lastSuccessfulEventAt: new Date(now).toISOString(),
    freshnessState: "fresh",
    latencyMs: null,
    degradedReason: healthy ? null : "internal_validation_failed",
    sourceCount: 1,
    confidence: healthy ? 0.95 : 0.65,
    warnings,
    generatedAt: new Date(now).toISOString()
  };
}

function safeValidateProviderDto(dto) {
  const validation = validateProviderHealthDto(dto);
  if (validation.valid) return dto;

  return failClosedResponse({
    status: "unavailable",
    freshnessState: "unavailable",
    reason: "validation_failed",
    message: "Provider health failed contract validation.",
    warnings: ["validation_failed"]
  });
}

function readProviderStatusSafely(now) {
  try {
    const { getProviderStatus } = require("./marketProviderService");
    return getProviderStatus({ simulate: false, currentTime: new Date(now).toISOString() });
  } catch {
    return null;
  }
}

function listProviderHealth(options = {}) {
  try {
    const now = options.now || Date.now();
    const providerStatus = readProviderStatusSafely(now);
    const productionHealth = buildProductionHealth();
    const data = [];

    if (providerStatus) {
      data.push(safeValidateProviderDto(mapProviderStatusToDto(providerStatus, now)));
    }

    data.push(safeValidateProviderDto(mapBackendHealthToDto(productionHealth, now)));

    return {
      ok: true,
      data: data.filter((item) => item && item.ok !== false),
      generatedAt: new Date(now).toISOString()
    };
  } catch {
    return failClosedResponse({
      status: "unavailable",
      freshnessState: "unavailable",
      reason: "validation_failed",
      message: "Provider health is unavailable.",
      warnings: ["validation_failed"]
    });
  }
}

function getProviderHealth(provider, options = {}) {
  const providerId = sanitizeText(provider || "").trim().toLowerCase();
  const result = listProviderHealth(options);

  if (!result.ok) return result;

  const dto = result.data.find((item) => item.providerId === providerId);
  if (!dto) {
    return failClosedResponse({
      status: "unavailable",
      freshnessState: "unavailable",
      reason: "approved_source_missing",
      message: "Provider health is not available from an approved source.",
      warnings: ["source_missing", "not_ready"]
    });
  }

  return {
    ok: true,
    data: dto,
    generatedAt: result.generatedAt
  };
}

module.exports = {
  getProviderHealth,
  listProviderHealth,
  mapBackendHealthToDto,
  mapProviderStatusToDto
};
