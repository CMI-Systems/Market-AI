function safeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function safeArray(value) {
  return Array.isArray(value) ? value.filter((item) => item !== null && item !== undefined) : [];
}

function safeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function clampScore(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return 0;

  return Math.max(0, Math.min(100, number));
}

function scoreSignalCount(count) {
  if (count >= 3) return 100;
  if (count === 2) return 75;
  if (count === 1) return 50;
  return 0;
}

function getQueuePriority(queueScore) {
  if (queueScore >= 70) return "HIGH";
  if (queueScore >= 40) return "MEDIUM";
  return "LOW";
}

function hasMeaningfulText(value) {
  return safeString(value).length >= 12;
}

function deriveReadiness(record) {
  const journalContext = safeObject(record.journalContext);
  const replayContext = safeObject(record.replayContext);
  let score = 0;

  if (safeArray(journalContext.behavioralTags).length) score += 25;
  if (hasMeaningfulText(journalContext.behavioralReflection)) score += 25;
  if (
    safeString(replayContext.strongestTrait) ||
    safeString(replayContext.weakestTrait) ||
    safeArray(replayContext.behavioralScores).length ||
    safeArray(replayContext.topMistakes).length
  ) {
    score += 30;
  }
  if (safeArray(replayContext.missionForNextSession).length) score += 20;

  return clampScore(score);
}

function getReadinessScore(record) {
  const monitorContext = safeObject(record.monitorContext || record.datasetMonitor || record.readiness);

  if (Number.isFinite(Number(record.readinessScore))) {
    return clampScore(record.readinessScore);
  }

  if (Number.isFinite(Number(monitorContext.readinessScore))) {
    return clampScore(monitorContext.readinessScore);
  }

  return deriveReadiness(record);
}

function buildWarnings({ record, journalContext, replayContext, learningSignals }) {
  const warnings = [];

  if (!Object.keys(record).length) {
    warnings.push("Behavioral dataset record missing; safe defaults applied.");
  }

  if (!Object.keys(journalContext).length) {
    warnings.push("Journal context missing.");
  }

  if (!Object.keys(replayContext).length) {
    warnings.push("Replay context missing.");
  }

  if (!Object.keys(learningSignals).length) {
    warnings.push("Learning signals missing.");
  }

  if (!hasMeaningfulText(journalContext.behavioralReflection)) {
    warnings.push("Behavioral reflection missing or too limited.");
  }

  if (!safeArray(replayContext.missionForNextSession).length) {
    warnings.push("Mission for next session missing.");
  }

  return warnings;
}

function buildReasons({ readinessScore, positiveSignals, negativeSignals, riskSignals, executionSignals, journalContext, replayContext }) {
  const acceptanceReasons = [];
  const rejectionReasons = [];
  const learningSignalCount =
    positiveSignals.length + negativeSignals.length + riskSignals.length + executionSignals.length;

  if (safeArray(journalContext.behavioralTags).length) {
    acceptanceReasons.push("Strong behavioral context");
  } else {
    rejectionReasons.push("Insufficient behavioral context");
  }

  if (hasMeaningfulText(journalContext.behavioralReflection)) {
    acceptanceReasons.push("Behavioral reflection present");
  } else {
    rejectionReasons.push("Missing reflection");
  }

  if (safeArray(replayContext.missionForNextSession).length) {
    acceptanceReasons.push("Mission generated");
  }

  if (learningSignalCount >= 2) {
    acceptanceReasons.push("Multiple learning signals detected");
  } else {
    rejectionReasons.push("Missing learning signals");
  }

  if (readinessScore >= 75) {
    acceptanceReasons.push("High dataset readiness");
  } else if (readinessScore < 40) {
    rejectionReasons.push("Dataset readiness too low");
  }

  return {
    acceptanceReasons,
    rejectionReasons,
  };
}

export function evaluateBehavioralTrainingCandidate(record = {}) {
  const safeRecord = safeObject(record);
  const journalContext = safeObject(safeRecord.journalContext);
  const replayContext = safeObject(safeRecord.replayContext);
  const learningSignals = safeObject(safeRecord.learningSignals);
  const positiveSignals = safeArray(learningSignals.positiveSignals);
  const negativeSignals = safeArray(learningSignals.negativeSignals);
  const riskSignals = safeArray(learningSignals.riskSignals);
  const executionSignals = safeArray(learningSignals.executionSignals);
  const readinessScore = getReadinessScore(safeRecord);
  const queueScore = Math.round(
    readinessScore * 0.4 +
      scoreSignalCount(positiveSignals.length) * 0.15 +
      scoreSignalCount(negativeSignals.length) * 0.15 +
      scoreSignalCount(riskSignals.length) * 0.15 +
      scoreSignalCount(executionSignals.length) * 0.15
  );
  const queuePriority = getQueuePriority(queueScore);
  const reasons = buildReasons({
    readinessScore,
    positiveSignals,
    negativeSignals,
    riskSignals,
    executionSignals,
    journalContext,
    replayContext,
  });

  return {
    queueEligible: queuePriority !== "LOW",
    queueScore,
    queuePriority,
    acceptanceReasons: reasons.acceptanceReasons,
    rejectionReasons: reasons.rejectionReasons,
    quality: safeString(safeRecord.quality || safeObject(safeRecord.monitorContext).quality) || "UNKNOWN",
    warnings: buildWarnings({ record: safeRecord, journalContext, replayContext, learningSignals }),
  };
}
