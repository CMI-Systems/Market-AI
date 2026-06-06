import { useEffect, useState } from "react";
import {
  getAiccSystemStatus,
  getOfflineAiccSystemStatus,
} from "../services/aiccApi";
import {
  getOfflineProviderDiagnostics,
  getProviderDiagnostics,
} from "../services/marketProviderApi";

const AICC_BETA_VERSION = "AICC Closed Beta v0.1";
const AICC_BETA_DISCLAIMER =
  "For research and intelligence purposes only. Not financial advice.";

function SystemSettings() {
  const [systemStatus, setSystemStatus] = useState(getOfflineAiccSystemStatus());
  const [providerDiagnostics, setProviderDiagnostics] = useState(
    getOfflineProviderDiagnostics()
  );

  useEffect(() => {
    async function loadSettingsStatus() {
      const [systemData, diagnosticsData] = await Promise.all([
        getAiccSystemStatus(),
        getProviderDiagnostics(),
      ]);

      setSystemStatus(systemData);
      setProviderDiagnostics(diagnosticsData);
    }

    loadSettingsStatus();

    const interval = setInterval(loadSettingsStatus, 15000);

    return () => clearInterval(interval);
  }, []);

  const betaStatusItems = [
    { label: "Core Cognition", status: systemStatus.backend === "OFFLINE" ? "OFFLINE" : "ONLINE" },
    { label: "Provider Adapter", status: providerDiagnostics.providerHealth === "OFFLINE" ? "OFFLINE" : "ONLINE" },
    { label: "Watchlists", status: "ONLINE" },
    { label: "Signals", status: "ONLINE" },
    { label: "Alerts", status: "ONLINE" },
    { label: "Replay Center", status: "ONLINE" },
    { label: "Failover", status: providerDiagnostics.failoverReady ? "READY" : "PENDING" },
    { label: "Webull", status: providerDiagnostics.webull?.enabled ? "ONLINE" : "PENDING" },
  ];
  const betaReadinessItems = [
    { label: "Architecture", status: "READY" },
    { label: "Data Layer", status: "READY" },
    { label: "Provider Layer", status: providerDiagnostics.providerHealth === "OFFLINE" ? "PENDING" : "READY" },
    { label: "Signals", status: "READY" },
    { label: "Alerts", status: "READY" },
    { label: "Replay", status: "READY" },
    { label: "Failover", status: providerDiagnostics.failoverReady ? "READY" : "PENDING" },
  ];

  return (
    <div className="page-placeholder">
      <h1>SYSTEM SETTINGS</h1>
      <p>{AICC_BETA_VERSION}</p>
      <p>{AICC_BETA_DISCLAIMER}</p>

      <h2>CLOSED BETA STATUS</h2>
      <div className="brain-metrics">
        {betaStatusItems.map((item) => (
          <div key={item.label}>
            <span>{item.label}</span>
            <strong>{item.status}</strong>
          </div>
        ))}
      </div>

      <h2>BETA READINESS</h2>
      <div className="brain-metrics">
        {betaReadinessItems.map((item) => (
          <div key={item.label}>
            <span>{item.label}</span>
            <strong>{item.status}</strong>
          </div>
        ))}
      </div>

      <h2>PROVIDER DIAGNOSTICS</h2>
      <div className="brain-metrics">
        <div>
          <span>Webull</span>
          <strong>{providerDiagnostics.webull?.status || "PENDING"}</strong>
        </div>
        <div>
          <span>Alpaca</span>
          <strong>{providerDiagnostics.alpaca?.status || "DEGRADED"}</strong>
        </div>
        <div>
          <span>Fallback</span>
          <strong>{providerDiagnostics.fallback?.status || "AVAILABLE"}</strong>
        </div>
        <div>
          <span>Warnings</span>
          <strong>{providerDiagnostics.warnings?.length || 0}</strong>
        </div>
      </div>
    </div>
  );
}

export default SystemSettings;
