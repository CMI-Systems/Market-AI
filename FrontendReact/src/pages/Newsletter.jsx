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

const EVENT_TITLE_BY_TYPE = {
  RISK: "Risk Update",
  MEMORY: "Memory Update",
  SIGNAL: "Signal Update",
  CONSENSUS: "Consensus Update",
  CONFIDENCE: "Confidence Update",
  ESCALATION: "Escalation Update",
};

function formatEventTime(timestamp) {
  if (!timestamp) return "TIMESTAMP UNAVAILABLE";

  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) return "INVALID TIMESTAMP";

  return parsed.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function getEventTitle(event) {
  const type = String(event?.type || "").trim().toUpperCase();
  if (EVENT_TITLE_BY_TYPE[type]) return EVENT_TITLE_BY_TYPE[type];

  const text = `${event?.message || ""} ${event?.severity || ""}`.toUpperCase();

  if (text.includes("RISK") || text.includes("HIGH") || text.includes("CRITICAL")) {
    return "Risk Update";
  }

  if (text.includes("MEMORY") || text.includes("STABLE") || text.includes("STABIL")) {
    return "Memory Update";
  }

  if (text.includes("SIGNAL") || text.includes("CONFIRM") || text.includes("REINFORCE")) {
    return "Signal Update";
  }

  return "Cognition Event";
}

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

  const events = priorityFeed?.events?.slice(0, 10) || [];
  const highImpactCount =
    priorityFeed?.events?.filter((event) =>
      ["HIGH", "CRITICAL"].includes(event?.severity)
    ).length || 0;
  const warnings = strategicEnvironment?.warnings || [];

  return (
    <div className="page-placeholder">
      <h1>OPERATOR BRIEFING</h1>
      <p>
        Cognition event digest only. No external news provider, article feed, publisher
        attribution, or verified catalyst source is connected in this phase.
      </p>
      <p>
        {translateEnvironment(
          strategicEnvironment || overview?.summary || "Awaiting operator briefing cognition."
        )}
      </p>

      <div className="brain-metrics">
        <div>
          <span>Cognition Events</span>
          <strong>{priorityFeed?.events?.length || 0}</strong>
        </div>

        <div>
          <span>Mode</span>
          <strong>{overview?.mode ? `${overview.mode} intelligence mode` : "DATA_UNAVAILABLE"}</strong>
        </div>

        <div>
          <span>High Impact</span>
          <strong>{highImpactCount}</strong>
        </div>

        <div>
          <span>Status</span>
          <strong>{priorityFeed?.feedState || "DATA_UNAVAILABLE"}</strong>
        </div>
      </div>

      <ul>
        {events.length > 0 ? (
          events.map((event, index) => (
            <li key={index}>
              [{formatEventTime(event.timestamp)}]{" "}
              {getEventTitle(event)}
            </li>
          ))
        ) : (
          <li>[DATA UNAVAILABLE] Awaiting cognition events. External news is not implemented.</li>
        )}
      </ul>

      <ul>
        <li>Briefing source: INTERNAL COGNITION</li>
        <li>Briefing persistence: GENERATED ON DEMAND</li>
        <li>News source: NOT IMPLEMENTED</li>
        <li>Article links: NOT IMPLEMENTED</li>
        <li>Sentiment/catalyst from news: NOT IMPLEMENTED</li>
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
