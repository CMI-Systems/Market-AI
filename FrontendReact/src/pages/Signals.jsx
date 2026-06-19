import { useEffect, useMemo, useState } from "react";
import { getChartSymbols } from "../services/marketDataService";
import {
  getMarketProviderStatus,
  getOfflineMarketProviderStatus,
  getProviderSignals
} from "../services/marketProviderApi";
import MarketPriceChart from "../components/charts/MarketPriceChart";
import { CHART_TIMEFRAMES, getValidatedChartData } from "../services/chartDataService";
import "../styles/Signals.css";

const TIMEFRAMES = CHART_TIMEFRAMES;
const TIMEFRAME_LIMITS = {
  "1Min": 80,
  "5Min": 80,
  "15Min": 80,
  "1Hour": 80,
  "1Day": 90
};
const ALLOWED_SIGNAL_PROVIDERS = new Set(["ALPACA"]);
const BLOCKED_SIGNAL_SOURCE_TYPES = new Set([
  "SIMULATED",
  "GENERATED",
  "UNKNOWN_SOURCE",
  "INVALID_TIMESTAMP",
  "PROVIDER_OFFLINE",
  "BACKEND_UNAVAILABLE",
  "DATA_UNAVAILABLE",
  "PROVIDER_UNAVAILABLE",
  "BLOCKED",
]);
const VALID_SIGNALS = new Set([
  "BUY WATCH",
  "MOMENTUM WATCH",
  "REVERSAL WATCH",
  "RISK WATCH",
  "NEUTRAL",
  "UNAVAILABLE",
]);

function displayState(value, fallback = "OFFLINE") {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value).replace(/_/g, " ");
}

function displayProvider(value) {
  return value === "SIMULATION" ? "FALLBACK SIMULATION" : displayState(value);
}

function normalizeSymbol(value) {
  return String(value || "").trim().toUpperCase().replace(/[^A-Z0-9.-]/g, "");
}

function isValidTimestamp(value) {
  if (!value) return false;
  return Number.isFinite(new Date(value).getTime());
}

function formatDataAge(value) {
  if (value === undefined || value === null || value === "") return "UNKNOWN";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return String(value);
  if (numeric < 60) return `${Math.round(numeric)}s`;
  if (numeric < 3600) return `${Math.round(numeric / 60)}m`;
  if (numeric < 86400) return `${Math.round(numeric / 3600)}h`;
  return `${Math.round(numeric / 86400)}d`;
}

function getSignalTimestamp(signal) {
  return signal?.timestamp || signal?.updatedAt || null;
}

function getSignalStatus(signal, expectedSymbol) {
  const warnings = [];
  const symbol = normalizeSymbol(signal?.symbol);
  const provider = String(signal?.provider || "").trim().toUpperCase();
  const sourceType = String(signal?.sourceType || signal?.dataState || "UNKNOWN_SOURCE").trim().toUpperCase();
  const timestamp = getSignalTimestamp(signal);
  const signalLabel = String(signal?.signal || "").trim().toUpperCase();
  const confidence = Number(signal?.confidence);
  const price = Number(signal?.price);

  if (!signal || typeof signal !== "object") {
    return { valid: false, status: "DATA_UNAVAILABLE", warnings: ["Signal payload is unavailable."] };
  }

  if (!symbol || symbol !== normalizeSymbol(expectedSymbol)) warnings.push("SYMBOL_MISMATCH");
  if (!ALLOWED_SIGNAL_PROVIDERS.has(provider)) warnings.push("UNSUPPORTED_PROVIDER");
  if (signal.available !== true) warnings.push("DATA_UNAVAILABLE");
  if (signal.simulated === true) warnings.push("SIMULATED");
  if (signal.generated === true) warnings.push("GENERATED");
  if (BLOCKED_SIGNAL_SOURCE_TYPES.has(sourceType)) warnings.push(sourceType);
  if (!VALID_SIGNALS.has(signalLabel)) warnings.push("UNKNOWN_SIGNAL");
  if (!isValidTimestamp(timestamp)) warnings.push("INVALID_TIMESTAMP");
  if (!Number.isFinite(confidence) || confidence < 0 || confidence > 100) warnings.push("INVALID_CONFIDENCE");
  if (signal.price !== undefined && signal.price !== null && (!Number.isFinite(price) || price <= 0)) {
    warnings.push("INVALID_SIGNAL_PRICE");
  }

  if (warnings.some((warning) => [
    "SYMBOL_MISMATCH",
    "UNSUPPORTED_PROVIDER",
    "DATA_UNAVAILABLE",
    "SIMULATED",
    "GENERATED",
    "UNKNOWN_SOURCE",
    "INVALID_TIMESTAMP",
    "INVALID_CONFIDENCE",
    "INVALID_SIGNAL_PRICE",
    "PROVIDER_OFFLINE",
    "BACKEND_UNAVAILABLE",
    "PROVIDER_UNAVAILABLE",
    "BLOCKED",
  ].includes(warning))) {
    return { valid: false, status: "INVALID_SIGNAL", warnings };
  }

  if (sourceType === "STALE") return { valid: true, status: "STALE", warnings: ["STALE"] };
  if (sourceType === "PARTIAL_DATA") return { valid: true, status: "PARTIAL_DATA", warnings: ["PARTIAL_DATA"] };
  if (signalLabel === "UNAVAILABLE") return { valid: false, status: "DATA_UNAVAILABLE", warnings: ["Signal unavailable."] };

  return { valid: true, status: "READY", warnings };
}

function getSignalDirection(signal) {
  const signalLabel = String(signal?.signal || "").toUpperCase();
  if (["BUY WATCH", "MOMENTUM WATCH", "REVERSAL WATCH"].includes(signalLabel)) return "LONG_BIAS";
  if (signalLabel === "RISK WATCH") return "RISK_MONITOR";
  if (signalLabel === "NEUTRAL") return "BALANCED";
  return "UNAVAILABLE";
}

function buildSignalProvenance(signal) {
  return {
    provider: signal?.provider || "UNKNOWN",
    sourceType: signal?.sourceType || signal?.dataState || "DATA_UNAVAILABLE",
    timestamp: getSignalTimestamp(signal),
    dataAge: signal?.dataAge ?? null,
    sessionState: signal?.sessionState || "UNKNOWN_SESSION",
    validationStatus: signal?.validationStatus || signal?.marketDataValidation?.status || "UNKNOWN",
    qualityLabel: signal?.qualityLabel || signal?.marketDataValidation?.qualityLabel || "UNKNOWN",
  };
}

function calculateChangePercent(candles, fallback) {
  const first = candles[0];
  const latest = candles[candles.length - 1];

  if (!first || !latest || !first.open) return fallback;

  return ((latest.close - first.open) / first.open) * 100;
}

function formatPrice(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "--";
  return numeric.toFixed(2);
}

function Signals() {
  const chartSymbols = getChartSymbols();
  const [selectedSymbol, setSelectedSymbol] = useState(chartSymbols[0] || "NVDA");
  const [selectedTimeframe, setSelectedTimeframe] = useState("5Min");
  const [chartData, setChartData] = useState({
    candles: [],
    quote: null,
    validation: null,
    provenance: null,
    loading: true,
    error: "",
  });
  const [providerStatus, setProviderStatus] = useState(getOfflineMarketProviderStatus());
  const [providerSignal, setProviderSignal] = useState(null);
  const selectedLimit = TIMEFRAME_LIMITS[selectedTimeframe] || 80;

  useEffect(() => {
    let active = true;

    setProviderSignal(null);
    setChartData({
      candles: [],
      quote: null,
      validation: null,
      provenance: null,
      loading: true,
      error: "",
    });

    async function loadMarketChartData() {
      try {
        const [providerData, validatedChartData, signalData] = await Promise.all([
          getMarketProviderStatus(),
          getValidatedChartData(selectedSymbol, selectedTimeframe, { limit: selectedLimit }),
          getProviderSignals([selectedSymbol])
        ]);

        if (!active) return;

        const latestSignal = signalData.find(
          (signal) => normalizeSymbol(signal?.symbol) === normalizeSymbol(selectedSymbol)
        );
        const activeProviderData = providerData || getOfflineMarketProviderStatus();

        setProviderStatus(activeProviderData);
        if (latestSignal) {
          setProviderSignal(latestSignal);
        }
        setChartData({
          candles: validatedChartData.candles || [],
          quote: validatedChartData.quote || null,
          validation: validatedChartData.validation || null,
          provenance: validatedChartData.provenance || null,
          loading: false,
          error: validatedChartData.error || "",
        });
      } catch {
        if (!active) return;
        setProviderStatus((current) => current || getOfflineMarketProviderStatus());
        setChartData({
          candles: [],
          quote: null,
          validation: null,
          provenance: null,
          loading: false,
          error: "BACKEND_UNAVAILABLE",
        });
      }
    }

    loadMarketChartData();

    const interval = setInterval(loadMarketChartData, 15000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [selectedLimit, selectedSymbol, selectedTimeframe]);

  const candles = chartData.candles || [];
  const quote = chartData.quote || null;
  const latestCandle = candles[candles.length - 1];
  const signalStatus = getSignalStatus(providerSignal, selectedSymbol);
  const signalProvenance = buildSignalProvenance(providerSignal);
  const dataUnavailable = !candles.length || quote?.available === false || chartData.validation?.usable === false;
  const activeSignal = dataUnavailable
    ? "DATA_UNAVAILABLE"
    : signalStatus.valid
      ? providerSignal.signal
      : signalStatus.status;
  const activeConfidence = signalStatus.valid ? Number(providerSignal.confidence) : null;
  const activeRisk = dataUnavailable
    ? "UNKNOWN"
    : signalStatus.valid
      ? providerSignal.risk || "MONITORING"
      : "UNKNOWN";
  const activeReason =
    dataUnavailable
      ? "Provider candles unavailable. No fallback simulation candles are being displayed."
      : signalStatus.valid
        ? providerSignal?.reason || "Signal adapter is monitoring current market structure."
        : "Signal is unavailable or blocked because required provider provenance is incomplete.";
  const activeProvider = signalStatus.valid ? providerSignal?.provider : quote?.provider || providerStatus.activeProvider;
  const latestPrice = latestCandle?.close ?? quote?.price ?? null;
  const changePercent = calculateChangePercent(candles, quote?.changePercent);
  const trend =
    dataUnavailable ? "DATA_UNAVAILABLE" : latestCandle?.close > candles[0]?.open ? "RISING" : "FADING";
  const volatility =
    dataUnavailable
      ? "DATA_UNAVAILABLE"
      : Math.max(...candles.map((candle) => candle.high)) -
          Math.min(...candles.map((candle) => candle.low)) >
          Number(latestPrice) * 0.025
        ? "ELEVATED"
        : "NORMAL";
  const liquidity = dataUnavailable ? "DATA_UNAVAILABLE" : latestCandle?.volume > 0 ? "ACTIVE" : "OBSERVING";
  const displayedChange = dataUnavailable || !Number.isFinite(Number(changePercent))
    ? "--"
    : `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%`;
  const displayedConfidence = dataUnavailable || !Number.isFinite(Number(activeConfidence))
    ? "--"
    : `${Math.round(Number(activeConfidence))}%`;
  const markerCandidates = useMemo(() => {
    const status = getSignalStatus(providerSignal, selectedSymbol);
    const timestamp = getSignalTimestamp(providerSignal);
    const price = Number(providerSignal?.price);

    if (!status.valid || !timestamp || !Number.isFinite(price) || price <= 0) return [];

    return [{
      type: providerSignal.signal || "SIGNAL",
      timestamp,
      price,
      label: providerSignal.signal || "Signal",
    }];
  }, [providerSignal, selectedSymbol]);

  return (
    <div className="signals-page">
      <header className="signals-header">
        <h1>SIGNALS</h1>
        <p>Chart intelligence, signal inspection, and market structure review.</p>
      </header>

      <section className="signals-summary-grid">
        <div className="signals-summary-card">
          <span>Current Symbol</span>
          <strong>{selectedSymbol}</strong>
        </div>

        <div className="signals-summary-card">
          <span>Last Price</span>
          <strong>{latestPrice ? `$${formatPrice(latestPrice)}` : "--"}</strong>
        </div>

        <div className="signals-summary-card">
          <span>Change %</span>
          <strong>{displayedChange}</strong>
        </div>

        <div className="signals-summary-card">
          <span>Confidence</span>
          <strong>{displayedConfidence}</strong>
        </div>

        <div className="signals-summary-card">
          <span>Active Signal</span>
          <strong>{activeSignal}</strong>
        </div>

        <div className="signals-summary-card">
          <span>Active Provider</span>
          <strong>{displayProvider(providerStatus.activeProvider)}</strong>
        </div>

        <div className="signals-summary-card">
          <span>Primary Provider</span>
          <strong>{displayState(providerStatus.primaryProvider)}</strong>
        </div>

        <div className="signals-summary-card">
          <span>Source</span>
          <strong>{displayState(activeProvider)} SIGNAL ADAPTER</strong>
        </div>

        <div className="signals-summary-card">
          <span>Signal Status</span>
          <strong>{activeSignal}</strong>
        </div>

        <div className="signals-summary-card">
          <span>Signal Timestamp</span>
          <strong>{isValidTimestamp(signalProvenance.timestamp) ? new Date(signalProvenance.timestamp).toLocaleString() : "UNAVAILABLE"}</strong>
        </div>

        <div className="signals-summary-card">
          <span>Signal Source</span>
          <strong>{displayState(signalProvenance.sourceType, "DATA_UNAVAILABLE")}</strong>
        </div>

        <div className="signals-summary-card">
          <span>Signal Age</span>
          <strong>{formatDataAge(signalProvenance.dataAge)}</strong>
        </div>
      </section>

      <section className="chart-workspace">
        <div className="chart-main-panel chart-main-panel-host">
          <MarketPriceChart
            title="Signals Market Chart"
            symbol={selectedSymbol}
            timeframe={selectedTimeframe}
            candles={candles}
            quote={quote}
            validation={chartData.validation}
            provenance={chartData.provenance}
            loading={chartData.loading}
            error={chartData.error}
            markers={markerCandidates}
            availableSymbols={chartSymbols}
            availableTimeframes={TIMEFRAMES}
            onSymbolChange={setSelectedSymbol}
            onTimeframeChange={setSelectedTimeframe}
            height={460}
          />
        </div>

        <aside className="signal-marker-panel">
          <h2>Validated Markers</h2>
          {markerCandidates.length ? (
            markerCandidates.map((marker) => (
              <div key={`${marker.timestamp}-${marker.type}`}>
                <span>{marker.timestamp}</span>
                <strong>{marker.type}</strong>
                <p>Provider signal marker. Price ${formatPrice(marker.price)}.</p>
              </div>
            ))
          ) : (
            <div>
              <span>Marker Status</span>
              <strong>UNAVAILABLE</strong>
              <p>Provider signal markers require timestamp and price; static marker fixtures are not displayed.</p>
            </div>
          )}
        </aside>

        <aside className="market-structure-panel">
          <h2>Market Structure</h2>
          <div>
            <span>Trend</span>
            <strong>{trend}</strong>
          </div>
          <div>
            <span>Volatility</span>
            <strong>{volatility}</strong>
          </div>
          <div>
            <span>Liquidity</span>
            <strong>{liquidity}</strong>
          </div>
          <div>
            <span>Risk</span>
            <strong>{activeRisk}</strong>
          </div>
          <div>
            <span>Direction</span>
            <strong>{signalStatus.valid ? getSignalDirection(providerSignal) : "UNAVAILABLE"}</strong>
          </div>
          <div>
            <span>Validation</span>
            <strong>{displayState(signalProvenance.validationStatus, "UNKNOWN")}</strong>
          </div>
        </aside>

        <aside className="signal-explanation-panel">
          <h2>Signal Explanation</h2>
          <div>
            <span>Signal</span>
            <strong>{activeSignal}</strong>
          </div>
          <div>
            <span>Confidence</span>
            <strong>{displayedConfidence}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>{signalStatus.status}</strong>
          </div>
          <p>{activeReason}</p>
          {signalStatus.warnings.length > 0 && (
            <p className="signal-warning-text">
              {signalStatus.warnings.join(" | ")}
            </p>
          )}
        </aside>
      </section>
    </div>
  );
}

export default Signals;
