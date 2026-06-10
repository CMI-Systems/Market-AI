function safeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function safeArray(value) {
  return Array.isArray(value) ? value.filter((item) => item !== null && item !== undefined) : [];
}

function safeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function hasMeaningfulText(value) {
  return safeString(value).length >= 12;
}

function getQuality(readinessScore) {
  if (readinessScore >= 75) return "HIGH";
  if (readinessScore >= 45) return "MODERATE";
  return "LOW";
}

function scoreRecord({ journalContext, replayContext }) {
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

  return Math.min(100, score);
}

function buildWarnings({ journalContext, replayContext, learningSignals }) {
  const warnings = [];

  if (!safeArray(journalContext.behavioralTags).length) {
    warnings.push("Behavioral tags missing.");
  }

  if (!hasMeaningfulText(journalContext.behavioralReflection)) {
    warnings.push("Behavioral reflection missing or too limited.");
  }

  if (!safeArray(replayContext.behavioralScores).length && !safeArray(replayContext.topMistakes).length) {
    warnings.push("Replay intelligence context missing or incomplete.");
  }

  if (!safeArray(replayContext.missionForNextSession).length) {
    warnings.push("Mission for next session missing.");
  }

  if (
    !safeArray(learningSignals.positiveSignals).length &&
    !safeArray(learningSignals.negativeSignals).length &&
    !safeArray(learningSignals.riskSignals).length &&
    !safeArray(learningSignals.executionSignals).length
  ) {
    warnings.push("Learning signals are empty.");
  }

  return warnings;
}

export function analyzeBehavioralDataset(record = {}) {
  const safeRecord = safeObject(record);
  const journalContext = safeObject(safeRecord.journalContext);
  const replayContext = safeObject(safeRecord.replayContext);
  const learningSignals = safeObject(safeRecord.learningSignals);
  const positiveSignals = safeArray(learningSignals.positiveSignals);
  const negativeSignals = safeArray(learningSignals.negativeSignals);
  const riskSignals = safeArray(learningSignals.riskSignals);
  const executionSignals = safeArray(learningSignals.executionSignals);
  const readinessScore = scoreRecord({ journalContext, replayContext });

  return {
    datasetReady: readinessScore >= 75,
    readinessScore,
    quality: getQuality(readinessScore),
    positiveSignals,
    negativeSignals,
    riskSignals,
    executionSignals,
    warnings: buildWarnings({ journalContext, replayContext, learningSignals }),
  };
}
