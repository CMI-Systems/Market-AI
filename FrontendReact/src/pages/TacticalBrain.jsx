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

  const strongestSignal = [...providerSignals].sort(
    (a, b) => (b.confidence || 0) - (a.confidence || 0)
  )[0];
  const bullishSignals = providerSignals.filter((signal) =>
    ["BUY WATCH", "MOMENTUM WATCH", "REVERSAL WATCH"].includes(signal.signal)
  );
  const warnings = tacticalState.warnings?.length
    ? tacticalState.warnings
    : ["No tactical warnings active."];
  const evidence = tacticalState.evidence?.length
    ? tacticalState.evidence
    : ["Tactical Brain is waiting for provider candles."];

  return (
    <div className="closed-beta-page">
      <header className="closed-beta-header">
        <h1>TACTICAL BRAIN</h1>
        <p>Closed beta tactical signal and opportunity dashboard.</p>
        <span className="closed-beta-version">AICC Closed Beta v0.1</span>
      </header>

      <section className="closed-beta-panel">
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

      <section className="closed-beta-summary-grid">
        <div className="closed-beta-card">
          <span>Tactical State</span>
          <strong>{displayState(tacticalState.tacticalState)}</strong>
        </div>
        <div className="closed-beta-card">
          <span>Confidence</span>
          <strong>{tacticalState.confidence}% {displayState(tacticalState.confidenceLabel)}</strong>
        </div>
        <div className="closed-beta-card">
          <span>Trend</span>
          <strong>{displayState(tacticalState.trend)}</strong>
        </div>
        <div className="closed-beta-card">
          <span>Momentum</span>
          <strong>{displayState(tacticalState.momentum)}</strong>
        </div>
        <div className="closed-beta-card">
          <span>Structure</span>
          <strong>{displayState(tacticalState.structure)}</strong>
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
          <span>Active Signal</span>
          <strong>{strongestSignal?.signal || "NEUTRAL"}</strong>
        </div>
        <div className="closed-beta-card">
          <span>Signal Confidence</span>
          <strong>{strongestSignal?.confidence || 0}%</strong>
        </div>
        <div className="closed-beta-card">
          <span>Market Direction</span>
          <strong>{bullishSignals.length ? "RISING" : displayState(tacticalState.trend)}</strong>
        </div>
        <div className="closed-beta-card">
          <span>Provider Source</span>
          <strong>{displayState(providerStatus.activeProvider)}</strong>
        </div>
      </section>

      <section className="closed-beta-grid">
        <div className="closed-beta-panel">
          <h2>Evidence</h2>
          <div className="closed-beta-list">
            {evidence.map((item) => (
              <div key={item}>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="closed-beta-panel">
          <h2>Warnings</h2>
          <div className="closed-beta-list">
            {warnings.map((warning) => (
              <div key={warning}>
                <p>{warning}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="closed-beta-panel">
        <h2>Recent Tactical Signals</h2>
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
