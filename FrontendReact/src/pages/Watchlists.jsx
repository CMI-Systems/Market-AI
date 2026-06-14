import { useEffect, useMemo, useState } from "react";
import { getDefaultWatchlists } from "../services/marketDataService";
import {
  getMarketProviderStatus,
  getMarketQuotes,
  getOfflineMarketProviderStatus,
  getOfflineProviderDiagnostics,
  getProviderDiagnostics,
  getProviderSignals,
} from "../services/marketProviderApi";
import "../styles/Watchlists.css";

const WATCHLIST_STORAGE_KEY = "market-ai-watchlist-symbols";
const DEFAULT_SYMBOLS = ["SPY", "QQQ", "NVDA", "AAPL", "MSFT", "AMD", "TSLA", "META", "PLTR", "SOXL"];
const WATCHLIST_DATA = getDefaultWatchlists();
const AICC_BETA_DISCLAIMER =
  "For research and intelligence purposes only. Not financial advice.";

const riskRank = {
  LOW: 1,
  MODERATE: 2,
  HIGH: 3,
};

function displayState(value, fallback = "OFFLINE") {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value).replace(/_/g, " ");
}

function displayProvider(value) {
  return value === "SIMULATION" || value === "FALLBACK" ? "SIMULATION" : displayState(value);
}

function displayFallbackStatus(providerStatus, providerDiagnostics) {
  if (providerStatus.activeProvider === "SIMULATION" || providerStatus.activeProvider === "FALLBACK") {
    return "SIMULATION";
  }

  return providerDiagnostics.fallback?.status || "UNAVAILABLE";
}

function normalizeSymbol(symbol) {
  return String(symbol || "").trim().toUpperCase().replace(/[^A-Z0-9.-]/g, "");
}

function getStoredSymbols() {
  try {
    const parsed = JSON.parse(localStorage.getItem(WATCHLIST_STORAGE_KEY) || "[]");
    const symbols = Array.isArray(parsed) ? parsed.map(normalizeSymbol).filter(Boolean) : [];

    return [...new Set(symbols)].length ? [...new Set(symbols)] : DEFAULT_SYMBOLS;
  } catch {
    return DEFAULT_SYMBOLS;
  }
}

function persistSymbols(symbols) {
  localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(symbols));
}

function getFallbackRow(symbol) {
  const fallback = WATCHLIST_DATA.find((item) => item.symbol === symbol);

  return {
    symbol,
    name: fallback?.name || symbol,
    category: fallback?.category || "Custom Watchlist",
    price: fallback?.price ?? null,
    changePercent: fallback?.changePercent ?? null,
    volume: fallback?.volume || "--",
    consensus: fallback?.consensus || "DATA_UNAVAILABLE",
    confidence: fallback?.confidence ?? null,
    signal: fallback?.signal || "DATA_UNAVAILABLE",
    risk: fallback?.risk || "UNKNOWN",
    provider: fallback?.provider || "--",
    providerStatus: "--",
    updatedAt: fallback?.updatedAt || null,
    available: fallback?.available === true,
    sourceType: fallback?.sourceType || "DATA_UNAVAILABLE",
    simulated: fallback?.simulated === true,
    generated: fallback?.generated === true,
  };
}

function mergeRow(symbol, previousRows, quoteBySymbol, signalBySymbol, providerStatus) {
  const previous = previousRows.find((row) => row.symbol === symbol) || getFallbackRow(symbol);
  const quote = quoteBySymbol.get(symbol);
  const signal = signalBySymbol.get(symbol);
  const price = Number(signal?.price ?? quote?.price);
  const changePercent = Number(signal?.changePercent ?? quote?.changePercent);
  const confidence = Number(signal?.confidence);
  const quoteUnavailable = quote?.available === false || quote?.sourceType === "DATA_UNAVAILABLE";

  return {
    ...previous,
    symbol,
    name: quote?.name || previous.name || symbol,
    price: quoteUnavailable ? null : Number.isFinite(price) ? price : previous.price,
    changePercent: quoteUnavailable ? null : Number.isFinite(changePercent) ? changePercent : previous.changePercent,
    volume: quoteUnavailable ? "--" : signal?.volume || quote?.volume || previous.volume || "--",
    consensus: previous.consensus || "DATA_UNAVAILABLE",
    signal: signal?.signal || previous.signal || "DATA_UNAVAILABLE",
    confidence: Number.isFinite(confidence) ? confidence : previous.confidence ?? null,
    risk: signal?.risk || previous.risk || "UNKNOWN",
    signalType: signal?.signalType || previous.signalType,
    reason: signal?.reason || previous.reason,
    provider: signal?.provider || quote?.provider || providerStatus.activeProvider || previous.provider || "--",
    providerStatus: quote?.providerStatus || providerStatus.providerHealth || previous.providerStatus || "--",
    updatedAt: signal?.updatedAt || quote?.updatedAt || previous.updatedAt,
  };
}

function formatPrice(value) {
  return Number.isFinite(Number(value)) ? `$${Number(value).toFixed(2)}` : "--";
}

function formatChange(value) {
  if (!Number.isFinite(Number(value))) return "--";

  return `${Number(value) >= 0 ? "+" : ""}${Number(value).toFixed(2)}%`;
}

function formatUpdatedAt(value) {
  if (!value) return "--";
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "--";

  return date.toLocaleString();
}

function Watchlists() {
  const [symbols, setSymbols] = useState(() => getStoredSymbols());
  const [newSymbol, setNewSymbol] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSignal, setSelectedSignal] = useState("All Signals");
  const [selectedRisk, setSelectedRisk] = useState("All Risks");
  const [sortBy, setSortBy] = useState("Symbol");
  const [providerStatus, setProviderStatus] = useState(getOfflineMarketProviderStatus());
  const [providerDiagnostics, setProviderDiagnostics] = useState(getOfflineProviderDiagnostics());
  const [watchlistRows, setWatchlistRows] = useState(() => DEFAULT_SYMBOLS.map(getFallbackRow));
  const [selectedSymbol, setSelectedSymbol] = useState(DEFAULT_SYMBOLS[0]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    persistSymbols(symbols);
  }, [symbols]);

  useEffect(() => {
    setWatchlistRows((previousRows) => symbols.map((symbol) => mergeRow(
      symbol,
      previousRows,
      new Map(),
      new Map(),
      providerStatus
    )));

    if (!symbols.includes(selectedSymbol)) {
      setSelectedSymbol(symbols[0] || "");
    }
  }, [providerStatus, selectedSymbol, symbols]);

  useEffect(() => {
    let mounted = true;

    async function loadProviderData() {
      if (!symbols.length) return;

      const [status, diagnostics, quotes, signals] = await Promise.all([
        getMarketProviderStatus(),
        getProviderDiagnostics(),
        getMarketQuotes(symbols),
        getProviderSignals(symbols),
      ]);

      if (!mounted) return;

      const quoteBySymbol = new Map(
        quotes.map((quote) => [normalizeSymbol(quote.symbol), quote])
      );
      const signalBySymbol = new Map(
        signals.map((signal) => [normalizeSymbol(signal.symbol), signal])
      );

      setProviderStatus(status);
      setProviderDiagnostics(diagnostics);

      if (!quotes.length && !signals.length) {
        setErrorMessage("Provider data temporarily unavailable");
        return;
      }

      setErrorMessage("");
      setWatchlistRows((previousRows) =>
        symbols.map((symbol) => mergeRow(symbol, previousRows, quoteBySymbol, signalBySymbol, status))
      );
    }

    loadProviderData();

    const interval = setInterval(loadProviderData, 60000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [symbols]);

  const signalOptions = useMemo(
    () => ["All Signals", ...new Set(watchlistRows.map((item) => item.signal || "NEUTRAL"))],
    [watchlistRows]
  );
  const riskOptions = useMemo(
    () => ["All Risks", ...new Set(watchlistRows.map((item) => item.risk || "MODERATE"))],
    [watchlistRows]
  );

  const visibleRows = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return watchlistRows
      .filter((item) => {
        const matchesSearch =
          !normalizedSearch ||
          item.symbol.toLowerCase().includes(normalizedSearch) ||
          item.name.toLowerCase().includes(normalizedSearch);
        const matchesSignal =
          selectedSignal === "All Signals" || item.signal === selectedSignal;
        const matchesRisk = selectedRisk === "All Risks" || item.risk === selectedRisk;

        return matchesSearch && matchesSignal && matchesRisk;
      })
      .sort((a, b) => {
        if (sortBy === "Price") return Number(b.price || 0) - Number(a.price || 0);
        if (sortBy === "Daily Change %") return Number(b.changePercent || 0) - Number(a.changePercent || 0);
        if (sortBy === "Confidence") return Number(b.confidence || 0) - Number(a.confidence || 0);
        if (sortBy === "Risk") return (riskRank[b.risk] || 0) - (riskRank[a.risk] || 0);

        return a.symbol.localeCompare(b.symbol);
      });
  }, [searchTerm, selectedRisk, selectedSignal, sortBy, watchlistRows]);

  const selectedRow =
    watchlistRows.find((item) => item.symbol === selectedSymbol) || watchlistRows[0] || null;
  const activeSignals = watchlistRows.filter((item) =>
    String(item.signal || "").includes("WATCH")
  ).length;
  const averageConfidence = watchlistRows.length
    ? (() => {
        const confidenceValues = watchlistRows
          .map((item) => Number(item.confidence))
          .filter(Number.isFinite);

        return confidenceValues.length
          ? Math.round(confidenceValues.reduce((total, value) => total + value, 0) / confidenceValues.length)
          : 0;
      })()
    : 0;
  const highestRisk = watchlistRows.some((item) => item.risk === "HIGH")
    ? "HIGH"
    : watchlistRows.some((item) => item.risk === "MODERATE")
      ? "MODERATE"
      : watchlistRows.some((item) => item.risk === "LOW")
        ? "LOW"
        : "UNKNOWN";

  function addSymbol(event) {
    event.preventDefault();
    const symbol = normalizeSymbol(newSymbol);

    if (!symbol) return;
    if (symbols.includes(symbol)) {
      setErrorMessage(`${symbol} is already in this watchlist`);
      return;
    }

    setSymbols((currentSymbols) => [...currentSymbols, symbol]);
    setSelectedSymbol(symbol);
    setNewSymbol("");
    setErrorMessage("");
  }

  function removeSymbol(symbol) {
    setSymbols((currentSymbols) => currentSymbols.filter((item) => item !== symbol));
  }

  return (
    <div className="watchlists-page">
      <header className="watchlists-header">
        <h1>WATCHLISTS</h1>
        <p>Live market intelligence watchlists and signal monitoring.</p>
      </header>

      <section className="watchlist-summary-grid">
        <div className="watchlist-summary-card">
          <span>Total Symbols</span>
          <strong>{watchlistRows.length}</strong>
        </div>

        <div className="watchlist-summary-card">
          <span>Active Signals</span>
          <strong>{activeSignals}</strong>
        </div>

        <div className="watchlist-summary-card">
          <span>Average Confidence</span>
          <strong>{averageConfidence}%</strong>
        </div>

        <div className="watchlist-summary-card">
          <span>Highest Risk</span>
          <strong>{highestRisk}</strong>
        </div>
      </section>

      <section className="watchlist-summary-grid">
        <div className="watchlist-summary-card">
          <span>Active Provider</span>
          <strong>{displayProvider(providerStatus.activeProvider)}</strong>
        </div>

        <div className="watchlist-summary-card">
          <span>Primary Provider</span>
          <strong>{displayState(providerStatus.primaryProvider)}</strong>
        </div>

        <div className="watchlist-summary-card">
          <span>Fallback</span>
          <strong>{displayFallbackStatus(providerStatus, providerDiagnostics)}</strong>
        </div>

        <div className="watchlist-summary-card">
          <span>Provider Health</span>
          <strong>{displayState(providerStatus.providerHealth)}</strong>
        </div>

        <div className="watchlist-summary-card">
          <span>Market Status</span>
          <strong>{displayState(providerStatus.marketStatus)}</strong>
        </div>
      </section>

      <section className="watchlist-controls">
        <form className="watchlist-add-form" onSubmit={addSymbol}>
          <input
            type="text"
            placeholder="Add symbol"
            value={newSymbol}
            onChange={(event) => setNewSymbol(event.target.value.toUpperCase())}
          />
          <button type="submit">Add</button>
        </form>

        <input
          type="search"
          placeholder="Search symbols"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />

        <select
          value={selectedSignal}
          onChange={(event) => setSelectedSignal(event.target.value)}
        >
          {signalOptions.map((signal) => (
            <option key={signal}>{signal}</option>
          ))}
        </select>

        <select value={selectedRisk} onChange={(event) => setSelectedRisk(event.target.value)}>
          {riskOptions.map((risk) => (
            <option key={risk}>{risk}</option>
          ))}
        </select>

        <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
          <option>Symbol</option>
          <option>Price</option>
          <option>Daily Change %</option>
          <option>Confidence</option>
          <option>Risk</option>
        </select>
      </section>

      {errorMessage ? <p className="watchlist-error">{errorMessage}</p> : null}

      {selectedRow ? (
        <section className="watchlist-detail-panel">
          <div>
            <span>Selected Symbol</span>
            <strong>{selectedRow.symbol}</strong>
            <small>{selectedRow.name}</small>
          </div>
          <div>
            <span>Last Price</span>
            <strong>{formatPrice(selectedRow.price)}</strong>
          </div>
          <div>
            <span>Change %</span>
            <strong className={Number(selectedRow.changePercent || 0) >= 0 ? "positive-change" : "negative-change"}>
              {formatChange(selectedRow.changePercent)}
            </strong>
          </div>
          <div>
            <span>Volume</span>
            <strong>{selectedRow.volume || "--"}</strong>
          </div>
          <div>
            <span>Provider</span>
            <strong>{displayProvider(selectedRow.provider)}</strong>
          </div>
          <div>
            <span>Signal</span>
            <strong>{selectedRow.signal || "NEUTRAL"}</strong>
          </div>
          <div>
            <span>Confidence</span>
            <strong>{selectedRow.confidence ?? 50}%</strong>
          </div>
          <div>
            <span>Risk</span>
            <strong>{selectedRow.risk || "MODERATE"}</strong>
          </div>
          <div>
            <span>Last Updated</span>
            <strong>{formatUpdatedAt(selectedRow.updatedAt)}</strong>
          </div>
        </section>
      ) : null}

      <section className="watchlist-table">
        <div className="watchlist-row watchlist-heading">
          <span>Symbol</span>
          <span>Last Price</span>
          <span>Daily Change %</span>
          <span>Volume</span>
          <span>Signal</span>
          <span>Confidence</span>
          <span>Risk</span>
          <span>Provider</span>
          <span>Manage</span>
        </div>

        {visibleRows.map((item) => (
          <div
            className={`watchlist-row ${selectedRow?.symbol === item.symbol ? "watchlist-row-selected" : ""}`}
            key={item.symbol}
            role="button"
            tabIndex={0}
            onClick={() => setSelectedSymbol(item.symbol)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setSelectedSymbol(item.symbol);
              }
            }}
          >
            <span>
              <strong>{item.symbol}</strong>
              <small>{item.name || item.symbol}</small>
            </span>
            <span>{formatPrice(item.price)}</span>
            <span className={Number(item.changePercent || 0) >= 0 ? "positive-change" : "negative-change"}>
              {formatChange(item.changePercent)}
            </span>
            <span>{item.volume || "--"}</span>
            <span>
              <b className="watchlist-signal-badge">{item.signal || "NEUTRAL"}</b>
            </span>
            <span>{item.confidence ?? 50}%</span>
            <span>
              <b className={`watchlist-risk-badge risk-${String(item.risk || "MODERATE").toLowerCase()}`}>
                {item.risk || "MODERATE"}
              </b>
            </span>
            <span>{displayProvider(item.provider)}</span>
            <span>
              <b
                className="watchlist-remove-button"
                role="button"
                tabIndex={0}
                onClick={(event) => {
                  event.stopPropagation();
                  removeSymbol(item.symbol);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    removeSymbol(item.symbol);
                  }
                }}
              >
                Remove
              </b>
            </span>
          </div>
        ))}
      </section>

      <p className="watchlist-disclaimer">{AICC_BETA_DISCLAIMER}</p>
    </div>
  );
}

export default Watchlists;
