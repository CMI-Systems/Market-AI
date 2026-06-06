const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3001").replace(/\/$/, "");

const OFFLINE_SYSTEM_STATUS = {
  backend: "OFFLINE",
  mode: "OFFLINE",
  marketStatus: "UNKNOWN",
  runtime: "OFFLINE",
  provider: "FALLBACK",
  primaryProvider: "WEBULL_PENDING",
  secondaryProvider: "ALPACA_PENDING",
  environment: "LOCAL_FALLBACK",
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
    memory: "LOCAL",
  },
};

const FALLBACK_ALERTS = [
  {
    id: "fallback-provider-offline",
    timestamp: new Date().toISOString(),
    severity: "WARNING",
    source: "AICC_FRONTEND",
    category: "PROVIDER",
    title: "Provider Degradation",
    message: "AICC alerts endpoint is unavailable. Local fallback alert monitoring is active.",
  },
  {
    id: "fallback-signal-monitor",
    timestamp: new Date().toISOString(),
    severity: "INFO",
    source: "AICC_FRONTEND",
    category: "SIGNAL",
    title: "Signal Generated",
    message: "Signal alert monitor is standing by for backend cognition events.",
  },
];

const FALLBACK_REPLAY = [
  {
    id: "fallback-replay-provider",
    timestamp: new Date().toISOString(),
    type: "PROVIDER",
    symbol: "SPY",
    title: "Provider Status",
    summary: "Replay endpoint unavailable. Local replay fallback is showing provider standby state.",
    confidence: 0,
    risk: "MODERATE",
    source: "AICC_FRONTEND",
    cognition: {
      consensus: "UNKNOWN",
      environment: "LOCAL_FALLBACK",
      decision: "OBSERVE",
      escalation: "NONE",
    },
  },
  {
    id: "fallback-replay-executive",
    timestamp: new Date().toISOString(),
    type: "EXECUTIVE",
    symbol: null,
    title: "Executive Decision",
    summary: "AICC replay is standing by for backend cognition events.",
    confidence: 0,
    risk: "LOW",
    source: "AICC_FRONTEND",
    cognition: {
      consensus: "UNKNOWN",
      environment: "LOCAL_FALLBACK",
      decision: "OBSERVE",
      escalation: "NONE",
    },
  },
];

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
