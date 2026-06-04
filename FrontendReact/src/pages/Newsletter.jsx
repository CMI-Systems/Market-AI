import { useEffect, useState } from "react";
import {
  getCognitionOverview,
  getConfidence,
  getPriorityFeed,
  getStrategicEnvironment,
} from "../services/cognitionApi";
import {
  translateConfidence,
  translateEnvironment,
} from "../services/intelligenceTranslator";

function Newsletter() {
  const [priorityFeed, setPriorityFeed] = useState(null);
  const [strategicEnvironment, setStrategicEnvironment] = useState(null);
  const [overview, setOverview] = useState(null);
  const [confidence, setConfidence] = useState(null);

  useEffect(() => {
    async function loadData() {
      const [feedData, strategicData, overviewData, confidenceData] =
        await Promise.all([
          getPriorityFeed(),
          getStrategicEnvironment(),
          getCognitionOverview(),
          getConfidence(),
        ]);

      if (feedData) setPriorityFeed(feedData);
      if (strategicData) setStrategicEnvironment(strategicData);
      if (overviewData) setOverview(overviewData);
      if (confidenceData) setConfidence(confidenceData);
    }

    loadData();

    const interval = setInterval(loadData, 10000);

    return () => clearInterval(interval);
  }, []);

  const getEventTitle = (event, index) => {
    const text = `${event?.type || ""} ${event?.message || ""} ${event?.severity || ""}`.toUpperCase();

    if (text.includes("RISK") || text.includes("HIGH") || text.includes("CRITICAL")) {
      return "Risk Update";
    }

    if (text.includes("MEMORY") || text.includes("STABLE") || text.includes("STABIL")) {
      return "Memory Stabilization";
    }

    if (text.includes("SIGNAL") || text.includes("CONFIRM") || text.includes("REINFORCE")) {
      return "Signal Reinforcement";
    }

    return index % 4 === 1
      ? "Memory Stabilization"
      : index % 4 === 2
        ? "Signal Reinforcement"
        : index % 4 === 3
          ? "Risk Update"
          : "Consensus Update";
  };
  const events = priorityFeed?.events?.slice(0, 10) || [];
  const highImpactCount =
    priorityFeed?.events?.filter((event) =>
      ["HIGH", "CRITICAL"].includes(event?.severity)
    ).length || 0;
  const warnings = strategicEnvironment?.warnings || [];

  return (
    <div className="page-placeholder">
      <h1>NEWSLETTER</h1>
      <p>
        {translateEnvironment(
          strategicEnvironment || overview?.summary || "Awaiting newsletter cognition."
        )}
      </p>

      <div className="brain-metrics">
        <div>
          <span>Breaking Events</span>
          <strong>{priorityFeed?.events?.length || 0}</strong>
        </div>

        <div>
          <span>Economic</span>
          <strong>{overview?.mode ? `${overview.mode} intelligence mode` : "SHADOW"}</strong>
        </div>

        <div>
          <span>High Impact</span>
          <strong>{highImpactCount}</strong>
        </div>

        <div>
          <span>Status</span>
          <strong>{priorityFeed?.feedState || "PROCESSING"}</strong>
        </div>
      </div>

      <ul>
        {events.length > 0 ? (
          events.map((event, index) => (
            <li key={index}>
              [{event.timestamp ? new Date(event.timestamp).toLocaleTimeString() : "DETECTING"}]{" "}
              {getEventTitle(event, index)}
            </li>
          ))
        ) : (
          <li>[DETECTING] Awaiting Intelligence Events</li>
        )}
      </ul>

      <ul>
        <li>{translateEnvironment(strategicEnvironment)}</li>
        <li>{translateConfidence(confidence)}</li>
        <li>{confidence?.score ?? "Confidence score pending."}</li>
        <li>{warnings[0] || "No strategic warnings available."}</li>
        <li>{warnings[1] || "No secondary warning available."}</li>
        <li>{warnings[2] || "No tertiary warning available."}</li>
      </ul>
    </div>
  );
}

export default Newsletter;
