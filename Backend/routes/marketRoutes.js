const express = require("express");
const {
  getHistoricalCandles,
  getQuote,
  getProviderDiagnostics,
  getProviderStatus,
  getProviderSignals,
  getQuotes
} = require("../services/marketProviderService");
const {
  getWebullCapabilities,
  getWebullHealth,
  getWebullQuote
} = require("../services/webullService");
const {
  rejectSimulationRequest
} = require("../config/runtimePolicy");

const router = express.Router();

function rejectBlockedSimulation(req, res) {
  const rejection = rejectSimulationRequest(req.query.simulate);

  if (!rejection) return false;

  res.status(403).json(rejection);
  return true;
}

function normalizeVolume(value) {
  if (typeof value === "number") return value;

  const text = String(value || "0").trim().toUpperCase();
  const numeric = Number.parseFloat(text);

  if (!Number.isFinite(numeric)) return 0;
  if (text.endsWith("M")) return Math.round(numeric * 1000000);
  if (text.endsWith("K")) return Math.round(numeric * 1000);

  return numeric;
}

router.get("/provider-status", (req, res) => {
  if (rejectBlockedSimulation(req, res)) return;

  res.json(getProviderStatus({ simulate: req.query.simulate }));
});

router.get("/provider-diagnostics", (req, res) => {
  if (rejectBlockedSimulation(req, res)) return;

  res.json(getProviderDiagnostics({ simulate: req.query.simulate }));
});

router.get("/webull-health", (req, res) => {
  const health = getWebullHealth();

  res.json({
    configured: health.configured,
    enabled: health.enabled,
    environment: health.environment,
    status: health.status,
    readyForActivation: health.readyForActivation,
    warnings: health.warnings,
    capabilities: getWebullCapabilities()
  });
});

router.get("/webull-quote-test", async (req, res) => {
  const symbol = String(req.query.symbol || "SPY").trim().toUpperCase();
  const quote = await getWebullQuote(symbol);

  res.json(quote);
});

router.get("/provider-quote-compare", async (req, res) => {
  const symbol = String(req.query.symbol || "SPY").trim().toUpperCase();
  const [providerStatus, activeQuote, webullQuote] = await Promise.all([
    Promise.resolve(getProviderStatus()),
    getQuote(symbol),
    getWebullQuote(symbol)
  ]);
  const alpacaStatus = activeQuote.available === false
    ? "UNAVAILABLE"
    : activeQuote.provider === "ALPACA"
    ? "SUCCESS"
    : activeQuote.provider === "SIMULATION"
      ? "PENDING"
      : "SUCCESS";
  const canCompare = alpacaStatus === "SUCCESS" && webullQuote.status === "SUCCESS";

  res.json({
    symbol,
    activeProvider: providerStatus.activeProvider,
    primaryProvider: providerStatus.primaryProvider,
    alpaca: {
      status: alpacaStatus,
      price: Number(activeQuote.price || 0),
      changePercent: Number(activeQuote.changePercent || 0),
      volume: normalizeVolume(activeQuote.volume),
      timestamp: activeQuote.updatedAt || activeQuote.timestamp || null,
      sessionState: activeQuote.sessionState,
      dataState: activeQuote.dataState,
      sourceType: activeQuote.sourceType
    },
    webull: {
      status: webullQuote.status,
      price: Number(webullQuote.price || 0),
      changePercent: Number(webullQuote.changePercent || 0),
      volume: normalizeVolume(webullQuote.volume),
      timestamp: webullQuote.timestamp,
      message: webullQuote.message
    },
    difference: {
      priceDifference: canCompare
        ? Number((Number(activeQuote.price || 0) - Number(webullQuote.price || 0)).toFixed(4))
        : 0,
      changeDifference: canCompare
        ? Number((Number(activeQuote.changePercent || 0) - Number(webullQuote.changePercent || 0)).toFixed(4))
        : 0
    }
  });
});

router.get("/quotes", async (req, res) => {
  if (rejectBlockedSimulation(req, res)) return;

  const symbols = String(req.query.symbols || "")
    .split(",")
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean);

  const quotes = await getQuotes(symbols, { simulate: req.query.simulate });
  res.json(quotes);
});

router.get("/candles", async (req, res) => {
  if (rejectBlockedSimulation(req, res)) return;

  const symbol = String(req.query.symbol || "SPY").trim().toUpperCase();
  const timeframe = String(req.query.timeframe || "5Min").trim();
  const limit = Number.parseInt(req.query.limit, 10) || 80;
  const candles = await getHistoricalCandles(symbol, timeframe, limit, {
    simulate: req.query.simulate
  });

  res.json(candles);
});

router.get("/provider-signals", async (req, res) => {
  if (rejectBlockedSimulation(req, res)) return;

  const symbols = String(req.query.symbols || "")
    .split(",")
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean);
  const signals = await getProviderSignals(symbols, { simulate: req.query.simulate });

  res.json(signals);
});

module.exports = router;
