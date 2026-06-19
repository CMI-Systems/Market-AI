const READINESS_LABELS = {
  LOW: "LOW",
  MODERATE: "MODERATE",
  HIGH: "HIGH",
  READY: "READY",
};

function safeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function safeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function hasObjectContent(value) {
  return Object.keys(safeObject(value)).length > 0;
}

function isKnownTarget(value, unknownValue) {
  const normalized = safeString(value).toUpperCase();
  return Boolean(normalized && normalized !== unknownValue);
}

function hasBlockedProvenance(record, validation) {
  const provenance = validation?.provenance;
  return Boolean(
    provenance?.status === "BLOCKED" ||
    provenance?.status === "DATA_UNAVAILABLE" ||
    record?.metadata?.rawDataCertified === true ||
    record?.metadata?.trainingEligible === true ||
    record?.metadata?.trainingActivated === true
  );
}

function getReadinessLabel(score) {
  if (score >= 90) return READINESS_LABELS.READY;
  if (score >= 70) return READINESS_LABELS.HIGH;
  if (score >= 40) return READINESS_LABELS.MODERATE;
  return READINESS_LABELS.LOW;
}

function getPriority(score) {
  if (score >= 80) return "HIGH";
  if (score >= 40) return "MEDIUM";
  return "LOW";
}

export function evaluateShadowTrainingReadiness(record = {}, validation = {}) {
  const safeRecord = safeObject(record);
  const safeValidation = safeObject(validation);
  const learningTargets = safeObject(safeRecord.learningTargets);
  const operatorContext = safeObject(safeRecord.operatorContext);

  const acceptanceReasons = [];
  const rejectionReasons = [];
  const warnings = [];

  const validationPassed = safeValidation.valid === true;
  const acceptedForShadowTraining = safeValidation.acceptedForShadowTraining === true;
  const hasOperatorIdentity = Boolean(safeString(safeRecord.operatorId));
  const tacticalReady = isKnownTarget(learningTargets.tacticalTarget, "UNKNOWN_TACTICAL");
  const behavioralReady = isKnownTarget(learningTargets.behavioralTarget, "UNKNOWN_BEHAVIORAL");
  const failsafeReady = isKnownTarget(learningTargets.failsafeTarget, "UNKNOWN_FAILSAFE");
  const allTargetsReady = tacticalReady && behavioralReady && failsafeReady;

  // Replay context may be represented by journal, replay, dataset, queue, or pipeline artifacts.
  const replayContextAvailable =
    hasObjectContent(operatorContext.journalEntry) ||
    hasObjectContent(operatorContext.replayIntelligence) ||
    hasObjectContent(operatorContext.datasetStatus) ||
    hasObjectContent(operatorContext.trainingQueueStatus) ||
    hasObjectContent(operatorContext.pipelineStatus);

  const marketContextAvailable = hasObjectContent(safeRecord.marketContext);
  const provenanceBlocked = hasBlockedProvenance(safeRecord, safeValidation);

  let readinessScore = 0;

  if (validationPassed) {
    readinessScore += 40;
    acceptanceReasons.push("Dataset passed validation.");
  } else {
    rejectionReasons.push("Validation failed.");
  }

  if (acceptedForShadowTraining) {
    readinessScore += 20;
    acceptanceReasons.push("Dataset accepted by quality validator.");
  } else {
    rejectionReasons.push("Dataset not accepted.");
  }

  if (hasOperatorIdentity) {
    readinessScore += 10;
    acceptanceReasons.push("Operator identity available.");
  } else {
    warnings.push("Missing operator identity.");
    rejectionReasons.push("Missing operator identity.");
  }

  if (replayContextAvailable) {
    readinessScore += 10;
    acceptanceReasons.push("Replay intelligence available.");
  } else {
    warnings.push("Missing replay context.");
    rejectionReasons.push("Missing replay context.");
  }

  if (marketContextAvailable) {
    readinessScore += 10;
    acceptanceReasons.push("Market context available.");
  } else {
    warnings.push("Missing market context.");
    rejectionReasons.push("Missing market context.");
  }

  if (allTargetsReady) {
    readinessScore += 10;
    acceptanceReasons.push("All learning targets available.");
  } else {
    warnings.push("Missing targets.");
    rejectionReasons.push("Missing one or more learning targets.");
  }

  if (provenanceBlocked) {
    warnings.push("Dataset provenance blocks shadow-training readiness.");
    rejectionReasons.push("Dataset provenance is not eligible for shadow-training readiness.");
    readinessScore = Math.min(readinessScore, 39);
  }

  const shadowTrainingReady =
    validationPassed &&
    acceptedForShadowTraining &&
    readinessScore >= 80 &&
    !provenanceBlocked;

  if (!tacticalReady) warnings.push("Missing tactical target.");
  if (!behavioralReady) warnings.push("Missing behavioral target.");
  if (!failsafeReady) warnings.push("Missing failsafe target.");

  return {
    shadowTrainingReady,
    readinessScore,
    readinessLabel: getReadinessLabel(readinessScore),
    priority: getPriority(readinessScore),
    acceptanceReasons,
    rejectionReasons,
    tacticalReady,
    behavioralReady,
    failsafeReady,
    warnings: [...new Set([...(Array.isArray(safeValidation.warnings) ? safeValidation.warnings : []), ...warnings])],
  };
}
