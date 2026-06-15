import { getDatasetRepository } from "./datasetRepositoryService.js";
import { validateHistoricalDatasets } from "./historicalDatasetValidationService.js";

const DEFAULT_OPTIONS = {
  rawDataCertified: false,
  trainingEnabled: false,
  retentionDays: 365,
  policyVersion: "N8-v1",
};

const BLOCKED_MARKET_DATA_STATUSES = new Set([
  "BLOCKED",
  "UNAVAILABLE",
  "DATA_UNAVAILABLE",
  "PROVIDER_UNAVAILABLE",
  "PROVIDER_OFFLINE",
  "UNKNOWN_SOURCE",
  "INVALID_TIMESTAMP",
  "INVALID_NUMERIC_DATA",
  "INVALID_OHLC",
  "SYMBOL_MISMATCH",
  "OUT_OF_ORDER",
  "DUPLICATE",
  "SIMULATED",
  "GENERATED",
  "UNSUITABLE",
]);

const EMPTY_SUMMARY = {
  totalDatasets: 0,
  compliantDatasets: 0,
  reviewRequiredDatasets: 0,
  restrictedDatasets: 0,
  incompleteDatasets: 0,
  activeDatasets: 0,
  archiveCandidates: 0,
  holdDatasets: 0,
  futureTrainingEligibleDatasets: 0,
  trainingBlockedDatasets: 0,
  rawDataCertified: false,
  trainingEnabled: false,
  policyVersion: "N8-v1",
  governanceStatus: "EMPTY",
  warnings: [],
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

function normalizeOptions(options = {}) {
  return {
    rawDataCertified: false,
    trainingEnabled: false,
    retentionDays: safeNumber(options.retentionDays, DEFAULT_OPTIONS.retentionDays),
    policyVersion: safeString(options.policyVersion, DEFAULT_OPTIONS.policyVersion),
    operatorId: safeString(options.operatorId),
    historicalValidationResult: safeObject(options.historicalValidationResult),
  };
}

function getDataset(repositoryItem) {
  return safeObject(repositoryItem?.dataset);
}

function getOperatorId(dataset) {
  return safeString(firstDefined(dataset.operatorId, dataset.operator_id));
}

function getSymbol(dataset) {
  return safeString(dataset.symbol, "UNKNOWN").toUpperCase();
}

function hasObjectContent(value) {
  return Object.keys(safeObject(value)).length > 0;
}

function isKnownValue(value, unknownValue) {
  const normalized = safeString(value).toUpperCase();
  return Boolean(normalized && normalized !== unknownValue);
}

function getMarketDataValidation(dataset) {
  return safeObject(firstDefined(
    dataset.marketDataValidation,
    dataset.market_data_validation,
    safeObject(dataset.metadata).marketDataValidation
  ));
}

function getMarketDataValidationStatus(dataset) {
  const marketDataValidation = getMarketDataValidation(dataset);
  if (!hasObjectContent(marketDataValidation)) return "MISSING_MARKET_DATA_VALIDATION";
  return safeString(
    marketDataValidation.status || marketDataValidation.validationStatus || marketDataValidation.qualityLabel,
    "UNKNOWN"
  ).toUpperCase();
}

function isMarketDataValidationBlocked(dataset) {
  const marketDataValidation = getMarketDataValidation(dataset);
  const status = getMarketDataValidationStatus(dataset);

  return (
    status === "MISSING_MARKET_DATA_VALIDATION" ||
    BLOCKED_MARKET_DATA_STATUSES.has(status) ||
    marketDataValidation.rawDataCertified === true ||
    marketDataValidation.trainingEligible === true
  );
}

function getLearningTargets(dataset) {
  return safeObject(firstDefined(dataset.learningTargets, dataset.learning_targets));
}

function getDatasetWarnings(repositoryItem, historicalValidationResult) {
  const marketDataValidation = getMarketDataValidation(safeObject(repositoryItem?.dataset));
  const marketDataValidationStatus = getMarketDataValidationStatus(safeObject(repositoryItem?.dataset));
  const marketDataWarnings = [
    marketDataValidationStatus === "MISSING_MARKET_DATA_VALIDATION" ? marketDataValidationStatus : null,
    ...safeArray(marketDataValidation.warnings),
    ...safeArray(marketDataValidation.validationWarnings),
    ...safeArray(marketDataValidation.errors),
    ...safeArray(marketDataValidation.validationErrors),
  ];

  return [
    ...safeArray(repositoryItem?.dataset?.warnings),
    ...safeArray(repositoryItem?.validation?.warnings),
    ...safeArray(repositoryItem?.shadowReadiness?.warnings),
    ...safeArray(historicalValidationResult?.warnings),
    ...marketDataWarnings.filter(Boolean).map((warning) => `Market data validation: ${warning}`),
  ].filter(Boolean);
}

function getOwnershipStatus(dataset, options) {
  const operatorId = getOperatorId(dataset);
  if (!operatorId) return "OWNERSHIP_MISSING";
  if (options.operatorId && operatorId !== options.operatorId) return "OWNERSHIP_MISMATCH";
  return "OWNED";
}

function getCompletenessStatus(dataset, ownershipStatus) {
  const learningTargets = getLearningTargets(dataset);
  const tacticalTarget = firstDefined(learningTargets.tacticalTarget, learningTargets.tactical_target);
  const behavioralTarget = firstDefined(learningTargets.behavioralTarget, learningTargets.behavioral_target);
  const failsafeTarget = firstDefined(learningTargets.failsafeTarget, learningTargets.failsafe_target);
  const checks = [
    ownershipStatus === "OWNED",
    isKnownValue(dataset.symbol, "UNKNOWN"),
    hasObjectContent(firstDefined(dataset.intelligenceSnapshot, dataset.intelligence_snapshot)),
    hasObjectContent(firstDefined(dataset.operatorContext, dataset.operator_context)),
    hasObjectContent(firstDefined(dataset.marketContext, dataset.market_context)),
    hasObjectContent(getMarketDataValidation(dataset)),
    isKnownValue(tacticalTarget, "UNKNOWN_TACTICAL"),
    isKnownValue(behavioralTarget, "UNKNOWN_BEHAVIORAL"),
    isKnownValue(failsafeTarget, "UNKNOWN_FAILSAFE"),
  ];

  const passed = checks.filter(Boolean).length;
  if (passed === checks.length) return "COMPLETE";
  if (passed > 0) return "PARTIAL";
  return "INCOMPLETE";
}

function getValidationStatus(validation) {
  if (!validation) return "MISSING_VALIDATION";
  return validation.valid === true ? "VALID" : "INVALID";
}

function getReadinessStatus(readiness) {
  if (!readiness) return "MISSING_READINESS";
  return readiness.shadow_training_ready === true || readiness.shadowTrainingReady === true
    ? "SHADOW_READY"
    : "NOT_READY";
}

function getCreatedAt(dataset) {
  return firstDefined(dataset.created_at, dataset.createdAt, dataset.timestamp, null);
}

function isOutsideRetentionWindow(dataset, retentionDays) {
  const createdAt = getCreatedAt(dataset);
  if (!createdAt) return false;

  const createdTime = new Date(createdAt).getTime();
  if (!Number.isFinite(createdTime)) return false;

  const ageMs = Date.now() - createdTime;
  const retentionMs = retentionDays * 24 * 60 * 60 * 1000;
  return ageMs > retentionMs;
}

function isDatasetMarkedRestricted(dataset) {
  const metadata = safeObject(dataset.metadata);
  return (
    safeString(dataset.status).toUpperCase() === "RESTRICTED" ||
    metadata.restricted === true ||
    isMarketDataValidationBlocked(dataset)
  );
}

function hasHistoricalChange(historicalValidationResult) {
  const status = safeString(historicalValidationResult?.consistencyStatus);
  return status === "VALIDATION_CHANGED" || status === "READINESS_CHANGED";
}

function getReviewRequired({
  validation,
  readiness,
  completenessStatus,
  ownershipStatus,
  warnings,
  historicalValidationResult,
  datasetMarkedRestricted,
}) {
  return (
    !validation ||
    !readiness ||
    completenessStatus !== "COMPLETE" ||
    ownershipStatus !== "OWNED" ||
    hasHistoricalChange(historicalValidationResult) ||
    warnings.length > 0 ||
    datasetMarkedRestricted
  );
}

function getGovernanceStatus({ ownershipStatus, completenessStatus, reviewRequired, datasetMarkedRestricted }) {
  if (ownershipStatus !== "OWNED" || datasetMarkedRestricted) return "RESTRICTED";
  if (completenessStatus === "INCOMPLETE" || completenessStatus === "PARTIAL") return "INCOMPLETE";
  if (reviewRequired) return "REVIEW_REQUIRED";
  return "COMPLIANT";
}

function getRetentionClass({ dataset, completenessStatus, reviewRequired, ownershipStatus, warnings, retentionDays }) {
  if (reviewRequired || ownershipStatus !== "OWNED" || warnings.length > 0) return "HOLD";
  if (isOutsideRetentionWindow(dataset, retentionDays)) return "ARCHIVE_CANDIDATE";
  if (completenessStatus === "COMPLETE") return "ACTIVE";
  return "HOLD";
}

function getTrainingBlockedReason({
  governanceStatus,
  validation,
  readiness,
  ownershipStatus,
  completenessStatus,
  rawDataCertified,
  trainingEnabled,
}) {
  if (!rawDataCertified) return "RAW_DATA_CERTIFICATION_REQUIRED";
  if (!trainingEnabled) return "TRAINING_DISABLED";
  if (governanceStatus !== "COMPLIANT") return "GOVERNANCE_NOT_COMPLIANT";
  if (validation?.valid !== true) return "DATASET_VALIDATION_REQUIRED";
  if (validation?.accepted_for_shadow_training !== true && validation?.acceptedForShadowTraining !== true) {
    return "SHADOW_ACCEPTANCE_REQUIRED";
  }
  if (readiness?.shadow_training_ready !== true && readiness?.shadowTrainingReady !== true) {
    return "SHADOW_READINESS_REQUIRED";
  }
  if (ownershipStatus !== "OWNED") return "OWNERSHIP_REQUIRED";
  if (completenessStatus !== "COMPLETE") return "COMPLETENESS_REQUIRED";
  return null;
}

function getSummaryStatus(summary) {
  if (summary.totalDatasets === 0) return "EMPTY";
  if (summary.restrictedDatasets > 0) return "RESTRICTED";
  if (summary.reviewRequiredDatasets > 0 || summary.incompleteDatasets > 0) return "NEEDS_REVIEW";
  return "CONTROLLED";
}

function buildHistoricalMap(validationResults) {
  return new Map(
    safeArray(validationResults).map((result) => [safeString(result.datasetId), result])
  );
}

export function getDatasetTrainingEligibility(repositoryItem, options = {}) {
  const normalizedOptions = normalizeOptions(options);
  const dataset = getDataset(repositoryItem);
  const validation = safeObject(repositoryItem?.validation);
  const readiness = safeObject(repositoryItem?.shadowReadiness);
  const ownershipStatus = getOwnershipStatus(dataset, normalizedOptions);
  const completenessStatus = getCompletenessStatus(dataset, ownershipStatus);
  const governanceStatus = evaluateDatasetGovernance(repositoryItem, normalizedOptions).governanceStatus;
  const trainingBlockedReason = getTrainingBlockedReason({
    governanceStatus,
    validation,
    readiness,
    ownershipStatus,
    completenessStatus,
    rawDataCertified: normalizedOptions.rawDataCertified,
    trainingEnabled: normalizedOptions.trainingEnabled,
  });

  return {
    futureTrainingEligible: trainingBlockedReason === null,
    trainingBlockedReason,
    warnings: trainingBlockedReason ? [trainingBlockedReason] : [],
  };
}

export function getDatasetRetentionRecommendation(repositoryItem, options = {}) {
  const normalizedOptions = normalizeOptions(options);
  const dataset = getDataset(repositoryItem);
  const historicalValidationResult = normalizedOptions.historicalValidationResult;
  const warnings = getDatasetWarnings(repositoryItem, historicalValidationResult);
  const ownershipStatus = getOwnershipStatus(dataset, normalizedOptions);
  const completenessStatus = getCompletenessStatus(dataset, ownershipStatus);
  const reviewRequired = getReviewRequired({
    validation: repositoryItem?.validation || null,
    readiness: repositoryItem?.shadowReadiness || null,
    completenessStatus,
    ownershipStatus,
    warnings,
    historicalValidationResult,
    datasetMarkedRestricted: isDatasetMarkedRestricted(dataset),
  });

  return {
    retentionClass: getRetentionClass({
      dataset,
      completenessStatus,
      reviewRequired,
      ownershipStatus,
      warnings,
      retentionDays: normalizedOptions.retentionDays,
    }),
    warnings,
  };
}

export function evaluateDatasetGovernance(repositoryItem = {}, options = {}) {
  const normalizedOptions = normalizeOptions(options);
  const dataset = getDataset(repositoryItem);
  const validation = repositoryItem?.validation || null;
  const readiness = repositoryItem?.shadowReadiness || null;
  const historicalValidationResult = normalizedOptions.historicalValidationResult;
  const warnings = getDatasetWarnings(repositoryItem, historicalValidationResult);
  const ownershipStatus = getOwnershipStatus(dataset, normalizedOptions);
  const completenessStatus = getCompletenessStatus(dataset, ownershipStatus);
  const datasetMarkedRestricted = isDatasetMarkedRestricted(dataset);
  const reviewRequired = getReviewRequired({
    validation,
    readiness,
    completenessStatus,
    ownershipStatus,
    warnings,
    historicalValidationResult,
    datasetMarkedRestricted,
  });
  const governanceStatus = getGovernanceStatus({
    ownershipStatus,
    completenessStatus,
    reviewRequired,
    datasetMarkedRestricted,
  });
  const retentionClass = getRetentionClass({
    dataset,
    completenessStatus,
    reviewRequired,
    ownershipStatus,
    warnings,
    retentionDays: normalizedOptions.retentionDays,
  });
  const trainingBlockedReason = getTrainingBlockedReason({
    governanceStatus,
    validation: validation || {},
    readiness: readiness || {},
    ownershipStatus,
    completenessStatus,
    rawDataCertified: normalizedOptions.rawDataCertified,
    trainingEnabled: normalizedOptions.trainingEnabled,
  });

  return {
    datasetId: safeString(dataset.id, "UNKNOWN_DATASET"),
    operatorId: getOperatorId(dataset) || null,
    symbol: getSymbol(dataset),
    governanceStatus,
    ownershipStatus,
    completenessStatus,
    validationStatus: getValidationStatus(validation),
    readinessStatus: getReadinessStatus(readiness),
    retentionClass,
    reviewRequired,
    futureTrainingEligible: trainingBlockedReason === null,
    trainingBlockedReason,
    policyVersion: normalizedOptions.policyVersion,
    warnings: [...new Set(warnings)],
  };
}

export async function getDatasetGovernanceSummary(options = {}) {
  const normalizedOptions = normalizeOptions(options);

  try {
    const [repository, historicalValidation] = await Promise.all([
      getDatasetRepository(),
      validateHistoricalDatasets(),
    ]);

    if (repository.error) {
      return {
        ...EMPTY_SUMMARY,
        rawDataCertified: normalizedOptions.rawDataCertified,
        trainingEnabled: normalizedOptions.trainingEnabled,
        policyVersion: normalizedOptions.policyVersion,
        warnings: repository.warnings || ["Dataset governance repository is unavailable."],
      };
    }

    const historicalMap = buildHistoricalMap(historicalValidation.validationResults);
    const governanceResults = safeArray(repository.items).map((item) =>
      evaluateDatasetGovernance(item, {
        ...normalizedOptions,
        historicalValidationResult: historicalMap.get(safeString(item?.dataset?.id)),
      })
    );

    const summary = {
      totalDatasets: governanceResults.length,
      compliantDatasets: governanceResults.filter((item) => item.governanceStatus === "COMPLIANT").length,
      reviewRequiredDatasets: governanceResults.filter((item) => item.reviewRequired).length,
      restrictedDatasets: governanceResults.filter((item) => item.governanceStatus === "RESTRICTED").length,
      incompleteDatasets: governanceResults.filter((item) => item.governanceStatus === "INCOMPLETE").length,
      activeDatasets: governanceResults.filter((item) => item.retentionClass === "ACTIVE").length,
      archiveCandidates: governanceResults.filter((item) => item.retentionClass === "ARCHIVE_CANDIDATE").length,
      holdDatasets: governanceResults.filter((item) => item.retentionClass === "HOLD").length,
      futureTrainingEligibleDatasets: governanceResults.filter((item) => item.futureTrainingEligible).length,
      trainingBlockedDatasets: governanceResults.filter((item) => !item.futureTrainingEligible).length,
      rawDataCertified: normalizedOptions.rawDataCertified,
      trainingEnabled: normalizedOptions.trainingEnabled,
      policyVersion: normalizedOptions.policyVersion,
      governanceStatus: "EMPTY",
      warnings: [
        ...safeArray(repository.warnings),
        ...safeArray(historicalValidation.warnings),
        ...governanceResults.flatMap((item) => item.warnings),
      ],
    };

    return {
      ...summary,
      governanceStatus: getSummaryStatus(summary),
      warnings: [...new Set(summary.warnings)],
    };
  } catch (error) {
    return {
      ...EMPTY_SUMMARY,
      rawDataCertified: normalizedOptions.rawDataCertified,
      trainingEnabled: normalizedOptions.trainingEnabled,
      policyVersion: normalizedOptions.policyVersion,
      warnings: [error?.message || "Dataset governance failed safely."],
    };
  }
}

export async function getDatasetsRequiringReview(options = {}) {
  const normalizedOptions = normalizeOptions(options);
  const [repository, historicalValidation] = await Promise.all([
    getDatasetRepository(),
    validateHistoricalDatasets(),
  ]);

  if (repository.error) {
    return {
      datasets: [],
      warnings: repository.warnings || ["Dataset governance repository is unavailable."],
      error: repository.error,
    };
  }

  const historicalMap = buildHistoricalMap(historicalValidation.validationResults);
  const datasets = safeArray(repository.items)
    .map((item) =>
      evaluateDatasetGovernance(item, {
        ...normalizedOptions,
        historicalValidationResult: historicalMap.get(safeString(item?.dataset?.id)),
      })
    )
    .filter((item) => item.reviewRequired);

  return {
    datasets,
    warnings: [...new Set([...safeArray(repository.warnings), ...safeArray(historicalValidation.warnings)])],
    error: null,
  };
}
