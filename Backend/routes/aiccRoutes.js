const express = require("express");
const { buildAiccAlerts } = require("../services/aiccAlerts");
const { buildAiccReplay } = require("../services/aiccReplay");
const { buildAiccSystemStatus } = require("../services/aiccSystemStatus");
const { rejectSimulationRequest } = require("../config/runtimePolicy");

const router = express.Router();

router.get("/system-status", (req, res) => {
  const rejection = rejectSimulationRequest(req.query.simulate);

  if (rejection) {
    res.status(403).json(rejection);
    return;
  }

  res.json(buildAiccSystemStatus({ simulate: req.query.simulate }));
});

router.get("/alerts", async (req, res) => {
  const alerts = await buildAiccAlerts();

  res.json(alerts);
});

router.get("/replay", async (req, res) => {
  const replay = await buildAiccReplay();

  res.json(replay);
});

module.exports = router;
