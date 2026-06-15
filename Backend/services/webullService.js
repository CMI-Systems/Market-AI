function boolFromEnv(value) {
  return String(value || "").toLowerCase() === "true";
}

function normalizeEnvironment(value) {
  const normalized = String(value || "").toLowerCase();

  if (normalized === "paper" || normalized === "live") return normalized;
  return "unknown";
}

function getWebullCapabilities() {
  return {
    equities: true,
    quotes: false,
    historicalCandles: false,
    options: false,
    futures: false,
    news: false
  };
}

function getWebullConfigStatus(env = process.env) {
  const configured = Boolean(env.WEBULL_APP_KEY && env.WEBULL_APP_SECRET);
  const enabled = configured && boolFromEnv(env.WEBULL_ENABLED);
  const environment = normalizeEnvironment(env.WEBULL_ENV);
  let status = "MISSING_CREDENTIALS";

  if (configured && enabled) {
    status = "NOT_IMPLEMENTED";
  } else if (configured && !enabled) {
    status = "PENDING";
  } else if (!configured && boolFromEnv(env.WEBULL_ENABLED)) {
    status = "MISSING_CREDENTIALS";
  } else if (!configured) {
    status = "MISSING_CREDENTIALS";
  } else if (!enabled) {
    status = "DISABLED";
  }

  return {
    configured,
    enabled,
    environment,
    status
  };
}

function getWebullHealth(env = process.env) {
  const config = getWebullConfigStatus(env);
  const warnings = [];

  if (!config.configured) {
    warnings.push("Webull credentials are not configured.");
  }

  if (config.configured && !config.enabled) {
    warnings.push("Webull is configured but disabled for closed beta.");
  }

  return {
    provider: "WEBULL",
    configured: config.configured,
    enabled: config.enabled,
    environment: config.environment,
    status: config.status,
    readyForActivation: config.configured && !config.enabled,
    warnings
  };
}

async function getWebullQuote(symbol, env = process.env) {
  const normalizedSymbol = String(symbol || "SPY").trim().toUpperCase() || "SPY";
  const config = getWebullConfigStatus(env);

  if (!config.configured) {
    return {
      symbol: normalizedSymbol,
      provider: "WEBULL",
      status: "ERROR",
      price: null,
      changePercent: null,
      volume: null,
      timestamp: null,
      sourceType: "DATA_UNAVAILABLE",
      available: false,
      simulated: false,
      generated: false,
      rawAvailable: false,
      message: "Webull credentials are not configured."
    };
  }

  return {
    symbol: normalizedSymbol,
    provider: "WEBULL",
    status: "NOT_IMPLEMENTED",
    price: null,
    changePercent: null,
    volume: null,
    timestamp: null,
    sourceType: "DATA_UNAVAILABLE",
    available: false,
    simulated: false,
    generated: false,
    rawAvailable: false,
    message: "Webull quote adapter pending implementation."
  };
}

module.exports = {
  getWebullCapabilities,
  getWebullConfigStatus,
  getWebullHealth,
  getWebullQuote
};
