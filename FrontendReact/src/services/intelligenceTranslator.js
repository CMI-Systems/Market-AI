function normalize(value) {
  return String(value || "").trim().toUpperCase();
}

function readableFallback(value, fallback = "Awaiting cognition.") {
  return value || fallback;
}

export function translateStatusLabel(value, fallback = "DETECTING") {
  const raw = normalize(value?.environment || value?.liquidityState || value?.flowState || value?.level || value?.status || value);

  const labels = {
    ACTIVE: "ONLINE",
    ALIGNED: "RISK_ON",
    CAUTION: "CAUTION",
    CAUTIOUS: "CAUTION",
    CLOSED: "DEFENSIVE",
    CONNECTED: "ONLINE",
    CRISIS: "RISK_OFF",
    DEGRADED: "DEGRADED",
    DISTRIBUTION: "DEFENSIVE",
    EXPANSION: "EXPANSION",
    HEALTHY: "HEALTHY",
    HIGH: "RISK_ON",
    LOW: "CAUTION",
    MIXED: "CAUTION",
    MODERATE: "STABILIZING",
    NEUTRAL: "STABILIZING",
    OBSERVATION_ONLY: "DEFENSIVE",
    ONLINE: "ONLINE",
    OPEN: "ONLINE",
    OPTIMAL: "OPTIMAL",
    RECOVERING: "RECOVERING",
    RISK_OFF: "RISK_OFF",
    RISK_ON: "RISK_ON",
    STABLE: "STABLE",
    STANDBY: "STABILIZING",
    STRONG: "ACCUMULATING",
    WEAK: "CAUTION",
  };

  return labels[raw] || raw || fallback;
}

export function translateDashboardStatus(value, fallback = "DETECTING") {
  const raw = normalize(value?.consensusStrength || value?.level || value?.environment || value?.stability || value?.status || value);

  const labels = {
    CAUTION: "CAUTION",
    CAUTIOUS: "CAUTION",
    CRISIS: "RISK OFF",
    DEGRADED: "DEGRADED",
    EXPANSION: "EXPANSION",
    HIGH: "HIGH CONVICTION",
    LOW: "LOW CONVICTION",
    MEDIUM: "BUILDING",
    MIXED: "CAUTION",
    MODERATE: "BUILDING",
    NEUTRAL: "STABLE",
    OPTIMAL: "OPTIMAL",
    RECOVERING: "RECOVERING",
    RISK_OFF: "RISK OFF",
    RISK_ON: "RISK ON",
    STABLE: "STABLE",
    STRONG: "HIGH CONVICTION",
    WEAK: "LOW CONVICTION",
  };

  return labels[raw] || raw || fallback;
}

export function normalizeDataLabel(value, fallback = "DETECTING") {
  const raw = value ?? fallback;
  const normalized = normalize(raw);

  if (normalized === "UNKNOWN") return "DETECTING";
  if (normalized === "N/A") return "UNAVAILABLE";

  return raw;
}

export function classifyHealth(value) {
  const raw = normalize(value?.status || value?.runtimeHealth?.status || value);

  const labels = {
    ACTIVE: "HEALTHY",
    CONNECTED: "HEALTHY",
    CRITICAL: "CRITICAL",
    DEGRADED: "DEGRADED",
    ERROR: "CRITICAL",
    HEALTHY: "HEALTHY",
    OK: "HEALTHY",
    ONLINE: "HEALTHY",
    OPERATIONAL: "HEALTHY",
    RECOVERING: "STABLE",
    STABLE: "STABLE",
    WARN: "DEGRADED",
    WARNING: "DEGRADED",
  };

  return labels[raw] || "STABLE";
}

export function translateConsensus(value) {
  const raw = normalize(value?.consensusStrength || value?.level || value);

  const labels = {
    WEAK: "Low Conviction",
    LOW: "Low Conviction",
    MODERATE: "Building Conviction",
    MEDIUM: "Building Conviction",
    STRONG: "High Conviction",
    HIGH: "High Conviction",
    OPTIMAL: "High Conviction",
  };

  return labels[raw] || readableFallback(value?.consensusStrength || value);
}

export function translateConfidence(value) {
  const raw = normalize(value?.level || value);

  const labels = {
    LOW: "Risk remains elevated due to insufficient confirmation.",
    WEAK: "Risk remains elevated due to insufficient confirmation.",
    MODERATE: "Confirmation is building, but selectivity remains important.",
    MEDIUM: "Confirmation is building, but selectivity remains important.",
    HIGH: "Confidence is strong enough to support decisive participation.",
    STRONG: "Confidence is strong enough to support decisive participation.",
    OPTIMAL: "Confidence profile supports aggressive opportunity deployment.",
  };

  return labels[raw] || readableFallback(value?.level || value);
}

export function translateEnvironment(value) {
  const raw = normalize(value?.environment || value?.stability || value);

  const labels = {
    CAUTION: "Market conditions remain mixed and require selective participation.",
    CAUTIOUS: "Market conditions remain mixed and require selective participation.",
    MIXED: "Market conditions remain mixed and require selective participation.",
    NEUTRAL: "Market conditions are balanced and favor disciplined observation.",
    STABLE: "Market structure is stable enough for measured participation.",
    EXPANSION: "Expansion conditions favor opportunity deployment with confirmation.",
    OPTIMAL: "Conditions support aggressive opportunity deployment.",
    RISK_OFF: "Defensive posture is favored until conditions stabilize.",
    CRISIS: "Stress conditions require protection-first decision making.",
  };

  return labels[raw] || readableFallback(value?.summary || value?.environment || value);
}

export function translateInstitutionalFlow(value) {
  const raw = normalize(value?.flowState || value?.flowStrength || value);

  const labels = {
    LOW: "Institutional sponsorship is limited; wait for stronger confirmation.",
    WEAK: "Institutional sponsorship is limited; wait for stronger confirmation.",
    NEUTRAL: "Institutional flow is balanced and not yet directional.",
    MODERATE: "Institutional participation is building beneath the surface.",
    ACCUMULATION: "Institutional accumulation is supporting constructive conditions.",
    STRONG: "Institutional demand is active and strengthening the opportunity set.",
    DISTRIBUTION: "Institutional distribution pressure requires tighter risk control.",
  };

  return labels[raw] || readableFallback(value?.summary || value?.flowState || value);
}

export function translateLiquidity(value) {
  const raw = normalize(value?.liquidityState || value?.pressureState || value?.status || value);

  const labels = {
    LOW: "Liquidity is thin; execution risk is elevated.",
    WEAK: "Liquidity is thin; execution risk is elevated.",
    STRESSED: "Liquidity stress is present and requires defensive sizing.",
    CAUTION: "Liquidity conditions require selective participation.",
    NORMAL: "Liquidity is functional and supports measured participation.",
    HEALTHY: "Liquidity conditions are healthy enough for active opportunity review.",
    HIGH: "Liquidity depth is supportive for active participation.",
    OPTIMAL: "Liquidity conditions support aggressive opportunity deployment.",
  };

  return labels[raw] || readableFallback(value?.summary || value?.liquidityState || value);
}
