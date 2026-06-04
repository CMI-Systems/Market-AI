import { useEffect, useState } from "react";
import { getCognitionOverview } from "../services/cognitionApi";

function SystemBootPanel() {
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    async function loadData() {
      const overviewData = await getCognitionOverview();

      if (overviewData) setOverview(overviewData);
    }

    loadData();

    const interval = setInterval(loadData, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="panel">
      <h2>System Boot</h2>
      <p>
        Backend {overview?.backend || "UNKNOWN"} | Runtime{" "}
        {overview?.runtimeHealth?.status || "UNKNOWN"} | Mode{" "}
        {overview?.mode || "UNKNOWN"}
      </p>
      <p>{overview ? "System boot initialized from backend cognition." : "Initializing Market AI System..."}</p>
    </div>
  );
}

export default SystemBootPanel;
