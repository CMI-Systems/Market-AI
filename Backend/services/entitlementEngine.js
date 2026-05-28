const AWAITING_ENTITLEMENT_STATE = "Awaiting entitlement state.";

function buildEntitlements(input = {}) {
  const tier = input.subscriptionTier || {};
  const permissions = tier.permissions || {};
  const grantedPermissions = [];
  const restrictedPermissions = [];

  Object.entries(permissions).forEach(([feature, level]) => {
    if (["LOCKED", "LIMITED", "BASIC", "COMPACT"].includes(level)) {
      restrictedPermissions.push({ feature, level });
    } else {
      grantedPermissions.push({ feature, level });
    }
  });

  if (!Object.keys(permissions).length) {
    return {
      entitlementState: "UNKNOWN",
      grantedPermissions: [],
      restrictedPermissions: [],
      warnings: [],
      summary: AWAITING_ENTITLEMENT_STATE
    };
  }

  return {
    entitlementState: restrictedPermissions.length
      ? grantedPermissions.length ? "LIMITED" : "RESTRICTED"
      : "GRANTED",
    grantedPermissions,
    restrictedPermissions,
    warnings: [],
    summary: `${grantedPermissions.length} permissions granted and ${restrictedPermissions.length} restricted.`
  };
}

module.exports = {
  AWAITING_ENTITLEMENT_STATE,
  buildEntitlements
};
