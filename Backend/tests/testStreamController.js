/*
 * Local diagnostic for stream controller behavior.
 * It checks simulated stream orchestration and provider placeholders.
 */

const assert = require("assert");
const {
  startStream
} = require("../services/streamController");
const {
  clearTestSandbox,
  withTestSandbox
} = require("../services/testSandbox");

async function run() {
  await withTestSandbox(async () => {
    clearTestSandbox();
    const simulated = startStream({
      source: "simulated",
      symbol: "NVDA",
      intervalMs: 250,
      maxEvents: 3,
      systemContext: {
        mode: "shadow-test"
      }
    });

    assert.strictEqual(simulated.started, true, "Simulated stream should start.");
    assert(simulated.stream, "Simulated stream should return a stream handle.");
    await simulated.stream.completed;

    const webull = startStream({
      source: "webull"
    });
    assert.deepStrictEqual(webull, {
      started: false,
      source: "webull",
      reason: "provider_stream_not_connected_yet"
    });

    const alpaca = startStream({
      source: "alpaca"
    });
    assert.deepStrictEqual(alpaca, {
      started: false,
      source: "alpaca",
      reason: "provider_stream_not_connected_yet"
    });

    console.log("Stream controller test completed.");
    clearTestSandbox();
  });
}

run().catch((error) => {
  console.error("Stream controller test failed.", error);
  process.exitCode = 1;
});
