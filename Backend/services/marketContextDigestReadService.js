const {
  failClosedResponse,
  sanitizeText,
  validateMarketContextDigestDto
} = require("./groupAReadServiceContracts");

function unavailableDigestResponse(reason = "approved_source_missing") {
  return failClosedResponse({
    status: "not_ready",
    freshnessState: "unavailable",
    reason,
    message: "Market context digest is not available from an approved normalized source.",
    warnings: ["source_missing", "not_ready"]
  });
}

function validateDigestOrFail(dto) {
  const validation = validateMarketContextDigestDto(dto);
  if (validation.valid) return { ok: true, data: dto, generatedAt: new Date().toISOString() };

  return failClosedResponse({
    status: "unavailable",
    freshnessState: "unknown",
    reason: "validation_failed",
    message: "Market context digest failed contract validation.",
    warnings: ["validation_failed"]
  });
}

function listMarketContextDigests() {
  return unavailableDigestResponse();
}

function getLatestMarketContextDigest(filters = {}) {
  const symbol = filters.symbol ? sanitizeText(filters.symbol).trim().toUpperCase() : null;
  if (symbol && !/^[A-Z0-9._-]{1,20}$/.test(symbol)) {
    return failClosedResponse({
      status: "invalid_request",
      freshnessState: "unknown",
      reason: "invalid_filter",
      message: "Market context digest filter is invalid.",
      warnings: ["validation_failed"]
    });
  }

  return unavailableDigestResponse();
}

function getMarketContextDigestById(id) {
  const digestId = sanitizeText(id || "").trim();
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,119}$/.test(digestId)) {
    return failClosedResponse({
      status: "invalid_request",
      freshnessState: "unknown",
      reason: "invalid_filter",
      message: "Market context digest identifier is invalid.",
      warnings: ["validation_failed"]
    });
  }

  return unavailableDigestResponse();
}

module.exports = {
  getLatestMarketContextDigest,
  getMarketContextDigestById,
  listMarketContextDigests,
  unavailableDigestResponse,
  validateDigestOrFail
};
