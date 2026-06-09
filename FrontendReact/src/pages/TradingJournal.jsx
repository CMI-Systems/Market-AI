import { useEffect, useState } from "react";
import { getAiccReplay } from "../services/aiccApi";
import "../styles/ClosedBetaPages.css";
import "../styles/TradingJournal.css";

const disclaimer = "For research and intelligence purposes only. Not financial advice.";
const behavioralTags = [
  "Patient",
  "Disciplined",
  "Impulsive",
  "Hesitant",
  "Overconfident",
  "Risk-Aware",
  "FOMO",
  "Rule Break",
];

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
        <h1>OPERATOR DECISION JOURNAL</h1>
        <p>Decision record, thesis capture, execution review, and behavioral reflection.</p>
        <span className="closed-beta-version">AICC Closed Beta v0.1</span>
      </header>

      <section className="closed-beta-summary-grid">
        <div className="closed-beta-card">
          <span>Signal History</span>
          <strong>{signalHistory.length}</strong>
        </div>
        <div className="closed-beta-card">
          <span>Journal Mode</span>
          <strong>OPERATOR</strong>
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

      <section className="closed-beta-panel journal-decision-shell">
        <div className="journal-section-title">
          <span>01</span>
          <h2>Trade Record</h2>
        </div>

        <div className="journal-record-grid">
          <label>
            Symbol
            <input placeholder="AAPL" type="text" />
          </label>
          <label>
            Direction
            <select defaultValue="LONG">
              <option>LONG</option>
              <option>SHORT</option>
              <option>FLAT</option>
            </select>
          </label>
          <label>
            Entry
            <input placeholder="196.20" type="text" />
          </label>
          <label>
            Exit
            <input placeholder="198.05" type="text" />
          </label>
          <label>
            Result
            <select defaultValue="WIN">
              <option>WIN</option>
              <option>LOSS</option>
              <option>FLAT</option>
            </select>
          </label>
        </div>
      </section>

      <section className="journal-two-column">
        <div className="closed-beta-panel">
          <div className="journal-section-title">
            <span>02</span>
            <h2>Trade Thesis</h2>
          </div>
          <textarea placeholder="What was the setup, context, and reason for the decision?" rows="7"></textarea>
        </div>

        <div className="closed-beta-panel">
          <div className="journal-section-title">
            <span>03</span>
            <h2>Execution Review</h2>
          </div>
          <textarea placeholder="Was the entry, exit, sizing, and timing aligned with the plan?" rows="7"></textarea>
        </div>
      </section>

      <section className="closed-beta-panel">
        <div className="journal-section-title">
          <span>04</span>
          <h2>Behavioral Reflection</h2>
        </div>
        <textarea placeholder="What did you feel, notice, override, or execute well during this decision?" rows="6"></textarea>
      </section>

      <section className="closed-beta-panel">
        <div className="journal-section-title">
          <span>05</span>
          <h2>Behavioral Tags</h2>
        </div>
        <div className="journal-tag-grid">
          {behavioralTags.map((tag) => (
            <label key={tag}>
              <input type="checkbox" />
              <span>{tag}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="closed-beta-panel journal-replay-placeholder">
        <div className="journal-section-title">
          <span>06</span>
          <h2>Replay Center Link Placeholder</h2>
        </div>
        <p>Replay Center association is reserved for a future release. No replay integration is active in this journal shell.</p>
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

      <p className="closed-beta-disclaimer">{disclaimer}</p>
    </div>
  );
}

export default TradingJournal;
