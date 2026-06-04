import { useEffect, useState } from "react";
import {
  getBrainStatus,
  getCognitionOverview,
  getPriorityFeed,
  getProductionHealth,
} from "../services/cognitionApi";
import {
  classifyHealth,
  normalizeDataLabel,
} from "../services/intelligenceTranslator";

function DataStreams() {
  const [overview, setOverview] = useState(null);
  const [health, setHealth] = useState(null);
  const [brainStatus, setBrainStatus] = useState(null);
  const [priorityFeed, setPriorityFeed] = useState(null);

  useEffect(() => {
    async function loadData() {
      const [overviewData, healthData, brainData, feedData] =
        await Promise.all([
          getCognitionOverview(),
          getProductionHealth(),
          getBrainStatus(),
          getPriorityFeed(),
        ]);

      if (overviewData) setOverview(overviewData);
      if (healthData) setHealth(healthData);
      if (brainData) setBrainStatus(brainData);
      if (feedData) setPriorityFeed(feedData);
    }

    loadData();

    const interval = setInterval(loadData, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page-placeholder">
      <h1>DATA STREAMS</h1>
      <p>Market AI intelligence module under construction.</p>

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
          <strong>{health?.uptimeMs ? classifyHealth(health) : "DETECTING"}</strong>
        </div>
      </div>

      <div className="brain-metrics">
        <div>
          <span>Backend</span>
          <strong>{normalizeDataLabel(overview?.backend)}</strong>
        </div>

        <div>
          <span>Mode</span>
          <strong>{normalizeDataLabel(overview?.mode)}</strong>
        </div>

        <div>
          <span>Provider</span>
          <strong>{normalizeDataLabel(overview?.provider)}</strong>
        </div>

        <div>
          <span>Symbol</span>
          <strong>{overview?.symbol || "SPY"}</strong>
        </div>
      </div>

      <div className="brain-metrics">
        <div>
          <span>Tactical</span>
          <strong>{brainStatus?.tacticalBrain?.status || "LOADING"}</strong>
        </div>

        <div>
          <span>Behavioral</span>
          <strong>{brainStatus?.behavioralBrain?.status || "LOADING"}</strong>
        </div>

        <div>
          <span>Failsafe</span>
          <strong>{brainStatus?.failsafeBrain?.status || "LOADING"}</strong>
        </div>

        <div>
          <span>Feed State</span>
          <strong>{priorityFeed?.feedState || "LOADING"}</strong>
        </div>
      </div>

      <div className="brain-metrics">
        <div>
          <span>Events</span>
          <strong>{priorityFeed?.events?.length || 0}</strong>
        </div>

        <div>
          <span>Runtime</span>
          <strong>{classifyHealth(health)}</strong>
        </div>

        <div>
          <span>Memory</span>
          <strong>{normalizeDataLabel(health?.memory?.heapUsedMb, "UNAVAILABLE")}</strong>
        </div>
      </div>
    </div>
  );
}

export default DataStreams;
