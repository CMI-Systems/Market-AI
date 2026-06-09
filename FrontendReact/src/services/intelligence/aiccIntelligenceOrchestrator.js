import { analyzeBehavioralState } from './behavioralBrain.js';
import { analyzeConsensus } from './consensusEngine.js';
import { analyzeFailsafeState } from './failsafeBrain.js';
import { analyzeNarrative } from './narrativeEngine.js';
import { analyzeRegime } from './regimeEngine.js';
import { analyzeTacticalState } from './tacticalBrain.js';

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

function hasUsableInput(input) {
  return Boolean(
    Array.isArray(input?.candles)
    || input?.quote
    || input?.marketContext
    || input?.benchmarkCandles
    || input?.sectorContext
    || input?.marketPulse
    || input?.marketIntelligence
    || input?.globalScan
    || input?.newsletterData
    || input?.crossAssetData
    || input?.dataStreams
    || input?.history
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

  const tactical = runStep(
    'Tactical Brain',
    analyzeTacticalState,
    fallbackMode
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
    fallbackMode
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
    fallbackMode
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
        },
    warnings,
  );

  const consensus = runStep(
    'Consensus Engine',
    analyzeConsensus,
    fallbackMode
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
    fallbackMode
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
    fallbackMode
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
