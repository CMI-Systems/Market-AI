require("dotenv").config();
const axios = require("axios");
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const cognitionRoutes = require("./routes/cognitionRoutes");
const aiccRoutes = require("./routes/aiccRoutes");
const devStreamRoutes = require("./routes/devStreamRoutes");
const marketRoutes = require("./routes/marketRoutes");
const { createGroupAReadRouter } = require("./routes/GroupAReadRoutes");
const { createApiV1Router } = require("./routes/apiV1Routes");
const { createCorsGuard, createCorsOptions } = require("./config/corsPolicy");
const { loadEnvironmentConfig } = require("./config/environment");
const { getSimulationPolicy } = require("./config/runtimePolicy");
const logger = require("./services/structuredLogger");
const {
  getStreamStatus,
  startStream
} = require("./services/streamController");
const {
  getMarketHoursStatus
} = require("./services/marketHours");
const {
  CLOSED_MARKET_SIM_MODE,
  SHADOW_MODE
} = require("./services/simulationMode");
const {
  DEFAULT_SIMULATED_WATCHLIST
} = require("./services/simulatedStreamRunner");
const {
  loadPersistentMemory
} = require("./services/persistentCognitionMemory");
const {
  buildNodeRegistry
} = require("./services/cognitionNodeRegistry");

const runtimeConfig = loadEnvironmentConfig();
const app = express();
const corsOptions = createCorsOptions(process.env);

app.use(createCorsGuard(process.env));
app.use(cors(corsOptions));
app.use(express.json());
app.use("/api/cognition", cognitionRoutes);
app.use("/api/aicc", aiccRoutes);
app.use("/api/dev", devStreamRoutes);
app.use("/api/market", marketRoutes);
app.use("/api", createGroupAReadRouter());
app.use("/api/v1", createApiV1Router());
const frontendDistPath = path.join(__dirname, "..", "FrontendReact", "dist");
const frontendIndexPath = path.join(frontendDistPath, "index.html");

app.use(express.static(frontendDistPath));

app.get(/^\/(?!api(?:\/|$)|health$).*/, (req, res) => {
  if (fs.existsSync(frontendIndexPath)) {
    res.sendFile(frontendIndexPath);
    return;
  }

  res.status(503).send("Frontend build artifact unavailable. Run FrontendReact build before starting the server.");
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "Market-AI Backend",
    version: "AICC Closed Beta v0.1",
    timestamp: new Date().toISOString()
  });
});

function runStartupSafetyChecks() {
  try {
    fs.mkdirSync(runtimeConfig.dataDir, { recursive: true });
    if (runtimeConfig.enablePersistence || runtimeConfig.enableCognitionArchive) {
      fs.mkdirSync(path.join(runtimeConfig.dataDir, "cognition-memory"), { recursive: true });
    }
    buildNodeRegistry();
    logger.info("startup", "Market AI startup safety checks passed.", {
      port: runtimeConfig.port,
      mode: runtimeConfig.mode,
      persistenceEnabled: runtimeConfig.enablePersistence,
      cognitionArchiveEnabled: runtimeConfig.enableCognitionArchive,
      distributedNodeRegistry: "initialized",
      warnings: runtimeConfig.warnings
    });
  } catch (error) {
    logger.warn("startup", "Startup safety checks completed with warnings.", {
      message: error.message
    });
  }
}

runStartupSafetyChecks();

try {
  loadPersistentMemory();
  logger.info("startup", "[Market AI] Persistent cognition memory loaded.");
} catch {
  logger.warn("startup", "[Market AI] Persistent cognition memory startup recovery failed safely.");
}

const PORT = process.env.PORT || 3001;

function getAlpacaDataUrl() {
  return process.env.ALPACA_DATA_URL || process.env.ALPACA_BASE_URL;
}

function requireFiniteMarketNumber(value, fieldName) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    throw new Error(`RAW_DATA_UNAVAILABLE: missing ${fieldName}`);
  }

  return number;
}

function requireProviderTimestamp(value, fieldName) {
  if (!value) {
    throw new Error(`RAW_DATA_UNAVAILABLE: missing ${fieldName}`);
  }

  const timestamp = new Date(value);

  if (Number.isNaN(timestamp.getTime())) {
    throw new Error(`RAW_DATA_UNAVAILABLE: invalid ${fieldName}`);
  }

  return value;
}

function rawDataUnavailableResponse(message) {
  return {
    available: false,
    sourceType: "PROVIDER_UNAVAILABLE",
    provider: "ALPACA",
    simulated: false,
    generated: false,
    error: "RAW_DATA_UNAVAILABLE",
    details: message
  };
}

function autoStartSimulatedStreamIfEnabled() {
  if (!runtimeConfig.autoSim) {
    return;
  }

  const simulationPolicy = getSimulationPolicy(process.env);

  if (!simulationPolicy.simulationAllowed) {
    logger.warn("stream", "[Market AI] Auto simulated stream blocked by runtime policy.", {
      runtimeEnvironment: simulationPolicy.runtimeEnvironment,
      reason: simulationPolicy.blockReason
    });
    return;
  }

  try {
    // Local-only boot helper. Real provider streams are not connected here.
    const streamStatus = getStreamStatus();

    if (streamStatus.active) {
      return;
    }

    const marketHoursStatus = getMarketHoursStatus();
    const mode = marketHoursStatus.isOpen
      ? SHADOW_MODE
      : CLOSED_MARKET_SIM_MODE;
    const result = startStream({
      source: "simulated",
      symbols: DEFAULT_SIMULATED_WATCHLIST,
      intervalMs: 1000,
      maxEvents: 100000,
      systemContext: {
        mode,
        marketOpen: marketHoursStatus.isOpen,
        marketHoursReason: marketHoursStatus.reason,
        runtimeEnvironment: simulationPolicy.runtimeEnvironment,
        simulated: true,
        sourceType: "SIMULATED"
      }
    });

    if (result.started) {
      logger.info("stream", marketHoursStatus.isOpen
        ? "[Market AI] Auto simulated stream started during market hours."
        : "[Market AI] Auto simulated stream started in closed-market sandbox mode.", {
        source: "simulated",
        mode
      });
    }
  } catch {
    logger.warn("stream", "[Market AI] Auto simulated stream startup failed safely.");
  }
}

/* ---------------------------
   ALPACA HELPERS
----------------------------*/

async function getLiveStock(symbol) {
  const response = await axios.get(
    `${getAlpacaDataUrl()}/v2/stocks/${symbol}/trades/latest`,
    {
      headers: {
        "APCA-API-KEY-ID": process.env.ALPACA_API_KEY,
        "APCA-API-SECRET-KEY": process.env.ALPACA_SECRET_KEY
      }
    }
  );
  const trade = response.data?.trade;

  if (!trade) {
    throw new Error("RAW_DATA_UNAVAILABLE: missing latest trade");
  }

  return {
    symbol,
    price: requireFiniteMarketNumber(trade.p, "latest trade price"),
    timestamp: requireProviderTimestamp(trade.t, "latest trade timestamp"),
    provider: "ALPACA",
    sourceType: "RAW_DELAYED",
    available: true,
    simulated: false,
    generated: false
  };
}

async function getLatestStockBar(symbol) {
  const response = await axios.get(
    `${getAlpacaDataUrl()}/v2/stocks/${symbol}/bars/latest`,
    {
      headers: {
        "APCA-API-KEY-ID": process.env.ALPACA_API_KEY,
        "APCA-API-SECRET-KEY": process.env.ALPACA_SECRET_KEY
      }
    }
  );

  const bar = response.data?.bar;

  if (!bar) {
    throw new Error("RAW_DATA_UNAVAILABLE: missing latest bar");
  }

  return {
    symbol,
    open: requireFiniteMarketNumber(bar.o, "bar open"),
    high: requireFiniteMarketNumber(bar.h, "bar high"),
    low: requireFiniteMarketNumber(bar.l, "bar low"),
    close: requireFiniteMarketNumber(bar.c, "bar close"),
    volume: requireFiniteMarketNumber(bar.v, "bar volume"),
    timestamp: requireProviderTimestamp(bar.t, "bar timestamp"),
    provider: "ALPACA",
    sourceType: "RAW_DELAYED",
    available: true,
    simulated: false,
    generated: false
  };
}

/* ---------------------------
   ANOMALY ENGINE (PURE FUNCTION)
----------------------------*/

async function getAnomaliesData() {
  const baselineData = {
    NVDA: 54000000,
    SOXL: 35000000,
    AMD: 62000000,
    TSM: 15000000,
    META: 18000000,
    AMZN: 32000000,
    PLTR: 75000000
  };

  const symbols = Object.keys(baselineData);

  const bars = await Promise.all(
    symbols.map(getLatestStockBar)
  );

  return bars.map((b) => {
    const avgVolume = baselineData[b.symbol] || 1;

    const volumeRatio = b.volume ? b.volume / avgVolume : 0;

    const changePercent =
      b.open !== 0
        ? ((b.close - b.open) / b.open) * 100
        : 0;

    const moveSize = Math.abs(changePercent);

    let score = 0;
    if (volumeRatio > 0.2) score += 2;
    if (volumeRatio > 0.5) score += 2;
    if (moveSize > 0.1) score += 2;
    if (moveSize > 0.5) score += 2;

    let severity = "LOW";
    if (score >= 6) severity = "HIGH";
    else if (score >= 3) severity = "MEDIUM";

    return {
      symbol: b.symbol,
      price: b.close,
      changePercent: Number(changePercent.toFixed(2)),
      volumeRatio: Number(volumeRatio.toFixed(2)),
      severity,
      score,
      direction: changePercent >= 0 ? "BULLISH" : "BEARISH",
      provider: b.provider,
      sourceType: b.sourceType,
      available: true,
      simulated: false,
      generated: false
    };
  }).filter(x => x.score > 0);
}

/* ---------------------------
   ROUTES
----------------------------*/

app.get("/api/health", (req, res) => {
  res.json({ status: "Markets AI backend running" });
});

app.get("/api/stock/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const data = await getLiveStock(symbol);
    res.json(data);
  } catch (err) {
    res.status(500).json({
      error: "Stock fetch failed",
      ...rawDataUnavailableResponse(err.message)
    });
  }
});

app.get("/api/watchlist", async (req, res) => {
  try {
    const symbols = ["NVDA", "SOXL", "AMD", "TSM", "META", "AMZN", "PLTR"];

    const results = await Promise.all(
      symbols.map(getLiveStock)
    );

    res.json(results);
  } catch (err) {
    res.status(500).json({
      error: "Watchlist failed",
      ...rawDataUnavailableResponse(err.message)
    });
  }
});

app.get("/api/chart/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();

    const end = new Date();
    const start = new Date(Date.now() - 1000 * 60 * 60 * 24 * 5);

    const response = await axios.get(
      `${getAlpacaDataUrl()}/v2/stocks/${symbol}/bars`,
      {
        headers: {
          "APCA-API-KEY-ID": process.env.ALPACA_API_KEY,
          "APCA-API-SECRET-KEY": process.env.ALPACA_SECRET_KEY
        },
        params: {
          timeframe: "1Hour",
          start: start.toISOString(),
          end: end.toISOString(),
          limit: 50,
          adjustment: "raw",
          feed: "iex"
        }
      }
    );

    const rawBars = Array.isArray(response.data?.bars)
      ? response.data.bars
      : [];

    const bars = rawBars.map(bar => ({
      time: bar.t,
      open: bar.o,
      high: bar.h,
      low: bar.l,
      close: bar.c,
      volume: bar.v,
      provider: "ALPACA",
      sourceType: "RAW_DELAYED",
      available: true,
      simulated: false,
      generated: false
    }));

    res.json(bars);
  } catch (err) {
    res.status(500).json({
      error: "Chart fetch failed",
      ...rawDataUnavailableResponse(err.message)
    });
  }
});

app.get("/api/anomalies", async (req, res) => {
  try {
    const data = await getAnomaliesData();
    res.json(data);
  } catch (err) {
    res.status(500).json({
      error: "Anomalies failed",
      ...rawDataUnavailableResponse(err.message)
    });
  }
});

app.get("/api/summary", async (req, res) => {
  try {
    let anomalies = [];

    try {
      anomalies = await getAnomaliesData();
    } catch {
      return res.json({
        title: "Market Intelligence Summary",
        message: "Anomaly engine temporarily unavailable.",
        ...rawDataUnavailableResponse("Anomaly engine raw provider data unavailable.")
      });
    }

    if (!anomalies.length) {
      return res.json({
        title: "Market Intelligence Summary",
        message: "No significant live anomalies detected right now."
      });
    }

    const bullish = anomalies.filter(a => a.direction === "BULLISH");
    const bearish = anomalies.filter(a => a.direction === "BEARISH");

    let sentiment = "NEUTRAL";
    if (bullish.length > bearish.length) sentiment = "BULLISH";
    if (bearish.length > bullish.length) sentiment = "BEARISH";

    const symbols = anomalies.map(a => a.symbol).join(", ");

    res.json({
      title: "Market Intelligence Summary",
      message: `${symbols} are showing ${sentiment.toLowerCase()} anomaly pressure with elevated activity.`
    });

  } catch (err) {
    res.status(500).json({
      error: "Summary failed",
      ...rawDataUnavailableResponse(err.message)
    });
  }
});

/* ---------------------------
   START SERVER
----------------------------*/

app.listen(PORT, () => {
  logger.info("server", "Server running.", {
    port: PORT,
    mode: runtimeConfig.mode,
    apiVersion: "v1"
  });
  autoStartSimulatedStreamIfEnabled();
});
