/*
 * Local diagnostic for rolling Brain Memory behavior.
 * It stores normalized candle events only and confirms invalid events are rejected.
 */

const assert = require("assert");
const {
  createCandleEvent
} = require("../providers/shared/marketEvent");
const {
  addMemoryEvent,
  clearMemory,
  getMemoryStats,
  getRecentMemory
} = require("../services/brain/brainMemory");

function createNvdaCandle(index) {
  return createCandleEvent(
    {
      provider: "alpaca",
      source: "historical",
      assetClass: "equity",
      symbol: "NVDA",
      timestamp: `2026-05-22T13:3${index}:00Z`
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
}

function run() {
  clearMemory();

  addMemoryEvent(createNvdaCandle(0), {
    maxEventsPerSymbol: 3
  });
  addMemoryEvent(createNvdaCandle(1), {
    maxEventsPerSymbol: 3
  });
  addMemoryEvent(createNvdaCandle(2), {
    maxEventsPerSymbol: 3
  });
  addMemoryEvent(createNvdaCandle(3), {
    maxEventsPerSymbol: 3
  });

  const recent = getRecentMemory({
    symbol: "NVDA",
    timeframe: "1m",
    limit: 2
  });
  const allStored = getRecentMemory({
    symbol: "NVDA",
    timeframe: "1m"
  });
  const invalid = addMemoryEvent({
    provider: "alpaca",
    S: "NVDA"
  });
  const stats = getMemoryStats();

  assert.strictEqual(allStored.length, 3, "Rolling memory should keep the newest 3 events.");
  assert.strictEqual(recent.length, 2, "Recent memory should obey retrieval limits.");
  assert.strictEqual(
    allStored[0].timestamp,
    createNvdaCandle(1).timestamp,
    "Oldest stored event should expire when the limit is exceeded."
  );
  assert.strictEqual(invalid.accepted, false, "Invalid events should be rejected safely.");
  assert.strictEqual(stats.totalSymbolsTracked, 1);
  assert.strictEqual(stats.totalEventsStored, 3);

  console.log(JSON.stringify(stats, null, 2));
  console.log("Brain memory test passed.");
}

run();
