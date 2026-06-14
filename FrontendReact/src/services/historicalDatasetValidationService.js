import { getDatasetRepository, getDatasetRepositoryItem } from "./datasetRepositoryService.js";
import { validateAiccDatasetRecord } from "./intelligence/aiccDatasetQualityValidator.js";
import { evaluateShadowTrainingReadiness } from "./intelligence/aiccShadowTrainingEvaluator.js";

const EMPTY_SUMMARY = {
  totalDatasets: 0,
  revalidatedDatasets: 0,
  consistentDatasets: 0,
  inconsistentDatasets: 0,
  consistencyRate: 0,
  highQualityDatasets: 0,
  shadowReadyDatasets: 0,
  historicalValidationStatus: "EMPTY",
};

function safeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeString(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
}

function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null);
}

function normalizeDatasetRecord(dataset) {
  const safeDataset = safeObject(dataset);

  return {
    id: safeString(safeDataset.id),
    operatorId: safeString(safeDataset.operatorId || safeDataset.operator_id),
    operatorEmail: safeString(safeDataset.operatorEmail || safeDataset.operator_email),
    symbol: safeString(safeDataset.symbol, "UNKNOWN").toUpperCase(),
    timestamp: firstDefined(safeDataset.timestamp, safeDataset.created_at, null),
    intelligenceSnapshot: safeObject(
      firstDefined(safeDataset.intelligenceSnapshot, safeDataset.intelligence_snapshot)
    ),
    operatorContext: safeObject(firstDefined(safeDataset.operatorContext, safeDataset.operator_context)),
    marketContext: safeObject(firstDefined(safeDataset.marketContext, safeDataset.market_context)),
    learningTargets: safeObject(firstDefined(safeDataset.learningTargets, safeDataset.learning_targets)),
    metadata: safeObject(safeDataset.metadata),
    warnings: safeArray(safeDataset.warnings),
  };
}

function normalizeValidation(validation) {
  if (!validation) return null;

  return {
    valid: validation.valid === true,
    qualityScore: safeNumber(firstDefined(validation.qualityScore, validation.quality_score)),
    qualityLabel: safeString(firstDefined(validation.qualityLabel, validation.quality_label), "LOW").toUpperCase(),
    acceptedForShadowTraining:
      validation.acceptedForShadowTraining === true || validation.accepted_for_shadow_training === true,
    missingFields: safeArray(firstDefined(validation.missingFields, validation.missing_fields)),
    validationReasons: safeArray(firstDefined(validation.validationReasons, validation.validation_reasons)),
    rejectionReasons: safeArray(firstDefined(validation.rejectionReasons, validation.rejection_reasons)),
    warnings: safeArray(validation.warnings),
  };
}

function normalizeReadiness(readiness) {
  if (!readiness) return null;

  return {
    shadowTrainingReady:
      readiness.shadowTrainingReady === true || readiness.shadow_training_ready === true,
    readinessScore: safeNumber(firstDefined(readiness.readinessScore, readiness.readiness_score)),
    readinessLabel: safeString(firstDefined(readiness.readinessLabel, readiness.readiness_label), "LOW").toUpperCase(),
    priority: safeString(readiness.priority, "LOW").toUpperCase(),
    tacticalReady: readiness.tacticalReady === true || readiness.tactical_ready === true,
    behavioralReady: readiness.behavioralReady === true || readiness.behavioral_ready === true,
    failsafeReady: readiness.failsafeReady === true || readiness.failsafe_ready === true,
    acceptanceReasons: safeArray(firstDefined(readiness.acceptanceReasons, readiness.acceptance_reasons)),
    rejectionReasons: safeArray(firstDefined(readiness.rejectionReasons, readiness.rejection_reasons)),
    warnings: safeArray(readiness.warnings),
  };
}

function validationChanged(storedValidation, recalculatedValidation) {
  if (!storedValidation) return false;

  return (
    storedValidation.valid !== recalculatedValidation.valid ||
    storedValidation.qualityScore !== recalculatedValidation.qualityScore ||
    storedValidation.qualityLabel !== recalculatedValidation.qualityLabel ||
    storedValidation.acceptedForShadowTraining !== recalculatedValidation.acceptedForShadowTraining
  );
}

function readinessChanged(storedReadiness, recalculatedReadiness) {
  if (!storedReadiness) return false;

  return (
    storedReadiness.shadowTrainingReady !== recalculatedReadiness.shadowTrainingReady ||
    storedReadiness.readinessScore !== recalculatedReadiness.readinessScore ||
    storedReadiness.readinessLabel !== recalculatedReadiness.readinessLabel ||
    storedReadiness.priority !== recalculatedReadiness.priority ||
    storedReadiness.tacticalReady !== recalculatedReadiness.tacticalReady ||
    storedReadiness.behavioralReady !== recalculatedReadiness.behavioralReady ||
    storedReadiness.failsafeReady !== recalculatedReadiness.failsafeReady
  );
}

function getConsistencyStatus(dataset, storedValidation, storedReadiness, recalculatedValidation, recalculatedReadiness) {
  if (!dataset?.id) return "INCOMPLETE_DATASET";
  if (!storedValidation) return "MISSING_VALIDATION";
  if (!storedReadiness) return "MISSING_READINESS";
  if (validationChanged(storedValidation, recalculatedValidation)) return "VALIDATION_CHANGED";
  if (readinessChanged(storedReadiness, recalculatedReadiness)) return "READINESS_CHANGED";
  return "CONSISTENT";
}

function buildValidationWarnings(status, storedValidation, storedReadiness, recalculatedValidation, recalculatedReadiness) {
  const warnings = [
    ...safeArray(recalculatedValidation.warnings),
    ...safeArray(recalculatedReadiness.warnings),
  ];

  if (!storedValidation) warnings.push("Stored dataset validation is missing.");
  if (!storedReadiness) warnings.push("Stored shadow readiness result is missing.");
  if (status === "VALIDATION_CHANGED") warnings.push("Stored validation no longer matches recalculated validation.");
  if (status === "READINESS_CHANGED") warnings.push("Stored readiness no longer matches recalculated readiness.");
  if (status === "INCOMPLETE_DATASET") warnings.push("Dataset record is incomplete.");

  return [...new Set(warnings)];
}

function validateRepositoryItem(item) {
  const dataset = normalizeDatasetRecord(item?.dataset);
  const storedValidation = normalizeValidation(item?.validation);
  const storedReadiness = normalizeReadiness(item?.shadowReadiness);
  const recalculatedValidation = validateAiccDatasetRecord(dataset);
  const recalculatedReadiness = evaluateShadowTrainingReadiness(dataset, recalculatedValidation);
  const consistencyStatus = getConsistencyStatus(
    dataset,
    storedValidation,
    storedReadiness,
    recalculatedValidation,
    recalculatedReadiness
  );

  return {
    datasetId: dataset.id || "UNKNOWN_DATASET",
    symbol: dataset.symbol || "UNKNOWN",
    qualityLabel: recalculatedValidation.qualityLabel,
    qualityScore: recalculatedValidation.qualityScore,
    shadowTrainingReady: recalculatedReadiness.shadowTrainingReady,
    consistencyStatus,
    warnings: buildValidationWarnings(
      consistencyStatus,
      storedValidation,
      storedReadiness,
      recalculatedValidation,
      recalculatedReadiness
    ),
  };
}

function getHistoricalValidationStatus(summary) {
  if (summary.totalDatasets === 0) return "EMPTY";
  if (summary.inconsistentDatasets > 0) return "NEEDS_REVIEW";
  if (summary.consistencyRate >= 90 && summary.highQualityDatasets === summary.totalDatasets) return "HIGH_QUALITY";
  if (summary.consistencyRate >= 90) return "STABLE";
  return "NEEDS_REVIEW";
}

function buildSummary(validationResults) {
  const totalDatasets = validationResults.length;
  const consistentDatasets = validationResults.filter((result) => result.consistencyStatus === "CONSISTENT").length;
  const inconsistentDatasets = totalDatasets - consistentDatasets;
  const consistencyRate = totalDatasets ? Math.round((consistentDatasets / totalDatasets) * 100) : 0;
  const summary = {
    totalDatasets,
    revalidatedDatasets: totalDatasets,
    consistentDatasets,
    inconsistentDatasets,
    consistencyRate,
    highQualityDatasets: validationResults.filter((result) => result.qualityLabel === "HIGH").length,
    shadowReadyDatasets: validationResults.filter((result) => result.shadowTrainingReady === true).length,
    historicalValidationStatus: "EMPTY",
  };

  return {
    ...summary,
    historicalValidationStatus: getHistoricalValidationStatus(summary),
  };
}

function buildEmptyResult(warnings = []) {
  return {
    totalDatasets: 0,
    revalidatedDatasets: 0,
    consistentDatasets: 0,
    inconsistentDatasets: 0,
    highQualityDatasets: 0,
    shadowReadyDatasets: 0,
    warnings,
    validationResults: [],
  };
}

export async function validateHistoricalDatasets() {
  try {
    const repository = await getDatasetRepository();

    if (repository.error) {
      return buildEmptyResult(repository.warnings || ["Historical dataset validation is unavailable."]);
    }

    const validationResults = safeArray(repository.items).map(validateRepositoryItem);
    const summary = buildSummary(validationResults);
    const warnings = [
      ...safeArray(repository.warnings),
      ...validationResults.flatMap((result) => result.warnings),
    ];

    return {
      totalDatasets: summary.totalDatasets,
      revalidatedDatasets: summary.revalidatedDatasets,
      consistentDatasets: summary.consistentDatasets,
      inconsistentDatasets: summary.inconsistentDatasets,
      highQualityDatasets: summary.highQualityDatasets,
      shadowReadyDatasets: summary.shadowReadyDatasets,
      warnings: [...new Set(warnings)],
      validationResults,
    };
  } catch (error) {
    return buildEmptyResult([error?.message || "Historical dataset validation failed safely."]);
  }
}

export async function validateHistoricalDatasetById(datasetId) {
  const safeDatasetId = safeString(datasetId);
  if (!safeDatasetId) {
    return {
      validationResult: null,
      warnings: ["Dataset id is required."],
      error: new Error("Dataset id is required."),
    };
  }

  try {
    const repositoryItem = await getDatasetRepositoryItem(safeDatasetId);
    if (repositoryItem.error || !repositoryItem.item) {
      return {
        validationResult: null,
        warnings: repositoryItem.warnings || ["Dataset was not found."],
        error: repositoryItem.error || null,
      };
    }

    const validationResult = validateRepositoryItem(repositoryItem.item);

    return {
      validationResult,
      warnings: validationResult.warnings,
      error: null,
    };
  } catch (error) {
    return {
      validationResult: null,
      warnings: [error?.message || "Historical dataset validation failed safely."],
      error,
    };
  }
}

export async function getHistoricalValidationSummary() {
  const result = await validateHistoricalDatasets();
  if (result.totalDatasets === 0) {
    return {
      ...EMPTY_SUMMARY,
      warnings: result.warnings,
    };
  }

  const summary = buildSummary(result.validationResults);

  return {
    ...summary,
    warnings: result.warnings,
  };
}

export async function getHistoricalValidationWarnings() {
  const result = await validateHistoricalDatasets();

  return {
    warnings: result.warnings,
    validationResults: result.validationResults.filter((item) => item.warnings.length > 0),
  };
}
