import { useEffect, useMemo, useRef, useState } from "react";
import MarketPriceChart from "../components/charts/MarketPriceChart";
import {
  CHART_TIMEFRAMES,
  getChartDataStatus,
  getValidatedChartData,
} from "../services/chartDataService";
import {
  getConfidence,
  getInstitutionalFlow,
  getLiquidityPressure,
  getStrategicEnvironment,
} from "../services/cognitionApi";
import {
  translateConfidence,
  translateConsensus,
  translateEnvironment,
  translateInstitutionalFlow,
  translateLiquidity,
} from "../services/intelligenceTranslator";
import "../styles/MarketPulse.css";

const SYMBOLS = ["SPY", "QQQ", "NVDA", "AAPL", "MSFT"];

const BLOCKED_STATUSES = new Set([
  "BLOCKED",
  "INVALID_TIMESTAMP",
  "INVALID_OHLC",
  "INVALID_NUMERIC_DATA",
  "SYMBOL_MISMATCH",
  "UNKNOWN_SOURCE",
  "SIMULATED",
  "GENERATED",
]);

function formatLabel(value, fallback = "UNAVAILABLE") {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value).replace(/_/g, " ");
}

function formatTimestamp(value) {
  if (!value) return "UNAVAILABLE";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "INVALID";
  return date.toLocaleString();
}

function formatDataAge(value) {
  if (value === undefined || value === null || value === "") return "UNKNOWN";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return String(value);
  if (numeric < 60000) return `${Math.round(numeric / 1000)}s`;
  if (numeric < 3600000) return `${Math.round(numeric / 60000)}m`;
  if (numeric < 86400000) return `${Math.round(numeric / 3600000)}h`;
  return `${Math.round(numeric / 86400000)}d`;
}

function formatPercent(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "UNAVAILABLE";
  return `${numeric > 0 ? "+" : ""}${numeric.toFixed(2)}%`;
}

function formatPrice(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "UNAVAILABLE";
  return `$${numeric.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function safeScore(confidence) {
  const numeric = Number(confidence?.score);
  if (!Number.isFinite(numeric)) return null;
  return Math.max(0, Math.min(100, Math.round(numeric * 100)));
}

function calculateVolatility(candles = []) {
  const recent = candles.slice(-20);
  if (recent.length < 2) return null;
  const latest = recent[recent.length - 1];
  const high = Math.max(...recent.map((candle) => Number(candle.high)));
  const low = Math.min(...recent.map((candle) => Number(candle.low)));
  const close = Number(latest.close);

  if (![high, low, close].every(Number.isFinite) || close <= 0) return null;
  return ((high - low) / close) * 100;
}

function calculateAverageVolume(candles = []) {
  const volumes = candles
    .slice(-20)
    .map((candle) => Number(candle.volume))
    .filter((volume) => Number.isFinite(volume) && volume >= 0);

  if (!volumes.length) return null;
  return Math.round(volumes.reduce((total, volume) => total + volume, 0) / volumes.length);
}

function classifyPulseState({ loading, chartData, confidence, strategicEnvironment }) {
  if (loading) return "LOADING";

  const status = chartData
    ? getChartDataStatus({
        status: chartData.status,
        validation: chartData.validation,
        provenance: chartData.provenance,
        error: chartData.error,
      })
    : "DATA UNAVAILABLE";
  const validationStatus = chartData?.validation?.status;
  const sourceType = chartData?.provenance?.sourceType;

  if (BLOCKED_STATUSES.has(validationStatus) || BLOCKED_STATUSES.has(sourceType)) {
    return "BLOCKED";
  }

  if (["DATA UNAVAILABLE", "PROVIDER OFFLINE"].includes(status)) {
    return status.replace(" ", "_");
  }

  if (["STALE", "CACHED", "PARTIAL"].includes(status)) {
    return "DEGRADED";
  }

  const confidenceLevel = String(confidence?.level || "").toUpperCase();
  const environment = String(strategicEnvironment?.environment || strategicEnvironment?.regime || "").toUpperCase();

  if (confidenceLevel === "DATA_UNAVAILABLE" || environment === "DATA_UNAVAILABLE") return "DATA_UNAVAILABLE";
  if (["RISK_OFF", "CRISIS"].includes(environment)) return "BEARISH";
  if (["EXPANSION", "OPTIMAL"].includes(environment)) return "BULLISH";
  if (["MIXED", "CAUTION", "CAUTIOUS"].includes(environment)) return "MIXED";
  if (["NEUTRAL", "STABLE"].includes(environment)) return "NEUTRAL";
  return "UNKNOWN";
}

function Metric({ label, value, detail }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{formatLabel(value)}</strong>
      {detail && <small>{detail}</small>}
    </div>
  );
}

function MarketPulse() {
  const requestIdRef = useRef(0);
  const [symbol, setSymbol] = useState("SPY");
  const [timeframe, setTimeframe] = useState("5Min");
  const [confidence, setConfidence] = useState(null);
  const [liquidityPressure, setLiquidityPressure] = useState(null);
  const [institutionalFlow, setInstitutionalFlow] = useState(null);
  const [strategicEnvironment, setStrategicEnvironment] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastLoadedAt, setLastLoadedAt] = useState(null);
  const [loadError, setLoadError] = useState("");

  async function loadMarketPulse() {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setLoading(true);
    setLoadError("");

    try {
      const [
        confidenceData,
        liquidityData,
        flowData,
        strategicData,
        validatedChartData,
      ] = await Promise.all([
        getConfidence(),
        getLiquidityPressure(),
        getInstitutionalFlow(),
        getStrategicEnvironment(),
        getValidatedChartData(symbol, timeframe, { limit: 120 }),
      ]);

      if (requestIdRef.current !== requestId) return;

      setConfidence(confidenceData);
      setLiquidityPressure(liquidityData);
      setInstitutionalFlow(flowData);
      setStrategicEnvironment(strategicData);
      setChartData(validatedChartData);
      setLastLoadedAt(new Date().toISOString());
    } catch (error) {
      if (requestIdRef.current !== requestId) return;
      setLoadError(error?.message || "DATA_UNAVAILABLE");
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    loadMarketPulse();
    const interval = setInterval(loadMarketPulse, 30000);

    return () => {
      requestIdRef.current += 1;
      clearInterval(interval);
    };
  }, [symbol, timeframe]);

  const pulseStatus = getChartDataStatus({
    loading,
    error: loadError || chartData?.error,
    status: chartData?.status,
    provenance: chartData?.provenance,
  });
  const pulseState = classifyPulseState({
    loading,
    chartData,
    confidence,
    strategicEnvironment,
  });
  const score = safeScore(confidence);
  const candles = chartData?.candles || [];
  const quote = chartData?.quote;
  const volatility = calculateVolatility(candles);
  const averageVolume = calculateAverageVolume(candles);
  const warnings = useMemo(
    () => [
      ...(chartData?.validation?.warnings || []),
      ...(chartData?.validation?.errors || []),
      ...(chartData?.provenance?.warnings || []),
      ...(chartData?.providerStatus?.warnings || []),
      ...(strategicEnvironment?.warnings || []),
      ...(confidence?.warnings || []),
    ].filter(Boolean),
    [chartData, confidence, strategicEnvironment]
  );

  return (
    <div className="market-pulse-page">
      <header className="market-pulse-header">
        <div>
          <h1>MARKET PULSE</h1>
          <p>Validated market context and bounded intelligence synthesis</p>
        </div>
        <div className="pulse-controls" aria-label="Market Pulse controls">
          <label>
            <span>Symbol</span>
            <select value={symbol} onChange={(event) => setSymbol(event.target.value)}>
              {SYMBOLS.map((availableSymbol) => (
                <option key={availableSymbol} value={availableSymbol}>
                  {availableSymbol}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Timeframe</span>
            <select value={timeframe} onChange={(event) => setTimeframe(event.target.value)}>
              {CHART_TIMEFRAMES.map((availableTimeframe) => (
                <option key={availableTimeframe} value={availableTimeframe}>
                  {availableTimeframe}
                </option>
              ))}
            </select>
          </label>
          <button type="button" onClick={loadMarketPulse} disabled={loading}>
            {loading ? "Loading" : "Refresh"}
          </button>
        </div>
      </header>

      <section className="pulse-hero">
        <div className="pulse-score-card">
          <span>Market Pulse State</span>
          <strong>{pulseState}</strong>
          <p>{pulseStatus}</p>
        </div>

        <div className="pulse-regime-card">
          <span>Runtime Confidence</span>
          <strong>{score === null ? "UNAVAILABLE" : score}</strong>
          <p>{score === null ? "Confidence is unavailable from verified cognition." : translateConfidence(confidence)}</p>
        </div>
      </section>

      <section className="pulse-provenance" aria-label="Market Pulse provenance">
        <Metric label="Provider" value={chartData?.provenance?.provider} />
        <Metric label="Source Type" value={chartData?.provenance?.sourceType || chartData?.status} />
        <Metric label="Session" value={chartData?.provenance?.sessionState} />
        <Metric label="Provider Timestamp" value={formatTimestamp(chartData?.provenance?.timestamp)} />
        <Metric label="Data Age" value={formatDataAge(chartData?.provenance?.dataAge)} />
        <Metric label="Validation" value={chartData?.validation?.status || "DATA_UNAVAILABLE"} />
        <Metric label="Quality" value={chartData?.validation?.qualityLabel || "BLOCKED"} />
        <Metric label="Last Loaded" value={formatTimestamp(lastLoadedAt)} />
      </section>

      <section className="pulse-chart-shell">
        <MarketPriceChart
          symbol={symbol}
          timeframe={timeframe}
          candles={candles}
          quote={quote}
          validation={chartData?.validation}
          provenance={chartData?.provenance}
          loading={loading}
          error={loadError || chartData?.error}
          height={360}
          availableSymbols={SYMBOLS}
          availableTimeframes={CHART_TIMEFRAMES}
          onSymbolChange={setSymbol}
          onTimeframeChange={setTimeframe}
          title="Market Pulse Price Context"
        />
      </section>

      <section className="pulse-grid">
        <div className="pulse-panel">
          <h2>Price Context</h2>
          <div className="pulse-metrics">
            <Metric label="Last Price" value={formatPrice(quote?.price ?? quote?.lastPrice)} />
            <Metric label="Change" value={formatPercent(quote?.changePercent)} />
            <Metric label="Trend" value={translateConfidence(confidence)} />
            <Metric label="Momentum" value={translateConsensus(confidence?.consensusStrength)} />
          </div>
        </div>

        <div className="pulse-panel">
          <h2>Liquidity and Volatility</h2>
          <div className="pulse-metrics">
            <Metric label="Liquidity" value={translateLiquidity(liquidityPressure)} />
            <Metric label="Average Volume" value={averageVolume === null ? "UNAVAILABLE" : averageVolume.toLocaleString()} />
            <Metric label="Volatility Range" value={volatility === null ? "UNAVAILABLE" : `${volatility.toFixed(2)}%`} />
            <Metric label="Status" value={translateLiquidity(liquidityPressure?.status || liquidityPressure)} />
          </div>
        </div>

        <div className="pulse-panel">
          <h2>Breadth and Global Context</h2>
          <div className="pulse-metrics">
            <Metric label="Market Breadth" value="NOT IMPLEMENTED" detail="No certified breadth provider is connected." />
            <Metric label="Sector Breadth" value="NOT IMPLEMENTED" detail="Unsupported in current provider boundary." />
            <Metric label="Global Markets" value="NOT IMPLEMENTED" detail="No certified global-market source." />
            <Metric label="Macro Context" value="NOT IMPLEMENTED" detail="No certified macro source." />
          </div>
        </div>

        <div className="pulse-panel">
          <h2>Regime and Consensus</h2>
          <div className="pulse-metrics">
            <Metric label="Regime" value={strategicEnvironment?.environment || strategicEnvironment?.regime || "UNKNOWN"} />
            <Metric label="Risk Level" value={strategicEnvironment?.risk || "UNKNOWN"} />
            <Metric label="Institutional Flow" value={translateInstitutionalFlow(institutionalFlow)} />
            <Metric label="Failsafe Limitation" value={pulseState === "BLOCKED" ? "BLOCKED" : pulseStatus} />
          </div>
        </div>

        <div className="pulse-panel pulse-wide-panel">
          <h2>AI Conclusions</h2>
          <ul className="pulse-alerts">
            <li>{translateEnvironment(strategicEnvironment)}</li>
            <li>Market Pulse status: {pulseState}.</li>
            <li>Certified scope: Alpaca quotes and candles only; breadth, global, and macro are unavailable.</li>
            {warnings.length ? (
              warnings.slice(0, 5).map((warning) => <li key={warning}>{warning}</li>)
            ) : (
              <li>No additional warnings reported by the validated inputs.</li>
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}

export default MarketPulse;
