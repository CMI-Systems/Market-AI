const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3001").replace(/\/$/, "");

const OFFLINE_PROVIDER_STATUS = {
  primaryProvider: "WEBULL_PENDING",
  activeProvider: "SIMULATION",
  fallbackProvider: "SIMULATION",
  marketStatus: "CLOSED",
  providerHealth: "DEGRADED",
  capabilities: {
    equities: true,
    options: false,
    futures: false,
    historicalCandles: true,
    quotes: true,
    news: false,
  },
  trackedSymbols: ["SPY", "QQQ", "NVDA", "AAPL", "MSFT"],
  lastUpdate: null,
  failoverReady: true,
  warnings: ["Provider endpoint unavailable; frontend fallback is active."],
};

const OFFLINE_PROVIDER_DIAGNOSTICS = {
  webull: {
    enabled: false,
    status: "PENDING",
    configured: false,
    readyForActivation: false,
    environment: "unknown",
    capabilities: {
      equities: true,
      quotes: true,
      historicalCandles: true,
      options: false,
      futures: false,
      news: false,
    },
  },
  alpaca: {
    enabled: false,
    status: "DEGRADED",
    quotes: false,
    candles: false,
  },
  fallback: {
    enabled: true,
    status: "AVAILABLE",
  },
  activeProvider: "SIMULATION",
  providerHealth: "DEGRADED",
  failoverReady: true,
  warnings: ["Provider diagnostics endpoint unavailable; fallback simulation remains available."],
};

const OFFLINE_WEBULL_HEALTH = {
  configured: false,
  enabled: false,
  environment: "unknown",
  status: "PENDING",
  readyForActivation: false,
  warnings: ["Webull health endpoint unavailable."],
  capabilities: {
    equities: true,
    quotes: true,
    historicalCandles: true,
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
