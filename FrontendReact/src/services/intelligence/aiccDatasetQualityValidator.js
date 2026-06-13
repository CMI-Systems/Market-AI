const QUALITY_LABELS = {
  LOW: "LOW",
  MODERATE: "MODERATE",
  HIGH: "HIGH",
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

function isKnownString(value, unknownValue) {
  const normalized = safeString(value).toUpperCase();
  return Boolean(normalized && normalized !== unknownValue);
}

function getQualityLabel(score) {
  if (score >= 70) return QUALITY_LABELS.HIGH;
  if (score >= 40) return QUALITY_LABELS.MODERATE;
  return QUALITY_LABELS.LOW;
}

function addResult(condition, passedMessage, failedMessage, warnings, warningMessage) {
  if (condition) {
    return {
      score: true,
      validationReason: passedMessage,
      rejectionReason: null,
    };
  }

  if (warningMessage) warnings.push(warningMessage);

  return {
    score: false,
    validationReason: null,
    rejectionReason: failedMessage,
  };
}

export function validateAiccDatasetRecord(record = {}) {
  const safeRecord = safeObject(record);
  const learningTargets = safeObject(safeRecord.learningTargets);
  const operatorContext = safeObject(safeRecord.operatorContext);
  const metadata = safeObject(safeRecord.metadata);
  const warnings = [];
  const validationReasons = [];
  const rejectionReasons = [];
  const missingFields = [];

  const hasOperatorIdentity = Boolean(safeString(safeRecord.operatorId) || safeString(safeRecord.operatorEmail));
  const hasSymbol = isKnownString(safeRecord.symbol, "UNKNOWN");
  const hasTacticalTarget = isKnownString(learningTargets.tacticalTarget, "UNKNOWN_TACTICAL");
  const hasBehavioralTarget = isKnownString(learningTargets.behavioralTarget, "UNKNOWN_BEHAVIORAL");
  const hasFailsafeTarget = isKnownString(learningTargets.failsafeTarget, "UNKNOWN_FAILSAFE");

  // Replay/operator context can come from any captured operator review artifact.
  const hasReplayOperatorContext =
    hasObjectContent(operatorContext.journalEntry) ||
    hasObjectContent(operatorContext.replayIntelligence) ||
    hasObjectContent(operatorContext.datasetStatus) ||
    hasObjectContent(operatorContext.trainingQueueStatus) ||
    hasObjectContent(operatorContext.pipelineStatus);

  const hasMarketContext = hasObjectContent(safeRecord.marketContext);
  const trainingActivated = metadata.trainingActivated === true;

  const checks = [
    {
      field: "operatorIdentity",
      points: 20,
      result: addResult(
        hasOperatorIdentity,
        "Operator identity is present.",
        "Operator identity is missing.",
        warnings,
        "Missing operator identity."
      ),
    },
    {
      field: "symbol",
      points: 10,
      result: addResult(
        hasSymbol,
        "Symbol is present.",
        "Symbol is missing or UNKNOWN.",
        warnings,
        "Missing symbol."
      ),
    },
    {
      field: "learningTargets.tacticalTarget",
      points: 15,
      result: addResult(
        hasTacticalTarget,
        "Tactical learning target is present.",
        "Tactical learning target is missing.",
        warnings,
        "Missing tactical target."
      ),
    },
    {
      field: "learningTargets.behavioralTarget",
      points: 15,
      result: addResult(
        hasBehavioralTarget,
        "Behavioral learning target is present.",
        "Behavioral learning target is missing.",
        warnings,
        "Missing behavioral target."
      ),
    },
    {
      field: "learningTargets.failsafeTarget",
      points: 15,
      result: addResult(
        hasFailsafeTarget,
        "Failsafe learning target is present.",
        "Failsafe learning target is missing.",
        warnings,
        "Missing failsafe target."
      ),
    },
    {
      field: "operatorContext",
      points: 15,
      result: addResult(
        hasReplayOperatorContext,
        "Replay/operator context is present.",
        "Replay/operator context is missing.",
        warnings,
        "Missing replay/operator context."
      ),
    },
    {
      field: "marketContext",
      points: 10,
      result: addResult(
        hasMarketContext,
        "Market context is present.",
        "Market context is missing.",
        warnings,
        "Missing market context."
      ),
    },
  ];

  const qualityScore = checks.reduce((total, check) => {
    if (check.result.validationReason) validationReasons.push(check.result.validationReason);
    if (check.result.rejectionReason) {
      rejectionReasons.push(check.result.rejectionReason);
      missingFields.push(check.field);
    }

    return total + (check.result.score ? check.points : 0);
  }, 0);

  if (trainingActivated) {
    warnings.push("trainingActivated true.");
    rejectionReasons.push("Training activation flag is true.");
  }

  const valid = qualityScore >= 70;
  const acceptedForShadowTraining =
    qualityScore >= 80 &&
    hasOperatorIdentity &&
    hasTacticalTarget &&
    hasBehavioralTarget &&
    hasFailsafeTarget &&
    hasReplayOperatorContext &&
    trainingActivated === false;

  if (valid) {
    validationReasons.push("Dataset record meets the minimum quality threshold.");
  } else {
    rejectionReasons.push("Dataset quality score is below the minimum validation threshold.");
  }

  if (acceptedForShadowTraining) {
    validationReasons.push("Dataset record is clean enough for future shadow-training consideration.");
  } else {
    rejectionReasons.push("Dataset record is not accepted for future shadow-training consideration.");
  }

  return {
    valid,
    qualityScore,
    qualityLabel: getQualityLabel(qualityScore),
    acceptedForShadowTraining,
    missingFields,
    validationReasons,
    rejectionReasons,
    warnings,
  };
}
