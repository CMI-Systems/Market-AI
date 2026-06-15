import { useEffect, useState } from "react";
import {
  getAiccSystemStatus,
  getOfflineAiccSystemStatus,
} from "../services/aiccApi";
import {
  getOfflineProviderDiagnostics,
  getProviderDiagnostics,
} from "../services/marketProviderApi";
import {
  displayProviderWarning,
  displayWebullStatus,
} from "../services/providerDisplay";

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
    {
      label: "Provider Adapter",
      status: providerDiagnostics.rawDataAvailable === true ? "ONLINE" : "DATA UNAVAILABLE",
    },
    {
      label: "Watchlists",
      status: providerDiagnostics.rawDataAvailable === true ? "ONLINE" : "DATA UNAVAILABLE",
    },
    {
      label: "Signals",
      status: providerDiagnostics.rawDataAvailable === true ? "ONLINE" : "DATA UNAVAILABLE",
    },
    { label: "Alerts", status: systemStatus.backend === "OFFLINE" ? "DATA UNAVAILABLE" : "ONLINE" },
    { label: "Replay Center", status: "ONLINE" },
    { label: "Failover", status: providerDiagnostics.failoverReady ? "READY" : "PENDING" },
    { label: "Webull", status: displayWebullStatus(providerDiagnostics.webull) },
  ];
  const betaReadinessItems = [
    { label: "Core Cognition", status: systemStatus.backend === "OFFLINE" ? "OFFLINE" : "ONLINE" },
    { label: "Architecture", status: "READY" },
    { label: "Data Layer", status: providerDiagnostics.rawDataAvailable === true ? "READY" : "PENDING" },
    { label: "Provider Layer", status: providerDiagnostics.rawDataAvailable === true ? "READY" : "PENDING" },
    { label: "Signals", status: providerDiagnostics.rawDataAvailable === true ? "READY" : "PENDING" },
    { label: "Alerts", status: systemStatus.backend === "OFFLINE" ? "PENDING" : "READY" },
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
          <strong>{displayWebullStatus(providerDiagnostics.webull)}</strong>
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
          <strong>
            {displayProviderWarning(providerDiagnostics.warnings?.[0]) === "CLEAR"
              ? providerDiagnostics.warnings?.length || 0
              : displayProviderWarning(providerDiagnostics.warnings?.[0])}
          </strong>
        </div>
      </div>
    </div>
  );
}

export default SystemSettings;
