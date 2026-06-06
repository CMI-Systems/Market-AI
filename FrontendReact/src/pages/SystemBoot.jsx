import { useEffect, useState } from "react";
import {
  getBrainStatus,
  getCognitionOverview,
  getConfidence,
  getProductionHealth,
  getStrategicEnvironment,
} from "../services/cognitionApi";
import {
  getProviderDiagnostics,
  getMarketProviderStatus,
  getOfflineMarketProviderStatus,
  getOfflineProviderDiagnostics,
  getOfflineWebullHealth,
  getWebullHealth,
} from "../services/marketProviderApi";

const AICC_BETA_VERSION = "AICC Closed Beta v0.1";
const AICC_BETA_DISCLAIMER =
  "For research and intelligence purposes only. Not financial advice.";

function displayState(value) {
  if (value === undefined || value === null || value === "") return "OFFLINE";
  return String(value).replace(/_/g, " ");
}

function displayProvider(value) {
  return value === "SIMULATION" || value === "FALLBACK" ? "SIMULATION" : displayState(value);
}

function displayProviderMode(activeProvider) {
  return activeProvider === "SIMULATION" || activeProvider === "FALLBACK"
    ? "SIMULATION"
    : "LIVE PROVIDER";
}

function displayFallbackStatus(providerStatus, providerDiagnostics) {
  if (providerStatus.activeProvider === "SIMULATION" || providerStatus.activeProvider === "FALLBACK") {
    return "SIMULATION";
  }

  return providerDiagnostics.fallback?.status || "AVAILABLE";
}

function SystemBoot() {
  const [overview, setOverview] = useState(null);
  const [brainStatus, setBrainStatus] = useState(null);
  const [health, setHealth] = useState(null);
  const [strategicEnvironment, setStrategicEnvironment] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [providerStatus, setProviderStatus] = useState(getOfflineMarketProviderStatus());
  const [providerDiagnostics, setProviderDiagnostics] = useState(getOfflineProviderDiagnostics());
  const [webullHealth, setWebullHealth] = useState(getOfflineWebullHealth());

  useEffect(() => {
    async function loadData() {
      const [
        overviewData,
        brainData,
        healthData,
        strategicData,
        confidenceData,
        providerData,
        diagnosticsData,
        webullData,
      ] = await Promise.all([
        getCognitionOverview(),
        getBrainStatus(),
        getProductionHealth(),
        getStrategicEnvironment(),
        getConfidence(),
        getMarketProviderStatus(),
        getProviderDiagnostics(),
        getWebullHealth(),
      ]);

      if (overviewData) setOverview(overviewData);
      if (brainData) setBrainStatus(brainData);
      if (healthData) setHealth(healthData);
      if (strategicData) setStrategicEnvironment(strategicData);
      if (confidenceData) setConfidence(confidenceData);
      if (providerData) setProviderStatus(providerData);
      if (diagnosticsData) setProviderDiagnostics(diagnosticsData);
      if (webullData) setWebullHealth(webullData);
    }

    loadData();

    const interval = setInterval(loadData, 10000);

    return () => clearInterval(interval);
  }, []);

  const betaStatusItems = [
    { label: "Core Cognition", status: overview?.backend ? "ONLINE" : "ONLINE" },
    {
      label: "Provider Adapter",
      status: providerDiagnostics.providerHealth === "OFFLINE" ? "OFFLINE" : "ONLINE",
    },
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
    {
      label: "Provider Layer",
      status: providerDiagnostics.providerHealth === "OFFLINE" ? "PENDING" : "READY",
    },
    { label: "Signals", status: "READY" },
    { label: "Alerts", status: "READY" },
    { label: "Replay", status: "READY" },
    { label: "Failover", status: providerDiagnostics.failoverReady ? "READY" : "PENDING" },
  ];
  const fallbackIsActive =
    providerStatus.activeProvider === "SIMULATION" || providerStatus.activeProvider === "FALLBACK";
  const providerWarnings = fallbackIsActive ? providerDiagnostics.warnings || [] : [];

  return (
    <div className="page-placeholder">
      <h1>SYSTEM BOOT</h1>
      <p>{AICC_BETA_VERSION}</p>
      <p>
        {overview?.summary ||
          strategicEnvironment?.summary ||
          health?.summary ||
          "Awaiting backend cognition handshake."}
      </p>

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

      <div className="brain-metrics">
        <div>
          <span>Backend</span>
          <strong>{overview?.backend ? "ONLINE" : "OFFLINE"}</strong>
        </div>

        <div>
          <span>Mode</span>
          <strong>{displayProviderMode(providerStatus.activeProvider)}</strong>
        </div>

        <div>
          <span>Market Open</span>
          <strong>{displayState(providerStatus.marketStatus)}</strong>
        </div>

        <div>
          <span>Runtime</span>
          <strong>{overview?.runtimeHealth?.status || health?.status || "DEGRADED"}</strong>
        </div>
      </div>

      <div className="brain-metrics">
        <div>
          <span>Primary Provider</span>
          <strong>{displayState(providerStatus.primaryProvider)}</strong>
        </div>

        <div>
          <span>Active Provider</span>
          <strong>{displayProvider(providerStatus.activeProvider)}</strong>
        </div>

        <div>
          <span>Fallback</span>
          <strong>{displayFallbackStatus(providerStatus, providerDiagnostics)}</strong>
        </div>

        <div>
          <span>Provider Health</span>
          <strong>{displayState(providerStatus.providerHealth)}</strong>
        </div>
      </div>

      <h2>PROVIDER DIAGNOSTICS</h2>
      <div className="brain-metrics">
        <div>
          <span>Webull</span>
          <strong>
            {webullHealth.status || providerDiagnostics.webull?.status || "PENDING"}
          </strong>
        </div>

        <div>
          <span>Alpaca</span>
          <strong>{providerDiagnostics.alpaca?.status || "DEGRADED"}</strong>
        </div>

        <div>
          <span>Fallback</span>
          <strong>{displayFallbackStatus(providerStatus, providerDiagnostics)}</strong>
        </div>

        <div>
          <span>Failover Ready</span>
          <strong>{providerDiagnostics.failoverReady ? "READY" : "PENDING"}</strong>
        </div>

        <div>
          <span>Warnings</span>
          <strong>{providerWarnings.length}</strong>
        </div>

        <div>
          <span>Latest Warning</span>
          <strong>{providerWarnings[0] || "CLEAR"}</strong>
        </div>
      </div>

      <h2>WEBULL ACTIVATION READINESS</h2>
      <div className="brain-metrics">
        <div>
          <span>Webull Status</span>
          <strong>{webullHealth.status || "PENDING"}</strong>
        </div>

        <div>
          <span>Webull Configured</span>
          <strong>{webullHealth.configured ? "YES" : "NO"}</strong>
        </div>

        <div>
          <span>Webull Environment</span>
          <strong>{displayState(webullHealth.environment)}</strong>
        </div>

        <div>
          <span>Ready For Activation</span>
          <strong>{webullHealth.readyForActivation ? "YES" : "NO"}</strong>
        </div>
      </div>

      <div className="brain-metrics">
        <div>
          <span>Tactical Brain</span>
          <strong>{brainStatus?.tacticalBrain?.status || "LOADING"}</strong>
        </div>

        <div>
          <span>Behavioral Brain</span>
          <strong>{brainStatus?.behavioralBrain?.status || "LOADING"}</strong>
        </div>

        <div>
          <span>Failsafe Brain</span>
          <strong>{brainStatus?.failsafeBrain?.status || "LOADING"}</strong>
        </div>
      </div>

      <div className="brain-metrics">
        <div>
          <span>Environment</span>
          <strong>{strategicEnvironment?.environment || "LOADING"}</strong>
        </div>

        <div>
          <span>Stability</span>
          <strong>{strategicEnvironment?.stability || "LOADING"}</strong>
        </div>

        <div>
          <span>Confidence</span>
          <strong>{confidence?.level || "LOADING"}</strong>
        </div>

        <div>
          <span>Score</span>
          <strong>{Math.round((confidence?.score || 0) * 100)}</strong>
        </div>
      </div>

      <p>{AICC_BETA_DISCLAIMER}</p>
    </div>
  );
}

export default SystemBoot;
