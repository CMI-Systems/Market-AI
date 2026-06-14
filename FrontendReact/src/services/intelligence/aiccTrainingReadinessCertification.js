const READINESS_LABELS = {
  NOT_READY: "NOT_READY",
  DEVELOPING: "DEVELOPING",
  NEAR_READY: "NEAR_READY",
  CERTIFIED: "CERTIFIED",
};

function safeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function hasObjectContent(value) {
  return Object.keys(safeObject(value)).length > 0;
}

function clampScore(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getReadinessLabel(score) {
  if (score >= 90) return READINESS_LABELS.CERTIFIED;
  if (score >= 70) return READINESS_LABELS.NEAR_READY;
  if (score >= 40) return READINESS_LABELS.DEVELOPING;
  return READINESS_LABELS.NOT_READY;
}

function scoreInfrastructure({ queueCertification, queueBuilder, datasetValidation, shadowReadiness }) {
  const availableInputs = [
    hasObjectContent(queueCertification),
    hasObjectContent(queueBuilder),
    hasObjectContent(datasetValidation),
    hasObjectContent(shadowReadiness),
  ].filter(Boolean).length;

  return clampScore((availableInputs / 4) * 25);
}

function scoreDatasetQuality(datasetValidation) {
  if (!hasObjectContent(datasetValidation)) return 0;
  return clampScore(((datasetValidation.qualityScore || 0) / 100) * 25);
}

function scoreShadowReadiness(shadowReadiness) {
  if (!hasObjectContent(shadowReadiness)) return 0;
  return clampScore(((shadowReadiness.readinessScore || 0) / 100) * 25);
}

function scoreQueueReadiness(queueCertification, queueBuilder) {
  const certificationScore = queueCertification.certificationScore || 0;
  const builderScore = queueBuilder.queueReady ? 100 : 0;
  return clampScore(((certificationScore + builderScore) / 2 / 100) * 25);
}

export function certifyTrainingReadiness(input = {}) {
  const safeInput = safeObject(input);
  const queueCertification = safeObject(safeInput.queueCertification);
  const queueBuilder = safeObject(safeInput.queueBuilder);
  const datasetValidation = safeObject(safeInput.datasetValidation);
  const shadowReadiness = safeObject(safeInput.shadowReadiness);
  const rawDataCertified = safeInput.rawDataCertified === true;

  const certificationReasons = [];
  const rejectionReasons = [];
  const warnings = [];

  const infrastructureReady =
    hasObjectContent(queueCertification) &&
    hasObjectContent(queueBuilder) &&
    hasObjectContent(datasetValidation) &&
    hasObjectContent(shadowReadiness);
  const datasetReady = datasetValidation.valid === true;
  const validationReady = datasetValidation.valid === true && datasetValidation.acceptedForShadowTraining === true;
  const queueReady = queueCertification.certified === true && queueBuilder.queueReady === true;
  const shadowReady = shadowReadiness.shadowTrainingReady === true;

  if (!hasObjectContent(queueCertification)) warnings.push("Missing queue certification.");
  if (!hasObjectContent(queueBuilder)) warnings.push("Missing queue builder.");
  if (!hasObjectContent(datasetValidation)) warnings.push("Missing validation.");
  if (!hasObjectContent(shadowReadiness)) warnings.push("Missing shadow readiness.");
  if (!rawDataCertified) warnings.push("RAW_DATA_CERTIFICATION_REQUIRED");

  if (infrastructureReady) {
    certificationReasons.push("Dataset capture available.");
    certificationReasons.push("Dataset validation available.");
    certificationReasons.push("Shadow readiness available.");
  } else {
    rejectionReasons.push("Insufficient infrastructure.");
  }

  if (datasetReady) {
    certificationReasons.push("Dataset validation passed.");
  } else {
    rejectionReasons.push("Dataset invalid.");
  }

  if (shadowReady) {
    certificationReasons.push("Shadow readiness passed.");
  } else {
    rejectionReasons.push("Shadow readiness failed.");
  }

  if (queueCertification.certified === true) {
    certificationReasons.push("Queue certification passed.");
  } else {
    rejectionReasons.push("Queue not certified.");
  }

  if (queueBuilder.queueReady === true) {
    certificationReasons.push("Queue structure available.");
  } else {
    rejectionReasons.push("Queue not ready.");
  }

  const readinessScore = clampScore(
    scoreInfrastructure({ queueCertification, queueBuilder, datasetValidation, shadowReadiness }) +
      scoreDatasetQuality(datasetValidation) +
      scoreShadowReadiness(shadowReadiness) +
      scoreQueueReadiness(queueCertification, queueBuilder)
  );

  if (readinessScore < 90) {
    warnings.push("Low readiness score.");
  }

  const trainingReady =
    rawDataCertified &&
    queueCertification.certified === true &&
    queueBuilder.queueReady === true &&
    datasetValidation.valid === true &&
    shadowReadiness.shadowTrainingReady === true &&
    readinessScore >= 90;

  return {
    trainingReady,
    readinessScore,
    readinessLabel: getReadinessLabel(readinessScore),
    infrastructureReady,
    datasetReady,
    validationReady,
    queueReady,
    rawDataCertified,
    certificationReasons,
    rejectionReasons: rawDataCertified
      ? rejectionReasons
      : [...rejectionReasons, "Raw data certification is required before training readiness."],
    warnings: [...new Set(warnings)],
  };
}
