function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function directionalSignal(source) {
  const text = [
    source?.tacticalState,
    source?.trend,
    source?.behavioralState,
    source?.riskAppetite,
    source?.failsafeState,
    source?.riskEscalation,
  ].filter(Boolean).join(' ').toUpperCase();

  if (text.includes('HIGH_RISK') || text.includes('CRITICAL') || text.includes('RISK_ESCALATION')) return 'RISK';
  if (text.includes('BEARISH') || text.includes('RISK_OFF') || text.includes('RISK_AVERSION')) return 'BEARISH';
  if (text.includes('BULLISH') || text.includes('RISK_ON') || text.includes('SPECULATIVE') || text.includes('EXPANSION')) {
    return 'BULLISH';
  }
  return 'NEUTRAL';
}

function confidenceOf(source) {
  const confidence = toNumber(source?.confidence ?? source?.reliability ?? source?.score);
  if (confidence === null) return null;
  return confidence <= 1 ? confidence * 100 : confidence;
}

export function analyzeAlignment(input = {}) {
  const evidence = [];
  const warnings = [];
  const sources = [
    { name: 'tactical', value: input?.tactical },
    { name: 'behavioral', value: input?.behavioral },
    { name: 'failsafe', value: input?.failsafe },
  ];
  const available = sources.filter((source) => source.value && typeof source.value === 'object');

  if (!available.length) {
    return {
      alignment: 'NO_ALIGNMENT',
      score: 35,
      direction: 'NEUTRAL',
      evidence: ['No intelligence sources are available for alignment.'],
      warnings: ['Consensus alignment has no source inputs.'],
    };
  }

  const directions = available.map((source) => ({
    name: source.name,
    direction: directionalSignal(source.value),
    confidence: confidenceOf(source.value),
  }));
  const directionCounts = directions.reduce((counts, item) => {
    counts[item.direction] = (counts[item.direction] || 0) + 1;
    return counts;
  }, {});
  const dominant = Object.entries(directionCounts).sort((a, b) => b[1] - a[1])[0];
  const dominantDirection = dominant?.[0] || 'NEUTRAL';
  const dominantCount = dominant?.[1] || 0;
  const confidenceSpread = directions
    .map((item) => item.confidence)
    .filter((value) => value !== null);
  const spread = confidenceSpread.length >= 2
    ? Math.max(...confidenceSpread) - Math.min(...confidenceSpread)
    : 0;
  let score = 35 + dominantCount * 18;

  evidence.push(`Dominant intelligence direction is ${dominantDirection}.`);
  directions.forEach((item) => {
    evidence.push(`${item.name} direction reads ${item.direction}.`);
  });

  if (available.length < 3) {
    score -= 12;
    warnings.push('Not all intelligence layers are available for consensus alignment.');
  }

  if (spread > 25) {
    score -= 10;
    warnings.push('Source confidence levels diverge materially.');
    evidence.push(`Confidence spread is ${spread.toFixed(1)} points.`);
  }

  const finalScore = clampScore(score);
  const alignment = finalScore >= 82
    ? 'STRONG_ALIGNMENT'
    : finalScore >= 62
      ? 'MODERATE_ALIGNMENT'
      : finalScore >= 42
        ? 'WEAK_ALIGNMENT'
        : 'NO_ALIGNMENT';

  return {
    alignment,
    score: finalScore,
    direction: dominantDirection,
    evidence,
    warnings,
  };
}
