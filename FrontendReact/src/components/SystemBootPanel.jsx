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
  if (String(value).endsWith("_ACTIVE")) {
    return String(value).replace("_ACTIVE", "").replace(/_/g, " ");
  }
  return "PENDING";
}

function displayProviderMode(activeProvider, fallbackMode) {
  if (activeProvider === "SIMULATION" || activeProvider === "FALLBACK") {
    return "SIMULATION";
  }

  return activeProvider ? "LIVE PROVIDER" : displayState(fallbackMode);
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

  return (
    <div className="panel">
      <h2>System Boot</h2>
      <p>
        Backend {displayState(systemStatus.backend)} | Runtime{" "}
        {displayState(systemStatus.runtime)} | Mode{" "}
        {displayProviderMode(providerStatus.activeProvider, systemStatus.mode)}
      </p>

      <div className="brain-metrics">
        <div>
          <span>Primary Provider</span>
          <strong>{displayState(providerStatus.primaryProvider)}</strong>
        </div>

        <div>
          <span>Active Provider</span>
          <strong>{displayActiveProvider(`${providerStatus.activeProvider}_ACTIVE`)}</strong>
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
        Tactical {displayState(systemStatus.brains?.tactical)} | Behavioral{" "}
        {displayState(systemStatus.brains?.behavioral)} | Failsafe{" "}
        {displayState(systemStatus.brains?.failsafe)}
      </p>
    </div>
  );
}

export default SystemBootPanel;
