function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function normalizeHistory(history) {
  return Array.isArray(history) ? history.filter((item) => item && typeof item === 'object') : [];
}

export function analyzeRegimeStability(input = {}) {
  const evidence = [];
  const warnings = [];
  const history = normalizeHistory(input?.history ?? input?.globalScan?.history ?? input?.marketPulse?.history);
  const consensusState = String(input?.consensus?.consensusState || '').toUpperCase();
  const failsafeState = String(input?.failsafe?.failsafeState || '').toUpperCase();
  let stability = 'DEVELOPING';
  let score = 58;

  // Stability watches recent regime changes and current uncertainty pressure.
  if (history.length >= 3) {
    const states = history.slice(-6).map((item) => String(item.regime ?? item.state ?? '').toUpperCase());
    const flips = states.slice(1).filter((state, index) => state && states[index] && state !== states[index]).length;
    score += Math.max(0, 12 - flips * 4);
    score -= flips * 8;
    evidence.push(`${flips} recent regime state change(s) detected.`);

    if (flips >= 3) {
      stability = 'TRANSITIONING';
      warnings.push('Recent regime history is unstable.');
    } else if (flips === 0) {
      stability = 'STABLE';
    }
  } else {
    score -= 10;
    evidence.push('Limited regime history is available.');
  }

  if (consensusState.includes('UNCERTAINTY') || failsafeState.includes('LOW_RELIABILITY')) {
    score -= 12;
    stability = stability === 'STABLE' ? 'DEVELOPING' : 'TRANSITIONING';
    warnings.push('Current uncertainty reduces regime stability.');
  }

  if (stability !== 'TRANSITIONING' && score < 48) {
    stability = 'WEAKENING';
  }

  return {
    stability,
    score: clampScore(score),
    evidence,
    warnings,
  };
}
