const RELATIVE_STRENGTH = {
  LEADING: 'LEADING',
  LAGGING: 'LAGGING',
  MARKET_PERFORMING: 'MARKET_PERFORMING',
};

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function getClose(candle) {
  return toNumber(candle?.close ?? candle?.c);
}

function normalizeCandles(candles) {
  return Array.isArray(candles)
    ? candles.filter((candle) => getClose(candle) !== null)
    : [];
}

function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function windowReturn(candles) {
  if (candles.length < 2) return null;
  const firstClose = getClose(candles[0]);
  const lastClose = getClose(candles[candles.length - 1]);
  if (!firstClose || lastClose === null) return null;
  return ((lastClose - firstClose) / firstClose) * 100;
}

function getSectorReturn(sectorContext) {
  const direct = toNumber(sectorContext?.returnPct ?? sectorContext?.performancePct ?? sectorContext?.changePct);
  return direct;
}

export function analyzeRelativeStrength(input = {}) {
  const candles = normalizeCandles(input?.candles);
  const benchmarkCandles = normalizeCandles(input?.benchmarkCandles);
  const sectorReturn = getSectorReturn(input?.sectorContext);
  const evidence = [];

  if (candles.length < 2) {
    return {
      relativeStrength: RELATIVE_STRENGTH.MARKET_PERFORMING,
      score: 35,
      evidence: ['Insufficient symbol history to evaluate relative strength.'],
    };
  }

  const symbolReturn = windowReturn(candles);
  const benchmarkReturn = windowReturn(benchmarkCandles);
  const comparisonReturns = [benchmarkReturn, sectorReturn].filter((value) => value !== null);

  if (!comparisonReturns.length || symbolReturn === null) {
    return {
      relativeStrength: RELATIVE_STRENGTH.MARKET_PERFORMING,
      score: 50,
      evidence: ['Benchmark and sector context are unavailable, so relative strength defaults to market-performing.'],
    };
  }

  const comparisonReturn = comparisonReturns.reduce((sum, value) => sum + value, 0) / comparisonReturns.length;
  const spread = symbolReturn - comparisonReturn;

  // Relative strength compares symbol return to available benchmark and sector context.
  if (spread >= 1) {
    evidence.push(`Symbol is outperforming comparison context by ${spread.toFixed(2)}%.`);
    return {
      relativeStrength: RELATIVE_STRENGTH.LEADING,
      score: clampScore(60 + Math.min(35, spread * 5)),
      evidence,
    };
  }

  if (spread <= -1) {
    evidence.push(`Symbol is underperforming comparison context by ${Math.abs(spread).toFixed(2)}%.`);
    return {
      relativeStrength: RELATIVE_STRENGTH.LAGGING,
      score: clampScore(60 + Math.min(35, Math.abs(spread) * 5)),
      evidence,
    };
  }

  evidence.push('Symbol performance is close to available comparison context.');
  return {
    relativeStrength: RELATIVE_STRENGTH.MARKET_PERFORMING,
    score: clampScore(52 + Math.min(20, Math.abs(spread) * 4)),
    evidence,
  };
}
