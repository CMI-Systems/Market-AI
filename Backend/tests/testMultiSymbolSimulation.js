const assert = require("assert");
const {
  assertNormalizedMarketEvent
} = require("../providers/shared/marketEvent");
const {
  buildWatchlistEndpoint,
  clearLatestCognitionSnapshot
} = require("../services/cognitionSnapshotStore");
const {
  DEFAULT_SIMULATED_WATCHLIST,
  createSimulatedTradeEvent,
  normalizeSymbols,
  startSimulatedStream
} = require("../services/simulatedStreamRunner");
const {
  ingestMarketEvent
} = require("../services/liveIngestion");
const {
  clearTestSandbox,
  withTestSandbox
} = require("../services/testSandbox");

async function runStream(options) {
  const stream = startSimulatedStream(options);
  const completion = await stream.completed;

  return {
    completion,
    status: stream.status
  };
}

async function run() {
  await withTestSandbox(async () => {
    clearTestSandbox();
    clearLatestCognitionSnapshot();

    assert.deepStrictEqual(
      normalizeSymbols({
        symbols: ["NVDA", "AMD", "NVDA", "tsm"]
      }),
      ["NVDA", "AMD", "TSM"]
    );
    assert.deepStrictEqual(normalizeSymbols({}), DEFAULT_SIMULATED_WATCHLIST);
    assert.deepStrictEqual(normalizeSymbols({ symbol: "NVDA" }), ["NVDA"]);

    const normalizedEvent = createSimulatedTradeEvent({
      symbol: "NVDA",
      provider: "simulated",
      eventNumber: 1
    });
    assert.strictEqual(assertNormalizedMarketEvent(normalizedEvent).schemaVersion, "market-event.v1");

    const single = await runStream({
      source: "simulated",
      symbol: "NVDA",
      intervalMs: 1,
      maxEvents: 1,
      systemContext: {
        mode: "closed-market-sim"
      }
    });
    assert.strictEqual(single.completion.emittedEvents, 1);
    assert.strictEqual(single.status.symbol, "NVDA");
    assert.deepStrictEqual(single.status.symbols, ["NVDA"]);
    assert.deepStrictEqual(buildWatchlistEndpoint().prioritizedSymbols, []);

    const multi = await runStream({
      source: "simulated",
      symbols: ["NVDA", "AMD", "TSM"],
      intervalMs: 1,
      maxEvents: 4,
      systemContext: {
        mode: "closed-market-sim"
      }
    });
    assert.strictEqual(multi.completion.emittedEvents, 4);
    assert.strictEqual(multi.status.symbol, "NVDA");
    assert.deepStrictEqual(multi.status.symbols, ["NVDA", "AMD", "TSM"]);

    const watchlist = buildWatchlistEndpoint();
    assert.notStrictEqual(watchlist.summary, "Awaiting watchlist ecosystem cognition.");
    assert(watchlist.prioritizedSymbols.length >= 2);
    assert(watchlist.groupedContexts.length >= 1);

    const closedMarketEvent = createSimulatedTradeEvent({
      symbol: "MSFT",
      provider: "simulated",
      eventNumber: 20
    });
    const closedMarketResult = ingestMarketEvent({
      marketEvent: closedMarketEvent,
      systemContext: {
        mode: "closed-market-sim",
        marketOpen: false
      }
    });
    assert.strictEqual(closedMarketResult.accepted, true);
    assert.strictEqual(closedMarketResult.brainOutput.persistedJournal.saved, false);
    assert.strictEqual(closedMarketResult.brainOutput.strategicSnapshot.id, null);
    assert.strictEqual(closedMarketResult.brainOutput.shadowTraining.logged, false);

    clearTestSandbox();
    console.log("Multi-symbol simulation test passed.");
  });
}

run().catch((error) => {
  console.error("Multi-symbol simulation test failed.", error);
  process.exitCode = 1;
});
