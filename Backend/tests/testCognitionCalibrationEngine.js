const assert = require("assert");
const {
  evaluateCognitionCalibration
} = require("../services/cognitionCalibrationEngine");
const {
  buildCognitionCalibrationEndpoint,
  clearLatestCognitionSnapshot,
  setLatestCognitionSnapshot
} = require("../services/cognitionSnapshotStore");

function record(overrides = {}) {
  return {
    confidenceLevel: "MODERATE",
    signalState: "ALIGNED",
    consensusState: "FULL_CONSENSUS",
    ...overrides
  };
}

clearLatestCognitionSnapshot();

const fallback = buildCognitionCalibrationEndpoint();
assert.strictEqual(fallback.calibrationState, "UNKNOWN");
assert.strictEqual(fallback.summary, "Awaiting cognition calibration.");

const underConfident = evaluateCognitionCalibration({
  history: [record({ confidenceLevel: "LOW" }), record({ confidenceLevel: "LOW" }), record({ confidenceLevel: "LOW" }), record({ confidenceLevel: "LOW" }), record({ confidenceLevel: "LOW" })]
});
assert.strictEqual(underConfident.calibrationState, "UNDER_CONFIDENT");

const overConfident = evaluateCognitionCalibration({
  history: [record({ confidenceLevel: "HIGH", signalState: "SUPPRESSED" }), record({ confidenceLevel: "HIGH", signalState: "SUPPRESSED" }), record({ confidenceLevel: "HIGH", signalState: "UNSTABLE" }), record({ confidenceLevel: "HIGH", signalState: "SUPPRESSED" })]
});
assert.strictEqual(overConfident.calibrationState, "OVER_CONFIDENT");

const misaligned = evaluateCognitionCalibration({
  history: [record({ consensusState: "CONFLICTED" }), record({ consensusState: "CONFLICTED" }), record({ consensusState: "FAILSAFE_PRIORITY" }), record()]
});
assert.strictEqual(misaligned.calibrationState, "MISALIGNED");

setLatestCognitionSnapshot({ cognitionCalibration: misaligned });
const endpoint = buildCognitionCalibrationEndpoint();
assert.strictEqual(endpoint.calibrationState, "MISALIGNED");
assert.notStrictEqual(endpoint.summary, "Awaiting cognition calibration.");

console.log("Cognition calibration engine test passed.");
