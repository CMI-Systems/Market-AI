const VOLATILITY = {
  CONTROLLED: 'CONTROLLED',
  ELEVATED: 'ELEVATED',
  EXTREME: 'EXTREME',
  COMPRESSED: 'COMPRESSED',
};

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function getClose(candle) {
  return toNumber(candle?.close ?? candle?.c);
}

function getHigh(candle) {
  return toNumber(candle?.high ?? candle?.h ?? candle?.close ?? candle?.c);
}

function getLow(candle) {
  return toNumber(candle?.low ?? candle?.l ?? candle?.close ?? candle?.c);
}

function normalizeCandles(candles) {
  return Array.isArray(candles)
    ? candles.filter((candle) => getClose(candle) !== null)
    : [];
}

function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function average(values) {
  const valid = values.filter((value) => Number.isFinite(value));
  if (!valid.length) return null;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function candleRangePct(candle) {
  const high = getHigh(candle);
  const low = getLow(candle);
  const close = getClose(candle);
  if (!high || !low || !close) return null;
  return ((high - low) / close) * 100;
}

export function analyzeVolatility(input = {}) {
  const candles = normalizeCandles(input?.candles);
  const evidence = [];

  if (candles.length < 3) {
    return {
      volatility: VOLATILITY.CONTROLLED,
      score: 35,
      evidence: ['Insufficient candle history to classify volatility.'],
    };
  }

  const ranges = candles.map(candleRangePct).filter((range) => range !== null);
  const recentRange = average(ranges.slice(-5)) ?? 0;
  const baselineRange = average(ranges.slice(-20)) ?? recentRange;

  // Volatility is classified by absolute range and current range versus baseline.
  if (recentRange >= 5 || (baselineRange > 0 && recentRange > baselineRange * 2.2)) {
    evidence.push('Recent candle ranges are extremely wide versus normal behavior.');
    return {
      volatility: VOLATILITY.EXTREME,
      score: clampScore(78 + Math.min(22, recentRange * 2)),
      evidence,
    };
  }

  if (recentRange >= 2.5 || (baselineRange > 0 && recentRange > baselineRange * 1.35)) {
    evidence.push('Recent candle ranges are elevated versus baseline.');
    return {
      volatility: VOLATILITY.ELEVATED,
      score: clampScore(62 + Math.min(28, recentRange * 3)),
      evidence,
    };
  }

  if (baselineRange > 0 && recentRange < baselineRange * 0.6) {
    evidence.push('Recent candle ranges are compressed versus baseline.');
    return {
      volatility: VOLATILITY.COMPRESSED,
      score: clampScore(58 + Math.min(30, baselineRange - recentRange)),
      evidence,
    };
  }

  evidence.push('Recent candle ranges are stable and controlled.');
  return {
    volatility: VOLATILITY.CONTROLLED,
    score: clampScore(58 + Math.min(22, Math.max(0, 2.5 - recentRange) * 4)),
    evidence,
  };
}
