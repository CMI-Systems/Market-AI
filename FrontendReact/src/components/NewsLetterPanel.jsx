import { useEffect, useState } from "react";
import {
  getCognitionOverview,
  getPriorityFeed,
} from "../services/cognitionApi";

function NewsLetterPanel() {
  const [overview, setOverview] = useState(null);
  const [priorityFeed, setPriorityFeed] = useState(null);

  useEffect(() => {
    async function loadData() {
      const [overviewData, feedData] = await Promise.all([
        getCognitionOverview(),
        getPriorityFeed(),
      ]);

      if (overviewData) setOverview(overviewData);
      if (feedData) setPriorityFeed(feedData);
    }

    loadData();

    const interval = setInterval(loadData, 10000);

    return () => clearInterval(interval);
  }, []);

  const highImpactCount =
    priorityFeed?.events?.filter((event) =>
      ["HIGH", "CRITICAL"].includes(event?.severity)
    ).length || 0;

  return (
    <div className="panel">
      <h2>Newsletter</h2>
      <p>Intelligence Processing Center</p>

      <div className="brain-metrics">
        <div>
          <span>Breaking Events</span>
          <strong>{priorityFeed?.events?.length || 0}</strong>
        </div>

        <div>
          <span>Economic</span>
          <strong>{overview?.mode || "SHADOW"}</strong>
        </div>

        <div>
          <span>High Impact</span>
          <strong>{highImpactCount}</strong>
        </div>

        <div>
          <span>Status</span>
          <strong>{priorityFeed?.feedState || "PROCESSING"}</strong>
        </div>
      </div>
    </div>
  );
}

export default NewsLetterPanel;
