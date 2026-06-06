import { useEffect, useState } from "react";
import { getBrainStatus } from "../services/cognitionApi";
import {
  getMarketProviderStatus,
  getOfflineMarketProviderStatus,
  getProviderSignals,
} from "../services/marketProviderApi";
import "../styles/ClosedBetaPages.css";

const symbols = ["SPY", "QQQ", "NVDA", "AAPL", "MSFT", "TSLA"];

function displayState(value) {
  if (!value) return "OBSERVING";
  return String(value).replace(/_/g, " ");
}

function TacticalBrain() {
  const [brainStatus, setBrainStatus] = useState(null);
  const [providerStatus, setProviderStatus] = useState(getOfflineMarketProviderStatus());
  const [providerSignals, setProviderSignals] = useState([]);

  useEffect(() => {
    async function loadTacticalBrain() {
      const [brainData, providerData, signalData] = await Promise.all([
        getBrainStatus(),
        getMarketProviderStatus(),
        getProviderSignals(symbols),
      ]);

      if (brainData) setBrainStatus(brainData);
      if (providerData) setProviderStatus(providerData);
      if (signalData.length) setProviderSignals(signalData);
    }

    loadTacticalBrain();

    const interval = setInterval(loadTacticalBrain, 15000);

    return () => clearInterval(interval);
  }, []);

  const tacticalBrain = brainStatus?.tacticalBrain || {};
  const strongestSignal = [...providerSignals].sort(
    (a, b) => (b.confidence || 0) - (a.confidence || 0)
  )[0];
  const bullishSignals = providerSignals.filter((signal) =>
    ["BUY WATCH", "MOMENTUM WATCH", "REVERSAL WATCH"].includes(signal.signal)
  );
  const opportunityScore = strongestSignal?.confidence || Math.round((tacticalBrain.confidence || 0) * 100);

  return (
    <div className="closed-beta-page">
      <header className="closed-beta-header">
        <h1>TACTICAL BRAIN</h1>
        <p>Closed beta tactical signal and opportunity dashboard.</p>
        <span className="closed-beta-version">AICC Closed Beta v0.1</span>
      </header>

      <section className="closed-beta-summary-grid">
        <div className="closed-beta-card">
          <span>Tactical Status</span>
          <strong>{displayState(tacticalBrain.status)}</strong>
        </div>
        <div className="closed-beta-card">
          <span>Active Signal</span>
          <strong>{strongestSignal?.signal || "NEUTRAL"}</strong>
        </div>
        <div className="closed-beta-card">
          <span>Signal Confidence</span>
          <strong>{strongestSignal?.confidence || 0}%</strong>
        </div>
        <div className="closed-beta-card">
          <span>Market Direction</span>
          <strong>{bullishSignals.length ? "RISING" : displayState(tacticalBrain.bias || "NEUTRAL")}</strong>
        </div>
        <div className="closed-beta-card">
          <span>Opportunity Score</span>
          <strong>{opportunityScore}%</strong>
        </div>
        <div className="closed-beta-card">
          <span>Provider Source</span>
          <strong>{displayState(providerStatus.activeProvider)}</strong>
        </div>
      </section>

      <section className="closed-beta-panel">
        <h2>Recent Tactical Signals</h2>
        <div className="closed-beta-list">
          {providerSignals.slice(0, 6).map((signal) => (
            <article key={signal.symbol}>
              <span>{signal.symbol}</span>
              <strong>{signal.signal}</strong>
              <p>{signal.confidence}% confidence. {signal.reason}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default TacticalBrain;
