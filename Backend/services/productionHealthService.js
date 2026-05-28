const { loadEnvironmentConfig } = require("../config/environment");
const { buildDeploymentManifest } = require("../config/deploymentManifest");
const { getStreamStatus } = require("./streamController");
const { buildPersistentMemory } = require("./persistentCognitionMemory");

const STARTED_AT = Date.now();

function getMemoryUsage() {
  const usage = process.memoryUsage();
  return {
    rssMb: Number((usage.rss / 1024 / 1024).toFixed(2)),
    heapUsedMb: Number((usage.heapUsed / 1024 / 1024).toFixed(2)),
    heapTotalMb: Number((usage.heapTotal / 1024 / 1024).toFixed(2))
  };
}

function buildProductionHealth(options = {}) {
  const config = options.config || loadEnvironmentConfig();
  const warnings = [...config.warnings];
  let streamStatus = { active: false, source: "unknown", mode: config.mode };
  let persistence = {
    enabled: config.enablePersistence,
    memoryState: "UNKNOWN",
    retentionStatus: "UNKNOWN",
    compressionState: "UNKNOWN"
  };

  try {
    streamStatus = getStreamStatus();
  } catch {
    warnings.push("Stream status is unavailable.");
  }

  try {
    const memory = buildPersistentMemory({ load: false });
    persistence = {
      enabled: config.enablePersistence,
      memoryState: memory.memoryState,
      retentionStatus: memory.retentionStatus,
      compressionState: memory.compressionState
    };
  } catch {
    warnings.push("Persistence health is unavailable.");
  }

  const manifest = buildDeploymentManifest();
  const status = warnings.length
    ? "DEGRADED"
    : "HEALTHY";

  return {
    status,
    uptimeMs: Date.now() - STARTED_AT,
    memory: getMemoryUsage(),
    runtimeMode: config.mode,
    persistence,
    routes: {
      apiHealth: true,
      apiV1Health: true,
      apiV1SystemStatus: true,
      apiV1CognitionOverview: true,
      cognitionOverview: true
    },
    deployment: manifest,
    warnings,
    summary: `${status} production health in ${config.mode} mode.`
  };
}

module.exports = {
  buildProductionHealth
};
