const LIQUIDITY = {
  STRONG: 'STRONG',
  MODERATE: 'MODERATE',
  WEAK: 'WEAK',
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

function getSpreadPct(quote) {
  const bid = toNumber(quote?.bidPrice ?? quote?.bp ?? quote?.bid);
  const ask = toNumber(quote?.askPrice ?? quote?.ap ?? quote?.ask);
  if (!bid || !ask || ask < bid) return null;
  return ((ask - bid) / ((ask + bid) / 2)) * 100;
}

export function analyzeLiquidity(input = {}) {
  const candles = normalizeCandles(input?.candles);
  const quote = input?.quote ?? {};
  const evidence = [];
  const volumes = candles.map(getVolume).filter((volume) => volume !== null);
  const recentVolume = average(volumes.slice(-5));
  const baselineVolume = average(volumes.slice(-20));
  const spreadPct = getSpreadPct(quote);
  let score = 50;

  // Liquidity is inferred from participation and quoted spread when available.
  if (recentVolume !== null && baselineVolume !== null && baselineVolume > 0) {
    const volumeRatio = recentVolume / baselineVolume;
    if (volumeRatio >= 1.2) {
      score += 25;
      evidence.push('Recent volume is above its baseline.');
    } else if (volumeRatio <= 0.6) {
      score -= 25;
      evidence.push('Recent volume is materially below its baseline.');
    } else {
      evidence.push('Recent volume is near its baseline.');
    }
  } else {
    score -= 10;
    evidence.push('Volume history is unavailable or incomplete.');
  }

  if (spreadPct !== null) {
    if (spreadPct <= 0.08) {
      score += 20;
      evidence.push('Quoted spread is tight.');
    } else if (spreadPct >= 0.35) {
      score -= 25;
      evidence.push('Quoted spread is wide.');
    } else {
      evidence.push('Quoted spread is moderate.');
    }
  } else {
    score -= 5;
    evidence.push('Quote spread is unavailable or malformed.');
  }

  const finalScore = clampScore(score);
  if (finalScore >= 70) {
    return { liquidity: LIQUIDITY.STRONG, score: finalScore, evidence };
  }

  if (finalScore <= 40) {
    return { liquidity: LIQUIDITY.WEAK, score: finalScore, evidence };
  }

  return { liquidity: LIQUIDITY.MODERATE, score: finalScore, evidence };
}
