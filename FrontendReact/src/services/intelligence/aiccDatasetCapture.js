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

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null);
}

function buildMarketDataValidation(marketDataValidation, marketContext) {
  const validation = safeObject(marketDataValidation);
  const provenance = safeObject(validation.provenance);

  return {
    status: safeString(validation.status || validation.validationStatus, "UNKNOWN"),
    qualityScore: safeNumber(validation.qualityScore, 0),
    qualityLabel: safeString(validation.qualityLabel, "BLOCKED"),
    errors: safeArray(validation.errors || validation.validationErrors),
    warnings: safeArray(validation.warnings || validation.validationWarnings),
    sourceType: safeString(
      validation.sourceType || provenance.sourceType || marketContext.sourceType || marketContext.dataState,
      "UNKNOWN"
    ),
    provider: safeString(validation.provider || provenance.provider || marketContext.provider, "UNKNOWN"),
    timestamp: safeString(
      validation.timestamp || provenance.timestamp || marketContext.timestamp || marketContext.updatedAt,
      ""
    ),
    dataAge: firstDefined(validation.dataAge, provenance.dataAge, marketContext.dataAge, null),
    sessionState: safeString(
      validation.sessionState || provenance.sessionState || marketContext.sessionState,
      "UNKNOWN_SESSION"
    ),
    rawDataCertified: false,
    trainingEligible: false,
  };
}

function buildWarnings({
  operator,
  symbol,
  tactical,
  behavioral,
  failsafe,
  replayIntelligence,
  marketDataValidation,
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

  const validationStatus = safeString(marketDataValidation.status, "UNKNOWN").toUpperCase();
  if (["BLOCKED", "UNAVAILABLE", "INVALID_TIMESTAMP", "INVALID_OHLC", "UNKNOWN_SOURCE"].includes(validationStatus)) {
    warnings.push(`Market data validation status is ${validationStatus}; dataset requires review.`);
  }

  warnings.push(...safeArray(marketDataValidation.warnings));

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
  const marketDataValidation = buildMarketDataValidation(
    safeInput.marketDataValidation || marketContext.marketDataValidation,
    marketContext
  );

  const operatorId = deriveOperatorId(operator);
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
    symbol,
    timestamp,
    learningTargets,
  };

  return {
    id: safeString(safeInput.id, createDeterministicId(seed)),
    operatorId,
    symbol,
    timestamp,
    intelligenceSnapshot,
    operatorContext,
    marketContext,
    marketDataValidation,
    learningTargets,
    metadata: {
      source: "AICC_CLOSED_BETA",
      datasetType: "MULTI_BRAIN_OPERATOR_REVIEW",
      version: "M1",
      persisted: false,
      trainingActivated: false,
      rawDataCertified: false,
      trainingEligible: false,
      marketDataValidationStatus: marketDataValidation.status,
      marketDataQualityScore: marketDataValidation.qualityScore,
      marketDataQualityLabel: marketDataValidation.qualityLabel,
    },
    warnings: buildWarnings({
      operator,
      symbol: safeInput.symbol,
      tactical,
      behavioral,
      failsafe,
      replayIntelligence,
      marketDataValidation,
    }),
  };
}
