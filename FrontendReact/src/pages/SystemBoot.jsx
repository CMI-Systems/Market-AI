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
import {
  displayProviderWarning,
  displayWebullActivation,
  displayWebullConfigured,
  displayWebullEnvironment,
  displayWebullStatus,
} from "../services/providerDisplay";

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

function displayProviderMode(activeProvider, providerStatus = {}) {
  if (
    !activeProvider ||
    activeProvider === "PROVIDER_UNAVAILABLE" ||
    activeProvider === "BACKEND_UNAVAILABLE" ||
    activeProvider === "DATA_UNAVAILABLE"
  ) {
    return "DATA UNAVAILABLE";
  }

  if (providerStatus.rawDataAvailable !== true) {
    return displayState(providerStatus.dataState || "DATA_UNAVAILABLE");
  }

  return activeProvider === "SIMULATION" || activeProvider === "FALLBACK"
    ? "SIMULATION"
    : "LIVE PROVIDER";
}

function displayFallbackStatus(providerStatus, providerDiagnostics) {
  if (providerStatus.activeProvider === "SIMULATION" || providerStatus.activeProvider === "FALLBACK") {
    return "SIMULATION";
  }

  return providerDiagnostics.fallback?.status || "UNAVAILABLE";
}

function isBackendOnline(overview, health, providerStatus) {
  return Boolean(
    overview?.available !== false &&
      health?.available !== false &&
      providerStatus?.available !== false &&
      providerStatus?.sourceType !== "DATA_UNAVAILABLE" &&
      (
        overview?.backend ||
        overview?.runtimeHealth?.status ||
        health?.status ||
        providerStatus.providerHealth !== "OFFLINE"
      )
  );
}

function isLiveProviderActive(providerStatus) {
  return providerStatus.activeProvider === "ALPACA" && providerStatus.providerHealth === "HEALTHY";
}

function getBetaReadinessScore({ backendOnline, liveProviderActive, providerHealthy, failoverReady, fallbackAvailable, warningsClear }) {
  return [
    backendOnline ? 20 : 0,
    liveProviderActive ? 20 : 0,
    providerHealthy ? 20 : 0,
    failoverReady ? 20 : 0,
    fallbackAvailable ? 10 : 0,
    warningsClear ? 10 : 0,
  ].reduce((total, value) => total + value, 0);
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

  const backendOnline = isBackendOnline(overview, health, providerStatus);
  const liveProviderActive = isLiveProviderActive(providerStatus);
  const providerHealthy = providerStatus.providerHealth === "HEALTHY";
  const providerAvailable =
    providerStatus.rawDataAvailable === true
    && providerStatus.providerHealth === "HEALTHY";
  const betaStatusItems = [
    { label: "Core Cognition", status: backendOnline ? "ONLINE" : "OFFLINE" },
    {
      label: "Provider Adapter",
      status: providerAvailable ? "ONLINE" : "OFFLINE",
    },
    { label: "Watchlists", status: providerAvailable ? "ONLINE" : "DATA UNAVAILABLE" },
    { label: "Signals", status: providerAvailable ? "ONLINE" : "DATA UNAVAILABLE" },
    { label: "Alerts", status: backendOnline ? "ONLINE" : "DATA UNAVAILABLE" },
    { label: "Replay Center", status: "ONLINE" },
    { label: "Failover", status: providerDiagnostics.failoverReady ? "READY" : "PENDING" },
    { label: "Webull", status: providerDiagnostics.webull?.enabled ? "ONLINE" : "INTEGRATION PENDING" },
  ];
  const betaReadinessItems = [
    { label: "Architecture", status: "READY" },
    { label: "Data Layer", status: "READY" },
    {
      label: "Provider Layer",
      status: providerAvailable ? "READY" : "PENDING",
    },
    { label: "Signals", status: providerAvailable ? "READY" : "PENDING" },
    { label: "Alerts", status: backendOnline ? "READY" : "PENDING" },
    { label: "Replay", status: "READY" },
    { label: "Failover", status: providerDiagnostics.failoverReady ? "READY" : "PENDING" },
  ];
  const fallbackIsActive =
    providerStatus.activeProvider === "SIMULATION" || providerStatus.activeProvider === "FALLBACK";
  const providerWarnings = fallbackIsActive ? providerDiagnostics.warnings || [] : [];
  const fallbackAvailable = (providerDiagnostics.fallback?.status || "UNAVAILABLE") === "AVAILABLE";
  const betaReadinessScore = getBetaReadinessScore({
    backendOnline,
    liveProviderActive,
    providerHealthy,
    failoverReady: providerDiagnostics.failoverReady,
    fallbackAvailable,
    warningsClear: providerWarnings.length === 0,
  });
  const tacticalBrainState = liveProviderActive ? "ANALYZING" : "STANDBY";
  const behavioralBrainState = liveProviderActive ? "OBSERVING" : "STANDBY";
  const failsafeBrainState = backendOnline ? "ACTIVE" : "STANDBY";
  const environmentState = liveProviderActive ? "LIVE MARKET" : "CAUTION";
  const stabilityState = providerHealthy ? "STABLE" : "MONITORING";
  const confidenceState = liveProviderActive && providerHealthy ? "HIGH" : "MODERATE";

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
          <strong>{displayProviderMode(providerStatus.activeProvider, providerStatus)}</strong>
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
          <strong>{displayWebullStatus(webullHealth || providerDiagnostics.webull)}</strong>
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
          <strong>{displayProviderWarning(providerWarnings[0])}</strong>
        </div>
      </div>

      <h2>WEBULL ACTIVATION READINESS</h2>
      <div className="brain-metrics">
        <div>
          <span>Webull Status</span>
          <strong>{displayWebullStatus(webullHealth)}</strong>
        </div>

        <div>
          <span>Webull Configured</span>
          <strong>{displayWebullConfigured(webullHealth)}</strong>
        </div>

        <div>
          <span>Webull Environment</span>
          <strong>{displayWebullEnvironment(webullHealth)}</strong>
        </div>

        <div>
          <span>Ready For Activation</span>
          <strong>{displayWebullActivation(webullHealth)}</strong>
        </div>
      </div>

      <div className="brain-metrics">
        <div>
          <span>Tactical Brain</span>
          <strong>{tacticalBrainState}</strong>
        </div>

        <div>
          <span>Behavioral Brain</span>
          <strong>{behavioralBrainState}</strong>
        </div>

        <div>
          <span>Failsafe Brain</span>
          <strong>{failsafeBrainState}</strong>
        </div>
      </div>

      <div className="brain-metrics">
        <div>
          <span>Environment</span>
          <strong>{environmentState}</strong>
        </div>

        <div>
          <span>Stability</span>
          <strong>{stabilityState}</strong>
        </div>

        <div>
          <span>Confidence</span>
          <strong>{confidenceState}</strong>
        </div>

        <div>
          <span>Score</span>
          <strong>{betaReadinessScore}</strong>
        </div>
      </div>

      <p>{AICC_BETA_DISCLAIMER}</p>
    </div>
  );
}

export default SystemBoot;
