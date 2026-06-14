import { useEffect, useState } from "react";
import {
  getAiccSystemStatus,
  getOfflineAiccSystemStatus,
} from "../services/aiccApi";
import {
  getMarketProviderStatus,
  getOfflineMarketProviderStatus,
} from "../services/marketProviderApi";

function displayState(value) {
  if (!value) return "OFFLINE";
  return String(value).replace(/_/g, " ");
}

function displayActiveProvider(value) {
  if (!value) return "PENDING";
  if (value === "BACKEND_UNAVAILABLE" || value === "DATA_UNAVAILABLE") {
    return "DATA UNAVAILABLE";
  }
  if (String(value).endsWith("_ACTIVE")) {
    return String(value).replace("_ACTIVE", "").replace(/_/g, " ");
  }
  return "PENDING";
}

function displayStreamMode(systemStatus, activeProvider, fallbackMode) {
  if (systemStatus.streamMode === "LIVE_ALPACA") {
    return "LIVE ALPACA";
  }

  if (systemStatus.simulationActive) {
    return "SIMULATION ACTIVE";
  }

  if (activeProvider === "SIMULATION" || activeProvider === "FALLBACK") {
    return "SIMULATION ACTIVE";
  }

  if (activeProvider === "BACKEND_UNAVAILABLE" || fallbackMode === "OFFLINE") {
    return "DATA UNAVAILABLE";
  }

  return activeProvider ? "LIVE PROVIDER" : displayState(fallbackMode);
}

function isLiveProviderActive(providerStatus) {
  return providerStatus.activeProvider === "ALPACA" && providerStatus.providerHealth === "HEALTHY";
}

function displayResolvedProvider(systemStatus, providerStatus) {
  if (systemStatus.streamMode === "LIVE_ALPACA") return "ALPACA";
  if (systemStatus.simulationActive) return "SIMULATION";
  if (providerStatus.available === false || providerStatus.sourceType === "DATA_UNAVAILABLE") {
    return "DATA UNAVAILABLE";
  }
  return displayActiveProvider(`${providerStatus.activeProvider}_ACTIVE`);
}

function SystemBootPanel() {
  const [systemStatus, setSystemStatus] = useState(getOfflineAiccSystemStatus());
  const [providerStatus, setProviderStatus] = useState(getOfflineMarketProviderStatus());

  useEffect(() => {
    async function loadData() {
      const [status, marketProviderStatus] = await Promise.all([
        getAiccSystemStatus(),
        getMarketProviderStatus(),
      ]);
      setSystemStatus(status);
      setProviderStatus(marketProviderStatus);
    }

    loadData();

    const interval = setInterval(loadData, 10000);

    return () => clearInterval(interval);
  }, []);

  const liveProviderActive = systemStatus.streamMode === "LIVE_ALPACA" && isLiveProviderActive(providerStatus);
  const backendOnline = systemStatus.backend === "ONLINE" && systemStatus.available !== false;
  const tacticalBrainState = liveProviderActive ? "ANALYZING" : "STANDBY";
  const behavioralBrainState = liveProviderActive ? "OBSERVING" : "STANDBY";
  const failsafeBrainState = backendOnline ? "ACTIVE" : "STANDBY";

  return (
    <div className="panel">
      <h2>System Boot</h2>
      <p>
        Backend {displayState(systemStatus.backend)} | Runtime{" "}
        {displayState(systemStatus.runtime)} | Mode{" "}
        {displayStreamMode(systemStatus, providerStatus.activeProvider, systemStatus.mode)}
      </p>

      <div className="brain-metrics">
        <div>
          <span>Primary Provider</span>
          <strong>{displayState(providerStatus.primaryProvider)}</strong>
        </div>

        <div>
          <span>Active Provider</span>
          <strong>{displayResolvedProvider(systemStatus, providerStatus)}</strong>
        </div>

        <div>
          <span>Provider Health</span>
          <strong>{displayState(providerStatus.providerHealth)}</strong>
        </div>

        <div>
          <span>Market Status</span>
          <strong>{displayState(providerStatus.marketStatus)}</strong>
        </div>
      </div>

      <p>
        Tactical {tacticalBrainState} | Behavioral{" "}
        {behavioralBrainState} | Failsafe{" "}
        {failsafeBrainState}
      </p>
    </div>
  );
}

export default SystemBootPanel;
