import { useEffect, useMemo, useState } from "react";
import { getAiccAlerts, getFallbackAiccAlerts } from "../services/aiccApi";
import "../styles/Alerts.css";

const alertFilters = ["All", "Signals", "Risk", "Consensus", "Failsafe", "Provider"];

function formatAlertTime(timestamp) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) return "DETECTING";

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
  const [alerts, setAlerts] = useState(getFallbackAiccAlerts());
  const [selectedFilter, setSelectedFilter] = useState("All");

  useEffect(() => {
    async function loadAlerts() {
      const data = await getAiccAlerts();
      setAlerts(data);
    }

    loadAlerts();

    const interval = setInterval(loadAlerts, 15000);

    return () => clearInterval(interval);
  }, []);

  const sortedAlerts = useMemo(
    () =>
      [...alerts].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
    [alerts]
  );
  const visibleAlerts = sortedAlerts.filter((alert) =>
    matchesFilter(alert, selectedFilter)
  );
  const criticalAlerts = sortedAlerts.filter(
    (alert) => alert.severity === "CRITICAL"
  ).length;
  const riskAlerts = sortedAlerts.filter(
    (alert) => alert.category === "RISK"
  ).length;
  const signalAlerts = sortedAlerts.filter(
    (alert) => alert.category === "SIGNAL"
  ).length;

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
            {visibleAlerts.map((alert) => (
              <article
                className={`alert-card alert-${String(alert.severity).toLowerCase()}`}
                key={alert.id}
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
                </dl>

                <p>{alert.message}</p>
              </article>
            ))}
          </div>
        </div>

        <aside>
          <div className="alerts-section-title">
            <span>02</span>
            <h2>LIVE ALERT FEED</h2>
          </div>

          <div className="live-alert-feed">
            {visibleAlerts.map((alert) => (
              <div key={`${alert.id}-feed`}>
                <span>{formatAlertTime(alert.timestamp)}</span>
                <strong>{alert.title}</strong>
                <em>{alert.severity}</em>
                <p>{alert.message}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}

export default Alerts;
