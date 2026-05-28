const express = require("express");
const {
  buildAdaptiveThresholdsEndpoint,
  buildAdaptiveSignalsEndpoint,
  buildAnomaliesEndpoint,
  buildBehavioralState,
  buildBrainStatus,
  buildBrainConsensusEndpoint,
  buildConfidence,
  buildCognitionCalibrationEndpoint,
  buildCopilotEndpoint,
  buildContextAgingEndpoint,
  buildCognitiveDriftEndpoint,
  buildDriftEvolutionEndpoint,
  buildEcosystemEndpoint,
  buildEcosystemPriorityEndpoint,
  buildEnvironmentMapEndpoint,
  buildEnvironmentForecastEndpoint,
  buildEnvironmentCausalityEndpoint,
  buildEnvironmentArchiveEndpoint,
  buildExplainabilityEndpoint,
  buildEscalationEndpoint,
  buildInstitutionalFlowEndpoint,
  buildLiquidityPressureEndpoint,
  buildLearningGuardrailsEndpoint,
  buildMarketStructureEndpoint,
  buildOverview,
  buildPersistentMemoryEndpoint,
  buildPriorityFeedEndpoint,
  buildReasoningChainsEndpoint,
  buildRecurrenceEndpoint,
  buildRecurrenceIntelligenceEndpoint,
  buildReinforcementWeightingEndpoint,
  buildRegimeTransitionEndpoint,
  buildReplaySummaryEndpoint,
  buildReplayTimelineEndpoint,
  buildReplayArchiveEndpoint,
  buildSectorHeatmapEndpoint,
  buildStrategicEnvironment,
  buildTemporalMemoryEndpoint,
  buildTemporalSequencesEndpoint,
  buildInteractiveRegionsEndpoint,
  buildWatchlistEndpoint
} = require("../services/cognitionSnapshotStore");

const router = express.Router();

router.get("/overview", (req, res) => {
  res.json(buildOverview());
});

router.get("/brain-status", (req, res) => {
  res.json(buildBrainStatus());
});

router.get("/strategic-environment", (req, res) => {
  res.json(buildStrategicEnvironment());
});

router.get("/confidence", (req, res) => {
  res.json(buildConfidence());
});

router.get("/behavioral-state", (req, res) => {
  res.json(buildBehavioralState());
});

router.get("/replay-summary", (req, res) => {
  res.json(buildReplaySummaryEndpoint());
});

router.get("/escalation", (req, res) => {
  res.json(buildEscalationEndpoint());
});

router.get("/anomalies", (req, res) => {
  res.json(buildAnomaliesEndpoint());
});

router.get("/watchlist", (req, res) => {
  res.json(buildWatchlistEndpoint());
});

router.get("/ecosystem", (req, res) => {
  res.json(buildEcosystemEndpoint());
});

router.get("/environment-map", (req, res) => {
  res.json(buildEnvironmentMapEndpoint());
});

router.get("/ecosystem-priority", (req, res) => {
  res.json(buildEcosystemPriorityEndpoint());
});

router.get("/sector-heatmap", (req, res) => {
  res.json(buildSectorHeatmapEndpoint());
});

router.get("/cognitive-drift", (req, res) => {
  res.json(buildCognitiveDriftEndpoint());
});

router.get("/environment-forecast", (req, res) => {
  res.json(buildEnvironmentForecastEndpoint());
});

router.get("/market-structure", (req, res) => {
  res.json(buildMarketStructureEndpoint());
});

router.get("/regime-transition", (req, res) => {
  res.json(buildRegimeTransitionEndpoint());
});

router.get("/institutional-flow", (req, res) => {
  res.json(buildInstitutionalFlowEndpoint());
});

router.get("/liquidity-pressure", (req, res) => {
  res.json(buildLiquidityPressureEndpoint());
});

router.get("/adaptive-signals", (req, res) => {
  res.json(buildAdaptiveSignalsEndpoint());
});

router.get("/brain-consensus", (req, res) => {
  res.json(buildBrainConsensusEndpoint());
});

router.get("/temporal-memory", (req, res) => {
  res.json(buildTemporalMemoryEndpoint());
});

router.get("/recurrence", (req, res) => {
  res.json(buildRecurrenceEndpoint());
});

router.get("/context-aging", (req, res) => {
  res.json(buildContextAgingEndpoint());
});

router.get("/temporal-sequences", (req, res) => {
  res.json(buildTemporalSequencesEndpoint());
});

router.get("/environment-causality", (req, res) => {
  res.json(buildEnvironmentCausalityEndpoint());
});

router.get("/adaptive-thresholds", (req, res) => {
  res.json(buildAdaptiveThresholdsEndpoint());
});

router.get("/reinforcement-weighting", (req, res) => {
  res.json(buildReinforcementWeightingEndpoint());
});

router.get("/cognition-calibration", (req, res) => {
  res.json(buildCognitionCalibrationEndpoint());
});

router.get("/learning-guardrails", (req, res) => {
  res.json(buildLearningGuardrailsEndpoint());
});

router.get("/copilot", (req, res) => {
  res.json(buildCopilotEndpoint());
});

router.get("/explainability", (req, res) => {
  res.json(buildExplainabilityEndpoint());
});

router.get("/priority-feed", (req, res) => {
  res.json(buildPriorityFeedEndpoint());
});

router.get("/reasoning-chains", (req, res) => {
  res.json(buildReasoningChainsEndpoint());
});

router.get("/replay-timeline", (req, res) => {
  res.json(buildReplayTimelineEndpoint());
});

router.get("/interactive-regions", (req, res) => {
  res.json(buildInteractiveRegionsEndpoint());
});

router.get("/persistent-memory", (req, res) => {
  res.json(buildPersistentMemoryEndpoint());
});

router.get("/environment-archive", (req, res) => {
  res.json(buildEnvironmentArchiveEndpoint());
});

router.get("/recurrence-intelligence", (req, res) => {
  res.json(buildRecurrenceIntelligenceEndpoint());
});

router.get("/drift-evolution", (req, res) => {
  res.json(buildDriftEvolutionEndpoint());
});

router.get("/replay-archive", (req, res) => {
  res.json(buildReplayArchiveEndpoint());
});

module.exports = router;
