const POSITIVE_TAGS = ["Patient", "Disciplined", "Risk-Aware"];
const NEGATIVE_TAGS = ["FOMO", "Impulsive", "Rule Break", "Overconfident", "Hesitant"];
const RISK_TAGS = ["Risk-Aware", "Risk Ignored", "Overconfident", "Oversizing", "Rule Break"];
const EXECUTION_TAGS = ["Rule Break", "Disciplined", "Patient"];

function safeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function safeString(value, fallback = "UNKNOWN") {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
}

function safeArray(value) {
  return Array.isArray(value) ? value.filter((item) => item !== null && item !== undefined) : [];
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
  return `replay-behavioral-${hashString(stableStringify(recordSeed))}`;
}

function normalizeBehavioralScore(score) {
  const safeScore = safeObject(score);

  return {
    label: safeString(safeScore.label),
    score: Number.isFinite(Number(safeScore.score)) ? Number(safeScore.score) : 0,
  };
}

function normalizeMistake(mistake) {
  const safeMistake = safeObject(mistake);

  return {
    type: safeString(safeMistake.type),
    frequency: Number.isFinite(Number(safeMistake.frequency)) ? Number(safeMistake.frequency) : 0,
    severity: safeString(safeMistake.severity, "LOW"),
    impact: safeString(safeMistake.impact, "No impact supplied."),
  };
}

function normalizeMissionItem(item) {
  const safeItem = safeObject(item);

  return {
    label: safeString(safeItem.label),
    value: safeString(safeItem.value, "No mission value supplied."),
  };
}

function collectMatchingSignals(tags, allowedTags, prefix) {
  return tags
    .filter((tag) => allowedTags.includes(tag))
    .map((tag) => `${prefix}: ${tag}`);
}

function deriveExecutionSignals(tags, executionReview) {
  const signals = collectMatchingSignals(tags, EXECUTION_TAGS, "Execution tag");
  const review = safeString(executionReview, "");

  if (review) {
    signals.unshift(`Execution review: ${review}`);
  }

  return signals;
}

function buildWarnings({ journalEntry, replayIntelligence, behavioralTags }) {
  const warnings = [];

  if (!journalEntry || !Object.keys(journalEntry).length) {
    warnings.push("Journal context missing; safe defaults applied.");
  }

  if (!replayIntelligence || !Object.keys(replayIntelligence).length) {
    warnings.push("Replay intelligence missing; safe defaults applied.");
  }

  if (!behavioralTags.length) {
    warnings.push("Behavioral tags unavailable; learning signals may be limited.");
  }

  return warnings;
}

export function createBehavioralDatasetRecord(input = {}) {
  const safeInput = safeObject(input);
  const journalEntry = safeObject(safeInput.journalEntry);
  const replayIntelligence = safeObject(safeInput.replayIntelligence);
  const sessionContext = safeObject(safeInput.sessionContext);
  const behavioralTags = safeArray(journalEntry.behavioralTags).map((tag) => safeString(tag));
  const symbol = safeString(safeInput.symbol || journalEntry.symbol, "UNKNOWN");
  const timestamp = safeString(
    safeInput.timestamp || journalEntry.timestamp || sessionContext.timestamp,
    "1970-01-01T00:00:00.000Z"
  );

  const journalContext = {
    tradeAssessment: safeString(journalEntry.tradeAssessment, "UNASSESSED"),
    direction: safeString(journalEntry.direction),
    result: safeString(journalEntry.result),
    thesis: safeString(journalEntry.tradeThesis || journalEntry.thesis, ""),
    executionReview: safeString(journalEntry.executionReview, ""),
    behavioralReflection: safeString(
      journalEntry.behavioralReflection,
      ""
    ),
    behavioralTags,
  };

  const replayContext = {
    strongestTrait: safeString(replayIntelligence.strongestTrait, "UNKNOWN"),
    weakestTrait: safeString(replayIntelligence.weakestTrait, "UNKNOWN"),
    behavioralScores: safeArray(replayIntelligence.behavioralScores).map(normalizeBehavioralScore),
    topMistakes: safeArray(replayIntelligence.topMistakes).map(normalizeMistake),
    missionForNextSession: safeArray(replayIntelligence.missionForNextSession).map(normalizeMissionItem),
  };

  const normalizedSessionContext = {
    sessionVerdict: safeString(sessionContext.sessionVerdict, "UNKNOWN"),
    sessionScore: Number.isFinite(Number(sessionContext.sessionScore))
      ? Number(sessionContext.sessionScore)
      : 0,
    executionGrade: safeString(sessionContext.executionGrade, "UNRATED"),
    behaviorGrade: safeString(sessionContext.behaviorGrade, "UNRATED"),
    disciplineGrade: safeString(sessionContext.disciplineGrade, "UNRATED"),
  };

  const learningSignals = {
    positiveSignals: collectMatchingSignals(behavioralTags, POSITIVE_TAGS, "Positive behavior"),
    negativeSignals: collectMatchingSignals(behavioralTags, NEGATIVE_TAGS, "Negative behavior"),
    riskSignals: collectMatchingSignals(behavioralTags, RISK_TAGS, "Risk behavior"),
    executionSignals: deriveExecutionSignals(behavioralTags, journalContext.executionReview),
  };

  const seed = {
    symbol,
    timestamp,
    journalContext,
    replayContext,
    sessionContext: normalizedSessionContext,
  };

  return {
    id: safeString(safeInput.id, createDeterministicId(seed)),
    symbol,
    timestamp,
    journalContext,
    replayContext,
    sessionContext: normalizedSessionContext,
    learningSignals,
    metadata: {
      source: "REPLAY_CENTER",
      datasetType: "BEHAVIORAL_OPERATOR_REVIEW",
      version: "v1",
      persisted: false,
    },
    warnings: buildWarnings({ journalEntry, replayIntelligence, behavioralTags }),
  };
}
