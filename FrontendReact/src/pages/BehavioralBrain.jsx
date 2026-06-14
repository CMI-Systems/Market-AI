import { useEffect, useMemo, useState } from "react";
import { getBrainStatus, getCognitionOverview, getConfidence } from "../services/cognitionApi";
import { getAiccReplay } from "../services/aiccApi";
import { analyzeBehavioralState } from "../services/intelligence/behavioralBrain";
import "../styles/ClosedBetaPages.css";
import "../styles/BehavioralBrain.css";

function displayState(value) {
  if (!value) return "OBSERVING";
  return String(value).replace(/_/g, " ");
}

function buildBehavioralInput({ brainStatus, overview, confidence, replay }) {
  const replayNotes = Array.isArray(replay) ? replay : [];
  const symbol = overview?.symbol || replayNotes.find((event) => event?.symbol)?.symbol || "SPY";
  const liveBehavioralInputAvailable = Boolean(
    overview?.available !== false
    && overview?.sourceType !== "DATA_UNAVAILABLE"
    && (
    overview?.marketPulse
    || overview?.marketIntelligence
    || overview?.globalScan
    || overview?.newsletterData
    || overview?.crossAssetData
    )
  );

  if (liveBehavioralInputAvailable) {
    return {
      input: {
        symbol,
        marketPulse: overview.marketPulse,
        marketIntelligence: overview.marketIntelligence,
        globalScan: overview.globalScan,
        newsletterData: overview.newsletterData,
        crossAssetData: overview.crossAssetData,
      },
      limited: false,
    };
  }

  return {
    limited: true,
    input: {
      symbol,
      marketPulse: null,
      marketIntelligence: null,
      globalScan: null,
      newsletterData: null,
      crossAssetData: null,
      available: false,
      sourceType: "DATA_UNAVAILABLE",
      simulated: false,
      generated: false,
      warnings: ["Verified behavioral participant inputs are unavailable."],
    },
  };
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
  const behavioralInput = useMemo(
    () => buildBehavioralInput({ brainStatus, overview, confidence, replay }),
    [brainStatus, overview, confidence, replay]
  );
  const behavioralAnalysis = useMemo(
    () => analyzeBehavioralState(behavioralInput.input),
    [behavioralInput]
  );
  const consensusState =
    overview?.consensus?.consensusStrength || confidence?.consensusStrength || "DETECTING";
  const marketSentiment =
    confidence?.level || overview?.confidence?.level || "DETECTING";
  const notes = replay.filter((event) =>
    ["CONSENSUS", "EXECUTIVE", "SIGNAL"].includes(event.type)
  );
  const evidence = behavioralAnalysis.evidence?.length
    ? behavioralAnalysis.evidence
    : ["Behavioral Brain is waiting for participant behavior inputs."];
  const warnings = behavioralAnalysis.warnings?.length
    ? behavioralAnalysis.warnings
    : ["No behavioral warnings active."];
  const behavioralHeadline = `${displayState(behavioralAnalysis.behavioralState)} / ${displayState(behavioralAnalysis.riskAppetite)}`;
  const primaryBehavioralDriver =
    evidence.find((item) => /participation|leadership|rotation|risk|conviction/i.test(item))
    || evidence[0]
    || "Behavioral driver unavailable.";
  const primaryBehavioralRisk =
    warnings.find((item) => !/No behavioral warnings active/i.test(item))
    || `Primary risk context: ${displayState(behavioralAnalysis.riskAppetite)}`;
  const behavioralSummary =
    `${displayState(behavioralAnalysis.participation)} participation with ${displayState(behavioralAnalysis.leadership)} leadership and ${displayState(behavioralAnalysis.conviction)} conviction.`;
  const behavioralStatusLine =
    `Market participants are showing ${displayState(behavioralAnalysis.participation).toLowerCase()} participation with ${displayState(behavioralAnalysis.leadership).toLowerCase()} leadership and ${displayState(behavioralAnalysis.riskAppetite).toLowerCase()} appetite.`;
  const behavioralFlow = [
    { label: "PARTICIPATION", value: displayState(behavioralAnalysis.participation) },
    { label: "LEADERSHIP", value: displayState(behavioralAnalysis.leadership) },
    { label: "RISK APPETITE", value: displayState(behavioralAnalysis.riskAppetite) },
    { label: "CONVICTION", value: displayState(behavioralAnalysis.conviction) },
    { label: "CONSENSUS", value: displayState(consensusState) },
    { label: "BEHAVIORAL STATE", value: displayState(behavioralAnalysis.behavioralState) },
  ];

  return (
    <div className="closed-beta-page">
      <header className="closed-beta-header">
        <h1>BEHAVIORAL BRAIN</h1>
        <p>Closed beta consensus, alignment, and sentiment dashboard.</p>
        <span className="closed-beta-version">AICC Closed Beta v0.1</span>
      </header>

      <section className="closed-beta-panel behavioral-verdict-section">
        <div className="behavioral-section-title">
          <span>01</span>
          <h2>BEHAVIORAL VERDICT</h2>
        </div>

        <div className="behavioral-verdict-grid">
          <div className="behavioral-verdict-primary">
            <span>Behavioral State</span>
            <strong>{displayState(behavioralAnalysis.behavioralState)}</strong>
            <p>{behavioralStatusLine}</p>
          </div>
          <div>
            <span>Confidence</span>
            <strong>{behavioralAnalysis.confidence}%</strong>
          </div>
          <div>
            <span>Risk Appetite</span>
            <strong>{displayState(behavioralAnalysis.riskAppetite)}</strong>
          </div>
          <div>
            <span>Participation</span>
            <strong>{displayState(behavioralAnalysis.participation)}</strong>
          </div>
          <div>
            <span>Leadership</span>
            <strong>{displayState(behavioralAnalysis.leadership)}</strong>
          </div>
        </div>
      </section>

      <section className="closed-beta-panel behavioral-flow-section">
        <div className="behavioral-section-title">
          <span>02</span>
          <h2>BEHAVIORAL INTELLIGENCE FLOW</h2>
        </div>

        <div className="behavioral-flow-stack">
          {behavioralFlow.map((node, index) => (
            <div className="behavioral-flow-step" key={node.label}>
              <div className="behavioral-flow-node">
                <span>{node.label}</span>
                <strong>{node.value}</strong>
              </div>
              {index < behavioralFlow.length - 1 && (
                <b aria-hidden="true">&darr;</b>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="closed-beta-panel behavioral-state-section">
        <div className="behavioral-section-title">
          <span>03</span>
          <h2>BEHAVIORAL STATUS BOARD</h2>
        </div>

        <div className="closed-beta-summary-grid behavioral-state-grid">
          <div className="closed-beta-card">
            <span>Confidence</span>
            <strong>{behavioralAnalysis.confidence}% {displayState(behavioralAnalysis.confidenceLabel)}</strong>
          </div>
          <div className="closed-beta-card">
            <span>Participation</span>
            <strong>{displayState(behavioralAnalysis.participation)}</strong>
          </div>
          <div className="closed-beta-card">
            <span>Leadership</span>
            <strong>{displayState(behavioralAnalysis.leadership)}</strong>
          </div>
          <div className="closed-beta-card">
            <span>Risk Appetite</span>
            <strong>{displayState(behavioralAnalysis.riskAppetite)}</strong>
          </div>
          <div className="closed-beta-card">
            <span>Conviction</span>
            <strong>{displayState(behavioralAnalysis.conviction)}</strong>
          </div>
          <div className="closed-beta-card">
            <span>Rotation</span>
            <strong>{displayState(behavioralAnalysis.rotation)}</strong>
          </div>
        </div>
      </section>

      <section className="closed-beta-panel behavioral-assessment-section">
        <div className="behavioral-section-title">
          <span>04</span>
          <h2>BEHAVIORAL ASSESSMENT</h2>
        </div>

        <div className="behavioral-assessment-grid">
          <div className="closed-beta-card">
            <span>Risk Appetite</span>
            <strong>{displayState(behavioralAnalysis.riskAppetite)}</strong>
          </div>
          <div className="closed-beta-card">
            <span>Narrative Adoption</span>
            <strong>{displayState(behavioralAnalysis.narrativeAdoption)}</strong>
          </div>
          <div className="closed-beta-card">
            <span>Conviction</span>
            <strong>{displayState(behavioralAnalysis.conviction)}</strong>
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
            <span>Rotation</span>
            <strong>{displayState(behavioralAnalysis.rotation)}</strong>
          </div>
        </div>
      </section>

      <section className="closed-beta-panel behavioral-narrative-section">
        <div className="behavioral-section-title">
          <span>05</span>
          <h2>BEHAVIORAL NARRATIVE</h2>
        </div>

        <div className="behavioral-narrative-grid">
          <div className="behavioral-narrative-headline">
            <span>Headline</span>
            <strong>{behavioralHeadline}</strong>
          </div>
          <div>
            <span>Why It Matters</span>
            <p>{behavioralSummary}</p>
          </div>
          <div>
            <span>Primary Behavioral Driver</span>
            <p>{primaryBehavioralDriver}</p>
          </div>
          <div>
            <span>Primary Behavioral Risk</span>
            <p>{primaryBehavioralRisk}</p>
          </div>
        </div>
      </section>

      {behavioralInput.limited && (
        <section className="closed-beta-panel">
          <h2>Input Notice</h2>
          <p>Verified behavioral inputs are unavailable. No demo or fallback participant data is being blended.</p>
        </section>
      )}

      <section className="closed-beta-panel behavioral-support-section">
        <div className="behavioral-section-title">
          <span>06</span>
          <h2>BEHAVIORAL EVIDENCE</h2>
        </div>
        <div className="closed-beta-list">
          {evidence.map((item) => (
            <div key={item}>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="closed-beta-panel">
        <div className="behavioral-section-title">
          <span>07</span>
          <h2>BEHAVIORAL WARNINGS</h2>
        </div>
        <div className="closed-beta-list">
          {warnings.map((warning) => (
            <div key={warning}>
              <p>{warning}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="closed-beta-panel behavioral-support-section">
        <div className="behavioral-section-title">
          <span>08</span>
          <h2>BEHAVIORAL SOURCES</h2>
        </div>
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
