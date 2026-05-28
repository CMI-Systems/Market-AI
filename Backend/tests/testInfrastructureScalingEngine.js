const assert = require("assert");
const { buildInfrastructureScaling } = require("../services/infrastructureScalingEngine");

function run() {
  const stable = buildInfrastructureScaling();
  assert.strictEqual(stable.scalingState, "STABLE");
  assert.strictEqual(stable.infrastructurePressure, 0);

  const elevated = buildInfrastructureScaling({ operatorLoad: 50 });
  assert.strictEqual(elevated.scalingState, "ELEVATED");

  const high = buildInfrastructureScaling({ cognitionLoad: 75 });
  assert.strictEqual(high.scalingState, "HIGH_LOAD");

  const critical = buildInfrastructureScaling({ memoryPressure: 95 });
  assert.strictEqual(critical.scalingState, "CRITICAL");
  assert(critical.warnings.length > 0);

  console.log("Infrastructure scaling engine test passed.");
}

run();
