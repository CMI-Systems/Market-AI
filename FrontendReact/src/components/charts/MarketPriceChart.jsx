import { useEffect, useMemo, useRef, useState } from "react";
import {
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  createChart,
  createSeriesMarkers,
} from "lightweight-charts";
import { CHART_TIMEFRAMES, getChartDataStatus } from "../../services/chartDataService";
import "./MarketPriceChart.css";

const STATUS_CLASS = {
  LIVE: "status-live",
  DELAYED: "status-delayed",
  CACHED: "status-cached",
  STALE: "status-stale",
  PARTIAL: "status-partial",
  "MARKET CLOSED": "status-closed",
  "PROVIDER OFFLINE": "status-offline",
  "DATA UNAVAILABLE": "status-unavailable",
  LOADING: "status-loading",
};

function formatLabel(value, fallback = "UNKNOWN") {
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
  if (numeric < 60) return `${Math.round(numeric)}s`;
  if (numeric < 3600) return `${Math.round(numeric / 60)}m`;
  if (numeric < 86400) return `${Math.round(numeric / 3600)}h`;
  return `${Math.round(numeric / 86400)}d`;
}

function formatPrice(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "--";
  return numeric.toLocaleString(undefined, {
    minimumFractionDigits: numeric >= 100 ? 2 : 3,
    maximumFractionDigits: numeric >= 100 ? 2 : 4,
  });
}

function getMarkerShape(type) {
  if (type === "EXIT" || type === "STOP_LOSS") return "arrowDown";
  if (type === "TARGET") return "circle";
  return "arrowUp";
}

function getMarkerPosition(type) {
  if (type === "EXIT" || type === "STOP_LOSS") return "aboveBar";
  return "belowBar";
}

function normalizeMarkers(markers = [], candles = []) {
  const candleTimes = new Set(candles.map((candle) => candle.time));

  return markers
    .map((marker) => {
      const markerDate = marker.timestamp ? new Date(marker.timestamp) : null;
      const markerTime = Number.isFinite(Number(marker.time))
        ? Number(marker.time)
        : markerDate && !Number.isNaN(markerDate.getTime())
          ? Math.floor(markerDate.getTime() / 1000)
          : null;

      if (!markerTime || !candleTimes.has(markerTime)) return null;

      return {
        time: markerTime,
        position: marker.position || getMarkerPosition(marker.type),
        shape: marker.shape || getMarkerShape(marker.type),
        color: marker.color || (marker.type === "STOP_LOSS" ? "#ff647d" : "#39ff88"),
        text: marker.label || marker.type || "Marker",
      };
    })
    .filter(Boolean);
}

function useChartControls(initialChartType) {
  const [chartType, setChartType] = useState(initialChartType || "Candles");
  const [showVolume, setShowVolume] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);

  return {
    chartType,
    setChartType,
    showVolume,
    setShowVolume,
    showMarkers,
    setShowMarkers,
  };
}

function MarketPriceChart({
  symbol,
  timeframe,
  candles = [],
  quote = null,
  validation = null,
  provenance = null,
  loading = false,
  error = "",
  markers = [],
  height = 420,
  availableSymbols = [],
  availableTimeframes = CHART_TIMEFRAMES,
  onSymbolChange,
  onTimeframeChange,
  title = "Market Price Chart",
}) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const lineSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const markersApiRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const controls = useChartControls("Candles");
  const safeCandles = useMemo(
    () =>
      candles.filter(
        (candle) =>
          Number.isFinite(Number(candle.time)) &&
          Number.isFinite(Number(candle.open)) &&
          Number.isFinite(Number(candle.high)) &&
          Number.isFinite(Number(candle.low)) &&
          Number.isFinite(Number(candle.close))
      ),
    [candles]
  );
  const status = getChartDataStatus({
    loading,
    error,
    status: validation?.status,
    provenance,
  });
  const hasUsableCandles = !loading && !error && safeCandles.length > 0;
  const latestCandle = safeCandles[safeCandles.length - 1] || null;
  const latestPrice = quote?.price ?? quote?.lastPrice ?? latestCandle?.close ?? null;
  const chartMarkers = useMemo(
    () => (controls.showMarkers ? normalizeMarkers(markers, safeCandles) : []),
    [controls.showMarkers, markers, safeCandles]
  );

  useEffect(() => {
    if (!containerRef.current || chartRef.current) return undefined;

    const chart = createChart(containerRef.current, {
      height,
      autoSize: false,
      layout: {
        background: { color: "#050f20" },
        textColor: "#d8e7f2",
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: "rgba(143, 166, 184, 0.12)" },
        horzLines: { color: "rgba(143, 166, 184, 0.12)" },
      },
      rightPriceScale: {
        borderColor: "rgba(143, 166, 184, 0.22)",
      },
      timeScale: {
        borderColor: "rgba(143, 166, 184, 0.22)",
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        vertLine: { color: "rgba(83, 211, 218, 0.55)", labelBackgroundColor: "#10243a" },
        horzLine: { color: "rgba(83, 211, 218, 0.55)", labelBackgroundColor: "#10243a" },
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#39ff88",
      downColor: "#ff647d",
      borderUpColor: "#39ff88",
      borderDownColor: "#ff647d",
      wickUpColor: "#39ff88",
      wickDownColor: "#ff647d",
    });
    const lineSeries = chart.addSeries(LineSeries, {
      color: "#53d3da",
      lineWidth: 2,
      priceLineVisible: true,
    });
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "",
      color: "rgba(83, 211, 218, 0.45)",
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.78,
        bottom: 0,
      },
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    lineSeriesRef.current = lineSeries;
    volumeSeriesRef.current = volumeSeries;
    markersApiRef.current = createSeriesMarkers(candleSeries, []);

    resizeObserverRef.current = new ResizeObserver((entries) => {
      const width = Math.floor(entries[0]?.contentRect?.width || 0);
      if (width > 0) {
        chart.applyOptions({ width, height });
      }
    });
    resizeObserverRef.current.observe(containerRef.current);

    return () => {
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      markersApiRef.current = null;
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      lineSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, [height]);

  useEffect(() => {
    const chart = chartRef.current;
    const candleSeries = candleSeriesRef.current;
    const lineSeries = lineSeriesRef.current;
    const volumeSeries = volumeSeriesRef.current;

    if (!chart || !candleSeries || !lineSeries || !volumeSeries) return;

    const candleData = hasUsableCandles
      ? safeCandles.map((candle) => ({
          time: candle.time,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
        }))
      : [];
    const lineData = hasUsableCandles
      ? safeCandles.map((candle) => ({ time: candle.time, value: candle.close }))
      : [];
    const volumeData = hasUsableCandles && controls.showVolume
      ? safeCandles.map((candle) => ({
          time: candle.time,
          value: candle.volume || 0,
          color: candle.close >= candle.open
            ? "rgba(57, 255, 136, 0.42)"
            : "rgba(255, 100, 125, 0.42)",
        }))
      : [];

    candleSeries.setData(controls.chartType === "Candles" ? candleData : []);
    lineSeries.setData(controls.chartType === "Line" ? lineData : []);
    volumeSeries.setData(volumeData);
    markersApiRef.current?.setMarkers(chartMarkers);

    if (hasUsableCandles) {
      chart.timeScale().fitContent();
    }
  }, [chartMarkers, controls.chartType, controls.showVolume, hasUsableCandles, safeCandles]);

  function fitContent() {
    chartRef.current?.timeScale().fitContent();
  }

  function resetView() {
    chartRef.current?.timeScale().resetTimeScale();
    chartRef.current?.timeScale().fitContent();
  }

  return (
    <section className="market-price-chart" aria-labelledby={`${symbol}-${timeframe}-chart-title`}>
      <div className="market-price-chart-header">
        <div>
          <span>Financial Chart</span>
          <h3 id={`${symbol}-${timeframe}-chart-title`}>{title}</h3>
          <p>
            {formatLabel(symbol)} / {formatLabel(timeframe)} / {formatLabel(provenance?.provider)}
          </p>
        </div>
        <b className={`market-chart-status ${STATUS_CLASS[status] || "status-unavailable"}`}>
          {status}
        </b>
      </div>

      <div className="market-chart-controls" aria-label={`${title} controls`}>
        {availableSymbols.length > 0 && (
          <label>
            <span>Symbol</span>
            <select
              value={symbol}
              onChange={(event) => onSymbolChange?.(event.target.value)}
              disabled={!onSymbolChange}
            >
              {availableSymbols.map((availableSymbol) => (
                <option key={availableSymbol} value={availableSymbol}>
                  {availableSymbol}
                </option>
              ))}
            </select>
          </label>
        )}

        <label>
          <span>Timeframe</span>
          <select
            value={timeframe}
            onChange={(event) => onTimeframeChange?.(event.target.value)}
            disabled={!onTimeframeChange}
          >
            {availableTimeframes.map((availableTimeframe) => (
              <option key={availableTimeframe} value={availableTimeframe}>
                {availableTimeframe}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Type</span>
          <select
            value={controls.chartType}
            onChange={(event) => controls.setChartType(event.target.value)}
          >
            <option>Candles</option>
            <option>Line</option>
          </select>
        </label>

        <button type="button" onClick={fitContent}>Fit</button>
        <button type="button" onClick={resetView}>Reset</button>
        <button
          type="button"
          aria-pressed={controls.showVolume}
          onClick={() => controls.setShowVolume((current) => !current)}
        >
          Volume {controls.showVolume ? "On" : "Off"}
        </button>
        <button
          type="button"
          aria-pressed={controls.showMarkers}
          onClick={() => controls.setShowMarkers((current) => !current)}
        >
          Markers {controls.showMarkers ? "On" : "Off"}
        </button>
      </div>

      <dl className="market-chart-metadata">
        <div>
          <dt>Source Type</dt>
          <dd>{formatLabel(provenance?.sourceType, "DATA UNAVAILABLE")}</dd>
        </div>
        <div>
          <dt>Session</dt>
          <dd>{formatLabel(provenance?.sessionState, "UNKNOWN SESSION")}</dd>
        </div>
        <div>
          <dt>Provider Timestamp</dt>
          <dd>{formatTimestamp(provenance?.timestamp || latestCandle?.timestamp)}</dd>
        </div>
        <div>
          <dt>Data Age</dt>
          <dd>{formatDataAge(provenance?.dataAge ?? latestCandle?.dataAge)}</dd>
        </div>
        <div>
          <dt>Validation</dt>
          <dd>{formatLabel(validation?.status, "DATA UNAVAILABLE")}</dd>
        </div>
        <div>
          <dt>Quality</dt>
          <dd>{formatLabel(validation?.qualityLabel || latestCandle?.qualityLabel, "BLOCKED")}</dd>
        </div>
      </dl>

      <div className="market-chart-canvas-shell" style={{ minHeight: `${height}px` }}>
        <div ref={containerRef} className="market-chart-canvas" style={{ height: `${height}px` }} />
        {!hasUsableCandles && (
          <div className="market-chart-overlay" role="status">
            <strong>{loading ? "LOADING" : error ? "DATA UNAVAILABLE" : status}</strong>
            <span>
              {loading
                ? "Loading validated provider candles."
                : error || validation?.errors?.[0] || "Validated chart candles are unavailable."}
            </span>
          </div>
        )}
      </div>

      <p className="market-chart-text-summary">
        {formatLabel(symbol)} {formatLabel(timeframe)} chart using {formatLabel(provenance?.provider)} data.
        Last price {latestPrice ? `$${formatPrice(latestPrice)}` : "unavailable"}.
        Validation {formatLabel(validation?.status, "DATA UNAVAILABLE")}.
      </p>
    </section>
  );
}

export default MarketPriceChart;
