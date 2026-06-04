import { useEffect, useState } from "react";
import {
  getBrainStatus,
  getCognitionOverview,
  getConfidence,
  getProductionHealth,
  getStrategicEnvironment,
} from "../services/cognitionApi";

function SystemBoot() {
  const [overview, setOverview] = useState(null);
  const [brainStatus, setBrainStatus] = useState(null);
  const [health, setHealth] = useState(null);
  const [strategicEnvironment, setStrategicEnvironment] = useState(null);
  const [confidence, setConfidence] = useState(null);

  useEffect(() => {
    async function loadData() {
      const [
        overviewData,
        brainData,
        healthData,
        strategicData,
        confidenceData,
      ] = await Promise.all([
        getCognitionOverview(),
        getBrainStatus(),
        getProductionHealth(),
        getStrategicEnvironment(),
        getConfidence(),
      ]);

      if (overviewData) setOverview(overviewData);
      if (brainData) setBrainStatus(brainData);
      if (healthData) setHealth(healthData);
      if (strategicData) setStrategicEnvironment(strategicData);
      if (confidenceData) setConfidence(confidenceData);
    }

    loadData();

    const interval = setInterval(loadData, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page-placeholder">
      <h1>SYSTEM BOOT</h1>
      <p>
        {overview?.summary ||
          strategicEnvironment?.summary ||
          health?.summary ||
          "Awaiting backend cognition handshake."}
      </p>

      <div className="brain-metrics">
        <div>
          <span>Backend</span>
          <strong>{overview?.backend || "UNKNOWN"}</strong>
        </div>

        <div>
          <span>Mode</span>
          <strong>{overview?.mode || "UNKNOWN"}</strong>
        </div>

        <div>
          <span>Market Open</span>
          <strong>{overview?.marketOpen ? "OPEN" : "CLOSED"}</strong>
        </div>

        <div>
          <span>Runtime</span>
          <strong>{overview?.runtimeHealth?.status || health?.status || "UNKNOWN"}</strong>
        </div>
      </div>

      <div className="brain-metrics">
        <div>
          <span>Tactical Brain</span>
          <strong>{brainStatus?.tacticalBrain?.status || "LOADING"}</strong>
        </div>

        <div>
          <span>Behavioral Brain</span>
          <strong>{brainStatus?.behavioralBrain?.status || "LOADING"}</strong>
        </div>

        <div>
          <span>Failsafe Brain</span>
          <strong>{brainStatus?.failsafeBrain?.status || "LOADING"}</strong>
        </div>
      </div>

      <div className="brain-metrics">
        <div>
          <span>Environment</span>
          <strong>{strategicEnvironment?.environment || "LOADING"}</strong>
        </div>

        <div>
          <span>Stability</span>
          <strong>{strategicEnvironment?.stability || "LOADING"}</strong>
        </div>

        <div>
          <span>Confidence</span>
          <strong>{confidence?.level || "LOADING"}</strong>
        </div>

        <div>
          <span>Score</span>
          <strong>{Math.round((confidence?.score || 0) * 100)}</strong>
        </div>
      </div>
    </div>
  );
}

export default SystemBoot;
