const assert = require("assert");
const { buildFeatureGates } = require("../services/featureGateEngine");

const free = buildFeatureGates({ activeTier: "FREE" });
assert.strictEqual(free.gateState, "LIMITED");
assert(free.accessibleFeatures.length >= 1);
assert(free.lockedFeatures.length >= 1);
assert(free.upgradeSignals.length >= 1);

const admin = buildFeatureGates({ activeTier: "ADMIN" });
assert.strictEqual(admin.gateState, "ADMIN");
assert.strictEqual(admin.lockedFeatures.length, 0);

console.log("Feature gate engine test passed.");
