import { generateDriverExplanation } from './driverExplanationEngine.js';
import { generateIntelligenceSummary } from './intelligenceSummaryEngine.js';
import { generateOperatorBriefing } from './operatorBriefingEngine.js';
import { generateOpportunityContext } from './opportunityContextEngine.js';
import { generateRiskExplanation } from './riskExplanationEngine.js';

const BLOCKED_TERMS = [
  /\bbuy\b/gi,
  /\bsell\b/gi,
  /\benter\b/gi,
  /\bexit\b/gi,
  /\btrade recommendation\b/gi,
];

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

function sanitizeNarrative(text) {
  return BLOCKED_TERMS.reduce(
    (cleaned, pattern) => cleaned.replace(pattern, 'monitor'),
    String(text || ''),
  );
}

function sanitizeArray(values) {
  return Array.isArray(values) ? values.map(sanitizeNarrative) : [];
}

function sanitizeObject(value) {
  if (Array.isArray(value)) return value.map(sanitizeObject);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, sanitizeObject(item)]));
  }
  return typeof value === 'string' ? sanitizeNarrative(value) : value;
}

function containsBlockedTerm(value) {
  return BLOCKED_TERMS.some((pattern) => {
    pattern.lastIndex = 0;
    return pattern.test(String(value || ''));
  });
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0 && !containsBlockedTerm(value);
}

function hasUsableArray(values) {
  return Array.isArray(values) && values.some(hasText);
}

function hasNarrativeInput(input) {
  return Boolean(
    hasText(input?.tactical?.tacticalState)
    || hasText(input?.tactical?.trend)
    || hasText(input?.behavioral?.behavioralState)
    || hasText(input?.behavioral?.participation)
    || hasText(input?.failsafe?.failsafeState)
    || hasText(input?.failsafe?.riskEscalation)
    || hasText(input?.consensus?.consensusState)
    || hasText(input?.regime?.regime)
    || hasText(input?.regime?.riskContext)
    || hasText(input?.newsletterData?.dominantNarrative)
    || hasText(input?.newsletterData?.narrative)
    || hasUsableArray(input?.marketIntelligence?.drivers)
    || hasUsableArray(input?.marketIntelligence?.risks)
    || hasUsableArray(input?.globalScan?.drivers)
    || hasUsableArray(input?.globalScan?.risks)
  );
}

function getFallback(symbol = 'MARKET') {
  const engines = {
    intelligenceSummary: {
      headline: 'AICC Intelligence Limited',
      summary: 'AICC does not currently have enough validated intelligence to generate a complete market assessment.',
      score: 45,
      evidence: ['Narrative input is empty or malformed.'],
      warnings: ['Narrative Engine used safe fallback output.'],
    },
    driverExplanation: {
      keyDrivers: ['Limited validated driver context'],
      explanation: 'AICC does not have enough validated driver context to explain the current environment.',
      score: 45,
      evidence: ['Driver context is unavailable.'],
      warnings: ['Driver explanation used safe fallback output.'],
    },
    riskExplanation: {
      keyRisks: ['Limited validated risk context'],
      explanation: 'AICC does not have enough validated risk context to explain the current environment.',
      score: 45,
      evidence: ['Risk context is unavailable.'],
      warnings: ['Risk explanation used safe fallback output.'],
    },
    opportunityContext: {
      opportunityContext: 'Areas to monitor are not fully validated yet.',
      areasOfStrength: ['no validated area of strength yet'],
      themesToMonitor: ['data validation', 'risk escalation', 'consensus stability'],
      score: 45,
      evidence: ['Opportunity context is unavailable.'],
      warnings: ['Opportunity context used safe fallback output.'],
    },
    operatorBriefing: {
      briefing: 'AICC does not currently have enough validated intelligence to generate a complete operator briefing.',
      spotlightNarrative: 'Spotlight: intelligence validation is limited.',
      score: 45,
      evidence: ['Operator briefing context is unavailable.'],
      warnings: ['Operator briefing used safe fallback output.'],
    },
  };

  return {
    symbol,
    headline: 'AICC Intelligence Limited',
    shortNarrative: 'AICC does not currently have enough validated intelligence to generate a complete market assessment.',
    detailedNarrative: engines.operatorBriefing.briefing,
    riskNarrative: engines.riskExplanation.explanation,
    spotlightNarrative: engines.operatorBriefing.spotlightNarrative,
    confidence: 45,
    confidenceLabel: 'LOW',
    keyDrivers: engines.driverExplanation.keyDrivers,
    keyRisks: engines.riskExplanation.keyRisks,
    opportunityContext: engines.opportunityContext.opportunityContext,
    engines: sanitizeObject(engines),
    evidence: flattenEvidence(engines),
    warnings: dedupeWarnings(Object.values(engines).flatMap((engine) => engine.warnings)),
    timestamp: new Date().toISOString(),
  };
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
    engines.intelligenceSummary.score * 0.25
    + engines.driverExplanation.score * 0.2
    + engines.riskExplanation.score * 0.2
    + engines.opportunityContext.score * 0.15
    + engines.operatorBriefing.score * 0.2,
  );
}

function flattenEvidence(engines) {
  return [
    ...engines.intelligenceSummary.evidence.map((item) => `Summary: ${item}`),
    ...engines.driverExplanation.evidence.map((item) => `Drivers: ${item}`),
    ...engines.riskExplanation.evidence.map((item) => `Risks: ${item}`),
    ...engines.opportunityContext.evidence.map((item) => `Opportunity context: ${item}`),
    ...engines.operatorBriefing.evidence.map((item) => `Operator briefing: ${item}`),
  ];
}

function dedupeWarnings(warnings) {
  return [...new Set(warnings.filter(Boolean))];
}

export function analyzeNarrative(input = {}) {
  const safeInput = input && typeof input === 'object' ? input : {};
  const symbol = typeof safeInput.symbol === 'string' && safeInput.symbol.trim()
    ? safeInput.symbol.trim().toUpperCase()
    : 'MARKET';

  if (!input || typeof input !== 'object' || !hasNarrativeInput(safeInput)) {
    return getFallback(symbol);
  }

  const fallback = getFallback(symbol).engines;
  const warnings = [];
  const intelligenceSummary = runEngine(
    generateIntelligenceSummary,
    safeInput,
    fallback.intelligenceSummary,
    warnings,
    'Intelligence summary engine',
  );
  const driverExplanation = runEngine(
    generateDriverExplanation,
    safeInput,
    fallback.driverExplanation,
    warnings,
    'Driver explanation engine',
  );
  const riskExplanation = runEngine(
    generateRiskExplanation,
    safeInput,
    fallback.riskExplanation,
    warnings,
    'Risk explanation engine',
  );
  const opportunityContext = runEngine(
    generateOpportunityContext,
    safeInput,
    fallback.opportunityContext,
    warnings,
    'Opportunity context engine',
  );
  const operatorBriefing = runEngine(
    generateOperatorBriefing,
    safeInput,
    fallback.operatorBriefing,
    warnings,
    'Operator briefing engine',
  );
  const engines = {
    intelligenceSummary,
    driverExplanation,
    riskExplanation,
    opportunityContext,
    operatorBriefing,
  };
  const confidence = calculateConfidence(engines);

  return {
    symbol,
    headline: sanitizeNarrative(intelligenceSummary.headline),
    shortNarrative: sanitizeNarrative(intelligenceSummary.summary),
    detailedNarrative: sanitizeNarrative(operatorBriefing.briefing),
    riskNarrative: sanitizeNarrative(riskExplanation.explanation),
    spotlightNarrative: sanitizeNarrative(operatorBriefing.spotlightNarrative),
    confidence,
    confidenceLabel: getConfidenceLabel(confidence),
    keyDrivers: sanitizeArray(driverExplanation.keyDrivers),
    keyRisks: sanitizeArray(riskExplanation.keyRisks),
    opportunityContext: sanitizeNarrative(opportunityContext.opportunityContext),
    engines,
    evidence: flattenEvidence(engines).map(sanitizeNarrative),
    warnings: dedupeWarnings(warnings).map(sanitizeNarrative),
    timestamp: new Date().toISOString(),
  };
}
