import {
  GROUP_A_UI_STATES,
  sanitizeDisplayText,
} from "../services/GroupAReadContracts";

const STATE_LABELS = {
  [GROUP_A_UI_STATES.LOADING]: "Loading",
  [GROUP_A_UI_STATES.FRESH]: "Current",
  [GROUP_A_UI_STATES.DELAYED]: "Delayed",
  [GROUP_A_UI_STATES.STALE]: "Stale",
  [GROUP_A_UI_STATES.UNAVAILABLE]: "Unavailable",
  [GROUP_A_UI_STATES.UNKNOWN]: "Unknown",
  [GROUP_A_UI_STATES.UNAUTHORIZED]: "Sign in required",
  [GROUP_A_UI_STATES.RATE_LIMITED]: "Try again later",
  [GROUP_A_UI_STATES.ERROR_REDACTED]: "Unable to load",
  [GROUP_A_UI_STATES.MALFORMED_RESPONSE]: "Response blocked",
};

function displayState(value, fallback = "UNAVAILABLE") {
  return sanitizeDisplayText(value, fallback).replace(/_/g, " ").toUpperCase();
}

function digestData(response) {
  if (!response?.ok || !response.data || Array.isArray(response.data)) return null;
  return response.data;
}

function MarketContextDigestCard({ response, onRefresh }) {
  const uiState = response?.uiState || GROUP_A_UI_STATES.LOADING;
  const digest = digestData(response);

  return (
    <article className={`group-a-card group-a-state-${uiState}`}>
      <div className="group-a-card-header">
        <div>
          <span>Market Context Digest</span>
          <h3>{STATE_LABELS[uiState] || "Unknown"}</h3>
        </div>
        <button type="button" onClick={onRefresh}>
          Refresh
        </button>
      </div>

      {digest ? (
        <div className="group-a-digest-body">
          <div className="group-a-digest-summary">
            <strong>{sanitizeDisplayText(digest.symbol || digest.marketScope, "Market")}</strong>
            <p>{sanitizeDisplayText(digest.summary, "Approved digest summary unavailable.")}</p>
          </div>

          <div className="group-a-digest-meta">
            <div>
              <span>Regime</span>
              <strong>{displayState(digest.dominantRegime, "UNKNOWN")}</strong>
            </div>
            <div>
              <span>Sentiment</span>
              <strong>{displayState(digest.sentimentState, "UNKNOWN")}</strong>
            </div>
            <div>
              <span>Freshness</span>
              <strong>{displayState(digest.freshnessState, "UNKNOWN")}</strong>
            </div>
            <div>
              <span>Confidence</span>
              <strong>{Math.round(Number(digest.confidence || 0) * 100)}%</strong>
            </div>
          </div>
        </div>
      ) : (
        <div className="group-a-fail-closed">
          <strong>Digest not ready</strong>
          <p>
            {sanitizeDisplayText(
              response?.message,
              "Approved normalized market context digest data is unavailable."
            )}
          </p>
        </div>
      )}

      <div className="group-a-card-footer">
        <span>Read-only</span>
        <span>{displayState(response?.freshnessState || digest?.freshnessState, "UNKNOWN")}</span>
      </div>
    </article>
  );
}

export default MarketContextDigestCard;
