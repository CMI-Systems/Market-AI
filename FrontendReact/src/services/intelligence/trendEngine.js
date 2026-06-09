const TREND = {
  BULLISH: 'BULLISH',
  BEARISH: 'BEARISH',
  NEUTRAL: 'NEUTRAL',
};

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function getClose(candle) {
  return toNumber(candle?.close ?? candle?.c);
}

function getHigh(candle) {
  return toNumber(candle?.high ?? candle?.h);
}

function getLow(candle) {
  return toNumber(candle?.low ?? candle?.l);
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

export function analyzeTrend(input = {}) {
  const candles = normalizeCandles(input?.candles);
  const evidence = [];

  if (candles.length < 3) {
    return {
      trend: TREND.NEUTRAL,
      score: 35,
      evidence: ['Insufficient candle history to establish a directional trend.'],
    };
  }

  const closes = candles.map(getClose);
  const firstClose = closes[0];
  const lastClose = closes[closes.length - 1];
  const changePct = firstClose ? ((lastClose - firstClose) / firstClose) * 100 : 0;
  const shortAverage = average(closes.slice(-5)) ?? lastClose;
  const longAverage = average(closes.slice(-20)) ?? average(closes) ?? lastClose;
  const recentCandles = candles.slice(-5);
  const higherLows = recentCandles.filter((candle, index) => {
    if (index === 0) return false;
    return (getLow(candle) ?? 0) > (getLow(recentCandles[index - 1]) ?? 0);
  }).length;
  const lowerHighs = recentCandles.filter((candle, index) => {
    if (index === 0) return false;
    return (getHigh(candle) ?? 0) < (getHigh(recentCandles[index - 1]) ?? 0);
  }).length;

  let bullishPoints = 0;
  let bearishPoints = 0;

  // Direction is anchored on price progress across the available window.
  if (changePct > 1) {
    bullishPoints += 35;
    evidence.push(`Price is up ${changePct.toFixed(2)}% across the analyzed window.`);
  } else if (changePct < -1) {
    bearishPoints += 35;
    evidence.push(`Price is down ${Math.abs(changePct).toFixed(2)}% across the analyzed window.`);
  } else {
    evidence.push('Price change is muted across the analyzed window.');
  }

  // A short average above the longer average supports trend alignment.
  const averageSpreadPct = longAverage ? ((shortAverage - longAverage) / longAverage) * 100 : 0;
  if (averageSpreadPct > 0.35) {
    bullishPoints += 30;
    evidence.push('Short-term average is above the longer-term average.');
  } else if (averageSpreadPct < -0.35) {
    bearishPoints += 30;
    evidence.push('Short-term average is below the longer-term average.');
  } else {
    evidence.push('Short-term and longer-term averages are closely aligned.');
  }

  if (higherLows >= 3) {
    bullishPoints += 20;
    evidence.push('Recent candles show a sequence of higher lows.');
  }

  if (lowerHighs >= 3) {
    bearishPoints += 20;
    evidence.push('Recent candles show a sequence of lower highs.');
  }

  const netBias = bullishPoints - bearishPoints;
  if (netBias >= 20) {
    return {
      trend: TREND.BULLISH,
      score: clampScore(50 + Math.min(50, netBias)),
      evidence,
    };
  }

  if (netBias <= -20) {
    return {
      trend: TREND.BEARISH,
      score: clampScore(50 + Math.min(50, Math.abs(netBias))),
      evidence,
    };
  }

  return {
    trend: TREND.NEUTRAL,
    score: clampScore(45 + Math.min(20, Math.abs(netBias))),
    evidence,
  };
}
