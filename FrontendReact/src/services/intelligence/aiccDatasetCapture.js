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

function createDeterministicId(recordSeed) {
  return `aicc-dataset-${hashString(stableStringify(recordSeed))}`;
}

function deriveOperatorId(operator) {
  const id = safeString(operator.id || operator.operatorId || operator.userId, "");
  return id || null;
}

function deriveOperatorEmail(operator) {
  const email = safeString(operator.email || operator.operatorEmail, "");
  return email || null;
}

function buildWarnings({
  operator,
  symbol,
  tactical,
  behavioral,
  failsafe,
  replayIntelligence,
}) {
  const warnings = [];

  if (!operator || !Object.keys(operator).length || !deriveOperatorId(operator)) {
    warnings.push("Operator context missing; dataset record is anonymous.");
  }

  if (!safeString(symbol, "")) {
    warnings.push("Symbol missing; UNKNOWN symbol applied.");
  }

  if (!tactical || !Object.keys(tactical).length) {
    warnings.push("Tactical output missing; tactical target set to UNKNOWN_TACTICAL.");
  }

  if (!behavioral || !Object.keys(behavioral).length) {
    warnings.push("Behavioral output missing; behavioral target set to UNKNOWN_BEHAVIORAL.");
  }

  if (!failsafe || !Object.keys(failsafe).length) {
    warnings.push("Failsafe output missing; failsafe target set to UNKNOWN_FAILSAFE.");
  }

  if (!replayIntelligence || !Object.keys(replayIntelligence).length) {
    warnings.push("Replay context missing; operator context may be incomplete.");
  }

  return warnings;
}

export function createAiccDatasetRecord(input = {}) {
  const safeInput = safeObject(input);
  const operator = safeObject(safeInput.operator);
  const commandCenter = safeObject(safeInput.commandCenter);
  const tactical = safeObject(safeInput.tactical);
  const behavioral = safeObject(safeInput.behavioral);
  const failsafe = safeObject(safeInput.failsafe);
  const consensus = safeObject(safeInput.consensus);
  const regime = safeObject(safeInput.regime);
  const narrative = safeObject(safeInput.narrative);
  const journalEntry = safeObject(safeInput.journalEntry);
  const replayIntelligence = safeObject(safeInput.replayIntelligence);
  const datasetStatus = safeObject(safeInput.datasetStatus);
  const trainingQueueStatus = safeObject(safeInput.trainingQueueStatus);
  const pipelineStatus = safeObject(safeInput.pipelineStatus);
  const marketContext = safeObject(safeInput.marketContext);

  const operatorId = deriveOperatorId(operator);
  const operatorEmail = deriveOperatorEmail(operator);
  const symbol = safeString(safeInput.symbol, "UNKNOWN");
  const timestamp = safeString(safeInput.timestamp, "1970-01-01T00:00:00.000Z");

  const learningTargets = {
    tacticalTarget: safeString(
      tactical.tacticalState || tactical.primaryTacticalState,
      "UNKNOWN_TACTICAL"
    ),
    behavioralTarget: safeString(behavioral.behavioralState, "UNKNOWN_BEHAVIORAL"),
    failsafeTarget: safeString(failsafe.failsafeState, "UNKNOWN_FAILSAFE"),
  };

  const intelligenceSnapshot = {
    commandCenter,
    tactical,
    behavioral,
    failsafe,
    consensus,
    regime,
    narrative,
  };

  const operatorContext = {
    journalEntry,
    replayIntelligence,
    datasetStatus,
    trainingQueueStatus,
    pipelineStatus,
  };

  const seed = {
    operatorId,
    operatorEmail,
    symbol,
    timestamp,
    learningTargets,
  };

  return {
    id: safeString(safeInput.id, createDeterministicId(seed)),
    operatorId,
    operatorEmail,
    symbol,
    timestamp,
    intelligenceSnapshot,
    operatorContext,
    marketContext,
    learningTargets,
    metadata: {
      source: "AICC_CLOSED_BETA",
      datasetType: "MULTI_BRAIN_OPERATOR_REVIEW",
      version: "M1",
      persisted: false,
      trainingActivated: false,
    },
    warnings: buildWarnings({
      operator,
      symbol: safeInput.symbol,
      tactical,
      behavioral,
      failsafe,
      replayIntelligence,
    }),
  };
}
