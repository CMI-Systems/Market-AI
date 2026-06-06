import { useEffect, useMemo, useState } from "react";
import { getAiccReplay, getFallbackAiccReplay } from "../services/aiccApi";
import "../styles/ReplayCenter.css";

const replayFilters = [
  "All",
  "Signals",
  "Alerts",
  "Consensus",
  "Executive",
  "Provider",
  "Failsafe",
];

function formatReplayTime(timestamp) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) return "DETECTING";

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function filterType(label) {
  if (label === "All") return "ALL";
  return label.replace(/s$/, "").toUpperCase();
}

function matchesReplayFilter(event, selectedFilter) {
  const type = filterType(selectedFilter);

  return type === "ALL" || event.type === type;
}

function matchesReplaySearch(event, searchTerm) {
  const normalized = searchTerm.trim().toLowerCase();

  if (!normalized) return true;

  return [
    event.symbol,
    event.type,
    event.title,
    event.source,
  ].some((value) => String(value || "").toLowerCase().includes(normalized));
}

function ReplayCenter() {
  const [replayEvents, setReplayEvents] = useState(getFallbackAiccReplay());
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEventId, setSelectedEventId] = useState(null);

  useEffect(() => {
    async function loadReplay() {
      const data = await getAiccReplay();
      setReplayEvents(data);
      setSelectedEventId((currentId) => currentId || data[0]?.id || null);
    }

    loadReplay();

    const interval = setInterval(loadReplay, 20000);

    return () => clearInterval(interval);
  }, []);

  const sortedEvents = useMemo(
    () =>
      [...replayEvents].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
    [replayEvents]
  );
  const visibleEvents = sortedEvents.filter(
    (event) =>
      matchesReplayFilter(event, selectedFilter) &&
      matchesReplaySearch(event, searchTerm)
  );
  const selectedEvent =
    sortedEvents.find((event) => event.id === selectedEventId) ||
    visibleEvents[0] ||
    sortedEvents[0];
  const signalEvents = sortedEvents.filter((event) => event.type === "SIGNAL").length;
  const alertEvents = sortedEvents.filter((event) => event.type === "ALERT").length;
  const riskEvents = sortedEvents.filter((event) =>
    ["HIGH", "WARNING", "CRITICAL"].includes(String(event.risk || "").toUpperCase())
  ).length;

  return (
    <div className="replay-center-page">
      <header className="replay-header">
        <h1>REPLAY CENTER</h1>
        <p>Recent AICC cognition, provider signals, alerts, and executive decisions.</p>
      </header>

      <section className="replay-summary-grid">
        <div className="replay-summary-card">
          <span>Total Events</span>
          <strong>{sortedEvents.length}</strong>
        </div>

        <div className="replay-summary-card">
          <span>Signal Events</span>
          <strong>{signalEvents}</strong>
        </div>

        <div className="replay-summary-card">
          <span>Alert Events</span>
          <strong>{alertEvents}</strong>
        </div>

        <div className="replay-summary-card">
          <span>Risk Events</span>
          <strong>{riskEvents}</strong>
        </div>
      </section>

      <section className="replay-controls">
        <input
          type="search"
          placeholder="Search symbol, type, title, or source"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />

        <div className="replay-filters">
          {replayFilters.map((filter) => (
            <button
              className={selectedFilter === filter ? "replay-filter-active" : ""}
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              type="button"
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      <section className="replay-layout">
        <div>
          <div className="replay-section-title">
            <span>01</span>
            <h2>REPLAY TIMELINE</h2>
          </div>

          <div className="replay-timeline">
            {visibleEvents.map((event) => (
              <button
                className={selectedEvent?.id === event.id ? "replay-event-active" : ""}
                key={event.id}
                onClick={() => setSelectedEventId(event.id)}
                type="button"
              >
                <span>{formatReplayTime(event.timestamp)}</span>
                <strong>{event.title}</strong>
                <em>{event.type}</em>
                <p>{event.summary}</p>
              </button>
            ))}
          </div>
        </div>

        <aside className="replay-detail-panel">
          <div className="replay-section-title">
            <span>02</span>
            <h2>REPLAY DETAIL</h2>
          </div>

          {selectedEvent ? (
            <div className="replay-detail-card">
              <h3>{selectedEvent.title}</h3>

              <div className="replay-detail-grid">
                <div>
                  <span>Timestamp</span>
                  <strong>{formatReplayTime(selectedEvent.timestamp)}</strong>
                </div>
                <div>
                  <span>Type</span>
                  <strong>{selectedEvent.type}</strong>
                </div>
                <div>
                  <span>Symbol</span>
                  <strong>{selectedEvent.symbol || "SYSTEM"}</strong>
                </div>
                <div>
                  <span>Confidence</span>
                  <strong>{selectedEvent.confidence ?? "UNAVAILABLE"}</strong>
                </div>
                <div>
                  <span>Risk</span>
                  <strong>{selectedEvent.risk}</strong>
                </div>
                <div>
                  <span>Source</span>
                  <strong>{selectedEvent.source}</strong>
                </div>
                <div>
                  <span>Consensus</span>
                  <strong>{selectedEvent.cognition?.consensus || "UNKNOWN"}</strong>
                </div>
                <div>
                  <span>Environment</span>
                  <strong>{selectedEvent.cognition?.environment || "UNKNOWN"}</strong>
                </div>
                <div>
                  <span>Decision</span>
                  <strong>{selectedEvent.cognition?.decision || "OBSERVE"}</strong>
                </div>
                <div>
                  <span>Escalation</span>
                  <strong>{selectedEvent.cognition?.escalation || "NONE"}</strong>
                </div>
              </div>

              <p>{selectedEvent.summary}</p>
            </div>
          ) : (
            <div className="replay-detail-card">
              <h3>NO REPLAY EVENT</h3>
              <p>No replay event matches the current filter.</p>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}

export default ReplayCenter;
