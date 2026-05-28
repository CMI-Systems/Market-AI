/*
 * Local smoke test for the 3-brain and Shadow Training pipeline.
 * Run this directly with Node while developing backend brain contracts.
 */

const assert = require("assert");
const {
  createCandleEvent
} = require("../providers/shared/marketEvent");
const {
  superviseBrains
} = require("../services/brain/brainSupervisor");
const {
  clearTestSandbox,
  withTestSandbox
} = require("../services/testSandbox");

function printSection(title, output) {
  console.log(`\n${title}`);
  console.log(JSON.stringify(output, null, 2));
}

function runValidNormalizedEventTest() {
  // Provider adapters should create this normalized event before brains see it.
  const marketEvent = createCandleEvent(
    {
      provider: "alpaca",
      source: "stream",
      assetClass: "equity",
      symbol: "NVDA",
      timestamp: "2026-05-21T13:35:00Z"
    },
    {
      timeframe: "1m",
      open: 100,
      high: 101,
      low: 99,
      close: 100.5,
      volume: 1500
    }
  );

  const output = superviseBrains({
    marketEvent,
    userContext: {},
    journalContext: {},
    systemContext: {
      mode: "shadow"
    }
  });

  assert(output.tacticalBrain, "tacticalBrain should run.");
  assert(output.behavioralRiskBrain, "behavioralRiskBrain should run.");
  assert.strictEqual(
    output.failsafeBrain.status,
    "STANDBY",
    "failsafeBrain should stay on standby for valid normalized data."
  );
  assert(output.shadowTraining, "shadowTraining metadata should exist.");

  printSection("Valid normalized market event output", output);
}

function runInvalidRawProviderDataTest() {
  // Raw provider payloads must never become brain inputs directly.
  const invalidRawProviderData = {
    provider: "alpaca",
    S: "NVDA",
    p: 100.5
  };

  const output = superviseBrains({
    marketEvent: invalidRawProviderData,
    userContext: {},
    journalContext: {},
    systemContext: {}
  });

  assert.strictEqual(
    output.failsafeBrain.status,
    "ACTIVE",
    "failsafeBrain should activate for invalid raw provider data."
  );
  assert.strictEqual(
    output.finalDecision.actionBias,
    "NO_TRADE",
    "invalid market input must degrade finalDecision to NO_TRADE."
  );

  printSection("Invalid raw provider data output", output);
}

function run() {
  withTestSandbox(() => {
    clearTestSandbox();
    runValidNormalizedEventTest();
    runInvalidRawProviderDataTest();
    clearTestSandbox();
    console.log("\nBrain + Shadow Training pipeline test passed.");
  });
}

run();
