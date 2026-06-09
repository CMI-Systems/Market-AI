const BASE_WEIGHTS = {
  tactical: 0.4,
  behavioral: 0.35,
  failsafe: 0.25,
};

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function confidenceOf(source, fallback = 45) {
  const confidence = toNumber(source?.confidence ?? source?.reliability ?? source?.score);
  if (confidence === null) return fallback;
  return confidence <= 1 ? confidence * 100 : confidence;
}

function normalizeWeights(weights) {
  const total = Object.values(weights).reduce((sum, value) => sum + value, 0);
  if (!total) return BASE_WEIGHTS;
  return Object.fromEntries(Object.entries(weights).map(([key, value]) => [key, value / total]));
}

export function analyzeConsensusWeighting(input = {}) {
  const evidence = [];
  const warnings = [];
  const tacticalAvailable = Boolean(input?.tactical && typeof input.tactical === 'object');
  const behavioralAvailable = Boolean(input?.behavioral && typeof input.behavioral === 'object');
  const failsafeAvailable = Boolean(input?.failsafe && typeof input.failsafe === 'object');
  const weights = { ...BASE_WEIGHTS };
  const tacticalConfidence = confidenceOf(input?.tactical);
  const behavioralConfidence = confidenceOf(input?.behavioral);
  const failsafeReliability = confidenceOf(input?.failsafe);
  let riskModifier = 1;

  // Base weights stay stable, then missing sources and failsafe reliability adjust usable confidence.
  if (!tacticalAvailable) {
    weights.tactical = 0;
    warnings.push('Tactical source is missing from consensus weighting.');
  }

  if (!behavioralAvailable) {
    weights.behavioral = 0;
    warnings.push('Behavioral source is missing from consensus weighting.');
  }

  if (!failsafeAvailable) {
    weights.failsafe = 0.1;
    warnings.push('Failsafe source is missing from consensus weighting.');
  }

  if (failsafeReliability < 40) {
    riskModifier = 0.65;
    warnings.push('Very low failsafe reliability materially reduces consensus confidence.');
  } else if (failsafeReliability < 55) {
    riskModifier = 0.78;
    warnings.push('Low failsafe reliability reduces consensus confidence.');
  } else if (failsafeReliability < 70) {
    riskModifier = 0.9;
    evidence.push('Moderate failsafe reliability slightly tempers consensus confidence.');
  } else {
    evidence.push('Failsafe reliability supports consensus weighting.');
  }

  const normalizedWeights = normalizeWeights(weights);
  const weightedConfidence = (
    tacticalConfidence * normalizedWeights.tactical
    + behavioralConfidence * normalizedWeights.behavioral
    + failsafeReliability * normalizedWeights.failsafe
  );
  const score = clampScore(weightedConfidence * riskModifier);

  evidence.push(`Tactical weight is ${(normalizedWeights.tactical * 100).toFixed(0)}%.`);
  evidence.push(`Behavioral weight is ${(normalizedWeights.behavioral * 100).toFixed(0)}%.`);
  evidence.push(`Failsafe weight is ${(normalizedWeights.failsafe * 100).toFixed(0)}%.`);

  return {
    weighting: normalizedWeights,
    score,
    riskModifier,
    evidence,
    warnings,
  };
}
