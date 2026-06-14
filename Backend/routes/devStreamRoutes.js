/*
 * Development-only stream control routes.
 * These endpoints control simulated streams only and do not connect providers.
 */

const express = require("express");
const {
  getStreamStatus,
  startStream,
  stopStream
} = require("../services/streamController");
const {
  getRuntimeMetrics
} = require("../services/runtimeMetrics");
const {
  getSimulationPolicy
} = require("../config/runtimePolicy");

const router = express.Router();

router.post("/stream/start", (req, res) => {
  const body = req.body || {};
  const policy = getSimulationPolicy();

  if (!policy.simulationAllowed) {
    return res.status(403).json({
      status: "NOT_STARTED",
      developmentOnly: true,
      started: false,
      code: "SIMULATION_NOT_ALLOWED",
      reason: policy.blockReason,
      runtimeEnvironment: policy.runtimeEnvironment,
      simulationAllowed: false,
      message: "Simulated stream startup is blocked outside explicitly enabled development/test runtimes."
    });
  }

  const result = startStream({
    source: body.source || "simulated",
    symbol: body.symbol,
    symbols: body.symbols,
    provider: body.provider,
    intervalMs: body.intervalMs,
    maxEvents: body.maxEvents,
    systemContext: {
      ...(body.systemContext || {}),
      runtimeEnvironment: policy.runtimeEnvironment,
      simulated: true,
      sourceType: "SIMULATED"
    }
  });

  if (!result.started) {
    return res.json({
      status: "NOT_STARTED",
      developmentOnly: true,
      ...result
    });
  }

  return res.json({
    status: "STARTED",
    developmentOnly: true,
    started: true,
    source: result.source,
    message: "Simulated stream started for local development."
  });
});

router.post("/stream/stop", (req, res) => {
  const stopped = stopStream();

  res.json({
    status: stopped ? "STOPPED" : "NO_ACTIVE_STREAM",
    developmentOnly: true,
    stopped,
    message: stopped
      ? "Simulated stream stopped."
      : "No active simulated stream was running."
  });
});

router.get("/stream/status", (req, res) => {
  const policy = getSimulationPolicy();

  res.json({
    developmentOnly: true,
    runtimeEnvironment: policy.runtimeEnvironment,
    simulationAllowed: policy.simulationAllowed,
    status: getStreamStatus()
  });
});

router.get("/metrics", (req, res) => {
  res.json({
    developmentOnly: true,
    metrics: getRuntimeMetrics()
  });
});

module.exports = router;
