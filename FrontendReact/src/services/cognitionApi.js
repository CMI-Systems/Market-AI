import { getDemoResponse } from "./demoCognition";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

async function fetchJson(endpoint) {
  if (DEMO_MODE) {
    return getDemoResponse(endpoint);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    return getDemoResponse(endpoint);
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
