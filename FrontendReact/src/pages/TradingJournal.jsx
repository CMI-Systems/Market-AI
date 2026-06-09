import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
const tradeAssessment = [
  { label: "Trade Assessment", value: "VALID SETUP" },
  { label: "Trade Quality", value: "B+" },
  { label: "Execution Quality", value: "B" },
  { label: "Behavioral Quality", value: "B-" },
  { label: "Rule Compliance", value: "MOSTLY ALIGNED" },
  { label: "Strongest Element", value: "Structure Confirmation" },
  { label: "Weakest Element", value: "Exit Patience" },
];

function TradingJournal() {
  const navigate = useNavigate();
  const [replay, setReplay] = useState([]);
  const [journalEntry, setJournalEntry] = useState({
    symbol: "AAPL",
    direction: "LONG",
    result: "WIN",
    tradeThesis: "Breakout retest with constructive market structure and clear leadership support.",
    executionReview: "Entry followed the plan, but exit management could have been more patient.",
    behavioralReflection: "Stayed calm through the first pullback and avoided adding size after entry.",
    behavioralTags: ["Patient", "Disciplined", "Risk-Aware"],
  });

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
  const updateJournalEntry = (field, value) => {
    setJournalEntry((current) => ({
      ...current,
      [field]: value,
    }));
  };
  const toggleBehavioralTag = (tag) => {
    setJournalEntry((current) => {
      const tags = current.behavioralTags.includes(tag)
        ? current.behavioralTags.filter((item) => item !== tag)
        : [...current.behavioralTags, tag];

      return {
        ...current,
        behavioralTags: tags,
      };
    });
  };
  const openReplayReview = () => {
    navigate("/replay-center", {
      state: {
        journalEntry,
      },
    });
  };

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

      <section className="closed-beta-panel journal-assessment-layer">
        <div className="journal-section-title">
          <span>01</span>
          <h2>Trade Assessment</h2>
        </div>

        <div className="journal-assessment-grid">
          {tradeAssessment.map((item) => (
            <div className="journal-assessment-card" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="closed-beta-panel journal-decision-shell">
        <div className="journal-section-title">
          <span>02</span>
          <h2>Trade Record</h2>
        </div>

        <div className="journal-record-grid">
          <label>
            Symbol
            <input
              placeholder="AAPL"
              type="text"
              value={journalEntry.symbol}
              onChange={(event) => updateJournalEntry("symbol", event.target.value)}
            />
          </label>
          <label>
            Direction
            <select
              value={journalEntry.direction}
              onChange={(event) => updateJournalEntry("direction", event.target.value)}
            >
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
            <select
              value={journalEntry.result}
              onChange={(event) => updateJournalEntry("result", event.target.value)}
            >
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
            <span>03</span>
            <h2>Trade Thesis</h2>
          </div>
          <textarea
            placeholder="What was the setup, context, and reason for the decision?"
            rows="7"
            value={journalEntry.tradeThesis}
            onChange={(event) => updateJournalEntry("tradeThesis", event.target.value)}
          ></textarea>
        </div>

        <div className="closed-beta-panel">
          <div className="journal-section-title">
            <span>04</span>
            <h2>Execution Review</h2>
          </div>
          <textarea
            placeholder="Was the entry, exit, sizing, and timing aligned with the plan?"
            rows="7"
            value={journalEntry.executionReview}
            onChange={(event) => updateJournalEntry("executionReview", event.target.value)}
          ></textarea>
        </div>
      </section>

      <section className="closed-beta-panel">
        <div className="journal-section-title">
          <span>05</span>
          <h2>Behavioral Reflection</h2>
        </div>
        <textarea
          placeholder="What did you feel, notice, override, or execute well during this decision?"
          rows="6"
          value={journalEntry.behavioralReflection}
          onChange={(event) => updateJournalEntry("behavioralReflection", event.target.value)}
        ></textarea>
      </section>

      <section className="closed-beta-panel">
        <div className="journal-section-title">
          <span>06</span>
          <h2>Behavioral Tags</h2>
        </div>
        <div className="journal-tag-grid">
          {behavioralTags.map((tag) => (
            <label key={tag}>
              <input
                type="checkbox"
                checked={journalEntry.behavioralTags.includes(tag)}
                onChange={() => toggleBehavioralTag(tag)}
              />
              <span>{tag}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="closed-beta-panel journal-replay-placeholder">
        <div className="journal-section-title">
          <span>07</span>
          <h2>Open Replay Review</h2>
        </div>
        <p>Send this placeholder journal context to Replay Center for review.</p>
        <button type="button" onClick={openReplayReview}>
          Open Replay Review
        </button>
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
