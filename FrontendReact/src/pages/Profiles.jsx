import { useEffect, useState } from "react";
import {
  getAiccSystemStatus,
  getOfflineAiccSystemStatus
} from "../services/aiccApi";
import {
  getOfflineProviderDiagnostics,
  getProviderDiagnostics
} from "../services/marketProviderApi";
import "../styles/ClosedBetaPages.css";

function formatStatus(value, fallback = "DETECTING") {
  if (!value) return fallback;
  return String(value).replaceAll("_", " ").toUpperCase();
}

function Profiles() {
  const [systemStatus, setSystemStatus] = useState(getOfflineAiccSystemStatus());
  const [diagnostics, setDiagnostics] = useState(getOfflineProviderDiagnostics());

  useEffect(() => {
    let active = true;

    async function loadProfileState() {
      try {
        const [systemData, diagnosticData] = await Promise.all([
          getAiccSystemStatus(),
          getProviderDiagnostics()
        ]);

        if (!active) return;
        if (systemData) setSystemStatus(systemData);
        if (diagnosticData) setDiagnostics(diagnosticData);
      } catch {
        if (!active) return;
        setSystemStatus((current) => current || getOfflineAiccSystemStatus());
        setDiagnostics((current) => current || getOfflineProviderDiagnostics());
      }
    }

    loadProfileState();
    const interval = setInterval(loadProfileState, 15000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const activeProvider =
    diagnostics?.activeProvider ||
    systemStatus?.provider ||
    getOfflineProviderDiagnostics().activeProvider;

  return (
    <div className="closed-beta-page">
      <header className="closed-beta-header">
        <span className="closed-beta-version">AICC Closed Beta v0.1</span>
        <h1>OPERATOR PROFILE</h1>
        <p>Closed beta access profile and operational environment.</p>
      </header>

      <section className="closed-beta-summary-grid">
        <div className="closed-beta-card">
          <span>Operator Profile</span>
          <strong>CLOSED BETA OPERATOR</strong>
        </div>
        <div className="closed-beta-card">
          <span>Beta Role</span>
          <strong>RESEARCH OPERATOR</strong>
        </div>
        <div className="closed-beta-card">
          <span>Provider Access</span>
          <strong>{formatStatus(activeProvider)}</strong>
        </div>
        <div className="closed-beta-card">
          <span>Current Version</span>
          <strong>AICC CLOSED BETA V0.1</strong>
        </div>
      </section>

      <section className="closed-beta-grid">
        <div className="closed-beta-panel">
          <h2>Environment</h2>
          <div className="closed-beta-list">
            <div>
              <span>Runtime</span>
              <strong>{formatStatus(systemStatus?.runtime)}</strong>
            </div>
            <div>
              <span>Mode</span>
              <strong>{formatStatus(systemStatus?.mode)}</strong>
            </div>
            <div>
              <span>Environment</span>
              <strong>{formatStatus(systemStatus?.environment)}</strong>
            </div>
            <div>
              <span>Provider Health</span>
              <strong>{formatStatus(diagnostics?.providerHealth)}</strong>
            </div>
          </div>
        </div>

        <div className="closed-beta-panel">
          <h2>Access Notes</h2>
          <p>
            Operator access is configured for closed beta research workflows,
            provider monitoring, signal review, replay inspection, and AICC
            cognition validation.
          </p>
          <p className="closed-beta-disclaimer">
            For research and intelligence purposes only. Not financial advice.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Profiles;
