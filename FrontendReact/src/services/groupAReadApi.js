import {
  createAccessDeniedResponse,
  createRedactedErrorResponse,
  normalizeGroupAResponse,
  validateMarketContextDigestResponse,
  validateProviderHealthResponse,
} from "./groupAReadContracts";
import { buildApiUrl, isExplicitLocalDevelopment } from "./apiBaseUrl";
import { getAuthSession } from "./supabaseClient";

async function fetchGroupAJson(endpoint, validator) {
  try {
    const authResult = await getAuthSession();
    const accessCredential = authResult.session?.access_token || null;

    if (!accessCredential && !isExplicitLocalDevelopment) {
      return createAccessDeniedResponse(401);
    }

    const headers = accessCredential
      ? { Authorization: `Bearer ${accessCredential}` }
      : {};
    const response = await fetch(buildApiUrl(endpoint), { headers });
    let payload = null;

    try {
      payload = await response.json();
    } catch {
      return createRedactedErrorResponse("error_redacted", response.status);
    }

    return normalizeGroupAResponse(payload, validator, response.status);
  } catch {
    return createRedactedErrorResponse("error_redacted", null);
  }
}

function encodePathSegment(value) {
  return encodeURIComponent(String(value || "").trim());
}

export function fetchProviderHealth() {
  return fetchGroupAJson("/api/provider-health", validateProviderHealthResponse);
}

export function fetchProviderHealthByProvider(provider) {
  const providerId = encodePathSegment(provider);

  if (!providerId) {
    return Promise.resolve(createRedactedErrorResponse("invalid_filter", 400));
  }

  return fetchGroupAJson(`/api/provider-health/${providerId}`, validateProviderHealthResponse);
}

export function fetchMarketContextDigests(params = {}) {
  const query = new URLSearchParams();

  if (params.symbol) query.set("symbol", String(params.symbol).trim().toUpperCase());
  if (params.limit) query.set("limit", String(params.limit));

  const suffix = query.toString() ? `?${query.toString()}` : "";
  return fetchGroupAJson(`/api/market-context/digests${suffix}`, validateMarketContextDigestResponse);
}

export function fetchLatestMarketContextDigest(params = {}) {
  const query = new URLSearchParams();

  if (params.symbol) query.set("symbol", String(params.symbol).trim().toUpperCase());

  const suffix = query.toString() ? `?${query.toString()}` : "";
  return fetchGroupAJson(`/api/market-context/digests/latest${suffix}`, validateMarketContextDigestResponse);
}

export function fetchMarketContextDigestById(id) {
  const digestId = encodePathSegment(id);

  if (!digestId) {
    return Promise.resolve(createRedactedErrorResponse("invalid_filter", 400));
  }

  return fetchGroupAJson(`/api/market-context/digests/${digestId}`, validateMarketContextDigestResponse);
}
