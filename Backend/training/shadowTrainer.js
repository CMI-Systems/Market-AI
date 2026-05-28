/*
 * Orchestrates silent Shadow Training observations.
 * It creates provider-independent entries, evaluates them, and logs only
 * evaluation-ready records without changing live Market AI decisions.
 */

const { appendTrainingEntry } = require("./trainingLogger");
const { evaluateTrainingEntry } = require("./trainingEvaluator");

const VALID_PROVIDERS = new Set(["webull", "alpaca", "unknown"]);
const VALID_TIMEFRAMES = new Set(["1m", "5m", "1h", "daily", "unknown"]);
const VALID_BIASES = new Set(["BULLISH", "BEARISH", "NEUTRAL", "NO_TRADE"]);

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeProvider(provider) {
  return VALID_PROVIDERS.has(provider) ? provider : "unknown";
}

function normalizeTimeframe(timeframe) {
  return VALID_TIMEFRAMES.has(timeframe) ? timeframe : "unknown";
}

function normalizeConfidence(confidence) {
  return typeof confidence === "number" && Number.isFinite(confidence)
    ? confidence
    : 0;
}

function buildEngineOutput(event) {
  const engineOutput = asObject(event.engineOutput);
  const bias = VALID_BIASES.has(engineOutput.bias)
    ? engineOutput.bias
    : "NO_TRADE";

  return {
    bias,
    confidence: normalizeConfidence(engineOutput.confidence),
    reason:
      typeof engineOutput.reason === "string" && engineOutput.reason.trim()
        ? engineOutput.reason
        : "Shadow observation recorded without a production recommendation."
  };
}

function createShadowEntry(normalizedEvent, brainOutputs = {}) {
  const event = asObject(normalizedEvent);
  const outcome = asObject(event.outcome);

  return {
    timestamp:
      typeof event.timestamp === "string" && event.timestamp.trim()
        ? event.timestamp
        : new Date().toISOString(),
    category: event.category,
    provider: normalizeProvider(event.provider),
    symbol: typeof event.symbol === "string" ? event.symbol.toUpperCase() : "",
    timeframe: normalizeTimeframe(event.timeframe),
    inputs: {
      marketData: asObject(event.marketData),
      indicators: asObject(event.indicators),
      brainOutputs: {
        ...asObject(event.brainOutputs),
        ...asObject(brainOutputs)
      },
      userContext: asObject(event.userContext)
    },
    engineOutput: buildEngineOutput(event),
    outcome: {
      known: outcome.known === true,
      result: outcome.known === true ? outcome.result ?? null : null,
      notes: typeof outcome.notes === "string" ? outcome.notes : ""
    },
    qualityLabel: {
      reviewed: false,
      label: "unreviewed",
      reviewerNotes: ""
    }
  };
}

function observeShadowEvent(normalizedEvent, brainOutputs = {}) {
  const entry = createShadowEntry(normalizedEvent, brainOutputs);
  const evaluation = evaluateTrainingEntry(entry);

  if (!evaluation.approved) {
    return {
      observed: true,
      logged: false,
      entry,
      evaluation
    };
  }

  const logResult = appendTrainingEntry(entry);

  return {
    observed: true,
    logged: true,
    entry,
    evaluation,
    logResult
  };
}

module.exports = {
  createShadowEntry,
  observeShadowEvent
};
