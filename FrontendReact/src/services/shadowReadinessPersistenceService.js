import { getAuthSession, supabase } from "./supabaseClient.js";

const SHADOW_READINESS_TABLE = "shadow_readiness";

function isStagingEnvironment() {
  return import.meta.env?.VITE_ENVIRONMENT === "staging";
}

function isShadowReadinessPersistenceEnabled() {
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

async function assertShadowReadinessPersistenceReady() {
  if (!isStagingEnvironment()) {
    return {
      operatorId: null,
      error: new Error("Shadow readiness persistence is available only in the staging environment."),
    };
  }

  if (!isShadowReadinessPersistenceEnabled()) {
    return {
      operatorId: null,
      error: new Error("Shadow readiness persistence is disabled by environment configuration."),
    };
  }

  return getCurrentOperatorId();
}

function getDatasetId(readiness) {
  return safeString(readiness?.datasetId || readiness?.dataset_id || readiness?.recordId);
}

function toShadowReadinessRow(readiness, operatorId) {
  return {
    operator_id: operatorId,
    dataset_id: getDatasetId(readiness),
    validation_id: readiness?.validationId || readiness?.validation_id || null,
    shadow_training_ready:
      readiness?.shadowTrainingReady === true ||
      readiness?.shadow_training_ready === true,
    readiness_score: safeNumber(readiness?.readinessScore || readiness?.readiness_score),
    readiness_label: safeString(readiness?.readinessLabel || readiness?.readiness_label, "LOW").toUpperCase(),
    priority: safeString(readiness?.priority, "LOW").toUpperCase(),
    tactical_ready: readiness?.tacticalReady === true || readiness?.tactical_ready === true,
    behavioral_ready: readiness?.behavioralReady === true || readiness?.behavioral_ready === true,
    failsafe_ready: readiness?.failsafeReady === true || readiness?.failsafe_ready === true,
    acceptance_reasons: safeArray(readiness?.acceptanceReasons || readiness?.acceptance_reasons),
    rejection_reasons: safeArray(readiness?.rejectionReasons || readiness?.rejection_reasons),
    warnings: safeArray(readiness?.warnings),
    status: safeString(readiness?.status, "EVALUATED").toUpperCase(),
  };
}

function toShadowReadinessUpdate(readiness, operatorId) {
  const row = toShadowReadinessRow(readiness, operatorId);
  delete row.operator_id;
  return row;
}

export async function createShadowReadiness(readiness = {}) {
  const { operatorId, error: readinessError } = await assertShadowReadinessPersistenceReady();
  if (readinessError) return buildSafeError(readinessError.message);

  const row = toShadowReadinessRow(readiness, operatorId);
  if (!row.dataset_id) return buildSafeError("Dataset id is required for shadow readiness persistence.");

  const { data, error } = await supabase
    .from(SHADOW_READINESS_TABLE)
    .insert(row)
    .select("*")
    .single();

  return {
    data: data || null,
    error,
  };
}

export async function getShadowReadinessRecords() {
  const { operatorId, error: readinessError } = await assertShadowReadinessPersistenceReady();
  if (readinessError) return buildSafeError(readinessError.message, true);

  const { data, error } = await supabase
    .from(SHADOW_READINESS_TABLE)
    .select("*")
    .eq("operator_id", operatorId)
    .order("created_at", { ascending: false });

  return {
    data: data || [],
    error,
  };
}

export async function getShadowReadinessById(id) {
  const { operatorId, error: readinessError } = await assertShadowReadinessPersistenceReady();
  if (readinessError) return buildSafeError(readinessError.message);

  const safeId = safeString(id);
  if (!safeId) return buildSafeError("Shadow readiness id is required.");

  const { data, error } = await supabase
    .from(SHADOW_READINESS_TABLE)
    .select("*")
    .eq("id", safeId)
    .eq("operator_id", operatorId)
    .single();

  return {
    data: data || null,
    error,
  };
}

export async function updateShadowReadiness(id, readiness = {}) {
  const { operatorId, error: readinessError } = await assertShadowReadinessPersistenceReady();
  if (readinessError) return buildSafeError(readinessError.message);

  const safeId = safeString(id);
  if (!safeId) return buildSafeError("Shadow readiness id is required for update.");

  const { data, error } = await supabase
    .from(SHADOW_READINESS_TABLE)
    .update(toShadowReadinessUpdate(readiness, operatorId))
    .eq("id", safeId)
    .eq("operator_id", operatorId)
    .select("*")
    .single();

  return {
    data: data || null,
    error,
  };
}

export async function deleteShadowReadiness(id) {
  const { operatorId, error: readinessError } = await assertShadowReadinessPersistenceReady();
  if (readinessError) return buildSafeError(readinessError.message);

  const safeId = safeString(id);
  if (!safeId) return buildSafeError("Shadow readiness id is required for delete.");

  const { data, error } = await supabase
    .from(SHADOW_READINESS_TABLE)
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
