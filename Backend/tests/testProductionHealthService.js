const assert = require("assert");
const { buildProductionHealth } = require("../services/productionHealthService");

const health = buildProductionHealth({
  config: {
    nodeEnv: "test",
    port: 3001,
    autoSim: false,
    mode: "test",
    dataDir: "test-data",
    logLevel: "silent",
    enablePersistence: true,
    enableCognitionArchive: true,
    warnings: []
  }
});

assert(["HEALTHY", "DEGRADED"].includes(health.status));
assert(Number.isFinite(health.uptimeMs));
assert(health.memory.heapUsedMb >= 0);
assert.strictEqual(health.runtimeMode, "test");
assert(health.routes.apiV1Health);
assert(!JSON.stringify(health).toLowerCase().includes("secret"));

console.log("Production health service test passed.");
