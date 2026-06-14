import { getAuthSession, supabase } from "./supabaseClient.js";

const DATASET_TABLE = "aicc_dataset_records";

function isStagingEnvironment() {
  return import.meta.env?.VITE_ENVIRONMENT === "staging";
}

function isDatasetPersistenceEnabled() {
  return import.meta.env?.VITE_PERSISTENCE_ENABLED === "true";
}

function safeString(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
}

function safeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildSafeError(message, list = false) {
  return {
    data: list ? [] : null,
    error: new Error(message),
  };
}

async function getCurrentOperator() {
  const { session, error, configured } = await getAuthSession();

  if (!configured || !supabase) {
    return {
      operatorId: null,
      operatorEmail: null,
      error: new Error("Supabase is not configured."),
    };
  }

  if (error) {
    return {
      operatorId: null,
      operatorEmail: null,
      error,
    };
  }

  const operatorId = session?.user?.id || null;

  if (!operatorId) {
    return {
      operatorId: null,
      operatorEmail: null,
      error: new Error("Authenticated operator session is required."),
    };
  }

  return {
    operatorId,
    operatorEmail: session?.user?.email || null,
    error: null,
  };
}

async function assertDatasetPersistenceReady() {
  if (!isStagingEnvironment()) {
    return {
      operatorId: null,
      operatorEmail: null,
      error: new Error("Dataset persistence is available only in the staging environment."),
    };
  }

  if (!isDatasetPersistenceEnabled()) {
    return {
      operatorId: null,
      operatorEmail: null,
      error: new Error("Dataset persistence is disabled by environment configuration."),
    };
  }

  return getCurrentOperator();
}

function toDatasetRow(record, operatorId, operatorEmail) {
  const metadata = {
    ...safeObject(record?.metadata),
    persisted: true,
    trainingActivated: false,
  };

  return {
    id: safeString(record?.id),
    operator_id: operatorId,
    operator_email: safeString(record?.operatorEmail || operatorEmail, null),
    symbol: safeString(record?.symbol, "UNKNOWN").toUpperCase(),
    journal_entry_id: record?.journalEntryId || record?.journal_entry_id || null,
    replay_session_id: record?.replaySessionId || record?.replay_session_id || null,
    intelligence_snapshot: safeObject(record?.intelligenceSnapshot || record?.intelligence_snapshot),
    operator_context: safeObject(record?.operatorContext || record?.operator_context),
    market_context: safeObject(record?.marketContext || record?.market_context),
    learning_targets: safeObject(record?.learningTargets || record?.learning_targets),
    metadata,
    warnings: safeArray(record?.warnings),
    status: safeString(record?.status, "CAPTURED").toUpperCase(),
  };
}

function toDatasetUpdate(record, operatorId, operatorEmail) {
  const row = toDatasetRow(record, operatorId, operatorEmail);
  delete row.id;
  delete row.operator_id;
  return row;
}

export async function createDatasetRecord(record = {}) {
  const { operatorId, operatorEmail, error: readinessError } = await assertDatasetPersistenceReady();
  if (readinessError) return buildSafeError(readinessError.message);

  const row = toDatasetRow(record, operatorId, operatorEmail);
  if (!row.id) return buildSafeError("Dataset record id is required.");

  const { data, error } = await supabase
    .from(DATASET_TABLE)
    .insert(row)
    .select("*")
    .single();

  return {
    data: data || null,
    error,
  };
}

export async function getDatasetRecords() {
  const { operatorId, error: readinessError } = await assertDatasetPersistenceReady();
  if (readinessError) return buildSafeError(readinessError.message, true);

  const { data, error } = await supabase
    .from(DATASET_TABLE)
    .select("*")
    .eq("operator_id", operatorId)
    .order("created_at", { ascending: false });

  return {
    data: data || [],
    error,
  };
}

export async function getDatasetRecordById(id) {
  const { operatorId, error: readinessError } = await assertDatasetPersistenceReady();
  if (readinessError) return buildSafeError(readinessError.message);

  const safeId = safeString(id);
  if (!safeId) return buildSafeError("Dataset record id is required.");

  const { data, error } = await supabase
    .from(DATASET_TABLE)
    .select("*")
    .eq("id", safeId)
    .eq("operator_id", operatorId)
    .single();

  return {
    data: data || null,
    error,
  };
}

export async function updateDatasetRecord(id, record = {}) {
  const { operatorId, operatorEmail, error: readinessError } = await assertDatasetPersistenceReady();
  if (readinessError) return buildSafeError(readinessError.message);

  const safeId = safeString(id);
  if (!safeId) return buildSafeError("Dataset record id is required for update.");

  const { data, error } = await supabase
    .from(DATASET_TABLE)
    .update(toDatasetUpdate(record, operatorId, operatorEmail))
    .eq("id", safeId)
    .eq("operator_id", operatorId)
    .select("*")
    .single();

  return {
    data: data || null,
    error,
  };
}

export async function deleteDatasetRecord(id) {
  const { operatorId, error: readinessError } = await assertDatasetPersistenceReady();
  if (readinessError) return buildSafeError(readinessError.message);

  const safeId = safeString(id);
  if (!safeId) return buildSafeError("Dataset record id is required for delete.");

  const { data, error } = await supabase
    .from(DATASET_TABLE)
    .delete()
    .eq("id", safeId)
    .eq("operator_id", operatorId)
    .select("id")
    .single();

  return {
    data: data || null,
    error,
  };
}
