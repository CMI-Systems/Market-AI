const STRUCTURE = {
  BREAKOUT: 'BREAKOUT',
  BREAKDOWN: 'BREAKDOWN',
  RANGE: 'RANGE',
  COMPRESSION: 'COMPRESSION',
  EXPANSION: 'EXPANSION',
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

function rangePct(candles) {
  if (!candles.length) return 0;
  const highs = candles.map(getHigh).filter((value) => value !== null);
  const lows = candles.map(getLow).filter((value) => value !== null);
  const closes = candles.map(getClose);
  const base = average(closes) ?? closes[closes.length - 1] ?? 1;
  if (!highs.length || !lows.length || !base) return 0;
  return ((Math.max(...highs) - Math.min(...lows)) / base) * 100;
}

export function analyzeStructure(input = {}) {
  const candles = normalizeCandles(input?.candles);
  const evidence = [];

  if (candles.length < 5) {
    return {
      structure: STRUCTURE.RANGE,
      score: 35,
      evidence: ['Insufficient candle history to identify market structure.'],
    };
  }

  const priorCandles = candles.slice(0, -1);
  const recentCandles = candles.slice(-5);
  const lastCandle = candles[candles.length - 1];
  const lastClose = getClose(lastCandle);
  const priorHigh = Math.max(...priorCandles.map(getHigh).filter((value) => value !== null));
  const priorLow = Math.min(...priorCandles.map(getLow).filter((value) => value !== null));
  const recentRange = rangePct(recentCandles);
  const priorRange = rangePct(candles.slice(-15, -5));

  // Structure describes location relative to the recent range and whether range is changing.
  if (Number.isFinite(priorHigh) && lastClose > priorHigh) {
    evidence.push('Latest close is above the prior observed high.');
    return {
      structure: STRUCTURE.BREAKOUT,
      score: clampScore(72 + Math.min(25, ((lastClose - priorHigh) / priorHigh) * 100 * 4)),
      evidence,
    };
  }

  if (Number.isFinite(priorLow) && lastClose < priorLow) {
    evidence.push('Latest close is below the prior observed low.');
    return {
      structure: STRUCTURE.BREAKDOWN,
      score: clampScore(72 + Math.min(25, ((priorLow - lastClose) / priorLow) * 100 * 4)),
      evidence,
    };
  }

  if (priorRange > 0 && recentRange < priorRange * 0.65) {
    evidence.push('Recent range has compressed versus the prior range.');
    return {
      structure: STRUCTURE.COMPRESSION,
      score: clampScore(62 + Math.min(30, priorRange - recentRange)),
      evidence,
    };
  }

  if (priorRange > 0 && recentRange > priorRange * 1.35) {
    evidence.push('Recent range has expanded versus the prior range.');
    return {
      structure: STRUCTURE.EXPANSION,
      score: clampScore(62 + Math.min(30, recentRange - priorRange)),
      evidence,
    };
  }

  evidence.push('Price remains inside the observed recent range.');
  return {
    structure: STRUCTURE.RANGE,
    score: 55,
    evidence,
  };
}
