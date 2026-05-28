const AWAITING_CLOUD_DEPLOYMENT_MANIFEST = "Awaiting cloud deployment manifest.";

function buildCloudDeploymentManifest() {
  return {
    deploymentState: "FOUNDATION_READY",
    topology: {
      cognitionServices: ["coordinator", "brain-supervisor", "ecosystem-cognition"],
      replayServices: ["replay-sync", "replay-archive"],
      websocketServices: ["operator-stream", "priority-feed"],
      archiveServices: ["persistent-memory", "environment-archive"],
      persistenceServices: ["local-json-foundation"],
      operatorServices: ["user-profile", "entitlements", "operator-memory"]
    },
    requiredServices: ["backend-api", "cognition-coordinator", "node-registry"],
    optionalServices: ["websocket-streams", "cloud-archive", "distributed-replay"],
    scalingTargets: {
      operators: "future-horizontal",
      cognitionNodes: "future-horizontal",
      replayWorkers: "future-worker-pool"
    },
    warnings: [],
    summary: AWAITING_CLOUD_DEPLOYMENT_MANIFEST.replace("Awaiting", "Cloud-ready")
  };
}

module.exports = {
  AWAITING_CLOUD_DEPLOYMENT_MANIFEST,
  buildCloudDeploymentManifest
};
