import { createUnavailableMetadata } from "./frontendRuntimePolicy";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3001").replace(/\/$/, "");

const OFFLINE_PROVIDER_STATUS = {
  ...createUnavailableMetadata("BACKEND_UNAVAILABLE"),
  primaryProvider: "WEBULL_PENDING",
  activeProvider: "BACKEND_UNAVAILABLE",
  fallbackProvider: "NONE",
  marketStatus: "DATA_UNAVAILABLE",
  sessionState: "UNKNOWN_SESSION",
  marketOpen: false,
  extendedHours: false,
  sessionSource: "UNKNOWN",
  sessionVerified: false,
  dataState: "BACKEND_UNAVAILABLE",
  dataAge: null,
  providerHealth: "OFFLINE",
  capabilities: {
    equities: false,
    options: false,
    futures: false,
    historicalCandles: false,
    quotes: false,
    news: false,
  },
  trackedSymbols: [],
  lastUpdate: null,
  providerAvailable: false,
  failoverReady: false,
  warnings: ["Provider endpoint unavailable; no simulated provider fallback is active."],
};

const OFFLINE_PROVIDER_DIAGNOSTICS = {
  ...createUnavailableMetadata("BACKEND_UNAVAILABLE"),
  webull: {
    enabled: false,
    status: "UNKNOWN",
    configured: false,
    readyForActivation: false,
    environment: "unknown",
    capabilities: {
      equities: false,
      quotes: false,
      historicalCandles: false,
      options: false,
      futures: false,
      news: false,
    },
  },
  alpaca: {
    enabled: false,
    status: "BACKEND_UNAVAILABLE",
    quotes: false,
    candles: false,
  },
  fallback: {
    enabled: false,
    status: "DISABLED",
  },
  activeProvider: "BACKEND_UNAVAILABLE",
  providerHealth: "OFFLINE",
  providerAvailable: false,
  sessionState: "UNKNOWN_SESSION",
  marketOpen: false,
  dataState: "BACKEND_UNAVAILABLE",
  dataAge: null,
  failoverReady: false,
  warnings: ["Provider diagnostics endpoint unavailable; no simulated provider fallback is active."],
};

const OFFLINE_WEBULL_HEALTH = {
  ...createUnavailableMetadata("BACKEND_UNAVAILABLE"),
  configured: false,
  enabled: false,
  environment: "unknown",
  status: "BACKEND_UNAVAILABLE",
  readyForActivation: false,
  warnings: ["Webull health endpoint unavailable."],
  capabilities: {
    equities: false,
    quotes: false,
    historicalCandles: false,
    options: false,
    futures: false,
    news: false,
  },
};

async function fetchJson(endpoint) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json();
  } catch {
    return null;
  }
}

export function getOfflineMarketProviderStatus() {
  return OFFLINE_PROVIDER_STATUS;
}

export function getOfflineProviderDiagnostics() {
  return OFFLINE_PROVIDER_DIAGNOSTICS;
}

export function getOfflineWebullHealth() {
  return OFFLINE_WEBULL_HEALTH;
}

export async function getMarketProviderStatus() {
  const data = await fetchJson("/api/market/provider-status");

  return data || OFFLINE_PROVIDER_STATUS;
}

export async function getMarketQuotes(symbols) {
  const requestedSymbols = Array.isArray(symbols) ? symbols : [];
  const query = requestedSymbols.map((symbol) => encodeURIComponent(symbol)).join(",");
  const data = await fetchJson(`/api/market/quotes?symbols=${query}`);

  return Array.isArray(data) ? data : [];
}

export async function getMarketCandles(symbol, timeframe = "5Min", limit = 80) {
  const query = new URLSearchParams({
    symbol,
    timeframe,
    limit: String(limit),
  });
  const data = await fetchJson(`/api/market/candles?${query.toString()}`);

  return Array.isArray(data) ? data : [];
}

export async function getProviderSignals(symbols) {
  const requestedSymbols = Array.isArray(symbols) ? symbols : [];
  const query = requestedSymbols.map((symbol) => encodeURIComponent(symbol)).join(",");
  const data = await fetchJson(`/api/market/provider-signals?symbols=${query}`);

  return Array.isArray(data) ? data : [];
}

export async function getProviderDiagnostics() {
  const data = await fetchJson("/api/market/provider-diagnostics");

  return data || OFFLINE_PROVIDER_DIAGNOSTICS;
}

export async function getWebullHealth() {
  const data = await fetchJson("/api/market/webull-health");

  return data || OFFLINE_WEBULL_HEALTH;
}
