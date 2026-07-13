import { getDemoResponse } from "./demoCognition";
import {
  createUnavailableMetadata,
  getFrontendDemoPolicy,
} from "./frontendRuntimePolicy";
import { buildApiUrl } from "./apiBaseUrl";

function createUnavailableResponse(endpoint, reason = "BACKEND_UNAVAILABLE") {
  const base = {
    ...createUnavailableMetadata(reason),
    endpoint,
    timestamp: null,
    warnings: [
      "Verified backend cognition is unavailable. Demo cognition was not substituted.",
    ],
  };

  if (endpoint.includes("/overview")) {
    return {
      ...base,
      backend: null,
      mode: "DATA_UNAVAILABLE",
      provider: "BACKEND_UNAVAILABLE",
      marketOpen: null,
      runtimeHealth: {
        status: "BACKEND_UNAVAILABLE",
        summary: "AICC cognition backend is unavailable.",
      },
      strategicEnvironment: {
        regime: "UNKNOWN",
        risk: "DATA_UNAVAILABLE",
      },
      confidence: {
        score: null,
        level: "DATA_UNAVAILABLE",
      },
      consensus: {
        state: "DATA_UNAVAILABLE",
        strength: "UNKNOWN",
      },
      stabilityForecast: {
        state: "UNKNOWN",
        horizon: "DATA_UNAVAILABLE",
      },
      escalation: {
        status: "DATA_UNAVAILABLE",
        level: "UNKNOWN",
      },
    };
  }

  if (endpoint.includes("/brain-status")) {
    const brainUnavailable = {
      status: "DATA_UNAVAILABLE",
      confidence: null,
      sourceType: "DATA_UNAVAILABLE",
    };

    return {
      ...base,
      tacticalBrain: brainUnavailable,
      behavioralBrain: brainUnavailable,
      failsafeBrain: brainUnavailable,
    };
  }

  if (endpoint.includes("/confidence")) {
    return {
      ...base,
      score: null,
      level: "DATA_UNAVAILABLE",
      consensusStrength: "UNKNOWN",
      warningCount: 1,
    };
  }

  return {
    ...base,
    status: "DATA_UNAVAILABLE",
    message: "Verified cognition data is unavailable.",
    data: [],
  };
}

async function fetchJson(endpoint) {
  const demoPolicy = getFrontendDemoPolicy();

  if (demoPolicy.demoAllowed) {
    return getDemoResponse(endpoint);
  }

  if (demoPolicy.demoBlocked) {
    return createUnavailableResponse(endpoint, "DEMO_NOT_ALLOWED");
  }

  try {
    const response = await fetch(buildApiUrl(endpoint));

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return await response.json();
  } catch {
    return createUnavailableResponse(endpoint, "BACKEND_UNAVAILABLE");
  }
}

export function getCognitionOverview() {
  return fetchJson("/api/cognition/overview");
}

export function getBrainStatus() {
  return fetchJson("/api/cognition/brain-status");
}

export function getConfidence() {
  return fetchJson("/api/cognition/confidence");
}

export function getStrategicEnvironment() {
  return fetchJson("/api/cognition/strategic-environment");
}

export function getLiquidityPressure() {
  return fetchJson("/api/cognition/liquidity-pressure");
}

export function getInstitutionalFlow() {
  return fetchJson("/api/cognition/institutional-flow");
}

export function getPriorityFeed() {
  return fetchJson("/api/cognition/priority-feed");
}

export function getProductionHealth() {
  return fetchJson("/api/health");
}

export function getTemporalMemory() {
  return fetchJson("/api/cognition/temporal-memory");
}

export function getRecurrence() {
  return fetchJson("/api/cognition/recurrence");
}

export function getReinforcementWeighting() {
  return fetchJson("/api/cognition/reinforcement-weighting");
}

export function getPersistentMemory() {
  return fetchJson("/api/cognition/persistent-memory");
}

export function getAdaptiveSignals() {
  return fetchJson("/api/cognition/adaptive-signals");
}
