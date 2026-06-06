import { useEffect, useMemo, useState } from "react";
import { getAiccReplay } from "../services/aiccApi";
import "../styles/ClosedBetaPages.css";

function Archives() {
  const [replay, setReplay] = useState([]);

  useEffect(() => {
    async function loadArchive() {
      const data = await getAiccReplay();
      setReplay(data);
    }

    loadArchive();

    const interval = setInterval(loadArchive, 20000);

    return () => clearInterval(interval);
  }, []);

  const categories = useMemo(
    () => [...new Set(replay.map((event) => event.type))],
    [replay]
  );

  return (
    <div className="closed-beta-page">
      <header className="closed-beta-header">
        <h1>ARCHIVES</h1>
        <p>Replay Archive</p>
        <span className="closed-beta-version">AICC Closed Beta v0.1</span>
      </header>

      <section className="closed-beta-summary-grid">
        <div className="closed-beta-card">
          <span>Replay Events</span>
          <strong>{replay.length}</strong>
        </div>
        <div className="closed-beta-card">
          <span>Categories</span>
          <strong>{categories.length}</strong>
        </div>
        <div className="closed-beta-card">
          <span>Search</span>
          <strong>FUTURE RELEASE</strong>
        </div>
        <div className="closed-beta-card">
          <span>Archive Mode</span>
          <strong>CLOSED BETA</strong>
        </div>
      </section>

      <section className="closed-beta-grid">
        <div className="closed-beta-panel">
          <h2>Replay Categories</h2>
          <div className="closed-beta-list">
            {categories.map((category) => (
              <div key={category}>
                <span>Category</span>
                <strong>{category}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="closed-beta-panel">
          <h2>Latest Replay Events</h2>
          <div className="closed-beta-list">
            {replay.slice(0, 6).map((event) => (
              <article key={event.id}>
                <span>{event.type}</span>
                <strong>{event.title}</strong>
                <p>{event.summary}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Archives;
