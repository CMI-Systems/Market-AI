function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

const NON_EVIDENCE_STATES = new Set([
  'UNKNOWN',
  'UNKNOWN_SOURCE',
  'UNKNOWN_SESSION',
  'UNAVAILABLE',
  'DATA_UNAVAILABLE',
  'BACKEND_UNAVAILABLE',
  'PROVIDER_OFFLINE',
  'INSUFFICIENT_DATA',
  'INVALID_TIMESTAMP',
  'BLOCKED',
  'SIMULATED',
  'GENERATED',
  'NOT_IMPLEMENTED',
]);

function state(value, fallback = 'unknown') {
  return String(value || fallback).replace(/_/g, ' ').toLowerCase();
}

function normalizeState(value) {
  return String(value || '').trim().toUpperCase();
}

function hasEvidence(value) {
  const normalized = normalizeState(value);
  return Boolean(normalized) && !NON_EVIDENCE_STATES.has(normalized);
}

export function generateOperatorBriefing(input = {}) {
  const evidence = [];
  const warnings = [];
  const symbol = typeof input?.symbol === 'string' && input.symbol.trim() ? input.symbol.trim().toUpperCase() : 'MARKET';
  const consensus = input?.consensus?.consensusState;
  const regime = input?.regime?.regime;
  const riskContext = input?.regime?.riskContext ?? input?.failsafe?.riskEscalation;
  const reliability = input?.failsafe?.reliabilityLabel;
  const failsafeState = input?.failsafe?.failsafeState;
  let score = 30;

  // Briefing gives an operator-readable explanation without action instructions.
  if (hasEvidence(consensus)) {
    score += 15;
    evidence.push(`Briefing includes consensus state ${consensus}.`);
  } else {
    warnings.push('Consensus state is missing from operator briefing.');
  }

  if (hasEvidence(regime)) {
    score += 12;
    evidence.push(`Briefing includes regime ${regime}.`);
  } else {
    warnings.push('Regime state is missing or unavailable for operator briefing.');
  }

  if (hasEvidence(riskContext)) {
    score += 10;
    evidence.push(`Briefing includes risk context ${riskContext}.`);
  } else {
    warnings.push('Risk context is missing from operator briefing.');
  }

  if (String(reliability || '').toUpperCase().includes('LOW')) {
    score -= 12;
    warnings.push('Low reliability requires a cautious briefing tone.');
  }

  if (['BLOCKED', 'DATA_UNAVAILABLE'].includes(normalizeState(failsafeState))) {
    score = Math.min(score, 25);
    warnings.push('Failsafe state blocks or limits the operator briefing.');
  }

  const hasBriefingEvidence = evidence.length > 0;
  const briefing = hasBriefingEvidence
    ? `${symbol} is being assessed with ${state(consensus, 'limited consensus')} across the intelligence stack. Regime context is ${state(regime, 'unavailable')}, risk context is ${state(riskContext, 'unavailable')}, and reliability is ${state(reliability, 'not fully established')}.`
    : `${symbol} does not currently have enough validated internal intelligence to produce a complete operator briefing. Missing or unavailable sections remain limited instead of being inferred.`;
  const spotlightNarrative = hasBriefingEvidence
    ? `Spotlight: ${symbol} requires attention on ${state(riskContext, 'data limitations')} and ${state(regime, 'regime validation')}.`
    : `Spotlight: ${symbol} briefing is limited by unavailable internal intelligence inputs.`;

  return {
    briefing,
    spotlightNarrative,
    score: clampScore(score),
    evidence,
    warnings,
  };
}
