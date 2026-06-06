import { useEffect, useState } from "react";
import { getAiccReplay } from "../services/aiccApi";
import "../styles/ClosedBetaPages.css";

const disclaimer = "For research and intelligence purposes only. Not financial advice.";

function TradingJournal() {
  const [replay, setReplay] = useState([]);

  useEffect(() => {
    async function loadJournalSignals() {
      const data = await getAiccReplay();
      setReplay(data);
    }

    loadJournalSignals();

    const interval = setInterval(loadJournalSignals, 20000);

    return () => clearInterval(interval);
  }, []);

  const signalHistory = replay.filter((event) => event.type === "SIGNAL").slice(0, 6);

  return (
    <div className="closed-beta-page">
      <header className="closed-beta-header">
        <h1>TRADING JOURNAL</h1>
        <p>Closed Beta Trading Journal</p>
        <span className="closed-beta-version">AICC Closed Beta v0.1</span>
      </header>

      <section className="closed-beta-summary-grid">
        <div className="closed-beta-card">
          <span>Signal History</span>
          <strong>{signalHistory.length}</strong>
        </div>
        <div className="closed-beta-card">
          <span>Manual Logging</span>
          <strong>FUTURE RELEASE</strong>
        </div>
        <div className="closed-beta-card">
          <span>Research Mode</span>
          <strong>ACTIVE</strong>
        </div>
        <div className="closed-beta-card">
          <span>Version</span>
          <strong>CLOSED BETA</strong>
        </div>
      </section>

      <section className="closed-beta-panel">
        <h2>Signal History</h2>
        <div className="closed-beta-list">
          {signalHistory.map((event) => (
            <article key={event.id}>
              <span>{event.symbol || "SYSTEM"}</span>
              <strong>{event.title}</strong>
              <p>{event.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="closed-beta-panel">
        <h2>Manual Trade Logging</h2>
        <p>Manual trade notes, execution review, and operator annotations are scheduled for a future release.</p>
      </section>

      <p className="closed-beta-disclaimer">{disclaimer}</p>
    </div>
  );
}

export default TradingJournal;
