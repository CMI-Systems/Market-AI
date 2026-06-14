import { getDatasetRecordById, getDatasetRecords } from "./datasetPersistenceService.js";
import { getDatasetValidations } from "./datasetValidationPersistenceService.js";
import { getShadowReadinessRecords } from "./shadowReadinessPersistenceService.js";

const EMPTY_SUMMARY = {
  totalDatasets: 0,
  validDatasets: 0,
  shadowReadyDatasets: 0,
  highQualityDatasets: 0,
  moderateQualityDatasets: 0,
  lowQualityDatasets: 0,
  symbols: [],
  latestUpdatedAt: null,
};

function safeString(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
}

function normalizeLabel(value) {
  return safeString(value, "LOW").toUpperCase();
}

function normalizeSymbol(value) {
  return safeString(value, "UNKNOWN").toUpperCase();
}

function getDatasetIdFromValidation(validation) {
  return safeString(validation?.dataset_id || validation?.datasetId || validation?.recordId);
}

function getDatasetIdFromReadiness(readiness) {
  return safeString(readiness?.dataset_id || readiness?.datasetId || readiness?.recordId);
}

function getLatestTimestamp(items) {
  const timestamps = items
    .flatMap((item) => [item?.updated_at, item?.created_at])
    .filter(Boolean)
    .sort();

  return timestamps.length ? timestamps[timestamps.length - 1] : null;
}

function getRepositoryStatus(dataset, validation, shadowReadiness) {
  if (!dataset?.id) return "INCOMPLETE";
  if (shadowReadiness?.shadow_training_ready === true || shadowReadiness?.shadowTrainingReady === true) {
    return "SHADOW_READY";
  }
  if (normalizeLabel(validation?.quality_label || validation?.qualityLabel) === "LOW") {
    return validation ? "LOW_QUALITY" : "READY_FOR_REVIEW";
  }
  if (validation?.valid === true) return "VALIDATED";
  return validation ? "INCOMPLETE" : "READY_FOR_REVIEW";
}

function buildRepositoryItems(datasets, validations, readinessRecords) {
  return datasets.map((dataset) => {
    const validation = validations.find((item) => getDatasetIdFromValidation(item) === dataset.id) || null;
    const shadowReadiness =
      readinessRecords.find((item) => getDatasetIdFromReadiness(item) === dataset.id) || null;

    return {
      dataset,
      validation,
      shadowReadiness,
      repositoryStatus: getRepositoryStatus(dataset, validation, shadowReadiness),
    };
  });
}

function buildSummary(items) {
  const symbols = [
    ...new Set(
      items
        .map((item) => normalizeSymbol(item.dataset?.symbol))
        .filter((symbol) => symbol && symbol !== "UNKNOWN")
    ),
  ].sort();

  return {
    totalDatasets: items.length,
    validDatasets: items.filter((item) => item.validation?.valid === true).length,
    shadowReadyDatasets: items.filter(
      (item) =>
        item.shadowReadiness?.shadow_training_ready === true ||
        item.shadowReadiness?.shadowTrainingReady === true
    ).length,
    highQualityDatasets: items.filter(
      (item) => normalizeLabel(item.validation?.quality_label || item.validation?.qualityLabel) === "HIGH"
    ).length,
    moderateQualityDatasets: items.filter(
      (item) => normalizeLabel(item.validation?.quality_label || item.validation?.qualityLabel) === "MODERATE"
    ).length,
    lowQualityDatasets: items.filter(
      (item) => normalizeLabel(item.validation?.quality_label || item.validation?.qualityLabel) === "LOW"
    ).length,
    symbols,
    latestUpdatedAt: getLatestTimestamp(items.map((item) => item.dataset)),
  };
}

function buildRepositoryError(error) {
  return {
    items: [],
    summary: EMPTY_SUMMARY,
    warnings: [error?.message || "Dataset repository is unavailable."],
    error: error || null,
  };
}

export async function getDatasetRepository() {
  const [datasetResult, validationResult, shadowReadinessResult] = await Promise.all([
    getDatasetRecords(),
    getDatasetValidations(),
    getShadowReadinessRecords(),
  ]);

  const firstError = datasetResult.error || validationResult.error || shadowReadinessResult.error;
  if (firstError) return buildRepositoryError(firstError);

  const items = buildRepositoryItems(
    datasetResult.data || [],
    validationResult.data || [],
    shadowReadinessResult.data || []
  );

  return {
    items,
    summary: buildSummary(items),
    warnings: [],
    error: null,
  };
}

export async function getDatasetRepositoryItem(datasetId) {
  const safeDatasetId = safeString(datasetId);
  if (!safeDatasetId) {
    return {
      item: null,
      warnings: ["Dataset id is required."],
      error: new Error("Dataset id is required."),
    };
  }

  const [datasetResult, validationResult, shadowReadinessResult] = await Promise.all([
    getDatasetRecordById(safeDatasetId),
    getDatasetValidations(),
    getShadowReadinessRecords(),
  ]);

  const firstError = datasetResult.error || validationResult.error || shadowReadinessResult.error;
  if (firstError) {
    return {
      item: null,
      warnings: [firstError.message],
      error: firstError,
    };
  }

  const [item] = buildRepositoryItems(
    datasetResult.data ? [datasetResult.data] : [],
    validationResult.data || [],
    shadowReadinessResult.data || []
  );

  return {
    item: item || null,
    warnings: item ? [] : ["Dataset repository item was not found."],
    error: null,
  };
}

export async function getDatasetsByQualityLabel(label) {
  const repository = await getDatasetRepository();
  const normalizedLabel = normalizeLabel(label);

  return {
    ...repository,
    items: repository.items.filter(
      (item) => normalizeLabel(item.validation?.quality_label || item.validation?.qualityLabel) === normalizedLabel
    ),
  };
}

export async function getShadowReadyDatasets() {
  const repository = await getDatasetRepository();

  return {
    ...repository,
    items: repository.items.filter((item) => item.repositoryStatus === "SHADOW_READY"),
  };
}

export async function getDatasetsBySymbol(symbol) {
  const repository = await getDatasetRepository();
  const normalizedSymbol = normalizeSymbol(symbol);

  return {
    ...repository,
    items: repository.items.filter((item) => normalizeSymbol(item.dataset?.symbol) === normalizedSymbol),
  };
}

export async function getDatasetRepositorySummary() {
  const repository = await getDatasetRepository();

  return {
    summary: repository.summary,
    warnings: repository.warnings,
    error: repository.error,
  };
}
