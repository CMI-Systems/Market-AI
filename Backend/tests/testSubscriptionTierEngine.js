const assert = require("assert");
const { buildSubscriptionTier } = require("../services/subscriptionTierEngine");

const free = buildSubscriptionTier({ tier: "FREE" });
assert.strictEqual(free.activeTier, "FREE");
assert.strictEqual(free.tierState, "LIMITED");
assert(free.permissions.cognitionDepth);
assert(free.restrictions.length >= 1);

const admin = buildSubscriptionTier({ tier: "ADMIN" });
assert.strictEqual(admin.tierState, "ADMIN_OVERRIDE");
assert.strictEqual(admin.permissions.operatorTools, "ADMIN");

console.log("Subscription tier engine test passed.");
