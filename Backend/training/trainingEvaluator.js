/*
 * Checks Shadow Training entries before they reach JSONL datasets.
 * These gates keep raw live observations separate from training-quality claims.
 */

const VALID_CATEGORIES = new Set([
  "momentum",
  "anomaly",
  "risk",
  "behavior",
  "volatility",
  "regime"
]);

const VALID_BIASES = new Set([
  "BULLISH",
  "BEARISH",
  "NEUTRAL",
  "NO_TRADE"
]);

const VALID_QUALITY_LABELS = new Set([
  "unreviewed",
  "useful",
  "noisy",
  "wrong",
  "high_quality"
]);

const APPROVED_PROVIDERS = new Set(["alpaca"]);
const BLOCKED_SOURCE_TYPES = new Set([
  "SIMULATED",
  "GENERATED",
  "MOCK",
  "DEMO",
  "UNKNOWN_SOURCE",
  "DATA_UNAVAILABLE",
  "INVALID_DATA",
  "BLOCKED"
]);

const SYMBOL_REQUIRED_CATEGORIES = new Set([
  "momentum",
  "anomaly",
  "volatility"
]);

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidTimestamp(value) {
  return isNonEmptyString(value) && !Number.isNaN(Date.parse(value));
}

function hasInvalidNumber(value, seen = new WeakSet()) {
  if (typeof value === "number") {
    return !Number.isFinite(value);
  }

  if (!value || typeof value !== "object") {
    return false;
  }

  if (seen.has(value)) {
    return false;
  }

  seen.add(value);

  if (Array.isArray(value)) {
    return value.some(item => hasInvalidNumber(item, seen));
  }

  return Object.values(value).some(item => hasInvalidNumber(item, seen));
}

function isSerializable(value) {
  try {
    JSON.stringify(value);
    return true;
  } catch {
    return false;
  }
}

function getMarketData(entry) {
  return isRecord(entry.inputs) && isRecord(entry.inputs.marketData)
    ? entry.inputs.marketData
    : {};
}

function evaluateTrainingEntry(entry) {
  const errors = [];
  const warnings = [];

  if (!isRecord(entry)) {
    return {
      approved: false,
      evaluationReady: false,
      errors: ["Training entry must be an object."],
      warnings
    };
  }

  if (!isValidTimestamp(entry.timestamp)) {
    errors.push("A valid ISO-compatible timestamp is required.");
  }

  if (!VALID_CATEGORIES.has(entry.category)) {
    errors.push("Category must be a supported Shadow Training dataset.");
  }

  if (!isNonEmptyString(entry.provider)) {
    errors.push("Provider must exist, even when it is unknown.");
  } else if (!APPROVED_PROVIDERS.has(String(entry.provider).toLowerCase())) {
    errors.push("Provider must be an approved locked market-data provider.");
  }

  if (!isNonEmptyString(entry.timeframe)) {
    errors.push("Timeframe must exist, even when it is unknown.");
  }

  if (
    SYMBOL_REQUIRED_CATEGORIES.has(entry.category) &&
    !isNonEmptyString(entry.symbol)
  ) {
    errors.push("Symbol is required for symbol-level training categories.");
  }

  if (!isRecord(entry.inputs)) {
    errors.push("Inputs must be an object.");
  } else {
    ["marketData", "indicators", "brainOutputs", "userContext"].forEach((key) => {
      if (!isRecord(entry.inputs[key])) {
        errors.push(`inputs.${key} must be an object.`);
      }
    });
  }

  if (!isRecord(entry.engineOutput)) {
    errors.push("Engine output must be an object.");
  } else {
    if (!VALID_BIASES.has(entry.engineOutput.bias)) {
      errors.push("Engine output bias must be a supported value.");
    }

    if (
      typeof entry.engineOutput.confidence !== "number" ||
      !Number.isFinite(entry.engineOutput.confidence)
    ) {
      errors.push("Engine output confidence must be a finite number.");
    }

    if (!isNonEmptyString(entry.engineOutput.reason)) {
      errors.push("Engine output reason must explain the observed output.");
    }
  }

  if (!isRecord(entry.outcome) || typeof entry.outcome.known !== "boolean") {
    errors.push("Outcome must include a boolean known flag.");
  }

  if (!isRecord(entry.qualityLabel)) {
    errors.push("Quality label must be an object.");
  } else {
    if (typeof entry.qualityLabel.reviewed !== "boolean") {
      errors.push("Quality label must include a boolean reviewed flag.");
    }

    if (!VALID_QUALITY_LABELS.has(entry.qualityLabel.label)) {
      errors.push("Quality label must use a supported label.");
    }

    if (!entry.qualityLabel.reviewed && entry.qualityLabel.label !== "unreviewed") {
      errors.push("Unreviewed entries cannot claim a training-quality label.");
    }
  }

  if (hasInvalidNumber(entry)) {
    errors.push("Entry contains NaN or infinite numeric data.");
  }

  if (!isSerializable(entry)) {
    errors.push("Entry cannot be safely serialized to JSONL.");
  }

  const marketData = getMarketData(entry);
  const sourceType = String(marketData.sourceType || marketData.dataState || "").toUpperCase();
  if (marketData.simulated === true || marketData.generated === true) {
    errors.push("Simulated or generated market data cannot enter shadow-training readiness.");
  }

  if (BLOCKED_SOURCE_TYPES.has(sourceType)) {
    errors.push("Blocked, unavailable, simulated, generated, or unknown source data cannot enter shadow-training readiness.");
  }

  if (entry.outcome?.known !== true) {
    warnings.push("Outcome is not known yet; keep this as shadow observation data.");
  }

  if (entry.qualityLabel?.reviewed !== true) {
    warnings.push("Entry is unreviewed and is not training-quality data yet.");
  }

  return {
    approved: errors.length === 0,
    evaluationReady: errors.length === 0,
    errors,
    warnings
  };
}

module.exports = {
  VALID_BIASES,
  VALID_CATEGORIES,
  VALID_QUALITY_LABELS,
  evaluateTrainingEntry
};
