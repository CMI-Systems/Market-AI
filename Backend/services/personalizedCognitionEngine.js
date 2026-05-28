const { getUserProfile, DEFAULT_USER_ID } = require("./userProfileService");

const AWAITING_COGNITION_PREFERENCES = "Awaiting cognition preferences.";

function buildPersonalizedCognition(userId = DEFAULT_USER_ID, options = {}) {
  const profileResult = getUserProfile(userId, options);
  const profile = profileResult.profile || {};

  if (!profileResult.profile) {
    return {
      cognitionPreferenceState: "UNKNOWN",
      preferenceProfile: null,
      warnings: [],
      summary: AWAITING_COGNITION_PREFERENCES
    };
  }

  return {
    cognitionPreferenceState: "ACTIVE",
    preferenceProfile: {
      mode: profile.dashboardMode || "Analyst Mode",
      cognitionDensity: profile.cognitionPreferences?.density || "BALANCED",
      replayDensity: profile.replayPreferences?.depth || "BALANCED",
      notificationVerbosity: profile.cognitionPreferences?.notificationVerbosity || "MODERATE",
      feedDepth: profile.cognitionPreferences?.feedDepth || "BALANCED",
      reasoningDetail: profile.cognitionPreferences?.reasoningDetail || "ANALYST",
      regionPriority: profile.environmentPreferences?.focus || "GLOBAL"
    },
    warnings: [],
    summary: `Cognition preferences loaded in ${profile.dashboardMode || "Analyst Mode"}.`
  };
}

module.exports = {
  AWAITING_COGNITION_PREFERENCES,
  buildPersonalizedCognition
};
