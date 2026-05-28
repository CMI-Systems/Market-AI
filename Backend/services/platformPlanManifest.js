const AWAITING_PLATFORM_PLAN_MANIFEST = "Awaiting platform plan manifest.";

function buildPlatformPlanManifest() {
  const availablePlans = ["FREE", "PRO", "ELITE", "ADMIN"];
  return {
    planState: "ACTIVE",
    availablePlans,
    featureGroups: [
      "Cognition cockpit",
      "Replay intelligence",
      "Persistent archive",
      "Explainability",
      "Operator interaction",
      "User intelligence"
    ],
    cognitionCapabilities: {
      FREE: "Basic cognition visualization",
      PRO: "Deeper cognition and ecosystem access",
      ELITE: "Expanded explainability and memory",
      ADMIN: "Administrative platform oversight"
    },
    replayCapabilities: {
      FREE: "Recent replay",
      PRO: "Balanced replay",
      ELITE: "Deep replay archive",
      ADMIN: "Administrative replay access"
    },
    warnings: [],
    summary: AWAITING_PLATFORM_PLAN_MANIFEST.replace("Awaiting", "Active")
  };
}

module.exports = {
  AWAITING_PLATFORM_PLAN_MANIFEST,
  buildPlatformPlanManifest
};
