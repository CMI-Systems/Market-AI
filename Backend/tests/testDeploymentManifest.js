const assert = require("assert");
const { buildDeploymentManifest } = require("../config/deploymentManifest");

const manifest = buildDeploymentManifest({
  NODE_ENV: "production",
  MARKET_AI_MODE: "production",
  MARKET_AI_ENABLE_PERSISTENCE: "true",
  MARKET_AI_ENABLE_COGNITION_ARCHIVE: "true",
  SECRET_TOKEN: "hidden"
});

assert.strictEqual(manifest.appName, "Market AI");
assert.strictEqual(manifest.environment, "production");
assert(Array.isArray(manifest.requiredServices));
assert(manifest.readinessChecks.configLoaded);
assert(!JSON.stringify(manifest).includes("hidden"));

console.log("Deployment manifest test passed.");
