import { analyzeAlignment } from './alignmentEngine.js';
import { analyzeConsensusConfidence } from './consensusConfidenceEngine.js';
import { analyzeConsensusSynthesis } from './consensusSynthesisEngine.js';
import { analyzeConsensusWeighting } from './consensusWeightingEngine.js';

function getSafeFallback(symbol = 'MARKET') {
  const engines = {
    alignment: {
      alignment: 'NO_ALIGNMENT',
      score: 35,
      direction: 'NEUTRAL',
      evidence: ['No intelligence sources are available for alignment.'],
      warnings: ['Consensus input is empty or malformed.'],
    },
    weighting: {
      weighting: { tactical: 0.4, behavioral: 0.35, failsafe: 0.25 },
      score: 45,
      riskModifier: 1,
      evidence: ['Consensus weighting defaulted to base weights.'],
      warnings: ['Consensus weighting used safe defaults.'],
    },
    synthesis: {
      synthesis: 'UNAVAILABLE',
      score: 0,
      evidence: ['Consensus synthesis unavailable because required intelligence sources are unavailable.'],
      warnings: ['Consensus synthesis has insufficient source intelligence.'],
    },
    confidence: {
      confidence: 0,
      confidenceLabel: 'VERY_LOW',
      score: 0,
      evidence: ['Consensus confidence unavailable because source intelligence is missing.'],
      warnings: ['Consensus confidence used safe defaults.'],
    },
  };

  return {
    symbol,
    consensusState: 'UNAVAILABLE',
    confidence: 0,
    confidenceLabel: 'VERY_LOW',
    alignment: engines.alignment.alignment,
    weighting: engines.weighting.weighting,
    synthesis: engines.synthesis.synthesis,
    riskModifier: engines.weighting.riskModifier,
    engines,
    evidence: flattenEvidence(engines),
    warnings: dedupeWarnings(Object.values(engines).flatMap((engine) => engine.warnings)),
    timestamp: new Date().toISOString(),
  };
}

function hasConsensusInput(input) {
  return Boolean(
    input?.tactical && typeof input.tactical === 'object'
    || input?.behavioral && typeof input.behavioral === 'object'
    || input?.failsafe && typeof input.failsafe === 'object'
  );
}

function isUnavailableLayer(layer) {
  return Boolean(
    layer?.available === false
    || layer?.simulated === true
    || layer?.generated === true
    || [
      'DATA_UNAVAILABLE',
      'BACKEND_UNAVAILABLE',
      'PROVIDER_OFFLINE',
      'INSUFFICIENT_DATA',
      'UNKNOWN_SOURCE',
      'INVALID_TIMESTAMP',
      'SIMULATED',
      'GENERATED',
      'BLOCKED',
    ].includes(String(layer?.sourceType || '').toUpperCase())
    || ['UNAVAILABLE', 'INSUFFICIENT_DATA', 'BLOCKED'].includes(String(layer?.tacticalState || '').toUpperCase())
    || ['UNAVAILABLE', 'INSUFFICIENT_DATA', 'BLOCKED'].includes(String(layer?.behavioralState || '').toUpperCase())
    || ['DATA_UNAVAILABLE', 'BLOCKED'].includes(String(layer?.failsafeState || '').toUpperCase())
  );
}

function runEngine(engine, input, fallback, warnings, name) {
  try {
    const result = engine(input);
    warnings.push(...(Array.isArray(result?.warnings) ? result.warnings : []));
    return {
      ...fallback,
      ...result,
      evidence: Array.isArray(result?.evidence) ? result.evidence : fallback.evidence,
      warnings: Array.isArray(result?.warnings) ? result.warnings : fallback.warnings,
    };
  } catch {
    warnings.push(`${name} failed and returned a safe default.`);
    return fallback;
  }
}

function flattenEvidence(engines) {
  return [
    ...engines.alignment.evidence.map((item) => `Alignment: ${item}`),
    ...engines.weighting.evidence.map((item) => `Weighting: ${item}`),
    ...engines.synthesis.evidence.map((item) => `Synthesis: ${item}`),
    ...engines.confidence.evidence.map((item) => `Confidence: ${item}`),
  ];
}

function dedupeWarnings(warnings) {
  return [...new Set(warnings.filter(Boolean))];
}

export function analyzeConsensus(input = {}) {
  const safeInput = input && typeof input === 'object' ? input : {};
  const symbol = typeof safeInput.symbol === 'string' && safeInput.symbol.trim()
    ? safeInput.symbol.trim().toUpperCase()
    : 'MARKET';

  if (
    !input
    || typeof input !== 'object'
    || !hasConsensusInput(safeInput)
    || isUnavailableLayer(safeInput.tactical)
    || isUnavailableLayer(safeInput.behavioral)
  ) {
    return getSafeFallback(symbol);
  }

  const fallback = getSafeFallback(symbol).engines;
  const warnings = [];
  const alignment = runEngine(analyzeAlignment, safeInput, fallback.alignment, warnings, 'Alignment engine');
  const weighting = runEngine(
    analyzeConsensusWeighting,
    safeInput,
    fallback.weighting,
    warnings,
    'Consensus weighting engine',
  );
  const synthesis = runEngine(
    analyzeConsensusSynthesis,
    { ...safeInput, alignment },
    fallback.synthesis,
    warnings,
    'Consensus synthesis engine',
  );
  const confidence = runEngine(
    analyzeConsensusConfidence,
    { alignment, weighting, synthesis },
    fallback.confidence,
    warnings,
    'Consensus confidence engine',
  );
  const engines = {
    alignment,
    weighting,
    synthesis,
    confidence,
  };

  return {
    symbol,
    consensusState: synthesis.synthesis,
    confidence: confidence.confidence,
    confidenceLabel: confidence.confidenceLabel,
    alignment: alignment.alignment,
    weighting: weighting.weighting,
    synthesis: synthesis.synthesis,
    riskModifier: weighting.riskModifier,
    engines,
    evidence: flattenEvidence(engines),
    warnings: dedupeWarnings(warnings),
    timestamp: new Date().toISOString(),
  };
}
