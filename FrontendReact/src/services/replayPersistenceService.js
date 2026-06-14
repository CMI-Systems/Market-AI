import { getAuthSession, supabase } from "./supabaseClient";

const REPLAY_TABLE = "replay_sessions";

function isStagingEnvironment() {
  return import.meta.env?.VITE_ENVIRONMENT === "staging";
}

function isReplayPersistenceEnabled() {
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

async function assertReplayPersistenceReady() {
  if (!isStagingEnvironment()) {
    return {
      operatorId: null,
      error: new Error("Replay persistence is available only in the staging environment."),
    };
  }

  if (!isReplayPersistenceEnabled()) {
    return {
      operatorId: null,
      error: new Error("Replay persistence is disabled by environment configuration."),
    };
  }

  return getCurrentOperatorId();
}

function toReplayRow(data, operatorId) {
  return {
    operator_id: operatorId,
    journal_entry_id: data?.journalEntryId || null,
    session_context: safeObject(data?.sessionContext),
    replay_intelligence: safeObject(data?.replayIntelligence),
    status: safeString(data?.status, "REPLAY_REVIEWED").toUpperCase(),
  };
}

function toReplayUpdate(data) {
  const row = toReplayRow(data, null);
  delete row.operator_id;
  return row;
}

export async function createReplaySession(data = {}) {
  const { operatorId, error: readinessError } = await assertReplayPersistenceReady();
  if (readinessError) return buildSafeError(readinessError.message);

  const { data: created, error } = await supabase
    .from(REPLAY_TABLE)
    .insert(toReplayRow(data, operatorId))
    .select("*")
    .single();

  return {
    data: created || null,
    error,
  };
}

export async function getReplaySessions() {
  const { operatorId, error: readinessError } = await assertReplayPersistenceReady();
  if (readinessError) return buildSafeError(readinessError.message);

  const { data, error } = await supabase
    .from(REPLAY_TABLE)
    .select("*")
    .eq("operator_id", operatorId)
    .order("created_at", { ascending: false });

  return {
    data: data || [],
    error,
  };
}

export async function getReplaySessionById(id) {
  const { operatorId, error: readinessError } = await assertReplayPersistenceReady();
  if (readinessError) return buildSafeError(readinessError.message);

  const safeId = safeString(id);
  if (!safeId) return buildSafeError("Replay session id is required.");

  const { data, error } = await supabase
    .from(REPLAY_TABLE)
    .select("*")
    .eq("id", safeId)
    .eq("operator_id", operatorId)
    .single();

  return {
    data: data || null,
    error,
  };
}

export async function updateReplaySession(id, data = {}) {
  const { operatorId, error: readinessError } = await assertReplayPersistenceReady();
  if (readinessError) return buildSafeError(readinessError.message);

  const safeId = safeString(id);
  if (!safeId) return buildSafeError("Replay session id is required for update.");

  const { data: updated, error } = await supabase
    .from(REPLAY_TABLE)
    .update(toReplayUpdate(data))
    .eq("id", safeId)
    .eq("operator_id", operatorId)
    .select("*")
    .single();

  return {
    data: updated || null,
    error,
  };
}

export async function deleteReplaySession(id) {
  const { operatorId, error: readinessError } = await assertReplayPersistenceReady();
  if (readinessError) return buildSafeError(readinessError.message);

  const safeId = safeString(id);
  if (!safeId) return buildSafeError("Replay session id is required for delete.");

  const { data: deleted, error } = await supabase
    .from(REPLAY_TABLE)
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
