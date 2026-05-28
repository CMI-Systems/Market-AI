const express = require("express");
const { buildDeploymentManifest } = require("../config/deploymentManifest");
const { buildProductionHealth } = require("../services/productionHealthService");
const { buildOverview } = require("../services/cognitionSnapshotStore");
const { getUserProfile } = require("../services/userProfileService");
const { getSessionStatus } = require("../services/authenticationFoundation");
const { buildWatchlistProfile } = require("../services/watchlistProfileEngine");
const { buildPersonalizedCognition } = require("../services/personalizedCognitionEngine");
const { buildOperatorMemory } = require("../services/operatorMemoryLayer");
const { buildSubscriptionTier } = require("../services/subscriptionTierEngine");
const { buildEntitlements } = require("../services/entitlementEngine");
const { buildUsageTracking } = require("../services/usageTrackingEngine");
const { buildFeatureGates } = require("../services/featureGateEngine");
const { buildPlatformPlanManifest } = require("../services/platformPlanManifest");
const { buildNodeRegistry } = require("../services/cognitionNodeRegistry");
const { buildDistributedCoordinator } = require("../services/distributedCognitionCoordinator");
const { buildWebsocketInfrastructure } = require("../services/websocketInfrastructure");
const { buildDistributedReplaySync } = require("../services/distributedReplaySyncEngine");
const { buildInfrastructureScaling } = require("../services/infrastructureScalingEngine");
const { buildCloudDeploymentManifest } = require("../config/cloudDeploymentManifest");

function sessionIdFromRequest(req) {
  return req.headers["x-market-ai-session"] || req.query.sessionId || null;
}

function createApiV1Router() {
  const router = express.Router();

  router.get("/health", (req, res) => {
    const health = buildProductionHealth();
    res.json({
      status: health.status,
      uptimeMs: health.uptimeMs,
      runtimeMode: health.runtimeMode,
      summary: health.summary
    });
  });

  router.get("/system/status", (req, res) => {
    res.json(buildProductionHealth());
  });

  router.get("/cognition/overview", (req, res) => {
    res.json(buildOverview());
  });

  router.get("/deployment/manifest", (req, res) => {
    res.json(buildDeploymentManifest());
  });

  router.get("/user/profile", (req, res) => {
    res.json(getUserProfile());
  });

  router.get("/user/watchlist-profile", (req, res) => {
    res.json(buildWatchlistProfile());
  });

  router.get("/user/cognition-preferences", (req, res) => {
    res.json(buildPersonalizedCognition());
  });

  router.get("/user/operator-memory", (req, res) => {
    res.json(buildOperatorMemory());
  });

  router.get("/user/session-status", (req, res) => {
    res.json(getSessionStatus(sessionIdFromRequest(req)));
  });

  router.get("/platform/subscription-tier", (req, res) => {
    res.json(buildSubscriptionTier());
  });

  router.get("/platform/entitlements", (req, res) => {
    const subscriptionTier = buildSubscriptionTier();
    res.json(buildEntitlements({ subscriptionTier }));
  });

  router.get("/platform/usage", (req, res) => {
    res.json(buildUsageTracking());
  });

  router.get("/platform/feature-gates", (req, res) => {
    const subscriptionTier = buildSubscriptionTier();
    res.json(buildFeatureGates({ subscriptionTier }));
  });

  router.get("/platform/plan-manifest", (req, res) => {
    res.json(buildPlatformPlanManifest());
  });

  router.get("/distributed/coordinator", (req, res) => {
    const registry = buildNodeRegistry();
    res.json(buildDistributedCoordinator({ registry }));
  });

  router.get("/distributed/nodes", (req, res) => {
    res.json(buildNodeRegistry());
  });

  router.get("/distributed/websocket-status", (req, res) => {
    res.json(buildWebsocketInfrastructure());
  });

  router.get("/distributed/replay-sync", (req, res) => {
    const registry = buildNodeRegistry();
    res.json(buildDistributedReplaySync({ nodes: registry.nodes }));
  });

  router.get("/distributed/scaling", (req, res) => {
    res.json(buildInfrastructureScaling());
  });

  router.get("/distributed/cloud-manifest", (req, res) => {
    res.json(buildCloudDeploymentManifest());
  });

  return router;
}

module.exports = {
  createApiV1Router
};
