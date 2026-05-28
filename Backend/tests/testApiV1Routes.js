const assert = require("assert");
const http = require("http");
const express = require("express");
const { createApiV1Router } = require("../routes/apiV1Routes");
const cognitionRoutes = require("../routes/cognitionRoutes");

function requestJson(port, path) {
  return new Promise((resolve, reject) => {
    http.get({ port, path }, (res) => {
      let body = "";
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        try {
          resolve({
            statusCode: res.statusCode,
            body: JSON.parse(body)
          });
        } catch (error) {
          reject(error);
        }
      });
    }).on("error", reject);
  });
}

async function run() {
  const app = express();
  app.get("/api/health", (req, res) => {
    res.json({ status: "Markets AI backend running" });
  });
  app.use("/api/v1", createApiV1Router());
  app.use("/api/cognition", cognitionRoutes);
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const health = await requestJson(port, "/api/v1/health");
    assert.strictEqual(health.statusCode, 200);
    assert(health.body.status);

    const status = await requestJson(port, "/api/v1/system/status");
    assert.strictEqual(status.statusCode, 200);
    assert(status.body.runtimeMode);

    const overview = await requestJson(port, "/api/v1/cognition/overview");
    assert.strictEqual(overview.statusCode, 200);
    assert(overview.body.backend);

    const oldHealth = await requestJson(port, "/api/health");
    assert.strictEqual(oldHealth.statusCode, 200);

    const oldOverview = await requestJson(port, "/api/cognition/overview");
    assert.strictEqual(oldOverview.statusCode, 200);

    const userProfile = await requestJson(port, "/api/v1/user/profile");
    assert.strictEqual(userProfile.statusCode, 200);
    assert(userProfile.body.profileState);

    const session = await requestJson(port, "/api/v1/user/session-status");
    assert.strictEqual(session.statusCode, 200);
    assert(session.body.authState);

    const preferences = await requestJson(port, "/api/v1/user/cognition-preferences");
    assert.strictEqual(preferences.statusCode, 200);
    assert(preferences.body.cognitionPreferenceState);

    const tier = await requestJson(port, "/api/v1/platform/subscription-tier");
    assert.strictEqual(tier.statusCode, 200);
    assert(tier.body.activeTier);

    const gates = await requestJson(port, "/api/v1/platform/feature-gates");
    assert.strictEqual(gates.statusCode, 200);
    assert(gates.body.gateState);

    const manifest = await requestJson(port, "/api/v1/platform/plan-manifest");
    assert.strictEqual(manifest.statusCode, 200);
    assert(Array.isArray(manifest.body.availablePlans));

    const distributedCoordinator = await requestJson(port, "/api/v1/distributed/coordinator");
    assert.strictEqual(distributedCoordinator.statusCode, 200);
    assert(distributedCoordinator.body.coordinatorState);

    const distributedNodes = await requestJson(port, "/api/v1/distributed/nodes");
    assert.strictEqual(distributedNodes.statusCode, 200);
    assert(distributedNodes.body.nodeState);

    const websocketStatus = await requestJson(port, "/api/v1/distributed/websocket-status");
    assert.strictEqual(websocketStatus.statusCode, 200);
    assert(websocketStatus.body.websocketState);

    const replaySync = await requestJson(port, "/api/v1/distributed/replay-sync");
    assert.strictEqual(replaySync.statusCode, 200);
    assert(replaySync.body.replaySyncState);

    const scaling = await requestJson(port, "/api/v1/distributed/scaling");
    assert.strictEqual(scaling.statusCode, 200);
    assert(scaling.body.scalingState);

    const cloudManifest = await requestJson(port, "/api/v1/distributed/cloud-manifest");
    assert.strictEqual(cloudManifest.statusCode, 200);
    assert(cloudManifest.body.deploymentState);
  } finally {
    server.close();
  }

  console.log("API v1 routes test passed.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
