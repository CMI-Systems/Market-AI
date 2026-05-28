/*
 * Local diagnostic for deterministic regime classification.
 * It uses market state objects and normalized candle memory only.
 */

const assert = require("assert");
const {
  createCandleEvent
} = require("../providers/shared/marketEvent");
const {
  evaluateRegime
} = require("../services/regimeEngine");

function memory(label) {
  return Array.from({ length: 6 }, (_, index) => {
    return createCandleEvent(
      {
        provider: "alpaca",
        source: "historical",
        assetClass: "equity",
        symbol: label,
        timestamp: `2026-05-22T15:0${index}:00Z`
      },
      {
        timeframe: "1m",
        open: 100 + index,
        high: 101 + index,
        low: 99 + index,
        close: 100.5 + index,
        volume: 1000 + index
      }
    );
  });
}

function printRegime(label, regime) {
  console.log(`\n${label}`);
  console.log(JSON.stringify(regime, null, 2));
}

function run() {
  const bullish = evaluateRegime({
    marketState: {
      momentum: "ACCELERATING",
      volatility: "NORMAL",
      directionalBias: "BULLISH",
      compression: "NORMAL"
    },
    recentMemory: memory("BULL")
  });
  const bearish = evaluateRegime({
    marketState: {
      momentum: "STABLE",
      volatility: "NORMAL",
      directionalBias: "BEARISH",
      compression: "NORMAL"
    },
    recentMemory: memory("BEAR")
  });
  const ranging = evaluateRegime({
    marketState: {
      momentum: "WEAKENING",
      volatility: "NORMAL",
      directionalBias: "NEUTRAL",
      compression: "NORMAL"
    },
    recentMemory: memory("RANGE")
  });
  const highVolatility = evaluateRegime({
    marketState: {
      momentum: "STABLE",
      volatility: "EXPANDING",
      directionalBias: "NEUTRAL",
      compression: "EXPANDING"
    },
    recentMemory: memory("VOL")
  });
  const breakoutAttempt = evaluateRegime({
    marketState: {
      momentum: "STABLE",
      volatility: "NORMAL",
      directionalBias: "NEUTRAL",
      compression: "COMPRESSED"
    },
    recentMemory: memory("BREAK")
  });
  const reversalRisk = evaluateRegime({
    marketState: {
      momentum: "REVERSING",
      volatility: "NORMAL",
      directionalBias: "BULLISH",
      compression: "NORMAL"
    },
    recentMemory: memory("REV")
  });

  assert.strictEqual(bullish.type, "TRENDING_BULLISH");
  assert.strictEqual(bearish.type, "TRENDING_BEARISH");
  assert.strictEqual(ranging.type, "RANGING");
  assert.strictEqual(highVolatility.type, "HIGH_VOLATILITY");
  assert.strictEqual(breakoutAttempt.type, "BREAKOUT_ATTEMPT");
  assert.strictEqual(reversalRisk.type, "REVERSAL_RISK");

  printRegime("Bullish trending", bullish);
  printRegime("Bearish trending", bearish);
  printRegime("Choppy or ranging", ranging);
  printRegime("High volatility", highVolatility);
  printRegime("Compression breakout attempt", breakoutAttempt);
  printRegime("Reversal risk", reversalRisk);
  console.log("\nRegime engine test passed.");
}

run();
