const assert = require("assert");
const { buildPlatformPlanManifest } = require("../services/platformPlanManifest");

const manifest = buildPlatformPlanManifest();
assert.strictEqual(manifest.planState, "ACTIVE");
assert(manifest.availablePlans.includes("FREE"));
assert(manifest.availablePlans.includes("ADMIN"));
assert(manifest.cognitionCapabilities.PRO);
assert(!JSON.stringify(manifest).toLowerCase().includes("stripe"));

console.log("Platform plan manifest test passed.");
