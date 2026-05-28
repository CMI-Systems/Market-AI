/*
 * Cognition calibration engine for Market AI.
 * Evaluates confidence, consensus, and suppression calibration as advisory metadata.
 */

const AWAITING_COGNITION_CALIBRATION = "Awaiting cognition calibration.";

function evaluateCognitionCalibration(input = {}) {
  const history = Array.isArray(input.history) ? input.history : [];

  if (history.length < 4) {
    return {
      calibrationState: "UNKNOWN",
      confidenceCalibration: "UNKNOWN",
      suppressionCalibration: "UNKNOWN",
      consensusCalibration: "UNKNOWN",
      warnings: [],
      summary: AWAITING_COGNITION_CALIBRATION
    };
  }

  const recent = history.slice(-16);
  const lowConfidence = recent.filter((item) => item.confidenceLevel === "LOW").length;
  const suppressed = recent.filter((item) => ["SUPPRESSED", "UNSTABLE"].includes(item.signalState)).length;
  const consensus = recent.filter((item) => item.consensusState === "FULL_CONSENSUS").length;
  const conflicted = recent.filter((item) => ["CONFLICTED", "FAILSAFE_PRIORITY"].includes(item.consensusState)).length;
  let calibrationState = "CALIBRATED";
  let confidenceCalibration = "CALIBRATED";
  let suppressionCalibration = "CALIBRATED";
  let consensusCalibration = "CALIBRATED";
  const warnings = [];

  if (lowConfidence >= 5 && suppressed <= 1) {
    calibrationState = "UNDER_CONFIDENT";
    confidenceCalibration = "UNDER_CONFIDENT";
  } else if (lowConfidence <= 1 && suppressed >= 4) {
    calibrationState = "OVER_CONFIDENT";
    confidenceCalibration = "OVER_CONFIDENT";
    warnings.push("Suppression recurrence is high relative to confidence history.");
  } else if (conflicted >= 3) {
    calibrationState = "MISALIGNED";
    consensusCalibration = "MISALIGNED";
    warnings.push("Consensus history is conflicted.");
  } else if (suppressed >= 3 || lowConfidence >= 3) {
    calibrationState = "ADJUSTING";
  }

  if (suppressed >= 3) {
    suppressionCalibration = "ADJUSTING";
  }

  if (consensus >= 5 && conflicted === 0) {
    consensusCalibration = "CALIBRATED";
  }

  return {
    calibrationState,
    confidenceCalibration,
    suppressionCalibration,
    consensusCalibration,
    warnings,
    summary: `${calibrationState} advisory cognition calibration from recent history.`
  };
}

module.exports = {
  AWAITING_COGNITION_CALIBRATION,
  evaluateCognitionCalibration
};
