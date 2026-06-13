import { validateAiccDatasetRecord } from "./aiccDatasetQualityValidator.js";
import { evaluateShadowTrainingReadiness } from "./aiccShadowTrainingEvaluator.js";

const CERTIFICATION_LABELS = {
  NOT_READY: "NOT_READY",
  DEVELOPING: "DEVELOPING",
  NEAR_READY: "NEAR_READY",
  CERTIFIED: "CERTIFIED",
};

function clampScore(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getCertificationLabel(score) {
  if (score >= 90) return CERTIFICATION_LABELS.CERTIFIED;
  if (score >= 70) return CERTIFICATION_LABELS.NEAR_READY;
  if (score >= 40) return CERTIFICATION_LABELS.DEVELOPING;
  return CERTIFICATION_LABELS.NOT_READY;
}

function percentage(numerator, denominator) {
  if (!denominator) return 0;
  return clampScore((numerator / denominator) * 100);
}

export function certifyShadowTrainingQueue(records = []) {
  const safeRecords = Array.isArray(records) ? records : [];
  const certificationReasons = [];
  const rejectionReasons = [];
  const warnings = [];

  const evaluations = safeRecords.map((record) => {
    const validation = validateAiccDatasetRecord(record);
    const readiness = evaluateShadowTrainingReadiness(record, validation);
    return { validation, readiness };
  });

  const totalRecords = safeRecords.length;
  const validRecords = evaluations.filter((item) => item.validation.valid).length;
  const shadowReadyRecords = evaluations.filter((item) => item.readiness.shadowTrainingReady).length;
  const tacticalReadyCount = evaluations.filter((item) => item.readiness.tacticalReady).length;
  const behavioralReadyCount = evaluations.filter((item) => item.readiness.behavioralReady).length;
  const failsafeReadyCount = evaluations.filter((item) => item.readiness.failsafeReady).length;
  const readinessPercentage = percentage(shadowReadyRecords, validRecords);

  const datasetCountScore = Math.min(totalRecords / 25, 1) * 30;
  const validDatasetRatioScore = totalRecords ? (validRecords / totalRecords) * 25 : 0;
  const shadowReadyRatioScore = validRecords ? (shadowReadyRecords / validRecords) * 25 : 0;
  const brainCoverageScore = totalRecords
    ? ((tacticalReadyCount / totalRecords) +
        (behavioralReadyCount / totalRecords) +
        (failsafeReadyCount / totalRecords)) *
      (20 / 3)
    : 0;

  const certificationScore = clampScore(
    datasetCountScore + validDatasetRatioScore + shadowReadyRatioScore + brainCoverageScore
  );

  const enoughRecords = totalRecords >= 25;
  const enoughValidRecords = validRecords >= 20;
  const enoughShadowReadyRecords = shadowReadyRecords >= 15;
  const strongReadinessPercentage = readinessPercentage >= 75;
  const balancedBrainCoverage =
    totalRecords > 0 &&
    tacticalReadyCount / totalRecords >= 0.75 &&
    behavioralReadyCount / totalRecords >= 0.75 &&
    failsafeReadyCount / totalRecords >= 0.75;

  if (totalRecords === 0) {
    warnings.push("Empty dataset collection.");
  }

  if (enoughRecords) {
    certificationReasons.push("Enough records collected.");
  } else {
    warnings.push("Low dataset count.");
    rejectionReasons.push("Not enough records.");
  }

  if (enoughValidRecords) {
    certificationReasons.push("Strong validation quality.");
  } else {
    rejectionReasons.push("Not enough valid datasets.");
  }

  if (enoughShadowReadyRecords && strongReadinessPercentage) {
    certificationReasons.push("Strong shadow readiness quality.");
  } else {
    warnings.push("Low shadow readiness.");
    rejectionReasons.push("Not enough shadow-ready datasets.");
  }

  if (balancedBrainCoverage) {
    certificationReasons.push("Balanced brain coverage.");
  } else {
    warnings.push("Missing brain coverage.");
    rejectionReasons.push("Weak brain coverage.");
  }

  const certified =
    enoughRecords &&
    enoughValidRecords &&
    enoughShadowReadyRecords &&
    strongReadinessPercentage;

  return {
    certified,
    certificationScore,
    certificationLabel: getCertificationLabel(certificationScore),
    totalRecords,
    validRecords,
    shadowReadyRecords,
    readinessPercentage,
    tacticalReadyCount,
    behavioralReadyCount,
    failsafeReadyCount,
    certificationReasons,
    rejectionReasons,
    warnings: [...new Set(warnings)],
  };
}
