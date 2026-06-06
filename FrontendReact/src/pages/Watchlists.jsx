import { useEffect, useMemo, useState } from "react";
import { getDefaultWatchlists } from "../services/marketDataService";
import {
  getMarketQuotes,
  getMarketProviderStatus,
  getOfflineMarketProviderStatus,
  getProviderSignals,
} from "../services/marketProviderApi";
import "../styles/Watchlists.css";

const WATCHLIST_DATA = getDefaultWatchlists();

const categories = [
  "All Categories",
  "Tech Leaders",
  "AI Leaders",
  "ETFs",
  "Growth",
  "Custom Watchlist",
];

const riskRank = {
  LOW: 1,
  MODERATE: 2,
  HIGH: 3,
};

function displayState(value) {
  if (value === undefined || value === null || value === "") return "OFFLINE";
  return String(value).replace(/_/g, " ");
}

function displayProvider(value) {
  return value === "SIMULATION" ? "FALLBACK SIMULATION" : displayState(value);
}

function enabledCapabilities(capabilities = {}) {
  return Object.entries(capabilities)
    .filter(([, enabled]) => enabled)
    .map(([name]) => name.replace(/([A-Z])/g, " $1").toUpperCase())
    .join(", ");
}

function Watchlists() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("Symbol");
  const [providerStatus, setProviderStatus] = useState(getOfflineMarketProviderStatus());
  const [watchlistRows, setWatchlistRows] = useState(WATCHLIST_DATA);

  useEffect(() => {
    async function loadProviderData() {
      const symbols = WATCHLIST_DATA.map((item) => item.symbol);
      const [status, quotes, signals] = await Promise.all([
        getMarketProviderStatus(),
        getMarketQuotes(symbols),
        getProviderSignals(symbols),
      ]);
      const quoteBySymbol = new Map(
        quotes.map((quote) => [String(quote.symbol || "").toUpperCase(), quote])
      );
      const signalBySymbol = new Map(
        signals.map((signal) => [String(signal.symbol || "").toUpperCase(), signal])
      );

      setProviderStatus(status);
      setWatchlistRows((previousRows) =>
        WATCHLIST_DATA.map((item) => {
          const previousItem =
            previousRows.find((row) => row.symbol === item.symbol) || item;
          const quote = quoteBySymbol.get(item.symbol);
          const providerSignal = signalBySymbol.get(item.symbol);

          if (!quote && !providerSignal) return previousItem;

          return {
            ...previousItem,
            name: quote?.name || previousItem.name,
            price: Number.isFinite(Number(providerSignal?.price ?? quote?.price))
              ? Number(providerSignal?.price ?? quote?.price)
              : previousItem.price,
            changePercent: Number.isFinite(Number(providerSignal?.changePercent ?? quote?.changePercent))
              ? Number(providerSignal?.changePercent ?? quote?.changePercent)
              : previousItem.changePercent,
            volume: providerSignal?.volume || quote?.volume || previousItem.volume,
            signal: providerSignal?.signal || previousItem.signal,
            confidence: Number.isFinite(Number(providerSignal?.confidence))
              ? Number(providerSignal.confidence)
              : previousItem.confidence,
            risk: providerSignal?.risk || previousItem.risk,
            signalType: providerSignal?.signalType || previousItem.signalType,
            reason: providerSignal?.reason || previousItem.reason,
            provider: providerSignal?.provider || quote?.provider || status.activeProvider,
            providerStatus: quote?.providerStatus || status.providerHealth,
            updatedAt: providerSignal?.updatedAt || quote?.updatedAt || previousItem.updatedAt,
          };
        })
      );
    }

    loadProviderData();

    const interval = setInterval(loadProviderData, 10000);

    return () => clearInterval(interval);
  }, []);

  const visibleRows = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return watchlistRows.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        item.symbol.toLowerCase().includes(normalizedSearch) ||
        item.name.toLowerCase().includes(normalizedSearch);
      const matchesCategory =
        selectedCategory === "All Categories" ||
        item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      if (sortBy === "Price") return b.price - a.price;
      if (sortBy === "Daily Change %") return b.changePercent - a.changePercent;
      if (sortBy === "Confidence") return b.confidence - a.confidence;
      if (sortBy === "Risk") return (riskRank[b.risk] || 0) - (riskRank[a.risk] || 0);

      return a.symbol.localeCompare(b.symbol);
    });
  }, [searchTerm, selectedCategory, sortBy, watchlistRows]);

  const activeSignals = watchlistRows.filter((item) =>
    item.signal.includes("WATCH")
  ).length;
  const averageConfidence = Math.round(
    watchlistRows.reduce((total, item) => total + item.confidence, 0) /
      watchlistRows.length
  );
  const highestRisk = watchlistRows.some((item) => item.risk === "HIGH")
    ? "HIGH"
    : watchlistRows.some((item) => item.risk === "MODERATE")
      ? "MODERATE"
      : "LOW";

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
          <strong>{displayProvider(providerStatus.fallbackProvider)}</strong>
        </div>

        <div className="watchlist-summary-card">
          <span>Provider Health</span>
          <strong>{displayState(providerStatus.providerHealth)}</strong>
        </div>

        <div className="watchlist-summary-card">
          <span>Market Status</span>
          <strong>{displayState(providerStatus.marketStatus)}</strong>
        </div>

        <div className="watchlist-summary-card">
          <span>Capabilities</span>
          <strong>{enabledCapabilities(providerStatus.capabilities)}</strong>
        </div>

        <div className="watchlist-summary-card">
          <span>Source</span>
          <strong>{displayState(providerStatus.activeProvider)} SIGNAL ADAPTER</strong>
        </div>
      </section>

      <section className="watchlist-controls">
        <input
          type="search"
          placeholder="Search symbols"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />

        <select
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
        >
          {categories.map((category) => (
            <option key={category}>{category}</option>
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

      <section className="watchlist-table">
        <div className="watchlist-row watchlist-heading">
          <span>Symbol</span>
          <span>Last Price</span>
          <span>Daily Change %</span>
          <span>Volume</span>
          <span>Consensus</span>
          <span>Confidence</span>
          <span>Signal</span>
          <span>Risk</span>
        </div>

        {visibleRows.map((item) => (
          <div className="watchlist-row" key={item.symbol}>
            <span>
              <strong>{item.symbol}</strong>
              <small>{item.name}</small>
            </span>
            <span>${item.price.toFixed(2)}</span>
            <span className={item.changePercent >= 0 ? "positive-change" : "negative-change"}>
              {item.changePercent >= 0 ? "+" : ""}
              {item.changePercent.toFixed(2)}%
            </span>
            <span>{item.volume}</span>
            <span>{item.consensus}</span>
            <span>{item.confidence}%</span>
            <span>
              <b className="watchlist-signal-badge">{item.signal}</b>
            </span>
            <span>
              <b className={`watchlist-risk-badge risk-${item.risk.toLowerCase()}`}>
                {item.risk}
              </b>
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}

export default Watchlists;
