const assert = require("assert");
const { buildSubscriptionTier } = require("../services/subscriptionTierEngine");
const { buildEntitlements } = require("../services/entitlementEngine");

const tier = buildSubscriptionTier({ tier: "PRO" });
const entitlements = buildEntitlements({ subscriptionTier: tier });
assert(["GRANTED", "LIMITED"].includes(entitlements.entitlementState));
assert(entitlements.grantedPermissions.length >= 1);
assert(Array.isArray(entitlements.restrictedPermissions));

const fallback = buildEntitlements({});
assert.strictEqual(fallback.entitlementState, "UNKNOWN");
assert.strictEqual(fallback.summary, "Awaiting entitlement state.");

console.log("Entitlement engine test passed.");
