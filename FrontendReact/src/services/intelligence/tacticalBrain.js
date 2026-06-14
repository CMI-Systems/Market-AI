import { analyzeLiquidity } from './liquidityEngine.js';
import { analyzeMomentum } from './momentumEngine.js';
import { analyzeRelativeStrength } from './relativeStrengthEngine.js';
import { analyzeStructure } from './structureEngine.js';
import { analyzeTrend } from './trendEngine.js';
import { analyzeVolatility } from './volatilityEngine.js';
import { mergeProvenance } from './provenanceValidator.js';

const TACTICAL_STATE = {
  BULLISH_EXPANSION: 'BULLISH_EXPANSION',
  BULLISH_BREAKOUT: 'BULLISH_BREAKOUT',
  BULLISH_CONTINUATION: 'BULLISH_CONTINUATION',
  BULLISH_EXHAUSTION: 'BULLISH_EXHAUSTION',
  NEUTRAL_CONSOLIDATION: 'NEUTRAL_CONSOLIDATION',
  NEUTRAL_COMPRESSION: 'NEUTRAL_COMPRESSION',
  NEUTRAL_TRANSITION: 'NEUTRAL_TRANSITION',
  BEARISH_EXPANSION: 'BEARISH_EXPANSION',
  BEARISH_BREAKDOWN: 'BEARISH_BREAKDOWN',
  BEARISH_CONTINUATION: 'BEARISH_CONTINUATION',
  BEARISH_EXHAUSTION: 'BEARISH_EXHAUSTION',
  HIGH_VOLATILITY_TRANSITION: 'HIGH_VOLATILITY_TRANSITION',
  STRUCTURAL_FAILURE: 'STRUCTURAL_FAILURE',
};

const CONFIDENCE_WEIGHTS = {
  trend: 0.25,
  momentum: 0.2,
  structure: 0.2,
  liquidity: 0.15,
  volatility: 0.1,
  relativeStrength: 0.1,
};

function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function getConfidenceLabel(confidence) {
  if (confidence >= 85) return 'VERY_HIGH';
  if (confidence >= 70) return 'HIGH';
  if (confidence >= 55) return 'MODERATE';
  if (confidence >= 40) return 'LOW';
  return 'VERY_LOW';
}

function safeEngineResult(result, defaults) {
  return {
    ...defaults,
    ...result,
    score: clampScore(Number.isFinite(Number(result?.score)) ? Number(result.score) : defaults.score),
    evidence: Array.isArray(result?.evidence) ? result.evidence : defaults.evidence,
  };
}

function runEngine(engine, input, defaults, warnings, name) {
  try {
    return safeEngineResult(engine(input), defaults);
  } catch (error) {
    warnings.push(`${name} failed and returned a safe default.`);
    return defaults;
  }
}

function calculateConfidence(engines) {
  return clampScore(
    engines.trend.score * CONFIDENCE_WEIGHTS.trend
    + engines.momentum.score * CONFIDENCE_WEIGHTS.momentum
    + engines.structure.score * CONFIDENCE_WEIGHTS.structure
    + engines.liquidity.score * CONFIDENCE_WEIGHTS.liquidity
    + engines.volatility.score * CONFIDENCE_WEIGHTS.volatility
    + engines.relativeStrength.score * CONFIDENCE_WEIGHTS.relativeStrength,
  );
}

function flattenEvidence(engines) {
  return [
    ...engines.trend.evidence.map((item) => `Trend: ${item}`),
    ...engines.momentum.evidence.map((item) => `Momentum: ${item}`),
    ...engines.structure.evidence.map((item) => `Structure: ${item}`),
    ...engines.liquidity.evidence.map((item) => `Liquidity: ${item}`),
    ...engines.volatility.evidence.map((item) => `Volatility: ${item}`),
    ...engines.relativeStrength.evidence.map((item) => `Relative strength: ${item}`),
  ];
}

function determineTacticalState(engines) {
  const { trend, momentum, structure, volatility, liquidity, relativeStrength } = engines;

  // First handle risk and disorder states that can override directional clarity.
  if (volatility.volatility === 'EXTREME') {
    return TACTICAL_STATE.HIGH_VOLATILITY_TRANSITION;
  }

  if (structure.structure === 'BREAKDOWN' && liquidity.liquidity === 'WEAK') {
    return TACTICAL_STATE.STRUCTURAL_FAILURE;
  }

  if (trend.trend === 'BULLISH') {
    if (structure.structure === 'BREAKOUT') return TACTICAL_STATE.BULLISH_BREAKOUT;
    if (momentum.momentum === 'EXHAUSTING') return TACTICAL_STATE.BULLISH_EXHAUSTION;
    if (structure.structure === 'EXPANSION' || momentum.momentum === 'ACCELERATING') {
      return TACTICAL_STATE.BULLISH_EXPANSION;
    }
    return TACTICAL_STATE.BULLISH_CONTINUATION;
  }

  if (trend.trend === 'BEARISH') {
    if (structure.structure === 'BREAKDOWN') return TACTICAL_STATE.BEARISH_BREAKDOWN;
    if (momentum.momentum === 'EXHAUSTING') return TACTICAL_STATE.BEARISH_EXHAUSTION;
    if (structure.structure === 'EXPANSION' || momentum.momentum === 'ACCELERATING') {
      return TACTICAL_STATE.BEARISH_EXPANSION;
    }
    return TACTICAL_STATE.BEARISH_CONTINUATION;
  }

  if (structure.structure === 'COMPRESSION' || volatility.volatility === 'COMPRESSED') {
    return TACTICAL_STATE.NEUTRAL_COMPRESSION;
  }

  if (structure.structure === 'RANGE' && relativeStrength.relativeStrength === 'MARKET_PERFORMING') {
    return TACTICAL_STATE.NEUTRAL_CONSOLIDATION;
  }

  return TACTICAL_STATE.NEUTRAL_TRANSITION;
}

function getSafeDefaults() {
  return {
    trend: { trend: 'INSUFFICIENT_DATA', score: 0, evidence: ['Trend unavailable because verified candles are missing.'] },
    momentum: { momentum: 'INSUFFICIENT_DATA', score: 0, evidence: ['Momentum unavailable because verified candles are missing.'] },
    structure: { structure: 'INSUFFICIENT_DATA', score: 0, evidence: ['Structure unavailable because verified candles are missing.'] },
    liquidity: { liquidity: 'INSUFFICIENT_DATA', score: 0, evidence: ['Liquidity unavailable because verified volume data is missing.'] },
    volatility: { volatility: 'INSUFFICIENT_DATA', score: 0, evidence: ['Volatility unavailable because verified candles are missing.'] },
    relativeStrength: {
      relativeStrength: 'INSUFFICIENT_DATA',
      score: 0,
      evidence: ['Relative strength unavailable because benchmark or sector context is missing.'],
    },
  };
}

export function analyzeTacticalState(input = {}) {
  const safeInput = input && typeof input === 'object' ? input : {};
  const candles = Array.isArray(safeInput.candles) ? safeInput.candles : [];
  const warnings = [];
  const defaults = getSafeDefaults();
  const timestamp = new Date().toISOString();
  const symbol = typeof safeInput.symbol === 'string' && safeInput.symbol.trim()
    ? safeInput.symbol.trim().toUpperCase()
    : 'UNKNOWN';

  if (!input || typeof input !== 'object') {
    warnings.push('Input was invalid, so Tactical Brain returned safe defaults.');
  }

  const provenance = mergeProvenance(
    [
      safeInput.quote,
      safeInput.marketContext,
      ...candles.slice(-5),
    ],
    { requireAll: false },
  );

  if (!candles.length) {
    warnings.push('Verified candles are empty or unavailable; Tactical Brain returned an insufficient-data state.');
    const engines = defaults;
    return {
      symbol,
      tacticalState: 'INSUFFICIENT_DATA',
      confidence: 0,
      confidenceLabel: getConfidenceLabel(0),
      trend: engines.trend.trend,
      momentum: engines.momentum.momentum,
      structure: engines.structure.structure,
      liquidity: engines.liquidity.liquidity,
      volatility: engines.volatility.volatility,
      relativeStrength: engines.relativeStrength.relativeStrength,
      available: false,
      sourceType: 'INSUFFICIENT_DATA',
      simulated: false,
      generated: false,
      provenance,
      engines,
      evidence: flattenEvidence(engines),
      warnings: [...new Set([...warnings, ...provenance.warnings, ...provenance.blockingReasons])],
      timestamp,
    };
  }

  if (!provenance.valid || provenance.status === 'BLOCKED' || provenance.status === 'DATA_UNAVAILABLE') {
    warnings.push('Tactical Brain blocked analysis because input provenance is unavailable or untrusted.');
    const engines = defaults;
    return {
      symbol,
      tacticalState: provenance.status === 'BLOCKED' ? 'BLOCKED' : 'INSUFFICIENT_DATA',
      confidence: 0,
      confidenceLabel: getConfidenceLabel(0),
      trend: engines.trend.trend,
      momentum: engines.momentum.momentum,
      structure: engines.structure.structure,
      liquidity: engines.liquidity.liquidity,
      volatility: engines.volatility.volatility,
      relativeStrength: engines.relativeStrength.relativeStrength,
      available: false,
      sourceType: provenance.sourceType,
      provider: provenance.provider,
      simulated: provenance.simulated,
      generated: provenance.generated,
      timestamp: provenance.timestamp || timestamp,
      dataAge: provenance.dataAge,
      sessionState: provenance.sessionState,
      marketOpen: provenance.marketOpen,
      dataState: provenance.dataState,
      rawDataCertified: false,
      trainingEligible: false,
      provenance,
      engines,
      evidence: flattenEvidence(engines),
      warnings: [...new Set([...warnings, ...provenance.warnings, ...provenance.blockingReasons])],
    };
  }

  const engineInput = {
    symbol,
    candles,
    quote: safeInput.quote,
    marketContext: safeInput.marketContext,
    benchmarkCandles: safeInput.benchmarkCandles,
    sectorContext: safeInput.sectorContext,
  };

  const engines = {
    trend: runEngine(analyzeTrend, engineInput, defaults.trend, warnings, 'Trend engine'),
    momentum: runEngine(analyzeMomentum, engineInput, defaults.momentum, warnings, 'Momentum engine'),
    structure: runEngine(analyzeStructure, engineInput, defaults.structure, warnings, 'Structure engine'),
    liquidity: runEngine(analyzeLiquidity, engineInput, defaults.liquidity, warnings, 'Liquidity engine'),
    volatility: runEngine(analyzeVolatility, engineInput, defaults.volatility, warnings, 'Volatility engine'),
    relativeStrength: runEngine(
      analyzeRelativeStrength,
      engineInput,
      defaults.relativeStrength,
      warnings,
      'Relative strength engine',
    ),
  };

  if (!Array.isArray(safeInput.benchmarkCandles) && !safeInput.sectorContext) {
    warnings.push('Benchmark and sector context are missing; relative strength may default to market-performing.');
  }

  const confidence = calculateConfidence(engines);
  const tacticalState = determineTacticalState(engines);

  return {
    symbol,
    tacticalState,
    confidence,
    confidenceLabel: getConfidenceLabel(confidence),
    trend: engines.trend.trend,
    momentum: engines.momentum.momentum,
    structure: engines.structure.structure,
    liquidity: engines.liquidity.liquidity,
    volatility: engines.volatility.volatility,
    relativeStrength: engines.relativeStrength.relativeStrength,
    available: true,
    sourceType: provenance.sourceType,
    provider: provenance.provider,
    simulated: provenance.simulated,
    generated: provenance.generated,
    dataAge: provenance.dataAge,
    sessionState: provenance.sessionState,
    marketOpen: provenance.marketOpen,
    dataState: provenance.dataState,
    rawDataCertified: false,
    trainingEligible: false,
    provenance,
    engines,
    evidence: flattenEvidence(engines),
    warnings: [...new Set([...warnings, ...provenance.warnings])],
    timestamp,
  };
}
