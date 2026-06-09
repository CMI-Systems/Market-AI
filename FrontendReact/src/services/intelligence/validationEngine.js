function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function confidenceOf(engineOutput) {
  const confidence = toNumber(engineOutput?.confidence ?? engineOutput?.score ?? engineOutput?.reliability);
  if (confidence === null) return null;
  return confidence <= 1 ? confidence * 100 : confidence;
}

function hasObject(value) {
  return Boolean(value && typeof value === 'object' && Object.keys(value).length);
}

export function analyzeValidation(input = {}) {
  const evidence = [];
  const warnings = [];
  const tactical = input?.tactical;
  const behavioral = input?.behavioral;
  const marketIntelligence = input?.marketIntelligence;
  const globalScan = input?.globalScan;
  const newsletterData = input?.newsletterData;
  let score = 50;

  // Validation checks whether independent intelligence layers and context sources exist and confirm each other.
  if (hasObject(tactical)) {
    score += 15;
    evidence.push('Tactical intelligence is available for validation.');
  } else {
    score -= 20;
    warnings.push('Tactical intelligence is missing.');
    evidence.push('Tactical intelligence is unavailable.');
  }

  if (hasObject(behavioral)) {
    score += 15;
    evidence.push('Behavioral intelligence is available for validation.');
  } else {
    score -= 20;
    warnings.push('Behavioral intelligence is missing.');
    evidence.push('Behavioral intelligence is unavailable.');
  }

  if (hasObject(marketIntelligence)) {
    score += 10;
    evidence.push('Market intelligence context is available.');
  }

  if (hasObject(globalScan)) {
    score += 8;
    evidence.push('Global scan context is available.');
  }

  if (hasObject(newsletterData)) {
    score += 5;
    evidence.push('Newsletter context is available.');
  }

  const tacticalConfidence = confidenceOf(tactical);
  const behavioralConfidence = confidenceOf(behavioral);
  if (tacticalConfidence !== null && behavioralConfidence !== null) {
    const spread = Math.abs(tacticalConfidence - behavioralConfidence);
    if (spread <= 20) {
      score += 10;
      evidence.push('Tactical and behavioral confidence are reasonably aligned.');
    } else {
      score -= 12;
      warnings.push('Tactical and behavioral confidence diverge materially.');
      evidence.push(`Confidence spread is ${spread.toFixed(1)} points.`);
    }
  }

  const finalScore = clampScore(score);
  const validation = finalScore >= 80
    ? 'STRONG_VALIDATION'
    : finalScore >= 60
      ? 'MODERATE_VALIDATION'
      : finalScore >= 35
        ? 'WEAK_VALIDATION'
        : 'NO_VALIDATION';

  return {
    validation,
    score: finalScore,
    evidence,
    warnings,
  };
}
