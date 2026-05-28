const AWAITING_FEATURE_GATE_STATE = "Awaiting feature gate state.";

const FEATURE_REQUIREMENTS = {
  cognitionCockpit: "FREE",
  replayTimeline: "FREE",
  persistentArchive: "PRO",
  recurrenceIntelligence: "PRO",
  ecosystemDrilldowns: "PRO",
  expandedExplainability: "ELITE",
  extendedMemory: "ELITE",
  adminDiagnostics: "ADMIN"
};

const TIER_RANK = { FREE: 1, PRO: 2, ELITE: 3, ADMIN: 4 };

function buildFeatureGates(input = {}) {
  const tier = input.activeTier || input.subscriptionTier?.activeTier || "FREE";
  const rank = TIER_RANK[tier] || TIER_RANK.FREE;
  const accessibleFeatures = [];
  const lockedFeatures = [];

  Object.entries(FEATURE_REQUIREMENTS).forEach(([feature, requiredTier]) => {
    if (rank >= TIER_RANK[requiredTier]) {
      accessibleFeatures.push({ feature, requiredTier });
    } else {
      lockedFeatures.push({ feature, requiredTier });
    }
  });

  return {
    gateState: tier === "ADMIN" ? "ADMIN" : lockedFeatures.length ? "LIMITED" : "OPEN",
    accessibleFeatures,
    lockedFeatures,
    upgradeSignals: lockedFeatures.map((item) => ({
      feature: item.feature,
      requiredTier: item.requiredTier
    })),
    warnings: [],
    summary: `${accessibleFeatures.length} features accessible for ${tier}.`
  };
}

module.exports = {
  AWAITING_FEATURE_GATE_STATE,
  FEATURE_REQUIREMENTS,
  buildFeatureGates
};
