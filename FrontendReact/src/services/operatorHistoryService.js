import { getJournalEntries } from "./journalPersistenceService.js";
import { getReplaySessions } from "./replayPersistenceService.js";
import { getDatasetRecords } from "./datasetPersistenceService.js";
import { getDatasetValidations } from "./datasetValidationPersistenceService.js";
import { getShadowReadinessRecords } from "./shadowReadinessPersistenceService.js";

const EMPTY_SUMMARY = {
  totalHistoryItems: 0,
  journalEntries: 0,
  replaySessions: 0,
  datasetRecords: 0,
  datasetValidations: 0,
  shadowReadinessRecords: 0,
  latestActivityAt: null,
  historyStatus: "EMPTY",
};

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function safeString(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
}

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null);
}

function normalizeSymbol(value) {
  return safeString(value, "UNKNOWN").toUpperCase();
}

function normalizeStatus(value, fallback = "UNKNOWN") {
  return safeString(value, fallback).toUpperCase();
}

function getTimestamp(record, key, fallbackKey) {
  return firstDefined(record?.[key], record?.[fallbackKey], null);
}

function getSortTime(item) {
  const timestamp = item.updatedAt || item.createdAt;
  const time = timestamp ? new Date(timestamp).getTime() : 0;
  return Number.isFinite(time) ? time : 0;
}

function sortHistory(items) {
  return [...items].sort((a, b) => getSortTime(b) - getSortTime(a));
}

function getReplaySymbol(record) {
  const context = safeObject(record?.session_context || record?.sessionContext);
  const journalEntry = safeObject(context.journalEntry);
  const selectedTrade = safeObject(context.selectedTrade);
  return normalizeSymbol(firstDefined(record?.symbol, journalEntry.symbol, selectedTrade.symbol));
}

function normalizeJournalEntry(record) {
  return {
    id: safeString(record?.id, "UNKNOWN_JOURNAL_ENTRY"),
    type: "JOURNAL_ENTRY",
    createdAt: getTimestamp(record, "created_at", "createdAt"),
    updatedAt: getTimestamp(record, "updated_at", "updatedAt"),
    symbol: normalizeSymbol(record?.symbol),
    status: normalizeStatus(record?.status, "DRAFT"),
    source: "journal_entries",
    summary: `${normalizeStatus(record?.direction, "FLAT")} ${normalizeSymbol(record?.symbol)} ${normalizeStatus(
      record?.result,
      "FLAT"
    )}`,
  };
}

function normalizeReplaySession(record) {
  const context = safeObject(record?.session_context || record?.sessionContext);

  return {
    id: safeString(record?.id, "UNKNOWN_REPLAY_SESSION"),
    type: "REPLAY_SESSION",
    createdAt: getTimestamp(record, "created_at", "createdAt"),
    updatedAt: getTimestamp(record, "updated_at", "updatedAt"),
    symbol: getReplaySymbol(record),
    status: normalizeStatus(record?.status, "REPLAY_REVIEWED"),
    source: "replay_sessions",
    summary: safeString(context.source, "REPLAY_CENTER"),
  };
}

function normalizeDatasetRecord(record) {
  return {
    id: safeString(record?.id, "UNKNOWN_DATASET_RECORD"),
    type: "DATASET_RECORD",
    createdAt: getTimestamp(record, "created_at", "createdAt"),
    updatedAt: getTimestamp(record, "updated_at", "updatedAt"),
    symbol: normalizeSymbol(record?.symbol),
    status: normalizeStatus(record?.status, "CAPTURED"),
    source: "aicc_dataset_records",
    summary: `${normalizeSymbol(record?.symbol)} dataset ${normalizeStatus(record?.status, "CAPTURED")}`,
  };
}

function normalizeDatasetValidation(record) {
  return {
    id: safeString(record?.id, "UNKNOWN_DATASET_VALIDATION"),
    type: "DATASET_VALIDATION",
    createdAt: getTimestamp(record, "created_at", "createdAt"),
    updatedAt: getTimestamp(record, "updated_at", "updatedAt"),
    symbol: "UNKNOWN",
    status: normalizeStatus(record?.status, "VALIDATED"),
    source: "dataset_validations",
    summary: `${normalizeStatus(record?.quality_label || record?.qualityLabel, "LOW")} quality validation`,
  };
}

function normalizeShadowReadiness(record) {
  return {
    id: safeString(record?.id, "UNKNOWN_SHADOW_READINESS"),
    type: "SHADOW_READINESS",
    createdAt: getTimestamp(record, "created_at", "createdAt"),
    updatedAt: getTimestamp(record, "updated_at", "updatedAt"),
    symbol: "UNKNOWN",
    status: normalizeStatus(record?.status, "EVALUATED"),
    source: "shadow_readiness",
    summary: `${normalizeStatus(record?.readiness_label || record?.readinessLabel, "LOW")} shadow readiness`,
  };
}

function getHistoryStatus(summary) {
  if (summary.totalHistoryItems === 0) return "EMPTY";

  const datasetActivity =
    summary.datasetRecords + summary.datasetValidations + summary.shadowReadinessRecords;
  const operatorActivity = summary.journalEntries + summary.replaySessions;

  if (datasetActivity > operatorActivity && datasetActivity >= 3) return "DATASET_HEAVY";
  if (summary.totalHistoryItems >= 10) return "EXPANDING";
  return "ACTIVE";
}

function buildSummary(history) {
  const summary = {
    totalHistoryItems: history.length,
    journalEntries: history.filter((item) => item.type === "JOURNAL_ENTRY").length,
    replaySessions: history.filter((item) => item.type === "REPLAY_SESSION").length,
    datasetRecords: history.filter((item) => item.type === "DATASET_RECORD").length,
    datasetValidations: history.filter((item) => item.type === "DATASET_VALIDATION").length,
    shadowReadinessRecords: history.filter((item) => item.type === "SHADOW_READINESS").length,
    latestActivityAt: history[0]?.updatedAt || history[0]?.createdAt || null,
    historyStatus: "EMPTY",
  };

  return {
    ...summary,
    historyStatus: getHistoryStatus(summary),
  };
}

function collectWarnings(results) {
  return [
    results.journal.error?.message,
    results.replay.error?.message,
    results.dataset.error?.message,
    results.validation.error?.message,
    results.readiness.error?.message,
  ].filter(Boolean);
}

async function loadHistorySources() {
  const [journal, replay, dataset, validation, readiness] = await Promise.all([
    getJournalEntries(),
    getReplaySessions(),
    getDatasetRecords(),
    getDatasetValidations(),
    getShadowReadinessRecords(),
  ]);

  return {
    journal,
    replay,
    dataset,
    validation,
    readiness,
  };
}

export async function getOperatorHistory() {
  try {
    const results = await loadHistorySources();
    const history = sortHistory([
      ...safeArray(results.journal.data).map(normalizeJournalEntry),
      ...safeArray(results.replay.data).map(normalizeReplaySession),
      ...safeArray(results.dataset.data).map(normalizeDatasetRecord),
      ...safeArray(results.validation.data).map(normalizeDatasetValidation),
      ...safeArray(results.readiness.data).map(normalizeShadowReadiness),
    ]);

    return {
      history,
      summary: buildSummary(history),
      warnings: [...new Set(collectWarnings(results))],
      error: null,
    };
  } catch (error) {
    return {
      history: [],
      summary: EMPTY_SUMMARY,
      warnings: [error?.message || "Operator history failed safely."],
      error,
    };
  }
}

export async function getOperatorHistoryByType(type) {
  const normalizedType = normalizeStatus(type);
  const result = await getOperatorHistory();

  return {
    ...result,
    history: result.history.filter((item) => item.type === normalizedType),
  };
}

export async function getRecentOperatorActivity(limit = 10) {
  const safeLimit = Number.isFinite(Number(limit)) ? Math.max(0, Number(limit)) : 10;
  const result = await getOperatorHistory();

  return {
    ...result,
    history: result.history.slice(0, safeLimit),
  };
}

export async function getOperatorHistorySummary() {
  const result = await getOperatorHistory();

  return {
    summary: result.summary,
    warnings: result.warnings,
    error: result.error,
  };
}
