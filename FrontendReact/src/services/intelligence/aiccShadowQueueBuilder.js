import { validateAiccDatasetRecord } from "./aiccDatasetQualityValidator.js";
import { evaluateShadowTrainingReadiness } from "./aiccShadowTrainingEvaluator.js";

function safeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function safeString(value, fallback = "UNKNOWN") {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
}

function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }

  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

function hashString(value) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash.toString(16).padStart(8, "0");
}

function isKnownTarget(value, unknownValue) {
  const normalized = safeString(value, "").toUpperCase();
  return Boolean(normalized && normalized !== unknownValue);
}

function getQueuePriority(readinessScore) {
  if (readinessScore >= 90) return "HIGH";
  if (readinessScore >= 70) return "MEDIUM";
  return "LOW";
}

function getOverallPriority(queueItems) {
  if (queueItems.some((item) => item.priority === "HIGH")) return "HIGH";
  if (queueItems.some((item) => item.priority === "MEDIUM")) return "MEDIUM";
  return "LOW";
}

function createQueueId(queueSeed) {
  return `aicc-shadow-queue-${hashString(stableStringify(queueSeed))}`;
}

export function buildShadowTrainingQueue(records = []) {
  const safeRecords = Array.isArray(records) ? records : [];
  const warnings = [];
  const queueItems = [];
  let recordsWithMissingTargets = 0;

  safeRecords.forEach((record) => {
    const safeRecord = safeObject(record);
    const learningTargets = safeObject(safeRecord.learningTargets);
    const validation = validateAiccDatasetRecord(safeRecord);
    const readiness = evaluateShadowTrainingReadiness(safeRecord, validation);

    const tacticalTarget = safeString(learningTargets.tacticalTarget, "UNKNOWN_TACTICAL");
    const behavioralTarget = safeString(learningTargets.behavioralTarget, "UNKNOWN_BEHAVIORAL");
    const failsafeTarget = safeString(learningTargets.failsafeTarget, "UNKNOWN_FAILSAFE");
    const tacticalReady = isKnownTarget(tacticalTarget, "UNKNOWN_TACTICAL");
    const behavioralReady = isKnownTarget(behavioralTarget, "UNKNOWN_BEHAVIORAL");
    const failsafeReady = isKnownTarget(failsafeTarget, "UNKNOWN_FAILSAFE");

    if (!tacticalReady || !behavioralReady || !failsafeReady) {
      recordsWithMissingTargets += 1;
    }

    const eligible =
      validation.valid &&
      readiness.shadowTrainingReady &&
      tacticalReady &&
      behavioralReady &&
      failsafeReady;

    if (!eligible) return;

    const datasetId = safeString(safeRecord.id, "UNKNOWN_DATASET");
    const createdAt = safeString(safeRecord.timestamp, "1970-01-01T00:00:00.000Z");
    const readinessScore = readiness.readinessScore || 0;

    queueItems.push({
      queueId: createQueueId({
        datasetId,
        tacticalTarget,
        behavioralTarget,
        failsafeTarget,
        createdAt,
      }),
      datasetId,
      tacticalTarget,
      behavioralTarget,
      failsafeTarget,
      readinessScore,
      priority: getQueuePriority(readinessScore),
      createdAt,
      trainingActivated: false,
      persisted: false,
    });
  });

  const totalRecords = safeRecords.length;
  const eligibleRecords = queueItems.length;
  const queueReady = eligibleRecords > 0;
  const readinessCoverage = totalRecords ? eligibleRecords / totalRecords : 0;

  if (totalRecords === 0) {
    warnings.push("Empty records collection.");
  }

  if (eligibleRecords === 0) {
    warnings.push("No eligible records.");
  }

  if (totalRecords > 0 && readinessCoverage < 0.5) {
    warnings.push("Low readiness coverage.");
  }

  if (recordsWithMissingTargets > 0) {
    warnings.push("Missing targets.");
  }

  return {
    queueReady,
    totalRecords,
    eligibleRecords,
    queueItems,
    queuePriority: getOverallPriority(queueItems),
    queueStatus: totalRecords === 0 ? "EMPTY" : queueReady ? "READY" : "BUILDING",
    warnings: [...new Set(warnings)],
  };
}
