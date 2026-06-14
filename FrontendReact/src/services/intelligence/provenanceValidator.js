const SOURCE_TYPES = new Set([
  'RAW_LIVE',
  'RAW_DELAYED',
  'RAW_CACHED',
  'PARTIAL_DATA',
  'STALE',
  'MARKET_CLOSED',
  'PROVIDER_OFFLINE',
  'BACKEND_UNAVAILABLE',
  'DATA_UNAVAILABLE',
  'UNKNOWN_SOURCE',
  'INVALID_TIMESTAMP',
  'SIMULATED',
  'GENERATED',
  'UNKNOWN',
  'INSUFFICIENT_DATA',
]);

const UNAVAILABLE_TYPES = new Set([
  'PROVIDER_OFFLINE',
  'BACKEND_UNAVAILABLE',
  'DATA_UNAVAILABLE',
  'INSUFFICIENT_DATA',
]);

const BLOCKED_TYPES = new Set([
  'UNKNOWN_SOURCE',
  'INVALID_TIMESTAMP',
  'SIMULATED',
  'GENERATED',
  'UNKNOWN',
]);

const DEGRADED_TYPES = new Set([
  'RAW_DELAYED',
  'RAW_CACHED',
  'PARTIAL_DATA',
  'STALE',
  'MARKET_CLOSED',
]);

const DEFAULT_OPTIONS = {
  maxLiveAgeMs: 15 * 60 * 1000,
  maxDelayedAgeMs: 24 * 60 * 60 * 1000,
  timestampRequired: true,
  requireAll: false,
};

function safeObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeString(value, fallback = '') {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
}

function safeBoolean(value, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null);
}

function normalizeSourceType(value, fallback = 'UNKNOWN_SOURCE') {
  const normalized = safeString(value, fallback).toUpperCase();
  return SOURCE_TYPES.has(normalized) ? normalized : fallback;
}

function getTimestampValue(value) {
  return firstDefined(value.timestamp, value.updatedAt, value.time, value.providerTimestamp, value.asOf);
}

function isValidTimestamp(value) {
  if (!value) return false;
  return Number.isFinite(new Date(value).getTime());
}

function calculateDataAge(timestamp) {
  if (!isValidTimestamp(timestamp)) return null;
  const age = Date.now() - new Date(timestamp).getTime();
  return Number.isFinite(age) && age >= 0 ? age : null;
}

function hasValidLookingMarketValue(value) {
  return ['price', 'last', 'lastPrice', 'close', 'open', 'high', 'low', 'volume'].some((key) => {
    const number = safeNumber(value?.[key]);
    return number !== null && number !== 0;
  });
}

export function normalizeProvenance(input = {}) {
  const value = safeObject(input);
  const warnings = [...safeArray(value.warnings)];
  const simulated = value.simulated === true;
  const generated = value.generated === true;
  const available = value.available === false ? false : safeBoolean(value.available, Object.keys(value).length > 0);
  const rawSourceType = firstDefined(value.sourceType, value.dataState, value.status);
  let sourceType = normalizeSourceType(rawSourceType, available ? 'UNKNOWN_SOURCE' : 'DATA_UNAVAILABLE');

  if (simulated) sourceType = 'SIMULATED';
  if (generated) sourceType = 'GENERATED';
  if (!available && !UNAVAILABLE_TYPES.has(sourceType) && !BLOCKED_TYPES.has(sourceType)) {
    sourceType = 'DATA_UNAVAILABLE';
  }

  const timestamp = getTimestampValue(value) || null;
  const providedAge = safeNumber(firstDefined(value.dataAge, value.ageMs));
  const dataAge = providedAge !== null ? providedAge : calculateDataAge(timestamp);
  const dataAgeProvided = providedAge !== null;
  const rawDataCertifiedInput = value.rawDataCertified === true;
  const trainingEligibleInput = value.trainingEligible === true;

  if (rawDataCertifiedInput) warnings.push('rawDataCertified true is not allowed before O.6 certification.');
  if (trainingEligibleInput) warnings.push('trainingEligible true is not allowed before raw-data certification.');

  return {
    sourceType,
    provider: safeString(value.provider || value.source || value.providerName, 'UNKNOWN'),
    available,
    simulated,
    generated,
    timestamp,
    dataAge,
    dataAgeProvided,
    environment: safeString(value.environment || value.runtimeEnvironment, 'UNKNOWN'),
    sessionState: safeString(value.sessionState, 'UNKNOWN_SESSION').toUpperCase(),
    marketOpen: safeBoolean(value.marketOpen, false),
    dataState: normalizeSourceType(firstDefined(value.dataState, sourceType), sourceType),
    rawDataCertified: false,
    trainingEligible: false,
    rawDataCertifiedInput,
    trainingEligibleInput,
    warnings,
    original: value,
  };
}

export function validateProvenance(input = {}, options = {}) {
  const settings = { ...DEFAULT_OPTIONS, ...safeObject(options) };
  const provenance = normalizeProvenance(input);
  const blockingReasons = [];
  const warnings = [...provenance.warnings];
  let riskLevel = 'LOW';
  let status = 'CONFIRMED';
  let timestampValid = true;
  let freshnessStatus = 'FRESH';
  let sessionStatus = provenance.sessionState === 'UNKNOWN_SESSION' ? 'UNKNOWN_SESSION' : 'KNOWN_SESSION';

  if (!SOURCE_TYPES.has(provenance.sourceType)) {
    blockingReasons.push('Source type is unrecognized.');
    riskLevel = 'CRITICAL';
  }

  if (provenance.simulated) {
    blockingReasons.push('Simulated market data cannot be trusted as raw input.');
    riskLevel = 'CRITICAL';
  }

  if (provenance.generated) {
    blockingReasons.push('Generated market data cannot be trusted as raw input.');
    riskLevel = 'CRITICAL';
  }

  if (provenance.rawDataCertifiedInput) {
    blockingReasons.push('Raw-data certification cannot be asserted before O.6.');
    riskLevel = 'CRITICAL';
  }

  if (provenance.trainingEligibleInput) {
    blockingReasons.push('Training eligibility cannot be asserted before raw-data certification.');
    riskLevel = 'CRITICAL';
  }

  if (provenance.sourceType === 'RAW_LIVE' && (provenance.simulated || provenance.generated)) {
    blockingReasons.push('RAW_LIVE conflicts with simulated/generated provenance.');
    riskLevel = 'CRITICAL';
  }

  if (provenance.available === false) {
    blockingReasons.push('Source is unavailable.');
    riskLevel = riskLevel === 'CRITICAL' ? riskLevel : 'HIGH';
  }

  if (provenance.provider === 'UNKNOWN' && !UNAVAILABLE_TYPES.has(provenance.sourceType)) {
    blockingReasons.push('Provider identity is unknown.');
    riskLevel = riskLevel === 'CRITICAL' ? riskLevel : 'HIGH';
  }

  if (BLOCKED_TYPES.has(provenance.sourceType)) {
    blockingReasons.push(`${provenance.sourceType} cannot be trusted.`);
    riskLevel = riskLevel === 'CRITICAL' ? riskLevel : 'HIGH';
  }

  if (provenance.sourceType === 'RAW_CACHED' && !provenance.dataAgeProvided) {
    blockingReasons.push('RAW_CACHED requires original timestamp and data age.');
    riskLevel = riskLevel === 'CRITICAL' ? riskLevel : 'HIGH';
  }

  const timestampRequiredTypes = new Set(['RAW_LIVE', 'RAW_DELAYED', 'RAW_CACHED', 'PARTIAL_DATA', 'STALE']);
  if (settings.timestampRequired && timestampRequiredTypes.has(provenance.sourceType)) {
    timestampValid = isValidTimestamp(provenance.timestamp);
    if (!timestampValid) {
      blockingReasons.push('Timestamp is missing or invalid.');
      riskLevel = 'CRITICAL';
    }
  }

  if (timestampValid && provenance.dataAge !== null) {
    const maxAge = provenance.sourceType === 'RAW_LIVE' ? settings.maxLiveAgeMs : settings.maxDelayedAgeMs;
    if (['RAW_LIVE', 'RAW_DELAYED', 'PARTIAL_DATA'].includes(provenance.sourceType) && provenance.dataAge > maxAge) {
      freshnessStatus = 'STALE';
      blockingReasons.push('Data age exceeds freshness threshold.');
      riskLevel = riskLevel === 'CRITICAL' ? riskLevel : 'HIGH';
    } else if (provenance.sourceType === 'RAW_CACHED') {
      freshnessStatus = 'CACHED';
    }
  }

  if (provenance.sourceType === 'STALE') {
    freshnessStatus = 'STALE';
    riskLevel = riskLevel === 'CRITICAL' ? riskLevel : 'HIGH';
  }

  if (provenance.sourceType === 'PARTIAL_DATA') {
    warnings.push('Partial data requires limited confidence and disclosure.');
    riskLevel = ['CRITICAL', 'HIGH'].includes(riskLevel) ? riskLevel : 'MODERATE';
  }

  if (DEGRADED_TYPES.has(provenance.sourceType) && blockingReasons.length === 0) {
    status = 'DEGRADED';
    riskLevel = riskLevel === 'LOW' ? 'MODERATE' : riskLevel;
  }

  if (UNAVAILABLE_TYPES.has(provenance.sourceType)) {
    status = 'DATA_UNAVAILABLE';
  }

  if (blockingReasons.length > 0) {
    status = riskLevel === 'CRITICAL' || BLOCKED_TYPES.has(provenance.sourceType) || provenance.sourceType === 'RAW_CACHED'
      ? 'BLOCKED'
      : 'DATA_UNAVAILABLE';
  }

  const valid = blockingReasons.length === 0;
  const trusted = valid
    && provenance.available === true
    && (status === 'CONFIRMED' || provenance.sourceType === 'RAW_DELAYED');

  if (provenance.available === false && hasValidLookingMarketValue(provenance.original)) {
    warnings.push('Unavailable source includes valid-looking market values; provenance must remain blocked.');
    riskLevel = riskLevel === 'CRITICAL' ? riskLevel : 'HIGH';
  }

  return {
    valid,
    trusted,
    status,
    sourceType: provenance.sourceType,
    provider: provenance.provider,
    available: provenance.available,
    simulated: provenance.simulated,
    generated: provenance.generated,
    timestamp: provenance.timestamp,
    dataAge: provenance.dataAge,
    environment: provenance.environment,
    sessionState: provenance.sessionState,
    marketOpen: provenance.marketOpen,
    dataState: provenance.dataState,
    timestampValid,
    freshnessStatus,
    sessionStatus,
    rawDataCertified: false,
    trainingEligible: false,
    riskLevel,
    blockingReasons: [...new Set(blockingReasons)],
    warnings: [...new Set(warnings)],
  };
}

export function mergeProvenance(inputs = [], options = {}) {
  const values = safeArray(inputs).filter((item) => item && typeof item === 'object');
  const settings = { ...DEFAULT_OPTIONS, ...safeObject(options) };

  if (!values.length) {
    return validateProvenance({ available: false, sourceType: 'DATA_UNAVAILABLE' }, settings);
  }

  const results = values.map((item) => validateProvenance(item, settings));
  const critical = results.find((item) => item.riskLevel === 'CRITICAL');
  const blocked = results.find((item) => item.status === 'BLOCKED');
  const trusted = results.filter((item) => item.trusted);
  const degraded = results.find((item) => item.status === 'DEGRADED');
  const unavailable = results.find((item) => item.status === 'DATA_UNAVAILABLE');
  const primary = critical || blocked || trusted[0] || degraded || unavailable || results[0];
  const warnings = results.flatMap((item) => item.warnings);
  const blockingReasons = results.flatMap((item) => item.blockingReasons);

  let status = primary.status;
  let riskLevel = primary.riskLevel;
  let valid = primary.valid;
  let mergedTrusted = trusted.length > 0 && !critical && !blocked;

  if (critical || blocked) {
    status = 'BLOCKED';
    riskLevel = critical ? 'CRITICAL' : 'HIGH';
    valid = false;
    mergedTrusted = false;
  } else if (settings.requireAll && trusted.length !== results.length) {
    status = unavailable ? 'DATA_UNAVAILABLE' : 'DEGRADED';
    riskLevel = unavailable ? 'HIGH' : 'MODERATE';
    valid = false;
    mergedTrusted = false;
  } else if (!trusted.length) {
    status = unavailable ? 'DATA_UNAVAILABLE' : 'DEGRADED';
    riskLevel = unavailable ? 'HIGH' : 'MODERATE';
    valid = !unavailable && !blockingReasons.length;
  }

  return {
    ...primary,
    valid,
    trusted: mergedTrusted,
    status,
    riskLevel,
    rawDataCertified: false,
    trainingEligible: false,
    blockingReasons: [...new Set(blockingReasons)],
    warnings: [...new Set(warnings)],
    components: results,
  };
}

export function getProvenanceRisk(provenance = {}) {
  return validateProvenance(provenance).riskLevel;
}

export function isTrustedRawInput(provenance = {}, options = {}) {
  return validateProvenance(provenance, options).trusted === true;
}
