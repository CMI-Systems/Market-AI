function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function normalizeHistory(history) {
  return Array.isArray(history) ? history.filter((item) => item && typeof item === 'object') : [];
}

function stateOf(item) {
  return String(
    item.failsafeState
    ?? item.tacticalState
    ?? item.behavioralState
    ?? item.state
    ?? item.status
    ?? '',
  ).toUpperCase();
}

function directionOf(state) {
  if (state.includes('BULLISH') || state.includes('RISK_ON') || state.includes('EXPANSION')) return 'RISK_ON';
  if (state.includes('BEARISH') || state.includes('RISK_OFF') || state.includes('AVERSION') || state.includes('FAILURE')) {
    return 'RISK_OFF';
  }
  if (state.includes('CONFLICT') || state.includes('UNCERTAINTY') || state.includes('TRANSITION')) return 'TRANSITION';
  return state || 'UNKNOWN';
}

export function analyzeConsistency(input = {}) {
  const evidence = [];
  const warnings = [];
  const history = normalizeHistory(input?.history);
  let score = 65;

  // Consistency penalizes rapid state or directional flips in recent intelligence history.
  if (history.length < 3) {
    evidence.push('Limited history is available, so consistency confidence is reduced.');
    score -= 12;
  } else {
    const recent = history.slice(-8);
    const directions = recent.map((item) => directionOf(stateOf(item)));
    const flips = directions.slice(1).filter((direction, index) => {
      const previous = directions[index];
      return direction !== previous && direction !== 'UNKNOWN' && previous !== 'UNKNOWN';
    }).length;
    const uniqueDirections = new Set(directions.filter((direction) => direction !== 'UNKNOWN')).size;

    score += Math.max(0, 12 - flips * 4);
    score -= flips * 8;
    score -= Math.max(0, uniqueDirections - 2) * 10;
    evidence.push(`${flips} recent intelligence direction flip(s) detected.`);

    if (flips >= 3) warnings.push('Recent intelligence is flip-flopping across states.');
    if (uniqueDirections >= 4) warnings.push('Recent history contains too many distinct directional states.');
  }

  const finalScore = clampScore(score);
  const consistency = finalScore >= 80
    ? 'HIGHLY_CONSISTENT'
    : finalScore >= 60
      ? 'MODERATELY_CONSISTENT'
      : finalScore >= 35
        ? 'INCONSISTENT'
        : 'HIGHLY_INCONSISTENT';

  return {
    consistency,
    score: finalScore,
    evidence,
    warnings,
  };
}
