const {
  failClosedResponse,
  sanitizeText
} = require("./GroupAReadServiceContracts");

function deterministicNotReadyDigestId(symbol) {
  return `market-context-${String(symbol).toLowerCase()}-not-ready`;
}

function createNotReadyDigestResponse({
  digestId,
  symbol = "SPY",
  reason = "approved_source_missing"
} = {}) {
  const normalizedSymbol = sanitizeText(symbol || "SPY").trim().toUpperCase();
  const response = failClosedResponse({
    status: "not_ready",
    freshnessState: "unavailable",
    reason,
    message: "Market context is not ready because no approved normalized source is available.",
    warnings: ["source_missing", "not_ready"]
  });

  return {
    ...response,
    digestId: digestId || deterministicNotReadyDigestId(normalizedSymbol),
    digestType: "not_ready",
    symbol: normalizedSymbol,
    marketScope: normalizedSymbol,
    sourceCount: 0,
    confidence: 0,
    validatedSnapshot: false
  };
}

function invalidRequestResponse() {
  return failClosedResponse({
    status: "invalid_request",
    freshnessState: "unknown",
    reason: "invalid_filter",
    message: "Market context digest identifier or filter is invalid.",
    warnings: ["validation_failed"]
  });
}

function listMarketContextDigests() {
  return createNotReadyDigestResponse({ symbol: "SPY" });
}

function getLatestMarketContextDigest(filters = {}) {
  const symbol = filters.symbol
    ? sanitizeText(filters.symbol).trim().toUpperCase()
    : "SPY";

  if (!/^[A-Z0-9._-]{1,20}$/.test(symbol)) {
    return invalidRequestResponse();
  }

  return createNotReadyDigestResponse({ symbol });
}

function getMarketContextDigestById(id) {
  const digestId = sanitizeText(id || "").trim();

  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,119}$/.test(digestId)) {
    return invalidRequestResponse();
  }

  return createNotReadyDigestResponse({
    digestId,
    symbol: "SPY"
  });
}

module.exports = {
  createNotReadyDigestResponse,
  deterministicNotReadyDigestId,
  getLatestMarketContextDigest,
  getMarketContextDigestById,
  listMarketContextDigests
};
