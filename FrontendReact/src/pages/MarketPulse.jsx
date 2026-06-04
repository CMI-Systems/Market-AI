import { useEffect, useState } from "react";
import {
  getConfidence,
  getInstitutionalFlow,
  getLiquidityPressure,
  getStrategicEnvironment,
} from "../services/cognitionApi";
import {
  translateConfidence,
  translateConsensus,
  translateEnvironment,
  translateInstitutionalFlow,
  translateLiquidity,
} from "../services/intelligenceTranslator";
import "../styles/MarketPulse.css";

function MarketPulse() {
  const [confidence, setConfidence] = useState(null);
  const [liquidityPressure, setLiquidityPressure] = useState(null);
  const [institutionalFlow, setInstitutionalFlow] = useState(null);
  const [strategicEnvironment, setStrategicEnvironment] = useState(null);

  useEffect(() => {
    async function loadMarketPulse() {
      const [
        confidenceData,
        liquidityData,
        flowData,
        strategicData,
      ] = await Promise.all([
        getConfidence(),
        getLiquidityPressure(),
        getInstitutionalFlow(),
        getStrategicEnvironment(),
      ]);

      if (confidenceData) setConfidence(confidenceData);
      if (liquidityData) setLiquidityPressure(liquidityData);
      if (flowData) setInstitutionalFlow(flowData);
      if (strategicData) setStrategicEnvironment(strategicData);
    }

    loadMarketPulse();

    const interval = setInterval(loadMarketPulse, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="market-pulse-page">
      <header className="market-pulse-header">
        <h1>MARKET PULSE</h1>
        <p>Real-time market heartbeat and intelligence synthesis</p>
      </header>

      <section className="pulse-hero">
        <div className="pulse-score-card">
          <span>Market Pulse Score</span>
          <strong>{Math.round((confidence?.score || 0) * 100)}</strong>
          <p>{translateEnvironment(strategicEnvironment)}</p>
        </div>

        <div className="pulse-regime-card">
          <span>Current Regime</span>
          <strong>{strategicEnvironment?.environment || "LOADING"}</strong>
          <p>{translateEnvironment(strategicEnvironment)}</p>
        </div>
      </section>

      <section className="pulse-grid">
        <div className="pulse-panel">
    <h2>Liquidity Engine</h2>

    <div className="pulse-metrics">
      <div>
        <span>Liquidity</span>
        <strong>{translateLiquidity(liquidityPressure)}</strong>
      </div>

      <div>
        <span>Flow</span>
        <strong>{translateInstitutionalFlow(institutionalFlow)}</strong>
      </div>

      <div>
        <span>Absorption</span>
        <strong>{translateInstitutionalFlow(institutionalFlow?.flowStrength || institutionalFlow)}</strong>
      </div>

      <div>
        <span>Status</span>
        <strong>{translateLiquidity(liquidityPressure?.status || liquidityPressure)}</strong>
      </div>
    </div>
  </div>

<div className="pulse-panel">
    <h2>Momentum Engine</h2>

    <div className="pulse-metrics">
      <div>
        <span>Trend</span>
        <strong>{translateConfidence(confidence)}</strong>
      </div>

      <div>
        <span>Momentum</span>
        <strong>{translateConsensus(confidence?.consensusStrength)}</strong>
      </div>

      <div>
        <span>Acceleration</span>
        <strong>{translateEnvironment(strategicEnvironment?.stability || strategicEnvironment)}</strong>
      </div>

      <div>
        <span>Status</span>
        <strong>{translateEnvironment(strategicEnvironment)}</strong>
      </div>
    </div>
  </div>

  <div className="pulse-panel">
    <h2>Breadth Engine</h2>

    <div className="pulse-metrics">
      <div>
        <span>Advancers</span>
        <strong>{confidence?.score ?? "N/A"}</strong>
      </div>

      <div>
        <span>Decliners</span>
        <strong>{confidence?.level ? translateConfidence(confidence) : "N/A"}</strong>
      </div>

      <div>
        <span>New Highs</span>
        <strong>{confidence?.consensusStrength ? translateConsensus(confidence.consensusStrength) : "N/A"}</strong>
      </div>

      <div>
        <span>Status</span>
        <strong>{translateEnvironment(strategicEnvironment?.stability || strategicEnvironment)}</strong>
      </div>
    </div>
  </div>

   <div className="pulse-panel">
    <h2>Volatility Engine</h2>

    <div className="pulse-metrics">
      <div>
        <span>VIX</span>
        <strong>{liquidityPressure?.volatility || "N/A"}</strong>
      </div>

      <div>
        <span>Volatility</span>
        <strong>{translateEnvironment(strategicEnvironment?.stability || strategicEnvironment)}</strong>
      </div>

      <div>
        <span>Compression</span>
        <strong>{translateLiquidity(liquidityPressure)}</strong>
      </div>

      <div>
        <span>Status</span>
        <strong>{translateLiquidity(liquidityPressure?.status || liquidityPressure)}</strong>
      </div>
    </div>
  </div>

    <div className="pulse-panel">
    <h2>Institutional Activity</h2>

    <div className="pulse-metrics">
      <div>
        <span>Flow</span>
        <strong>{translateInstitutionalFlow(institutionalFlow)}</strong>
      </div>

      <div>
        <span>Buying</span>
        <strong>{translateInstitutionalFlow(institutionalFlow?.flowStrength || institutionalFlow)}</strong>
      </div>

      <div>
        <span>Absorption</span>
        <strong>{institutionalFlow?.confidence || "LOADING"}</strong>
      </div>

      <div>
        <span>Status</span>
        <strong>{translateInstitutionalFlow(institutionalFlow?.status || institutionalFlow)}</strong>
      </div>
    </div>
  </div>

<div className="pulse-panel">
  <h2>AI Conclusions</h2>

  <ul className="pulse-alerts">
    <li>{translateEnvironment(strategicEnvironment)}</li>
    <li>{strategicEnvironment?.warnings?.[0] || "No primary warning available."}</li>
    <li>{strategicEnvironment?.warnings?.[1] || "No secondary warning available."}</li>
    <li>{strategicEnvironment?.warnings?.[2] || "No tertiary warning available."}</li>
  </ul>
</div>
 </section>
    </div>
  );
}

export default MarketPulse;
