/*
 * Local diagnostic for the Live Stream Ingestion Layer.
 * It checks valid normalized events and rejects raw provider-like data safely.
 */

const assert = require("assert");
const {
  createTradeEvent
} = require("../providers/shared/marketEvent");
const {
  ingestMarketEvent
} = require("../services/liveIngestion");
const {
  clearTestSandbox,
  withTestSandbox
} = require("../services/testSandbox");

function testValidNormalizedEvent() {
  const marketEvent = createTradeEvent(
    {
      provider: "webull",
      source: "stream",
      assetClass: "equity",
      symbol: "NVDA",
      timestamp: "2026-05-21T13:40:00Z"
    },
    {
      price: 101.5,
      size: 10,
      side: "BUY"
    }
  );

  const result = ingestMarketEvent({
    marketEvent,
    userContext: {},
    journalContext: {},
    systemContext: {
      mode: "shadow"
    }
  });

  assert.strictEqual(result.accepted, true, "Valid normalized event should be accepted.");
  assert.strictEqual(result.status, "PROCESSED", "Valid event should be processed.");
  assert(result.brainOutput, "Processed event should include brain output.");
  assert(
    result.brainOutput.shadowTraining,
    "Brain output should include Shadow Training metadata when provided."
  );

  console.log("Valid normalized ingestion passed.");
}

function testInvalidRawProviderData() {
  const result = ingestMarketEvent({
    marketEvent: {
      provider: "alpaca",
      S: "NVDA",
      p: 101.5
    }
  });

  assert.strictEqual(result.accepted, false, "Raw provider data should be rejected.");
  assert.strictEqual(result.status, "REJECTED", "Invalid data should be rejected.");

  console.log("Invalid raw provider ingestion rejected safely.");
}

function run() {
  withTestSandbox(() => {
    clearTestSandbox();
    testValidNormalizedEvent();
    testInvalidRawProviderData();
    clearTestSandbox();
    console.log("Live ingestion diagnostic passed.");
  });
}

run();
