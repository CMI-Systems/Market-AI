function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function analyzeVolatilityContext(input = {}) {
  const evidence = [];
  const warnings = [];
  const tacticalVolatility = String(input?.tactical?.volatility || '').toUpperCase();
  const pulseVolatility = toNumber(
    input?.marketPulse?.volatility
    ?? input?.marketPulse?.volatilityIndex
    ?? input?.globalScan?.volatility
    ?? input?.globalScan?.volatilityIndex,
  );
  let score = 55;
  let volatilityContext = 'CONTROLLED_VOLATILITY';

  // Volatility context blends Tactical Brain state with pulse/global volatility readings.
  if (tacticalVolatility.includes('EXTREME') || (pulseVolatility !== null && pulseVolatility >= 80)) {
    volatilityContext = 'EXTREME_VOLATILITY';
    score = 85;
    evidence.push('Tactical or global volatility context is extreme.');
  } else if (tacticalVolatility.includes('ELEVATED') || (pulseVolatility !== null && pulseVolatility >= 60)) {
    volatilityContext = 'ELEVATED_VOLATILITY';
    score = 70;
    evidence.push('Volatility context is elevated.');
  } else if (tacticalVolatility.includes('COMPRESSED') || (pulseVolatility !== null && pulseVolatility <= 30)) {
    volatilityContext = 'COMPRESSED_VOLATILITY';
    score = 62;
    evidence.push('Volatility context is compressed.');
  } else {
    evidence.push('Volatility context is controlled.');
  }

  if (!tacticalVolatility && pulseVolatility === null) {
    score -= 15;
    warnings.push('Volatility inputs are limited.');
    evidence.push('Volatility classification used safe defaults.');
  }

  return {
    volatilityContext,
    score: clampScore(score),
    evidence,
    warnings,
  };
}
