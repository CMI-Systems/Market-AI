import { useEffect, useMemo, useState } from "react";
import {
  getChartSymbols,
  getHistoricalCandles,
  getMarketQuote,
  getSignalMarkers
} from "../services/marketDataService";
import {
  getMarketCandles,
  getMarketProviderStatus,
  getMarketQuotes,
  getOfflineMarketProviderStatus,
  getProviderSignals
} from "../services/marketProviderApi";
import "../styles/Signals.css";

const TIMEFRAMES = ["1Min", "5Min", "15Min", "1H", "1D"];
const TIMEFRAME_LIMITS = {
  "1Min": 80,
  "5Min": 80,
  "15Min": 80,
  "1H": 80,
  "1D": 90
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

function formatVolume(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "UNAVAILABLE";
  if (numeric >= 1000000) return `${(numeric / 1000000).toFixed(1)}M`;
  if (numeric >= 1000) return `${(numeric / 1000).toFixed(1)}K`;
  return String(Math.round(numeric));
}

function formatAxisLabel(candle, timeframe) {
  if (!candle?.timestamp) return candle?.time || "";

  const date = new Date(candle.timestamp);
  if (Number.isNaN(date.getTime())) return candle.time || "";

  if (timeframe === "1D") {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "America/New_York"
    });
  }

  return candle.time || date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/New_York"
  });
}

function Signals() {
  const chartSymbols = getChartSymbols();
  const [selectedSymbol, setSelectedSymbol] = useState(chartSymbols[0] || "NVDA");
  const [selectedTimeframe, setSelectedTimeframe] = useState("5Min");
  const fallbackQuote = useMemo(
    () => getMarketQuote(selectedSymbol) || getMarketQuote("NVDA"),
    [selectedSymbol]
  );
  const fallbackCandles = useMemo(
    () => getHistoricalCandles(selectedSymbol),
    [selectedSymbol]
  );
  const [quote, setQuote] = useState(fallbackQuote);
  const [candles, setCandles] = useState(fallbackCandles);
  const [providerStatus, setProviderStatus] = useState(getOfflineMarketProviderStatus());
  const [providerSignal, setProviderSignal] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [usingFallbackCandles, setUsingFallbackCandles] = useState(false);
  const [selectedCandle, setSelectedCandle] = useState(null);
  const selectedLimit = TIMEFRAME_LIMITS[selectedTimeframe] || 80;

  useEffect(() => {
    let active = true;

    setQuote(fallbackQuote);
    setCandles(fallbackCandles);
    setProviderSignal(null);
    setSelectedCandle(null);
    setUsingFallbackCandles(false);

    async function loadMarketChartData() {
      setIsLoading(true);

      try {
        const [providerData, quoteData, candleData, signalData] = await Promise.all([
          getMarketProviderStatus(),
          getMarketQuotes([selectedSymbol]),
          getMarketCandles(selectedSymbol, selectedTimeframe, selectedLimit),
          getProviderSignals([selectedSymbol])
        ]);

        if (!active) return;

        const latestQuote = quoteData[0];
        const latestSignal = signalData[0];
        const activeProviderData = providerData || getOfflineMarketProviderStatus();

        setProviderStatus(activeProviderData);
        if (latestSignal) {
          setProviderSignal(latestSignal);
        }

        if (latestQuote) {
          setQuote({
            ...fallbackQuote,
            name: latestQuote.name || fallbackQuote.name,
            price: Number.isFinite(Number(latestQuote.price))
              ? Number(latestQuote.price)
              : fallbackQuote.price,
            changePercent: Number.isFinite(Number(latestQuote.changePercent))
              ? Number(latestQuote.changePercent)
              : fallbackQuote.changePercent,
            volume: latestQuote.volume || fallbackQuote.volume,
            provider: latestQuote.provider || activeProviderData.activeProvider,
            providerStatus: latestQuote.providerStatus || activeProviderData.providerHealth,
            updatedAt: latestQuote.updatedAt || fallbackQuote.updatedAt
          });
        }

        if (candleData?.length) {
          setCandles(candleData);
          setUsingFallbackCandles(
            candleData.some((candle) => candle.provider === "SIMULATION")
          );
        } else {
          setUsingFallbackCandles(true);
        }
      } catch {
        if (!active) return;
        setUsingFallbackCandles(true);
        setProviderStatus((current) => current || getOfflineMarketProviderStatus());
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadMarketChartData();

    const interval = setInterval(loadMarketChartData, 15000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [fallbackCandles, fallbackQuote, selectedLimit, selectedSymbol, selectedTimeframe]);

  const markers = useMemo(
    () => getSignalMarkers(selectedSymbol),
    [selectedSymbol]
  );
  const priceRange = candles.reduce(
    (range, candle) => ({
      high: Math.max(range.high, Number(candle.high) || 0),
      low: Math.min(range.low, Number(candle.low) || 0),
      maxVolume: Math.max(range.maxVolume, Number(candle.volume) || 0)
    }),
    { high: Number.NEGATIVE_INFINITY, low: Number.POSITIVE_INFINITY, maxVolume: 0 }
  );
  const latestCandle = candles[candles.length - 1];
  const lastMarker = markers[0] || {};
  const activeSignal = providerSignal?.signal || quote.signal || "NEUTRAL";
  const activeConfidence = providerSignal?.confidence ?? quote.confidence ?? 0;
  const activeRisk = providerSignal?.risk || quote.risk || "MONITORING";
  const activeReason =
    providerSignal?.reason ||
    lastMarker.reason ||
    "Signal adapter is monitoring current market structure.";
  const activeProvider = providerSignal?.provider || quote.provider || providerStatus.activeProvider;
  const latestPrice = latestCandle?.close || quote.price || 0;
  const changePercent = calculateChangePercent(candles, quote.changePercent || 0);
  const trend =
    latestCandle?.close > candles[0]?.open ? "RISING" : "FADING";
  const volatility =
    priceRange.high - priceRange.low > latestPrice * 0.025 ? "ELEVATED" : "NORMAL";
  const liquidity = latestCandle?.volume > 0 ? "ACTIVE" : "OBSERVING";
  const maxVolume = priceRange.maxVolume || 1;
  const rangeHigh = Number.isFinite(priceRange.high) ? priceRange.high : latestPrice + 1;
  const rangeLow = Number.isFinite(priceRange.low) ? priceRange.low : latestPrice - 1;
  const priceSpan = rangeHigh - rangeLow || 1;
  const priceLabels = Array.from({ length: 5 }, (_, index) =>
    rangeHigh - (priceSpan * index) / 4
  );
  const latestPriceTop = ((rangeHigh - latestPrice) / priceSpan) * 100;
  const selectedOrLatestCandle = selectedCandle || latestCandle;
  const xAxisCandles = candles.filter(
    (_, index) => index === 0 || index === candles.length - 1 || index % 10 === 0
  );

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
          <strong>${formatPrice(latestPrice)}</strong>
        </div>

        <div className="signals-summary-card">
          <span>Change %</span>
          <strong>{changePercent >= 0 ? "+" : ""}{changePercent.toFixed(2)}%</strong>
        </div>

        <div className="signals-summary-card">
          <span>Confidence</span>
          <strong>{activeConfidence}%</strong>
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
        <div className="chart-main-panel">
          <div className="chart-toolbar">
            <label htmlFor="symbol-select">Symbol</label>
            <select
              id="symbol-select"
              value={selectedSymbol}
              onChange={(event) => setSelectedSymbol(event.target.value)}
            >
              {chartSymbols.map((symbol) => (
                <option key={symbol}>{symbol}</option>
              ))}
            </select>
          </div>

          <div className="chart-header-panel">
            <div>
              <span>Symbol</span>
              <strong>{selectedSymbol}</strong>
            </div>
            <div>
              <span>Timeframe</span>
              <strong>{selectedTimeframe}</strong>
            </div>
            <div>
              <span>Provider</span>
              <strong>{displayProvider(activeProvider)}</strong>
            </div>
            <div>
              <span>Last Price</span>
              <strong>${formatPrice(latestPrice)}</strong>
            </div>
            <div>
              <span>Change</span>
              <strong>{changePercent >= 0 ? "+" : ""}{changePercent.toFixed(2)}%</strong>
            </div>
          </div>

          {isLoading && <div className="chart-state-bar">Loading provider candles...</div>}
          {usingFallbackCandles && (
            <div className="chart-state-bar chart-state-warning">
              Provider candles unavailable. Using fallback simulation candles.
            </div>
          )}

          <div className="timeframe-selector" aria-label="Chart timeframe">
            {TIMEFRAMES.map((timeframe) => (
              <button
                className={selectedTimeframe === timeframe ? "timeframe-active" : ""}
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                type="button"
              >
                {timeframe}
              </button>
            ))}
          </div>

          <div className="chart-visual-shell">
            <div className="chart-grid-lines">
              {priceLabels.map((price, index) => (
                <div key={price} style={{ top: `${index * 25}%` }}>
                  <span>${formatPrice(price)}</span>
                </div>
              ))}
            </div>

            <div
              className="latest-price-line"
              style={{ top: `${Math.max(0, Math.min(100, latestPriceTop))}%` }}
            >
              <span>${formatPrice(latestPrice)}</span>
            </div>

            <div
              className="mock-candle-chart"
              style={{ gridTemplateColumns: `repeat(${candles.length}, minmax(12px, 1fr))` }}
            >
              {candles.map((candle) => {
                const candleHigh = Number(candle.high) || latestPrice;
                const candleLow = Number(candle.low) || latestPrice;
                const candleOpen = Number(candle.open) || latestPrice;
                const candleClose = Number(candle.close) || latestPrice;
                const candleTop = ((rangeHigh - candleHigh) / priceSpan) * 100;
                const candleHeight = Math.max(
                  4,
                  ((candleHigh - candleLow) / priceSpan) * 100
                );
                const bodyTop = ((rangeHigh - Math.max(candleOpen, candleClose)) / priceSpan) * 100;
                const bodyHeight = Math.max(
                  3,
                  (Math.abs(candleClose - candleOpen) / priceSpan) * 100
                );
                const isUp = candleClose >= candleOpen;

                return (
                  <button
                    className="candle-row"
                    key={candle.timestamp || candle.time}
                    onFocus={() => setSelectedCandle(candle)}
                    onMouseEnter={() => setSelectedCandle(candle)}
                    type="button"
                  >
                    <span
                      className="candle-wick"
                      style={{ top: `${candleTop}%`, height: `${candleHeight}%` }}
                    ></span>
                    <span
                      className={`candle-body ${isUp ? "candle-up" : "candle-down"}`}
                      style={{ top: `${bodyTop}%`, height: `${bodyHeight}%` }}
                    ></span>
                  </button>
                );
              })}
            </div>

            <div className="chart-x-axis">
              {xAxisCandles.map((candle) => (
                <span key={candle.timestamp || candle.time}>
                  {formatAxisLabel(candle, selectedTimeframe)}
                </span>
              ))}
            </div>
          </div>

          <div
            className="volume-strip"
            style={{ gridTemplateColumns: `repeat(${candles.length}, minmax(12px, 1fr))` }}
          >
            {candles.map((candle) => {
              const isUp = Number(candle.close) >= Number(candle.open);

              return (
                <div key={candle.timestamp || candle.time}>
                  <i
                    className={isUp ? "volume-up" : "volume-down"}
                    style={{ height: `${((Number(candle.volume) || 0) / maxVolume) * 100}%` }}
                  ></i>
                </div>
              );
            })}
          </div>

          {selectedOrLatestCandle && (
            <div className="selected-candle-detail">
              <div>
                <span>Selected Candle</span>
                <strong>{selectedOrLatestCandle.time}</strong>
              </div>
              <div>
                <span>Open</span>
                <strong>${formatPrice(selectedOrLatestCandle.open)}</strong>
              </div>
              <div>
                <span>High</span>
                <strong>${formatPrice(selectedOrLatestCandle.high)}</strong>
              </div>
              <div>
                <span>Low</span>
                <strong>${formatPrice(selectedOrLatestCandle.low)}</strong>
              </div>
              <div>
                <span>Close</span>
                <strong>${formatPrice(selectedOrLatestCandle.close)}</strong>
              </div>
              <div>
                <span>Volume</span>
                <strong>{formatVolume(selectedOrLatestCandle.volume)}</strong>
              </div>
            </div>
          )}
        </div>

        <aside className="signal-marker-panel">
          <h2>Signal Markers</h2>
          {markers.map((marker) => (
            <div key={`${marker.time}-${marker.type}`}>
              <span>{marker.time}</span>
              <strong>{marker.type}</strong>
              <p>{marker.confidence}% - {marker.reason}</p>
            </div>
          ))}
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
            <strong>{activeConfidence}%</strong>
          </div>
          <p>{activeReason}</p>
        </aside>
      </section>
    </div>
  );
}

export default Signals;
