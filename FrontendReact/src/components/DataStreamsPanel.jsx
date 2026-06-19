import { useEffect, useState } from "react";
import {
  getAiccSystemStatus,
  getOfflineAiccSystemStatus,
} from "../services/aiccApi";
import {
  getMarketProviderStatus,
  getOfflineMarketProviderStatus,
} from "../services/marketProviderApi";

function displayState(value, fallback = "UNAVAILABLE") {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value).replace(/_/g, " ");
}

function displayTransportMode(systemStatus, providerStatus) {
  if (systemStatus.backend === "OFFLINE" || systemStatus.sourceType === "BACKEND_UNAVAILABLE") {
    return "BACKEND UNAVAILABLE";
  }

  if (systemStatus.simulationActive) {
    return "SIMULATED DEV STREAM";
  }

  if (systemStatus.rawDataAvailable === true || providerStatus.rawDataAvailable === true) {
    return "REST SNAPSHOT";
  }

  return displayState(systemStatus.dataState || providerStatus.dataState || systemStatus.streamMode);
}

function displayResolvedProvider(systemStatus, providerStatus) {
  if (systemStatus.rawDataAvailable === true && systemStatus.provider) return displayState(systemStatus.provider);
  if (providerStatus.rawDataAvailable === true && providerStatus.activeProvider) return displayState(providerStatus.activeProvider);
  return "DATA UNAVAILABLE";
}

function DataStreamsPanel() {
  const [systemStatus, setSystemStatus] = useState(getOfflineAiccSystemStatus());
  const [providerStatus, setProviderStatus] = useState(getOfflineMarketProviderStatus());

  useEffect(() => {
    let cancelled = false;
    let timerId = null;

    async function loadData() {
      const [status, marketProviderStatus] = await Promise.all([
        getAiccSystemStatus(),
        getMarketProviderStatus(),
      ]);

      if (cancelled) return;

      setSystemStatus(status);
      setProviderStatus(marketProviderStatus);
      timerId = window.setTimeout(loadData, 10000);
    }

    loadData();

    return () => {
      cancelled = true;
      if (timerId) window.clearTimeout(timerId);
    };
  }, []);

  const rawSnapshotAvailable = systemStatus.rawDataAvailable === true || providerStatus.rawDataAvailable === true;

  return (
    <div className="panel">
      <h2>Data Streams</h2>
      <p>
        Provider {displayResolvedProvider(systemStatus, providerStatus)} | Transport{" "}
        {displayTransportMode(systemStatus, providerStatus)}
      </p>

      <div className="brain-metrics">
        <div>
          <span>Real Provider Stream</span>
          <strong>NOT IMPLEMENTED</strong>
        </div>

        <div>
          <span>Equities</span>
          <strong>{rawSnapshotAvailable && providerStatus.capabilities?.equities ? "SNAPSHOT" : displayState(systemStatus.dataState)}</strong>
        </div>

        <div>
          <span>Quotes</span>
          <strong>{rawSnapshotAvailable && providerStatus.capabilities?.quotes ? "SNAPSHOT" : "DATA UNAVAILABLE"}</strong>
        </div>

        <div>
          <span>Candles</span>
          <strong>{rawSnapshotAvailable && providerStatus.capabilities?.historicalCandles ? "SNAPSHOT" : "DATA UNAVAILABLE"}</strong>
        </div>

        <div>
          <span>Subscriptions</span>
          <strong>NOT IMPLEMENTED</strong>
        </div>

        <div>
          <span>Last Message</span>
          <strong>{systemStatus.lastMessageAt ? displayState(systemStatus.lastMessageAt) : "NONE"}</strong>
        </div>

        <div>
          <span>Backend</span>
          <strong>{displayState(systemStatus.backend)}</strong>
        </div>

        <div>
          <span>Provider Health</span>
          <strong>{displayState(providerStatus.providerHealth)}</strong>
        </div>

        <div>
          <span>Session</span>
          <strong>{displayState(systemStatus.sessionState || providerStatus.sessionState)}</strong>
        </div>

        <div>
          <span>Feed State</span>
          <strong>{displayState(systemStatus.feeds?.feedState || systemStatus.dataState)}</strong>
        </div>

        <div>
          <span>Runtime</span>
          <strong>{displayState(systemStatus.runtimeEnvironment || systemStatus.runtime)}</strong>
        </div>

        <div>
          <span>Simulation</span>
          <strong>{systemStatus.simulationActive ? "SIMULATED" : systemStatus.simulationAllowed ? "DEV ENABLED" : "BLOCKED"}</strong>
        </div>
      </div>
    </div>
  );
}

export default DataStreamsPanel;
