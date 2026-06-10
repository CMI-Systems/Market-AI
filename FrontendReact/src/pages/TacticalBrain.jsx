import { useEffect, useState } from "react";
import { analyzeTacticalState } from "../services/intelligence/tacticalBrain";
import {
  getMarketCandles,
  getMarketProviderStatus,
  getMarketQuotes,
  getOfflineMarketProviderStatus,
  getProviderSignals,
} from "../services/marketProviderApi";
import "../styles/ClosedBetaPages.css";
import "../styles/TacticalBrain.css";

const symbols = ["SPY", "QQQ", "NVDA", "AAPL", "MSFT", "TSLA"];
const defaultTacticalState = analyzeTacticalState({
  symbol: symbols[0],
  candles: [],
  quote: null,
});

function displayState(value) {
  if (!value) return "OBSERVING";
  return String(value).replace(/_/g, " ");
}

function TacticalBrain() {
  const [selectedSymbol, setSelectedSymbol] = useState(symbols[0]);
  const [tacticalState, setTacticalState] = useState(defaultTacticalState);
  const [providerStatus, setProviderStatus] = useState(getOfflineMarketProviderStatus());
  const [providerSignals, setProviderSignals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadTacticalBrain() {
      setIsLoading(true);

      try {
        const [providerData, quoteData, candleData, signalData] = await Promise.all([
          getMarketProviderStatus(),
          getMarketQuotes([selectedSymbol]),
          getMarketCandles(selectedSymbol, "5Min", 80),
          getProviderSignals(symbols),
        ]);

        if (!active) return;

        const candles = Array.isArray(candleData) ? candleData : [];
        const quote = Array.isArray(quoteData) ? quoteData[0] : null;
        const analysis = analyzeTacticalState({
          symbol: selectedSymbol,
          candles,
          quote,
        });

        setTacticalState(analysis);
        if (providerData) setProviderStatus(providerData);
        setProviderSignals(Array.isArray(signalData) ? signalData : []);
      } catch {
        if (!active) return;

        setTacticalState(analyzeTacticalState({
          symbol: selectedSymbol,
          candles: [],
          quote: null,
        }));
        setProviderStatus((current) => current || getOfflineMarketProviderStatus());
        setProviderSignals([]);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadTacticalBrain();

    const interval = setInterval(loadTacticalBrain, 15000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [selectedSymbol]);

  const warnings = tacticalState.warnings?.length
    ? tacticalState.warnings
    : ["No tactical warnings active."];
  const evidence = tacticalState.evidence?.length
    ? tacticalState.evidence
    : ["Tactical Brain is waiting for provider candles."];
  const tacticalHeadline = `${displayState(tacticalState.tacticalState)} / ${displayState(tacticalState.structure)}`;
  const tacticalSummary =
    `${displayState(tacticalState.trend)} trend with ${displayState(tacticalState.momentum)} momentum, ${displayState(tacticalState.liquidity)} liquidity, and ${displayState(tacticalState.volatility)} volatility.`;
  const tacticalNarrativeSummary =
    `Current structure is ${displayState(tacticalState.structure)} while volatility is ${displayState(tacticalState.volatility)} and relative strength is ${displayState(tacticalState.relativeStrength)}.`;
  const primaryTacticalDriver =
    evidence.find((item) => /trend|momentum|structure|liquidity|volatility|strength/i.test(item))
    || evidence[0]
    || "Tactical driver unavailable.";
  const primaryTacticalRisk =
    warnings.find((item) => !/No tactical warnings active/i.test(item))
    || `Primary risk context: ${displayState(tacticalState.volatility)} volatility.`;
  const tacticalFlow = [
    { label: "TREND", value: displayState(tacticalState.trend) },
    { label: "STRUCTURE", value: displayState(tacticalState.structure) },
    { label: "MOMENTUM", value: displayState(tacticalState.momentum) },
    { label: "LIQUIDITY", value: displayState(tacticalState.liquidity) },
    { label: "VOLATILITY", value: displayState(tacticalState.volatility) },
    { label: "TACTICAL STATE", value: displayState(tacticalState.tacticalState) },
  ];

  return (
    <div className="closed-beta-page">
      <header className="closed-beta-header">
        <h1>TACTICAL BRAIN</h1>
        <p>Closed beta tactical signal and opportunity dashboard.</p>
        <span className="closed-beta-version">AICC Closed Beta v0.1</span>
      </header>

      <section className="closed-beta-panel tactical-control-panel">
        <h2>Symbol Control</h2>
        <label htmlFor="tactical-symbol-select">
          <span>Selected Symbol</span>
          <select
            id="tactical-symbol-select"
            onChange={(event) => setSelectedSymbol(event.target.value)}
            value={selectedSymbol}
          >
            {symbols.map((symbol) => (
              <option key={symbol} value={symbol}>{symbol}</option>
            ))}
          </select>
        </label>
        {isLoading && <p>Loading provider candles for {selectedSymbol}.</p>}
      </section>

      <section className="closed-beta-panel tactical-verdict-section">
        <div className="tactical-section-title">
          <span>01</span>
          <h2>TACTICAL VERDICT</h2>
        </div>

        <div className="tactical-verdict-grid">
          <div className="tactical-verdict-primary">
            <span>Primary Tactical State</span>
            <strong>{displayState(tacticalState.tacticalState)}</strong>
            <p>{tacticalSummary}</p>
          </div>
          <div>
            <span>Confidence</span>
            <strong>{tacticalState.confidence}%</strong>
          </div>
          <div>
            <span>Primary Tactical Driver</span>
            <p>{primaryTacticalDriver}</p>
          </div>
          <div>
            <span>Primary Tactical Risk</span>
            <p>{primaryTacticalRisk}</p>
          </div>
        </div>
      </section>

      <section className="closed-beta-panel tactical-flow-section">
        <div className="tactical-section-title">
          <span>02</span>
          <h2>TACTICAL INTELLIGENCE FLOW</h2>
        </div>

        <div className="tactical-flow-stack">
          {tacticalFlow.map((node, index) => (
            <div className="tactical-flow-step" key={node.label}>
              <div className={`tactical-flow-node${index === tacticalFlow.length - 1 ? " tactical-flow-final" : ""}`}>
                <span>{node.label}</span>
                <strong>{node.value}</strong>
              </div>
              {index < tacticalFlow.length - 1 && (
                <b aria-hidden="true">&darr;</b>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="closed-beta-panel tactical-status-section">
        <div className="tactical-section-title">
          <span>03</span>
          <h2>TACTICAL STATUS BOARD</h2>
        </div>

        <div className="tactical-status-grid">
          <div className="closed-beta-card">
            <span>Confidence</span>
            <strong>{tacticalState.confidence}%</strong>
          </div>
          <div className="closed-beta-card">
            <span>Trend</span>
            <strong>{displayState(tacticalState.trend)}</strong>
          </div>
          <div className="closed-beta-card">
            <span>Structure</span>
            <strong>{displayState(tacticalState.structure)}</strong>
          </div>
          <div className="closed-beta-card">
            <span>Momentum</span>
            <strong>{displayState(tacticalState.momentum)}</strong>
          </div>
          <div className="closed-beta-card">
            <span>Liquidity</span>
            <strong>{displayState(tacticalState.liquidity)}</strong>
          </div>
          <div className="closed-beta-card">
            <span>Volatility</span>
            <strong>{displayState(tacticalState.volatility)}</strong>
          </div>
          <div className="closed-beta-card">
            <span>Relative Strength</span>
            <strong>{displayState(tacticalState.relativeStrength)}</strong>
          </div>
          <div className="closed-beta-card">
            <span>Provider Source</span>
            <strong>{displayState(providerStatus.activeProvider)}</strong>
          </div>
        </div>
      </section>

      <section className="closed-beta-panel tactical-narrative-section">
        <div className="tactical-section-title">
          <span>04</span>
          <h2>TACTICAL NARRATIVE</h2>
        </div>

        <div className="tactical-narrative-grid">
          <div className="tactical-narrative-headline">
            <span>Headline</span>
            <strong>{tacticalHeadline}</strong>
          </div>
          <div>
            <span>Why It Matters</span>
            <p>{tacticalNarrativeSummary}</p>
          </div>
          <div>
            <span>Structure Context</span>
            <p>Structure is reading as {displayState(tacticalState.structure)} with {displayState(tacticalState.momentum)} momentum.</p>
          </div>
          <div>
            <span>Risk Context</span>
            <p>Risk is being framed by {displayState(tacticalState.volatility)} volatility and {displayState(tacticalState.liquidity)} liquidity.</p>
          </div>
        </div>
      </section>

      <section className="closed-beta-panel tactical-support-section">
        <div className="tactical-section-title">
          <span>05</span>
          <h2>TACTICAL EVIDENCE</h2>
        </div>
        <div className="closed-beta-list">
          {evidence.map((item) => (
            <div key={item}>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="closed-beta-panel">
        <div className="tactical-section-title">
          <span>06</span>
          <h2>TACTICAL WARNINGS</h2>
        </div>
        <div className="closed-beta-list">
          {warnings.map((warning) => (
            <div key={warning}>
              <p>{warning}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="closed-beta-panel tactical-support-section">
        <div className="tactical-section-title">
          <span>07</span>
          <h2>TACTICAL SOURCES</h2>
        </div>
        <div className="closed-beta-list">
          {providerSignals.slice(0, 6).map((signal) => (
            <article key={signal.symbol}>
              <span>{signal.symbol}</span>
              <strong>{signal.signal}</strong>
              <p>{signal.confidence}% confidence. {signal.reason}</p>
            </article>
          ))}
          {!providerSignals.length && (
            <article>
              <span>{selectedSymbol}</span>
              <strong>NEUTRAL</strong>
              <p>Provider signals are unavailable. Tactical Brain is using safe local analysis.</p>
            </article>
          )}
        </div>
      </section>
    </div>
  );
}

export default TacticalBrain;
