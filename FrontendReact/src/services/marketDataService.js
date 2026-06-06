const MOCK_WATCHLIST_DATA = [
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    category: "AI Leaders",
    price: 145.22,
    changePercent: 2.14,
    volume: "45.2M",
    consensus: "MODERATE",
    confidence: 78,
    signal: "BUY WATCH",
    risk: "LOW",
    updatedAt: "2026-06-05T14:30:00.000Z",
  },
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    category: "Tech Leaders",
    price: 203.41,
    changePercent: 0.64,
    volume: "52.8M",
    consensus: "STRONG",
    confidence: 84,
    signal: "MONITOR",
    risk: "LOW",
    updatedAt: "2026-06-05T14:30:00.000Z",
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    category: "Tech Leaders",
    price: 489.12,
    changePercent: 1.08,
    volume: "29.4M",
    consensus: "STRONG",
    confidence: 86,
    signal: "BUY WATCH",
    risk: "LOW",
    updatedAt: "2026-06-05T14:30:00.000Z",
  },
  {
    symbol: "AMD",
    name: "Advanced Micro Devices",
    category: "AI Leaders",
    price: 164.58,
    changePercent: -0.72,
    volume: "61.1M",
    consensus: "MODERATE",
    confidence: 69,
    signal: "BREAKOUT WATCH",
    risk: "MODERATE",
    updatedAt: "2026-06-05T14:30:00.000Z",
  },
  {
    symbol: "META",
    name: "Meta Platforms",
    category: "Tech Leaders",
    price: 641.33,
    changePercent: 1.42,
    volume: "18.7M",
    consensus: "MODERATE",
    confidence: 74,
    signal: "MONITOR",
    risk: "LOW",
    updatedAt: "2026-06-05T14:30:00.000Z",
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    category: "Growth",
    price: 184.06,
    changePercent: -2.36,
    volume: "93.5M",
    consensus: "WEAK",
    confidence: 42,
    signal: "SELL WATCH",
    risk: "HIGH",
    updatedAt: "2026-06-05T14:30:00.000Z",
  },
  {
    symbol: "QQQ",
    name: "Invesco QQQ Trust",
    category: "ETFs",
    price: 531.79,
    changePercent: 0.92,
    volume: "38.9M",
    consensus: "MODERATE",
    confidence: 72,
    signal: "MONITOR",
    risk: "LOW",
    updatedAt: "2026-06-05T14:30:00.000Z",
  },
  {
    symbol: "SPY",
    name: "SPDR S&P 500 ETF",
    category: "ETFs",
    price: 604.23,
    changePercent: 0.51,
    volume: "71.6M",
    consensus: "MODERATE",
    confidence: 70,
    signal: "MONITOR",
    risk: "LOW",
    updatedAt: "2026-06-05T14:30:00.000Z",
  },
  {
    symbol: "SOXL",
    name: "Direxion Semiconductor Bull 3X",
    category: "ETFs",
    price: 48.91,
    changePercent: 3.88,
    volume: "82.3M",
    consensus: "STRONG",
    confidence: 81,
    signal: "BUY WATCH",
    risk: "HIGH",
    updatedAt: "2026-06-05T14:30:00.000Z",
  },
  {
    symbol: "PLTR",
    name: "Palantir Technologies",
    category: "Custom Watchlist",
    price: 126.75,
    changePercent: 1.76,
    volume: "54.7M",
    consensus: "MODERATE",
    confidence: 76,
    signal: "BREAKOUT WATCH",
    risk: "MODERATE",
    updatedAt: "2026-06-05T14:30:00.000Z",
  },
];

const MOCK_CANDLES = [
  { time: "09:30", open: 145.12, high: 146.22, low: 144.9, close: 145.8, volume: 4520000 },
  { time: "09:45", open: 145.8, high: 146.74, low: 145.42, close: 146.35, volume: 3910000 },
  { time: "10:00", open: 146.35, high: 147.18, low: 146.02, close: 146.88, volume: 4180000 },
  { time: "10:15", open: 146.88, high: 148.04, low: 146.71, close: 147.92, volume: 5360000 },
  { time: "10:30", open: 147.92, high: 148.2, low: 146.94, close: 147.12, volume: 4040000 },
  { time: "10:45", open: 147.12, high: 147.66, low: 146.58, close: 147.44, volume: 3490000 },
  { time: "11:00", open: 147.44, high: 148.33, low: 147.2, close: 148.08, volume: 4760000 },
  { time: "11:15", open: 148.08, high: 148.52, low: 147.46, close: 147.7, volume: 3620000 },
  { time: "11:30", open: 147.7, high: 148.14, low: 147.05, close: 147.92, volume: 3180000 },
  { time: "11:45", open: 147.92, high: 148.88, low: 147.74, close: 148.61, volume: 4210000 },
  { time: "12:00", open: 148.61, high: 149.1, low: 148.2, close: 148.84, volume: 3870000 },
  { time: "12:15", open: 148.84, high: 149.32, low: 148.08, close: 148.36, volume: 3560000 },
];

const MOCK_SIGNAL_MARKERS = [
  {
    time: "10:15",
    type: "BUY WATCH",
    confidence: 78,
    reason: "Consensus improving with stable risk.",
  },
  {
    time: "11:00",
    type: "BREAKOUT WATCH",
    confidence: 74,
    reason: "Price structure expanded while liquidity remained supportive.",
  },
  {
    time: "12:15",
    type: "RISK CHECK",
    confidence: 64,
    reason: "Momentum cooled near elevated volume.",
  },
];

const MOCK_STREAM_STATUSES = [
  {
    name: "Equities",
    status: "SIMULATION",
    latency: "42ms",
    lastUpdate: "15:22:01",
    health: "CONNECTED",
  },
  {
    name: "Options",
    status: "STANDBY",
    latency: "65ms",
    lastUpdate: "15:21:58",
    health: "STABLE",
  },
  {
    name: "News",
    status: "SIMULATION",
    latency: "88ms",
    lastUpdate: "15:22:00",
    health: "CONNECTED",
  },
  {
    name: "Signals",
    status: "CONNECTED",
    latency: "31ms",
    lastUpdate: "15:22:05",
    health: "CONNECTED",
  },
  {
    name: "Watchlists",
    status: "CONNECTED",
    latency: "28ms",
    lastUpdate: "15:22:02",
    health: "CONNECTED",
  },
  {
    name: "Charts",
    status: "SIMULATION",
    latency: "54ms",
    lastUpdate: "15:22:04",
    health: "CONNECTED",
  },
];

const MOCK_STREAM_HEALTH = [
  { label: "Data Quality", value: 92 },
  { label: "Latency", value: 87 },
  { label: "Update Frequency", value: 89 },
  { label: "Integrity", value: 95 },
];

const MOCK_ACTIVE_STREAM_EVENTS = [
  { time: "15:22:01", message: "Equities Updated" },
  { time: "15:22:02", message: "Watchlist Refreshed" },
  { time: "15:22:05", message: "Signal Engine Processed" },
  { time: "15:22:06", message: "Consensus Updated" },
  { time: "15:22:08", message: "Chart Candles Normalized" },
  { time: "15:22:10", message: "Risk Stream Checked" },
];

const MOCK_PIPELINE_NODES = [
  "Market Sources",
  "Market Data Service",
  "Watchlists",
  "Charts",
  "Signal Engine",
  "Brains",
  "Executive Intelligence",
];

const MOCK_FUTURE_CONNECTIONS = [
  "Webull",
  "Polygon",
  "Finnhub",
  "AlphaVantage",
];

export function getWatchlistSymbols() {
  return MOCK_WATCHLIST_DATA.map((item) => item.symbol);
}

export function getMarketQuote(symbol) {
  return (
    MOCK_WATCHLIST_DATA.find(
      (item) => item.symbol.toUpperCase() === symbol.toUpperCase()
    ) || null
  );
}

export function getMarketQuotes(symbols) {
  return symbols
    .map((symbol) => getMarketQuote(symbol))
    .filter((quote) => quote !== null);
}

export function getDefaultWatchlists() {
  return MOCK_WATCHLIST_DATA;
}

export function getHistoricalCandles(symbol) {
  const quote = getMarketQuote(symbol);
  const anchorPrice = quote?.price || MOCK_CANDLES[0].close;
  const baseClose = MOCK_CANDLES[MOCK_CANDLES.length - 1].close;
  const offset = anchorPrice - baseClose;

  return MOCK_CANDLES.map((candle) => ({
    ...candle,
    open: Number((candle.open + offset).toFixed(2)),
    high: Number((candle.high + offset).toFixed(2)),
    low: Number((candle.low + offset).toFixed(2)),
    close: Number((candle.close + offset).toFixed(2)),
  }));
}

export function getSignalMarkers(symbol) {
  const quote = getMarketQuote(symbol);

  return MOCK_SIGNAL_MARKERS.map((marker, index) => ({
    ...marker,
    type: index === 0 ? quote?.signal || marker.type : marker.type,
    confidence: index === 0 ? quote?.confidence || marker.confidence : marker.confidence,
  }));
}

export function getChartSymbols() {
  return getWatchlistSymbols();
}

export function getStreamStatuses() {
  return MOCK_STREAM_STATUSES;
}

export function getStreamHealth() {
  return MOCK_STREAM_HEALTH;
}

export function getActiveStreamEvents() {
  return MOCK_ACTIVE_STREAM_EVENTS;
}

export function getPipelineNodes() {
  return MOCK_PIPELINE_NODES;
}

export function getFutureConnections() {
  return MOCK_FUTURE_CONNECTIONS;
}
