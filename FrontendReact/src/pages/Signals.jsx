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

function displayState(value) {
  if (value === undefined || value === null || value === "") return "OFFLINE";
  return String(value).replace(/_/g, " ");
}

function displayProvider(value) {
  return value === "SIMULATION" ? "FALLBACK SIMULATION" : displayState(value);
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

        const latestSignal = signalData[0];
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
  const dataUnavailable = !candles.length || quote?.available === false || chartData.validation?.usable === false;
  const activeSignal = dataUnavailable ? "DATA_UNAVAILABLE" : providerSignal?.signal || quote?.signal || "NEUTRAL";
  const activeConfidence = providerSignal?.confidence ?? quote?.confidence ?? 0;
  const activeRisk = dataUnavailable ? "UNKNOWN" : providerSignal?.risk || quote?.risk || "MONITORING";
  const activeReason =
    dataUnavailable
      ? "Provider candles unavailable. No fallback simulation candles are being displayed."
      :
    providerSignal?.reason ||
    "Signal adapter is monitoring current market structure.";
  const activeProvider = providerSignal?.provider || quote?.provider || providerStatus.activeProvider;
  const latestPrice = latestCandle?.close ?? quote?.price ?? null;
  const changePercent = calculateChangePercent(candles, quote?.changePercent || 0);
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
    if (!providerSignal?.timestamp || !Number.isFinite(Number(providerSignal?.price))) return [];
    return [{
      type: providerSignal.signal || "SIGNAL",
      timestamp: providerSignal.timestamp,
      price: providerSignal.price,
      label: providerSignal.signal || "Signal",
    }];
  }, [providerSignal]);

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
          <p>{activeReason}</p>
        </aside>
      </section>
    </div>
  );
}

export default Signals;
