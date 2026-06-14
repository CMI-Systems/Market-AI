import { analyzeEnvironmentClassification } from './environmentClassificationEngine.js';
import { analyzeParticipationContext } from './participationContextEngine.js';
import { analyzeRegimeStability } from './regimeStabilityEngine.js';
import { analyzeRiskContext } from './riskContextEngine.js';
import { analyzeVolatilityContext } from './volatilityContextEngine.js';

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

function getFallback(symbol = 'MARKET') {
  const engines = {
    environmentClassification: {
      regime: 'UNKNOWN',
      score: 0,
      evidence: ['Environment classification unavailable because verified raw market inputs are missing.'],
      warnings: ['Regime input is empty or malformed.'],
    },
    volatilityContext: {
      volatilityContext: 'UNKNOWN',
      score: 0,
      evidence: ['Volatility context unavailable because verified volatility inputs are missing.'],
      warnings: ['Volatility inputs are unavailable.'],
    },
    participationContext: {
      participationContext: 'WEAK_CONFIRMATION',
      score: 45,
      evidence: ['Participation context defaulted to weak confirmation.'],
      warnings: ['Participation inputs are unavailable.'],
    },
    riskContext: {
      riskContext: 'RISK_RISING',
      score: 45,
      evidence: ['Risk context defaulted to rising risk.'],
      warnings: ['Risk inputs are unavailable.'],
    },
    regimeStability: {
      stability: 'TRANSITIONING',
      score: 45,
      evidence: ['Regime stability defaulted to transitioning.'],
      warnings: ['Regime history is unavailable.'],
    },
  };

  return {
    symbol,
    regime: 'UNKNOWN',
    confidence: 0,
    confidenceLabel: 'VERY_LOW',
    available: false,
    sourceType: 'DATA_UNAVAILABLE',
    simulated: false,
    generated: false,
    stability: engines.regimeStability.stability,
    volatilityContext: engines.volatilityContext.volatilityContext,
    participationContext: engines.participationContext.participationContext,
    riskContext: engines.riskContext.riskContext,
    engines,
    evidence: flattenEvidence(engines),
    warnings: dedupeWarnings(Object.values(engines).flatMap((engine) => engine.warnings)),
    timestamp: new Date().toISOString(),
  };
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasNumber(value) {
  return Number.isFinite(Number(value));
}

function hasBreadth(value) {
  const breadth = value?.breadth;
  return Boolean(
    breadth
    && typeof breadth === 'object'
    && (
      hasNumber(breadth.percentPositive)
      || hasNumber(breadth.positivePercent)
      || hasNumber(breadth.advancePercent)
      || hasNumber(breadth.advancing)
      || hasNumber(breadth.advancers)
    )
  );
}

function hasHistory(value) {
  return Array.isArray(value?.history)
    && value.history.some((item) => item && typeof item === 'object' && (hasText(item.regime) || hasText(item.state)));
}

function hasRegimeInput(input) {
  return Boolean(
    hasText(input?.tactical?.tacticalState)
    || hasText(input?.tactical?.trend)
    || hasText(input?.tactical?.volatility)
    || hasText(input?.behavioral?.behavioralState)
    || hasText(input?.behavioral?.riskAppetite)
    || hasText(input?.behavioral?.participation)
    || hasText(input?.failsafe?.failsafeState)
    || hasText(input?.failsafe?.riskEscalation)
    || hasText(input?.consensus?.consensusState)
    || hasNumber(input?.marketPulse?.trendScore)
    || hasNumber(input?.marketPulse?.volatility)
    || hasNumber(input?.marketPulse?.volatilityIndex)
    || hasNumber(input?.marketPulse?.riskScore)
    || hasBreadth(input?.marketPulse)
    || hasNumber(input?.globalScan?.trendScore)
    || hasNumber(input?.globalScan?.volatility)
    || hasNumber(input?.globalScan?.volatilityIndex)
    || hasNumber(input?.globalScan?.riskScore)
    || hasBreadth(input?.globalScan)
    || hasHistory(input?.globalScan)
    || hasHistory(input?.marketPulse)
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
    || ['UNAVAILABLE'].includes(String(layer?.consensusState || '').toUpperCase())
  );
}

function hasVerifiedRawContext(input) {
  const marketPulseUnavailable = isUnavailableLayer(input?.marketPulse);
  const globalScanUnavailable = isUnavailableLayer(input?.globalScan);

  return Boolean(
    (!marketPulseUnavailable && (
      hasNumber(input?.marketPulse?.trendScore)
      || hasNumber(input?.marketPulse?.volatility)
      || hasNumber(input?.marketPulse?.volatilityIndex)
      || hasNumber(input?.marketPulse?.riskScore)
      || hasBreadth(input?.marketPulse)
      || hasHistory(input?.marketPulse)
    ))
    || (!globalScanUnavailable && (
      hasNumber(input?.globalScan?.trendScore)
      || hasNumber(input?.globalScan?.volatility)
      || hasNumber(input?.globalScan?.volatilityIndex)
      || hasNumber(input?.globalScan?.riskScore)
      || hasBreadth(input?.globalScan)
      || hasHistory(input?.globalScan)
    ))
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

function calculateConfidence(engines) {
  return clampScore(
    engines.environmentClassification.score * 0.3
    + engines.volatilityContext.score * 0.15
    + engines.participationContext.score * 0.2
    + engines.riskContext.score * 0.2
    + engines.regimeStability.score * 0.15,
  );
}

function flattenEvidence(engines) {
  return [
    ...engines.environmentClassification.evidence.map((item) => `Environment: ${item}`),
    ...engines.volatilityContext.evidence.map((item) => `Volatility: ${item}`),
    ...engines.participationContext.evidence.map((item) => `Participation: ${item}`),
    ...engines.riskContext.evidence.map((item) => `Risk: ${item}`),
    ...engines.regimeStability.evidence.map((item) => `Stability: ${item}`),
  ];
}

function dedupeWarnings(warnings) {
  return [...new Set(warnings.filter(Boolean))];
}

export function analyzeRegime(input = {}) {
  const safeInput = input && typeof input === 'object' ? input : {};
  const symbol = typeof safeInput.symbol === 'string' && safeInput.symbol.trim()
    ? safeInput.symbol.trim().toUpperCase()
    : 'MARKET';

  if (
    !input
    || typeof input !== 'object'
    || !hasRegimeInput(safeInput)
    || !hasVerifiedRawContext(safeInput)
    || isUnavailableLayer(safeInput.tactical)
    || isUnavailableLayer(safeInput.behavioral)
    || isUnavailableLayer(safeInput.consensus)
  ) {
    return getFallback(symbol);
  }

  const fallback = getFallback(symbol).engines;
  const warnings = [];
  const environmentClassification = runEngine(
    analyzeEnvironmentClassification,
    safeInput,
    fallback.environmentClassification,
    warnings,
    'Environment classification engine',
  );
  const volatilityContext = runEngine(
    analyzeVolatilityContext,
    safeInput,
    fallback.volatilityContext,
    warnings,
    'Volatility context engine',
  );
  const participationContext = runEngine(
    analyzeParticipationContext,
    safeInput,
    fallback.participationContext,
    warnings,
    'Participation context engine',
  );
  const riskContext = runEngine(
    analyzeRiskContext,
    safeInput,
    fallback.riskContext,
    warnings,
    'Risk context engine',
  );
  const regimeStability = runEngine(
    analyzeRegimeStability,
    safeInput,
    fallback.regimeStability,
    warnings,
    'Regime stability engine',
  );
  const engines = {
    environmentClassification,
    volatilityContext,
    participationContext,
    riskContext,
    regimeStability,
  };
  const confidence = calculateConfidence(engines);

  return {
    symbol,
    regime: environmentClassification.regime,
    confidence,
    confidenceLabel: getConfidenceLabel(confidence),
    stability: regimeStability.stability,
    volatilityContext: volatilityContext.volatilityContext,
    participationContext: participationContext.participationContext,
    riskContext: riskContext.riskContext,
    engines,
    evidence: flattenEvidence(engines),
    warnings: dedupeWarnings(warnings),
    timestamp: new Date().toISOString(),
  };
}
