const assert = require("assert");
const { loadEnvironmentConfig } = require("../config/environment");

const config = loadEnvironmentConfig({
  NODE_ENV: "production",
  PORT: "4555",
  MARKET_AI_AUTO_SIM: "true",
  MARKET_AI_MODE: "shadow",
  MARKET_AI_DATA_DIR: "C:\\safe\\data",
  MARKET_AI_LOG_LEVEL: "debug",
  MARKET_AI_ENABLE_PERSISTENCE: "true",
  MARKET_AI_ENABLE_COGNITION_ARCHIVE: "false",
  ALPACA_API_KEY: "secret"
});

assert.strictEqual(config.nodeEnv, "production");
assert.strictEqual(config.port, 4555);
assert.strictEqual(config.autoSim, true);
assert.strictEqual(config.enableCognitionArchive, false);
assert(!Object.prototype.hasOwnProperty.call(config, "ALPACA_API_KEY"));
assert(!JSON.stringify(config).includes("secret"));

const fallback = loadEnvironmentConfig({ PORT: "bad", MARKET_AI_LOG_LEVEL: "loud" });
assert.strictEqual(fallback.port, 3001);
assert.strictEqual(fallback.logLevel, "info");
assert(fallback.warnings.length >= 1);

console.log("Environment config test passed.");
