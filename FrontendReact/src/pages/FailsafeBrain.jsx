import { useEffect, useState } from "react";
import { getAiccAlerts, getAiccSystemStatus, getOfflineAiccSystemStatus } from "../services/aiccApi";
import {
  getOfflineProviderDiagnostics,
  getProviderDiagnostics,
} from "../services/marketProviderApi";
import "../styles/ClosedBetaPages.css";

function displayState(value) {
  if (!value) return "STANDBY";
  return String(value).replace(/_/g, " ");
}

function FailsafeBrain() {
  const [systemStatus, setSystemStatus] = useState(getOfflineAiccSystemStatus());
  const [providerDiagnostics, setProviderDiagnostics] = useState(getOfflineProviderDiagnostics());
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    async function loadFailsafeBrain() {
      const [systemData, diagnosticsData, alertsData] = await Promise.all([
        getAiccSystemStatus(),
        getProviderDiagnostics(),
        getAiccAlerts(),
      ]);

      setSystemStatus(systemData);
      setProviderDiagnostics(diagnosticsData);
      setAlerts(alertsData);
    }

    loadFailsafeBrain();

    const interval = setInterval(loadFailsafeBrain, 15000);

    return () => clearInterval(interval);
  }, []);

  const criticalAlerts = alerts.filter((alert) =>
    ["WARNING", "CRITICAL"].includes(alert.severity)
  );
  const escalationState = systemStatus?.escalation?.escalationLevel || "NONE";

  return (
    <div className="closed-beta-page">
      <header className="closed-beta-header">
        <h1>FAILSAFE BRAIN</h1>
        <p>Closed beta protection, failover, and risk monitor.</p>
        <span className="closed-beta-version">AICC Closed Beta v0.1</span>
      </header>

      <section className="closed-beta-summary-grid">
        <div className="closed-beta-card">
          <span>Failsafe Status</span>
          <strong>{displayState(systemStatus.brains?.failsafe)}</strong>
        </div>
        <div className="closed-beta-card">
          <span>Provider Health</span>
          <strong>{displayState(providerDiagnostics.providerHealth)}</strong>
        </div>
        <div className="closed-beta-card">
          <span>Risk Level</span>
          <strong>{criticalAlerts.length ? "ELEVATED" : "LOW"}</strong>
        </div>
        <div className="closed-beta-card">
          <span>Failover Ready</span>
          <strong>{providerDiagnostics.failoverReady ? "READY" : "PENDING"}</strong>
        </div>
        <div className="closed-beta-card">
          <span>Active Alerts</span>
          <strong>{alerts.length}</strong>
        </div>
        <div className="closed-beta-card">
          <span>Escalation State</span>
          <strong>{displayState(escalationState)}</strong>
        </div>
      </section>

      <section className="closed-beta-panel">
        <h2>Protection Summary</h2>
        <p>
          Failsafe monitoring is {displayState(systemStatus.brains?.failsafe).toLowerCase()} with
          provider health at {displayState(providerDiagnostics.providerHealth).toLowerCase()} and
          fallback status {displayState(providerDiagnostics.fallback?.status || "AVAILABLE").toLowerCase()}.
        </p>
      </section>

      <section className="closed-beta-panel">
        <h2>Recent Failsafe Alerts</h2>
        <div className="closed-beta-list">
          {alerts.slice(0, 6).map((alert) => (
            <article key={alert.id}>
              <span>{alert.severity}</span>
              <strong>{alert.title}</strong>
              <p>{alert.message}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default FailsafeBrain;
