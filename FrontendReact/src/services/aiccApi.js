import { createUnavailableMetadata } from "./frontendRuntimePolicy";
import { buildApiUrl } from "./apiBaseUrl";

const OFFLINE_SYSTEM_STATUS = {
  ...createUnavailableMetadata("BACKEND_UNAVAILABLE"),
  backend: "OFFLINE",
  mode: "OFFLINE",
  status: "UNKNOWN",
  streamMode: "BACKEND_UNAVAILABLE",
  simulationActive: false,
  marketStatus: "UNKNOWN",
  runtime: "OFFLINE",
  provider: "BACKEND_UNAVAILABLE",
  primaryProvider: "WEBULL_PENDING",
  secondaryProvider: "ALPACA_PENDING",
  dataAvailability: "DATA_UNAVAILABLE",
  dataState: "BACKEND_UNAVAILABLE",
  dataAge: null,
  sessionState: "UNKNOWN_SESSION",
  marketOpen: false,
  extendedHours: false,
  sessionSource: "UNKNOWN",
  sessionVerified: false,
  currentTime: null,
  nextOpen: null,
  previousClose: null,
  stability: "OFFLINE",
  confidence: "LOW",
  score: 0,
  brains: {
    tactical: "STANDBY",
    behavioral: "STANDBY",
    failsafe: "STANDBY",
  },
  feeds: {
    equities: "OFFLINE",
    options: "PENDING",
    futures: "UNAVAILABLE",
    symbol: "SPY",
    feedState: "OFFLINE",
    events: 0,
    memory: "DATA_UNAVAILABLE",
  },
};

const FALLBACK_ALERTS = [
  {
    id: "fallback-provider-offline",
    timestamp: null,
    severity: "WARNING",
    source: "AICC_FRONTEND",
    category: "PROVIDER",
    title: "AICC Alerts Unavailable",
    message: "AICC alerts endpoint is unavailable. No local alert simulation is active.",
    status: "BACKEND_UNAVAILABLE",
    acknowledged: false,
    dismissed: false,
    sourceType: "DATA_UNAVAILABLE",
    ...createUnavailableMetadata("BACKEND_UNAVAILABLE"),
  },
];

const FALLBACK_REPLAY = [
  {
    id: "fallback-replay-provider",
    timestamp: new Date().toISOString(),
    type: "PROVIDER",
    symbol: null,
    title: "AICC Replay Unavailable",
    summary: "Replay endpoint unavailable. No local replay intelligence is being substituted.",
    confidence: null,
    risk: "UNKNOWN",
    source: "AICC_FRONTEND",
    ...createUnavailableMetadata("BACKEND_UNAVAILABLE"),
    cognition: {
      consensus: "DATA_UNAVAILABLE",
      environment: "BACKEND_UNAVAILABLE",
      decision: "UNAVAILABLE",
      escalation: "UNKNOWN",
    },
  },
];

async function fetchJson(endpoint) {
  try {
    const response = await fetch(buildApiUrl(endpoint));

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json();
  } catch {
    return null;
  }
}

export function getOfflineAiccSystemStatus() {
  return OFFLINE_SYSTEM_STATUS;
}

export async function getAiccSystemStatus() {
  const data = await fetchJson("/api/aicc/system-status");

  return data || OFFLINE_SYSTEM_STATUS;
}

export function getFallbackAiccAlerts() {
  return FALLBACK_ALERTS;
}

export async function getAiccAlerts() {
  const data = await fetchJson("/api/aicc/alerts");

  return Array.isArray(data) && data.length ? data : FALLBACK_ALERTS;
}

export function getFallbackAiccReplay() {
  return FALLBACK_REPLAY;
}

export async function getAiccReplay() {
  const data = await fetchJson("/api/aicc/replay");

  return Array.isArray(data) && data.length ? data : FALLBACK_REPLAY;
}
