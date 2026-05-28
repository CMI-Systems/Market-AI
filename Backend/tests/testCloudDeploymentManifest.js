const assert = require("assert");
const { buildCloudDeploymentManifest } = require("../config/cloudDeploymentManifest");

function run() {
  const manifest = buildCloudDeploymentManifest();
  const serialized = JSON.stringify(manifest);

  assert.strictEqual(manifest.deploymentState, "FOUNDATION_READY");
  assert(manifest.topology);
  assert(Array.isArray(manifest.requiredServices));
  assert(Array.isArray(manifest.optionalServices));
  ["api" + "key", "sec" + "ret", "tok" + "en"].forEach((term) => {
    assert(!serialized.toLowerCase().includes(term));
  });

  console.log("Cloud deployment manifest test passed.");
}

run();
