import { useEffect, useMemo, useRef, useState } from "react";
import MarketPriceChart from "../components/charts/MarketPriceChart";
import {
  CHART_TIMEFRAMES,
  getChartDataStatus,
  getValidatedChartData,
} from "../services/chartDataService";
import "../styles/GlobalScan.css";

const SCAN_UNIVERSE = ["SPY", "QQQ", "NVDA", "AAPL", "MSFT"];

const SORT_OPTIONS = [
  { value: "rank", label: "Rank" },
  { value: "score", label: "Score" },
  { value: "change", label: "Change" },
  { value: "symbol", label: "Symbol" },
  { value: "status", label: "Status" },
];

const BLOCKED_STATUSES = new Set([
  "BLOCKED",
  "INVALID_TIMESTAMP",
  "INVALID_OHLC",
  "INVALID_NUMERIC_DATA",
  "SYMBOL_MISMATCH",
  "UNKNOWN_SOURCE",
  "SIMULATED",
  "GENERATED",
  "DATA_UNAVAILABLE",
  "BACKEND_UNAVAILABLE",
  "PROVIDER_OFFLINE",
]);

function normalizeSymbol(value) {
  return String(value || "").trim().toUpperCase().replace(/[^A-Z0-9.-]/g, "");
}

function uniqueSymbols(symbols) {
  return [...new Set(symbols.map(normalizeSymbol).filter(Boolean))].slice(0, 12);
}

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

function formatNumber(value, options = {}) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "UNAVAILABLE";
  return numeric.toLocaleString(undefined, options);
}

function formatPercent(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "UNAVAILABLE";
  return `${numeric > 0 ? "+" : ""}${numeric.toFixed(2)}%`;
}

function latestTrend(candles = []) {
  const recent = candles.slice(-12);
  if (recent.length < 2) return "UNAVAILABLE";
  const first = Number(recent[0].close);
  const last = Number(recent[recent.length - 1].close);
  if (!Number.isFinite(first) || !Number.isFinite(last) || first <= 0) return "UNAVAILABLE";
  const change = ((last - first) / first) * 100;
  if (change > 1) return "UPTREND";
  if (change < -1) return "DOWNTREND";
  return "MIXED";
}

function volatilityRange(candles = []) {
  const recent = candles.slice(-20);
  if (recent.length < 2) return null;
  const high = Math.max(...recent.map((candle) => Number(candle.high)));
  const low = Math.min(...recent.map((candle) => Number(candle.low)));
  const close = Number(recent[recent.length - 1].close);
  if (![high, low, close].every(Number.isFinite) || close <= 0) return null;
  return ((high - low) / close) * 100;
}

function averageVolume(candles = []) {
  const volumes = candles
    .slice(-20)
    .map((candle) => Number(candle.volume))
    .filter((volume) => Number.isFinite(volume) && volume >= 0);
  if (!volumes.length) return null;
  return Math.round(volumes.reduce((total, volume) => total + volume, 0) / volumes.length);
}

function classifySignal(changePercent, trend, status) {
  if (BLOCKED_STATUSES.has(status)) return "BLOCKED";
  const change = Number(changePercent);
  if (!Number.isFinite(change)) return "UNAVAILABLE";
  if (change >= 1.5 && trend === "UPTREND") return "MOMENTUM WATCH";
  if (change <= -1.5) return "RISK WATCH";
  return "MONITOR";
}

function scoreRow({ changePercent, trend, volatility, qualityScore, status }) {
  if (BLOCKED_STATUSES.has(status)) return null;
  const change = Number(changePercent);
  const quality = Number(qualityScore);
  if (!Number.isFinite(change) || !Number.isFinite(quality)) return null;

  let score = 50 + Math.max(-20, Math.min(20, change * 5)) + (quality - 75) * 0.3;
  if (trend === "UPTREND") score += 8;
  if (trend === "DOWNTREND") score -= 8;
  if (Number.isFinite(volatility) && volatility > 4) score -= 10;

  return Math.max(1, Math.min(100, Math.round(score)));
}

function buildScanRow(symbol, chartData, index) {
  const status = getChartDataStatus({
    status: chartData?.status,
    validation: chartData?.validation,
    provenance: chartData?.provenance,
    error: chartData?.error,
  }).replace(" ", "_");
  const validationStatus = chartData?.validation?.status || chartData?.status || "DATA_UNAVAILABLE";
  const candles = chartData?.candles || [];
  const quote = chartData?.quote;
  const trend = latestTrend(candles);
  const volatility = volatilityRange(candles);
  const volume = averageVolume(candles);
  const changePercent = quote?.changePercent;
  const signalState = classifySignal(changePercent, trend, validationStatus);
  const score = scoreRow({
    changePercent,
    trend,
    volatility,
    qualityScore: chartData?.validation?.qualityScore,
    status: validationStatus,
  });

  return {
    id: `${symbol}-${index}`,
    symbol,
    rank: null,
    score,
    trend,
    momentum: signalState === "MOMENTUM WATCH" ? "BUILDING" : signalState === "RISK WATCH" ? "DEGRADING" : "MIXED",
    volatility: Number.isFinite(volatility) ? volatility : null,
    liquidity: volume === null ? "UNAVAILABLE" : "VOLUME_AVAILABLE",
    volume,
    change: changePercent,
    percentChange: changePercent,
    regime: "UNAVAILABLE",
    tacticalState: "DERIVED_FROM_SCAN",
    behavioralState: "NOT_IMPLEMENTED",
    failsafeState: BLOCKED_STATUSES.has(validationStatus) ? "BLOCKED" : "LIMITED",
    signalState,
    provider: chartData?.provenance?.provider || "UNKNOWN",
    sourceType: chartData?.provenance?.sourceType || chartData?.status || "DATA_UNAVAILABLE",
    timestamp: chartData?.provenance?.timestamp || null,
    receivedAt: null,
    dataAge: chartData?.provenance?.dataAge ?? null,
    sessionState: chartData?.provenance?.sessionState || "UNKNOWN_SESSION",
    validationStatus,
    qualityLabel: chartData?.validation?.qualityLabel || "BLOCKED",
    available: Boolean(chartData?.candles?.length) && !BLOCKED_STATUSES.has(validationStatus),
    simulated: chartData?.provenance?.simulated === true,
    generated: chartData?.provenance?.generated === true,
    provenance: chartData?.provenance || {},
    validation: chartData?.validation || null,
    chartData,
    status,
    warnings: [
      ...(chartData?.validation?.warnings || []),
      ...(chartData?.validation?.errors || []),
      ...(chartData?.providerStatus?.warnings || []),
    ].filter(Boolean),
  };
}

function rankRows(rows) {
  let rank = 1;
  return [...rows]
    .sort((a, b) => {
      const aScore = Number.isFinite(Number(a.score)) ? Number(a.score) : -1;
      const bScore = Number.isFinite(Number(b.score)) ? Number(b.score) : -1;
      if (bScore !== aScore) return bScore - aScore;
      return a.symbol.localeCompare(b.symbol);
    })
    .map((row) => ({
      ...row,
      rank: Number.isFinite(Number(row.score)) ? rank++ : null,
    }));
}

function sortRows(rows, sortBy) {
  const ranked = rankRows(rows);
  return [...ranked].sort((a, b) => {
    if (sortBy === "symbol") return a.symbol.localeCompare(b.symbol);
    if (sortBy === "status") return a.status.localeCompare(b.status) || a.symbol.localeCompare(b.symbol);
    if (sortBy === "change") {
      const aValue = Number.isFinite(Number(a.percentChange)) ? Number(a.percentChange) : -Infinity;
      const bValue = Number.isFinite(Number(b.percentChange)) ? Number(b.percentChange) : -Infinity;
      return bValue - aValue || a.symbol.localeCompare(b.symbol);
    }
    if (sortBy === "score") {
      const aValue = Number.isFinite(Number(a.score)) ? Number(a.score) : -Infinity;
      const bValue = Number.isFinite(Number(b.score)) ? Number(b.score) : -Infinity;
      return bValue - aValue || a.symbol.localeCompare(b.symbol);
    }
    const aRank = Number.isFinite(Number(a.rank)) ? Number(a.rank) : Infinity;
    const bRank = Number.isFinite(Number(b.rank)) ? Number(b.rank) : Infinity;
    return aRank - bRank || a.symbol.localeCompare(b.symbol);
  });
}

function ScanMetric({ label, value, detail }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{formatLabel(value)}</strong>
      {detail && <small>{detail}</small>}
    </div>
  );
}

function GlobalScan() {
  const requestIdRef = useRef(0);
  const [symbols] = useState(() => uniqueSymbols(SCAN_UNIVERSE));
  const [timeframe, setTimeframe] = useState("5Min");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("rank");
  const [selectedSymbol, setSelectedSymbol] = useState(symbols[0] || "SPY");
  const [rows, setRows] = useState([]);
  const [scanState, setScanState] = useState("IDLE");
  const [lastScanAt, setLastScanAt] = useState(null);

  async function runScan() {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setScanState("LOADING");

    const universe = uniqueSymbols(symbols);
    if (!universe.length) {
      setRows([]);
      setScanState("EMPTY");
      return;
    }

    const results = await Promise.allSettled(
      universe.map((symbol, index) =>
        getValidatedChartData(symbol, timeframe, { limit: 80 })
          .then((chartData) => buildScanRow(symbol, chartData, index))
      )
    );

    if (requestIdRef.current !== requestId) return;

    const nextRows = results.map((result, index) => {
      if (result.status === "fulfilled") return result.value;
      const symbol = universe[index];
      return buildScanRow(symbol, {
        symbol,
        candles: [],
        quote: null,
        status: "BACKEND_UNAVAILABLE",
        error: result.reason?.message || "BACKEND_UNAVAILABLE",
        validation: {
          status: "BACKEND_UNAVAILABLE",
          qualityLabel: "BLOCKED",
          qualityScore: 0,
          errors: ["BACKEND_UNAVAILABLE"],
          warnings: [],
        },
        provenance: {
          provider: "BACKEND_UNAVAILABLE",
          sourceType: "BACKEND_UNAVAILABLE",
          timestamp: null,
          dataAge: null,
          sessionState: "UNKNOWN_SESSION",
          simulated: false,
          generated: false,
        },
      }, index);
    });

    setRows(rankRows(nextRows));
    setLastScanAt(new Date().toISOString());

    const availableCount = nextRows.filter((row) => row.available).length;
    if (availableCount === 0) {
      setScanState("DATA_UNAVAILABLE");
    } else if (availableCount < nextRows.length || nextRows.some((row) => row.status === "STALE" || row.status === "PARTIAL")) {
      setScanState("PARTIAL");
    } else {
      setScanState("READY");
    }
  }

  useEffect(() => {
    runScan();
    return () => {
      requestIdRef.current += 1;
    };
  }, [timeframe]);

  const visibleRows = useMemo(() => {
    const query = search.trim().toUpperCase();
    const filtered = query
      ? rows.filter((row) => row.symbol.includes(query))
      : rows;
    return sortRows(filtered, sortBy);
  }, [rows, search, sortBy]);

  const selectedRow = visibleRows.find((row) => row.symbol === selectedSymbol)
    || rows.find((row) => row.symbol === selectedSymbol)
    || visibleRows[0]
    || null;

  useEffect(() => {
    if (selectedRow && selectedRow.symbol !== selectedSymbol) {
      setSelectedSymbol(selectedRow.symbol);
    }
  }, [selectedRow, selectedSymbol]);

  const completeRows = rows.filter((row) => row.available).length;
  const unavailableRows = rows.length - completeRows;

  return (
    <div className="global-scan-page">
      <header className="global-scan-header">
        <div>
          <h1>GLOBAL SCAN</h1>
          <p>US Equities Scan - Alpaca validated scope</p>
        </div>
        <div className="global-scan-controls" aria-label="Global Scan controls">
          <label>
            <span>Search</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Symbol"
            />
          </label>
          <label>
            <span>Sort</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
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
          <button type="button" onClick={runScan} disabled={scanState === "LOADING"}>
            {scanState === "LOADING" ? "Scanning" : "Refresh"}
          </button>
        </div>
      </header>

      <section className="scan-summary-grid" aria-label="Global Scan summary">
        <ScanMetric label="Scan Scope" value="US_EQUITIES_MULTI_SYMBOL" detail="Global-market data is not certified." />
        <ScanMetric label="Universe" value={`${symbols.length} symbols`} detail={symbols.join(", ")} />
        <ScanMetric label="Scan State" value={scanState} />
        <ScanMetric label="Validated Rows" value={`${completeRows}/${rows.length || symbols.length}`} />
        <ScanMetric label="Unavailable Rows" value={unavailableRows} />
        <ScanMetric label="Last Scan" value={formatTimestamp(lastScanAt)} />
      </section>

      <section className="global-scan-grid">
        <div className="scan-panel scan-results-panel">
          <h2>Ranked Scan Results</h2>
          {scanState === "LOADING" && <p className="scan-state-message">Loading validated provider data.</p>}
          {!visibleRows.length && scanState !== "LOADING" && (
            <p className="scan-state-message">No scan rows match the current filter.</p>
          )}
          <div className="scan-table" role="table" aria-label="Global Scan ranked results">
            <div className="scan-table-row scan-table-head" role="row">
              <span role="columnheader">Rank</span>
              <span role="columnheader">Symbol</span>
              <span role="columnheader">Score</span>
              <span role="columnheader">Trend</span>
              <span role="columnheader">Change</span>
              <span role="columnheader">Status</span>
              <span role="columnheader">Quality</span>
            </div>
            {visibleRows.map((row) => (
              <button
                key={row.symbol}
                type="button"
                className={`scan-table-row ${selectedRow?.symbol === row.symbol ? "selected" : ""}`}
                role="row"
                onClick={() => setSelectedSymbol(row.symbol)}
                aria-label={`Select ${row.symbol} scan row`}
              >
                <span role="cell">{row.rank ?? "--"}</span>
                <strong role="cell">{row.symbol}</strong>
                <span role="cell">{row.score ?? "UNAVAILABLE"}</span>
                <span role="cell">{formatLabel(row.trend)}</span>
                <span role="cell">{formatPercent(row.percentChange)}</span>
                <span role="cell">{formatLabel(row.status)}</span>
                <span role="cell">{formatLabel(row.qualityLabel)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="scan-panel">
          <h2>Selected Result</h2>
          <div className="scan-metrics">
            <ScanMetric label="Symbol" value={selectedRow?.symbol} />
            <ScanMetric label="Provider" value={selectedRow?.provider} />
            <ScanMetric label="Source Type" value={selectedRow?.sourceType} />
            <ScanMetric label="Timestamp" value={formatTimestamp(selectedRow?.timestamp)} />
            <ScanMetric label="Data Age" value={formatDataAge(selectedRow?.dataAge)} />
            <ScanMetric label="Session" value={selectedRow?.sessionState} />
            <ScanMetric label="Signal State" value={selectedRow?.signalState} />
            <ScanMetric label="Failsafe State" value={selectedRow?.failsafeState} />
          </div>
        </div>

        <div className="scan-panel">
          <h2>Unsupported Global Capabilities</h2>
          <div className="scan-list">
            <span>Global markets <strong>NOT IMPLEMENTED</strong></span>
            <span>Market breadth <strong>NOT IMPLEMENTED</strong></span>
            <span>Sector breadth <strong>NOT IMPLEMENTED</strong></span>
            <span>Macro context <strong>NOT IMPLEMENTED</strong></span>
            <span>Webull data <strong>NOT IMPLEMENTED</strong></span>
          </div>
        </div>

        <div className="scan-panel">
          <h2>Scan Findings</h2>
          <ul className="scan-findings">
            <li>Scope is limited to Alpaca-supported US equities and ETFs.</li>
            <li>Rows without validated quote/candle context are not ranked above validated rows.</li>
            <li>Rank score uses validated change, recent candle trend, volatility penalty, and quality score.</li>
            {selectedRow?.warnings?.length ? (
              selectedRow.warnings.slice(0, 5).map((warning) => <li key={warning}>{warning}</li>)
            ) : (
              <li>No selected-row warnings reported.</li>
            )}
          </ul>
        </div>
      </section>

      <section className="scan-chart-shell">
        <MarketPriceChart
          symbol={selectedRow?.symbol || selectedSymbol}
          timeframe={timeframe}
          candles={selectedRow?.chartData?.candles || []}
          quote={selectedRow?.chartData?.quote || null}
          validation={selectedRow?.chartData?.validation}
          provenance={selectedRow?.chartData?.provenance}
          loading={scanState === "LOADING"}
          error={selectedRow?.chartData?.error}
          height={360}
          availableSymbols={symbols}
          availableTimeframes={CHART_TIMEFRAMES}
          onSymbolChange={setSelectedSymbol}
          onTimeframeChange={setTimeframe}
          title="Global Scan Selected Symbol"
        />
      </section>
    </div>
  );
}

export default GlobalScan;
