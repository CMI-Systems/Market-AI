import { useEffect, useMemo, useState } from "react";
import {
  getAiccSystemStatus,
  getOfflineAiccSystemStatus,
} from "../services/aiccApi";
import {
  getMarketProviderStatus,
  getOfflineMarketProviderStatus,
  getProviderDiagnostics,
  getOfflineProviderDiagnostics,
  getWebullHealth,
  getOfflineWebullHealth,
} from "../services/marketProviderApi";
import {
  displayProviderWarning,
  displayWebullActivation,
  displayWebullConfigured,
  displayWebullEnvironment,
  displayWebullStatus,
} from "../services/providerDisplay";
import "../styles/DataStreams.css";

const POLLING_INTERVAL_MS = 10000;

const PIPELINE_NODES = [
  "Alpaca REST",
  "Market Provider Service",
  "Market Data Validator",
  "Backend Routes",
  "Frontend APIs",
  "Operator Surfaces",
];

const CAPABILITY_LIMITATIONS = [
  ["Real provider WebSocket", "NOT IMPLEMENTED"],
  ["Provider subscriptions", "NOT IMPLEMENTED"],
  ["Streaming quotes", "NOT CERTIFIED"],
  ["Streaming trades", "NOT CERTIFIED"],
  ["Streaming bars", "NOT CERTIFIED"],
  ["Webull streaming", "NOT IMPLEMENTED"],
];

function displayState(value, fallback = "UNAVAILABLE") {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value).replace(/_/g, " ");
}

function displayTimestamp(value) {
  if (!value) return "Unavailable";
  const timestamp = new Date(value);

  if (Number.isNaN(timestamp.getTime())) return "Invalid timestamp";

  return timestamp.toLocaleString();
}

function displayAge(value) {
  if (value === undefined || value === null || value === "") return "Unavailable";
  if (typeof value === "number") {
    if (value < 60) return `${Math.round(value)}s`;
    if (value < 3600) return `${Math.round(value / 60)}m`;
    return `${Math.round(value / 3600)}h`;
  }
  return displayState(value);
}

function statusFromEvidence(systemStatus, providerStatus) {
  if (systemStatus.backend === "OFFLINE" || systemStatus.sourceType === "BACKEND_UNAVAILABLE") {
    return "BACKEND_UNAVAILABLE";
  }

  if (systemStatus.simulationActive === true || providerStatus.simulated === true) {
    return "SIMULATED";
  }

  if (systemStatus.streamMode === "MARKET_CLOSED" || systemStatus.dataState === "MARKET_CLOSED") {
    return "MARKET_CLOSED";
  }

  if (systemStatus.rawDataAvailable === true || providerStatus.rawDataAvailable === true) {
    return "SNAPSHOT";
  }

  if (providerStatus.providerHealth === "OFFLINE" || providerStatus.dataState === "PROVIDER_OFFLINE") {
    return "PROVIDER_OFFLINE";
  }

  return systemStatus.dataState || providerStatus.dataState || "DATA_UNAVAILABLE";
}

function providerName(systemStatus, providerStatus) {
  if (systemStatus.rawDataAvailable === true && systemStatus.provider) return systemStatus.provider;
  if (providerStatus.rawDataAvailable === true && providerStatus.activeProvider) return providerStatus.activeProvider;
  if (providerStatus.activeProvider === "BACKEND_UNAVAILABLE") return "DATA_UNAVAILABLE";
  return providerStatus.activeProvider || systemStatus.provider || "DATA_UNAVAILABLE";
}

function buildSurfaceRows({ systemStatus, providerStatus }) {
  const snapshotStatus = statusFromEvidence(systemStatus, providerStatus);
  const provider = providerName(systemStatus, providerStatus);
  const sourceType = systemStatus.sourceType || providerStatus.sourceType || "DATA_UNAVAILABLE";
  const dataAge = systemStatus.dataAge ?? providerStatus.dataAge;
  const lastUpdate = providerStatus.lastUpdate || systemStatus.currentTime || null;

  return [
    {
      name: "Provider Status",
      transport: "REST_POLLING",
      status: systemStatus.backend === "OFFLINE" ? "BACKEND_UNAVAILABLE" : "POLLING",
      provider,
      sourceType,
      subscription: "NOT_IMPLEMENTED",
      lastMessageAt: null,
      lastHeartbeatAt: null,
      lastSnapshotAt: lastUpdate,
      dataAge,
      notes: "Status is polled from backend/provider endpoints.",
    },
    {
      name: "Equity Quotes",
      transport: "REST_SNAPSHOT",
      status: providerStatus.capabilities?.quotes && providerStatus.rawDataAvailable === true
        ? "SNAPSHOT"
        : snapshotStatus,
      provider,
      sourceType,
      subscription: "NOT_IMPLEMENTED",
      lastMessageAt: null,
      lastHeartbeatAt: null,
      lastSnapshotAt: lastUpdate,
      dataAge,
      notes: "Quote data is snapshot/polling based; no quote stream is certified.",
    },
    {
      name: "Historical Candles",
      transport: "REST_SNAPSHOT",
      status: providerStatus.capabilities?.historicalCandles && providerStatus.rawDataAvailable === true
        ? "SNAPSHOT"
        : snapshotStatus,
      provider,
      sourceType,
      subscription: "NOT_IMPLEMENTED",
      lastMessageAt: null,
      lastHeartbeatAt: null,
      lastSnapshotAt: lastUpdate,
      dataAge,
      notes: "Candles are requested through validated REST routes.",
    },
    {
      name: "Real Provider Stream",
      transport: "NONE",
      status: "NOT_IMPLEMENTED",
      provider: "NONE",
      sourceType: "NOT_IMPLEMENTED",
      subscription: "NOT_IMPLEMENTED",
      lastMessageAt: null,
      lastHeartbeatAt: null,
      lastSnapshotAt: null,
      dataAge: null,
      notes: "No certified Alpaca/Webull WebSocket transport is connected.",
    },
    {
      name: "Development Simulated Stream",
      transport: "DEV_ONLY",
      status: systemStatus.simulationActive
        ? "SIMULATED"
        : systemStatus.simulationAllowed
          ? "DEVELOPMENT_ONLY"
          : "SIMULATION_BLOCKED",
      provider: "SIMULATION",
      sourceType: systemStatus.simulationActive ? "SIMULATED" : "SIMULATION_BLOCKED",
      subscription: "NOT_APPLICABLE",
      lastMessageAt: systemStatus.simulationActive ? systemStatus.lastMessageAt : null,
      lastHeartbeatAt: null,
      lastSnapshotAt: null,
      dataAge: null,
      notes: "Dev/test simulation remains gated by runtime policy and is not raw provider data.",
    },
  ];
}

function DataStreams() {
  const [systemStatus, setSystemStatus] = useState(getOfflineAiccSystemStatus());
  const [providerStatus, setProviderStatus] = useState(getOfflineMarketProviderStatus());
  const [providerDiagnostics, setProviderDiagnostics] = useState(getOfflineProviderDiagnostics());
  const [webullHealth, setWebullHealth] = useState(getOfflineWebullHealth());
  const [loadState, setLoadState] = useState("LOADING");

  useEffect(() => {
    let cancelled = false;
    let timerId = null;

    async function loadProviderStatus() {
      setLoadState((current) => current === "READY" ? "POLLING" : "LOADING");

      const [status, diagnostics, webull] = await Promise.all([
        getAiccSystemStatus(),
        getProviderDiagnostics(),
        getWebullHealth(),
      ]);
      const marketProviderStatus = await getMarketProviderStatus();

      if (cancelled) return;

      setSystemStatus(status);
      setProviderStatus(marketProviderStatus);
      setProviderDiagnostics(diagnostics);
      setWebullHealth(webull);
      setLoadState("READY");
      timerId = window.setTimeout(loadProviderStatus, POLLING_INTERVAL_MS);
    }

    loadProviderStatus();

    return () => {
      cancelled = true;
      if (timerId) window.clearTimeout(timerId);
    };
  }, []);

  const streamRows = useMemo(
    () => buildSurfaceRows({ systemStatus, providerStatus }),
    [systemStatus, providerStatus]
  );
  const transportStatus = statusFromEvidence(systemStatus, providerStatus);
  const warnings = [
    ...(Array.isArray(systemStatus.warnings) ? systemStatus.warnings : []),
    ...(Array.isArray(providerStatus.warnings) ? providerStatus.warnings : []),
    ...(Array.isArray(providerDiagnostics.warnings) ? providerDiagnostics.warnings : []),
  ];

  return (
    <div className="data-streams-page">
      <header className="data-streams-header">
        <div>
          <p>Transport Audit</p>
          <h1>DATA STREAMS</h1>
        </div>
        <div className="data-streams-status" aria-label="Current data transport status">
          <span>{displayState(transportStatus)}</span>
          <strong>{displayState(systemStatus.transport || "REST_SNAPSHOT")}</strong>
        </div>
      </header>

      <section>
        <div className="section-heading">
          <span>00</span>
          <h2>STREAM TRUTH SUMMARY</h2>
        </div>

        <div className="stream-status-grid">
          <div className="stream-card">
            <span>Real Provider Stream</span>
            <strong>NOT IMPLEMENTED</strong>
            <p>No certified Alpaca or Webull WebSocket transport is connected.</p>
          </div>

          <div className="stream-card">
            <span>Current Transport</span>
            <strong>{displayState(systemStatus.transport || "REST_SNAPSHOT")}</strong>
            <p>Provider data is represented as REST snapshots or polling, not live streaming.</p>
          </div>

          <div className="stream-card">
            <span>Polling Interval</span>
            <strong>{POLLING_INTERVAL_MS / 1000}s</strong>
            <p>Polling uses a sequential timeout loop and cleans up on route unmount.</p>
          </div>

          <div className="stream-card">
            <span>Provider</span>
            <strong>{displayState(providerName(systemStatus, providerStatus))}</strong>
            <p>{displayState(providerStatus.providerHealth, "UNKNOWN")} provider health.</p>
          </div>

          <div className="stream-card">
            <span>Session State</span>
            <strong>{displayState(systemStatus.sessionState)}</strong>
            <p>Market closure is tracked separately from provider health.</p>
          </div>

          <div className="stream-card">
            <span>Simulation</span>
            <strong>
              {systemStatus.simulationActive
                ? "SIMULATED"
                : systemStatus.simulationAllowed
                  ? "DEV ENABLED"
                  : "BLOCKED"}
            </strong>
            <p>Simulated stream data is not treated as raw provider data.</p>
          </div>
        </div>
      </section>

      <section>
        <div className="section-heading">
          <span>01</span>
          <h2>PROVIDER ADAPTER</h2>
        </div>

        <div className="stream-status-grid">
          <div className="stream-card">
            <span>Active Provider</span>
            <strong>{displayState(providerStatus.activeProvider)}</strong>
          </div>
          <div className="stream-card">
            <span>Primary Provider</span>
            <strong>{displayState(providerStatus.primaryProvider)}</strong>
          </div>
          <div className="stream-card">
            <span>Provider Health</span>
            <strong>{displayState(providerStatus.providerHealth)}</strong>
          </div>
          <div className="stream-card">
            <span>Data State</span>
            <strong>{displayState(systemStatus.dataState || providerStatus.dataState)}</strong>
          </div>
          <div className="stream-card">
            <span>Source Type</span>
            <strong>{displayState(systemStatus.sourceType || providerStatus.sourceType)}</strong>
          </div>
          <div className="stream-card">
            <span>Last Snapshot</span>
            <strong>{displayTimestamp(providerStatus.lastUpdate || systemStatus.currentTime)}</strong>
          </div>
        </div>
      </section>

      <section>
        <div className="section-heading">
          <span>02</span>
          <h2>WEBULL STATUS</h2>
        </div>

        <div className="stream-status-grid">
          <div className="stream-card">
            <span>Webull Status</span>
            <strong>{displayWebullStatus(webullHealth)}</strong>
          </div>
          <div className="stream-card">
            <span>Configured</span>
            <strong>{displayWebullConfigured(webullHealth)}</strong>
          </div>
          <div className="stream-card">
            <span>Environment</span>
            <strong>{displayWebullEnvironment(webullHealth)}</strong>
          </div>
          <div className="stream-card">
            <span>Ready For Activation</span>
            <strong>{displayWebullActivation(webullHealth)}</strong>
          </div>
        </div>
      </section>

      <section>
        <div className="section-heading">
          <span>03</span>
          <h2>TRANSPORT SURFACES</h2>
        </div>

        <div className="stream-table-wrapper">
          <table className="stream-table">
            <thead>
              <tr>
                <th>Surface</th>
                <th>Status</th>
                <th>Transport</th>
                <th>Provider</th>
                <th>Subscription</th>
                <th>Last Message</th>
                <th>Last Snapshot</th>
                <th>Data Age</th>
              </tr>
            </thead>
            <tbody>
              {streamRows.map((row) => (
                <tr key={row.name}>
                  <td>
                    <strong>{row.name}</strong>
                    <span>{row.notes}</span>
                  </td>
                  <td>{displayState(row.status)}</td>
                  <td>{displayState(row.transport)}</td>
                  <td>{displayState(row.provider)}</td>
                  <td>{displayState(row.subscription)}</td>
                  <td>{displayTimestamp(row.lastMessageAt)}</td>
                  <td>{displayTimestamp(row.lastSnapshotAt)}</td>
                  <td>{displayAge(row.dataAge)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="section-heading">
          <span>04</span>
          <h2>DATA PIPELINE MAP</h2>
        </div>

        <div className="pipeline-map" aria-label="Data Streams pipeline">
          {PIPELINE_NODES.map((node, index) => (
            <div className="pipeline-step" key={node}>
              <div className="pipeline-node">{node}</div>
              {index < PIPELINE_NODES.length - 1 && <span aria-hidden="true">v</span>}
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="section-heading">
          <span>05</span>
          <h2>CAPABILITY LIMITATIONS</h2>
        </div>

        <div className="future-connections-panel">
          {CAPABILITY_LIMITATIONS.map(([connection, status]) => (
            <div key={connection}>
              <span>{connection}</span>
              <strong>{status}</strong>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="section-heading">
          <span>06</span>
          <h2>WARNINGS AND ERRORS</h2>
        </div>

        <div className="active-stream-feed" aria-live="polite">
          <div>
            <span>Status</span>
            <strong>{displayState(loadState)}</strong>
          </div>
          {warnings.length ? (
            warnings.slice(0, 6).map((warning, index) => (
              <div key={`${warning}-${index}`}>
                <span>Warning</span>
                <strong>{displayProviderWarning(warning)}</strong>
              </div>
            ))
          ) : (
            <div>
              <span>Warnings</span>
              <strong>No provider stream warnings reported.</strong>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default DataStreams;
