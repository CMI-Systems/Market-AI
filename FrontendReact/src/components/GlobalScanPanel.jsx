import { useEffect, useState } from "react";
import {
  getCognitionOverview,
  getConfidence,
  getLiquidityPressure,
  getStrategicEnvironment,
} from "../services/cognitionApi";

function GlobalScanPanel() {
  const [overview, setOverview] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [liquidityPressure, setLiquidityPressure] = useState(null);
  const [strategicEnvironment, setStrategicEnvironment] = useState(null);

  useEffect(() => {
    async function loadData() {
      const [overviewData, confidenceData, liquidityData, strategicData] =
        await Promise.all([
          getCognitionOverview(),
          getConfidence(),
          getLiquidityPressure(),
          getStrategicEnvironment(),
        ]);

      if (overviewData) setOverview(overviewData);
      if (confidenceData) setConfidence(confidenceData);
      if (liquidityData) setLiquidityPressure(liquidityData);
      if (strategicData) setStrategicEnvironment(strategicData);
    }

    loadData();

    const interval = setInterval(loadData, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="panel">
      <h2>Global Scan</h2>
      <p>Real-Time Market Overview</p>

      <div className="brain-metrics">
        <div>
          <span>Market Breadth</span>
          <strong>{confidence?.level || "LOADING"}</strong>
        </div>

        <div>
          <span>Highs/Lows</span>
          <strong>
            {confidence?.score
              ? Math.round(confidence.score * 100)
              : liquidityPressure?.vulnerabilityLevel || "LOADING"}
          </strong>
        </div>

        <div>
          <span>Sentiment</span>
          <strong>{strategicEnvironment?.environment || "LOADING"}</strong>
        </div>

        <div>
          <span>Status</span>
          <strong>{overview?.backend === "connected" ? "ACTIVE" : "LOADING"}</strong>
        </div>
      </div>
    </div>
  );
}

export default GlobalScanPanel;
