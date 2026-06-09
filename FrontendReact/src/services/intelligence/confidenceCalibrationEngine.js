function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function confidenceOf(output) {
  const confidence = toNumber(output?.confidence ?? output?.score);
  if (confidence === null) return null;
  return confidence <= 1 ? confidence * 100 : confidence;
}

export function analyzeConfidenceCalibration(input = {}) {
  const evidence = [];
  const warnings = [];
  const tacticalConfidence = confidenceOf(input?.tactical);
  const behavioralConfidence = confidenceOf(input?.behavioral);
  const validation = input?.validation;
  const dataIntegrity = input?.dataIntegrity;
  const conflictDetection = input?.conflictDetection;
  const availableConfidences = [tacticalConfidence, behavioralConfidence].filter((value) => value !== null);
  const averageConfidence = availableConfidences.length
    ? availableConfidences.reduce((sum, value) => sum + value, 0) / availableConfidences.length
    : 50;
  const supportScore = (
    (toNumber(validation?.score) ?? 40)
    + (toNumber(dataIntegrity?.score) ?? 40)
    + (toNumber(conflictDetection?.score) ?? 40)
  ) / 3;
  const confidenceGap = averageConfidence - supportScore;
  let score = 82 - Math.abs(confidenceGap) * 0.8;

  // Calibration compares stated intelligence confidence against validation, data, and conflict support.
  evidence.push(`Average stated confidence is ${averageConfidence.toFixed(1)}.`);
  evidence.push(`Supporting reliability context is ${supportScore.toFixed(1)}.`);

  if (validation?.validation === 'WEAK_VALIDATION' && averageConfidence >= 75) {
    score -= 15;
    warnings.push('Weak validation is paired with high confidence.');
    evidence.push('Weak validation plus high confidence indicates overconfidence risk.');
  }

  if (conflictDetection?.conflict === 'MAJOR_CONFLICT' && averageConfidence >= 70) {
    score -= 15;
    warnings.push('Major conflict is paired with high confidence.');
    evidence.push('Major conflict plus high confidence indicates false certainty risk.');
  }

  let confidenceCalibration = 'WELL_CALIBRATED';
  if (confidenceGap >= 30) {
    confidenceCalibration = 'OVERCONFIDENT';
  } else if (confidenceGap >= 12) {
    confidenceCalibration = 'SLIGHTLY_OVERCONFIDENT';
  } else if (confidenceGap <= -30) {
    confidenceCalibration = 'UNDERCONFIDENT';
  } else if (confidenceGap <= -12) {
    confidenceCalibration = 'SLIGHTLY_UNDERCONFIDENT';
  }

  if (confidenceCalibration.includes('OVERCONFIDENT')) {
    warnings.push('Confidence appears higher than available reliability support.');
  }

  return {
    confidenceCalibration,
    score: clampScore(score),
    evidence,
    warnings,
  };
}
