import { useEffect, useState } from "react";
import {
  getCognitionOverview,
  getProductionHealth,
} from "../services/cognitionApi";

function DataStreamsPanel() {
  const [overview, setOverview] = useState(null);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    async function loadData() {
      const [overviewData, healthData] = await Promise.all([
        getCognitionOverview(),
        getProductionHealth(),
      ]);

      if (overviewData) setOverview(overviewData);
      if (healthData) setHealth(healthData);
    }

    loadData();

    const interval = setInterval(loadData, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="panel">
      <h2>Data Streams</h2>
      <p>Live Market Intelligence Network</p>

      <div className="brain-metrics">
        <div>
          <span>Equities</span>
          <strong>{overview?.backend === "connected" ? "ONLINE" : "OFFLINE"}</strong>
        </div>

        <div>
          <span>Options</span>
          <strong>{overview?.marketOpen ? "ONLINE" : "STANDBY"}</strong>
        </div>

        <div>
          <span>Futures</span>
          <strong>{overview?.mode?.toUpperCase() || "SHADOW"}</strong>
        </div>

        <div>
          <span>Latency</span>
          <strong>{health?.uptimeMs ? "ACTIVE" : "UNKNOWN"}</strong>
        </div>
      </div>
    </div>
  );
}

export default DataStreamsPanel;
