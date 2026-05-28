/*
 * Local diagnostic for deterministic market state evaluation.
 * It uses normalized candle memory and checks contextual state outputs.
 */

const assert = require("assert");
const {
  createCandleEvent
} = require("../providers/shared/marketEvent");
const {
  evaluateMarketState
} = require("../services/stateEngine");

function candle(index, close, range) {
  return createCandleEvent(
    {
      provider: "alpaca",
      source: "historical",
      assetClass: "equity",
      symbol: "NVDA",
      timestamp: `2026-05-22T14:0${index}:00Z`
    },
    {
      timeframe: "1m",
      open: close - 0.1,
      high: close + range / 2,
      low: close - range / 2,
      close,
      volume: 1000 + index
    }
  );
}

function printState(label, state) {
  console.log(`\n${label}`);
  console.log(JSON.stringify(state, null, 2));
}

function run() {
  const bullishContinuation = [
    candle(0, 100, 1),
    candle(1, 100.2, 1),
    candle(2, 100.5, 1),
    candle(3, 101, 1),
    candle(4, 101.8, 1)
  ];
  const weakeningMomentum = [
    candle(0, 100, 1),
    candle(1, 101, 1),
    candle(2, 102, 1),
    candle(3, 102.25, 1),
    candle(4, 102.35, 1)
  ];
  const elevatedVolatility = [
    candle(0, 100, 1),
    candle(1, 100.2, 1),
    candle(2, 100.4, 1),
    candle(3, 100.6, 3),
    candle(4, 100.8, 3.2)
  ];
  const compression = [
    candle(0, 100, 3),
    candle(1, 100.2, 3),
    candle(2, 100.3, 2.8),
    candle(3, 100.35, 0.8),
    candle(4, 100.4, 0.7)
  ];

  const bullishState = evaluateMarketState({
    recentMemory: bullishContinuation
  });
  const weakeningState = evaluateMarketState({
    recentMemory: weakeningMomentum
  });
  const volatilityState = evaluateMarketState({
    recentMemory: elevatedVolatility
  });
  const compressionState = evaluateMarketState({
    recentMemory: compression
  });

  assert.strictEqual(bullishState.directionalBias, "BULLISH");
  assert.strictEqual(bullishState.momentum, "ACCELERATING");
  assert.strictEqual(weakeningState.momentum, "WEAKENING");
  assert.strictEqual(volatilityState.volatility, "EXPANDING");
  assert.strictEqual(compressionState.compression, "COMPRESSED");

  printState("Bullish continuation", bullishState);
  printState("Weakening momentum", weakeningState);
  printState("Elevated volatility", volatilityState);
  printState("Compression", compressionState);
  console.log("\nState engine test passed.");
}

run();
