/*
 * Deterministic adaptive cognitive weighting.
 * This scores current factor influence without creating adaptive AI behavior.
 */

const WEIGHT_KEYS = [
  "anomalies",
  "confidence",
  "runtime",
  "behavior",
  "drift",
  "transitions",
  "pressure",
  "consensus",
  "strategicEnvironment",
  "stabilityForecast"
];

function clamp(value) {
  return Number(Math.max(0, Math.min(1, value)).toFixed(2));
}

function safeArray(value) {
  return Array.isArray(value)
    ? value.filter((item) => item && typeof item === "object")
    : [];
}

function anomalyWeight(anomalyIntelligence = {}) {
  if (anomalyIntelligence.severity === "HIGH") return 0.92;
  if (anomalyIntelligence.severity === "MEDIUM") return 0.7;
  if (anomalyIntelligence.severity === "LOW") return 0.42;
  return 0.2;
}

function confidenceWeight(input = {}) {
  const level = input.confidenceProfile?.level;
  const conflicted = input.intelligenceConsensus?.consensusStrength === "CONFLICTED" ||
    input.strategicEnvironment?.stability === "FRAGMENTED";

  if (conflicted) return 0.18;
  if (level === "HIGH") return 0.86;
  if (level === "MODERATE") return 0.68;
  if (level === "LOW") return 0.36;
  if (level === "AVOID") return 0.16;
  return 0.3;
}

function runtimeWeight(runtimeHealth = {}) {
  if (runtimeHealth.status === "CRITICAL") return 0.95;
  if (runtimeHealth.status === "UNSTABLE") return 0.86;
  if (runtimeHealth.status === "DEGRADED") return 0.75;
  if (runtimeHealth.status === "STABLE") return 0.38;
  if (runtimeHealth.status === "HEALTHY") return 0.24;
  return 0.3;
}

function behaviorWeight(behavioralIntelligence = {}) {
  if (
    behavioralIntelligence.behavioralState === "UNSTABLE" ||
    behavioralIntelligence.riskLevel === "HIGH"
  ) {
    return 0.88;
  }

  if (behavioralIntelligence.behavioralState === "OVERACTIVE") return 0.72;
  if (behavioralIntelligence.behavioralState === "CAUTION") return 0.56;
  if (behavioralIntelligence.behavioralState === "DISCIPLINED") return 0.24;
  return 0.34;
}

function driftWeight(cognitiveDrift = {}) {
  if (cognitiveDrift.severity === "HIGH") return 0.9;
  if (cognitiveDrift.severity === "MODERATE") return 0.68;
  if (cognitiveDrift.severity === "LOW" || cognitiveDrift.driftDetected) return 0.48;
  return 0.18;
}

function transitionsWeight(cognitiveTransitions = []) {
  const transitions = safeArray(cognitiveTransitions);
  const highCount = transitions.filter((transition) => {
    return transition.severity === "HIGH";
  }).length;
  const moderateCount = transitions.filter((transition) => {
    return transition.severity === "MODERATE";
  }).length;

  if (highCount >= 2) return 0.9;
  if (highCount === 1) return 0.76;
  if (moderateCount >= 2) return 0.62;
  if (transitions.length) return 0.42;
  return 0.18;
}

function pressureWeight(environmentalPressure = {}) {
  if (environmentalPressure.pressureLevel === "EXTREME") return 0.96;
  if (environmentalPressure.pressureLevel === "HIGH") return 0.84;
  if (environmentalPressure.pressureLevel === "MODERATE") return 0.62;
  if (environmentalPressure.pressureLevel === "LOW") return 0.34;
  return 0.18;
}

function consensusWeight(intelligenceConsensus = {}) {
  if (intelligenceConsensus.consensusStrength === "STRONG") return 0.84;
  if (intelligenceConsensus.consensusStrength === "MODERATE") return 0.66;
  if (intelligenceConsensus.consensusStrength === "WEAK") return 0.42;
  if (intelligenceConsensus.consensusStrength === "CONFLICTED") return 0.22;
  return 0.3;
}

function strategicEnvironmentWeight(strategicEnvironment = {}) {
  if (strategicEnvironment.environment === "OPTIMAL") return 0.82;
  if (strategicEnvironment.environment === "FAVORABLE") return 0.72;
  if (strategicEnvironment.environment === "CAUTION") return 0.56;
  if (strategicEnvironment.environment === "UNSTABLE") return 0.78;
  if (strategicEnvironment.environment === "HIGH_RISK") return 0.92;
  return 0.3;
}

function stabilityForecastWeight(forecast = {}) {
  if (forecast.trajectory === "FRAGMENTING") return 0.9;
  if (forecast.trajectory === "DETERIORATING") return 0.84;
  if (forecast.trajectory === "RECOVERING") return 0.58;
  if (forecast.trajectory === "STABILIZING") return 0.62;
  if (forecast.trajectory === "STABLE") return 0.52;
  return 0.24;
}

function normalizeCognitiveWeights(weights = {}) {
  return WEIGHT_KEYS.reduce((normalized, key) => {
    normalized[key] = clamp(weights[key] ?? 0);
    return normalized;
  }, {});
}

function classifyWeightPriority(weight) {
  if (weight >= 0.75) return "HIGH";
  if (weight >= 0.5) return "MODERATE";
  if (weight >= 0.25) return "LOW";
  return "SUPPRESSED";
}

function dominantFactors(weights = {}) {
  return Object.entries(weights)
    .filter(([, weight]) => classifyWeightPriority(weight) === "HIGH")
    .map(([factor]) => factor)
    .sort();
}

function suppressedFactors(weights = {}) {
  return Object.entries(weights)
    .filter(([, weight]) => classifyWeightPriority(weight) === "SUPPRESSED")
    .map(([factor]) => factor)
    .sort();
}

function buildObservations(weights, dominant, suppressed) {
  const observations = [
    `${dominant.length} dominant cognitive factors are active.`,
    `${suppressed.length} cognitive factors are currently suppressed.`
  ];

  if (dominant.length) {
    observations.push(`Dominant factors: ${dominant.join(", ")}.`);
  }

  return observations;
}

function summarizeCognitiveWeights(input = {}) {
  const weights = input.weights || {};
  const dominant = input.dominantFactors || dominantFactors(weights);
  const suppressed = input.suppressedFactors || suppressedFactors(weights);
  const strongestInfluences = dominant.length ? dominant : ["none"];
  const weakestInfluences = suppressed.length ? suppressed : ["none"];
  const dominantInstabilitySources = dominant.filter((factor) => {
    return ["anomalies", "runtime", "behavior", "drift", "transitions", "pressure"].includes(factor);
  });
  const stableReinforcingSystems = dominant.filter((factor) => {
    return ["confidence", "consensus", "strategicEnvironment"].includes(factor);
  });

  return `Strongest influences: ${strongestInfluences.join(", ")}. Weakest influences: ${weakestInfluences.join(", ")}. Dominant instability sources: ${dominantInstabilitySources.join(", ") || "none"}. Stable reinforcing systems: ${stableReinforcingSystems.join(", ") || "none"}.`;
}

function calculateCognitiveWeights(input = {}) {
  const weights = normalizeCognitiveWeights({
    anomalies: anomalyWeight(input.anomalyIntelligence),
    confidence: confidenceWeight(input),
    runtime: runtimeWeight(input.runtimeHealth),
    behavior: behaviorWeight(input.behavioralIntelligence),
    drift: driftWeight(input.cognitiveDrift),
    transitions: transitionsWeight(input.cognitiveTransitions),
    pressure: pressureWeight(input.environmentalPressure),
    consensus: consensusWeight(input.intelligenceConsensus),
    strategicEnvironment: strategicEnvironmentWeight(input.strategicEnvironment),
    stabilityForecast: stabilityForecastWeight(input.intelligenceStabilityForecast)
  });
  const dominant = dominantFactors(weights);
  const suppressed = suppressedFactors(weights);

  return {
    weights,
    dominantFactors: dominant,
    suppressedFactors: suppressed,
    observations: buildObservations(weights, dominant, suppressed),
    summary: summarizeCognitiveWeights({
      weights,
      dominantFactors: dominant,
      suppressedFactors: suppressed
    })
  };
}

module.exports = {
  calculateCognitiveWeights,
  classifyWeightPriority,
  normalizeCognitiveWeights,
  summarizeCognitiveWeights
};
