import { analyzeBehavioralState } from './behavioralBrain.js';
import { analyzeConsensus } from './consensusEngine.js';
import { analyzeFailsafeState } from './failsafeBrain.js';
import { analyzeNarrative } from './narrativeEngine.js';
import { analyzeRegime } from './regimeEngine.js';
import { analyzeTacticalState } from './tacticalBrain.js';
import { mergeProvenance } from './provenanceValidator.js';

function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function normalizeConfidence(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return number <= 1 ? number * 100 : number;
}

function safeSymbol(input) {
  return typeof input?.symbol === 'string' && input.symbol.trim()
    ? input.symbol.trim().toUpperCase()
    : 'MARKET';
}

function isUnavailableValue(value) {
  if (!value || typeof value !== 'object') return value === null || value === undefined;
  const sourceType = String(value.sourceType || '').toUpperCase();
  return Boolean(
    value.available === false
    || value.simulated === true
    || value.generated === true
    || [
      'DATA_UNAVAILABLE',
      'BACKEND_UNAVAILABLE',
      'PROVIDER_OFFLINE',
      'UNKNOWN_SOURCE',
      'INVALID_TIMESTAMP',
      'SIMULATED',
      'GENERATED',
      'BLOCKED',
      'INSUFFICIENT_DATA',
    ].includes(sourceType)
  );
}

function hasUsableArray(values) {
  return Array.isArray(values)
    && values.length > 0
    && values.some((item) => !isUnavailableValue(item));
}

function hasUsableObject(value) {
  return Boolean(value && typeof value === 'object' && !isUnavailableValue(value) && Object.keys(value).length);
}

function hasUsableInput(input) {
  return Boolean(
    hasUsableArray(input?.candles)
    || hasUsableObject(input?.quote)
    || hasUsableObject(input?.marketContext)
    || hasUsableArray(input?.benchmarkCandles)
    || hasUsableObject(input?.sectorContext)
    || hasUsableObject(input?.marketPulse)
    || hasUsableObject(input?.marketIntelligence)
    || hasUsableObject(input?.globalScan)
    || hasUsableObject(input?.newsletterData)
    || hasUsableObject(input?.crossAssetData)
    || hasUsableArray(input?.dataStreams)
    || hasUsableArray(input?.history)
  );
}

function runStep(name, fn, payload, warnings) {
  try {
    return fn(payload);
  } catch {
    warnings.push(`${name} failed during orchestration and was rerun with safe fallback input.`);

    try {
      return fn({});
    } catch {
      warnings.push(`${name} fallback also failed; orchestration inserted an empty object for this layer.`);
      return {};
    }
  }
}

function averageAvailableConfidence(layers) {
  const values = [
    normalizeConfidence(layers.tactical?.confidence),
    normalizeConfidence(layers.behavioral?.confidence),
    normalizeConfidence(layers.failsafe?.reliability),
    normalizeConfidence(layers.consensus?.confidence),
    normalizeConfidence(layers.regime?.confidence),
    normalizeConfidence(layers.narrative?.confidence),
  ].filter((value) => value !== null);

  if (!values.length) return 45;

  return clampScore(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function collectWarnings(layers, orchestrationWarnings) {
  return [
    ...orchestrationWarnings,
    ...(Array.isArray(layers.tactical?.warnings) ? layers.tactical.warnings : []),
    ...(Array.isArray(layers.behavioral?.warnings) ? layers.behavioral.warnings : []),
    ...(Array.isArray(layers.failsafe?.warnings) ? layers.failsafe.warnings : []),
    ...(Array.isArray(layers.consensus?.warnings) ? layers.consensus.warnings : []),
    ...(Array.isArray(layers.regime?.warnings) ? layers.regime.warnings : []),
    ...(Array.isArray(layers.narrative?.warnings) ? layers.narrative.warnings : []),
  ].filter(Boolean);
}

function dedupeWarnings(warnings) {
  return [...new Set(warnings)];
}

export function analyzeAiccIntelligence(input = {}) {
  const safeInput = input && typeof input === 'object' ? input : {};
  const warnings = [];
  const symbol = safeSymbol(safeInput);
  const timestamp = new Date().toISOString();
  const fallbackMode = !input || typeof input !== 'object' || !hasUsableInput(safeInput);

  if (fallbackMode) {
    warnings.push('Orchestrator input was empty or malformed; service fallbacks were used.');
  }

  const inputProvenance = mergeProvenance(
    [
      safeInput.quote,
      safeInput.marketContext,
      safeInput.marketPulse,
      safeInput.marketIntelligence,
      safeInput.globalScan,
      safeInput.newsletterData,
      safeInput.crossAssetData,
      ...(Array.isArray(safeInput.candles) ? safeInput.candles.slice(-5) : []),
      ...(Array.isArray(safeInput.dataStreams) ? safeInput.dataStreams : []),
    ],
    { requireAll: false, timestampRequired: false },
  );
  const provenanceBlocked = inputProvenance.status === 'BLOCKED' || inputProvenance.status === 'DATA_UNAVAILABLE';

  if (provenanceBlocked) {
    warnings.push('Orchestrator blocked full intelligence flow because raw input provenance is unavailable or untrusted.');
  }

  const tactical = runStep(
    'Tactical Brain',
    analyzeTacticalState,
    fallbackMode || provenanceBlocked
      ? { symbol }
      : {
          symbol,
          candles: safeInput.candles,
          quote: safeInput.quote,
          marketContext: safeInput.marketContext,
          benchmarkCandles: safeInput.benchmarkCandles,
          sectorContext: safeInput.sectorContext,
        },
    warnings,
  );

  const behavioral = runStep(
    'Behavioral Brain',
    analyzeBehavioralState,
    fallbackMode || provenanceBlocked
      ? { symbol }
      : {
          symbol,
          marketPulse: safeInput.marketPulse,
          marketIntelligence: safeInput.marketIntelligence,
          globalScan: safeInput.globalScan,
          newsletterData: safeInput.newsletterData,
          crossAssetData: safeInput.crossAssetData,
        },
    warnings,
  );

  const failsafe = runStep(
    'Failsafe Brain',
    analyzeFailsafeState,
    fallbackMode || provenanceBlocked
      ? { symbol }
      : {
          symbol,
          tactical,
          behavioral,
          dataStreams: safeInput.dataStreams,
          marketIntelligence: safeInput.marketIntelligence,
          globalScan: safeInput.globalScan,
          newsletterData: safeInput.newsletterData,
          history: safeInput.history,
          provenance: inputProvenance,
        },
    warnings,
  );

  const consensus = runStep(
    'Consensus Engine',
    analyzeConsensus,
    fallbackMode || provenanceBlocked
      ? { symbol }
      : {
          symbol,
          tactical,
          behavioral,
          failsafe,
        },
    warnings,
  );

  const regime = runStep(
    'Regime Engine',
    analyzeRegime,
    fallbackMode || provenanceBlocked
      ? { symbol }
      : {
          symbol,
          tactical,
          behavioral,
          failsafe,
          consensus,
          marketPulse: safeInput.marketPulse,
          globalScan: safeInput.globalScan,
        },
    warnings,
  );

  const narrative = runStep(
    'Narrative Engine',
    analyzeNarrative,
    fallbackMode || provenanceBlocked
      ? { symbol }
      : {
          symbol,
          tactical,
          behavioral,
          failsafe,
          consensus,
          regime,
          newsletterData: safeInput.newsletterData,
          marketIntelligence: safeInput.marketIntelligence,
          globalScan: safeInput.globalScan,
        },
    warnings,
  );

  const layers = {
    tactical,
    behavioral,
    failsafe,
    consensus,
    regime,
    narrative,
  };
  const overallConfidence = averageAvailableConfidence(layers);
  const combinedWarnings = dedupeWarnings(collectWarnings(layers, warnings));

  return {
    symbol,
    tactical,
    behavioral,
    failsafe,
    consensus,
    regime,
    narrative,
    provenance: inputProvenance,
    summary: {
      tacticalState: tactical?.tacticalState,
      behavioralState: behavioral?.behavioralState,
      failsafeState: failsafe?.failsafeState,
      consensusState: consensus?.consensusState,
      regime: regime?.regime,
      narrativeHeadline: narrative?.headline,
      overallConfidence,
      timestamp,
    },
    warnings: combinedWarnings,
    timestamp,
  };
}
