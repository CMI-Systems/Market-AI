import { useEffect, useState } from "react";
import { getPriorityFeed } from "../services/cognitionApi";

function IntelligenceFeedPanel() {
  const formatTime = (timestamp) => {
    if (!timestamp) return "UNAVAILABLE";

    const parsed = new Date(timestamp);
    if (Number.isNaN(parsed.getTime())) return "INVALID";

    return parsed.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const fallbackFeed = [
    {
      time: "UNAVAILABLE",
      message: "Priority cognition feed unavailable. No external news or generated feed items are being substituted.",
    },
  ];

  const [feed, setFeed] = useState([]);

  useEffect(() => {
    async function loadFeed() {
      const data = await getPriorityFeed();

      if (Array.isArray(data?.events) && data.events.length > 0) {
        const liveFeed = data.events.slice(0, 5).map((event) => ({
          time: formatTime(event.timestamp),
          message: event.message || "Priority cognition event missing message.",
        }));

        setFeed(liveFeed);
      }
    }

    loadFeed();

    const interval = setInterval(loadFeed, 5000);

    return () => clearInterval(interval);
  }, []);

  const visibleFeed = feed.length > 0 ? feed : fallbackFeed;

  return (
    <div className="panel intelligence-feed-panel">
      <h3>INTELLIGENCE FEED</h3>

      <div className="feed-container">
        {visibleFeed.map((item, index) => (
          <div key={index} className="feed-item">
            <span className="feed-dot"></span>
            <span className="feed-time">[{item.time}]</span>
            <span>{item.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default IntelligenceFeedPanel;
