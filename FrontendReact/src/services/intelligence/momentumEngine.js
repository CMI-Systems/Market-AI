const MOMENTUM = {
  EXPANDING: 'EXPANDING',
  ACCELERATING: 'ACCELERATING',
  SLOWING: 'SLOWING',
  EXHAUSTING: 'EXHAUSTING',
};

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function getClose(candle) {
  return toNumber(candle?.close ?? candle?.c);
}

function getVolume(candle) {
  return toNumber(candle?.volume ?? candle?.v);
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

function percentChange(from, to) {
  if (!from) return 0;
  return ((to - from) / from) * 100;
}

export function analyzeMomentum(input = {}) {
  const candles = normalizeCandles(input?.candles);
  const evidence = [];

  if (candles.length < 4) {
    return {
      momentum: MOMENTUM.SLOWING,
      score: 35,
      evidence: ['Insufficient candle history to compare recent momentum.'],
    };
  }

  const closes = candles.map(getClose);
  const returns = closes.slice(1).map((close, index) => percentChange(closes[index], close));
  const recentReturns = returns.slice(-3);
  const priorReturns = returns.slice(-8, -3);
  const recentMagnitude = average(recentReturns.map(Math.abs)) ?? 0;
  const priorMagnitude = average(priorReturns.map(Math.abs)) ?? recentMagnitude;
  const latestReturn = returns[returns.length - 1] ?? 0;
  const previousReturn = returns[returns.length - 2] ?? 0;
  const sameDirectionCount = recentReturns.filter((value) => Math.sign(value) === Math.sign(latestReturn) && value !== 0).length;
  const volumes = candles.map(getVolume).filter((volume) => volume !== null);
  const recentVolume = average(volumes.slice(-3));
  const priorVolume = average(volumes.slice(-10, -3));
  const volumeExpanding = recentVolume !== null && priorVolume !== null && recentVolume > priorVolume * 1.15;

  // Momentum focuses on pace: whether recent returns are growing, fading, or stretched.
  if (volumeExpanding) {
    evidence.push('Recent volume is above prior volume, confirming stronger participation.');
  } else if (recentVolume !== null && priorVolume !== null) {
    evidence.push('Recent volume is not meaningfully above prior volume.');
  } else {
    evidence.push('Volume context is unavailable or incomplete.');
  }

  if (recentMagnitude > priorMagnitude * 1.35 && sameDirectionCount >= 2) {
    evidence.push('Recent price movement is expanding versus the prior return window.');
    return {
      momentum: MOMENTUM.ACCELERATING,
      score: clampScore(70 + Math.min(25, recentMagnitude * 3) + (volumeExpanding ? 5 : 0)),
      evidence,
    };
  }

  if (recentMagnitude > priorMagnitude * 1.1 || volumeExpanding) {
    evidence.push('Recent movement is broadening but not yet strongly accelerating.');
    return {
      momentum: MOMENTUM.EXPANDING,
      score: clampScore(60 + Math.min(25, recentMagnitude * 2) + (volumeExpanding ? 5 : 0)),
      evidence,
    };
  }

  if (Math.abs(latestReturn) < Math.abs(previousReturn) * 0.6 && Math.abs(previousReturn) > 0.25) {
    evidence.push('Latest return is materially smaller than the prior return.');
    return {
      momentum: MOMENTUM.EXHAUSTING,
      score: clampScore(58 + Math.min(32, Math.abs(previousReturn - latestReturn) * 4)),
      evidence,
    };
  }

  evidence.push('Recent movement is fading versus the prior return window.');
  return {
    momentum: MOMENTUM.SLOWING,
    score: clampScore(50 + Math.min(30, Math.max(0, priorMagnitude - recentMagnitude) * 5)),
    evidence,
  };
}
