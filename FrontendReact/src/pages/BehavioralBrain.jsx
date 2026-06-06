import { useEffect, useState } from "react";
import { getBrainStatus, getCognitionOverview, getConfidence } from "../services/cognitionApi";
import { getAiccReplay } from "../services/aiccApi";
import "../styles/ClosedBetaPages.css";

function displayState(value) {
  if (!value) return "OBSERVING";
  return String(value).replace(/_/g, " ");
}

function BehavioralBrain() {
  const [brainStatus, setBrainStatus] = useState(null);
  const [overview, setOverview] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [replay, setReplay] = useState([]);

  useEffect(() => {
    async function loadBehavioralBrain() {
      const [brainData, overviewData, confidenceData, replayData] = await Promise.all([
        getBrainStatus(),
        getCognitionOverview(),
        getConfidence(),
        getAiccReplay(),
      ]);

      if (brainData) setBrainStatus(brainData);
      if (overviewData) setOverview(overviewData);
      if (confidenceData) setConfidence(confidenceData);
      if (replayData.length) setReplay(replayData);
    }

    loadBehavioralBrain();

    const interval = setInterval(loadBehavioralBrain, 15000);

    return () => clearInterval(interval);
  }, []);

  const behavioralBrain = brainStatus?.behavioralBrain || {};
  const consensusState =
    overview?.consensus?.consensusStrength || confidence?.consensusStrength || "DETECTING";
  const marketSentiment =
    confidence?.level || overview?.confidence?.level || "DETECTING";
  const notes = replay.filter((event) =>
    ["CONSENSUS", "EXECUTIVE", "SIGNAL"].includes(event.type)
  );

  return (
    <div className="closed-beta-page">
      <header className="closed-beta-header">
        <h1>BEHAVIORAL BRAIN</h1>
        <p>Closed beta consensus, alignment, and sentiment dashboard.</p>
        <span className="closed-beta-version">AICC Closed Beta v0.1</span>
      </header>

      <section className="closed-beta-summary-grid">
        <div className="closed-beta-card">
          <span>Behavioral Status</span>
          <strong>{displayState(behavioralBrain.status)}</strong>
        </div>
        <div className="closed-beta-card">
          <span>Consensus State</span>
          <strong>{displayState(consensusState)}</strong>
        </div>
        <div className="closed-beta-card">
          <span>Market Sentiment</span>
          <strong>{displayState(marketSentiment)}</strong>
        </div>
        <div className="closed-beta-card">
          <span>Crowd Alignment</span>
          <strong>{displayState(behavioralBrain.bias || "ALIGNED")}</strong>
        </div>
        <div className="closed-beta-card">
          <span>Confidence</span>
          <strong>{Math.round((behavioralBrain.confidence || confidence?.score || 0) * 100)}%</strong>
        </div>
      </section>

      <section className="closed-beta-panel">
        <h2>Recent Behavioral Notes</h2>
        <div className="closed-beta-list">
          {notes.slice(0, 6).map((event) => (
            <article key={event.id}>
              <span>{event.type}</span>
              <strong>{event.title}</strong>
              <p>{event.summary}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default BehavioralBrain;
