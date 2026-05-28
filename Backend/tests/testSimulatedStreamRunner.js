/*
 * Local diagnostic for the simulated stream runner.
 * It uses fake events only and prevents test-only Shadow Training dataset writes.
 */

const {
  startSimulatedStream
} = require("../services/simulatedStreamRunner");
const {
  clearTestSandbox,
  withTestSandbox
} = require("../services/testSandbox");

async function run() {
  await withTestSandbox(async () => {
    clearTestSandbox();
    const stream = startSimulatedStream({
      symbol: "NVDA",
      provider: "simulated",
      intervalMs: 250,
      maxEvents: 3,
      systemContext: {
        mode: "shadow-test"
      }
    });

    await stream.completed;
    clearTestSandbox();
    console.log("Simulated stream runner test completed.");
  });
}

run().catch((error) => {
  console.error("Simulated stream runner test failed.", error);
  process.exitCode = 1;
});
