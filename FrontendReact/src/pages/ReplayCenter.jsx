import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import "../styles/ReplayCenter.css";

const sessionVerdict = [
  { label: "Session Verdict", value: "GOOD SESSION" },
  { label: "Session Score", value: "82" },
  { label: "Execution Grade", value: "B+" },
  { label: "Behavior Grade", value: "B" },
  { label: "Discipline Grade", value: "A-" },
  { label: "Strongest Trait", value: "Discipline" },
  { label: "Weakest Trait", value: "Conviction" },
];

const operatorDebrief = [
  { label: "Primary Strength", value: "Waited for confirmation on the highest-quality setups." },
  { label: "Primary Weakness", value: "Late-session selectivity degraded after the strongest trades were complete." },
  { label: "Primary Mistake", value: "Chased the final TSLA continuation without fresh liquidity support." },
  { label: "Primary Success", value: "Protected gains by keeping risk controlled after the midday range." },
];

const sampleTrades = [
  {
    id: "trade-1",
    number: 1,
    time: "09:42 AM",
    symbol: "AAPL",
    direction: "LONG",
    result: "WIN",
    entry: "$196.20",
    exit: "$198.05",
    structure: "Breakout retest held above prior range.",
    momentum: "Expanding after opening compression.",
    liquidity: "Moderate liquidity with clean bid support.",
    volatility: "Controlled expansion.",
    relativeStrength: "Leading versus benchmark.",
    narrative: "Technology leadership remained constructive during the first hour.",
  },
  {
    id: "trade-2",
    number: 2,
    time: "10:18 AM",
    symbol: "MSFT",
    direction: "LONG",
    result: "LOSS",
    entry: "$482.40",
    exit: "$480.90",
    structure: "Failed continuation near intraday resistance.",
    momentum: "Momentum slowed after initial push.",
    liquidity: "Liquidity thinned into resistance.",
    volatility: "Elevated but orderly.",
    relativeStrength: "Market performing.",
    narrative: "Continuation attempt lacked broad confirmation.",
  },
  {
    id: "trade-3",
    number: 3,
    time: "11:07 AM",
    symbol: "NVDA",
    direction: "LONG",
    result: "WIN",
    entry: "$148.10",
    exit: "$151.30",
    structure: "Expansion from tight consolidation.",
    momentum: "Accelerating with strong follow-through.",
    liquidity: "Strong liquidity confirmation.",
    volatility: "Elevated but constructive.",
    relativeStrength: "Leading.",
    narrative: "AI semiconductor theme showed clear traction.",
  },
  {
    id: "trade-4",
    number: 4,
    time: "01:24 PM",
    symbol: "SPY",
    direction: "SHORT",
    result: "FLAT",
    entry: "$612.80",
    exit: "$612.65",
    structure: "Range rejection without breakdown confirmation.",
    momentum: "Slightly slowing.",
    liquidity: "Moderate two-sided liquidity.",
    volatility: "Compressed.",
    relativeStrength: "Market performing.",
    narrative: "Index remained balanced while leadership narrowed.",
  },
  {
    id: "trade-5",
    number: 5,
    time: "02:46 PM",
    symbol: "TSLA",
    direction: "LONG",
    result: "LOSS",
    entry: "$227.50",
    exit: "$224.90",
    structure: "Late-session breakout failed.",
    momentum: "Exhausting into entry.",
    liquidity: "Weak liquidity support after entry.",
    volatility: "Elevated.",
    relativeStrength: "Lagging.",
    narrative: "Speculative follow-through was not supported by broader risk appetite.",
  },
];

const behavioralReview = [
  { label: "Patience", score: 78 },
  { label: "Discipline", score: 84 },
  { label: "Conviction", score: 72 },
  { label: "Risk Management", score: 80 },
  { label: "Execution Quality", score: 76 },
  { label: "Emotional Stability", score: 88 },
];

const mistakeIntelligence = [
  { type: "FOMO", frequency: 1, severity: "Moderate", impact: "Pulled entry timing forward." },
  { type: "Chasing", frequency: 2, severity: "High", impact: "Reduced reward-to-risk quality." },
  { type: "Overtrading", frequency: 0, severity: "Low", impact: "No material impact detected." },
  { type: "Early Exit", frequency: 1, severity: "Moderate", impact: "Left partial upside unrealized." },
  { type: "Late Exit", frequency: 1, severity: "Moderate", impact: "Expanded loss after failed momentum." },
  { type: "Oversizing", frequency: 0, severity: "Low", impact: "Sizing remained controlled." },
  { type: "Undersizing", frequency: 1, severity: "Low", impact: "Reduced gain capture on best setup." },
  { type: "Rule Violation", frequency: 1, severity: "High", impact: "Entered before required confirmation." },
  { type: "Narrative Ignored", frequency: 1, severity: "Moderate", impact: "Fought weakening speculative context." },
  { type: "Risk Ignored", frequency: 1, severity: "High", impact: "Held after liquidity support weakened." },
];

const topMistakes = [
  mistakeIntelligence.find((item) => item.type === "Chasing"),
  mistakeIntelligence.find((item) => item.type === "Rule Violation"),
  mistakeIntelligence.find((item) => item.type === "Risk Ignored"),
].filter(Boolean);

const nextSessionFocus = [
  { label: "Primary Focus", value: "Late-session selectivity" },
  { label: "Behavioral Goal", value: "Pause before entries when urgency increases." },
  { label: "Execution Goal", value: "Wait for structure confirmation before breakout continuation." },
  { label: "Risk Goal", value: "Cut exposure when liquidity support weakens." },
];

function ReplayCenter() {
  const location = useLocation();
  const journalEntry = location.state?.journalEntry || null;
  const [selectedTradeId, setSelectedTradeId] = useState(sampleTrades[0].id);

  const selectedTrade = useMemo(
    () => sampleTrades.find((trade) => trade.id === selectedTradeId) || sampleTrades[0],
    [selectedTradeId]
  );

  return (
    <div className="replay-center-page">
      <header className="replay-header">
        <span>Operator Intelligence Review System</span>
        <h1>REPLAY CENTER</h1>
        <p>What happened, why it happened, how the operator performed, and what improves next.</p>
      </header>

      {journalEntry && (
        <section className="replay-section replay-operator-debrief">
          <div className="replay-section-title">
            <span>Journal Context</span>
            <h2>REVIEWING JOURNAL ENTRY</h2>
          </div>

          <div className="replay-debrief-grid">
            <div className="replay-debrief-card">
              <span>Symbol</span>
              <strong>{journalEntry.symbol || "AAPL"}</strong>
            </div>
            <div className="replay-debrief-card">
              <span>Direction</span>
              <strong>{journalEntry.direction || "LONG"}</strong>
            </div>
            <div className="replay-debrief-card">
              <span>Result</span>
              <strong>{journalEntry.result || "WIN"}</strong>
            </div>
            <div className="replay-debrief-card">
              <span>Behavioral Tags</span>
              <strong>{journalEntry.behavioralTags?.join(", ") || "No tags selected"}</strong>
            </div>
            <div className="replay-debrief-card">
              <span>Trade Thesis</span>
              <strong>{journalEntry.tradeThesis || "No thesis supplied."}</strong>
            </div>
            <div className="replay-debrief-card">
              <span>Execution Review</span>
              <strong>{journalEntry.executionReview || "No execution review supplied."}</strong>
            </div>
            <div className="replay-debrief-card">
              <span>Behavioral Reflection</span>
              <strong>{journalEntry.behavioralReflection || "No behavioral reflection supplied."}</strong>
            </div>
          </div>
        </section>
      )}

      <section className="replay-section replay-session-verdict replay-operator-performance">
        <div className="replay-section-title">
          <span>01</span>
          <h2>OPERATOR PERFORMANCE</h2>
        </div>

        <div className="replay-verdict-grid">
          {sessionVerdict.map((item) => (
            <div className="replay-summary-card" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="replay-section replay-operator-debrief">
        <div className="replay-section-title">
          <span>02</span>
          <h2>OPERATOR DEBRIEF</h2>
        </div>

        <div className="replay-debrief-grid">
          {operatorDebrief.map((item) => (
            <div className="replay-debrief-card" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="replay-section replay-behavior-hero">
        <div className="replay-section-title">
          <span>03</span>
          <h2>BEHAVIORAL REVIEW HERO</h2>
        </div>

        <div className="replay-scorecard-grid">
          {behavioralReview.map((item) => (
            <div className="replay-scorecard" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.score}</strong>
              <div className="replay-score-track">
                <i style={{ width: `${item.score}%` }}></i>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="replay-section replay-top-mistakes-section">
        <div className="replay-section-title">
          <span>04</span>
          <h2>TOP MISTAKES SUMMARY</h2>
        </div>

        <div className="replay-top-mistakes-grid">
          {topMistakes.map((item, index) => (
            <div className="replay-top-mistake-card" key={item.type}>
              <span>#{index + 1} {item.type}</span>
              <div><em>Frequency</em><strong>{item.frequency}</strong></div>
              <div><em>Severity</em><strong>{item.severity}</strong></div>
              <p>{item.impact}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="replay-section replay-review-layout">
        <div>
          <div className="replay-section-title">
            <span>05</span>
            <h2>TRADE TIMELINE</h2>
          </div>

          <div className="replay-timeline">
            {sampleTrades.map((trade) => (
              <button
                className={selectedTrade.id === trade.id ? "replay-trade-active" : ""}
                key={trade.id}
                onClick={() => setSelectedTradeId(trade.id)}
                type="button"
              >
                <span>Trade #{trade.number}</span>
                <strong>{trade.time}</strong>
                <em>{trade.symbol}</em>
                <b>{trade.direction}</b>
                <p>{trade.result}</p>
              </button>
            ))}
          </div>
        </div>

        <aside>
          <div className="replay-section-title">
            <span>06</span>
            <h2>TRADE BREAKDOWN</h2>
          </div>

          <div className="replay-breakdown-card">
            <h3>
              Trade #{selectedTrade.number} / {selectedTrade.symbol}
            </h3>

            <div className="replay-detail-grid">
              <div><span>Entry</span><strong>{selectedTrade.entry}</strong></div>
              <div><span>Exit</span><strong>{selectedTrade.exit}</strong></div>
              <div><span>Market Structure</span><strong>{selectedTrade.structure}</strong></div>
              <div><span>Momentum</span><strong>{selectedTrade.momentum}</strong></div>
              <div><span>Liquidity</span><strong>{selectedTrade.liquidity}</strong></div>
              <div><span>Volatility</span><strong>{selectedTrade.volatility}</strong></div>
              <div><span>Relative Strength</span><strong>{selectedTrade.relativeStrength}</strong></div>
              <div><span>Narrative Context</span><strong>{selectedTrade.narrative}</strong></div>
            </div>
          </div>
        </aside>
      </section>

      <section className="replay-section">
        <div className="replay-section-title">
          <span>07</span>
          <h2>MISTAKE INTELLIGENCE</h2>
        </div>

        <div className="replay-mistake-table">
          {mistakeIntelligence.map((item) => (
            <div className="replay-mistake-row" key={item.type}>
              <div><span>Mistake Type</span><strong>{item.type}</strong></div>
              <div><span>Frequency</span><strong>{item.frequency}</strong></div>
              <div><span>Severity</span><strong>{item.severity}</strong></div>
              <div><span>Impact</span><strong>{item.impact}</strong></div>
            </div>
          ))}
        </div>
      </section>

      <section className="replay-section replay-improvement-section">
        <div className="replay-section-title">
          <span>08</span>
          <h2>MISSION FOR NEXT SESSION</h2>
        </div>

        <div className="replay-improvement-grid">
          {nextSessionFocus.map((item) => (
            <div className="replay-improvement-card" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default ReplayCenter;
