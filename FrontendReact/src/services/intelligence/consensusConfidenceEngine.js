function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function getConfidenceLabel(confidence) {
  if (confidence >= 85) return 'VERY_HIGH';
  if (confidence >= 70) return 'HIGH';
  if (confidence >= 55) return 'MODERATE';
  if (confidence >= 40) return 'LOW';
  return 'VERY_LOW';
}

export function analyzeConsensusConfidence(input = {}) {
  const evidence = [];
  const warnings = [];
  const alignmentScore = toNumber(input?.alignment?.score) ?? 35;
  const weightingScore = toNumber(input?.weighting?.score) ?? 45;
  const synthesisScore = toNumber(input?.synthesis?.score) ?? 45;
  const riskModifier = toNumber(input?.weighting?.riskModifier) ?? 1;
  let confidence = (
    alignmentScore * 0.35
    + weightingScore * 0.4
    + synthesisScore * 0.25
  );

  // Confidence summarizes source agreement, weighted source confidence, and synthesis clarity.
  if (riskModifier < 1) {
    confidence *= riskModifier;
    warnings.push('Failsafe risk modifier reduced consensus confidence.');
  }

  if (input?.alignment?.alignment === 'NO_ALIGNMENT') {
    confidence = Math.min(confidence, 39);
    warnings.push('No source alignment caps consensus confidence.');
  }

  const finalConfidence = clampScore(confidence);
  evidence.push(`Alignment score contributes ${alignmentScore}.`);
  evidence.push(`Weighted source confidence contributes ${weightingScore}.`);
  evidence.push(`Synthesis clarity contributes ${synthesisScore}.`);

  return {
    confidence: finalConfidence,
    confidenceLabel: getConfidenceLabel(finalConfidence),
    score: finalConfidence,
    evidence,
    warnings,
  };
}
