/*
 * Centralized runtime configuration for Market AI.
 * This module intentionally exposes only non-secret operational settings.
 */

const path = require("path");
const {
  normalizeRuntimeEnvironment
} = require("./runtimePolicy");

function boolFromEnv(value, fallback = false) {
  if (value === undefined) return fallback;
  return String(value).toLowerCase() === "true";
}

function intFromEnv(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function loadEnvironmentConfig(env = process.env) {
  const nodeEnv = env.NODE_ENV || "development";
  const runtime = normalizeRuntimeEnvironment(env);
  const config = {
    nodeEnv,
    runtimeEnvironment: runtime.runtimeEnvironment,
    port: intFromEnv(env.PORT, 3001),
    autoSim: boolFromEnv(env.MARKET_AI_AUTO_SIM, false),
    mode: env.MARKET_AI_MODE || (nodeEnv === "production" ? "production" : "development"),
    dataDir: env.MARKET_AI_DATA_DIR || path.join(__dirname, "..", "data"),
    logLevel: env.MARKET_AI_LOG_LEVEL || "info",
    enablePersistence: boolFromEnv(env.MARKET_AI_ENABLE_PERSISTENCE, true),
    enableCognitionArchive: boolFromEnv(env.MARKET_AI_ENABLE_COGNITION_ARCHIVE, true),
    warnings: []
  };

  if (!["development", "test", "production", "staging"].includes(config.nodeEnv)) {
    config.warnings.push("NODE_ENV is nonstandard; using safe runtime defaults.");
  }

  if (!runtime.valid) {
    config.warnings.push("Runtime mode is missing or malformed; simulation is blocked.");
  }

  if (!["debug", "info", "warn", "error", "silent"].includes(config.logLevel)) {
    config.warnings.push("MARKET_AI_LOG_LEVEL is invalid; info logging will be used.");
    config.logLevel = "info";
  }

  if (!Number.isFinite(config.port) || config.port <= 0) {
    config.warnings.push("PORT is invalid; using 3001.");
    config.port = 3001;
  }

  return config;
}

module.exports = {
  loadEnvironmentConfig
};
