import { useEffect, useState } from "react";
import { getPriorityFeed } from "../services/cognitionApi";

function IntelligenceFeedPanel() {
  const formatTime = (timestamp) =>
    new Date(timestamp || Date.now()).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  const intelligenceEvents = [
    "Global Scan detected unusual activity in Technology.",
    "Tactical Brain identified bullish momentum expansion.",
    "Behavioral Brain detected elevated crowd optimism.",
    "Failsafe Brain confirmed risk levels remain acceptable.",
    "Newsletter Intelligence processed 5 market events.",
    "Market Pulse updated liquidity conditions.",
    "Institutional Flow shows continued accumulation.",
    "Volatility Compression monitor remains stable.",
  ];

  const fallbackFeed = [
    {
      time: formatTime(),
      message: "Command Center intelligence feed initialized.",
    },
    ...intelligenceEvents.slice(0, 4).map((message) => ({
      time: formatTime(),
      message,
    })),
  ];

  const [feed, setFeed] = useState([]);

  useEffect(() => {
    async function loadFeed() {
      const data = await getPriorityFeed();

      if (Array.isArray(data?.events) && data.events.length > 0) {
        const liveFeed = data.events.slice(0, 5).map((event) => ({
          time: formatTime(event.timestamp),
          message: event.message || "Priority intelligence event received.",
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
