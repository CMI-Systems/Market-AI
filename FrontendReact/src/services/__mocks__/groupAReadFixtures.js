export const providerHealthFreshFixture = {
  ok: true,
  data: [
    {
      providerId: "market-ai-backend",
      providerName: "Market AI Backend",
      providerType: "internal_system",
      status: "ok",
      healthState: "healthy",
      lastCheckedAt: "2026-07-02T01:00:00.000Z",
      lastSuccessfulEventAt: "2026-07-02T01:00:00.000Z",
      freshnessState: "fresh",
      latencyMs: null,
      degradedReason: null,
      sourceCount: 1,
      confidence: 0.95,
      warnings: [],
      generatedAt: "2026-07-02T01:00:00.000Z",
    },
  ],
  generatedAt: "2026-07-02T01:00:00.000Z",
};

export const providerUnavailableFixture = {
  ok: false,
  status: "unavailable",
  freshnessState: "unavailable",
  reason: "approved_source_missing",
  message: "Provider health is not available from an approved source.",
  data: null,
  warnings: ["source_missing", "not_ready"],
  generatedAt: "2026-07-02T01:00:00.000Z",
};

export const latestDigestUnavailableFixture = {
  ok: false,
  status: "not_ready",
  freshnessState: "unavailable",
  reason: "approved_source_missing",
  message: "Market context digest is not available from an approved normalized source.",
  data: null,
  warnings: ["source_missing", "not_ready"],
  generatedAt: "2026-07-02T01:00:00.000Z",
};

export const staleDigestFixture = {
  ok: true,
  data: {
    digestId: "digest-stale-fixture",
    symbol: "SPY",
    windowStart: "2026-07-01T14:00:00.000Z",
    windowEnd: "2026-07-01T15:00:00.000Z",
    digestType: "intraday",
    dominantRegime: "mixed",
    sentimentState: "neutral",
    summary: "Approved stale digest fixture for UI state testing.",
    keyDrivers: ["Fixture driver"],
    risks: ["Fixture risk"],
    bullishCounterpoints: [],
    bearishCounterpoints: [],
    sourceCount: 1,
    confidence: 0.5,
    freshnessState: "stale",
    generatedAt: "2026-07-01T15:00:00.000Z",
  },
  generatedAt: "2026-07-01T15:00:00.000Z",
};

export const delayedDigestFixture = {
  ...staleDigestFixture,
  data: {
    ...staleDigestFixture.data,
    digestId: "digest-delayed-fixture",
    freshnessState: "delayed",
    summary: "Approved delayed digest fixture for UI state testing.",
  },
};

export const unknownStatusFixture = {
  ok: false,
  status: "unavailable",
  freshnessState: "unknown",
  reason: "unknown",
  message: "Freshness cannot be determined safely.",
  data: null,
  warnings: ["not_ready"],
  generatedAt: "2026-07-02T01:00:00.000Z",
};

export const unauthorizedFixture = {
  ok: false,
  uiState: "unauthorized",
  status: "unauthorized",
  freshnessState: "unavailable",
  reason: "unauthorized",
  message: "Authenticated operator access is required.",
  data: null,
  warnings: ["not_ready"],
  statusCode: 401,
  generatedAt: "2026-07-02T01:00:00.000Z",
};

export const rateLimitedFixture = {
  ok: false,
  uiState: "rate_limited",
  status: "unavailable",
  freshnessState: "unavailable",
  reason: "rate_limited",
  message: "Group A read-service rate limit reached.",
  data: null,
  warnings: ["not_ready"],
  statusCode: 429,
  generatedAt: "2026-07-02T01:00:00.000Z",
};

export const malformedDtoFixture = {
  ok: true,
  data: {
    rawPayload: { unsafe: true },
  },
};

export const redactedErrorFixture = {
  ok: false,
  uiState: "error_redacted",
  status: "unavailable",
  freshnessState: "unknown",
  reason: "error_redacted",
  message: "Group A read-service data is unavailable.",
  data: null,
  warnings: ["not_ready"],
  generatedAt: "2026-07-02T01:00:00.000Z",
};
