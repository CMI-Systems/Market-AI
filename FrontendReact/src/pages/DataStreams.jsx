import { useEffect, useState } from "react";
import {
  getActiveStreamEvents,
  getFutureConnections,
  getPipelineNodes,
  getStreamHealth,
  getStreamStatuses,
} from "../services/marketDataService";
import {
  getProviderDiagnostics,
  getMarketProviderStatus,
  getOfflineMarketProviderStatus,
  getOfflineProviderDiagnostics,
  getOfflineWebullHealth,
  getWebullHealth,
} from "../services/marketProviderApi";
import "../styles/DataStreams.css";

function displayState(value) {
  if (value === undefined || value === null || value === "") return "OFFLINE";
  return String(value).replace(/_/g, " ");
}

function displayProvider(value) {
  return value === "SIMULATION" ? "FALLBACK SIMULATION" : displayState(value);
}

function formatCapabilities(capabilities = {}) {
  return Object.entries(capabilities)
    .filter(([, enabled]) => enabled)
    .map(([name]) => name.replace(/([A-Z])/g, " $1").toUpperCase())
    .join(", ");
}

function DataStreams() {
  const streams = getStreamStatuses();
  const healthMetrics = getStreamHealth();
  const activeEvents = getActiveStreamEvents();
  const pipelineNodes = getPipelineNodes();
  const futureConnections = getFutureConnections();
  const [providerStatus, setProviderStatus] = useState(getOfflineMarketProviderStatus());
  const [providerDiagnostics, setProviderDiagnostics] = useState(getOfflineProviderDiagnostics());
  const [webullHealth, setWebullHealth] = useState(getOfflineWebullHealth());

  useEffect(() => {
    async function loadProviderStatus() {
      const [status, diagnostics, webull] = await Promise.all([
        getMarketProviderStatus(),
        getProviderDiagnostics(),
        getWebullHealth(),
      ]);
      setProviderStatus(status);
      setProviderDiagnostics(diagnostics);
      setWebullHealth(webull);
    }

    loadProviderStatus();

    const interval = setInterval(loadProviderStatus, 10000);

    return () => clearInterval(interval);
  }, []);

  const providerStreams = streams.map((stream) => {
    if (stream.name === "Equities") {
      return {
        ...stream,
        status: providerStatus.capabilities?.equities ? "CONNECTED" : "OFFLINE",
        health: providerStatus.providerHealth,
        lastUpdate: providerStatus.lastUpdate
          ? new Date(providerStatus.lastUpdate).toLocaleTimeString()
          : stream.lastUpdate,
      };
    }

    if (stream.name === "Options") {
      return {
        ...stream,
        status: providerStatus.capabilities?.options ? "CONNECTED" : "STANDBY",
        health: providerStatus.capabilities?.options ? providerStatus.providerHealth : "PENDING",
      };
    }

    if (stream.name === "Charts") {
      return {
        ...stream,
        status: providerStatus.capabilities?.historicalCandles ? "CONNECTED" : "OFFLINE",
        health: providerStatus.providerHealth,
      };
    }

    if (stream.name === "News") {
      return {
        ...stream,
        status: providerStatus.capabilities?.news ? "CONNECTED" : "STANDBY",
        health: providerStatus.capabilities?.news ? providerStatus.providerHealth : "PENDING",
      };
    }

    if (stream.name === "Signals" || stream.name === "Watchlists") {
      return {
        ...stream,
        status: providerStatus.activeProvider === "SIMULATION" ? "SIMULATION" : "CONNECTED",
        health: providerStatus.providerHealth,
      };
    }

    return stream;
  });

  return (
    <div className="data-streams-page">
      <header className="data-streams-header">
        <h1>DATA STREAMS</h1>
        <p>Live market data control center and AICC pipeline monitor.</p>
      </header>

      <section>
        <div className="section-heading">
          <span>00</span>
          <h2>PROVIDER ADAPTER</h2>
        </div>

        <div className="stream-status-grid">
          <div className="stream-card">
            <div>
              <span>Active Provider</span>
              <strong>{displayProvider(providerStatus.activeProvider)}</strong>
            </div>
          </div>

          <div className="stream-card">
            <div>
              <span>Primary Provider</span>
              <strong>{displayState(providerStatus.primaryProvider)}</strong>
            </div>
          </div>

          <div className="stream-card">
            <div>
              <span>Fallback</span>
              <strong>{displayState(providerStatus.fallbackProvider)}</strong>
            </div>
          </div>

          <div className="stream-card">
            <div>
              <span>Provider Health</span>
              <strong>{displayState(providerStatus.providerHealth)}</strong>
            </div>
          </div>

          <div className="stream-card">
            <div>
              <span>Market Status</span>
              <strong>{displayState(providerStatus.marketStatus)}</strong>
            </div>
          </div>

          <div className="stream-card">
            <div>
              <span>Capabilities</span>
              <strong>{formatCapabilities(providerStatus.capabilities)}</strong>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="section-heading">
          <span>00C</span>
          <h2>WEBULL ACTIVATION READINESS</h2>
        </div>

        <div className="stream-status-grid">
          <div className="stream-card">
            <div>
              <span>Webull Status</span>
              <strong>{webullHealth.status || "PENDING"}</strong>
            </div>
          </div>

          <div className="stream-card">
            <div>
              <span>Webull Configured</span>
              <strong>{webullHealth.configured ? "YES" : "NO"}</strong>
            </div>
          </div>

          <div className="stream-card">
            <div>
              <span>Webull Environment</span>
              <strong>{displayState(webullHealth.environment)}</strong>
            </div>
          </div>

          <div className="stream-card">
            <div>
              <span>Ready For Activation</span>
              <strong>{webullHealth.readyForActivation ? "YES" : "NO"}</strong>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="section-heading">
          <span>00B</span>
          <h2>PROVIDER RESILIENCE</h2>
        </div>

        <div className="stream-status-grid">
          <div className="stream-card">
            <div>
              <span>Active Provider</span>
              <strong>{displayProvider(providerDiagnostics.activeProvider)}</strong>
            </div>
          </div>

          <div className="stream-card">
            <div>
              <span>Primary Provider</span>
              <strong>{displayState(providerStatus.primaryProvider)}</strong>
            </div>
          </div>

          <div className="stream-card">
            <div>
              <span>Fallback Provider</span>
              <strong>{displayProvider(providerStatus.fallbackProvider)}</strong>
            </div>
          </div>

          <div className="stream-card">
            <div>
              <span>Provider Health</span>
              <strong>{displayState(providerDiagnostics.providerHealth)}</strong>
            </div>
          </div>

          <div className="stream-card">
            <div>
              <span>Failover Ready</span>
              <strong>{providerDiagnostics.failoverReady ? "READY" : "PENDING"}</strong>
            </div>
          </div>

          <div className="stream-card">
            <div>
              <span>Warnings</span>
              <strong>{providerDiagnostics.warnings?.length || 0}</strong>
            </div>
            <dl>
              <div>
                <dt>Latest</dt>
                <dd>{providerDiagnostics.warnings?.[0] || "CLEAR"}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section>
        <div className="section-heading">
          <span>01</span>
          <h2>STREAM STATUS</h2>
        </div>

        <div className="stream-status-grid">
          {providerStreams.map((stream) => (
            <div className="stream-card" key={stream.name}>
              <div>
                <span>{stream.name}</span>
                <strong>{stream.status}</strong>
              </div>
              <dl>
                <div>
                  <dt>Status</dt>
                  <dd>{stream.status}</dd>
                </div>
                <div>
                  <dt>Latency</dt>
                  <dd>{stream.latency}</dd>
                </div>
                <div>
                  <dt>Last Update</dt>
                  <dd>{stream.lastUpdate}</dd>
                </div>
                <div>
                  <dt>Health</dt>
                  <dd>{stream.health}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="section-heading">
          <span>02</span>
          <h2>DATA PIPELINE MAP</h2>
        </div>

        <div className="pipeline-map">
          {pipelineNodes.map((node, index) => (
            <div className="pipeline-step" key={node}>
              <div className="pipeline-node">{node}</div>
              {index < pipelineNodes.length - 1 && <span>v</span>}
            </div>
          ))}
        </div>
      </section>

      <section className="data-streams-dashboard">
        <div>
          <div className="section-heading">
            <span>03</span>
            <h2>STREAM HEALTH</h2>
          </div>

          <div className="stream-health-grid">
            {healthMetrics.map((metric) => (
              <div className="health-card" key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}%</strong>
                <div className="health-meter">
                  <i style={{ width: `${metric.value}%` }}></i>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="section-heading">
            <span>04</span>
            <h2>ACTIVE STREAMS</h2>
          </div>

          <div className="active-stream-feed">
            {activeEvents.map((event) => (
              <div key={`${event.time}-${event.message}`}>
                <span>[{event.time}]</span>
                <strong>{event.message}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="section-heading">
          <span>05</span>
          <h2>FUTURE CONNECTION PANEL</h2>
        </div>

        <div className="future-connections-panel">
          {futureConnections.map((connection) => (
            <div key={connection}>
              <span>{connection}</span>
              <strong>READY FOR INTEGRATION</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default DataStreams;
