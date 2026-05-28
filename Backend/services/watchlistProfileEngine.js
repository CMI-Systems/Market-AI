const { getUserProfile, DEFAULT_USER_ID } = require("./userProfileService");

const AWAITING_WATCHLIST_PROFILE = "Awaiting watchlist profile.";

function buildWatchlistProfile(userId = DEFAULT_USER_ID, options = {}) {
  const profileResult = getUserProfile(userId, options);
  const profile = profileResult.profile || {};
  const watchlistProfile = profile.watchlistProfile || {};
  const prioritizedSymbols = Array.isArray(watchlistProfile.prioritizedSymbols)
    ? watchlistProfile.prioritizedSymbols
    : [];

  if (!profileResult.profile) {
    return {
      watchlistState: "UNKNOWN",
      profile: null,
      ecosystemBias: [],
      warnings: [],
      summary: AWAITING_WATCHLIST_PROFILE
    };
  }

  return {
    watchlistState: prioritizedSymbols.length ? "ACTIVE" : "LIMITED",
    profile: {
      prioritizedSymbols,
      ecosystemWeighting: watchlistProfile.ecosystemWeighting || "BALANCED",
      replayWeighting: watchlistProfile.replayWeighting || "BALANCED",
      volatilityPreference: watchlistProfile.volatilityPreference || "MODERATE",
      cognitionDensityPreference: profile.cognitionPreferences?.density || "BALANCED",
      environmentFocus: profile.environmentPreferences?.focus || "GLOBAL",
      operatorLabels: watchlistProfile.operatorLabels || []
    },
    ecosystemBias: profile.preferredEcosystems || [],
    warnings: [],
    summary: `Watchlist profile contains ${prioritizedSymbols.length} prioritized symbols.`
  };
}

module.exports = {
  AWAITING_WATCHLIST_PROFILE,
  buildWatchlistProfile
};
