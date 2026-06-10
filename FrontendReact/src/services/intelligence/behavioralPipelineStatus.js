const STAGE_META = {
  JOURNAL_CAPTURED: {
    completionPercent: 20,
    nextRequiredAction: "Complete replay review",
  },
  REPLAY_REVIEWED: {
    completionPercent: 40,
    nextRequiredAction: "Generate behavioral dataset",
  },
  DATASET_READY: {
    completionPercent: 70,
    nextRequiredAction: "Increase learning signal quality",
  },
  QUEUE_ELIGIBLE: {
    completionPercent: 90,
    nextRequiredAction: "Await future training pipeline",
  },
  PIPELINE_COMPLETE: {
    completionPercent: 100,
    nextRequiredAction: "Pipeline complete",
  },
};

function safeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function safeArray(value) {
  return Array.isArray(value) ? value.filter((item) => item !== null && item !== undefined) : [];
}

function hasObjectData(value) {
  return Object.keys(safeObject(value)).length > 0;
}

function getContext(input) {
  const safeInput = safeObject(input);

  return {
    record: safeObject(safeInput.record || safeInput.datasetRecord || safeInput),
    datasetStatus: safeObject(safeInput.datasetStatus || safeInput.datasetMonitor),
    queueEvaluation: safeObject(safeInput.queueEvaluation || safeInput.trainingQueue),
  };
}

function detectJournalData(record) {
  const journalContext = safeObject(record.journalContext);
  return hasObjectData(journalContext) || Boolean(record.symbol);
}

function detectReplayReview(record) {
  const replayContext = safeObject(record.replayContext);

  return (
    hasObjectData(replayContext) &&
    (
      Boolean(replayContext.strongestTrait) ||
      Boolean(replayContext.weakestTrait) ||
      safeArray(replayContext.behavioralScores).length > 0 ||
      safeArray(replayContext.topMistakes).length > 0 ||
      safeArray(replayContext.missionForNextSession).length > 0
    )
  );
}

function detectDatasetReady(record, datasetStatus) {
  if (typeof datasetStatus.datasetReady === "boolean") return datasetStatus.datasetReady;
  if (typeof record.datasetReady === "boolean") return record.datasetReady;

  return false;
}

function detectQueueEligible(record, queueEvaluation) {
  if (typeof queueEvaluation.queueEligible === "boolean") return queueEvaluation.queueEligible;
  if (typeof record.queueEligible === "boolean") return record.queueEligible;

  return false;
}

function collectWarnings({ record, datasetStatus, queueEvaluation, journalData, replayReviewed, datasetReady, queueEligible }) {
  const warnings = [];

  if (!hasObjectData(record)) {
    warnings.push("Behavioral pipeline input missing; safe defaults applied.");
  }

  if (!journalData) {
    warnings.push("Journal data missing.");
  }

  if (!replayReviewed) {
    warnings.push("Replay review context missing.");
  }

  if (!hasObjectData(datasetStatus) && typeof record.datasetReady !== "boolean") {
    warnings.push("Dataset readiness context missing.");
  }

  if (!hasObjectData(queueEvaluation) && typeof record.queueEligible !== "boolean") {
    warnings.push("Queue evaluation context missing.");
  }

  if (datasetReady && !queueEligible) {
    warnings.push("Dataset ready but queue eligibility not met.");
  }

  return warnings;
}

function determineStage({ journalData, replayReviewed, datasetReady, queueEligible, blockingWarnings }) {
  if (datasetReady && queueEligible && !blockingWarnings.length) return "PIPELINE_COMPLETE";
  if (queueEligible) return "QUEUE_ELIGIBLE";
  if (datasetReady) return "DATASET_READY";
  if (replayReviewed) return "REPLAY_REVIEWED";
  if (journalData) return "JOURNAL_CAPTURED";

  return "JOURNAL_CAPTURED";
}

export function analyzeBehavioralPipeline(input = {}) {
  const { record, datasetStatus, queueEvaluation } = getContext(input);
  const journalData = detectJournalData(record);
  const replayReviewed = detectReplayReview(record);
  const datasetReady = detectDatasetReady(record, datasetStatus);
  const queueEligible = detectQueueEligible(record, queueEvaluation);
  const warnings = collectWarnings({
    record,
    datasetStatus,
    queueEvaluation,
    journalData,
    replayReviewed,
    datasetReady,
    queueEligible,
  });
  const blockingWarnings = warnings.filter((warning) =>
    /missing|not met|safe defaults/i.test(warning)
  );
  const pipelineStage = determineStage({
    journalData,
    replayReviewed,
    datasetReady,
    queueEligible,
    blockingWarnings,
  });
  const stageMeta = STAGE_META[pipelineStage] || STAGE_META.JOURNAL_CAPTURED;

  return {
    pipelineStage,
    completionPercent: hasObjectData(record) ? stageMeta.completionPercent : 0,
    nextRequiredAction: stageMeta.nextRequiredAction,
    datasetReady,
    queueEligible,
    warnings,
  };
}
