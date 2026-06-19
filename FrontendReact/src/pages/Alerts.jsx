import { useEffect, useMemo, useState } from "react";
import { getAiccAlerts, getFallbackAiccAlerts } from "../services/aiccApi";
import "../styles/Alerts.css";

const alertFilters = ["All", "Signals", "Risk", "Consensus", "Failsafe", "Provider"];
const VALID_SEVERITIES = new Set(["INFO", "NOTICE", "WARNING", "HIGH", "CRITICAL", "BLOCKED"]);

function normalizeSeverity(value) {
  const normalized = String(value || "UNKNOWN").trim().toUpperCase();
  return VALID_SEVERITIES.has(normalized) ? normalized : "WARNING";
}

function normalizeCategory(value) {
  return String(value || "UNKNOWN").trim().toUpperCase();
}

function isValidTimestamp(timestamp) {
  return Number.isFinite(new Date(timestamp).getTime());
}

function normalizeAlert(alert = {}) {
  const source = String(alert.source || "UNKNOWN").trim().toUpperCase() || "UNKNOWN";
  const category = normalizeCategory(alert.category || alert.type);
  const severity = normalizeSeverity(alert.severity);
  const title = String(alert.title || "Alert unavailable").trim();
  const message = String(alert.message || "Alert details are unavailable.").trim();
  const timestamp = isValidTimestamp(alert.timestamp) ? alert.timestamp : null;
  const stableId = [
    alert.id,
    source,
    category,
    severity,
    title,
    message,
  ].filter(Boolean).join("|");

  return {
    ...alert,
    id: alert.id || `local-alert-${stableId}`,
    timestamp,
    severity,
    source,
    category,
    title,
    message,
    sourceType: alert.sourceType || alert.dataState || source,
    status: String(alert.status || "NEW").trim().toUpperCase(),
    acknowledged: alert.acknowledged === true,
    dismissed: alert.dismissed === true,
    warnings: Array.isArray(alert.warnings) ? alert.warnings : [],
  };
}

function dedupeAlerts(items = []) {
  const byId = new Map();

  items.map(normalizeAlert).forEach((alert) => {
    if (!byId.has(alert.id)) {
      byId.set(alert.id, alert);
    }
  });

  return [...byId.values()];
}

function formatAlertTime(timestamp) {
  if (!timestamp) return "UNAVAILABLE";
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) return "UNAVAILABLE";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function matchesFilter(alert, selectedFilter) {
  if (selectedFilter === "All") return true;

  return String(alert.category || "").toUpperCase() ===
    selectedFilter.replace(/s$/, "").toUpperCase();
}

function Alerts() {
  const [alerts, setAlerts] = useState(() => dedupeAlerts(getFallbackAiccAlerts()));
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState(() => new Set());
  const [dismissedAlerts, setDismissedAlerts] = useState(() => new Set());

  useEffect(() => {
    async function loadAlerts() {
      const data = await getAiccAlerts();
      setAlerts(dedupeAlerts(data));
    }

    loadAlerts();

    const interval = setInterval(loadAlerts, 15000);

    return () => clearInterval(interval);
  }, []);

  const sortedAlerts = useMemo(
    () =>
      [...alerts].sort((a, b) => {
        const aTime = isValidTimestamp(a.timestamp) ? new Date(a.timestamp).getTime() : 0;
        const bTime = isValidTimestamp(b.timestamp) ? new Date(b.timestamp).getTime() : 0;

        return bTime - aTime;
      }),
    [alerts]
  );
  const activeAlerts = sortedAlerts
    .filter((alert) => !dismissedAlerts.has(alert.id) && alert.dismissed !== true)
    .map((alert) => ({
      ...alert,
      acknowledged: acknowledgedAlerts.has(alert.id) || alert.acknowledged === true,
      status: acknowledgedAlerts.has(alert.id) || alert.acknowledged === true
        ? "ACKNOWLEDGED"
        : alert.status,
    }));
  const visibleAlerts = activeAlerts.filter((alert) => matchesFilter(alert, selectedFilter));
  const criticalAlerts = sortedAlerts.filter(
    (alert) => alert.severity === "CRITICAL"
  ).length;
  const riskAlerts = sortedAlerts.filter(
    (alert) => alert.category === "RISK"
  ).length;
  const signalAlerts = sortedAlerts.filter(
    (alert) => alert.category === "SIGNAL"
  ).length;
  const unreadAlerts = activeAlerts.filter((alert) => !alert.acknowledged).length;

  function acknowledgeAlert(alertId) {
    setAcknowledgedAlerts((current) => new Set([...current, alertId]));
  }

  function dismissAlert(alertId) {
    setDismissedAlerts((current) => new Set([...current, alertId]));
  }

  return (
    <div className="alerts-page">
      <header className="alerts-header">
        <h1>ALERTS</h1>
        <p>Operator notifications for cognition, provider, risk, and signal events.</p>
      </header>

      <section className="alert-summary-grid">
        <div className="alert-summary-card">
          <span>Total Alerts</span>
          <strong>{sortedAlerts.length}</strong>
        </div>

        <div className="alert-summary-card">
          <span>Critical Alerts</span>
          <strong>{criticalAlerts}</strong>
        </div>

        <div className="alert-summary-card">
          <span>Risk Alerts</span>
          <strong>{riskAlerts}</strong>
        </div>

        <div className="alert-summary-card">
          <span>Signal Alerts</span>
          <strong>{signalAlerts}</strong>
        </div>

        <div className="alert-summary-card">
          <span>Unread Alerts</span>
          <strong>{unreadAlerts}</strong>
        </div>
      </section>

      <section className="alert-filters">
        {alertFilters.map((filter) => (
          <button
            className={selectedFilter === filter ? "alert-filter-active" : ""}
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            type="button"
          >
            {filter}
          </button>
        ))}
      </section>

      <section className="alerts-layout">
        <div>
          <div className="alerts-section-title">
            <span>01</span>
            <h2>ACTIVE ALERTS</h2>
          </div>

          <div className="active-alerts-grid">
            {visibleAlerts.length ? visibleAlerts.map((alert) => (
              <article
                aria-label={`${alert.severity} alert: ${alert.title}`}
                className={`alert-card alert-${String(alert.severity).toLowerCase()} ${alert.acknowledged ? "alert-acknowledged" : ""}`}
                key={alert.id}
                role={alert.severity === "CRITICAL" || alert.severity === "BLOCKED" ? "alert" : "article"}
              >
                <div>
                  <span>{formatAlertTime(alert.timestamp)}</span>
                  <strong>{alert.title}</strong>
                </div>

                <dl>
                  <div>
                    <dt>Severity</dt>
                    <dd>{alert.severity}</dd>
                  </div>
                  <div>
                    <dt>Source</dt>
                    <dd>{alert.source}</dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>{alert.status}</dd>
                  </div>
                  <div>
                    <dt>Source Type</dt>
                    <dd>{String(alert.sourceType || "UNKNOWN").replace(/_/g, " ")}</dd>
                  </div>
                </dl>

                <p>{alert.message}</p>
                {alert.warnings.length > 0 && (
                  <p className="alert-warning-text">{alert.warnings.join(" | ")}</p>
                )}

                <div className="alert-actions">
                  <button
                    disabled={alert.acknowledged}
                    onClick={() => acknowledgeAlert(alert.id)}
                    type="button"
                  >
                    {alert.acknowledged ? "Acknowledged" : "Acknowledge"}
                  </button>
                  <button onClick={() => dismissAlert(alert.id)} type="button">
                    Dismiss
                  </button>
                </div>
              </article>
            )) : (
              <div className="alerts-empty-state" role="status">
                <strong>EMPTY</strong>
                <span>No active alerts match the selected filter.</span>
              </div>
            )}
          </div>
        </div>

        <aside>
          <div className="alerts-section-title">
            <span>02</span>
            <h2>LIVE ALERT FEED</h2>
          </div>

          <div className="live-alert-feed">
            {visibleAlerts.length ? visibleAlerts.map((alert) => (
              <div key={`${alert.id}-feed`}>
                <span>{formatAlertTime(alert.timestamp)}</span>
                <strong>{alert.title}</strong>
                <em>{alert.severity}</em>
                <small>{alert.status}</small>
                <p>{alert.message}</p>
              </div>
            )) : (
              <div>
                <span>UNAVAILABLE</span>
                <strong>NO ACTIVE ALERTS</strong>
                <em>EMPTY</em>
                <p>No alert feed records match the selected filter.</p>
              </div>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}

export default Alerts;
