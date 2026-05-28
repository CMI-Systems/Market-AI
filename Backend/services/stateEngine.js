/*
 * Deterministic market state interpretation over recent normalized memory.
 * This layer describes context only and does not create trade recommendations.
 */

function getCandles(recentMemory = []) {
  return recentMemory.filter((event) => {
    return event?.eventType === "candle" &&
      typeof event.candle?.close === "number" &&
      typeof event.candle?.high === "number" &&
      typeof event.candle?.low === "number";
  });
}

function getCloses(candles) {
  return candles.map(candle => candle.candle.close);
}

function getRanges(candles) {
  return candles.map(candle => candle.candle.high - candle.candle.low);
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function deltas(values) {
  const changes = [];

  for (let index = 1; index < values.length; index += 1) {
    changes.push(values[index] - values[index - 1]);
  }

  return changes;
}

function detectDirectionalBias({ recentMemory } = {}) {
  const candles = getCandles(recentMemory);

  if (candles.length < 3) {
    return "UNKNOWN";
  }

  const closeChanges = deltas(getCloses(candles));
  const positiveChanges = closeChanges.filter(change => change > 0).length;
  const negativeChanges = closeChanges.filter(change => change < 0).length;

  if (positiveChanges >= Math.ceil(closeChanges.length * 0.7)) {
    return "BULLISH";
  }

  if (negativeChanges >= Math.ceil(closeChanges.length * 0.7)) {
    return "BEARISH";
  }

  return "NEUTRAL";
}

function detectMomentumState({ recentMemory } = {}) {
  const candles = getCandles(recentMemory);

  if (candles.length < 4) {
    return "UNKNOWN";
  }

  const closeChanges = deltas(getCloses(candles));
  const earlyChanges = closeChanges.slice(0, Math.ceil(closeChanges.length / 2));
  const recentChanges = closeChanges.slice(Math.ceil(closeChanges.length / 2));
  const earlyAverage = average(earlyChanges);
  const recentAverage = average(recentChanges);
  const directionChanged = earlyAverage !== 0 &&
    recentAverage !== 0 &&
    Math.sign(earlyAverage) !== Math.sign(recentAverage);

  if (directionChanged) {
    return "REVERSING";
  }

  if (Math.abs(recentAverage) > Math.abs(earlyAverage) * 1.2) {
    return "ACCELERATING";
  }

  if (Math.abs(recentAverage) < Math.abs(earlyAverage) * 0.65) {
    return "WEAKENING";
  }

  return "STABLE";
}

function detectVolatilityState({ recentMemory } = {}) {
  const candles = getCandles(recentMemory);

  if (candles.length < 4) {
    return "UNKNOWN";
  }

  const ranges = getRanges(candles);
  const splitIndex = Math.ceil(ranges.length / 2);
  const earlyAverage = average(ranges.slice(0, splitIndex));
  const recentAverage = average(ranges.slice(splitIndex));
  const overallAverage = average(ranges);

  if (earlyAverage > 0 && recentAverage > earlyAverage * 1.5) {
    return "EXPANDING";
  }

  if (recentAverage > overallAverage * 1.25) {
    return "ELEVATED";
  }

  if (recentAverage < overallAverage * 0.7) {
    return "LOW";
  }

  return "NORMAL";
}

function detectCompressionExpansion({ recentMemory } = {}) {
  const candles = getCandles(recentMemory);

  if (candles.length < 4) {
    return "UNKNOWN";
  }

  const ranges = getRanges(candles);
  const splitIndex = Math.ceil(ranges.length / 2);
  const earlyAverage = average(ranges.slice(0, splitIndex));
  const recentAverage = average(ranges.slice(splitIndex));

  if (earlyAverage > 0 && recentAverage < earlyAverage * 0.65) {
    return "COMPRESSED";
  }

  if (earlyAverage > 0 && recentAverage > earlyAverage * 1.35) {
    return "EXPANDING";
  }

  return "NORMAL";
}

function evaluateMarketState({ recentMemory } = {}) {
  return {
    momentum: detectMomentumState({ recentMemory }),
    volatility: detectVolatilityState({ recentMemory }),
    directionalBias: detectDirectionalBias({ recentMemory }),
    compression: detectCompressionExpansion({ recentMemory })
  };
}

module.exports = {
  detectCompressionExpansion,
  detectDirectionalBias,
  detectMomentumState,
  detectVolatilityState,
  evaluateMarketState
};
