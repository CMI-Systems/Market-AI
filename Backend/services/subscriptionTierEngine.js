const AWAITING_SUBSCRIPTION_TIER = "Awaiting subscription tier.";

const TIER_PERMISSIONS = {
  FREE: {
    cognitionDepth: "BASIC",
    replayDepth: "LIMITED",
    timelineAccess: "RECENT",
    archiveAccess: "LOCKED",
    recurrenceAccess: "LIMITED",
    ecosystemAccess: "BASIC",
    explainabilityDepth: "COMPACT",
    operatorTools: "LIMITED",
    memoryRetention: "COMPACT",
    futureAiCopilot: "PLACEHOLDER_ONLY"
  },
  PRO: {
    cognitionDepth: "DEEP",
    replayDepth: "BALANCED",
    timelineAccess: "EXPANDED",
    archiveAccess: "LIMITED",
    recurrenceAccess: "ACTIVE",
    ecosystemAccess: "ACTIVE",
    explainabilityDepth: "ANALYST",
    operatorTools: "ACTIVE",
    memoryRetention: "BALANCED",
    futureAiCopilot: "EXPLAIN_ONLY"
  },
  ELITE: {
    cognitionDepth: "FULL",
    replayDepth: "DEEP",
    timelineAccess: "FULL",
    archiveAccess: "ACTIVE",
    recurrenceAccess: "FULL",
    ecosystemAccess: "FULL",
    explainabilityDepth: "EXPANDED",
    operatorTools: "FULL",
    memoryRetention: "EXTENDED",
    futureAiCopilot: "EXPLAIN_ONLY"
  },
  ADMIN: {
    cognitionDepth: "ADMIN",
    replayDepth: "ADMIN",
    timelineAccess: "ADMIN",
    archiveAccess: "ADMIN",
    recurrenceAccess: "ADMIN",
    ecosystemAccess: "ADMIN",
    explainabilityDepth: "ADMIN",
    operatorTools: "ADMIN",
    memoryRetention: "ADMIN",
    futureAiCopilot: "EXPLAIN_ONLY"
  }
};

function normalizeTier(tier) {
  const value = String(tier || "FREE").toUpperCase();
  return TIER_PERMISSIONS[value] ? value : "FREE";
}

function buildSubscriptionTier(input = {}) {
  const activeTier = normalizeTier(input.tier || process.env.MARKET_AI_SUBSCRIPTION_TIER);
  const permissions = TIER_PERMISSIONS[activeTier];
  const restrictions = Object.entries(permissions)
    .filter(([, value]) => ["LOCKED", "LIMITED", "BASIC", "COMPACT"].includes(value))
    .map(([key, value]) => ({ feature: key, level: value }));

  return {
    tierState: activeTier === "ADMIN" ? "ADMIN_OVERRIDE" : restrictions.length ? "LIMITED" : "ACTIVE",
    activeTier,
    permissions,
    restrictions,
    warnings: [],
    summary: `${activeTier} subscription tier metadata is active.`
  };
}

module.exports = {
  AWAITING_SUBSCRIPTION_TIER,
  TIER_PERMISSIONS,
  buildSubscriptionTier,
  normalizeTier
};
