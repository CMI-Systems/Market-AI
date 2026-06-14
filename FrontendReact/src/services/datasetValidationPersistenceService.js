import { getAuthSession, supabase } from "./supabaseClient.js";

const VALIDATION_TABLE = "dataset_validations";

function isStagingEnvironment() {
  return import.meta.env?.VITE_ENVIRONMENT === "staging";
}

function isValidationPersistenceEnabled() {
  return import.meta.env?.VITE_PERSISTENCE_ENABLED === "true";
}

function safeString(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeNumber(value) {
  return Number.isFinite(value) ? value : 0;
}

function buildSafeError(message, list = false) {
  return {
    data: list ? [] : null,
    error: new Error(message),
  };
}

async function getCurrentOperatorId() {
  const { session, error, configured } = await getAuthSession();

  if (!configured || !supabase) {
    return {
      operatorId: null,
      error: new Error("Supabase is not configured."),
    };
  }

  if (error) {
    return {
      operatorId: null,
      error,
    };
  }

  const operatorId = session?.user?.id || null;

  if (!operatorId) {
    return {
      operatorId: null,
      error: new Error("Authenticated operator session is required."),
    };
  }

  return {
    operatorId,
    error: null,
  };
}

async function assertValidationPersistenceReady() {
  if (!isStagingEnvironment()) {
    return {
      operatorId: null,
      error: new Error("Dataset validation persistence is available only in the staging environment."),
    };
  }

  if (!isValidationPersistenceEnabled()) {
    return {
      operatorId: null,
      error: new Error("Dataset validation persistence is disabled by environment configuration."),
    };
  }

  return getCurrentOperatorId();
}

function getDatasetId(validation) {
  return safeString(validation?.datasetId || validation?.dataset_id || validation?.recordId);
}

function toValidationRow(validation, operatorId) {
  return {
    operator_id: operatorId,
    dataset_id: getDatasetId(validation),
    valid: validation?.valid === true,
    quality_score: safeNumber(validation?.qualityScore || validation?.quality_score),
    quality_label: safeString(validation?.qualityLabel || validation?.quality_label, "LOW").toUpperCase(),
    accepted_for_shadow_training:
      validation?.acceptedForShadowTraining === true ||
      validation?.accepted_for_shadow_training === true,
    missing_fields: safeArray(validation?.missingFields || validation?.missing_fields),
    validation_reasons: safeArray(validation?.validationReasons || validation?.validation_reasons),
    rejection_reasons: safeArray(validation?.rejectionReasons || validation?.rejection_reasons),
    warnings: safeArray(validation?.warnings),
    status: safeString(validation?.status, "VALIDATED").toUpperCase(),
  };
}

function toValidationUpdate(validation, operatorId) {
  const row = toValidationRow(validation, operatorId);
  delete row.operator_id;
  return row;
}

export async function createDatasetValidation(validation = {}) {
  const { operatorId, error: readinessError } = await assertValidationPersistenceReady();
  if (readinessError) return buildSafeError(readinessError.message);

  const row = toValidationRow(validation, operatorId);
  if (!row.dataset_id) return buildSafeError("Dataset id is required for validation persistence.");

  const { data, error } = await supabase
    .from(VALIDATION_TABLE)
    .insert(row)
    .select("*")
    .single();

  return {
    data: data || null,
    error,
  };
}

export async function getDatasetValidations() {
  const { operatorId, error: readinessError } = await assertValidationPersistenceReady();
  if (readinessError) return buildSafeError(readinessError.message, true);

  const { data, error } = await supabase
    .from(VALIDATION_TABLE)
    .select("*")
    .eq("operator_id", operatorId)
    .order("created_at", { ascending: false });

  return {
    data: data || [],
    error,
  };
}

export async function getDatasetValidationById(id) {
  const { operatorId, error: readinessError } = await assertValidationPersistenceReady();
  if (readinessError) return buildSafeError(readinessError.message);

  const safeId = safeString(id);
  if (!safeId) return buildSafeError("Dataset validation id is required.");

  const { data, error } = await supabase
    .from(VALIDATION_TABLE)
    .select("*")
    .eq("id", safeId)
    .eq("operator_id", operatorId)
    .single();

  return {
    data: data || null,
    error,
  };
}

export async function updateDatasetValidation(id, validation = {}) {
  const { operatorId, error: readinessError } = await assertValidationPersistenceReady();
  if (readinessError) return buildSafeError(readinessError.message);

  const safeId = safeString(id);
  if (!safeId) return buildSafeError("Dataset validation id is required for update.");

  const { data, error } = await supabase
    .from(VALIDATION_TABLE)
    .update(toValidationUpdate(validation, operatorId))
    .eq("id", safeId)
    .eq("operator_id", operatorId)
    .select("*")
    .single();

  return {
    data: data || null,
    error,
  };
}

export async function deleteDatasetValidation(id) {
  const { operatorId, error: readinessError } = await assertValidationPersistenceReady();
  if (readinessError) return buildSafeError(readinessError.message);

  const safeId = safeString(id);
  if (!safeId) return buildSafeError("Dataset validation id is required for delete.");

  const { data, error } = await supabase
    .from(VALIDATION_TABLE)
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
