const express = require("express");
const { buildAiccAlerts } = require("../services/aiccAlerts");
const { buildAiccReplay } = require("../services/aiccReplay");
const { buildAiccSystemStatus } = require("../services/aiccSystemStatus");

const router = express.Router();

router.get("/system-status", (req, res) => {
  res.json(buildAiccSystemStatus());
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
