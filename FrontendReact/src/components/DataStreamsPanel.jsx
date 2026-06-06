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
  if (value === undefined || value === null || value === "") return "OFFLINE";
  return String(value).replace(/_/g, " ");
}

function DataStreamsPanel() {
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
      <h2>Data Streams</h2>
      <p>
        Active Provider {displayState(providerStatus.activeProvider)} | Mode{" "}
        {displayState(systemStatus.mode)}
      </p>

      <div className="brain-metrics">
        <div>
          <span>Equities</span>
          <strong>{providerStatus.capabilities?.equities ? "ONLINE" : "OFFLINE"}</strong>
        </div>

        <div>
          <span>Options</span>
          <strong>{providerStatus.capabilities?.options ? "ONLINE" : "PENDING"}</strong>
        </div>

        <div>
          <span>Futures</span>
          <strong>{providerStatus.capabilities?.futures ? "ONLINE" : "UNAVAILABLE"}</strong>
        </div>

        <div>
          <span>Backend</span>
          <strong>{displayState(systemStatus.backend)}</strong>
        </div>

        <div>
          <span>Provider</span>
          <strong>{displayState(providerStatus.activeProvider)}</strong>
        </div>

        <div>
          <span>Primary Provider</span>
          <strong>{displayState(providerStatus.primaryProvider)}</strong>
        </div>

        <div>
          <span>Fallback</span>
          <strong>{displayState(providerStatus.fallbackProvider)}</strong>
        </div>

        <div>
          <span>Provider Health</span>
          <strong>{displayState(providerStatus.providerHealth)}</strong>
        </div>

        <div>
          <span>Market Status</span>
          <strong>{displayState(providerStatus.marketStatus)}</strong>
        </div>

        <div>
          <span>Symbol</span>
          <strong>{systemStatus.feeds?.symbol || "SPY"}</strong>
        </div>

        <div>
          <span>Tactical</span>
          <strong>{displayState(systemStatus.brains?.tactical)}</strong>
        </div>

        <div>
          <span>Behavioral</span>
          <strong>{displayState(systemStatus.brains?.behavioral)}</strong>
        </div>

        <div>
          <span>Failsafe</span>
          <strong>{displayState(systemStatus.brains?.failsafe)}</strong>
        </div>

        <div>
          <span>Feed State</span>
          <strong>{displayState(systemStatus.feeds?.feedState)}</strong>
        </div>

        <div>
          <span>Runtime</span>
          <strong>{displayState(systemStatus.runtime)}</strong>
        </div>

        <div>
          <span>Events</span>
          <strong>{systemStatus.feeds?.events ?? 0}</strong>
        </div>

        <div>
          <span>Memory</span>
          <strong>{systemStatus.feeds?.memory ?? "LOCAL"}</strong>
        </div>
      </div>
    </div>
  );
}

export default DataStreamsPanel;
