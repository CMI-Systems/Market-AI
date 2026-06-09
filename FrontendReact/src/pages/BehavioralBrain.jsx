import { useEffect, useMemo, useState } from "react";
import { getBrainStatus, getCognitionOverview, getConfidence } from "../services/cognitionApi";
import { getAiccReplay } from "../services/aiccApi";
import { analyzeBehavioralState } from "../services/intelligence/behavioralBrain";
import "../styles/ClosedBetaPages.css";

const CLOSED_BETA_BEHAVIORAL_FALLBACK = {
  symbol: "SPY",
  marketPulse: {
    breadth: { percentPositive: 54 },
    volumeRatio: 0.95,
    retailActivity: 48,
  },
  marketIntelligence: {
    institutionalFlow: 52,
    leadership: {
      growth: 0.8,
      value: 0.4,
      defensive: 0.2,
      commodity: 0,
      bond: -0.2,
      international: 0.1,
    },
    rotation: {
      value: 0.4,
      defensive: 0.2,
      growth: 0.8,
    },
    dominantNarrative: "closed beta market alignment",
    narrativeAdoption: 45,
  },
  newsletterData: {
    dominantNarrative: "closed beta market alignment",
    mentionCount: 2,
    symbolBreadth: 40,
  },
  crossAssetData: {
    assetReturns: {
      growth: 0.8,
      value: 0.4,
      defensive: 0.2,
      bond: -0.2,
      commodity: 0,
      international: 0.1,
    },
  },
};

function displayState(value) {
  if (!value) return "OBSERVING";
  return String(value).replace(/_/g, " ");
}

function normalizeScore(value, fallback = 0.5) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return number > 1 ? Math.max(0, Math.min(100, number)) / 100 : Math.max(0, Math.min(1, number));
}

function buildBehavioralInput({ brainStatus, overview, confidence, replay }) {
  const confidenceScore = normalizeScore(
    confidence?.score ?? overview?.confidence?.score ?? brainStatus?.behavioralBrain?.confidence,
    0.5
  );
  const consensusStrength = overview?.consensus?.consensusStrength || confidence?.consensusStrength || "MODERATE";
  const environment = overview?.strategicEnvironment?.environment || "STABILIZING";
  const replayNotes = Array.isArray(replay) ? replay : [];
  const narrativeMentions = replayNotes.filter((event) =>
    ["CONSENSUS", "EXECUTIVE", "SIGNAL"].includes(event?.type)
  ).length;
  const symbol = overview?.symbol || replayNotes.find((event) => event?.symbol)?.symbol || "SPY";
  const riskTilt = environment === "EXPANSION" || consensusStrength === "STRONG";
  const defensiveTilt = environment === "CAUTION" || confidenceScore < 0.45;
  const liveBehavioralInputAvailable = Boolean(
    overview?.marketPulse
    || overview?.marketIntelligence
    || overview?.globalScan
    || overview?.newsletterData
    || overview?.crossAssetData
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
      ...CLOSED_BETA_BEHAVIORAL_FALLBACK,
      symbol,
      marketPulse: {
        ...CLOSED_BETA_BEHAVIORAL_FALLBACK.marketPulse,
        breadth: { percentPositive: Math.round(35 + confidenceScore * 35) },
        volumeRatio: riskTilt ? 1.15 : defensiveTilt ? 0.78 : 0.95,
        retailActivity: riskTilt ? 64 : defensiveTilt ? 34 : 48,
      },
      marketIntelligence: {
        ...CLOSED_BETA_BEHAVIORAL_FALLBACK.marketIntelligence,
        institutionalFlow: Math.round(35 + confidenceScore * 40),
        leadership: {
          growth: riskTilt ? 2.1 : 0.4,
          value: defensiveTilt ? 0.8 : 0.6,
          defensive: defensiveTilt ? 2.2 : 0.2,
          commodity: 0.1,
          bond: defensiveTilt ? 1.6 : -0.2,
          international: 0.2,
        },
        rotation: {
          riskOn: riskTilt ? 68 : 45,
          safety: defensiveTilt ? 72 : 42,
          growth: riskTilt ? 1.8 : 0.2,
          defensive: defensiveTilt ? 2 : 0.2,
        },
        dominantNarrative: `${environment.toLowerCase()} behavioral alignment`,
        narrativeAdoption: Math.round(30 + confidenceScore * 35),
      },
      newsletterData: {
        dominantNarrative: `${environment.toLowerCase()} behavioral alignment`,
        mentionCount: narrativeMentions,
        symbolBreadth: Math.round(30 + confidenceScore * 35),
      },
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

  return (
    <div className="closed-beta-page">
      <header className="closed-beta-header">
        <h1>BEHAVIORAL BRAIN</h1>
        <p>Closed beta consensus, alignment, and sentiment dashboard.</p>
        <span className="closed-beta-version">AICC Closed Beta v0.1</span>
      </header>

      <section className="closed-beta-summary-grid">
        <div className="closed-beta-card">
          <span>Behavioral State</span>
          <strong>{displayState(behavioralAnalysis.behavioralState)}</strong>
        </div>
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
          <span>Rotation</span>
          <strong>{displayState(behavioralAnalysis.rotation)}</strong>
        </div>
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
      </section>

      {behavioralInput.limited && (
        <section className="closed-beta-panel">
          <h2>Input Notice</h2>
          <p>Limited behavioral inputs. Closed-beta fallback data is being blended with available cognition status.</p>
        </section>
      )}

      <section className="closed-beta-grid">
        <div className="closed-beta-panel">
          <h2>Evidence</h2>
          <div className="closed-beta-list">
            {evidence.map((item) => (
              <div key={item}>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="closed-beta-panel">
          <h2>Warnings</h2>
          <div className="closed-beta-list">
            {warnings.map((warning) => (
              <div key={warning}>
                <p>{warning}</p>
              </div>
            ))}
          </div>
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
