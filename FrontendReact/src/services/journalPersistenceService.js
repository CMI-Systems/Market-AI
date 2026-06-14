import { getAuthSession, supabase } from "./supabaseClient";

const JOURNAL_TABLE = "journal_entries";

function isStagingEnvironment() {
  return import.meta.env?.VITE_ENVIRONMENT === "staging";
}

function isJournalPersistenceEnabled() {
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

function buildSafeError(message) {
  return {
    data: null,
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

async function assertJournalPersistenceReady() {
  if (!isStagingEnvironment()) {
    return {
      operatorId: null,
      error: new Error("Journal persistence is available only in the staging environment."),
    };
  }

  if (!isJournalPersistenceEnabled()) {
    return {
      operatorId: null,
      error: new Error("Journal persistence is disabled by environment configuration."),
    };
  }

  return getCurrentOperatorId();
}

function toJournalRow(data, operatorId) {
  return {
    operator_id: operatorId,
    symbol: safeString(data?.symbol, "UNKNOWN").toUpperCase(),
    direction: safeString(data?.direction, "FLAT").toUpperCase(),
    result: safeString(data?.result, "FLAT").toUpperCase(),
    trade_thesis: safeString(data?.tradeThesis),
    execution_review: safeString(data?.executionReview),
    behavioral_reflection: safeString(data?.behavioralReflection),
    behavioral_tags: safeArray(data?.behavioralTags),
    trade_assessment: data?.tradeAssessment || {},
    status: safeString(data?.status, "DRAFT").toUpperCase(),
  };
}

function toJournalUpdate(data) {
  const row = toJournalRow(data, null);
  delete row.operator_id;
  return row;
}

export async function createJournalEntry(data = {}) {
  const { operatorId, error: readinessError } = await assertJournalPersistenceReady();
  if (readinessError) return buildSafeError(readinessError.message);

  const { data: created, error } = await supabase
    .from(JOURNAL_TABLE)
    .insert(toJournalRow(data, operatorId))
    .select("*")
    .single();

  return {
    data: created || null,
    error,
  };
}

export async function getJournalEntries(operatorId) {
  const { operatorId: currentOperatorId, error: readinessError } = await assertJournalPersistenceReady();
  if (readinessError) return buildSafeError(readinessError.message);

  if (operatorId && operatorId !== currentOperatorId) {
    return buildSafeError("Cannot load journal entries for another operator.");
  }

  const { data, error } = await supabase
    .from(JOURNAL_TABLE)
    .select("*")
    .eq("operator_id", currentOperatorId)
    .order("created_at", { ascending: false });

  return {
    data: data || [],
    error,
  };
}

export async function getJournalEntryById(id) {
  const { operatorId, error: readinessError } = await assertJournalPersistenceReady();
  if (readinessError) return buildSafeError(readinessError.message);

  const safeId = safeString(id);
  if (!safeId) return buildSafeError("Journal entry id is required.");

  const { data, error } = await supabase
    .from(JOURNAL_TABLE)
    .select("*")
    .eq("id", safeId)
    .eq("operator_id", operatorId)
    .single();

  return {
    data: data || null,
    error,
  };
}

export async function updateJournalEntry(id, data = {}) {
  const { operatorId, error: readinessError } = await assertJournalPersistenceReady();
  if (readinessError) return buildSafeError(readinessError.message);

  const safeId = safeString(id);
  if (!safeId) return buildSafeError("Journal entry id is required for update.");

  const { data: updated, error } = await supabase
    .from(JOURNAL_TABLE)
    .update(toJournalUpdate(data))
    .eq("id", safeId)
    .eq("operator_id", operatorId)
    .select("*")
    .single();

  return {
    data: updated || null,
    error,
  };
}

export async function deleteJournalEntry(id) {
  const { operatorId, error: readinessError } = await assertJournalPersistenceReady();
  if (readinessError) return buildSafeError(readinessError.message);

  const safeId = safeString(id);
  if (!safeId) return buildSafeError("Journal entry id is required for delete.");

  const { data: deleted, error } = await supabase
    .from(JOURNAL_TABLE)
    .delete()
    .eq("id", safeId)
    .eq("operator_id", operatorId)
    .select("id")
    .single();

  return {
    data: deleted || null,
    error,
  };
}
