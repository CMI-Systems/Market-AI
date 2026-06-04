import { useEffect, useState } from "react";
import {
  getCognitionOverview,
  getConfidence,
  getInstitutionalFlow,
  getLiquidityPressure,
  getStrategicEnvironment,
} from "../services/cognitionApi";
import {
  translateConfidence,
  translateEnvironment,
  translateInstitutionalFlow,
  translateLiquidity,
  translateStatusLabel,
} from "../services/intelligenceTranslator";
import "../styles/GlobalScan.css";

function GlobalScan() {
  const [overview, setOverview] = useState(null);
  const [strategicEnvironment, setStrategicEnvironment] = useState(null);
  const [liquidityPressure, setLiquidityPressure] = useState(null);
  const [institutionalFlow, setInstitutionalFlow] = useState(null);
  const [confidence, setConfidence] = useState(null);

  useEffect(() => {
    async function loadData() {
      const [
        overviewData,
        strategicData,
        liquidityData,
        flowData,
        confidenceData,
      ] = await Promise.all([
        getCognitionOverview(),
        getStrategicEnvironment(),
        getLiquidityPressure(),
        getInstitutionalFlow(),
        getConfidence(),
      ]);

      if (overviewData) setOverview(overviewData);
      if (strategicData) setStrategicEnvironment(strategicData);
      if (liquidityData) setLiquidityPressure(liquidityData);
      if (flowData) setInstitutionalFlow(flowData);
      if (confidenceData) setConfidence(confidenceData);
    }

    loadData();

    const interval = setInterval(loadData, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="global-scan-page">
      <header className="global-scan-header">
        <h1>GLOBAL SCAN</h1>
        <p>Real-time global market intelligence environment</p>
      </header>

      <section className="global-scan-grid">
        <div className="scan-panel">
          <h2>Global Market Status</h2>
          <div className="scan-list">
            <span>North America <strong>{overview?.marketOpen ? "ONLINE" : "CLOSED"}</strong></span>
            <span>Europe <strong>{translateStatusLabel(strategicEnvironment)}</strong></span>
            <span>Asia <strong>{translateStatusLabel(strategicEnvironment?.stability)}</strong></span>
            <span>Middle East <strong>{translateStatusLabel(liquidityPressure)}</strong></span>
            <span>South America <strong>{translateStatusLabel(institutionalFlow)}</strong></span>
          </div>
        </div>

        <div className="scan-panel">
          <h2>Market Breadth</h2>
          <div className="scan-metrics">
            <div><span>Advancers</span><strong>{translateStatusLabel(confidence)}</strong></div>
            <div><span>Decliners</span><strong>{translateStatusLabel(confidence?.consensusStrength)}</strong></div>
            <div><span>New Highs</span><strong>{Math.round((confidence?.score || 0) * 100)}</strong></div>
            <div><span>New Lows</span><strong>{translateStatusLabel(liquidityPressure?.vulnerabilityLevel || liquidityPressure)}</strong></div>
          </div>
        </div>

        <div className="scan-panel">
          <h2>Sector Intelligence</h2>
          <div className="scan-list">
            <span>Technology <strong>{translateStatusLabel(strategicEnvironment)}</strong></span>
            <span>Financials <strong>{translateStatusLabel(institutionalFlow)}</strong></span>
            <span>Energy <strong>{translateStatusLabel(liquidityPressure?.pressureState || liquidityPressure)}</strong></span>
            <span>Healthcare <strong>{translateStatusLabel(strategicEnvironment?.stability)}</strong></span>
            <span>Industrials <strong>{translateStatusLabel(confidence)}</strong></span>
          </div>
        </div>

        <div className="scan-panel">
          <h2>Global Scan Findings</h2>
          <ul className="scan-findings">
            <li>{translateEnvironment(strategicEnvironment)}</li>
            <li>{translateLiquidity(liquidityPressure)}</li>
            <li>{translateInstitutionalFlow(institutionalFlow)}</li>
            <li>{translateConfidence(confidence)}</li>
            <li>{strategicEnvironment?.warnings?.[0] || "Awaiting global scan cognition."}</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

export default GlobalScan;
