import {
  GROUP_A_UI_STATES,
  sanitizeDisplayText,
} from "../services/groupAReadContracts";

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

function providerRows(response) {
  if (!response?.ok || !Array.isArray(response.data)) return [];
  return response.data;
}

function ProviderHealthCard({ response, onRefresh }) {
  const uiState = response?.uiState || GROUP_A_UI_STATES.LOADING;
  const rows = providerRows(response);
  const isBlocked =
    uiState === GROUP_A_UI_STATES.UNAUTHORIZED ||
    uiState === GROUP_A_UI_STATES.RATE_LIMITED ||
    uiState === GROUP_A_UI_STATES.ERROR_REDACTED ||
    uiState === GROUP_A_UI_STATES.MALFORMED_RESPONSE;

  return (
    <article className={`group-a-card group-a-state-${uiState}`}>
      <div className="group-a-card-header">
        <div>
          <span>Provider Health</span>
          <h3>{STATE_LABELS[uiState] || "Unknown"}</h3>
        </div>
        <button type="button" onClick={onRefresh}>
          Refresh
        </button>
      </div>

      {rows.length > 0 ? (
        <div className="group-a-provider-list">
          {rows.map((provider) => (
            <div className="group-a-provider-row" key={provider.providerId}>
              <div>
                <strong>{sanitizeDisplayText(provider.providerName)}</strong>
                <span>{displayState(provider.providerType, "UNKNOWN")}</span>
              </div>
              <div>
                <strong>{displayState(provider.status)}</strong>
                <span>{displayState(provider.freshnessState, "UNKNOWN")}</span>
              </div>
              <div>
                <strong>{Math.round(Number(provider.confidence || 0) * 100)}%</strong>
                <span>Confidence</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="group-a-fail-closed">
          <strong>{isBlocked ? "Access blocked" : "Provider status unavailable"}</strong>
          <p>{sanitizeDisplayText(response?.message, "Approved provider health data is not ready.")}</p>
        </div>
      )}

      <div className="group-a-card-footer">
        <span>Read-only</span>
        <span>{displayState(response?.freshnessState || rows[0]?.freshnessState, "UNKNOWN")}</span>
      </div>
    </article>
  );
}

export default ProviderHealthCard;
